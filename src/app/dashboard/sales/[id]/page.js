"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Button,
} from "@/components/ui";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { generateReceiptHTML, generateSaleCSV, generatePlainTextReceipt } from "@/lib/receipt";
import PrinterDialog from "@/components/PrinterDialog";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SaleDetailsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voiding, setVoiding] = useState(false);
  const [settings, setSettings] = useState(null);
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchSaleDetails();
      fetchSettings();
    }
  }, [params.id]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchSaleDetails = async () => {
    try {
      const response = await fetch(`/api/sales/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSale(data.sale);
      } else {
        setError("Sale not found");
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
      setError("Failed to load sale details");
    } finally {
      setLoading(false);
    }
  };

  const handleVoidTransaction = async () => {
    if (
      !confirm(
        "Are you sure you want to void this transaction? This action cannot be undone and will restore the stock to inventory."
      )
    ) {
      return;
    }

    setVoiding(true);
    try {
      const response = await fetch(`/api/sales/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "void" }),
      });

      if (response.ok) {
        const data = await response.json();
        setSale(data.sale);
        alert(t("transactionVoidedSuccessfully"));
      } else {
        const errorData = await response.json();
        alert(t("errorVoidingTransaction"));
      }
    } catch (error) {
      console.error("Error voiding transaction:", error);
      alert(t("errorVoidingTransaction"));
    } finally {
      setVoiding(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: {
        color: "bg-green-100 text-green-800",
        label: t("completed"),
      },
      ACTIVE: { color: "bg-blue-100 text-blue-800", label: t("active") },
      CANCELLED: { color: "bg-red-100 text-red-800", label: t("voided") },
    };

    const config = statusConfig[status] || statusConfig.COMPLETED;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const handleExportSale = () => {
    const csvContent = generateSaleCSV(sale);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sale-${sale.id}-${
      new Date(sale.createdAt).toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrintReceipt = () => {
    if (!settings) {
      toast.error('Settings not loaded yet. Please try again in a moment.');
      return;
    }
    setShowPrinterDialog(true);
  };

  const handlePrinterSelect = async (selection) => {
    if (!selection) return;
    
    if (selection.type === "system") {
      const receiptHTML = generateReceiptHTML(sale, settings);
      const printWindow = window.open("", "_blank", "width=320,height=600");
      if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        // The new window will own the print dialog implicitly
      } else {
        alert("Please allow popups to print receipts");
      }
      setShowPrinterDialog(false);
    } else if (selection.type === "bluetooth") {
      // Import dynamically to avoid build errors
      const { generateESCPOSReceipt, bytesToBase64 } = await import("@/lib/escpos");
      const { printViaBluetooth } = await import("@/lib/printer");
      
      try {
        // Generate ESC/POS receipt data
        const escposData = generateESCPOSReceipt(sale, settings);
        const base64Data = bytesToBase64(escposData);
        
        // Get device address from selection
        const deviceAddress = selection.device?.address || selection.device?.id;
        
        if (!deviceAddress) {
          alert("Please select a Bluetooth printer first");
          return;
        }
        
        // Print via Bluetooth
        await printViaBluetooth(deviceAddress, base64Data);
        alert("Receipt printed successfully!");
        setShowPrinterDialog(false);
      } catch (error) {
        console.error("Bluetooth print error:", error);
        alert(`Bluetooth print failed: ${error.message || "Unknown error"}. Please make sure:\n1. Printer is turned on\n2. Printer is paired in Bluetooth settings\n3. Printer is in range`);
      }
    } else if (selection.type === "network") {
      alert("Network printer recorded: " + selection.address + "\nUse System Print or a native plugin to print.");
      setShowPrinterDialog(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!settings) {
      alert('Settings not loaded yet. Please try again in a moment.');
      return;
    }

    // Generate plain text receipt
    const receiptText = generatePlainTextReceipt(sale, settings);

    // Check if Web Share API is available (requires HTTPS)
    if (navigator.share) {
      try {
        // Try sharing as a file first (best for printer apps like Thermer)
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const file = new File([blob], `receipt-${sale.id}.txt`, { type: 'text/plain' });
        
        await navigator.share({
          files: [file],
          title: `Receipt #${sale.id}`,
        });
        return;
      } catch (fileError) {
        // If file sharing fails, try text sharing
        if (fileError.name !== 'AbortError') {
          try {
            await navigator.share({
              title: `Receipt #${sale.id}`,
              text: receiptText,
            });
            return;
          } catch (textError) {
            if (textError.name === 'AbortError') return;
            console.log('Share failed, using fallback');
          }
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback: Create downloadable file for HTTP or unsupported browsers
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${sale.id}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    alert('Receipt downloaded as receipt-' + sale.id + '.txt\n\nOpen it with Thermer or your thermal printer app to print!');
  };

  const handleDownloadThermalReceipt = () => {
    if (!settings) {
      alert('Settings not loaded yet. Please try again in a moment.');
      return;
    }

    try {
      // Generate plain text receipt optimized for thermal printers
      const receiptText = generatePlainTextReceipt(sale, settings);
      
      // Create blob and download
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thermal-receipt-${sale.id}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      alert('Thermal receipt downloaded!\n\nFile: thermal-receipt-' + sale.id + '.txt\n\nYou can:\n1. Open with Thermer app\n2. Print via Bluetooth printer\n3. Use with any thermal printer app');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className='space-y-6'>
            {/* Header Skeleton */}
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <div className='h-8 bg-gray-200 rounded w-48 animate-pulse'></div>
                <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
              </div>
              <div className='flex space-x-2'>
                <div className='h-10 bg-gray-200 rounded w-24 animate-pulse'></div>
                <div className='h-10 bg-gray-200 rounded w-24 animate-pulse'></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <SkeletonCard />
              <SkeletonCard />
            </div>

            <SkeletonTable
              rows={5}
              columns={4}
            />
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error || !sale) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className='text-center py-16'>
            <div className='text-red-500 text-6xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Sale Not Found
            </h2>
            <p className='text-gray-600 mb-6'>
              {error || "The requested sale could not be found."}
            </p>
            <Link href='/dashboard/sales'>
              <Button variant='primary'>Back to Sales</Button>
            </Link>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const subtotal =
    sale?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;
  const tax = sale.total - subtotal;

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className='space-y-4 md:space-y-6'>
          {/* Header */}
          <div className='flex flex-col gap-4'>
            {/* Back button and title */}
            <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
              <Link href='/dashboard/sales'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full sm:w-auto'
                >
                  ← Back to Sales
                </Button>
              </Link>
              <div className='flex items-center gap-3 flex-wrap'>
                <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
                  Sale Details
                </h1>
                {sale && getStatusBadge(sale.status)}
              </div>
            </div>
            <p className='text-sm md:text-base text-gray-600'>Sale ID: #{sale.id}</p>
            
            {/* Action buttons */}
            <div className='flex flex-col sm:flex-row gap-2 sm:flex-wrap'>
              <Button
                variant='outline'
                onClick={handleExportSale}
                className='w-full sm:w-auto justify-center sm:justify-start'
              >
                <span className='sm:hidden'>📊 Export</span>
                <span className='hidden sm:inline'>📊 Export CSV</span>
              </Button>
              <Button
                variant='outline'
                onClick={handleDownloadThermalReceipt}
                title='Download receipt for thermal printers (Thermer compatible)'
                className='w-full sm:w-auto justify-center sm:justify-start'
              >
                <span className='sm:hidden'>⬇️ Thermal</span>
                <span className='hidden sm:inline'>⬇️ Download Thermal</span>
              </Button>
              <Button
                variant='outline'
                onClick={handleShareReceipt}
                title='Share receipt to thermal printer apps'
                className='w-full sm:w-auto justify-center sm:justify-start'
              >
                <span className='sm:hidden'>📤 Share</span>
                <span className='hidden sm:inline'>📤 Share Receipt</span>
              </Button>
              <Button
                variant='outline'
                onClick={handlePrintReceipt}
                className='w-full sm:w-auto justify-center sm:justify-start'
              >
                <span className='sm:hidden'>🖨️ Print</span>
                <span className='hidden sm:inline'>🖨️ Print Receipt</span>
              </Button>
              {sale?.status === "COMPLETED" && (
                <Button
                  variant='danger'
                  onClick={handleVoidTransaction}
                  disabled={voiding}
                  className='w-full sm:w-auto justify-center sm:justify-start'
                >
                  {voiding ? "Voiding..." : (
                    <>
                      <span className='sm:hidden'>❌ Void</span>
                      <span className='hidden sm:inline'>❌ Void Transaction</span>
                    </>
                  )}
                </Button>
              )}
              <Button
                variant='primary'
                onClick={() => router.push("/dashboard/sales/create")}
                className='w-full sm:w-auto justify-center sm:justify-start'
              >
                <span className='sm:hidden'>+ New Sale</span>
                <span className='hidden sm:inline'>Create New Sale</span>
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6'>
            {/* Printer Dialog */}
            <PrinterDialog
              open={showPrinterDialog}
              onClose={() => setShowPrinterDialog(false)}
              onSelect={handlePrinterSelect}
              onBack={() => router.push('/dashboard')}
            />
            {/* Sale Information */}
            <div className='lg:col-span-2 space-y-4 md:space-y-6'>
              {/* Items */}
              <Card>
                <CardHeader>
                  <h3 className='text-base md:text-lg font-semibold'>Items Purchased</h3>
                </CardHeader>
                <CardBody className='overflow-x-auto'>
                  <Table className='min-w-full'>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell className='text-xs md:text-sm'>Item</TableHeaderCell>
                        <TableHeaderCell className='text-xs md:text-sm'>Price</TableHeaderCell>
                        <TableHeaderCell className='text-xs md:text-sm'>Qty</TableHeaderCell>
                        <TableHeaderCell className='text-xs md:text-sm'>Total</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale?.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='min-w-[150px]'>
                            <div className='flex items-center gap-2'>
                              <ProductImage
                                item={item.item}
                                size='md'
                              />
                              <div>
                                <div className='font-medium text-xs md:text-sm'>
                                  {item.item.name}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {item.item.category?.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            <span className='font-medium text-xs md:text-sm'>
                              Rp{item.price.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium text-xs md:text-sm'>{item.quantity}</span>
                          </TableCell>
                          <TableCell className='whitespace-nowrap'>
                            <span className='font-medium text-xs md:text-sm'>
                              Rp{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <h3 className='text-base md:text-lg font-semibold'>Payment Summary</h3>
                </CardHeader>
                <CardBody>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm md:text-base text-gray-600'>Subtotal</span>
                      <span className='font-medium text-sm md:text-base'>
                        Rp{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm md:text-base text-gray-600'>Tax (10%)</span>
                      <span className='font-medium text-sm md:text-base'>Rp{tax.toFixed(2)}</span>
                    </div>
                    <div className='border-t pt-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-base md:text-lg font-semibold'>Total</span>
                        <span className='text-xl md:text-2xl font-bold text-green-600'>
                          Rp{sale.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sale Summary */}
            <div className='space-y-4 md:space-y-6'>
              {/* Transaction Info */}
              <Card>
                <CardHeader>
                  <h3 className='text-base md:text-lg font-semibold'>Transaction Info</h3>
                </CardHeader>
                <CardBody>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Date & Time
                      </label>
                      <p className='text-gray-900'>
                        {new Date(sale.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Cashier
                      </label>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                          <span className='text-primary-600 font-medium text-sm'>
                            {sale.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className='text-gray-900'>{sale.user.name}</span>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Sale ID
                      </label>
                      <p className='text-gray-900 font-mono text-sm'>
                        #{sale.id}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Status
                      </label>
                      {getStatusBadge(sale.status)}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <h3 className='text-base md:text-lg font-semibold'>Quick Stats</h3>
                </CardHeader>
                <CardBody>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-primary-600'>
                        {sale?.items?.length || 0}
                      </div>
                      <div className='text-sm text-gray-600'>Items</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {sale?.items?.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        ) || 0}
                      </div>
                      <div className='text-sm text-gray-600'>Quantity</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>Actions</h3>
                </CardHeader>
                <CardBody>
                  <div className='space-y-3'>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handlePrintReceipt}
                    >
                      🖨️ Print Receipt
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handleExportSale}
                    >
                      📊 Export CSV
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Sale #${sale.id} - Rp${sale.total.toFixed(2)}`
                        );
                        alert("Sale details copied to clipboard!");
                      }}
                    >
                      📋 Copy Details
                    </Button>
                    {sale.status === "COMPLETED" && (
                      <Button
                        variant='danger'
                        className='w-full'
                        onClick={handleVoidTransaction}
                        disabled={voiding}
                      >
                        {voiding ? t("loading") : t("voidTransaction")}
                      </Button>
                    )}
                    <Link
                      href='/dashboard/sales/create'
                      className='block'
                    >
                      <Button
                        variant='primary'
                        className='w-full'
                      >
                        + New Sale
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
