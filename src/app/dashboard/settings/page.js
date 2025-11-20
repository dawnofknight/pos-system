"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { useRBAC, withPermission } from "@/contexts/RBACContext";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeaderCell,
  LoadingSpinner,
} from "@/components/ui";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { hasPermission } = useRBAC();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General Settings
  const [settings, setSettings] = useState({
    currency: "IDR",
    currencySymbol: "Rp",
    taxEnabled: false,
    taxRate: 0,
    taxName: "Tax",
    tableCount: 6,
    appName: "POS System Restaurant Management",
    logoPath: null,
  });

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Table Form
  const [tableForm, setTableForm] = useState({
    name: "",
    capacity: 4,
  });
  const [editingTable, setEditingTable] = useState(null);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Role Permissions
  const [rolePermissions, setRolePermissions] = useState([]);

  // User Management
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
  });

  const tabs = [
    { id: "general", name: t("general"), icon: "⚙️" },
    { id: "payments", name: t("paymentMethods"), icon: "💳" },
    { id: "tables", name: t("tableManagement"), icon: "🍽️" },
    ...(hasPermission("settings", "edit") && user?.role === "ADMIN"
      ? [
          { id: "roles", name: t("roleManagement"), icon: "👥" },
          { id: "users", name: t("userManagement"), icon: "👤" },
        ]
      : []),
  ];

  const resources = [
    {
      id: "dashboard",
      name: t("dashboard"),
      description: t("dashboardDescription"),
    },
    { id: "items", name: t("items"), description: t("itemsDescription") },
    { id: "sales", name: t("sales"), description: t("salesDescription") },
    {
      id: "categories",
      name: t("categories"),
      description: t("categoriesDescription"),
    },
    { id: "tables", name: t("tables"), description: t("tablesDescription") },
    { id: "users", name: t("users"), description: t("usersDescription") },
    {
      id: "settings",
      name: t("settings"),
      description: t("settingsDescription"),
    },
  ];

  useEffect(() => {
    fetchSettings();
    fetchPaymentMethods();
    if (user?.role === "ADMIN") {
      fetchRolePermissions();
      fetchUsers();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/settings/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const response = await fetch("/api/settings/roles");
      if (response.ok) {
        const data = await response.json();
        setRolePermissions(data);
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        alert(t("userCreatedSuccessfully"));
        setUserForm({ name: "", email: "", password: "", role: "CASHIER" });
        setShowUserForm(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`${t("error")}: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert(t("errorCreatingUser"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = { ...userForm };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert(t("userUpdatedSuccessfully"));
        setUserForm({ name: "", email: "", password: "", role: "CASHIER" });
        setEditingUser(null);
        setShowUserForm(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`${t("error")}: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(t("errorUpdatingUser"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      alert(t("cannotDeleteOwnAccount"));
      return;
    }

    if (!confirm(t("confirmDeleteUser"))) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(t("userDeletedSuccessfully"));
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`${t("error")}: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(t("errorDeletingUser"));
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt(t("enterNewPassword"));
    if (!newPassword) return;

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert(t("passwordResetSuccessfully"));
      } else {
        const error = await response.json();
        alert(`${t("error")}: ${error.error}`);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert(t("errorResettingPassword"));
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowUserForm(true);
  };

  const cancelUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: "CASHIER" });
  };

  const saveGeneralSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert(t("settingsSavedSuccessfully"));
      } else {
        alert(t("failedToSaveSettings"));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(t("errorSavingSettings"));
    } finally {
      setSaving(false);
    }
  };

  // Logo upload handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await fetch("/api/settings/logo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings((s) => ({ ...s, logoPath: data.logoPath }));
        setLogoFile(null);
        setLogoPreview(null);
        alert(t("logoUploadedSuccessfully"));
      } else {
        const error = await response.json();
        alert(error.error || t("failedToUploadLogo"));
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert(t("errorUploadingLogo"));
    } finally {
      setUploadingLogo(false);
    }
  };

  const deleteLogo = async () => {
    if (!settings.logoPath) return;

    try {
      const response = await fetch("/api/settings/logo", {
        method: "DELETE",
      });

      if (response.ok) {
        setSettings((s) => ({ ...s, logoPath: null }));
        alert(t("logoDeletedSuccessfully"));
      } else {
        alert(t("failedToDeleteLogo"));
      }
    } catch (error) {
      console.error("Error deleting logo:", error);
      alert(t("errorDeletingLogo"));
    }
  };

  // Table Management
  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const fetchTables = async () => {
    setIsLoadingTables(true);
    try {
      const response = await fetch("/api/tables");
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const createTable = async (tableData) => {
    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
      });

      if (response.ok) {
        fetchTables();
      } else {
        const error = await response.json();
        console.error("Error creating table:", error);
      }
    } catch (error) {
      console.error("Error creating table:", error);
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
      });

      if (response.ok) {
        fetchTables();
      } else {
        const error = await response.json();
        console.error("Error updating table:", error);
      }
    } catch (error) {
      console.error("Error updating table:", error);
    }
  };

  const deleteTable = async (id) => {
    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTables();
      } else {
        const error = await response.json();
        console.error("Error deleting table:", error);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "tables") {
      fetchTables();
    }
  }, [activeTab]);

  const togglePaymentMethod = async (methodId, enabled) => {
    try {
      const response = await fetch(
        `/api/settings/payment-methods/${methodId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        }
      );

      if (response.ok) {
        setPaymentMethods((methods) =>
          methods.map((method) =>
            method.id === methodId ? { ...method, enabled } : method
          )
        );
      }
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
  };

  const updateRolePermission = async (
    role,
    resource,
    permissionType,
    value
  ) => {
    try {
      const response = await fetch("/api/settings/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          resource,
          [permissionType]: value,
        }),
      });

      if (response.ok) {
        fetchRolePermissions();
      }
    } catch (error) {
      console.error("Error updating role permission:", error);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className='space-y-6'>
            {/* Header Skeleton */}
            <div className='space-y-2'>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse'></div>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-64 animate-pulse'></div>
            </div>

            {/* Tab Navigation Skeleton */}
            <div className='border-b transition-colors border-gray-200 dark:border-gray-700'>
              <nav className='-mb-px flex space-x-8'>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className='flex items-center gap-2 py-2 px-1'
                  >
                    <div className='h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                    <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse'></div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Content Skeleton */}
            <div className='space-y-6'>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className='space-y-6'>
          <div>
            <h1 className='text-2xl font-bold transition-colors text-gray-900 dark:text-white'>
              {t("settings")}
            </h1>
            <p className='transition-colors text-gray-600 dark:text-gray-400'>
              {t("manageSystemConfiguration")}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className='border-b transition-colors border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* General Settings Tab */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold transition-colors text-gray-900 dark:text-white'>
                  {t("generalSettings")}
                </h2>
                <p className='text-sm transition-colors text-gray-600 dark:text-gray-400'>
                  {t("configureCurrencyAndTax")}
                </p>
              </CardHeader>
              <CardBody>
                <div className='space-y-6'>
                  {/* Currency Settings */}
                  <div>
                    <h3 className='text-md font-medium mb-4 transition-colors text-gray-900 dark:text-white'>
                      {t("currency")}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Input
                        label={t("currencyCode")}
                        value={settings.currency}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            currency: e.target.value,
                          }))
                        }
                        placeholder='USD'
                      />
                      <Input
                        label={t("currencySymbol")}
                        value={settings.currencySymbol}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            currencySymbol: e.target.value,
                          }))
                        }
                        placeholder='$'
                      />
                    </div>
                  </div>

                  {/* Branding Settings */}
                  <div className='border-t pt-6'>
                    <div className='mb-4'>
                      <h3 className='text-md font-medium transition-colors text-gray-900'>
                        {t("brandingConfiguration")}
                      </h3>
                      <p className='text-sm transition-colors text-gray-600'>
                        {t("customizeAppNameAndLogo")}
                      </p>
                    </div>

                    <div className='grid grid-cols-1 gap-4'>
                      <Input
                        label={t("applicationName")}
                        value={settings.appName}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            appName: e.target.value,
                          }))
                        }
                        placeholder='POS System Restaurant Management'
                      />

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {t("logo")}
                        </label>

                        {/* Current Logo Display */}
                        {settings.logoPath && (
                          <div className='mb-4'>
                            <img
                              src={settings.logoPath}
                              alt={t("currentLogo")}
                              className='h-16 w-auto object-contain border rounded'
                            />
                            <Button
                              onClick={deleteLogo}
                              className='mt-2 text-sm bg-red-600 hover:bg-red-700 text-white'
                            >
                              {t("deleteLogo")}
                            </Button>
                          </div>
                        )}

                        {/* Logo Upload */}
                        <div className='flex items-center gap-4'>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={handleLogoChange}
                            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100'
                          />
                          {logoFile && (
                            <Button
                              onClick={uploadLogo}
                              disabled={uploadingLogo}
                              className='bg-orange-600 hover:bg-orange-700 text-white'
                            >
                              {uploadingLogo ? t("uploading") : t("upload")}
                            </Button>
                          )}
                        </div>

                        {/* Logo Preview */}
                        {logoPreview && (
                          <div className='mt-4'>
                            <p className='text-sm text-gray-600 mb-2'>
                              {t("preview")}:
                            </p>
                            <img
                              src={logoPreview}
                              alt={t("logoPreview")}
                              className='h-16 w-auto object-contain border rounded'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tax Settings */}
                  <div className='border-t pt-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <h3 className='text-md font-medium transition-colors text-gray-900'>
                          {t("taxConfiguration")}
                        </h3>
                        <p className='text-sm transition-colors text-gray-600'>
                          {t("enableAndConfigureTax")}
                        </p>
                      </div>
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={settings.taxEnabled}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              taxEnabled: e.target.checked,
                            }))
                          }
                          className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-100"></div>
                      </label>
                    </div>

                    {settings.taxEnabled && (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Input
                          label={t("taxName")}
                          value={settings.taxName}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              taxName: e.target.value,
                            }))
                          }
                          placeholder={t("tax")}
                        />
                        <Input
                          label={t("taxRatePercent")}
                          type='number'
                          step='0.01'
                          min='0'
                          max='100'
                          value={settings.taxRate}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              taxRate: parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder='0.00'
                        />
                      </div>
                    )}
                  </div>

                  <div className='flex justify-end'>
                    <Button
                      onClick={saveGeneralSettings}
                      disabled={saving}
                      className='flex items-center gap-2'
                    >
                      {saving && <LoadingSpinner size='sm' />}
                      {t("saveSettings")}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "payments" && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold transition-colors text-gray-900'>
                  {t("paymentMethods")}
                </h2>
                <p className='text-sm transition-colors text-gray-600'>
                  {t("configurePaymentOptions")}
                </p>
              </CardHeader>
              <CardBody>
                <div className='space-y-4'>
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className='flex items-center justify-between p-4 rounded-lg transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-2xl text-gray-700'>
                          {method.name === "Cash"
                            ? "💵"
                            : method.name === "Transfer"
                            ? "🏦"
                            : method.name === "Debit"
                            ? "💳"
                            : "💰"}
                        </span>
                        <div>
                          <h4
                            className='font-medium transition-colors'
                            style={{ color: "var(--foreground)" }}
                          >
                            {t(method.name.toLowerCase())}
                          </h4>
                          <p
                            className='text-sm transition-colors'
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {method.enabled
                              ? t("availableForTransactions")
                              : t("disabled")}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={method.enabled ? "warning" : "secondary"}
                        >
                          {method.enabled ? t("enabled") : t("disabled")}
                        </Badge>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={method.enabled}
                            onChange={(e) =>
                              togglePaymentMethod(method.id, e.target.checked)
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-100"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Table Management Tab */}
          {activeTab === "tables" && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold transition-colors text-gray-900 dark:text-white'>
                  {t("tableManagement")}
                </h2>
                <p className='text-sm transition-colors text-gray-600 dark:text-gray-400'>
                  {t("configureRestaurantTables")}
                </p>
              </CardHeader>
              <CardBody>
                <div className='space-y-6'>
                  {/* Table Count Setting */}
                  <div>
                    <h3 className='text-md font-medium mb-4 transition-colors text-gray-900 dark:text-white'>
                      {t("tableConfiguration")}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                      <Input
                        type='number'
                        label={t("numberOfTables")}
                        value={settings.tableCount}
                        min={1}
                        max={50}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            tableCount: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                      <div className='flex items-end'>
                        <Button
                          onClick={saveGeneralSettings}
                          disabled={saving}
                        >
                          {saving ? t("saving") : t("saveTableCount")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Table List */}
                  <div>
                    <div className='flex justify-between items-center mb-4'>
                      <h3 className='text-md font-medium transition-colors text-gray-900 dark:text-white'>
                        {t("tables")}
                      </h3>
                      <Button
                        onClick={() => {
                          setEditingTable(null);
                          setTableForm({ name: "", capacity: 4 });
                          document.getElementById("tableFormModal").showModal();
                        }}
                      >
                        {t("addTable")}
                      </Button>
                    </div>

                    {isLoadingTables ? (
                      <div className='flex justify-center py-8'>
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>{t("name")}</TableHeaderCell>
                            <TableHeaderCell>{t("capacity")}</TableHeaderCell>
                            <TableHeaderCell>{t("status")}</TableHeaderCell>
                            <TableHeaderCell>{t("actions")}</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tables.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className='text-center py-8'
                              >
                                {t("noTablesFound")}
                              </TableCell>
                            </TableRow>
                          ) : (
                            tables.map((table) => (
                              <TableRow key={table.id}>
                                <TableCell>{table.name}</TableCell>
                                <TableCell>{table.capacity}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      table.status === "available"
                                        ? "success"
                                        : table.status === "occupied"
                                        ? "danger"
                                        : "warning"
                                    }
                                  >
                                    {t(table.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className='flex space-x-2'>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() => {
                                        setEditingTable(table);
                                        setTableForm({
                                          name: table.name,
                                          capacity: table.capacity,
                                        });
                                        document
                                          .getElementById("tableFormModal")
                                          .showModal();
                                      }}
                                    >
                                      {t("edit")}
                                    </Button>
                                    <Button
                                      size='sm'
                                      variant='danger'
                                      onClick={() =>
                                        document
                                          .getElementById(
                                            `deleteTableConfirm-${table.id}`
                                          )
                                          .showModal()
                                      }
                                    >
                                      {t("delete")}
                                    </Button>

                                    {/* Delete Confirmation Dialog */}
                                    <dialog
                                      id={`deleteTableConfirm-${table.id}`}
                                      className='modal'
                                    >
                                      <div className='modal-box'>
                                        <h3 className='font-bold text-lg'>
                                          {t("confirmDeletion")}
                                        </h3>
                                        <p className='py-4'>
                                          {t("areYouSureDeleteTable")}{" "}
                                          {table.name}?
                                        </p>
                                        <div className='modal-action'>
                                          <form method='dialog'>
                                            <div className='flex space-x-2'>
                                              <Button
                                                variant='outline'
                                                onClick={() =>
                                                  document
                                                    .getElementById(
                                                      `deleteTableConfirm-${table.id}`
                                                    )
                                                    .close()
                                                }
                                              >
                                                {t("cancel")}
                                              </Button>
                                              <Button
                                                variant='danger'
                                                onClick={() => {
                                                  document
                                                    .getElementById(
                                                      `deleteTableConfirm-${table.id}`
                                                    )
                                                    .close();
                                                  deleteTable(table.id);
                                                }}
                                              >
                                                {t("delete")}
                                              </Button>
                                            </div>
                                          </form>
                                        </div>
                                      </div>
                                    </dialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Table Form Modal */}
          <dialog
            id='tableFormModal'
            className='modal'
          >
            <div className='modal-box rounded-2xl shadow-2xl border border-orange-100 dark:border-orange-800/30 p-0 overflow-hidden'>
              <div className='flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border-b border-orange-200/30 dark:border-orange-700/30'>
                <div className='p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md'>
                  <span className='text-white text-lg'>
                    {editingTable ? "✏️" : "➕"}
                  </span>
                </div>
                <h3 className='text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent'>
                  {editingTable ? t("editTable") : t("addNewTable")}
                </h3>
              </div>
              <form className='space-y-4 p-6'>
                <Input
                  label={t("tableName")}
                  value={tableForm.name}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, name: e.target.value })
                  }
                  placeholder='e.g., Table 1'
                  required
                  icon='🏷️'
                  className='bg-orange-50/50 border-orange-200 focus:border-orange-400 rounded-xl transition-all duration-300'
                />
                <Input
                  type='number'
                  label={t("capacity")}
                  value={tableForm.capacity}
                  onChange={(e) =>
                    setTableForm({
                      ...tableForm,
                      capacity: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  max={20}
                  required
                  icon='👥'
                  className='bg-orange-50/50 border-orange-200 focus:border-orange-400 rounded-xl transition-all duration-300'
                />
                <div className='flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
                  <Button
                    variant='outline'
                    onClick={() =>
                      document.getElementById("tableFormModal").close()
                    }
                    icon='❌'
                    className='flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200'
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!tableForm.name) return;

                      if (editingTable) {
                        updateTable(editingTable.id, tableForm);
                      } else {
                        createTable(tableForm);
                      }

                      document.getElementById("tableFormModal").close();
                    }}
                    icon={editingTable ? "✏️" : "✅"}
                    className='flex-1 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  >
                    {editingTable ? t("update") : t("create")}
                  </Button>
                </div>
              </form>
            </div>
          </dialog>

          {/* Role Management Tab */}
          {activeTab === "roles" && user?.role === "ADMIN" && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold transition-colors text-gray-900'>
                  {t("roleManagement")}
                </h2>
                <p className='text-sm transition-colors text-gray-600'>
                  {t("configurePermissionsForRoles")}
                </p>
              </CardHeader>
              <CardBody>
                <div className='space-y-6'>
                  {["ADMIN", "CASHIER"].map((role) => (
                    <div
                      key={role}
                      className='space-y-4'
                    >
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={role === "ADMIN" ? "primary" : "secondary"}
                        >
                          {role}
                        </Badge>
                        <span className='text-lg font-medium transition-colors text-gray-900'>
                          {t(role.toLowerCase())} {t("permissions")}
                        </span>
                      </div>

                      <div className='overflow-x-auto'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell>{t("resource")}</TableHeaderCell>
                              <TableHeaderCell>{t("view")}</TableHeaderCell>
                              <TableHeaderCell>{t("create")}</TableHeaderCell>
                              <TableHeaderCell>{t("edit")}</TableHeaderCell>
                              <TableHeaderCell>{t("delete")}</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resources.map((resource) => {
                              const permission = rolePermissions.find(
                                (p) =>
                                  p.role === role && p.resource === resource.id
                              );
                              return (
                                <TableRow key={resource.id}>
                                  <TableCell>
                                    <div>
                                      <div className='font-medium transition-colors text-gray-900'>
                                        {resource.name}
                                      </div>
                                      <div className='text-sm transition-colors text-gray-600'>
                                        {resource.description}
                                      </div>
                                    </div>
                                  </TableCell>
                                  {[
                                    "canView",
                                    "canCreate",
                                    "canEdit",
                                    "canDelete",
                                  ].map((permType) => (
                                    <TableCell key={permType}>
                                      <input
                                        type='checkbox'
                                        checked={
                                          permission?.[permType] || false
                                        }
                                        onChange={(e) =>
                                          updateRolePermission(
                                            role,
                                            resource.id,
                                            permType,
                                            e.target.checked
                                          )
                                        }
                                        className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                                        disabled={
                                          role === "ADMIN" &&
                                          resource.id === "settings"
                                        } // Admin always has settings access
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* User Management Tab (Admin Only) */}
          {activeTab === "users" && user?.role === "ADMIN" && (
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <h2 className='text-lg font-semibold'>
                      {t("userManagement")}
                    </h2>
                    <p className='text-sm text-gray-600'>
                      {t("createEditManageUsers")}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowUserForm(true)}
                    variant='primary'
                  >
                    {t("addNewUser")}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {/* User Form Modal */}
                {showUserForm && (
                  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md transition-colors'>
                      <h3 className='text-lg font-semibold mb-4 transition-colors text-gray-900'>
                        {editingUser ? t("editUser") : t("createNewUser")}
                      </h3>
                      <form
                        onSubmit={
                          editingUser ? handleUpdateUser : handleCreateUser
                        }
                      >
                        <div className='space-y-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              {t("fullName")}
                            </label>
                            <Input
                              type='text'
                              value={userForm.name}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  name: e.target.value,
                                })
                              }
                              required
                              placeholder={t("enterFullName")}
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              {t("email")}
                            </label>
                            <Input
                              type='email'
                              value={userForm.email}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  email: e.target.value,
                                })
                              }
                              required
                              placeholder={t("enterEmailAddress")}
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              {t("password")}{" "}
                              {editingUser &&
                                `(${t("leaveEmptyToKeepCurrent")})`}
                            </label>
                            <Input
                              type='password'
                              value={userForm.password}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  password: e.target.value,
                                })
                              }
                              required={!editingUser}
                              placeholder={
                                editingUser
                                  ? t("enterNewPassword")
                                  : t("enterPassword")
                              }
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              {t("role")}
                            </label>
                            <select
                              value={userForm.role}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  role: e.target.value,
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500'
                              required
                            >
                              <option value='CASHIER'>{t("cashier")}</option>
                              <option value='ADMIN'>{t("admin")}</option>
                            </select>
                          </div>
                        </div>
                        <div className='flex gap-2 mt-6'>
                          <Button
                            type='submit'
                            variant='primary'
                            disabled={saving}
                            className='flex-1'
                          >
                            {saving ? (
                              <div className='flex items-center space-x-2'>
                                <LoadingSpinner size='sm' />
                                <span>
                                  {editingUser ? t("updating") : t("creating")}
                                </span>
                              </div>
                            ) : editingUser ? (
                              t("updateUser")
                            ) : (
                              t("createUser")
                            )}
                          </Button>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={cancelUserForm}
                            className='flex-1'
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Users List */}
                <div className='space-y-4'>
                  {users.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='text-4xl mb-2'>👥</div>
                      <p>{t("noUsersFound")}</p>
                      <p className='text-sm'>{t("clickAddNewUserToCreate")}</p>
                    </div>
                  ) : (
                    <div className='overflow-x-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>{t("user")}</TableHeaderCell>
                            <TableHeaderCell>{t("role")}</TableHeaderCell>
                            <TableHeaderCell>{t("created")}</TableHeaderCell>
                            <TableHeaderCell>{t("actions")}</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell>
                                <div>
                                  <div className='font-medium text-gray-900'>
                                    {u.name}
                                  </div>
                                  <div className='text-sm text-gray-600'>
                                    {u.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    u.role === "ADMIN" ? "primary" : "secondary"
                                  }
                                >
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-sm text-gray-600'>
                                {new Date(u.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center justify-center space-x-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => startEditUser(u)}
                                  >
                                    {t("edit")}
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => handleResetPassword(u.id)}
                                    className='text-orange-600 hover:text-orange-700'
                                  >
                                    {t("resetPassword")}
                                  </Button>
                                  {u.id !== user.id && (
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() => handleDeleteUser(u.id)}
                                    >
                                      {t("delete")}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
