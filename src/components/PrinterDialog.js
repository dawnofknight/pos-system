"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui";
import { Button, Input } from "@/components/ui";
import { nativeDiscoverBluetooth } from "@/lib/printer";
import { isDesktop } from "@/lib/platform";
import toast from "react-hot-toast";
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
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Select Bluetooth Device
            </label>
            <select
              value={selectedBluetoothDevice ? selectedBluetoothDevice.id : ""}
              onChange={(e) => {
                const device = bluetoothDevices.find((d) => d.id === e.target.value);
                setSelectedBluetoothDevice(device);
                onSelectPrinter({ type: "bluetooth", device });
              }}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
            >
              <option value="">Select a Bluetooth device</option>
              {bluetoothDevices.map((device) => (
                <option
                  key={device.id}
                  value={device.id}
                >
                  {device.name || `ID: ${device.id}`}
                </option>
              ))}
            </select>
          </div>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Printer"
    >
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Printer Type
          </label>
          <select
            value={printerType}
            onChange={(e) => setPrinterType(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
          >
            <option value='system'>System Print</option>
            <option value='bluetooth'>Bluetooth Printer</option>
            <option value='network'>Network/IP Printer</option>
          </select>
        </div>

        {error && <p className='text-sm text-red-500'>{error}</p>}

        {printerType === "system" && (
          <p className='text-sm text-gray-500'>
            Uses the device's native print dialog. Recommended for most
            printers.
          </p>
        )}
        {printerType === "bluetooth" && renderBluetoothSelector()}
        {printerType === "network" && renderNetworkSelector()}
        
        <div className='flex justify-end gap-2 mt-6'>
          <Button
            variant='outline'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handlePrint}>Print</Button>
        </div>
      </div>
    </Modal>
  );
};

PrinterDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPrint: PropTypes.func,
  onSelectPrinter: PropTypes.func,
};

export default PrinterDialog;
