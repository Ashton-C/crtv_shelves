import Link from "next/link";

export default function HomePage() {
  return (
    <main className="from-5 sticky flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b to-gray-950 text-white">
      <div className="container flex flex-col flex-wrap items-center justify-center gap-12 px-4 py-16 text-xl text-black">
        <h1 className="hero-text text-3xl text-white">Signup Page</h1>
        <Link
          className="border-all bg-5/80 rounded-xl p-4 font-semibold text-white shadow-xl/30"
          href="/dashboard"
          id="back_to_dash_button"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
