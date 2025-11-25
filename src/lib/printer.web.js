export class PrinterWeb {
  async discoverBluetooth() {
    return { devices: [] };
  }
  async discoverUSB() {
    return { devices: [] };
  }
  async discoverNetwork() {
    return { connected: true };
  }
  async printESCPos() {
    throw new Error('ESC/POS printing not supported on web');
  }
  async printZPL() {
    throw new Error('ZPL printing not supported on web');
  }
  async getStatus() {
    return { queueSize: 0, lastError: '' };
  }
}

