"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { nativeDiscoverBluetooth } from "@/lib/printer";
import { isDesktop } from "@/lib/platform"; // Import platform detection
import PropTypes from "prop-types";

const PrinterDialog = ({ isOpen, onClose, onPrint, onSelectPrinter }) => {
  const [printerType, setPrinterType] = useState("system");
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const [selectedBluetoothDevice, setSelectedBluetoothDevice] = useState(null);
  const [networkIp, setNetworkIp] = useState("");
  const [error, setError] = useState("");
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);
  const [isDesktopBrowser, setIsDesktopBrowser] = useState(false); // New state

  useEffect(() => {
    setIsDesktopBrowser(isDesktop()); // Set platform state
  }, []);

  useEffect(() => {
    if (printerType === "bluetooth") {
      // Check if Capacitor native platform (Android) or Web Bluetooth is available
      const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
      const hasWebBluetooth = navigator.bluetooth;
      
      if (!isNative && !hasWebBluetooth) {
        setIsBluetoothSupported(false);
        setError(
          "Bluetooth printing requires either a native Android app or a browser with Web Bluetooth API support."
        );
      } else {
        setIsBluetoothSupported(true);
        setError("");
      }
    }
  }, [printerType]);

  const handlePrint = () => {
    if (printerType === "system") {
      if (isDesktopBrowser) {
        window.print();
      } else {
        toast.info(
          "System printing is not available on mobile browsers. Consider saving as PDF."
        );
      }
      onClose();
    } else if (onPrint) {
      onPrint(printerType, {
        device: selectedBluetoothDevice,
        ip: networkIp,
      });
    }
  };

  const handleScanBluetooth = useCallback(async () => {
    // Use native Capacitor plugin for Bluetooth on Android
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        setIsScanning(true);
        const result = await nativeDiscoverBluetooth();
        const list = (result?.devices || []).map((d) => ({
          id: d.address,
          name: d.name,
          address: d.address,
        }));
        setBluetoothDevices(list);
        if (list.length > 0) {
          setSelectedBluetoothDevice(list[0]);
          onSelectPrinter({ type: "bluetooth", device: list[0] });
          toast.success(`Found ${list.length} paired Bluetooth printer(s)`);
        } else {
          toast.info("No paired Bluetooth printers found. Please pair your printer in Android Settings first.");
        }
      } catch (err) {
        console.error("Native Bluetooth scan error:", err);
        setError(`Error scanning for Bluetooth devices: ${err.message}`);
        toast.error("Bluetooth scanning failed. Make sure Bluetooth is enabled.");
      } finally {
        setIsScanning(false);
      }
      return;
    }

    // Fallback to Web Bluetooth API for desktop browsers
    if (!navigator.bluetooth) {
      setError(
        "Web Bluetooth API is not supported in this browser. Please use Chrome or the native Android app."
      );
      toast.error("Web Bluetooth not supported.");
      return;
    }

    setIsScanning(true);
    setError("");
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"], // Generic Attribute Service
      });
      const deviceObj = {
        id: device.id,
        name: device.name || device.id,
        address: device.id,
      };
      setBluetoothDevices([deviceObj]);
      setSelectedBluetoothDevice(deviceObj);
      onSelectPrinter({ type: "bluetooth", device: deviceObj });
      toast.success(`Connected to ${device.name || `ID: ${device.id}`}`);
    } catch (err) {
      console.error("Bluetooth scan error:", err);
      if (err.name === "NotFoundError") {
        setError("No Bluetooth device selected.");
        toast.info("No device selected.");
      } else {
        setError(`Error scanning for Bluetooth devices: ${err.message}`);
        toast.error("Bluetooth scanning failed.");
      }
    } finally {
      setIsScanning(false);
    }
  }, [onSelectPrinter]);

  const handleAddNetworkPrinter = () => {
    if (!networkIp) {
      setError("Please enter a printer IP address.");
      toast.error("IP address cannot be empty.");
      return;
    }
    onSelectPrinter({ type: "network", address: networkIp });
    toast.success(`Added network printer at ${networkIp}`);
    onClose();
  };

  const renderBluetoothSelector = () => {
    if (!isBluetoothSupported) {
      return <p className='text-sm text-red-500'>{error}</p>;
    }
    return (
      <div className='space-y-4'>
        <Button
          onClick={handleScanBluetooth}
          disabled={isScanning}
          className='w-full'
        >
          {isScanning ? "Scanning..." : "Scan for Bluetooth Printers"}
        </Button>
        {bluetoothDevices.length > 0 && (
          <Select
            onValueChange={(value) => {
              const device = bluetoothDevices.find((d) => d.id === value);
              setSelectedBluetoothDevice(device);
              onSelectPrinter({ type: "bluetooth", device });
            }}
            defaultValue={
              selectedBluetoothDevice ? selectedBluetoothDevice.id : ""
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a Bluetooth device' />
            </SelectTrigger>
            <SelectContent>
              {bluetoothDevices.map((device) => (
                <SelectItem
                  key={device.id}
                  value={device.id}
                >
                  {device.name || `ID: ${device.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  const renderNetworkSelector = () => (
    <div className='space-y-2'>
      <Label htmlFor='network-ip'>Printer IP Address</Label>
      <div className='flex items-center gap-2'>
        <Input
          id='network-ip'
          type='text'
          placeholder='e.g., 192.168.1.50'
          value={networkIp}
          onChange={(e) => setNetworkIp(e.target.value)}
        />
        <Button onClick={handleAddNetworkPrinter}>Add</Button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Printer</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <Select
            onValueChange={setPrinterType}
            defaultValue={printerType}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select printer type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='system'>System Print</SelectItem>
              <SelectItem value='bluetooth'>
                Bluetooth Printer
              </SelectItem>
              <SelectItem value='network'>Network/IP Printer</SelectItem>
            </SelectContent>
          </Select>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          {printerType === "system" && (
            <p className='text-sm text-gray-500'>
              Uses the device’s native print dialog. Recommended for most
              printers.
            </p>
          )}
          {printerType === "bluetooth" && renderBluetoothSelector()}
          {printerType === "network" && renderNetworkSelector()}
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handlePrint}>Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

PrinterDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPrint: PropTypes.func,
  onSelectPrinter: PropTypes.func,
};

export default PrinterDialog;
