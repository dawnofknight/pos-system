export const generateReceiptHTML = (sale, settings = {}) => {
  const subtotal = sale.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = sale.total - subtotal;
  const currencySymbol = settings.currencySymbol || "Rp";
  const appName = settings.appName || "POS SYSTEM";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - Sale #${sale.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 10px; 
            background: white;
            color: black;
            font-size: 12px;
            line-height: 1.4;
          }
          .receipt {
            max-width: 58mm;
            width: 100%;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: bold;
          }
          .header p {
            margin: 2px 0;
            font-size: 11px;
          }
          .info {
            margin: 10px 0;
            font-size: 11px;
          }
          .info-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .divider {
            border-bottom: 1px dashed #000;
            margin: 8px 0;
          }
          .items {
            margin: 10px 0;
          }
          .item {
            margin: 8px 0;
            font-size: 11px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            padding-left: 5px;
            font-size: 10px;
          }
          .totals {
            margin: 10px 0;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 11px;
          }
          .total-line.final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 10px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          .footer p {
            margin: 3px 0;
          }
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body { 
              margin: 0; 
              padding: 5px;
            }
            .receipt { 
              max-width: none;
              width: 58mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>${appName}</h1>
            <p>SALES RECEIPT</p>
          </div>
          
          <div class="info">
            <div class="info-line">
              <span>Receipt #:</span>
              <span>${sale.id}</span>
            </div>
            <div class="info-line">
              <span>Date:</span>
              <span>${new Date(sale.createdAt).toLocaleDateString(
                "id-ID"
              )}</span>
            </div>
            <div class="info-line">
              <span>Time:</span>
              <span>${new Date(sale.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}</span>
            </div>
            <div class="info-line">
              <span>Cashier:</span>
              <span>${sale.user.name}</span>
            </div>
            ${
              sale.paymentMethod
                ? `
            <div class="info-line">
              <span>Payment:</span>
              <span>${sale.paymentMethod.name}</span>
            </div>
            `
                : ""
            }
            ${
              sale.table
                ? `
            <div class="info-line">
              <span>Table:</span>
              <span>${sale.table.name}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="divider"></div>
          
          <div class="items">
            ${sale.items
              .map(
                (item) => `
              <div class="item">
                <div class="item-header">
                  <span>${item.item.name}</span>
                </div>
                <div class="item-details">
                  <span>${
                    item.quantity
                  } x ${currencySymbol}${item.price.toLocaleString(
                  "id-ID"
                )}</span>
                  <span>${currencySymbol}${(
                  item.price * item.quantity
                ).toLocaleString("id-ID")}</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${currencySymbol}${subtotal.toLocaleString("id-ID")}</span>
            </div>
            ${
              tax > 0
                ? `
            <div class="total-line">
              <span>Tax:</span>
              <span>${currencySymbol}${tax.toLocaleString("id-ID")}</span>
            </div>
            `
                : ""
            }
            <div class="total-line final">
              <span>TOTAL:</span>
              <span>${currencySymbol}${sale.total.toLocaleString(
    "id-ID"
  )}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Items: ${sale.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )}</p>
            <div class="divider"></div>
            <p>Thank you for your purchase!</p>
            <p>Please come again!</p>
          </div>
        </div>
        
        <script>
          // Wait for content to fully load before printing
          window.onload = function() {
            // Give browser time to render
            setTimeout(() => {
              window.print();
            }, 250);
          }
          
          // Close window after printing (or if user cancels)
          window.onafterprint = function() {
            setTimeout(() => {
              window.close();
            }, 100);
          }
        </script>
      </body>
    </html>
  `;
};

export const generateSaleCSV = (sale) => {
  const header = [
    "Sale ID",
    "Date",
    "Time",
    "Item",
    "Category",
    "Quantity",
    "Unit Price (Rp)",
    "Total Price (Rp)",
    "Cashier",
  ];
  const rows = sale.items.map((item) => [
    sale.id,
    new Date(sale.createdAt).toLocaleDateString(),
    new Date(sale.createdAt).toLocaleTimeString(),
    item.item.name,
    item.item.category?.name || "N/A",
    item.quantity,
    `Rp${item.price.toFixed(2)}`,
    `Rp${(item.price * item.quantity).toFixed(2)}`,
    sale.user.name,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};
