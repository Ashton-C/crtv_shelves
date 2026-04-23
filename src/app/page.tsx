"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function LogoBars() {
  return (
    <div className="flex items-end gap-[3px]">
      {[6, 10, 14, 18].map((h, i) => (
        <div key={i} className="w-2 rounded-sm bg-white" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function WelcomePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(160deg, #FF5F00, #CC3A00 45%, #131313)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="flex w-full max-w-xs flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoBars />
          <h1 className="text-[34px] font-black italic tracking-tight text-white">
            crtv_shelves
          </h1>
          <p className="text-[15px] font-medium text-white/70">
            rank what you love.
          </p>
          <p className="max-w-[240px] text-[13px] leading-relaxed text-white/45">
            build ranked lists for the music, films, and shows that define you.
            share them with friends.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-[20px] bg-white px-4 py-4 text-[16px] font-bold text-[#131313] transition-opacity hover:opacity-90"
          >
            get started
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-[20px] border border-white/30 px-4 py-4 text-[16px] font-bold text-white transition-opacity hover:opacity-80"
          >
            sign in
          </Link>
        </div>

        <p className="text-[11px] font-medium tracking-widest text-white/30">
          SOCIAL · BY · LINK
        </p>
      </motion.div>
    </main>
  );
}
