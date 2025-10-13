export const generateReceiptHTML = (sale) => {
  const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = sale.total - subtotal

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - Sale #${sale.id}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: black;
          }
          .receipt {
            max-width: 350px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .items {
            margin: 20px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 14px;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 50px;
            text-align: center;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .item-total {
            width: 80px;
            text-align: right;
            font-weight: bold;
          }
          .totals {
            margin: 20px 0;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .total-line.final {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>🏪 POS SYSTEM</h1>
            <p>SALES RECEIPT</p>
            <p>Sale #${sale.id}</p>
            <p>${new Date(sale.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            <p>${new Date(sale.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}</p>
          </div>
          
          <div class="items">
            ${sale.items.map(item => `
              <div class="item">
                <div class="item-name">${item.item.emoji || '📦'} ${item.item.name}</div>
                <div class="item-qty">${item.quantity}x</div>
                <div class="item-price">Rp${item.price.toFixed(2)}</div>
                <div class="item-total">Rp${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>Rp${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax (10%):</span>
              <span>Rp${tax.toFixed(2)}</span>
            </div>
            <div class="total-line final">
              <span>TOTAL:</span>
              <span>Rp${sale.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Cashier:</strong> ${sale.user.name}</p>
            <p>Items: ${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <p>💝 Thank you for your purchase! 💝</p>
            <p>Please come again!</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        </script>
      </body>
    </html>
  `
}

export const generateSaleCSV = (sale) => {
  const header = ['Sale ID', 'Date', 'Time', 'Item', 'Category', 'Quantity', 'Unit Price (Rp)', 'Total Price (Rp)', 'Cashier']
  const rows = sale.items.map(item => [
    sale.id,
    new Date(sale.createdAt).toLocaleDateString(),
    new Date(sale.createdAt).toLocaleTimeString(),
    item.item.name,
    item.item.category?.name || 'N/A',
    item.quantity,
    `Rp${item.price.toFixed(2)}`,
    `Rp${(item.price * item.quantity).toFixed(2)}`,
    sale.user.name
  ])
  
  const csvContent = [header, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}
