// crtv_shelves — Shared Components

const { useState, useEffect, useRef } = React;

// ── Artwork thumbnail with optional rank overlay ──────────────────────────────
function ItemThumb({ item, size = 56, rank = null, rankSize = "large" }) {
  const [imgErr, setImgErr] = useState(false);
  const s = {
    width: size, height: size, borderRadius: 8, flexShrink: 0,
    background: `linear-gradient(135deg, ${item.c1} 0%, ${item.c2} 100%)`,
    position: 'relative', overflow: 'hidden', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  };
  const rankStyle = {
    position: 'absolute', fontFamily: 'Inter, sans-serif', fontWeight: 900,
    color: 'rgba(255,255,255,0.22)', lineHeight: 1, userSelect: 'none',
    pointerEvents: 'none', letterSpacing: '-2px',
    ...(rankSize === 'large'
      ? { fontSize: size * 1.0, bottom: -size * 0.12, right: -size * 0.04 }
      : { fontSize: size * 0.7, bottom: -size * 0.08, right: -size * 0.02 }),
  };
  return (
    <div style={s}>
      {item.img && !imgErr
        ? <img src={item.img} alt={item.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: size * 0.28, color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.5px', userSelect: 'none' }}>{item.init}</span>
      }
      {/* Dark tint so rank number is readable over image */}
      {item.img && !imgErr && rank !== null &&
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />}
      {rank !== null && <span style={rankStyle}>{rank}</span>}
    </div>
  );
}

// ── Shelf card for profile grid ───────────────────────────────────────────────
function CollageThumb({ item, size }) {
  const [err, setErr] = React.useState(false);
  return (
    <div style={{
      height: size, borderRadius: 6,
      background: `linear-gradient(135deg, ${item.c1} 0%, ${item.c2} 100%)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {item.img && !err
        ? <img src={item.img} alt="" onError={() => setErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: size * 0.28, color: 'rgba(255,255,255,0.3)' }}>{item.init}</span>
      }
    </div>
  );
}

function ShelfCard({ shelf, onClick, cols = 2 }) {
  const displayItems = shelf.items.slice(0, 4);
  const cardSize = cols === 2 ? 156 : 104;
  const thumbSize = Math.floor(cardSize / 2) - 2;
  return (
    <div onClick={onClick} style={{
      width: cardSize, borderRadius: 16, overflow: 'hidden',
      background: SURFACE, cursor: 'pointer', flexShrink: 0,
      border: `1px solid ${BORDER}`,
      transition: 'transform 0.15s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* 2×2 collage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2 }}>
        {displayItems.map((item) => (
          <CollageThumb key={item.id} item={item} size={thumbSize} />
        ))}
      </div>
      {/* Footer */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, fontStyle: 'italic', color: TEXT, letterSpacing: '-0.3px', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shelf.name}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'rgba(255,95,0,0.15)', borderRadius: 6, padding: '2px 6px',
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: ACCENT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{shelf.category} · {shelf.type}</span>
        </div>
      </div>
    </div>
  );
}

// ── Bottom navigation ─────────────────────────────────────────────────────────
function BottomNav({ screen, navigate }) {
  const tabs = [
    { id: 'profile',  icon: ProfileIcon,  label: 'Profile' },
    { id: 'friends',  icon: FriendsIcon,  label: 'Friends' },
    { id: 'create',   icon: PlusIcon,     label: '',        special: true },
    { id: 'search',   icon: SearchIcon,   label: 'Search' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];
  const activeScreens = { profile: 'profile', friends: 'friends', settings: 'settings', search: 'search' };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 72, background: 'rgba(19,19,19,0.95)',
      backdropFilter: 'blur(20px)', borderTop: `1px solid ${BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 8px 8px', zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = activeScreens[tab.id] === screen || (tab.id === 'profile' && screen === 'shelf');
        const Icon = tab.icon;
        if (tab.special) return (
          <button key={tab.id} onClick={() => navigate('create_basics')} style={{
            width: 48, height: 48, borderRadius: 16, border: 'none',
            background: `linear-gradient(135deg, ${ACCENT} 0%, #FF8C00 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: `0 4px 20px rgba(255,95,0,0.4)`,
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        );
        return (
          <button key={tab.id} onClick={() => navigate(tab.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
            opacity: active ? 1 : 0.4, transition: 'opacity 0.2s',
          }}>
            <Icon size={22} color={active ? ACCENT : TEXT} />
            {tab.label && <span style={{ fontSize: 9, fontWeight: 600, color: active ? ACCENT : TEXT, letterSpacing: '0.3px' }}>{tab.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ title, onBack, right, transparent = false }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', zIndex: 50,
      background: transparent ? 'transparent' : BG,
      borderBottom: transparent ? 'none' : `1px solid ${BORDER}`,
    }}>
      <div style={{ width: 40 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke={TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      {title && <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: TEXT, letterSpacing: '-0.3px' }}>{title}</span>}
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────
function Badge({ label, accent = false, large = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: accent ? `rgba(255,95,0,0.2)` : 'rgba(255,255,255,0.08)',
      border: `1px solid ${accent ? 'rgba(255,95,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 8, padding: large ? '4px 10px' : '2px 8px',
      fontSize: large ? 11 : 9, fontWeight: 700,
      color: accent ? ACCENT : MUTED, letterSpacing: '0.5px',
      textTransform: 'uppercase',
    }}>{label}</span>
  );
}

// ── Pill / step indicator ─────────────────────────────────────────────────────
function StepDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6,
          borderRadius: 3, transition: 'all 0.3s ease',
          background: i === current ? ACCENT : BORDER,
        }} />
      ))}
    </div>
  );
}

// ── Icon set ─────────────────────────────────────────────────────────────────
function ProfileIcon({ size = 24, color = TEXT }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
function FriendsIcon({ size = 24, color = TEXT }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8" r="3.5" stroke={color} strokeWidth="2"/>
    <path d="M2 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="8" r="3" stroke={color} strokeWidth="1.5" strokeDasharray="2 1"/>
    <path d="M22 20c0-2.8-2.2-5-5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1"/>
  </svg>;
}
function PlusIcon({ size = 24, color = TEXT }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>;
}
function SearchIcon({ size = 24, color = TEXT }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="2"/>
    <path d="M16 16l4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
function SettingsIcon({ size = 24, color = TEXT }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
function ShareIcon({ size = 20, color = TEXT }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2"/>
    <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2"/>
    <path d="M8.7 10.7l6.6-3.4M8.7 13.3l6.6 3.4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
function GripIcon({ size = 20, color = MUTED }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="1.5" fill={color}/>
    <circle cx="15" cy="7" r="1.5" fill={color}/>
    <circle cx="9" cy="12" r="1.5" fill={color}/>
    <circle cx="15" cy="12" r="1.5" fill={color}/>
    <circle cx="9" cy="17" r="1.5" fill={color}/>
    <circle cx="15" cy="17" r="1.5" fill={color}/>
  </svg>;
}

Object.assign(window, {
  ItemThumb, ShelfCard, BottomNav, TopBar, Badge, StepDots,
  ProfileIcon, FriendsIcon, PlusIcon, SearchIcon, SettingsIcon, ShareIcon, GripIcon,
});
