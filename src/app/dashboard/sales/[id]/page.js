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
import { generateReceiptHTML, generateSaleCSV } from "@/lib/receipt";
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
    const receiptHTML = generateReceiptHTML(sale, settings);
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    } else {
      alert("Please allow popups to print receipts");
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
                <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse'></div>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse'></div>
              </div>
              <div className='flex space-x-2'>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse'></div>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse'></div>
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
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center gap-4 mb-2'>
                <Link href='/dashboard/sales'>
                  <Button
                    variant='outline'
                    size='sm'
                  >
                    ← Back to Sales
                  </Button>
                </Link>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Sale Details
                </h1>
                {sale && getStatusBadge(sale.status)}
              </div>
              <p className='text-gray-600'>Sale ID: #{sale.id}</p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleExportSale}
              >
                📊 Export CSV
              </Button>
              <Button
                variant='outline'
                onClick={handlePrintReceipt}
              >
                🖨️ Print Receipt
              </Button>
              {sale?.status === "COMPLETED" && (
                <Button
                  variant='danger'
                  onClick={handleVoidTransaction}
                  disabled={voiding}
                >
                  {voiding ? "Voiding..." : "❌ Void Transaction"}
                </Button>
              )}
              <Button
                variant='primary'
                onClick={() => router.push("/dashboard/sales/create")}
              >
                Create New Sale
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Sale Information */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Items */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>Items Purchased</h3>
                </CardHeader>
                <CardBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Item</TableHeaderCell>
                        <TableHeaderCell>Price</TableHeaderCell>
                        <TableHeaderCell>Quantity</TableHeaderCell>
                        <TableHeaderCell>Total</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale?.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <ProductImage
                                item={item.item}
                                size='md'
                              />
                              <div>
                                <div className='font-medium'>
                                  {item.item.name}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {item.item.category?.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium'>
                              Rp{item.price.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium'>{item.quantity}</span>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium'>
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
                  <h3 className='text-lg font-semibold'>Payment Summary</h3>
                </CardHeader>
                <CardBody>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='font-medium'>
                        Rp{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Tax (10%)</span>
                      <span className='font-medium'>Rp{tax.toFixed(2)}</span>
                    </div>
                    <div className='border-t pt-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-lg font-semibold'>Total</span>
                        <span className='text-2xl font-bold text-green-600'>
                          Rp{sale.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sale Summary */}
            <div className='space-y-6'>
              {/* Transaction Info */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>Transaction Info</h3>
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
                  <h3 className='text-lg font-semibold'>Quick Stats</h3>
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
