const img = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

export interface Item {
  id: number;
  name: string;
  sub: string;
  c1: string;
  c2: string;
  init: string;
  img: string;
}

export interface Shelf {
  id: number;
  name: string;
  category: string;
  type: string;
  items: Item[];
  size: "podium" | "focus" | "archive";
  shareCount: number;
}

export interface Friend {
  id: number;
  name: string;
  handle: string;
  color: string;
  initials: string;
  topShelf: Shelf;
  viewers: number;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  types: string[];
  c1: string;
  c2: string;
}

export type ShelfSize = {
  id: "podium" | "focus" | "archive";
  label: string;
  count: 3 | 5 | 8;
  desc: string;
};

const MUSIC_ARTISTS: Item[] = [
  { id: 1, name: "Kendrick Lamar", sub: "Hip-Hop · Compton", c1: "#7C1C1C", c2: "#3D0C0C", init: "KL", img: img("kendrick97") },
  { id: 2, name: "Frank Ocean", sub: "R&B / Soul", c1: "#1A4A72", c2: "#0C2740", init: "FO", img: img("frank221") },
  { id: 3, name: "Tyler, the Creator", sub: "Hip-Hop / Neo-Soul", c1: "#1B6B2F", c2: "#0C3D1A", init: "TC", img: img("tyler443") },
  { id: 4, name: "SZA", sub: "Alt R&B", c1: "#4E1C7C", c2: "#2A0C40", init: "SZ", img: img("sza109") },
  { id: 5, name: "Playboi Carti", sub: "Hip-Hop / Trap", c1: "#7C1C4E", c2: "#3D0C28", init: "PC", img: img("carti558") },
];

const MUSIC_ALBUMS: Item[] = [
  { id: 1, name: "good kid, m.A.A.d city", sub: "Kendrick Lamar · 2012", c1: "#8B3D1C", c2: "#4A200C", init: "GK", img: img("gkmc2012") },
  { id: 2, name: "Blonde", sub: "Frank Ocean · 2016", c1: "#C4A44A", c2: "#7A6228", init: "BL", img: img("blonde16") },
  { id: 3, name: "IGOR", sub: "Tyler, the Creator · 2019", c1: "#1C7C4A", c2: "#0C3D25", init: "IG", img: img("igor2019") },
];

const FILMS: Item[] = [
  { id: 1, name: "Parasite", sub: "Bong Joon-ho · 2019", c1: "#2A4A1C", c2: "#16270C", init: "PA", img: img("parasite19") },
  { id: 2, name: "The Godfather", sub: "Coppola · 1972", c1: "#4A3A1C", c2: "#27200C", init: "GF", img: img("godfather72") },
  { id: 3, name: "Mulholland Drive", sub: "Lynch · 2001", c1: "#1C1C5A", c2: "#0C0C2E", init: "MD", img: img("mulholland01") },
  { id: 4, name: "Stalker", sub: "Tarkovsky · 1979", c1: "#2A4A3A", c2: "#16271E", init: "ST", img: img("stalker79") },
  { id: 5, name: "2001: A Space Odyssey", sub: "Kubrick · 1968", c1: "#1C3A5A", c2: "#0C1E2E", init: "2K", img: img("kubrick68") },
  { id: 6, name: "In the Mood for Love", sub: "Wong Kar-wai · 2000", c1: "#7C2A1C", c2: "#3D150C", init: "ML", img: img("moodlove00") },
  { id: 7, name: "Spirited Away", sub: "Miyazaki · 2001", c1: "#1C5A5A", c2: "#0C2E2E", init: "SA", img: img("spirited01") },
  { id: 8, name: "There Will Be Blood", sub: "PTA · 2007", c1: "#5A3A1C", c2: "#2E1E0C", init: "TW", img: img("twbb07") },
];

const TV_SHOWS: Item[] = [
  { id: 1, name: "The Wire", sub: "HBO · 2002–2008", c1: "#2A1C1C", c2: "#150E0E", init: "TW", img: img("wire2002") },
  { id: 2, name: "Succession", sub: "HBO · 2018–2023", c1: "#3A3A1C", c2: "#1E1E0C", init: "SU", img: img("succession18") },
  { id: 3, name: "The Sopranos", sub: "HBO · 1999–2007", c1: "#1C3A3A", c2: "#0C1E1E", init: "SO", img: img("sopranos99") },
  { id: 4, name: "Breaking Bad", sub: "AMC · 2008–2013", c1: "#3A2A1C", c2: "#1E150C", init: "BB", img: img("breakingbad08") },
  { id: 5, name: "Twin Peaks", sub: "ABC/Showtime · 1990", c1: "#2A1C3A", c2: "#150C1E", init: "TP", img: img("twinpeaks90") },
];

export const MOCK_SHELVES: Shelf[] = [
  { id: 1, name: "top artists", category: "Music", type: "Artists", items: MUSIC_ARTISTS, size: "focus", shareCount: 142 },
  { id: 2, name: "fav albums", category: "Music", type: "Albums", items: MUSIC_ALBUMS, size: "podium", shareCount: 89 },
  { id: 3, name: "goat films", category: "Film", type: "Films", items: FILMS, size: "archive", shareCount: 211 },
  { id: 4, name: "top shows", category: "TV", type: "Shows", items: TV_SHOWS, size: "focus", shareCount: 67 },
];

export const MOCK_USER = {
  id: "mock",
  name: "you",
  handle: "@you",
  initials: "YO",
  avatarColor: "#FF5F00",
};

export const MOCK_FRIENDS: Friend[] = [
  { id: 1, name: "maya.chen", handle: "@maya.chen", color: "#7C1C4E", initials: "MC", topShelf: MOCK_SHELVES[0]!, viewers: 340 },
  { id: 2, name: "theo.r", handle: "@theo.r", color: "#1C4A7C", initials: "TR", topShelf: MOCK_SHELVES[2]!, viewers: 128 },
  { id: 3, name: "solange.w", handle: "@solange.w", color: "#4E1C7C", initials: "SW", topShelf: MOCK_SHELVES[3]!, viewers: 204 },
];

export const CATEGORIES: Category[] = [
  { id: "music", label: "Music", emoji: "♪", types: ["Artists", "Albums", "Songs"], c1: "#7C1C1C", c2: "#3D0C0C" },
  { id: "film", label: "Film", emoji: "◉", types: ["Films", "Directors"], c1: "#1C3A7C", c2: "#0C1E40" },
  { id: "tv", label: "TV", emoji: "▣", types: ["Shows", "Characters"], c1: "#2A1C1C", c2: "#150E0E" },
  { id: "books", label: "Books", emoji: "▤", types: ["Books", "Authors"], c1: "#1C4A3A", c2: "#0C2520" },
  { id: "games", label: "Games", emoji: "◈", types: ["Games", "Franchises"], c1: "#3A1C5A", c2: "#1E0C2E" },
];

export const SHELF_SIZES: ShelfSize[] = [
  { id: "podium", label: "Podium", count: 3, desc: "Top 3 — the essentials" },
  { id: "focus", label: "Focus", count: 5, desc: "Top 5 — your shortlist" },
  { id: "archive", label: "Archive", count: 8, desc: "Top 8 — the full picture" },
];

export const NAME_SUGGESTIONS: Record<string, string[]> = {
  music: ["top artists", "fav albums", "goat songs", "guilty pleasures"],
  film: ["goat films", "comfort watches", "top directors", "hidden gems"],
  tv: ["top shows", "fav characters", "guilty pleasure tv"],
  books: ["must reads", "fav authors", "all-time shelf"],
  games: ["goat games", "childhood classics", "recent favs"],
};
