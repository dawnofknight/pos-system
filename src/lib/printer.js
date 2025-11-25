import { registerPlugin } from '@capacitor/core';

export const Printer = registerPlugin('Printer', {
  web: () => import('./printer.web').then(m => new m.PrinterWeb()),
});

export async function discoverBluetooth() {
  return Printer.discoverBluetooth();
}

// Alias for compatibility with existing code
export async function nativeDiscoverBluetooth() {
  return discoverBluetooth();
}

export async function discoverUSB() {
  return Printer.discoverUSB();
}

export async function discoverNetwork() {
  return Printer.discoverNetwork();
}

export async function printESCPos(host, dataBase64, port = 9100) {
  return Printer.printESCPos({ host, port, data: dataBase64 });
}

export async function printZPL(host, zpl, port = 9100) {
  return Printer.printZPL({ host, port, zpl });
}

export async function getStatus() {
  return Printer.getStatus();
}

/**
 * Print receipt via Bluetooth to thermal printer
 * @param {string} deviceAddress - MAC address of the Bluetooth printer
 * @param {string} receiptData - Base64 encoded ESC/POS receipt data
 * @returns {Promise} - Resolves when print is complete
 */
export async function printViaBluetooth(deviceAddress, receiptData) {
  return Printer.printViaBluetooth({ deviceAddress, receiptData });
}

