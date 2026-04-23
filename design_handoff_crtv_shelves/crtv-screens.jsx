// crtv_shelves — Screen Components

const { useState, useEffect, useRef } = React;

// ── WELCOME ───────────────────────────────────────────────────────────────────
function WelcomeScreen({ navigate }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden',
      background: `linear-gradient(160deg, #FF5F00 0%, #CC3A00 45%, #131313 100%)` }}>
      {/* Decorative grid of shelf cards in background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        {SHELVES.flatMap(s => s.items.slice(0,4)).map((item, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i % 5) * 22}%`, top: `${Math.floor(i / 5) * 22}%`,
            width: 64, height: 64, borderRadius: 10,
            background: `linear-gradient(135deg, ${item.c1}, ${item.c2})`,
            transform: `rotate(${(i % 3 - 1) * 8}deg)`,
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 32px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 4, justifyContent: 'center' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 8, height: 8 + i * 6, borderRadius: 2, background: 'white', opacity: 0.9 }} />
            ))}
          </div>
        </div>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 34, color: 'white',
          letterSpacing: '-1.5px', marginBottom: 10, textAlign: 'center' }}>
          crtv_shelves
        </h1>
        <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', marginBottom: 8, letterSpacing: '-0.2px', lineHeight: 1.5 }}>
          rank what you love.
        </p>
        <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,0.45)',
          textAlign: 'center', marginBottom: 52, letterSpacing: '-0.1px', lineHeight: 1.6, maxWidth: 240 }}>
          Build shelves of music, film, TV & more — share a link, discover through friends.
        </p>
        <button onClick={() => navigate('profile')} style={{
          width: '100%', maxWidth: 280, padding: '16px 0', borderRadius: 20, border: 'none',
          background: 'white', color: '#131313', fontFamily: 'Inter', fontWeight: 800,
          fontSize: 15, letterSpacing: '-0.3px', cursor: 'pointer', marginBottom: 14,
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          get started
        </button>
        <button onClick={() => navigate('profile')} style={{
          width: '100%', maxWidth: 280, padding: '14px 0', borderRadius: 20,
          border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent',
          color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
          letterSpacing: '-0.2px', cursor: 'pointer',
        }}>
          sign in
        </button>
        <p style={{ marginTop: 28, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter', fontWeight: 500, letterSpacing: '0.3px' }}>
          SOCIAL · BY · LINK
        </p>
      </div>
    </div>
  );
}

// ── PROFILE FEED ──────────────────────────────────────────────────────────────
function ProfileScreen({ navigate, tweaks }) {
  const cols = tweaks?.gridCols || 2;
  const cardSpacing = cols === 2 ? 12 : 8;
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 16px 12px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #FF5F00, #CC3A00)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 16, color: 'white' }}>jd</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 16, color: TEXT, letterSpacing: '-0.5px' }}>jd.taste</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, color: MUTED }}>4 shelves · 142 views</div>
            </div>
          </div>
          <button onClick={() => navigate('reorder')} style={{
            background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '6px 12px',
            fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: TEXT, cursor: 'pointer', letterSpacing: '-0.2px',
          }}>reorder</button>
        </div>
      </div>
      {/* Shelf grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 88 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: cardSpacing }}>
          {SHELVES.map(shelf => (
            <ShelfCard key={shelf.id} shelf={shelf} cols={cols}
              onClick={() => navigate('shelf', { shelf })} />
          ))}
          {/* Add shelf card */}
          <div onClick={() => navigate('create_basics')} style={{
            width: cols === 2 ? 156 : 104, height: cols === 2 ? 190 : 126,
            borderRadius: 16, border: `1.5px dashed ${BORDER}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
            <div style={{ width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: MUTED }}>new shelf</span>
          </div>
        </div>
      </div>
      <BottomNav screen="profile" navigate={navigate} />
    </div>
  );
}

// ── SINGLE SHELF VIEW ─────────────────────────────────────────────────────────
function ShelfScreen({ navigate, params }) {
  const shelf = params?.shelf || SHELVES[0];
  // Dynamic gradient: derived from #1 item's color palette
  const dominantColor = shelf.items[0]?.c1 || '#7C1C1C';
  const displayCount = shelf.size === 'podium' ? 3 : shelf.size === 'focus' ? 5 : 8;
  const items = shelf.items.slice(0, displayCount);
  const [copied, setCopied] = useState(false);
  const handleShare = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      {/* Gradient header */}
      <div style={{ position: 'relative', paddingTop: 0, flexShrink: 0 }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 200,
          background: `linear-gradient(180deg, ${dominantColor} 0%, ${dominantColor}CC 40%, ${BG} 100%)`,
          zIndex: 0,
        }} />
        {/* Top bar over gradient */}
        <div style={{
          position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '48px 16px 0',
        }}>
          <button onClick={() => navigate('profile')} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4l-6 5 6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={handleShare} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: copied ? 'rgba(255,95,0,0.3)' : 'rgba(0,0,0,0.3)',
            border: `1px solid ${copied ? ACCENT : 'rgba(255,255,255,0.15)'}`, borderRadius: 10,
            padding: '7px 12px', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
          }}>
            <ShareIcon size={14} color="white" />
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: 'white' }}>{copied ? 'copied!' : 'share'}</span>
          </button>
        </div>
        {/* Shelf hero */}
        <div style={{ position: 'relative', zIndex: 10, padding: '16px 16px 20px' }}>
          <Badge label={`${shelf.category} · ${shelf.type}`} accent />
          <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontStyle: 'italic', fontSize: 28, color: TEXT, letterSpacing: '-1px', marginTop: 8, marginBottom: 4 }}>{shelf.name}</h2>
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>jd.taste · {shelf.shareCount} views</div>
        </div>
      </div>
      {/* Ranked list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 80px' }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 16px', position: 'relative', overflow: 'hidden',
            borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : 'none',
          }}>
            {/* Giant ghost rank */}
            <span style={{
              position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'Inter', fontWeight: 900, fontSize: 80,
              color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
              letterSpacing: '-4px',
            }}>{i + 1}</span>
            {/* Rank number */}
            <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 13, color: i === 0 ? ACCENT : MUTED, width: 20, textAlign: 'center', letterSpacing: '-0.5px', flexShrink: 0 }}>{i + 1}</span>
            {/* Thumb with rank overlay */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ItemThumb item={item} size={52} />
              {/* Translucent rank overlay on image */}
              <span style={{
                position: 'absolute', bottom: -2, right: -2,
                fontFamily: 'Inter', fontWeight: 900, fontSize: 40,
                color: 'rgba(255,255,255,0.18)', lineHeight: 1, userSelect: 'none',
                pointerEvents: 'none', letterSpacing: '-2px',
              }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, color: MUTED, marginTop: 2 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FRIENDS LIST ──────────────────────────────────────────────────────────────
function FriendsScreen({ navigate }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG }}>
      <TopBar title="friends" />
      <div style={{ paddingTop: 52, paddingBottom: 80, overflowY: 'auto', height: '100%' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ flex: 1, background: SURFACE, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchIcon size={14} color={MUTED} />
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED }}>find a friend…</span>
          </div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {FRIENDS.map(friend => (
            <div key={friend.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: `1px solid ${BORDER}`, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => navigate('friend_shelf', { shelf: { ...friend.topShelf, shareCount: friend.viewers }, friendName: friend.name })}>
              <div style={{ width: 44, height: 44, borderRadius: 15, background: `linear-gradient(135deg, ${friend.color}, ${friend.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 14, color: 'white' }}>{friend.initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: '-0.3px' }}>{friend.name}</div>
                <div style={{ fontFamily: 'Inter', fontWeight: 500, fontStyle: 'italic', fontSize: 11, color: MUTED, marginTop: 1 }}>{friend.topShelf.name} · {friend.viewers} views</div>
              </div>
              {/* Mini shelf collage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                {friend.topShelf.items.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ background: `linear-gradient(135deg, ${item.c1}, ${item.c2})` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: MUTED }}>visiting a profile link adds them automatically</p>
        </div>
      </div>
      <BottomNav screen="friends" navigate={navigate} />
    </div>
  );
}

// ── CREATE — BASICS ───────────────────────────────────────────────────────────
function CreateBasicsScreen({ navigate }) {
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const cat = CATEGORIES.find(c => c.id === selected);
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="new shelf" onBack={() => navigate('profile')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '64px 16px 24px' }}>
        <StepDots total={4} current={0} />
        <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 22, color: TEXT, letterSpacing: '-0.8px', marginTop: 16, marginBottom: 4 }}>what are you ranking?</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED, marginBottom: 20 }}>choose a category</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={() => { setSelected(cat.id); setSelectedType(null); }} style={{
              padding: '16px', borderRadius: 16, cursor: 'pointer',
              background: selected === cat.id ? `linear-gradient(135deg, ${cat.c1}, ${cat.c2})` : SURFACE,
              border: `1.5px solid ${selected === cat.id ? 'transparent' : BORDER}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 22, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{cat.emoji}</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: '-0.3px' }}>{cat.label}</div>
            </div>
          ))}
        </div>
        {cat && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED, marginBottom: 10 }}>item type</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cat.types.map(type => (
                <button key={type} onClick={() => setSelectedType(type)} style={{
                  padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: selectedType === type ? ACCENT : SURFACE2,
                  color: selectedType === type ? 'white' : TEXT,
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
                  transition: 'all 0.15s',
                }}>{type}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => selectedType && navigate('create_size')} style={{
          width: '100%', padding: '15px', borderRadius: 18, border: 'none',
          background: selectedType ? ACCENT : SURFACE2,
          color: selectedType ? 'white' : MUTED,
          fontFamily: 'Inter', fontWeight: 800, fontSize: 15, cursor: selectedType ? 'pointer' : 'default',
          transition: 'all 0.2s', letterSpacing: '-0.3px',
        }}>continue →</button>
      </div>
    </div>
  );
}

// ── CREATE — NAME ─────────────────────────────────────────────────────────────
function CreateNameScreen({ navigate, params }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);
  const suggestions = ['top artists', 'fav albums', 'all time films', 'desert island picks', 'current rotation', 'hall of fame'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="new shelf" onBack={() => navigate('create_basics')} />
      <div style={{ flex: 1, padding: '64px 16px 24px', display: 'flex', flexDirection: 'column' }}>
        <StepDots total={4} current={1} />
        <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 22, color: TEXT, letterSpacing: '-0.8px', marginTop: 16, marginBottom: 4 }}>name your shelf</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED, marginBottom: 24 }}>something short and honest</p>
        {/* Input */}
        <div style={{
          background: SURFACE, borderRadius: 16, padding: '14px 16px',
          border: `1.5px solid ${name.length > 0 ? ACCENT : BORDER}`,
          display: 'flex', alignItems: 'center', gap: 10,
          transition: 'border-color 0.2s', marginBottom: 20,
        }}>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value.toLowerCase())}
            maxLength={32}
            placeholder="name this shelf…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'Inter', fontWeight: 700, fontSize: 18,
              color: TEXT, letterSpacing: '-0.5px',
            }}
          />
          {name && <span style={{ fontFamily: 'Inter', fontSize: 11, color: MUTED, flexShrink: 0 }}>{32 - name.length}</span>}
        </div>
        {/* Suggestions */}
        <p style={{ fontFamily: 'Inter', fontSize: 11, color: MUTED, marginBottom: 10, letterSpacing: '0.4px', textTransform: 'uppercase', fontWeight: 600 }}>suggestions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setName(s)} style={{
              padding: '7px 13px', borderRadius: 12, border: `1px solid ${name === s ? ACCENT : BORDER}`,
              background: name === s ? `rgba(0,204,136,0.12)` : SURFACE2,
              color: name === s ? ACCENT : MUTED,
              fontFamily: 'Inter', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              transition: 'all 0.15s', letterSpacing: '-0.2px',
            }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => name.trim() && navigate('create_size', { ...params, shelfName: name.trim() })} style={{
          width: '100%', padding: '15px', borderRadius: 18, border: 'none',
          background: name.trim() ? ACCENT : SURFACE2,
          color: name.trim() ? 'white' : MUTED,
          fontFamily: 'Inter', fontWeight: 800, fontSize: 15, cursor: name.trim() ? 'pointer' : 'default',
          transition: 'all 0.2s', letterSpacing: '-0.3px',
        }}>continue →</button>
      </div>
    </div>
  );
}


function CreateSizeScreen({ navigate }) {
  const [selected, setSelected] = useState('focus');
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="new shelf" onBack={() => navigate('create_name')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '64px 16px 24px' }}>
        <StepDots total={4} current={2} />
        <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 22, color: TEXT, letterSpacing: '-0.8px', marginTop: 16, marginBottom: 4 }}>pick a format</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED, marginBottom: 24 }}>how many slots on this shelf?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SIZES.map(size => (
            <div key={size.id} onClick={() => setSelected(size.id)} style={{
              padding: '20px', borderRadius: 20, cursor: 'pointer',
              background: selected === size.id ? 'rgba(245,158,11,0.08)' : SURFACE,
              border: `1.5px solid ${selected === size.id ? '#F59E0B' : BORDER}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 16, color: TEXT, letterSpacing: '-0.4px' }}>{size.label}</span>
                <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 24, color: selected === size.id ? '#F59E0B' : MUTED }}>{size.count}</span>
              </div>
              {/* Visual slot preview */}
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: size.count }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 36, borderRadius: 8,
                    background: selected === size.id ? `rgba(245,158,11,${0.22 - i * 0.02})` : SURFACE2,
                    border: `1px solid ${selected === size.id ? 'rgba(245,158,11,0.4)' : BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 11, color: selected === size.id ? '#F59E0B' : BORDER }}>{i + 1}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: MUTED, marginTop: 10 }}>{size.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => navigate('create_curation', { size: SIZES.find(s => s.id === selected) })} style={{
          width: '100%', padding: '15px', borderRadius: 18, border: 'none',
          background: ACCENT, color: 'white',
          fontFamily: 'Inter', fontWeight: 800, fontSize: 15, cursor: 'pointer',
          letterSpacing: '-0.3px',
        }}>continue →</button>
      </div>
    </div>
  );
}

// ── CREATE — CURATION ─────────────────────────────────────────────────────────
function CreateCurationScreen({ navigate, params }) {
  const size = params?.size || SIZES[1];
  const [slots, setSlots] = useState(Array(size.count).fill(null));
  const [activeSlot, setActiveSlot] = useState(null);
  const handleSearchResult = (item) => {
    if (activeSlot !== null) {
      const newSlots = [...slots];
      newSlots[activeSlot] = item;
      setSlots(newSlots);
      setActiveSlot(null);
    }
  };
  const filled = slots.filter(Boolean).length;
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="add items" onBack={() => navigate('create_size')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '64px 16px 24px' }}>
        <StepDots total={4} current={3} />
        <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 22, color: TEXT, letterSpacing: '-0.8px', marginTop: 16, marginBottom: 4 }}>fill your shelf</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED, marginBottom: 20 }}>{filled} of {size.count} slots filled</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slots.map((item, i) => (
            <div key={i} onClick={() => { setActiveSlot(i); navigate('search', { onSelect: handleSearchResult, slotIndex: i }); }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: SURFACE, borderRadius: 16,
              border: `1.5px solid ${item ? BORDER : 'rgba(0,204,136,0.2)'}`,

              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 14, color: item ? ACCENT : MUTED, width: 20, flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
              {item ? (
                <>
                  <ItemThumb item={item} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: TEXT, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 11, color: MUTED, marginTop: 1 }}>{item.sub}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </>
              ) : (
                <>
                  <div style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px dashed rgba(255,95,0,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4v8M4 8h8" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></svg>
                  </div>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'rgba(255,95,0,0.5)' }}>add item…</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => navigate('profile')} style={{
          width: '100%', padding: '15px', borderRadius: 18, border: 'none',
          background: filled > 0 ? ACCENT : SURFACE2,
          color: filled > 0 ? 'white' : MUTED,
          fontFamily: 'Inter', fontWeight: 800, fontSize: 15,
          cursor: filled > 0 ? 'pointer' : 'default', letterSpacing: '-0.3px',
          transition: 'all 0.2s',
        }}>save shelf</button>
      </div>
    </div>
  );
}

// ── ITEM SEARCH ───────────────────────────────────────────────────────────────
function SearchScreen({ navigate, params }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('music_artists');
  const filters = [
    { id: 'music_artists', label: 'Artists' },
    { id: 'music_albums',  label: 'Albums'  },
    { id: 'films',         label: 'Films'   },
    { id: 'tv',            label: 'Shows'   },
  ];
  const allItems = [...(ITEMS[filter] || []), ...(SEARCH_RESULTS[filter] || [])];
  const results = query.length > 0
    ? allItems.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_RESULTS[filter] || [];
  const isModal = !!params?.onSelect;
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="search" onBack={() => navigate(isModal ? 'create_curation' : 'profile')} />
      <div style={{ paddingTop: 52, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Search input */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ background: SURFACE, borderRadius: 14, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${BORDER}` }}>
            <SearchIcon size={16} color={MUTED} />
            <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
              placeholder="search anything…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: TEXT, letterSpacing: '-0.2px' }}
            />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>}
          </div>
        </div>
        {/* Filter tabs */}
        <div style={{ padding: '10px 16px', display: 'flex', gap: 8, borderBottom: `1px solid ${BORDER}` }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: filter === f.id ? ACCENT : SURFACE2,
              color: filter === f.id ? 'white' : MUTED,
              fontFamily: 'Inter', fontWeight: 700, fontSize: 12, transition: 'all 0.15s',
            }}>{f.label}</button>
          ))}
        </div>
        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: isModal ? 24 : 80 }}>
          {!query && <p style={{ padding: '16px', fontFamily: 'Inter', fontSize: 12, color: MUTED }}>popular picks</p>}
          {results.map(item => (
            <div key={item.id} onClick={() => {
              if (isModal && params.onSelect) { params.onSelect(item); navigate('create_curation'); }
            }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
              borderBottom: `1px solid ${BORDER}`, cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <ItemThumb item={item} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: MUTED, marginTop: 2 }}>{item.sub}</div>
              </div>
              {isModal && <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,95,0,0.15)', border: '1px solid rgba(255,95,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>}
            </div>
          ))}
        </div>
      </div>
      {!isModal && <BottomNav screen="search" navigate={navigate} />}
    </div>
  );
}

// ── REORDER SHELVES ───────────────────────────────────────────────────────────
function ReorderScreen({ navigate }) {
  const [order, setOrder] = useState(SHELVES.map((_, i) => i));
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const handleDragStart = i => setDragging(i);
  const handleDragOver = (e, i) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = i => {
    if (dragging === null || dragging === i) { setDragging(null); setDragOver(null); return; }
    const newOrder = [...order];
    const [removed] = newOrder.splice(dragging, 1);
    newOrder.splice(i, 0, removed);
    setOrder(newOrder);
    setDragging(null); setDragOver(null);
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG }}>
      <TopBar title="reorder shelves" onBack={() => navigate('profile')}
        right={<button onClick={() => navigate('profile')} style={{ background: ACCENT, border: 'none', borderRadius: 8, padding: '5px 10px', fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: 'white', cursor: 'pointer' }}>done</button>}
      />
      <div style={{ paddingTop: 64, padding: '64px 16px 24px' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: MUTED, marginBottom: 16 }}>drag to reorder</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {order.map((shelfIdx, i) => {
            const shelf = SHELVES[shelfIdx];
            return (
              <div key={shelf.id} draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: dragOver === i ? 'rgba(255,95,0,0.08)' : SURFACE,
                  borderRadius: 16, border: `1.5px solid ${dragOver === i ? ACCENT : BORDER}`,
                  cursor: 'grab', transition: 'all 0.15s',
                  opacity: dragging === i ? 0.4 : 1,
                }}>
                <GripIcon />
                {/* Mini collage */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  {shelf.items.slice(0, 4).map((item, j) => (
                    <div key={j} style={{ background: `linear-gradient(135deg, ${item.c1}, ${item.c2})` }} />
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Inter', fontWeight: 700, fontStyle: 'italic', fontSize: 14, color: TEXT, letterSpacing: '-0.3px' }}>{shelf.name}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, color: MUTED, marginTop: 2 }}>{shelf.category} · {shelf.type}</div>
                </div>
                <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: BORDER }}>#{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsScreen({ navigate }) {
  const [linkSharing, setLinkSharing] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const sections = [
    {
      title: 'profile',
      rows: [
        { label: 'username', value: 'jd.taste', action: 'edit' },
        { label: 'profile link', value: 'crtv.sh/jd.taste', action: 'copy' },
        { label: 'avatar', value: '', action: 'edit' },
      ]
    },
    {
      title: 'sharing',
      rows: [
        { label: 'link sharing', toggle: true, val: linkSharing, set: setLinkSharing },
        { label: 'private mode', toggle: true, val: privateMode, set: setPrivateMode },
      ]
    },
    {
      title: 'account',
      rows: [
        { label: 'notifications', value: 'on', action: 'edit' },
        { label: 'export data', value: '', action: 'arrow' },
        { label: 'sign out', value: '', action: 'danger' },
      ]
    },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG }}>
      <TopBar title="settings" />
      <div style={{ paddingTop: 52, overflowY: 'auto', height: '100%', paddingBottom: 80 }}>
        {/* Profile hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: 'linear-gradient(135deg, #FF5F00, #CC3A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 28, color: 'white' }}>jd</span>
          </div>
          <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: TEXT, letterSpacing: '-0.5px' }}>jd.taste</div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: MUTED, marginTop: 2 }}>crtv.sh/jd.taste</div>
        </div>
        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <div style={{ padding: '0 16px 8px', fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: MUTED, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{section.title}</div>
            <div style={{ background: SURFACE, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, margin: '0 16px' }}>
              {section.rows.map((row, i) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderBottom: i < section.rows.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: row.action === 'danger' ? '#FF4444' : TEXT }}>{row.label}</span>
                  {row.toggle ? (
                    <div onClick={() => row.set(!row.val)} style={{
                      width: 44, height: 26, borderRadius: 13, cursor: 'pointer',
                      background: row.val ? ACCENT : SURFACE2, transition: 'background 0.2s',
                      position: 'relative', border: `1px solid ${row.val ? 'transparent' : BORDER}`,
                    }}>
                      <div style={{ position: 'absolute', top: 3, left: row.val ? 21 : 3, width: 18, height: 18, borderRadius: 9, background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: MUTED }}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 11, color: BORDER, letterSpacing: '0.5px' }}>crtv_shelves v1.0 · vivid sonic</p>
        </div>
      </div>
      <BottomNav screen="settings" navigate={navigate} />
    </div>
  );
}

Object.assign(window, {
  WelcomeScreen, ProfileScreen, ShelfScreen, FriendsScreen,
  CreateBasicsScreen, CreateNameScreen, CreateSizeScreen, CreateCurationScreen,
  SearchScreen, ReorderScreen, SettingsScreen,
});
