// crtv_shelves — Data & Design Tokens

const ACCENT = '#FF5F00';
const BG = '#131313';
const SURFACE = '#1C1B1B';
const SURFACE2 = '#242323';
const BORDER = '#2E2D2D';
const TEXT = '#F0EEEC';
const MUTED = '#7A7775';

// picsum.photos seed-based images: consistent per item, ~200×200
const img = (seed) => `https://picsum.photos/seed/${seed}/200/200`;

const ITEMS = {
  music_artists: [
    { id: 1, name: "Kendrick Lamar",      sub: "Hip-Hop · Compton",      c1: "#7C1C1C", c2: "#3D0C0C", init: "KL", img: img('kendrick97') },
    { id: 2, name: "Frank Ocean",          sub: "R&B / Soul",              c1: "#1A4A72", c2: "#0C2740", init: "FO", img: img('frank221') },
    { id: 3, name: "Tyler, the Creator",   sub: "Hip-Hop / Neo-Soul",      c1: "#1B6B2F", c2: "#0C3D1A", init: "TC", img: img('tyler443') },
    { id: 4, name: "SZA",                  sub: "Alt R&B",                 c1: "#4E1C7C", c2: "#2A0C40", init: "SZ", img: img('sza109') },
    { id: 5, name: "Playboi Carti",        sub: "Hip-Hop / Trap",          c1: "#7C1C4E", c2: "#3D0C28", init: "PC", img: img('carti558') },
    { id: 6, name: "James Blake",          sub: "Electronic / Soul",       c1: "#1C3A7C", c2: "#0C1E40", init: "JB", img: img('blake332') },
    { id: 7, name: "Bon Iver",             sub: "Indie Folk",              c1: "#4A3A1C", c2: "#27200C", init: "BI", img: img('boniver77') },
    { id: 8, name: "Lana Del Rey",         sub: "Dream Pop",               c1: "#6B1C3A", c2: "#3A0C1E", init: "LD", img: img('lana884') },
  ],
  music_albums: [
    { id: 1, name: "good kid, m.A.A.d city", sub: "Kendrick Lamar · 2012", c1: "#8B3D1C", c2: "#4A200C", init: "GK", img: img('gkmc2012') },
    { id: 2, name: "Blonde",                  sub: "Frank Ocean · 2016",    c1: "#C4A44A", c2: "#7A6228", init: "BL", img: img('blonde16') },
    { id: 3, name: "IGOR",                    sub: "Tyler, the Creator · 2019", c1: "#1C7C4A", c2: "#0C3D25", init: "IG", img: img('igor2019') },
    { id: 4, name: "SOS",                     sub: "SZA · 2022",            c1: "#3D1C7C", c2: "#200C40", init: "SO", img: img('szasos22') },
    { id: 5, name: "Whole Lotta Red",         sub: "Playboi Carti · 2020",  c1: "#8B1C1C", c2: "#4A0C0C", init: "WR", img: img('wlr2020') },
    { id: 6, name: "To Pimp a Butterfly",     sub: "Kendrick Lamar · 2015", c1: "#4A7C1C", c2: "#253D0C", init: "TP", img: img('tpab15') },
    { id: 7, name: "Overly Dedicated",        sub: "Kendrick Lamar · 2010", c1: "#1C4A7C", c2: "#0C2540", init: "OD", img: img('od2010') },
    { id: 8, name: "Channel Orange",          sub: "Frank Ocean · 2012",    c1: "#C47A1C", c2: "#7A3D0C", init: "CO", img: img('channelorange') },
  ],
  films: [
    { id: 1, name: "Parasite",              sub: "Bong Joon-ho · 2019",   c1: "#2A4A1C", c2: "#16270C", init: "PA", img: img('parasite19') },
    { id: 2, name: "The Godfather",         sub: "Coppola · 1972",        c1: "#4A3A1C", c2: "#27200C", init: "GF", img: img('godfather72') },
    { id: 3, name: "Mulholland Drive",      sub: "Lynch · 2001",          c1: "#1C1C5A", c2: "#0C0C2E", init: "MD", img: img('mulholland01') },
    { id: 4, name: "Stalker",               sub: "Tarkovsky · 1979",      c1: "#2A4A3A", c2: "#16271E", init: "ST", img: img('stalker79') },
    { id: 5, name: "2001: A Space Odyssey", sub: "Kubrick · 1968",        c1: "#1C3A5A", c2: "#0C1E2E", init: "2K", img: img('kubrick68') },
    { id: 6, name: "In the Mood for Love",  sub: "Wong Kar-wai · 2000",   c1: "#7C2A1C", c2: "#3D150C", init: "ML", img: img('moodlove00') },
    { id: 7, name: "Spirited Away",         sub: "Miyazaki · 2001",       c1: "#1C5A5A", c2: "#0C2E2E", init: "SA", img: img('spirited01') },
    { id: 8, name: "There Will Be Blood",   sub: "PTA · 2007",            c1: "#5A3A1C", c2: "#2E1E0C", init: "TW", img: img('twbb07') },
  ],
  tv: [
    { id: 1, name: "The Wire",       sub: "HBO · 2002–2008",      c1: "#2A1C1C", c2: "#150E0E", init: "TW", img: img('wire2002') },
    { id: 2, name: "Succession",     sub: "HBO · 2018–2023",      c1: "#3A3A1C", c2: "#1E1E0C", init: "SU", img: img('succession18') },
    { id: 3, name: "The Sopranos",   sub: "HBO · 1999–2007",      c1: "#1C3A3A", c2: "#0C1E1E", init: "SO", img: img('sopranos99') },
    { id: 4, name: "Breaking Bad",   sub: "AMC · 2008–2013",      c1: "#3A2A1C", c2: "#1E150C", init: "BB", img: img('breakingbad08') },
    { id: 5, name: "Twin Peaks",     sub: "ABC/Showtime · 1990",  c1: "#2A1C3A", c2: "#150C1E", init: "TP", img: img('twinpeaks90') },
    { id: 6, name: "Atlanta",        sub: "FX · 2016–2022",       c1: "#4A1C1C", c2: "#250E0E", init: "AT", img: img('atlanta16') },
    { id: 7, name: "The Leftovers",  sub: "HBO · 2014–2017",      c1: "#1C2A4A", c2: "#0C1525", init: "TL", img: img('leftovers14') },
    { id: 8, name: "Halt and Catch Fire", sub: "AMC · 2014–2017", c1: "#4A3A1C", c2: "#25200C", init: "HF", img: img('haltfire14') },
  ],
};

const SHELVES = [
  {
    id: 1, name: "top artists", category: "Music", type: "Artists",
    items: ITEMS.music_artists, size: "focus", shareCount: 142,
  },
  {
    id: 2, name: "fav albums", category: "Music", type: "Albums",
    items: ITEMS.music_albums, size: "podium", shareCount: 89,
  },
  {
    id: 3, name: "goat films", category: "Film", type: "Films",
    items: ITEMS.films, size: "archive", shareCount: 211,
  },
  {
    id: 4, name: "top shows", category: "TV", type: "Shows",
    items: ITEMS.tv, size: "focus", shareCount: 67,
  },
];

const FRIENDS = [
  { id: 1, name: "maya.chen",   handle: "@maya.chen",   color: "#7C1C4E", initials: "MC", topShelf: SHELVES[0], viewers: 340 },
  { id: 2, name: "theo.r",      handle: "@theo.r",      color: "#1C4A7C", initials: "TR", topShelf: SHELVES[2], viewers: 128 },
  { id: 3, name: "solange.w",   handle: "@solange.w",   color: "#4E1C7C", initials: "SW", topShelf: SHELVES[3], viewers: 204 },
  { id: 4, name: "kenzo.a",     handle: "@kenzo.a",     color: "#1C7C4A", initials: "KA", topShelf: SHELVES[1], viewers: 89  },
  { id: 5, name: "iris.park",   handle: "@iris.park",   color: "#7C4A1C", initials: "IP", topShelf: SHELVES[0], viewers: 512 },
  { id: 6, name: "rafael.v",    handle: "@rafael.v",    color: "#1C3A7C", initials: "RV", topShelf: SHELVES[2], viewers: 73  },
];

const CATEGORIES = [
  { id: "music",  label: "Music",  emoji: "♪", types: ["Artists", "Albums", "Songs"], c1: "#7C1C1C", c2: "#3D0C0C" },
  { id: "film",   label: "Film",   emoji: "◉", types: ["Films", "Directors"],         c1: "#1C3A7C", c2: "#0C1E40" },
  { id: "tv",     label: "TV",     emoji: "▣", types: ["Shows", "Characters"],        c1: "#2A1C1C", c2: "#150E0E" },
  { id: "books",  label: "Books",  emoji: "▤", types: ["Books", "Authors"],           c1: "#1C4A3A", c2: "#0C2520" },
  { id: "games",  label: "Games",  emoji: "◈", types: ["Games", "Franchises"],        c1: "#3A1C5A", c2: "#1E0C2E" },
];

const SIZES = [
  { id: "podium",  label: "Podium",  count: 3, desc: "Top 3 — the essentials" },
  { id: "focus",   label: "Focus",   count: 5, desc: "Top 5 — your shortlist" },
  { id: "archive", label: "Archive", count: 8, desc: "Top 8 — the full picture" },
];

const SEARCH_RESULTS = {
  music_artists: [
    { id: 9,  name: "Blood Orange",        sub: "Art R&B",          c1: "#8B2A1C", c2: "#4A150C", init: "BO", img: img('bloodorange55') },
    { id: 10, name: "Solange",             sub: "R&B / Art Pop",    c1: "#7C4A1C", c2: "#3D250C", init: "SL", img: img('solange33') },
    { id: 11, name: "Steve Lacy",          sub: "Neo-Soul",         c1: "#1C6B3A", c2: "#0C3D1E", init: "SL", img: img('stevelacy22') },
    { id: 12, name: "JPEGMAFIA",           sub: "Experimental",     c1: "#4A1C7C", c2: "#250C3D", init: "JP", img: img('jpeg44') },
    { id: 13, name: "Ethel Cain",          sub: "Southern Gothic",  c1: "#6B1C3A", c2: "#3D0C1E", init: "EC", img: img('ethelcain66') },
    { id: 14, name: "Sampha",              sub: "Electronic Soul",  c1: "#1C3A6B", c2: "#0C1E3D", init: "SA", img: img('sampha88') },
  ],
  music_albums: [
    { id: 9,  name: "Freetown Sound",       sub: "Blood Orange · 2016",    c1: "#8B2A1C", c2: "#4A150C", init: "FS", img: img('freetown16') },
    { id: 10, name: "A Seat at the Table",  sub: "Solange · 2016",         c1: "#C4944A", c2: "#7A5828", init: "AS", img: img('seatatable16') },
    { id: 11, name: "Gemini Rights",        sub: "Steve Lacy · 2022",      c1: "#1C6B3A", c2: "#0C3D1E", init: "GR", img: img('gemini22') },
    { id: 12, name: "LP!",                  sub: "JPEGMAFIA · 2021",       c1: "#4A1C7C", c2: "#250C3D", init: "LP", img: img('lp21') },
    { id: 13, name: "Preacher's Daughter",  sub: "Ethel Cain · 2022",      c1: "#6B1C3A", c2: "#3D0C1E", init: "PD", img: img('preacher22') },
    { id: 14, name: "Process",              sub: "Sampha · 2017",          c1: "#1C3A6B", c2: "#0C1E3D", init: "PR", img: img('process17') },
  ],
  films: [
    { id: 9,  name: "Jeanne Dielman",             sub: "Chantal Akerman · 1975",  c1: "#3A2A1C", c2: "#1E150C", init: "JD", img: img('jeanne75') },
    { id: 10, name: "Mirror",                      sub: "Tarkovsky · 1975",        c1: "#2A3A2A", c2: "#151E15", init: "MI", img: img('mirror75') },
    { id: 11, name: "Memoria",                     sub: "Weerasethakul · 2021",    c1: "#2A2A4A", c2: "#151525", init: "ME", img: img('memoria21') },
    { id: 12, name: "Portrait of a Lady on Fire",  sub: "Sciamma · 2019",          c1: "#7C2A1C", c2: "#3D150C", init: "PL", img: img('portrait19') },
    { id: 13, name: "The Tree of Life",            sub: "Malick · 2011",           c1: "#4A5A1C", c2: "#252E0C", init: "TL", img: img('treelife11') },
    { id: 14, name: "Certified Copy",             sub: "Kiarostami · 2010",        c1: "#3A1C4A", c2: "#1E0C25", init: "CC", img: img('certified10') },
  ],
  tv: [
    { id: 9,  name: "I May Destroy You",  sub: "BBC · 2020",          c1: "#4A1C2A", c2: "#250C15", init: "ID", img: img('imay20') },
    { id: 10, name: "Fleabag",            sub: "BBC · 2016–2019",     c1: "#3A3A2A", c2: "#1E1E15", init: "FL", img: img('fleabag16') },
    { id: 11, name: "Euphoria",           sub: "HBO · 2019–",         c1: "#1C1C5A", c2: "#0C0C2E", init: "EU", img: img('euphoria19') },
    { id: 12, name: "Station Eleven",     sub: "HBO Max · 2021",      c1: "#1C4A4A", c2: "#0C2525", init: "SE", img: img('station11') },
    { id: 13, name: "Mr. Robot",          sub: "USA · 2015–2019",     c1: "#2A1C4A", c2: "#150C25", init: "MR", img: img('mrobot15') },
    { id: 14, name: "Yellowjackets",      sub: "Showtime · 2021–",    c1: "#4A2A1C", c2: "#25150C", init: "YJ", img: img('yellowjackets21') },
  ],
};

Object.assign(window, {
  ACCENT, BG, SURFACE, SURFACE2, BORDER, TEXT, MUTED,
  ITEMS, SHELVES, FRIENDS, CATEGORIES, SIZES, SEARCH_RESULTS
});
