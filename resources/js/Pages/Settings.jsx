import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
    Settings as SettingsIcon,
    Save,
    Database,
    Bell,
    Shield,
    Palette,
    Clock,
    FileText,
    Download,
    Upload,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../Layouts/DashboardLayout";

const Settings = () => {
    const [settings, setSettings] = useState({
        // General Settings
        pharmacyName: "Mitra Toko Obat JGroup",
        pharmacyAddress: "Jl. Kesehatan No. 123, Jakarta",
        pharmacyPhone: "021-12345678",
        pharmacyEmail: "info@mitratoko.com",

        // Business Settings
        currency: "IDR",
        taxRate: 10,
        lowStockThreshold: 10,
        expiryAlertDays: 30,

        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        lowStockAlerts: true,
        expiryAlerts: true,
        dailyReports: true,

        // System Settings
        autoBackup: true,
        backupFrequency: "daily",
        sessionTimeout: 30,
        maxLoginAttempts: 3,

        // Receipt Settings
        printReceipts: true,
        receiptFooter: "Terima kasih atas kunjungan Anda!",
        showPharmacyLogo: true,
        showCustomerInfo: true,
    });

    const [isDirty, setIsDirty] = useState(false);

    const handleSettingChange = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        // Simulate saving settings
        setTimeout(() => {
            setIsDirty(false);
            toast.success("Settings saved successfully!");
        }, 1000);
    };

    const handleBackupDatabase = () => {
        // Simulate database backup
        const backupData = {
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            data: {
                settings,
                users: ["encrypted user data"],
                medicines: ["encrypted medicine data"],
                transactions: ["encrypted transaction data"],
            },
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pharmacy-backup-${
            new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Database backup created successfully!");
    };

    const handleRestoreDatabase = () => {
        // Create a file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backupData = JSON.parse(e.target.result);
                        // Simulate restore process
                        toast.success("Database restored successfully!");
                    } catch (error) {
                        toast.error("Invalid backup file format");
                    }
                };
                reader.readAsText(file);
            }
        };

        input.click();
    };

    const handleClearData = () => {
        if (
            window.confirm(
                "Are you sure you want to clear all data? This action cannot be undone!"
            )
        ) {
            toast.error("Data clearing cancelled for demo purposes");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="settings-title"
                        >
                            Settings
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Configure your pharmacy system preferences and
                            options
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700"
                        data-testid="save-settings-button"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* General Settings */}
                    <Card className="lg:col-span-2 p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <SettingsIcon className="w-5 h-5 mr-2 text-teal-600" />
                                General Settings
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Basic pharmacy information and configuration
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Pharmacy Information */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-4">
                                    Pharmacy Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="pharmacy-name">
                                            Pharmacy Name
                                        </Label>
                                        <Input
                                            id="pharmacy-name"
                                            value={settings.pharmacyName}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "pharmacyName",
                                                    e.target.value
                                                )
                                            }
                                            data-testid="pharmacy-name-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="pharmacy-phone">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="pharmacy-phone"
                                            value={settings.pharmacyPhone}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "pharmacyPhone",
                                                    e.target.value
                                                )
                                            }
                                            data-testid="pharmacy-phone-input"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="pharmacy-address">
                                            Address
                                        </Label>
                                        <Input
                                            id="pharmacy-address"
                                            value={settings.pharmacyAddress}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "pharmacyAddress",
                                                    e.target.value
                                                )
                                            }
                                            data-testid="pharmacy-address-input"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="pharmacy-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="pharmacy-email"
                                            type="email"
                                            value={settings.pharmacyEmail}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "pharmacyEmail",
                                                    e.target.value
                                                )
                                            }
                                            data-testid="pharmacy-email-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Business Settings */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-4">
                                    Business Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="currency">
                                            Currency
                                        </Label>
                                        <Select
                                            value={settings.currency}
                                            onValueChange={(value) =>
                                                handleSettingChange(
                                                    "currency",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger data-testid="currency-select">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IDR">
                                                    Indonesian Rupiah (IDR)
                                                </SelectItem>
                                                <SelectItem value="USD">
                                                    US Dollar (USD)
                                                </SelectItem>
                                                <SelectItem value="EUR">
                                                    Euro (EUR)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="tax-rate">
                                            Tax Rate (%)
                                        </Label>
                                        <Input
                                            id="tax-rate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={settings.taxRate}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "taxRate",
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            data-testid="tax-rate-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="low-stock-threshold">
                                            Low Stock Threshold
                                        </Label>
                                        <Input
                                            id="low-stock-threshold"
                                            type="number"
                                            min="1"
                                            value={settings.lowStockThreshold}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "lowStockThreshold",
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            data-testid="low-stock-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="expiry-alert-days">
                                            Expiry Alert (Days)
                                        </Label>
                                        <Input
                                            id="expiry-alert-days"
                                            type="number"
                                            min="1"
                                            value={settings.expiryAlertDays}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "expiryAlertDays",
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            data-testid="expiry-alert-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Receipt Settings */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-4">
                                    Receipt Settings
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>
                                                Print Receipts Automatically
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Automatically print receipts
                                                after each transaction
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.printReceipts}
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "printReceipts",
                                                    checked
                                                )
                                            }
                                            data-testid="print-receipts-switch"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Show Pharmacy Logo</Label>
                                            <p className="text-sm text-gray-600">
                                                Display pharmacy logo on
                                                receipts
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.showPharmacyLogo}
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "showPharmacyLogo",
                                                    checked
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Show Customer Info</Label>
                                            <p className="text-sm text-gray-600">
                                                Include customer information on
                                                receipts
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.showCustomerInfo}
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "showCustomerInfo",
                                                    checked
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="receipt-footer">
                                            Receipt Footer Message
                                        </Label>
                                        <Input
                                            id="receipt-footer"
                                            value={settings.receiptFooter}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "receiptFooter",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Thank you message"
                                            data-testid="receipt-footer-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* System Settings */}
                    <div className="space-y-6">
                        {/* Notifications */}
                        <Card className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-teal-600" />
                                    Notifications
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email Notifications</Label>
                                        <p className="text-xs text-gray-600">
                                            Send alerts via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "emailNotifications",
                                                checked
                                            )
                                        }
                                        data-testid="email-notifications-switch"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>SMS Notifications</Label>
                                        <p className="text-xs text-gray-600">
                                            Send alerts via SMS
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.smsNotifications}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "smsNotifications",
                                                checked
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Low Stock Alerts</Label>
                                        <p className="text-xs text-gray-600">
                                            Alert when stock is low
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.lowStockAlerts}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "lowStockAlerts",
                                                checked
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Expiry Alerts</Label>
                                        <p className="text-xs text-gray-600">
                                            Alert for expiring medicines
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.expiryAlerts}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "expiryAlerts",
                                                checked
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Daily Reports</Label>
                                        <p className="text-xs text-gray-600">
                                            Send daily sales reports
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.dailyReports}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "dailyReports",
                                                checked
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Security */}
                        <Card className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-teal-600" />
                                    Security
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="session-timeout">
                                        Session Timeout (minutes)
                                    </Label>
                                    <Input
                                        id="session-timeout"
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={settings.sessionTimeout}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "sessionTimeout",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        data-testid="session-timeout-input"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="max-login-attempts">
                                        Max Login Attempts
                                    </Label>
                                    <Input
                                        id="max-login-attempts"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={settings.maxLoginAttempts}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "maxLoginAttempts",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        data-testid="max-login-input"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Backup & Restore */}
                        <Card className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Database className="w-5 h-5 mr-2 text-teal-600" />
                                    Backup & Restore
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Auto Backup</Label>
                                        <p className="text-xs text-gray-600">
                                            Automatic database backup
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.autoBackup}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                "autoBackup",
                                                checked
                                            )
                                        }
                                        data-testid="auto-backup-switch"
                                    />
                                </div>

                                {settings.autoBackup && (
                                    <div>
                                        <Label>Backup Frequency</Label>
                                        <Select
                                            value={settings.backupFrequency}
                                            onValueChange={(value) =>
                                                handleSettingChange(
                                                    "backupFrequency",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger data-testid="backup-frequency-select">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">
                                                    Daily
                                                </SelectItem>
                                                <SelectItem value="weekly">
                                                    Weekly
                                                </SelectItem>
                                                <SelectItem value="monthly">
                                                    Monthly
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Button
                                        onClick={handleBackupDatabase}
                                        variant="outline"
                                        className="w-full"
                                        data-testid="backup-database-button"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Backup Database
                                    </Button>
                                    <Button
                                        onClick={handleRestoreDatabase}
                                        variant="outline"
                                        className="w-full"
                                        data-testid="restore-database-button"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Restore Database
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="p-6 border-red-200">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-red-900 flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                                    Danger Zone
                                </h3>
                                <p className="text-sm text-red-600 mt-1">
                                    Irreversible and destructive actions
                                </p>
                            </div>
                            <Button
                                onClick={handleClearData}
                                variant="outline"
                                className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                data-testid="clear-data-button"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Data
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
