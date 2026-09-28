/* license.js — the NETRUNNER://CCNA license card, drawn as SVG from a license record.
   Used in the game (the completion screen) and by tools/hall.js (the Hall of Fame robot), so every card is the same.
   LicenseCard.svg({ number, issued, handle, cls, stats: { nights, gigs, clean, hours, saved, lost, flatlines, fixers } }) */
(function(root){
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toISOString().slice(0, 10); };
  function svg(r){ r = r || {}; const st = r.stats || {}; const W = 1016, H = 640;
    const cell = (x, y, k, v) => '<text x="' + x + '" y="' + y + '" class="k">' + esc(k) + '</text><text x="' + x + '" y="' + (y + 34) + '" class="v">' + esc(v) + '</text>';
    const handle = String(r.handle || 'unknown').slice(0, 18);
    const size = handle.length > 12 ? 52 : 68;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="NETRUNNER://CCNA license ' + esc(r.number) + ' for ' + esc(handle) + '">' +
      '<defs><style>@import url(https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap);' +
      '.d{font-family:Orbitron,sans-serif}.m{font-family:"JetBrains Mono",Consolas,monospace}.k{font-family:"JetBrains Mono",monospace;font-size:15px;letter-spacing:3px;fill:#9fb3d1}.v{font-family:Orbitron,sans-serif;font-size:26px;fill:#e6f1ff}</style>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101522"/><stop offset="1" stop-color="#07080d"/></linearGradient>' +
      '<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#233049" stroke-width="1" opacity=".45"/></pattern></defs>' +
      '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="url(#bg)" stroke="#3ff6ff" stroke-width="3"/>' +
      '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (H - 8) + '" rx="28" fill="url(#grid)"/>' +
      '<rect x="4" y="112" width="' + (W - 8) + '" height="10" fill="#ff3fa4"/>' +
      '<text x="48" y="74" class="d" font-size="36" font-weight="800" fill="#3ff6ff" letter-spacing="6">NETRUNNER<tspan fill="#ff3fa4">://</tspan>CCNA</text>' +
      '<text x="' + (W - 48) + '" y="58" class="m" font-size="15" fill="#9fb3d1" text-anchor="end" letter-spacing="3">WATSON NETRUNNER BOARD</text>' +
      '<text x="' + (W - 48) + '" y="84" class="d" font-size="22" fill="#ffd23f" text-anchor="end" letter-spacing="4">LICENSE</text>' +
      // the chip
      '<g transform="translate(48 164)"><rect width="104" height="80" rx="12" fill="#ffd23f" opacity=".92"/><path d="M0 27H104M0 53H104M35 0V80M69 0V80" stroke="#07080d" stroke-width="3" opacity=".55"/></g>' +
      '<text x="190" y="190" class="k">HANDLE</text><text x="190" y="' + (190 + size) + '" class="d" font-size="' + size + '" font-weight="800" fill="#e6f1ff">' + esc(handle) + '</text>' +
      '<text x="' + (W - 48) + '" y="190" class="k" text-anchor="end">CLASS</text><text x="' + (W - 48) + '" y="262" class="d" font-size="72" font-weight="800" fill="#ff3fa4" text-anchor="end">' + esc(r.cls || 'A') + '</text>' +
      cell(48, 340, 'LICENSE NO.', r.number || 'NR-??????') + cell(330, 340, 'ISSUED', day(r.issued)) + cell(560, 340, 'NIGHTS', typeof st.nights === 'string' ? st.nights : (st.nights || 0) + ' / 63') + cell(780, 340, 'GIGS CLEARED', st.gigs || 0) +
      cell(48, 440, 'CLEAN FLOORS', (st.clean == null ? '—' : typeof st.clean === 'string' ? st.clean : st.clean + '%')) + cell(330, 440, 'HOURS ON THE NET', st.hours || 0) + cell(560, 440, 'CREW SAVED', st.saved || 0) + cell(780, 440, 'FLATLINES', st.flatlines || 0) +
      '<line x1="48" y1="520" x2="' + (W - 48) + '" y2="520" stroke="#233049" stroke-width="2"/>' +
      '<text x="48" y="560" class="m" font-size="16" fill="#9fb3d1">' + esc(r.line || 'Cleared the Watson Exchange on Opening Night. The lights stayed on.') + '</text>' +
      '<text x="48" y="596" class="m" font-size="13" fill="#5f7396">A game license from a meta art piece by Seonso. Not a Cisco certification. CCNA is a trademark of Cisco Systems, Inc.</text>' +
      '</svg>'; }
  const api = { svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LicenseCard = api;
})(typeof window !== 'undefined' ? window : globalThis);
