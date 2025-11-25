package com.pos.system.printer;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {

    private final PrinterJobManager jobManager = new PrinterJobManager();

    @PluginMethod
    public void discoverBluetooth(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        List<JSObject> devices = new ArrayList<>();
        if (adapter != null) {
            for (BluetoothDevice d : adapter.getBondedDevices()) {
                JSObject obj = new JSObject();
                obj.put("name", d.getName());
                obj.put("address", d.getAddress());
                devices.add(obj);
            }
        }
        JSObject ret = new JSObject();
        ret.put("devices", devices);
        call.resolve(ret);
    }

    @PluginMethod
    public void discoverUSB(PluginCall call) {
        UsbManager manager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        Map<String, UsbDevice> deviceList = manager.getDeviceList();
        List<JSObject> devices = new ArrayList<>();
        for (UsbDevice d : deviceList.values()) {
            JSObject obj = new JSObject();
            obj.put("name", d.getProductName());
            obj.put("vendorId", d.getVendorId());
            obj.put("productId", d.getProductId());
            devices.add(obj);
        }
        JSObject ret = new JSObject();
        ret.put("devices", devices);
        call.resolve(ret);
    }

    @PluginMethod
    public void discoverNetwork(PluginCall call) {
        // Placeholder: network discovery is complex; return connectivity state for now
        ConnectivityManager cm = (ConnectivityManager) getContext().getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkCapabilities caps = cm.getNetworkCapabilities(cm.getActiveNetwork());
        boolean hasNet = caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) || caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET));
        JSObject ret = new JSObject();
        ret.put("connected", hasNet);
        call.resolve(ret);
    }

    @PluginMethod
    public void printESCPos(PluginCall call) {
        String host = call.getString("host", "");
        int port = call.getInt("port", 9100);
        String dataBase64 = call.getString("data", "");
        try {
            byte[] bytes = Base64.decode(dataBase64, Base64.DEFAULT);
            sendRaw(host, port, bytes);
            call.resolve();
        } catch (Exception e) {
            call.reject("ESC/POS print failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printZPL(PluginCall call) {
        String host = call.getString("host", "");
        int port = call.getInt("port", 9100);
        String zpl = call.getString("zpl", "");
        try {
            sendRaw(host, port, zpl.getBytes());
            call.resolve();
        } catch (Exception e) {
            call.reject("ZPL print failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printPDF(PluginCall call) {
        // Expects an Android content URI or file path to a PDF handled by a PrintDocumentAdapter
        String jobName = call.getString("jobName", "PDF Document");
        try {
            PrintManager printManager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
            PrintAttributes attrs = new PrintAttributes.Builder().build();
            // The app should provide a PrintDocumentAdapter via WebView or native; stub here
            call.reject("PDF printing requires a PrintDocumentAdapter; integrate from WebView.");
        } catch (Exception e) {
            call.reject("PDF print failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("queueSize", 0);
        ret.put("lastError", "");
        call.resolve(ret);
    }

    @PluginMethod
    public void printViaBluetooth(PluginCall call) {
        String deviceAddress = call.getString("deviceAddress", "");
        String receiptData = call.getString("receiptData", "");
        
        if (deviceAddress.isEmpty()) {
            call.reject("Device address is required");
            return;
        }
        
        if (receiptData.isEmpty()) {
            call.reject("Receipt data is required");
            return;
        }

        BluetoothPrinterHelper printer = new BluetoothPrinterHelper();
        
        try {
            Log.d("PrinterPlugin", "Connecting to Bluetooth printer: " + deviceAddress);
            
            // Connect to printer
            boolean connected = printer.connect(deviceAddress);
            if (!connected) {
                call.reject("Failed to connect to printer");
                return;
            }
            
            Log.d("PrinterPlugin", "Connected successfully, printing receipt...");
            
            // Decode Base64 receipt data and print
            byte[] bytes = Base64.decode(receiptData, Base64.DEFAULT);
            printer.printBytes(bytes);
            
            // Feed paper and cut (optional)
            printer.feedPaper(3);
            
            // Some printers support paper cutting
            try {
                printer.cutPaper();
            } catch (Exception e) {
                // Ignore if printer doesn't support cutting
                Log.d("PrinterPlugin", "Paper cut not supported or failed: " + e.getMessage());
            }
            
            Log.d("PrinterPlugin", "Print successful");
            
            // Disconnect
            printer.disconnect();
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Receipt printed successfully");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e("PrinterPlugin", "Bluetooth print failed: " + e.getMessage(), e);
            printer.disconnect();
            call.reject("Bluetooth print failed: " + e.getMessage());
        }
    }

    private void sendRaw(String host, int port, byte[] data) throws Exception {

        Socket socket = new Socket();
        socket.connect(new InetSocketAddress(host, port), 5000);
        OutputStream os = socket.getOutputStream();
        os.write(data);
        os.flush();
        os.close();
        socket.close();
    }
}

