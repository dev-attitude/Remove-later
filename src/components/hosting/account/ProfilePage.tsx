"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import {
  AccountEmptyState,
  AccountPageHeader,
  ToggleSwitch,
} from "@/components/hosting/account/AccountShared";

export function ProfilePage() {
  const { account, loaded, updateProfile, updateCustomer } = useHostingAccount();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!account) return;
    setName(account.customer.name);
    setEmail(account.customer.email);
    setPhone(account.customer.phone);
    setDisplayName(account.profile.displayName);
  }, [account]);

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateCustomer({ name, email, phone });
    updateProfile({ displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <AccountPageHeader title="Profile" description="Update your contact details and preferences" />

      <form
        onSubmit={handleSave}
        className="max-w-xl space-y-6 rounded-xl border border-line bg-offwhite p-6 shadow-sm"
      >
        <div>
          <label htmlFor="profile-display" className="block text-sm font-medium text-navy">
            Display name (sidebar)
          </label>
          <input
            id="profile-display"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-navy">
            Full name
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="marketing-input mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-navy">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="marketing-input mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="block text-sm font-medium text-navy">
            Phone / WhatsApp
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>

        <div className="border-t border-line pt-4">
          <p className="text-sm font-medium text-navy">Preferences</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted">Marketing emails</span>
            <ToggleSwitch
              checked={account.profile.marketingEmails}
              onChange={() =>
                updateProfile({ marketingEmails: !account.profile.marketingEmails })
              }
              label="Marketing emails"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="marketing-btn-primary text-sm">
            Save changes
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>

        <p className="text-xs text-muted">Order ID: {account.orderId}</p>
      </form>
    </div>
  );
}
