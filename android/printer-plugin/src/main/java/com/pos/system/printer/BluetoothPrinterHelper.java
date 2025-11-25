package com.pos.system.printer;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.util.Log;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Helper class for Bluetooth thermal printer communication
 * Supports ESC/POS commands for 58mm thermal printers like RPP02N
 */
public class BluetoothPrinterHelper {
    private static final String TAG = "BluetoothPrinterHelper";
    
    // Standard Bluetooth SPP UUID for serial communication
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
    
    // ESC/POS Commands
    private static final byte ESC = 0x1B;
    private static final byte GS = 0x1D;
    private static final byte LF = 0x0A;
    private static final byte[] INIT = {ESC, '@'};
    private static final byte[] ALIGN_LEFT = {ESC, 'a', 0};
    private static final byte[] ALIGN_CENTER = {ESC, 'a', 1};
    private static final byte[] ALIGN_RIGHT = {ESC, 'a', 2};
    private static final byte[] BOLD_ON = {ESC, 'E', 1};
    private static final byte[] BOLD_OFF = {ESC, 'E', 0};
    private static final byte[] FONT_NORMAL = {ESC, '!', 0};
    private static final byte[] FONT_LARGE = {ESC, '!', 0x30};
    private static final byte[] CUT_PAPER = {GS, 'V', 66, 0};
    
    private BluetoothSocket socket;
    private OutputStream outputStream;

    /**
     * Connect to a Bluetooth printer by MAC address
     * @param deviceAddress MAC address of the printer (e.g., "00:11:22:33:44:55")
     * @return true if connection successful
     */
    public boolean connect(String deviceAddress) throws IOException {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            throw new IOException("Bluetooth is not available or not enabled");
        }

        BluetoothDevice device = adapter.getRemoteDevice(deviceAddress);
        if (device == null) {
            throw new IOException("Device not found: " + deviceAddress);
        }

        try {
            // Cancel discovery to speed up connection
            if (adapter.isDiscovering()) {
                adapter.cancelDiscovery();
            }

            // Create RFCOMM socket
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            
            // Connect with timeout
            socket.connect();
            
            // Get output stream
            outputStream = socket.getOutputStream();
            
            // Initialize printer
            outputStream.write(INIT);
            outputStream.flush();
            
            Log.d(TAG, "Connected to printer: " + deviceAddress);
            return true;
            
        } catch (IOException e) {
            Log.e(TAG, "Connection failed: " + e.getMessage());
            disconnect();
            throw e;
        }
    }

    /**
     * Disconnect from the printer
     */
    public void disconnect() {
        try {
            if (outputStream != null) {
                outputStream.close();
                outputStream = null;
            }
            if (socket != null) {
                socket.close();
                socket = null;
            }
            Log.d(TAG, "Disconnected from printer");
        } catch (IOException e) {
            Log.e(TAG, "Error disconnecting: " + e.getMessage());
        }
    }

    /**
     * Check if currently connected to a printer
     */
    public boolean isConnected() {
        return socket != null && socket.isConnected();
    }

    /**
     * Print raw bytes to the printer
     */
    public void printBytes(byte[] data) throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(data);
        outputStream.flush();
    }

    /**
     * Print text with specified alignment
     */
    public void printText(String text, int alignment) throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }

        // Set alignment
        switch (alignment) {
            case 0:
                outputStream.write(ALIGN_LEFT);
                break;
            case 1:
                outputStream.write(ALIGN_CENTER);
                break;
            case 2:
                outputStream.write(ALIGN_RIGHT);
                break;
        }

        // Print text
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.write(LF);
        outputStream.flush();
    }

    /**
     * Print text line with normal font
     */
    public void printLine(String text) throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(FONT_NORMAL);
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.write(LF);
        outputStream.flush();
    }

    /**
     * Print text line with bold font
     */
    public void printBoldLine(String text) throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(BOLD_ON);
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.write(BOLD_OFF);
        outputStream.write(LF);
        outputStream.flush();
    }

    /**
     * Print text line with large font
     */
    public void printLargeLine(String text) throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(FONT_LARGE);
        outputStream.write(text.getBytes(StandardCharsets.UTF_8));
        outputStream.write(FONT_NORMAL);
        outputStream.write(LF);
        outputStream.flush();
    }

    /**
     * Print a separator line (dashed line for 58mm paper, ~32 characters)
     */
    public void printSeparator() throws IOException {
        printLine("--------------------------------");
    }

    /**
     * Feed paper (blank lines)
     */
    public void feedPaper(int lines) throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        for (int i = 0; i < lines; i++) {
            outputStream.write(LF);
        }
        outputStream.flush();
    }

    /**
     * Cut paper (if printer supports it)
     */
    public void cutPaper() throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(CUT_PAPER);
        outputStream.flush();
    }

    /**
     * Align text to center
     */
    public void alignCenter() throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(ALIGN_CENTER);
        outputStream.flush();
    }

    /**
     * Align text to left
     */
    public void alignLeft() throws IOException {
        if (!isConnected()) {
            throw new IOException("Not connected to printer");
        }
        outputStream.write(ALIGN_LEFT);
        outputStream.flush();
    }

    /**
     * Format a line with left and right aligned text (for receipts)
     * Example: "Item Name              $10.00"
     */
    public String formatReceiptLine(String left, String right, int totalWidth) {
        int spaces = totalWidth - left.length() - right.length();
        if (spaces < 1) spaces = 1;
        
        StringBuilder line = new StringBuilder(left);
        for (int i = 0; i < spaces; i++) {
            line.append(' ');
        }
        line.append(right);
        
        return line.toString();
    }
}
