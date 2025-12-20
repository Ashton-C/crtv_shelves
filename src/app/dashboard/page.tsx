import Link from "next/link";

export default function HomePage() {
  return (
    <main className="from-5 sticky flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b to-gray-950 text-white">
      <div className="container flex flex-col flex-wrap items-center justify-center gap-12 px-4 py-16 text-xl text-black">
        <h1 className="hero-text text-3xl text-white">
          Hi there! Welcome to CRTV_SHELVES!
        </h1>
        <p className="disc-p text-4 align-center w-3/4 justify-center font-mono">
          Your journey to curate and share your favorite media starts here.
          Let&apos;s get you set up!
        </p>
      </div>
      <div className="first-visit-buttons flex flex-row justify-between gap-4">
        <Link
          className="border-all bg-4/80 rounded-xl p-4 font-semibold text-white shadow-xl/30"
          href="/dashboard/create_shelf"
          id="create_first->add_shelf"
        >
          Create My First Shelf
        </Link>
        <Link
          className="border-all bg-5/80 rounded-xl p-4 font-semibold text-white shadow-xl/30"
          href="/dashboard/manage_friends"
          id="connect_first->add_friend"
        >
          Connect with Friends!
        </Link>
      </div>
    </main>
  );
}
