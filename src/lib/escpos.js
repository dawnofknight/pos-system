/**
 * ESC/POS Command Generator for Thermal Printers (58mm)
 * Generates ESC/POS commands for receipt printing
 */

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

const Commands = {
  INIT: [ESC, 0x40],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  FONT_NORMAL: [ESC, 0x21, 0x00],
  FONT_LARGE: [ESC, 0x21, 0x30],
  FONT_SMALL: [ESC, 0x21, 0x01],
  CUT_PAPER: [GS, 0x56, 0x42, 0x00],
  FEED_PAPER: [ESC, 0x64, 0x03], // Feed 3 lines
};

/**
 * Convert string to byte array
 */
function stringToBytes(str) {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

/**
 * Create ESC/POS receipt data for thermal printer
 */
export function generateESCPOSReceipt(sale, settings = {}) {
  const bytes = [];
  
  // Initialize printer
  bytes.push(...Commands.INIT);
  
  const appName = settings.appName || "POS SYSTEM";
  const currencySymbol = settings.currencySymbol || "Rp";
  
  // Header - Center aligned
  bytes.push(...Commands.ALIGN_CENTER);
  bytes.push(...Commands.FONT_LARGE);
  bytes.push(...Commands.BOLD_ON);
  bytes.push(...stringToBytes(appName));
  bytes.push(LF);
  bytes.push(...Commands.BOLD_OFF);
  bytes.push(...Commands.FONT_NORMAL);
  
  bytes.push(...stringToBytes("SALES RECEIPT"));
  bytes.push(LF);
  bytes.push(...stringToBytes("--------------------------------"));
  bytes.push(LF);
  
  // Receipt Info - Left aligned
  bytes.push(...Commands.ALIGN_LEFT);
  bytes.push(...stringToBytes(`Receipt #: ${sale.id}`));
  bytes.push(LF);
  
  const date = new Date(sale.createdAt);
  bytes.push(...stringToBytes(`Date: ${date.toLocaleDateString("id-ID")}`));
  bytes.push(LF);
  bytes.push(...stringToBytes(`Time: ${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`));
  bytes.push(LF);
  
  bytes.push(...stringToBytes(`Cashier: ${sale.user.name}`));
  bytes.push(LF);
  
  if (sale.paymentMethod) {
    bytes.push(...stringToBytes(`Payment: ${sale.paymentMethod.name}`));
    bytes.push(LF);
  }
  
  if (sale.table) {
    bytes.push(...stringToBytes(`Table: ${sale.table.name}`));
    bytes.push(LF);
  }
  
  // Separator
  bytes.push(...stringToBytes("--------------------------------"));
  bytes.push(LF);
  
  // Items
  sale.items.forEach((item) => {
    // Item name (bold)
    bytes.push(...Commands.BOLD_ON);
    bytes.push(...stringToBytes(item.item.name));
    bytes.push(...Commands.BOLD_OFF);
    bytes.push(LF);
    
    // Quantity x Price = Total
    const itemTotal = item.price * item.quantity;
    const itemLine = formatReceiptLine(
      `  ${item.quantity} x ${currencySymbol}${formatNumber(item.price)}`,
      `${currencySymbol}${formatNumber(itemTotal)}`,
      32
    );
    bytes.push(...stringToBytes(itemLine));
    bytes.push(LF);
  });
  
  // Separator
  bytes.push(...stringToBytes("--------------------------------"));
  bytes.push(LF);
  
  // Totals
  const subtotal = sale.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = sale.total - subtotal;
  
  // Subtotal
  const subtotalLine = formatReceiptLine(
    "Subtotal:",
    `${currencySymbol}${formatNumber(subtotal)}`,
    32
  );
  bytes.push(...stringToBytes(subtotalLine));
  bytes.push(LF);
  
  // Tax (if applicable)
  if (tax > 0) {
    const taxLine = formatReceiptLine(
      "Tax:",
      `${currencySymbol}${formatNumber(tax)}`,
      32
    );
    bytes.push(...stringToBytes(taxLine));
    bytes.push(LF);
  }
  
  // Total (bold and larger)
  bytes.push(...Commands.BOLD_ON);
  bytes.push(...Commands.FONT_LARGE);
  const totalLine = formatReceiptLine(
    "TOTAL:",
    `${currencySymbol}${formatNumber(sale.total)}`,
    32
  );
  bytes.push(...stringToBytes(totalLine));
  bytes.push(...Commands.FONT_NORMAL);
  bytes.push(...Commands.BOLD_OFF);
  bytes.push(LF);
  
  // Footer
  bytes.push(...stringToBytes("--------------------------------"));
  bytes.push(LF);
  
  const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
  bytes.push(...Commands.ALIGN_CENTER);
  bytes.push(...stringToBytes(`Items: ${itemCount}`));
  bytes.push(LF);
  bytes.push(LF);
  bytes.push(...stringToBytes("Thank you for your purchase!"));
  bytes.push(LF);
  bytes.push(...stringToBytes("Please come again!"));
  bytes.push(LF);
  bytes.push(LF);
  
  // Feed and cut paper
  bytes.push(...Commands.FEED_PAPER);
  bytes.push(...Commands.CUT_PAPER);
  
  return new Uint8Array(bytes);
}

/**
 * Format a receipt line with left and right aligned text
 * For 58mm paper, use ~32 characters width
 */
function formatReceiptLine(left, right, totalWidth = 32) {
  const spaces = totalWidth - left.length - right.length;
  if (spaces < 1) {
    // If text is too long, just concatenate with one space
    return `${left} ${right}`;
  }
  
  return left + ' '.repeat(spaces) + right;
}

/**
 * Format number for Indonesian locale
 */
function formatNumber(num) {
  return num.toLocaleString("id-ID");
}

/**
 * Convert byte array to Base64 for transmission
 */
export function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");
  return btoa(binString);
}
