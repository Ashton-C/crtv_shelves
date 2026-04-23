import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { MOCK_SHELVES, MOCK_USER } from "~/lib/mock-data";
import { ShelfCard } from "./shelf-card";

export function ProfileFeed() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${MOCK_USER.avatarColor}, ${MOCK_USER.avatarColor}99)`,
          }}
        >
          {MOCK_USER.initials}
        </div>
        <div>
          <div className="text-[14px] font-bold text-text">{MOCK_USER.name}</div>
          <div className="text-[12px] text-muted">{MOCK_USER.handle}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {MOCK_SHELVES.map((shelf) => (
          <Link key={shelf.id} href={`/dashboard/view_shelf/${shelf.id}`}>
            <ShelfCard shelf={shelf} />
          </Link>
        ))}
        <Link href="/dashboard/create_shelf">
          <div className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-border opacity-50 transition-opacity hover:opacity-80">
            <FiPlus size={20} className="text-muted" />
            <span className="text-[12px] text-muted">new shelf</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
