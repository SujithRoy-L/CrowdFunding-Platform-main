import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  Users,
  Save,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  DollarSign,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Flex } from "../../components/ui";
import useAuthStore from "../../store/authStore";
import AdminLayout from "../../components/AdminLayout";

const Section = styled(motion.div)`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: #191919;
  margin-bottom: 0.25rem;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const SectionDesc = styled.p`
  font-size: 0.85rem;
  color: #86868b;
  font-weight: 500;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #191919;
    margin-bottom: 0.3rem;
  }
  p {
    font-size: 0.85rem;
    color: #86868b;
    font-weight: 500;
  }
`;

const Toggle = styled.button`
  width: 52px;
  height: 28px;
  border-radius: 99px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: ${(p) => (p.$on ? "#34c759" : "rgba(0, 0, 0, 0.1)")};
  box-shadow: none;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${(p) => (p.$on ? "27px" : "3px")};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
`;

const InputField = styled.input`
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #191919;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
  width: ${(p) => p.$w || "220px"};
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: #191919;
    background: #ffffff;
  }
  &::placeholder {
    color: #86868b;
    font-weight: 500;
  }
`;

const SelectField = styled.select`
  padding: 0.75rem 2.25rem 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #191919;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;

  &:focus {
    border-color: #191919;
    background-color: #ffffff;
  }
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  background: #191919;
  border: none;
  border-radius: 99px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.025);
  }

  &:active {
    transform: scale(0.965);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AdminSettings = () => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    platformName: "StartupFund",
    autoApprove: false,
    requireVerification: true,
    allowPublicProfiles: true,
    maxInvestmentAmount: 1000000,
    minInvestmentAmount: 1000,
    defaultEquityCap: 25,
    maintenanceMode: false,
    emailNotifications: true,
    investmentAlerts: true,
    newUserAlerts: true,
    reportAlerts: true,
    defaultCurrency: "INR",
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    adminPassword: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("adminPlatformSettings");
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {}
    }
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = { ...settings };
      delete toSave.adminPassword;
      localStorage.setItem("adminPlatformSettings", JSON.stringify(toSave));

      if (settings.adminPassword) {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: settings.adminPassword }),
        });
        if (!res.ok) throw new Error("Failed to update password");
        update("adminPassword", "");
      }

      await new Promise((r) => setTimeout(r, 400));
      setSaved(true);
      toast.success("Platform settings saved successfully");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Platform Settings"
      subtitle="Configure platform-wide policies, security, and access controls."
    >
      <div style={{ maxWidth: 860 }}>
        <Flex justify="flex-end" style={{ marginBottom: "1.5rem" }}>
          <SaveBtn onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw size={16} className="spin" />
            ) : saved ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving
              ? "Saving..."
              : saved
                ? "Saved Successfully"
                : "Save Changes"}
          </SaveBtn>
        </Flex>

        <Section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <SectionHeader>
            <SectionIcon $bg="rgba(0, 113, 227, 0.08)" $color="#0071e3">
              <Globe size={24} />
            </SectionIcon>
            <div>
              <SectionTitle>General Preferences</SectionTitle>
              <SectionDesc>
                Core platform configuration and branding
              </SectionDesc>
            </div>
          </SectionHeader>

          <SettingRow>
            <SettingLabel>
              <h4>Platform Name</h4>
              <p>The name displayed across the platform interface</p>
            </SettingLabel>
            <InputField
              value={settings.platformName}
              onChange={(e) => update("platformName", e.target.value)}
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Default Currency</h4>
              <p>Currency used for all funding calculations</p>
            </SettingLabel>
            <SelectField
              value={settings.defaultCurrency}
              onChange={(e) => update("defaultCurrency", e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </SelectField>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Maintenance Mode</h4>
              <p>Temporarily disable public access to perform maintenance</p>
            </SettingLabel>
            <Toggle
              $on={settings.maintenanceMode}
              onClick={() =>
                update("maintenanceMode", !settings.maintenanceMode)
              }
            />
          </SettingRow>
        </Section>

        <Section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader>
            <SectionIcon $bg="rgba(16, 185, 129, 0.08)" $color="#10b981">
              <DollarSign size={24} />
            </SectionIcon>
            <div>
              <SectionTitle>Campaign & Funding Rules</SectionTitle>
              <SectionDesc>
                Configure limits, caps, and workflow automation
              </SectionDesc>
            </div>
          </SectionHeader>

          <SettingRow>
            <SettingLabel>
              <h4>Auto-Approve Campaigns</h4>
              <p>Skip the manual admin review for new campaign submissions</p>
            </SettingLabel>
            <Toggle
              $on={settings.autoApprove}
              onClick={() => update("autoApprove", !settings.autoApprove)}
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Minimum Investment (₹)</h4>
              <p>Smallest allowed investment amount per user</p>
            </SettingLabel>
            <InputField
              type="number"
              $w="140px"
              style={{ fontFamily: "var(--font-mono)" }}
              value={settings.minInvestmentAmount}
              onChange={(e) =>
                update("minInvestmentAmount", Number(e.target.value))
              }
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Maximum Investment (₹)</h4>
              <p>Largest allowed single investment transaction</p>
            </SettingLabel>
            <InputField
              type="number"
              $w="140px"
              style={{ fontFamily: "var(--font-mono)" }}
              value={settings.maxInvestmentAmount}
              onChange={(e) =>
                update("maxInvestmentAmount", Number(e.target.value))
              }
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Default Equity Cap (%)</h4>
              <p>Maximum equity percentage startups can offer</p>
            </SettingLabel>
            <InputField
              type="number"
              $w="100px"
              style={{ fontFamily: "var(--font-mono)" }}
              value={settings.defaultEquityCap}
              onChange={(e) =>
                update("defaultEquityCap", Number(e.target.value))
              }
            />
          </SettingRow>
        </Section>

        <Section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SectionHeader>
            <SectionIcon $bg="rgba(139, 92, 246, 0.08)" $color="#8b5cf6">
              <Users size={24} />
            </SectionIcon>
            <div>
              <SectionTitle>User Management</SectionTitle>
              <SectionDesc>
                Policies governing user accounts and public visibility
              </SectionDesc>
            </div>
          </SectionHeader>

          <SettingRow>
            <SettingLabel>
              <h4>Require Email Verification</h4>
              <p>Users must verify their email before investing or raising</p>
            </SettingLabel>
            <Toggle
              $on={settings.requireVerification}
              onClick={() =>
                update("requireVerification", !settings.requireVerification)
              }
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Public Company Profiles</h4>
              <p>Allow non-logged-in visitors to view company details</p>
            </SettingLabel>
            <Toggle
              $on={settings.allowPublicProfiles}
              onClick={() =>
                update("allowPublicProfiles", !settings.allowPublicProfiles)
              }
            />
          </SettingRow>
        </Section>

        <Section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader>
            <SectionIcon $bg="rgba(239, 68, 68, 0.08)" $color="#ef4444">
              <Bell size={24} />
            </SectionIcon>
            <div>
              <SectionTitle>Admin Alerts</SectionTitle>
              <SectionDesc>Control system-generated notifications</SectionDesc>
            </div>
          </SectionHeader>

          <SettingRow>
            <SettingLabel>
              <h4>Email Notifications</h4>
              <p>Receive administrative alerts directly via email</p>
            </SettingLabel>
            <Toggle
              $on={settings.emailNotifications}
              onClick={() =>
                update("emailNotifications", !settings.emailNotifications)
              }
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>New Investment Alerts</h4>
              <p>Get notified instantly when large investments are placed</p>
            </SettingLabel>
            <Toggle
              $on={settings.investmentAlerts}
              onClick={() =>
                update("investmentAlerts", !settings.investmentAlerts)
              }
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>New User Registration Alerts</h4>
              <p>Get notified when new startups or investors sign up</p>
            </SettingLabel>
            <Toggle
              $on={settings.newUserAlerts}
              onClick={() => update("newUserAlerts", !settings.newUserAlerts)}
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Compliance & Fraud Alerts</h4>
              <p>Immediate alerts for flagged users or complaints</p>
            </SettingLabel>
            <Toggle
              $on={settings.reportAlerts}
              onClick={() => update("reportAlerts", !settings.reportAlerts)}
            />
          </SettingRow>
        </Section>

        <Section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SectionHeader>
            <SectionIcon $bg="rgba(110, 110, 115, 0.08)" $color="#6e6e73">
              <Lock size={24} />
            </SectionIcon>
            <div>
              <SectionTitle>Security & Access Control</SectionTitle>
              <SectionDesc>
                Protecting platform integrity and admin accounts
              </SectionDesc>
            </div>
          </SectionHeader>

          <SettingRow>
            <SettingLabel>
              <h4>Session Timeout (minutes)</h4>
              <p>Automatically log out inactive administrator sessions</p>
            </SettingLabel>
            <InputField
              type="number"
              $w="100px"
              style={{ fontFamily: "var(--font-mono)" }}
              value={settings.sessionTimeout}
              onChange={(e) => update("sessionTimeout", Number(e.target.value))}
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Max Login Attempts</h4>
              <p>Lock an account temporarily after failed login attempts</p>
            </SettingLabel>
            <InputField
              type="number"
              $w="100px"
              style={{ fontFamily: "var(--font-mono)" }}
              value={settings.maxLoginAttempts}
              onChange={(e) =>
                update("maxLoginAttempts", Number(e.target.value))
              }
            />
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <h4>Update Admin Password</h4>
              <p>Securely change your administrator account password</p>
            </SettingLabel>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <InputField
                type={showPassword ? "text" : "password"}
                $w="220px"
                placeholder="Enter new password"
                value={settings.adminPassword}
                onChange={(e) => update("adminPassword", e.target.value)}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "rgba(0, 0, 0, 0.04)",
                  border: "none",
                  borderRadius: 12,
                  padding: "0 1rem",
                  cursor: "pointer",
                  color: "#191919",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </SettingRow>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
