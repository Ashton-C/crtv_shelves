"use client";

import { useState } from "react";
import { MOCK_USER } from "~/lib/mock-data";

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative h-[26px] w-[44px] flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? "#FF5F00" : "#242323", border: on ? "none" : "1px solid #2E2D2D" }}
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
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{title}</p>
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

export default function SettingsPage() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [shareByLink, setShareByLink] = useState(true);
  const [showCounts, setShowCounts] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-[15px] font-bold tracking-tight text-text">settings</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Profile hero */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] text-xl font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${MOCK_USER.avatarColor}, ${MOCK_USER.avatarColor}99)`,
            }}
          >
            {MOCK_USER.initials}
          </div>
          <div className="text-center">
            <p className="text-[18px] font-black italic tracking-tight text-text">
              {MOCK_USER.name}
            </p>
            <p className="text-[13px] text-muted">{MOCK_USER.handle}</p>
          </div>
        </div>

        {/* Profile section */}
        <Section title="Profile">
          <SettingsRow label="Username" sub={MOCK_USER.name} />
          <SettingsRow label="Handle" sub={MOCK_USER.handle} />
        </Section>

        {/* Sharing section */}
        <Section title="Sharing">
          <SettingsRow
            label="Public profile"
            sub="Anyone can view your shelves"
            control={
              <Toggle on={publicProfile} onToggle={() => setPublicProfile((v) => !v)} />
            }
          />
          <SettingsRow
            label="Share by link"
            sub="Shareable URLs for your shelves"
            control={
              <Toggle on={shareByLink} onToggle={() => setShareByLink((v) => !v)} />
            }
          />
          <SettingsRow
            label="Show shelf counts"
            sub="Display share counts on shelves"
            control={
              <Toggle on={showCounts} onToggle={() => setShowCounts((v) => !v)} />
            }
          />
        </Section>

        {/* Account section */}
        <Section title="Account">
          <SettingsRow label="Sign out" />
          <SettingsRow label="Delete account" />
        </Section>
      </div>
    </div>
  );
}
