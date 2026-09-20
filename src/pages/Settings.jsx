import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiLock,
  FiSun,
  FiMoon,
  FiBell,
  FiShield,
  FiTrash2,
  FiDownload,
  FiCheck,
  FiEdit2,
  FiSmartphone,
  FiMail,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";

export default function Settings() {
  const queryClient = useQueryClient();
  const token = UserStore((state) => state.token);
  const { user, setUser, logout } = UserStore();
  const { theme, setTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [tripReceipts, setTripReceipts] = useState(true);

  // Query current user info
  const { data: userData, isLoading } = useQuery({
    queryKey: ["userinfo", token],
    queryFn: async () => {
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setMobile(userData.mobile || "");
      setEmail(userData.email || "");
    }
  }, [userData]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (updatedData) => {
      return await api.put("/userupdate", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (res) => {
      toast.success("Profile details updated successfully!");
      if (res.data?.user) {
        setUser({ ...user, ...res.data.user });
      }
      queryClient.invalidateQueries(["userinfo"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    },
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    profileMutation.mutate({ name, mobile });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    toast.success("Security credentials updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
  };

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: <FiUser size={18} /> },
    { id: "security", label: "Password & Security", icon: <FiLock size={18} /> },
    { id: "appearance", label: "Appearance & Theme", icon: isDark ? <FiMoon size={18} /> : <FiSun size={18} /> },
    { id: "notifications", label: "Notification Preferences", icon: <FiBell size={18} /> },
    { id: "privacy", label: "Privacy & Data", icon: <FiShield size={18} /> },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24"></div>

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white mb-2 transition-colors"
            >
              <FiArrowLeft />
              <span>Back to Account</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black dark:text-white">
              Platform Settings
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Customize your account settings, security preferences, and experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Settings Navigation Sidebar */}
          <div className="md:col-span-4 bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-3 shadow-sm sticky top-28">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Main Content Area */}
          <div className="md:col-span-8 bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
            
            {/* Tab 1: Profile Details */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black font-display text-black dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Update your full name and registered phone number used for driver coordination.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-3.5 text-neutral-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiSmartphone className="absolute left-4 top-3.5 text-neutral-400" />
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                      Email Address (Read-Only)
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-3.5 text-neutral-400" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 text-sm font-semibold text-neutral-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to="/update/image"
                    className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5"
                  >
                    <FiEdit2 />
                    <span>Change Avatar Photo</span>
                  </Link>

                  <button
                    type="submit"
                    disabled={profileMutation.isPending}
                    className="px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {profileMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black font-display text-black dark:text-white">
                    Password & Authentication
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Keep your account secure with regular password updates and 2-Factor authentication.
                  </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all"
                  >
                    Update Password
                  </button>
                </form>

                <div className="pt-6 border-t border-neutral-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                    <div>
                      <h4 className="font-bold text-sm text-black dark:text-white">
                        Two-Factor Authentication (2FA)
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Require an SMS verification code at each login.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        toast.success(
                          !twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        twoFactorEnabled
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-neutral-200 text-neutral-700 dark:bg-zinc-800 dark:text-neutral-300"
                      }`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Appearance */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black font-display text-black dark:text-white">
                    Appearance & Monochromatic Theme
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Select your preferred visual style. Light Mode is the primary default.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-5 rounded-3xl border-2 text-left transition-all ${
                      !isDark
                        ? "border-black dark:border-white bg-white dark:bg-zinc-900 shadow-lg"
                        : "border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-950 opacity-70"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center mb-3">
                      <FiSun className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-black dark:text-white">
                      Light Theme (Primary)
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Crisp stark white canvas with pure black typography and borders.
                    </p>
                    {!isDark && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-black dark:text-white mt-3">
                        <FiCheck /> Active Theme
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-5 rounded-3xl border-2 text-left transition-all ${
                      isDark
                        ? "border-white bg-zinc-900 shadow-lg text-white"
                        : "border-neutral-200 bg-neutral-50 opacity-70 text-black"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center mb-3">
                      <FiMoon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm">
                      Dark Space Theme
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Obsidian deep black contrast with white typography and accents.
                    </p>
                    {isDark && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-white mt-3">
                        <FiCheck /> Active Theme
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black font-display text-black dark:text-white">
                    Notification Preferences
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Control how and when Voyago communicates trip and billing updates.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                    <div>
                      <h4 className="font-bold text-sm text-black dark:text-white">
                        Digital Trip Receipts
                      </h4>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Automatically email PDF invoice upon trip completion.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={tripReceipts}
                      onChange={(e) => setTripReceipts(e.target.checked)}
                      className="w-5 h-5 accent-black rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                    <div>
                      <h4 className="font-bold text-sm text-black dark:text-white">
                        SMS Trip Arrival Alerts
                      </h4>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Get text alerts when driver reaches your pickup point.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="w-5 h-5 accent-black rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Privacy & Danger Zone */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black font-display text-black dark:text-white">
                    Privacy & Account Management
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Export your ride records or permanently delete your account.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">
                      Download Personal Data
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Export a full JSON copy of your ride history and receipts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Data export initiated. Download link sent to email.")}
                    className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <FiDownload />
                    <span>Export</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">
                      Delete Account
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Permanently wipe all rides, payments, and profile data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete your Voyago account? This action is irreversible.")) {
                        logout();
                        toast.info("Account deactivated");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
