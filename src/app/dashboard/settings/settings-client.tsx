"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "~/server/actions/settings";

type Settings = {
  isPublic: boolean;
  shareByLink: boolean;
  showShelfCounts: boolean;
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative h-[26px] w-[44px] flex-shrink-0 rounded-full transition-colors duration-200"
      style={{
        background: on ? "#FF5F00" : "#242323",
        border: on ? "none" : "1px solid #2E2D2D",
      }}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
      <div className="px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
          {title}
        </p>
      </div>
      <div className="divide-y divide-border border-t border-border">{children}</div>
    </div>
  );
}

function SettingsRow({ label, sub, control }: { label: string; sub?: string; control?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <p className="text-[14px] font-medium text-text">{label}</p>
        {sub && <p className="text-[12px] text-muted">{sub}</p>}
      </div>
      {control}
    </div>
  );
}

export default function SettingsClient({
  user,
  initialSettings,
}: {
  user: { displayName: string; handle: string; avatarColor: string; initials: string };
  initialSettings: Settings;
}) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [, startTransition] = useTransition();

  const toggle = (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    startTransition(async () => {
      await updateSettings({ [key]: value });
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-[15px] font-bold tracking-tight text-text">settings</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Profile hero */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] text-xl font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
            }}
          >
            {user.initials}
          </div>
          <div className="text-center">
            <p className="text-[18px] font-black italic tracking-tight text-text">
              {user.displayName}
            </p>
            <p className="text-[13px] text-muted">@{user.handle}</p>
          </div>
        </div>

        <Section title="Profile">
          <SettingsRow label="Username" sub={user.displayName} />
          <SettingsRow label="Handle" sub={`@${user.handle}`} />
        </Section>

        <Section title="Sharing">
          <SettingsRow
            label="Public profile"
            sub="Anyone can view your shelves"
            control={
              <Toggle
                on={settings.isPublic}
                onToggle={() => toggle("isPublic", !settings.isPublic)}
              />
            }
          />
          <SettingsRow
            label="Share by link"
            sub="Shareable URLs for your shelves"
            control={
              <Toggle
                on={settings.shareByLink}
                onToggle={() => toggle("shareByLink", !settings.shareByLink)}
              />
            }
          />
          <SettingsRow
            label="Show shelf counts"
            sub="Display share counts on shelves"
            control={
              <Toggle
                on={settings.showShelfCounts}
                onToggle={() => toggle("showShelfCounts", !settings.showShelfCounts)}
              />
            }
          />
        </Section>

        <Section title="Account">
          <SettingsRow label="Sign out" />
          <SettingsRow label="Delete account" />
        </Section>
      </div>
    </div>
  );
}
