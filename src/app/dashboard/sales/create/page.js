"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

import { Button, Input, LoadingSpinner } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { generateReceiptHTML } from "@/lib/receipt";

export default function CreateSalePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Existing states
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState({
    taxEnabled: false,
    taxRate: 0,
    taxName: "Tax",
    currencySymbol: "Rp",
  });

  // New states for order type and table system
  const [orderType, setOrderType] = useState("dine-in"); // 'dine-in' or 'take-away'
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentStep, setCurrentStep] = useState("table"); // 'table' or 'menu'
  const [orderNumber, setOrderNumber] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(true);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Generate order number
  useEffect(() => {
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      setOrderNumber(`${timestamp}`);
    };
    generateOrderNumber();
  }, []);

  // Tables state
  const [tables, setTables] = useState([]);
  const [activeSales, setActiveSales] = useState([]);

  // const DRAFT_STORAGE_KEY = `pos_draft_cart_${user?.id || 'anonymous'}`

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchPaymentMethods();
    fetchSettings();
    fetchTables();
    fetchActiveSales();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
        // Set the first enabled payment method as default
        const enabledMethods = data.filter((pm) => pm.enabled);
        if (enabledMethods.length > 0) {
          setSelectedPaymentMethod(enabledMethods[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/branding");
      if (response.ok) {
        const data = await response.json();
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const addToCart = (item) => {
    if (item.stock <= 0) {
      alert(t("thisItemIsOutOfStock"));
      return;
    }

    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.itemId === item.id
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQuantity = newCart[existingIndex].quantity + 1;

      if (newQuantity > item.stock) {
        alert(t("notEnoughStockAvailable"));
        return;
      }

      newCart[existingIndex].quantity = newQuantity;
      newCart[existingIndex].total = newQuantity * item.price;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          total: item.price,
        },
      ]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.itemId !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (newQuantity > item.stock) {
      alert(t("notEnoughStockAvailable"));
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.itemId === itemId
          ? {
              ...cartItem,
              quantity: newQuantity,
              total: newQuantity * cartItem.price,
            }
          : cartItem
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    if (!settings.taxEnabled) return 0;
    return calculateTotal() * (settings.taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/tables");
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchActiveSales = async () => {
    try {
      const response = await fetch("/api/sales/active");
      if (response.ok) {
        const data = await response.json();
        setActiveSales(data);
      }
    } catch (error) {
      console.error("Error fetching active sales:", error);
    }
  };

  const handleTableSelect = (table) => {
    // Check if table has an active sale
    const activeSale = activeSales.find((sale) => sale.tableId === table.id);
    if (activeSale) {
      // Redirect to edit the existing sale
      router.push(`/dashboard/sales/edit/${activeSale.id}`);
      return;
    }

    if (table.status === "occupied") return;
    setSelectedTable(table);
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === "take-away") {
      setSelectedTable(null);
    }
  };

  const proceedToMenu = () => {
    if (orderType === "dine-in" && !selectedTable) {
      alert(t("pleaseSelectTableForDineIn"));
      return;
    }
    setCurrentStep("menu");
  };

  const goBackToTable = () => {
    setCurrentStep("table");
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert(t("pleaseAddItemsToCart"));
      return;
    }

    if (!selectedPaymentMethod) {
      alert(t("pleaseSelectPaymentMethod"));
      return;
    }

    setProcessing(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateGrandTotal(),
        userId: user.id,
        paymentMethodId: parseInt(selectedPaymentMethod),
        orderType: orderType,
        tableId: selectedTable?.id || null,
        guestCount: orderType === "dine-in" ? guestCount : 1,
      };

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const result = await response.json();
        setCompletedSale(result.sale);
        setCart([]);
        setShowSuccessModal(true);
      } else {
        alert(t("errorProcessingSale"));
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      alert(t("errorProcessingSale"));
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!completedSale) return;

    const receiptHTML = generateReceiptHTML(completedSale, settings);
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    } else {
      alert("Please allow popups to print receipts");
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCompletedSale(null);
    router.push("/dashboard/sales");
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.categoryId.toString() === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className='h-full bg-gray-50'>
            {/* Header Skeleton */}
            <div className='bg-white border-b border-gray-200 px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <div className='h-6 bg-gray-200 rounded w-32 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-48 animate-pulse'></div>
                </div>
                <div className='h-10 bg-gray-200 rounded w-24 animate-pulse'></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className='flex h-full'>
              {/* Left Panel - Menu Items */}
              <div className='flex-1 p-6'>
                <div className='space-y-4'>
                  {/* Category Tabs Skeleton */}
                  <div className='flex space-x-2'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='h-10 bg-gray-200 rounded w-20 animate-pulse'
                      ></div>
                    ))}
                  </div>

                  {/* Items Grid Skeleton */}
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Cart */}
              <div className='w-96 bg-white border-l border-gray-200 p-6'>
                <SkeletonCard />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className='h-full bg-gray-50'>
          {/* Header */}
          <div className='bg-white border-b border-gray-200 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                    <span className='text-2xl'>🍽️</span>
                  </div>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                      {t("pos")}
                    </h1>
                    <p className='text-sm text-gray-500'>
                      {t("pointOfSaleSystem")}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <span>📅 {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>🕐 {new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <Button
                  onClick={() => router.push("/dashboard/sales")}
                  variant='outline'
                  size='sm'
                >
                  ← {t("backToSales")}
                </Button>
              </div>
            </div>
          </div>

          {currentStep === "table" ? (
            // Table Selection Step
            <div className='p-6'>
              <div className='max-w-6xl mx-auto'>
                {/* Order Type Selection */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
                  <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                    {t("orderType")}
                  </h2>
                  <div className='flex gap-4'>
                    <button
                      onClick={() => handleOrderTypeChange("dine-in")}
                      className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                        orderType === "dine-in"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className='text-center'>
                        <div className='text-4xl mb-2'>🍽️</div>
                        <h3 className='font-semibold text-gray-900'>
                          {t("dineIn")}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {t("tableService")}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleOrderTypeChange("take-away")}
                      className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                        orderType === "take-away"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className='text-center'>
                        <div className='text-4xl mb-2'>🥡</div>
                        <h3 className='font-semibold text-gray-900'>
                          {t("takeAway")}
                        </h3>
                        <p className='text-sm text-gray-500'>{t("toGo")}</p>
                      </div>
                    </button>
                  </div>
                </div>

                {orderType === "dine-in" && (
                  <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
                    <div className='flex items-center justify-between mb-6'>
                      <h2 className='text-xl font-semibold text-gray-900'>
                        {t("tableSelection")}
                      </h2>
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-gray-600'>
                            {t("guests")}:
                          </span>
                          <div className='flex items-center bg-gray-100 rounded-lg'>
                            <button
                              onClick={() =>
                                setGuestCount(Math.max(1, guestCount - 1))
                              }
                              className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg'
                            >
                              -
                            </button>
                            <span className='w-12 text-center text-sm font-medium text-gray-900 py-2'>
                              {guestCount}
                            </span>
                            <button
                              onClick={() => setGuestCount(guestCount + 1)}
                              className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg'
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='mb-6'>
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        {t("activeTableSessions")}
                      </h3>
                      {activeSales.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {activeSales.map((sale) => (
                            <Link
                              href={`/dashboard/sales/edit/${sale.id}`}
                              key={sale.id}
                              className='block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors'
                            >
                              <div className='flex justify-between items-center'>
                                <div>
                                  <h4 className='font-medium text-gray-900'>
                                    {t("table")}{" "}
                                    {sale.table?.name || t("unknown")}
                                  </h4>
                                  <p className='text-sm text-gray-600'>
                                    {t("order")} #{sale.orderNumber}
                                  </p>
                                </div>
                                <div className='text-right'>
                                  <p className='text-sm font-medium text-gray-900'>
                                    {settings.currencySymbol}{" "}
                                    {sale.total.toLocaleString()}
                                  </p>
                                  <p className='text-xs text-gray-500'>
                                    {sale.items?.length || 0} {t("items")}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className='text-gray-500 text-sm'>
                          {t("noActiveTableSessions")}
                        </p>
                      )}
                    </div>

                    <div className='grid grid-cols-3 gap-8 max-w-4xl mx-auto'>
                      {tables.map((table) => (
                        <div
                          key={table.id}
                          className='text-center'
                        >
                          <button
                            onClick={() => handleTableSelect(table)}
                            disabled={table.status === "occupied"}
                            className={`w-24 h-24 rounded-full border-4 transition-all relative ${
                              table.status === "occupied"
                                ? "border-red-300 bg-red-100 cursor-not-allowed"
                                : selectedTable?.id === table.id
                                ? "border-orange-500 bg-orange-100 shadow-lg"
                                : "border-gray-300 bg-white hover:border-orange-300 hover:shadow-md"
                            }`}
                          >
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <span
                                className={`text-lg font-semibold ${
                                  table.occupied
                                    ? "text-red-600"
                                    : selectedTable?.id === table.id
                                    ? "text-orange-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {table.name}
                              </span>
                            </div>

                            {/* Table chairs representation */}
                            <div className='absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded'></div>
                            <div className='absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded'></div>
                            <div className='absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 rounded'></div>
                            <div className='absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 rounded'></div>
                          </button>

                          <div className='mt-2'>
                            <p
                              className={`text-sm font-medium ${
                                table.occupied
                                  ? "text-red-600"
                                  : selectedTable?.id === table.id
                                  ? "text-orange-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {table.occupied ? t("occupied") : t("available")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-6'>
                      <div>
                        <p className='text-sm text-gray-500'>{t("order")} #</p>
                        <p className='text-lg font-semibold text-gray-900'>
                          {orderNumber}
                        </p>
                      </div>

                      {orderType === "dine-in" && selectedTable && (
                        <div>
                          <p className='text-sm text-gray-500'>{t("table")}</p>
                          <p className='text-lg font-semibold text-orange-600'>
                            {selectedTable.name}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className='text-sm text-gray-500'>{t("guests")}</p>
                        <p className='text-lg font-semibold text-gray-900'>
                          {guestCount}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={proceedToMenu}
                      variant='primary'
                      className='bg-orange-500 hover:bg-orange-600'
                      disabled={orderType === "dine-in" && !selectedTable}
                    >
                      {t("selectMenu")} →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Menu Selection Step
            <div className='flex flex-col md:flex-row h-auto min-h-[calc(100vh-120px)]'>
              {/* Left Side - Menu */}
              <div className='flex-1 p-4 md:p-6'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col'>
                  {/* Menu Header */}
                  <div className='p-6 border-b border-gray-200'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <Button
                          onClick={goBackToTable}
                          variant='outline'
                          size='sm'
                        >
                          ← {t("back")}
                        </Button>
                        <h2 className='text-xl font-semibold text-gray-900'>
                          {t("menu")}
                        </h2>
                      </div>

                      <div className='flex items-center gap-4 text-sm'>
                        <span className='text-gray-500'>
                          {t("order")} #{orderNumber}
                        </span>
                        {orderType === "dine-in" && selectedTable && (
                          <span className='text-orange-600 font-medium'>
                            {t("table")} {selectedTable.name}
                          </span>
                        )}
                        {orderType === "take-away" && (
                          <span className='text-green-600 font-medium'>
                            {t("takeAway")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Search */}
                    <div className='flex gap-4 mb-4'>
                      <div className='flex-1 relative'>
                        <Input
                          placeholder={t("searchMenuItems")}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className='pl-10'
                        />
                        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Category Tabs */}
                    <div className='flex overflow-x-auto pb-2 mb-2 scrollbar-hide'>
                      <div
                        className={`flex-shrink-0 px-4 py-2 mr-2 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                          selectedCategory === "all"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedCategory("all")}
                      >
                        {t("all")}
                      </div>

                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`flex-shrink-0 px-4 py-2 mr-2 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                            selectedCategory === category.id.toString()
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            setSelectedCategory(category.id.toString())
                          }
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items Grid */}
                  <div className='flex-1 p-4 md:p-6 overflow-y-auto'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'>
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className={`group bg-gray-50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border relative ${
                            item.stock <= 0
                              ? "opacity-50 cursor-not-allowed grayscale"
                              : "hover:border-orange-300"
                          }`}
                        >
                          {/* Stock badge */}
                          <div className='flex justify-between items-start mb-3'>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.stock <= 0
                                  ? "bg-red-100 text-red-700"
                                  : item.stock <= 5
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {item.stock <= 0 ? t("out") : item.stock}
                            </span>
                          </div>

                          {/* Product image */}
                          <div className='aspect-square rounded-lg mb-3 bg-white flex items-center justify-center p-2 max-h-32'>
                            <ProductImage
                              item={item}
                              size='lg'
                              className='w-full h-full object-contain rounded-md'
                            />
                          </div>

                          {/* Product info */}
                          <div className='text-center space-y-1'>
                            <h4 className='font-semibold text-sm text-gray-900 truncate'>
                              {item.name}
                            </h4>
                            <p className='text-xs text-gray-500 truncate'>
                              {item.category?.name}
                            </p>
                            <div className='text-lg font-bold text-orange-600'>
                              {settings.currencySymbol}
                              {item.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Hover overlay */}
                          {item.stock > 0 && (
                            <div className='absolute inset-0 bg-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                              <div className='bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform'>
                                + {t("addToCart")}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredItems.length === 0 && (
                      <div className='text-center py-12 text-gray-500'>
                        <div className='text-4xl mb-4'>🔍</div>
                        <p>{t("noItemsFound")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Cart */}
              <div className='w-full md:w-96 p-4 md:p-6 md:pl-0'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col'>
                  {/* Cart Header */}
                  <div className='p-6 border-b border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {t("orderSummary")}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {cart.length}{" "}
                          {cart.length === 1 ? t("item") : t("items")}
                        </p>
                      </div>

                      {cart.length > 0 && (
                        <Button
                          onClick={() => setCart([])}
                          variant='outline'
                          size='sm'
                        >
                          {t("clear")}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className='flex-1 overflow-y-auto p-6'>
                    {cart.length === 0 ? (
                      <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                        <div className='text-4xl mb-4'>🛒</div>
                        <p className='text-center'>{t("noItemsInCart")}</p>
                        <p className='text-sm text-center mt-1'>
                          {t("addItemsFromMenu")}
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {cart.map((item) => (
                          <div
                            key={item.itemId}
                            className='bg-gray-50 rounded-lg p-4'
                          >
                            <div className='flex items-start justify-between mb-3'>
                              <div className='flex-1'>
                                <h4 className='font-medium text-gray-900 text-sm'>
                                  {item.name}
                                </h4>
                                <p className='text-xs text-gray-500'>
                                  {settings.currencySymbol}
                                  {item.price.toFixed(2)} {t("each")}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.itemId)}
                                className='text-gray-400 hover:text-red-500 transition-colors'
                              >
                                <svg
                                  className='w-4 h-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className='flex items-center justify-between'>
                              <div className='flex items-center bg-white rounded-lg border border-gray-200'>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.itemId,
                                      item.quantity - 1
                                    )
                                  }
                                  className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors'
                                >
                                  -
                                </button>
                                <span className='w-12 text-center text-sm font-medium text-gray-900 py-2'>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.itemId,
                                      item.quantity + 1
                                    )
                                  }
                                  className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors'
                                >
                                  +
                                </button>
                              </div>

                              <div className='text-right'>
                                <div className='text-lg font-bold text-orange-600'>
                                  {settings.currencySymbol}
                                  {item.total.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className='p-6 border-t border-gray-200 dark:border-gray-700'>
                      {/* Totals */}
                      <div className='space-y-2 mb-4'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t("subtotal")}:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {settings.currencySymbol}
                            {calculateTotal().toFixed(2)}
                          </span>
                        </div>
                        {settings.taxEnabled && (
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>
                              {settings.taxName} ({settings.taxRate}%):
                            </span>
                            <span className='font-medium text-gray-900'>
                              {settings.currencySymbol}
                              {calculateTax().toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className='border-t border-gray-200 pt-2'>
                          <div className='flex justify-between'>
                            <span className='text-lg font-bold text-gray-900'>
                              {t("total")}:
                            </span>
                            <span className='text-xl font-bold text-orange-600'>
                              {settings.currencySymbol}
                              {calculateGrandTotal().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className='mb-4'>
                        <div
                          className='flex items-center justify-between mb-2 cursor-pointer'
                          onClick={() =>
                            setPaymentMethodOpen(!paymentMethodOpen)
                          }
                        >
                          <label className='block text-sm font-medium text-gray-700'>
                            {t("paymentMethod")}
                          </label>
                          <button className='text-gray-500 hover:text-gray-700'>
                            {paymentMethodOpen ? (
                              <svg
                                className='w-5 h-5'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M5 15l7-7 7 7'
                                />
                              </svg>
                            ) : (
                              <svg
                                className='w-5 h-5'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 9l-7 7-7-7'
                                />
                              </svg>
                            )}
                          </button>
                        </div>

                        {paymentMethodOpen && (
                          <div className='grid grid-cols-2 gap-2'>
                            {paymentMethods
                              .filter((pm) => pm.enabled)
                              .map((method) => (
                                <button
                                  key={method.id}
                                  type='button'
                                  onClick={() =>
                                    setSelectedPaymentMethod(method.id)
                                  }
                                  className={`flex items-center justify-center p-3 rounded-lg border ${
                                    selectedPaymentMethod === method.id
                                      ? "bg-orange-500 border-orange-500"
                                      : "border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <div className='flex flex-col items-center'>
                                    <span className='text-xl mb-1'>
                                      {method.name === t("cash")
                                        ? "💵"
                                        : method.name === t("creditCard")
                                        ? "💳"
                                        : method.name === t("debitCard")
                                        ? "💳"
                                        : "📱"}
                                    </span>
                                    <span className='font-medium'>
                                      {method.name}
                                    </span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Complete Order Button */}
                      <Button
                        onClick={processSale}
                        variant='primary'
                        className='w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl'
                        disabled={processing || !selectedPaymentMethod}
                      >
                        {processing ? (
                          <div className='flex items-center justify-center space-x-2'>
                            <LoadingSpinner size='sm' />
                            <span>{t("processing")}...</span>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center space-x-2'>
                            <span>💰</span>
                            <span>{t("completeOrder")}</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showSuccessModal && completedSale && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300'>
              {/* Success Icon */}
              <div className='text-center mb-6'>
                <div className='inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4'>
                  <span className='text-5xl'>✓</span>
                </div>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  {t("saleCompletedSuccessfully")}
                </h2>
                <p className='text-gray-600'>
                  {t("receipt")} #{completedSale.id}
                </p>
              </div>

              {/* Sale Summary */}
              <div className='bg-gray-50 rounded-xl p-4 mb-6 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>{t("items")}:</span>
                  <span className='font-semibold'>
                    {completedSale.items?.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>{t("paymentMethod")}:</span>
                  <span className='font-semibold'>
                    {completedSale.paymentMethod?.name}
                  </span>
                </div>
                {completedSale.table && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>{t("table")}:</span>
                    <span className='font-semibold'>
                      {completedSale.table.name}
                    </span>
                  </div>
                )}
                <div className='flex justify-between text-lg font-bold border-t pt-2 mt-2'>
                  <span>{t("total")}:</span>
                  <span className='text-orange-600'>
                    {settings.currencySymbol}
                    {completedSale.total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3'>
                <Button
                  onClick={handlePrintReceipt}
                  variant='primary'
                  className='w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2'
                >
                  <span>🖨️</span>
                  <span>{t("printReceipt")}</span>
                </Button>

                <Button
                  onClick={handleCloseModal}
                  variant='outline'
                  className='w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50'
                >
                  {t("backToSales")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
