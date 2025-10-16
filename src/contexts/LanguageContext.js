"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

// Translation data
const translations = {
  en: {
    // Dashboard Layout
    dashboard: "Dashboard",
    items: "Items",
    categories: "Categories",
    sales: "Sales",
    createSale: "Create Sale",
    settings: "Settings",
    logout: "Logout",
    auditLogs: "Audit Logs",

    // Dashboard descriptions
    overviewAnalytics: "Overview & Analytics",
    menuItems: "Menu Items",
    productGroups: "Product Groups",
    posOrders: "POS & Orders",
    newTransaction: "New Transaction",
    systemConfig: "System Config",

    // Common
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    loading: "Loading...",
    noData: "No data available",

    // Items page
    itemsManagement: "Items Management",
    manageInventoryItems: "Manage your inventory items and stock levels",
    addNewItem: "Add New Item",
    itemsInventory: "Items Inventory",
    stockReport: "Stock Report",
    inventoryItems: "Inventory Items",
    itemsCount: "items",
    salesRecords: "sales records",
    startDate: "Start Date",
    endDate: "End Date",
    clear: "Clear",
    item: "Item",
    units: "units",
    totalItems: "Total Items",
    lowStockItems: "Low Stock Items",
    totalStockValue: "Total Stock Value",
    outOfStock: "Out of Stock",
    lowStockAlert: "Low Stock Alert",
    itemName: "Item Name",
    originStock: "Origin Stock",
    soldQuantity: "Sold Quantity",
    remainingStock: "Remaining Stock",
    unitPrice: "Unit Price",
    totalSalesValue: "Total Sales Value",
    uncategorized: "Uncategorized",
    noItemsAvailable: "No items available",
    addItemsToSeeStock: "Add some items to see detailed stock information.",
    editItem: "Edit Item",
    emojiIcon: "Emoji Icon",
    enterItemName: "Enter item name",
    optionalDescription: "Optional description",
    emojiPlaceholder: "📦 (optional emoji for visual identification)",
    stockQuantity: "Stock Quantity",
    selectCategory: "Select a category",
    saving: "Saving...",
    updateItem: "Update Item",
    addItem: "Add Item",

    // Categories page
    categoriesManagement: "Categories Management",
    organizeCategoriesDesc: "Organize and manage your product categories",
    addNewCategory: "Add New Category",
    productCategories: "Product Categories",
    categoryName: "Category Name",
    enterCategoryName: "Enter category name",
    addCategory: "Add Category",
    itemsInCategory: 'Items in "{{categoryName}}"',
    noItemsFound: "No items found",
    categoryNoItems: "This category doesn't have any items yet.",
    itemsIn: "Items in",
    categoryDoesntHaveItems: "This category doesn't have any items yet.",

    // Sales page
    salesManagement: "Sales Management",
    salesHistory: "Sales History",
    viewManageSalesTransactions: "View and manage all sales transactions",
    createNewSale: "Create New Sale",
    totalSales: "Total Sales",
    totalRevenue: "Total Revenue",
    allTimeSales: "All Time Sales",
    thisWeekSales: "This Week Sales",
    thisMonthSales: "This Month Sales",
    thisYearSales: "This Year Sales",
    allTimeRevenue: "All Time Revenue",
    thisWeekRevenue: "This Week Revenue",
    thisMonthRevenue: "This Month Revenue",
    thisYearRevenue: "This Year Revenue",
    searchSalesPlaceholder: "Search sales...",
    allTime: "All Time",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    dateRangeFilter: "Date Range Filter",
    recentTransactions: "Recent Transactions",
    of: "of",
    transactions: "transactions",
    noMatchingSalesFound: "No matching sales found",
    noSalesYet: "No sales yet",
    tryAdjustingSearchFilter: "Try adjusting your search or filter criteria",
    startMakingSales: "Start making sales to see transactions here",
    createFirstSale: "Create First Sale",
    dateTime: "Date & Time",
    totalAmount: "Total Amount",
    cashier: "Cashier",
    moreItems: "more items",
    viewDetails: "View Details",
    todaySales: "Today's Sales",
    totalTransactions: "Total Transactions",
    averageOrder: "Average Order",

    // Status
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStockStatus: "Out of Stock",
    status: "Status",
    completed: "Completed",
    active: "Active",
    voided: "Voided",
    voidTransaction: "Void Transaction",
    voidTransactionConfirm: "Are you sure you want to void this transaction? This action cannot be undone.",
    transactionVoidedSuccessfully: "Transaction voided successfully",
    errorVoidingTransaction: "Error voiding transaction",

    // Messages
    noSalesData: "No sales data available",
    noItemsData: "No items data available",
    noCategoriesData: "No categories data available",

    // Reports page
    salesReports: "Sales Reports",
    viewSalesAnalytics: "View sales analytics and performance metrics",
    filters: "Filters",
    period: "Period",
    today: "Today",
    customRange: "Custom Range",
    paymentMethod: "Payment Method",
    allMethods: "All Methods",
    averageSale: "Average Sale",
    perTransaction: "Per transaction",
    paymentMethods: "Payment Methods",
    usedInPeriod: "Used in period",
    paymentMethodsBreakdown: "Payment Methods Breakdown",
    topSellingItems: "Top Selling Items",
    unitsSold: "units sold",
    categoryPerformance: "Category Performance",
    recentSales: "Recent Sales",
    sale: "Sale",
    unknown: "Unknown",
    noDataAvailable: "No data available for the selected period",

    // Dashboard specific keys
    realTimeInsights: "Real-time insights into your business performance",
    todaysSales: "Today's Sales",
    inInventory: "In inventory",
    itemsUnder10: "Items under 10",
    latestTransactions: "Latest transactions",
    noRecentSales: "No recent sales",
    salesWillAppearHere:
      "Sales will appear here once you start making transactions",
    bestPerformers: "Best performing products this month",
    sold: "Sold",
    topSellingItemsWillAppearHere:
      "Top selling items will appear here once you have sales",
    each: "each",

    // Payment methods
    cash: "Cash",
    creditCard: "Credit Card",
    debitCard: "Debit Card",

    // Sales create page - Order types
    dineIn: "Dine In",
    takeAway: "Take Away",
    tableService: "Table service",
    toGo: "To go",

    // Sales create page - Table selection
    tableSelection: "Table Selection",
    guests: "Guests",
    activeTableSessions: "Active Table Sessions",
    table: "Table",
    available: "Available",
    occupied: "Occupied",
    selectMenu: "Select Menu",
    noActiveTableSessions: "No active table sessions",
    pleaseSelectTableForDineIn: "Please select a table for dine-in orders",

    // Sales create page - Menu
    back: "Back",
    menu: "Menu",
    searchMenuItems: "Search menu items...",

    // Sales create page - Order summary
    orderSummary: "Order Summary",
    noItemsInCart: "No items in cart",
    addItemsFromMenu: "Add items from the menu to get started",

    // Sales create page - Header
    pos: "POS",
    pointOfSaleSystem: "Point of Sale System",
    backToSales: "Back to Sales",
    orderType: "Order Type",

    order: "Order",

    // Settings page
    systemSettings: "System Settings",
    configureSystemPreferences:
      "Configure your system preferences and settings",
    generalSettings: "General Settings",
    basicSystemConfiguration: "Basic system configuration and preferences",
    currencySettings: "Currency Settings",
    configureCurrencyAndTax:
      "Configure currency and tax settings for your business",
    taxEnabled: "Tax Enabled",
    enableTaxCalculation: "Enable tax calculation for sales",
    taxRate: "Tax Rate",
    taxName: "Tax Name",
    currencyCode: "Currency Code",
    currencySymbol: "Currency Symbol",
    brandingConfiguration: "Branding Configuration",
    customizeAppNameAndLogo: "Customize your application name and logo",
    applicationName: "Application Name",
    logoManagement: "Logo Management",
    uploadNewLogo: "Upload New Logo",
    currentLogo: "Current Logo",
    deleteLogo: "Delete Logo",
    noLogoUploaded: "No logo uploaded",
    uploadLogoToCustomize:
      "Upload a logo to customize your application branding",
    tableManagement: "Table Management",
    configureRestaurantTables:
      "Configure restaurant tables and seating arrangements",
    numberOfTables: "Number of Tables",
    roleManagement: "Role Management",
    configurePermissionsForRoles:
      "Configure permissions for different user roles",
    permissions: "Permissions",
    admin: "Admin",
    resource: "Resource",
    view: "View",
    create: "Create",
    userManagement: "User Management",
    createEditManageUsers: "Create, edit, and manage user accounts",
    addNewUser: "Add New User",
    editUser: "Edit User",
    createNewUser: "Create New User",
    fullName: "Full Name",
    enterFullName: "Enter full name",
    email: "Email",
    enterEmailAddress: "Enter email address",
    password: "Password",
    leaveEmptyToKeepCurrent: "leave empty to keep current",
    enterNewPassword: "Enter new password",
    enterPassword: "Enter password",
    role: "Role",
    updating: "Updating...",
    creating: "Creating...",
    updateUser: "Update User",
    createUser: "Create User",
    noUsersFound: "No users found",
    clickAddNewUserToCreate: 'Click "Add New User" to create the first user',
    user: "User",
    created: "Created",
    resetPassword: "Reset Password",
    userCreatedSuccessfully: "User created successfully!",
    error: "Error",
    errorCreatingUser: "Error creating user",
    userUpdatedSuccessfully: "User updated successfully!",
    errorUpdatingUser: "Error updating user",
    cannotDeleteOwnAccount: "You cannot delete your own account",
    confirmDeleteUser: "Are you sure you want to delete this user?",
    userDeletedSuccessfully: "User deleted successfully!",
    errorDeletingUser: "Error deleting user",
    passwordResetSuccessfully: "Password reset successfully!",
    errorResettingPassword: "Error resetting password",
    settingsSavedSuccessfully: "Settings saved successfully!",
    failedToSaveSettings: "Failed to save settings",
    errorSavingSettings: "Error saving settings",
    logoUploadedSuccessfully: "Logo uploaded successfully!",
    failedToUploadLogo: "Failed to upload logo",
    errorUploadingLogo: "Error uploading logo",
    logoDeletedSuccessfully: "Logo deleted successfully!",
    failedToDeleteLogo: "Failed to delete logo",
    errorDeletingLogo: "Error deleting logo",
  },

  id: {
    // Dashboard Layout
    dashboard: "Dasbor",
    items: "Barang",
    categories: "Kategori",
    sales: "Penjualan",
    createSale: "Buat Penjualan",
    settings: "Pengaturan",
    logout: "Keluar",
    auditLogs: "Log Audit",

    // Dashboard descriptions
    overviewAnalytics: "Ringkasan & Analitik",
    menuItems: "Item Menu",
    productGroups: "Grup Produk",
    posOrders: "POS & Pesanan",
    newTransaction: "Transaksi Baru",
    systemConfig: "Konfigurasi Sistem",

    // Common
    close: "Tutup",
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    edit: "Edit",
    add: "Tambah",
    search: "Cari",
    loading: "Memuat...",
    noData: "Tidak ada data",

    // Items page
    itemsManagement: "Manajemen Barang",
    manageInventoryItems: "Kelola barang inventaris dan tingkat stok Anda",
    addNewItem: "Tambah Barang Baru",
    itemsInventory: "Inventaris Barang",
    inventoryItems: "Barang Inventaris",
    itemsCount: "barang",
    salesRecords: "catatan penjualan",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Akhir",
    clear: "Bersihkan",
    item: "Barang",
    units: "unit",
    uncategorized: "Tidak Berkategori",
    noItemsAvailable: "Tidak ada barang tersedia",
    addItemsToSeeStock:
      "Tambahkan beberapa barang untuk melihat informasi stok detail.",
    editItem: "Edit Barang",
    emojiIcon: "Ikon Emoji",
    enterItemName: "Masukkan nama barang",
    optionalDescription: "Deskripsi opsional",
    emojiPlaceholder: "📦 (emoji opsional untuk identifikasi visual)",
    stockQuantity: "Jumlah Stok",
    selectCategory: "Pilih kategori",
    saving: "Menyimpan...",
    updateItem: "Perbarui Barang",
    addItem: "Tambah Barang",
    itemName: "Nama Barang",
    category: "Kategori",
    price: "Harga",
    stock: "Stok",
    description: "Deskripsi",
    image: "Gambar",
    createdDate: "Tanggal Dibuat",
    actions: "Aksi",

    // Categories page
    categoriesManagement: "Manajemen Kategori",
    organizeCategoriesDesc: "Atur dan kelola kategori produk Anda",
    addNewCategory: "Tambah Kategori Baru",
    productCategories: "Kategori Produk",
    categoryName: "Nama Kategori",
    enterCategoryName: "Masukkan nama kategori",
    addCategory: "Tambah Kategori",
    itemsInCategory: 'Barang dalam "{{categoryName}}"',
    noItemsFound: "Tidak ada barang ditemukan",
    categoryNoItems: "Kategori ini belum memiliki barang.",
    itemsIn: "Barang dalam",
    categoryDoesntHaveItems: "Kategori ini belum memiliki barang.",

    // Sales page
    salesManagement: "Manajemen Penjualan",
    salesHistory: "Riwayat Penjualan",
    viewManageSalesTransactions: "Lihat dan kelola semua transaksi penjualan",
    createNewSale: "Buat Penjualan Baru",
    totalSales: "Total Penjualan",
    totalRevenue: "Total Pendapatan",
    allTimeSales: "Penjualan Sepanjang Masa",
    thisWeekSales: "Penjualan Minggu Ini",
    thisMonthSales: "Penjualan Bulan Ini",
    thisYearSales: "Penjualan Tahun Ini",
    allTimeRevenue: "Pendapatan Sepanjang Masa",
    thisWeekRevenue: "Pendapatan Minggu Ini",
    thisMonthRevenue: "Pendapatan Bulan Ini",
    thisYearRevenue: "Pendapatan Tahun Ini",
    searchSalesPlaceholder: "Cari penjualan...",
    allTime: "Sepanjang Masa",
    thisWeek: "Minggu Ini",
    thisMonth: "Bulan Ini",
    thisYear: "Tahun Ini",
    dateRangeFilter: "Filter Rentang Tanggal",
    recentTransactions: "Transaksi Terbaru",
    of: "dari",
    transactions: "transaksi",
    noMatchingSalesFound: "Tidak ada penjualan yang cocok ditemukan",
    noSalesYet: "Belum ada penjualan",
    tryAdjustingSearchFilter:
      "Coba sesuaikan kriteria pencarian atau filter Anda",
    startMakingSales: "Mulai buat penjualan untuk melihat transaksi di sini",
    createFirstSale: "Buat Penjualan Pertama",
    dateTime: "Tanggal & Waktu",
    totalAmount: "Total Jumlah",
    cashier: "Kasir",
    moreItems: "item lainnya",
    viewDetails: "Lihat Detail",
    todaySales: "Penjualan Hari Ini",
    totalTransactions: "Total Transaksi",
    averageOrder: "Rata-rata Pesanan",

    // Stock Report
    stockReport: "Laporan Stok",
    totalItems: "Total Barang",
    lowStockItems: "Barang Stok Rendah",
    totalStockValue: "Total Nilai Stok",
    outOfStock: "Stok Habis",
    lowStockAlert: "Peringatan Stok Rendah",
    originStock: "Stok Awal",
    soldQuantity: "Jumlah Terjual",
    remainingStock: "Sisa Stok",
    unitPrice: "Harga Satuan",
    totalSalesValue: "Total Nilai Penjualan",

    // Status
    inStock: "Stok Tersedia",
    lowStock: "Stok Rendah",
    outOfStockStatus: "Stok Habis",
    status: "Status",
    completed: "Selesai",
    active: "Aktif",
    voided: "Dibatalkan",
    voidTransaction: "Batalkan Transaksi",
    voidTransactionConfirm: "Apakah Anda yakin ingin membatalkan transaksi ini? Tindakan ini tidak dapat dibatalkan.",
    transactionVoidedSuccessfully: "Transaksi berhasil dibatalkan",
    errorVoidingTransaction: "Kesalahan membatalkan transaksi",

    // Messages
    noSalesData: "Tidak ada data penjualan",
    noItemsData: "Tidak ada data barang",
    noCategoriesData: "Tidak ada data kategori",

    // Reports page
    salesReports: "Laporan Penjualan",
    viewSalesAnalytics: "Lihat analitik penjualan dan metrik kinerja",
    filters: "Filter",
    period: "Periode",
    today: "Hari Ini",
    customRange: "Rentang Kustom",
    paymentMethod: "Metode Pembayaran",
    allMethods: "Semua Metode",
    averageSale: "Rata-rata Penjualan",
    perTransaction: "Per transaksi",
    paymentMethods: "Metode Pembayaran",
    usedInPeriod: "Digunakan dalam periode",
    paymentMethodsBreakdown: "Rincian Metode Pembayaran",
    topSellingItems: "Barang Terlaris",
    unitsSold: "unit terjual",
    categoryPerformance: "Kinerja Kategori",
    recentSales: "Penjualan Terbaru",
    sale: "Penjualan",
    unknown: "Tidak Diketahui",
    noDataAvailable: "Tidak ada data tersedia untuk periode yang dipilih",

    // Dashboard specific keys
    realTimeInsights: "Wawasan real-time tentang kinerja bisnis Anda",
    todaysSales: "Penjualan Hari Ini",
    inInventory: "Dalam inventaris",
    itemsUnder10: "Barang di bawah 10",
    latestTransactions: "Transaksi terbaru",
    noRecentSales: "Tidak ada penjualan terbaru",
    salesWillAppearHere:
      "Penjualan akan muncul di sini setelah Anda mulai melakukan transaksi",
    bestPerformers: "Produk dengan kinerja terbaik bulan ini",
    sold: "Terjual",
    topSellingItemsWillAppearHere:
      "Barang terlaris akan muncul di sini setelah Anda memiliki penjualan",
    each: "masing-masing",

    // Payment methods
    cash: "Tunai",
    creditCard: "Kartu Kredit",
    debitCard: "Kartu Debit",

    // Sales create page - Order types
    dineIn: "Makan di Tempat",
    takeAway: "Bawa Pulang",
    tableService: "Layanan meja",
    toGo: "Untuk dibawa",
    order: "Pesanan",

    // Sales create page - Table selection
    tableSelection: "Pilih Meja",
    guests: "Tamu",
    activeTableSessions: "Sesi Meja Aktif",
    table: "Meja",
    available: "Tersedia",
    occupied: "Terisi",
    selectMenu: "Pilih Menu",
    noActiveTableSessions: "Tidak ada sesi meja aktif",
    pleaseSelectTableForDineIn:
      "Silakan pilih meja untuk pesanan makan di tempat",

    // Sales create page - Menu
    back: "Kembali",
    menu: "Menu",
    searchMenuItems: "Cari item menu...",

    // Sales create page - Order summary
    orderSummary: "Ringkasan Pesanan",
    noItemsInCart: "Tidak ada item di keranjang",
    addItemsFromMenu: "Tambahkan item dari menu untuk memulai",

    // Sales create page - Header
    pos: "POS",
    pointOfSaleSystem: "Sistem Point of Sale",
    backToSales: "Kembali ke Penjualan",
    orderType: "Jenis Pesanan",

    // Settings page
    systemSettings: "Pengaturan Sistem",
    configureSystemPreferences:
      "Konfigurasi preferensi dan pengaturan sistem Anda",
    generalSettings: "Pengaturan Umum",
    basicSystemConfiguration: "Konfigurasi dasar sistem dan preferensi",
    currencySettings: "Pengaturan Mata Uang",
    configureCurrencyAndTax:
      "Konfigurasi mata uang dan pengaturan pajak untuk bisnis Anda",
    taxEnabled: "Pajak Diaktifkan",
    enableTaxCalculation: "Aktifkan perhitungan pajak untuk penjualan",
    taxRate: "Tarif Pajak",
    taxName: "Nama Pajak",
    currencyCode: "Kode Mata Uang",
    currencySymbol: "Simbol Mata Uang",
    brandingConfiguration: "Konfigurasi Branding",
    customizeAppNameAndLogo: "Sesuaikan nama aplikasi dan logo Anda",
    applicationName: "Nama Aplikasi",
    logoManagement: "Manajemen Logo",
    uploadNewLogo: "Unggah Logo Baru",
    currentLogo: "Logo Saat Ini",
    deleteLogo: "Hapus Logo",
    noLogoUploaded: "Tidak ada logo yang diunggah",
    uploadLogoToCustomize:
      "Unggah logo untuk menyesuaikan branding aplikasi Anda",
    tableManagement: "Manajemen Meja",
    configureRestaurantTables:
      "Konfigurasi meja restoran dan pengaturan tempat duduk",
    numberOfTables: "Jumlah Meja",
    roleManagement: "Manajemen Peran",
    configurePermissionsForRoles:
      "Konfigurasi izin untuk berbagai peran pengguna",
    permissions: "Izin",
    admin: "Admin",
    resource: "Sumber Daya",
    view: "Lihat",
    create: "Buat",
    userManagement: "Manajemen Pengguna",
    createEditManageUsers: "Buat, edit, dan kelola akun pengguna",
    addNewUser: "Tambah Pengguna Baru",
    editUser: "Edit Pengguna",
    createNewUser: "Buat Pengguna Baru",
    fullName: "Nama Lengkap",
    enterFullName: "Masukkan nama lengkap",
    email: "Email",
    enterEmailAddress: "Masukkan alamat email",
    password: "Kata Sandi",
    leaveEmptyToKeepCurrent:
      "biarkan kosong untuk mempertahankan yang sekarang",
    enterNewPassword: "Masukkan kata sandi baru",
    enterPassword: "Masukkan kata sandi",
    role: "Peran",
    updating: "Memperbarui...",
    creating: "Membuat...",
    updateUser: "Perbarui Pengguna",
    createUser: "Buat Pengguna",
    noUsersFound: "Tidak ada pengguna ditemukan",
    clickAddNewUserToCreate:
      'Klik "Tambah Pengguna Baru" untuk membuat pengguna pertama',
    user: "Pengguna",
    created: "Dibuat",
    resetPassword: "Reset Kata Sandi",
    userCreatedSuccessfully: "Pengguna berhasil dibuat!",
    error: "Kesalahan",
    errorCreatingUser: "Kesalahan membuat pengguna",
    userUpdatedSuccessfully: "Pengguna berhasil diperbarui!",
    errorUpdatingUser: "Kesalahan memperbarui pengguna",
    cannotDeleteOwnAccount: "Anda tidak dapat menghapus akun Anda sendiri",
    confirmDeleteUser: "Apakah Anda yakin ingin menghapus pengguna ini?",
    userDeletedSuccessfully: "Pengguna berhasil dihapus!",
    errorDeletingUser: "Kesalahan menghapus pengguna",
    passwordResetSuccessfully: "Kata sandi berhasil direset!",
    errorResettingPassword: "Kesalahan mereset kata sandi",
    settingsSavedSuccessfully: "Pengaturan berhasil disimpan!",
    failedToSaveSettings: "Gagal menyimpan pengaturan",
    errorSavingSettings: "Kesalahan menyimpan pengaturan",
    logoUploadedSuccessfully: "Logo berhasil diunggah!",
    failedToUploadLogo: "Gagal mengunggah logo",
    errorUploadingLogo: "Kesalahan mengunggah logo",
    logoDeletedSuccessfully: "Logo berhasil dihapus!",
    failedToDeleteLogo: "Gagal menghapus logo",
    errorDeletingLogo: "Kesalahan menghapus logo",
  },
};

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("en");

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "id")) {
      setLocale(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", locale);
  }, [locale]);

  const switchLanguage = (newLocale) => {
    if (newLocale === "en" || newLocale === "id") {
      setLocale(newLocale);
    }
  };

  const t = (key, params = {}) => {
    let translation = translations[locale]?.[key] || key;

    // Handle parameter substitution for templates like "Items in {{categoryName}}"
    if (params && typeof translation === "string") {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  };

  const value = {
    locale,
    switchLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
