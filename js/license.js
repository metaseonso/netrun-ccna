/* license.js — the NETRUNNER://CCNA license card, drawn as SVG from a license record.
   Used in the game (the completion screen) and by tools/hall.js (the Hall of Fame robot), so every card is the same.
   LicenseCard.svg({ number, issued, handle, cls, difficulty, theme, stats: { nights, gigs, clean, hours, saved, lost, flatlines, fixers } })
   theme: the deck skin the card is printed in (default, ember, ghost, noir), one the runner used during the run.
   difficulty: easy is a plain card; normal adds a holographic sheen and a stamp; cyberpsycho adds a glowing double
   frame, a glitching title, a hazard stripe and circuit traces from the chip. */
(function(root){
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toISOString().slice(0, 10); };
  // the deck skins, as the card prints them (css/world.css has the same colours for the screens)
  const THEMES = {
    default: { frame: '#3ff6ff', accent: '#ff3fa4', gold: '#ffd23f', ink: '#e6f1ff', ink2: '#9fb3d1', dim: '#5f7396', line: '#233049', bg1: '#101522', bg2: '#07080d' },
    ember:   { frame: '#ff9f43', accent: '#ff4b5c', gold: '#ffd23f', ink: '#fff1e0', ink2: '#d9b89a', dim: '#8a6b55', line: '#4a2f22', bg1: '#1c130d', bg2: '#0a0705' },
    ghost:   { frame: '#e6f1ff', accent: '#c9ced8', gold: '#ffffff', ink: '#ffffff', ink2: '#9fb3d1', dim: '#6c778a', line: '#2a3140', bg1: '#161a23', bg2: '#0b0d12' },
    noir:    { frame: '#4dff88', accent: '#4dff88', gold: '#b9f5c9', ink: '#d8ffe4', ink2: '#7fcf98', dim: '#3f7a52', line: '#143a22', bg1: '#08140c', bg2: '#030805' }
  };
  const TIER = { easy: 0, normal: 1, cyberpsycho: 2 };
  function svg(r){ r = r || {}; const st = r.stats || {}; const W = 1016, H = 640;
    const T = THEMES[r.theme] || THEMES.default, tier = TIER[r.difficulty] != null ? TIER[r.difficulty] : -1;
    const cell = (x, y, k, v) => '<text x="' + x + '" y="' + y + '" class="k">' + esc(k) + '</text><text x="' + x + '" y="' + (y + 34) + '" class="v">' + esc(v) + '</text>';
    const handle = String(r.handle || 'unknown').slice(0, 18);
    const size = handle.length > 12 ? 52 : 68;
    const title = (x, y, c1, c2, c3) => '<text x="' + x + '" y="' + y + '" class="d" font-size="36" font-weight="800" fill="' + c1 + '" letter-spacing="6">NETRUNNER<tspan fill="' + c2 + '">://</tspan><tspan fill="' + (c3 || c1) + '">CCNA</tspan></text>';
    const name = String(r.difficulty || '').toUpperCase();
    const line = 'Cleared the Watson Exchange on Opening Night' + (name ? ' at ' + name.charAt(0) + name.slice(1).toLowerCase() + ' difficulty.' : '.');

    let defs = '<style>@import url(https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap);' +
      '.d{font-family:Orbitron,sans-serif}.m{font-family:"JetBrains Mono",Consolas,monospace}.k{font-family:"JetBrains Mono",monospace;font-size:15px;letter-spacing:3px;fill:' + T.ink2 + '}.v{font-family:Orbitron,sans-serif;font-size:26px;fill:' + T.ink + '}</style>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + T.bg1 + '"/><stop offset="1" stop-color="' + T.bg2 + '"/></linearGradient>' +
      '<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="' + T.line + '" stroke-width="1" opacity=".45"/></pattern>' ;
    if (tier >= 1) defs += '<linearGradient id="foil" x1="0" y1="0" x2="1" y2="0.35" gradientUnits="objectBoundingBox">' +
      '<stop offset="0" stop-color="' + T.frame + '" stop-opacity="0"/><stop offset=".42" stop-color="' + T.frame + '" stop-opacity=".16"/><stop offset=".5" stop-color="' + T.gold + '" stop-opacity=".28"/>' +
      '<stop offset=".58" stop-color="' + T.accent + '" stop-opacity=".16"/><stop offset="1" stop-color="' + T.accent + '" stop-opacity="0"/>' +
      '<animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;1 0" keyTimes="0;.6;1" dur="7s" repeatCount="indefinite"/></linearGradient>';
    if (tier === 2) defs += '<filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<pattern id="hazard" width="28" height="10" patternUnits="userSpaceOnUse" patternTransform="skewX(-40)"><rect width="14" height="10" fill="' + T.accent + '"/><rect x="14" width="14" height="10" fill="' + T.bg2 + '"/>' +
      '<animateTransform attributeName="patternTransform" type="translate" values="0 0;28 0" dur="1.6s" additive="sum" repeatCount="indefinite"/></pattern>';

    // the frame: one line, or a glowing double line on cyberpsycho
    const frame = tier === 2
      ? '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="none" stroke="' + T.accent + '" stroke-width="4" filter="url(#glow)"/>' +
        '<rect x="14" y="14" width="' + (W - 28) + '" height="' + (H - 28) + '" rx="20" fill="none" stroke="' + T.frame + '" stroke-width="1.5" opacity=".8"/>'
      : '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="none" stroke="' + T.frame + '" stroke-width="3"/>';
    // the title: glitched on cyberpsycho (two offset ghosts that jump every few seconds)
    const head = tier === 2
      ? '<g opacity=".75"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-4 1;3 -1;0 0" keyTimes="0;.86;.9;.94;1" dur="3.4s" repeatCount="indefinite"/>' + title(45, 74, T.accent, T.accent) + '</g>' +
        '<g opacity=".75"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;4 -1;-3 1;0 0" keyTimes="0;.86;.9;.94;1" dur="3.4s" repeatCount="indefinite"/>' + title(51, 76, T.frame, T.frame) + '</g>' +
        title(48, 74, T.frame, T.accent)
      : title(48, 74, T.frame, T.accent);
    // the stripe under the header: a hazard band that slides on cyberpsycho
    const stripe = tier === 2 ? '<rect x="4" y="112" width="' + (W - 8) + '" height="12" fill="url(#hazard)"/>' : '<rect x="4" y="112" width="' + (W - 8) + '" height="10" fill="' + T.accent + '"/>';
    // circuit traces running out of the chip, on cyberpsycho
    const traces = tier === 2 ? '<g fill="none" stroke="' + T.frame + '" stroke-width="2" opacity=".35"><path d="M100 244V300H152L170 318"/><path d="M48 204H24V470"/><path d="M152 186H172L180 178"/>' +
      '<circle cx="170" cy="318" r="4" fill="' + T.frame + '"/><circle cx="24" cy="470" r="4" fill="' + T.frame + '"/></g>' : '';
    // the setting under the class: a plain word, a stamp, or a tilted glowing stamp
    const stamp = tier === 0 || tier === -1 ? (name ? '<text x="' + (W - 48) + '" y="294" class="k" text-anchor="end">' + esc(name) + '</text>' : '')
      : '<g transform="translate(' + (W - 48) + ' ' + (tier === 2 ? 284 : 292) + ') rotate(' + (tier === 2 ? -5 : -3) + ')"' + (tier === 2 ? ' filter="url(#glow)"' : '') + '>' +
        '<rect x="' + (tier === 2 ? -214 : -128) + '" y="-24" width="' + (tier === 2 ? 214 : 128) + '" height="34" rx="4" fill="none" stroke="' + (tier === 2 ? T.accent : T.gold) + '" stroke-width="2.5"/>' +
        '<text x="' + (tier === 2 ? -107 : -64) + '" y="0" text-anchor="middle" class="d" font-size="' + (tier === 2 ? 19 : 17) + '" font-weight="800" letter-spacing="4" fill="' + (tier === 2 ? T.accent : T.gold) + '">' + esc(name) + '</text></g>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="NETRUNNER://CCNA license ' + esc(r.number) + ' for ' + esc(handle) + (name ? ', ' + esc(name) : '') + '">' +
      '<defs>' + defs + '</defs>' +
      '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="url(#bg)"/>' +
      '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="url(#grid)"/>' +
      stripe + traces + head +
      '<text x="' + (W - 48) + '" y="58" class="m" font-size="15" fill="' + T.ink2 + '" text-anchor="end" letter-spacing="3">WATSON NETRUNNER BOARD</text>' +
      '<text x="' + (W - 48) + '" y="84" class="d" font-size="22" fill="' + T.gold + '" text-anchor="end" letter-spacing="4">LICENSE</text>' +
      // the chip
      '<g transform="translate(48 164)"><rect width="104" height="80" rx="12" fill="' + T.gold + '" opacity=".92"/><path d="M0 27H104M0 53H104M35 0V80M69 0V80" stroke="' + T.bg2 + '" stroke-width="3" opacity=".55"/></g>' +
      '<text x="190" y="190" class="k">HANDLE</text><text x="190" y="' + (190 + size) + '" class="d" font-size="' + size + '" font-weight="800" fill="' + T.ink + '">' + esc(handle) + '</text>' +
      '<text x="' + (W - 48) + '" y="190" class="k" text-anchor="end">CLASS</text><text x="' + (W - 48) + '" y="262" class="d" font-size="72" font-weight="800" fill="' + T.accent + '" text-anchor="end">' + esc(r.cls || 'A') + '</text>' +
      stamp +
      cell(48, 340, 'LICENSE NO.', r.number || 'NR-??????') + cell(330, 340, 'ISSUED', day(r.issued)) + cell(560, 340, 'NIGHTS', typeof st.nights === 'string' ? st.nights : (st.nights || 0) + ' / 63') + cell(780, 340, 'GIGS CLEARED', st.gigs || 0) +
      cell(48, 440, 'CLEAN FLOORS', (st.clean == null ? '—' : typeof st.clean === 'string' ? st.clean : st.clean + '%')) + cell(330, 440, 'HOURS ON THE NET', st.hours || 0) + cell(560, 440, 'CREW SAVED', st.saved || 0) + cell(780, 440, 'FLATLINES', st.flatlines || 0) +
      '<line x1="48" y1="520" x2="' + (W - 48) + '" y2="520" stroke="' + T.line + '" stroke-width="2"/>' +
      '<text x="48" y="560" class="m" font-size="16" fill="' + (tier === 2 ? T.accent : T.ink2) + '">' + esc(r.line || line) + '</text>' +
      '<text x="48" y="596" class="m" font-size="13" fill="' + T.dim + '">A game license from a meta art piece by Seonso. Not a Cisco certification. CCNA is a trademark of Cisco Systems, Inc.</text>' +
      (tier >= 1 ? '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="url(#foil)" pointer-events="none"/>' : '') +
      frame +
      '</svg>'; }
  const api = { svg, THEMES: Object.keys(THEMES) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LicenseCard = api;
})(typeof window !== 'undefined' ? window : globalThis);
