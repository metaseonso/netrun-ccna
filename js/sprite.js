/* sprite.js — procedural pixel NPC portraits.
   Draws a 24x24 pixel bust on a canvas from an NPC "look" spec.
   If assets/npc/<id>.png exists it is used instead (see ui.js). */
(function(){
  const W = 24, H = 24;

  function rng(seed){ let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 1000) / 1000; }; }

  function shade(hex, k){ // k>1 lighter, k<1 darker
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.min(255, Math.round(r * k)); g = Math.min(255, Math.round(g * k)); b = Math.min(255, Math.round(b * k));
    return `rgb(${r},${g},${b})`;
  }

  // paint helper: symmetric fill of a row segment
  function make(look, opts){
    opts = opts || {};
    const px = [];
    for (let y = 0; y < H; y++) { px.push(new Array(W).fill(null)); }
    const set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) px[y][x] = c; };
    const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
    const r = rng(look.seed || 'npc');
    const skin = look.skin || '#e0b08a', hair = look.hair || '#2a2a33', outfit = look.outfit || '#2b3a55', accent = look.accent || '#3ff6ff';
    const eyes = look.eyes || '#3ff6ff';
    const blink = !!opts.blink;

    // torso
    rect(5, 18, 18, 23, outfit); rect(7, 17, 16, 17, outfit);
    rect(5, 18, 6, 23, shade(outfit, .75)); rect(17, 18, 18, 23, shade(outfit, .75));
    // collar / accent stripe
    rect(10, 17, 13, 18, accent);
    if (look.stripe) rect(6, 20, 8, 20, accent);
    // neck
    rect(10, 15, 13, 17, shade(skin, .85));
    // head
    rect(7, 5, 16, 15, skin); rect(6, 7, 6, 13, skin); rect(17, 7, 17, 13, skin);
    rect(7, 15, 16, 15, shade(skin, .8));
    // ears
    set(6, 10, shade(skin, .9)); set(17, 10, shade(skin, .9));
    // hair styles
    const hs = look.hairStyle || 'short';
    if (hs !== 'bald') {
      rect(7, 4, 16, 6, hair); rect(6, 5, 6, 8, hair); rect(17, 5, 17, 8, hair);
      if (hs === 'long') { rect(6, 5, 6, 15, hair); rect(17, 5, 17, 15, hair); rect(5, 9, 5, 16, hair); rect(18, 9, 18, 16, hair); }
      if (hs === 'mohawk') { rect(10, 1, 13, 4, hair); rect(11, 0, 12, 0, hair); rect(7, 5, 16, 5, skin); rect(7, 4, 16, 4, skin); rect(10, 4, 13, 5, hair); rect(6,5,6,8,skin); rect(17,5,17,8,skin); }
      if (hs === 'spiky') { for (let x = 7; x <= 16; x += 2) set(x, 3, hair); set(8, 2, hair); set(13, 2, hair); }
      if (hs === 'bob') { rect(6, 5, 6, 12, hair); rect(17, 5, 17, 12, hair); rect(7, 4, 16, 7, hair); }
      if (hs === 'bun') { rect(10, 2, 13, 4, hair); rect(11, 1, 12, 1, hair); }
      if (hs === 'wild') { for (let i = 0; i < 12; i++) set(6 + Math.floor(r() * 12), 2 + Math.floor(r() * 3), hair); rect(7, 4, 16, 6, hair); }
      if (hs === 'grey' ) { rect(7,4,16,6,'#c9ced8'); rect(6,5,6,9,'#c9ced8'); rect(17,5,17,9,'#c9ced8'); }
    }
    // brows
    rect(8, 8, 10, 8, shade(hair, .8)); rect(13, 8, 15, 8, shade(hair, .8));
    // eyes
    if (blink) { rect(8, 10, 10, 10, shade(skin, .6)); rect(13, 10, 15, 10, shade(skin, .6)); }
    else { rect(8, 9, 10, 10, '#f4f7ff'); rect(13, 9, 15, 10, '#f4f7ff'); set(9, 10, eyes); set(14, 10, eyes); set(9, 9, shade(eyes, .7)); set(14, 9, shade(eyes, .7)); }
    // nose + mouth
    set(12, 12, shade(skin, .8)); set(11, 12, shade(skin, .9));
    const mood = look.mood || 'flat';
    if (mood === 'smile') { set(10, 14, shade(skin, .6)); rect(11, 14, 12, 14, '#a0452f'); set(13, 14, shade(skin, .6)); set(10,13,shade(skin,.7)); set(13,13,shade(skin,.7)); }
    else if (mood === 'grin') { rect(9, 14, 14, 14, '#a0452f'); rect(10, 14, 13, 14, '#f4f7ff'); }
    else if (mood === 'frown') { rect(10, 14, 13, 14, '#8a3a2a'); set(10,13,'#8a3a2a'); set(13,13,'#8a3a2a'); }
    else { rect(10, 14, 13, 14, '#8a3a2a'); }
    // facial extras
    if (look.beard) { rect(8, 13, 15, 15, hair); rect(9, 16, 14, 16, hair); rect(10, 14, 13, 14, '#8a3a2a'); }
    if (look.glasses) { rect(7, 9, 10, 10, null); rect(13, 9, 16, 10, null); rect(7, 9, 10, 10, look.glassTint || 'rgba(63,246,255,.55)'); rect(13, 9, 16, 10, look.glassTint || 'rgba(63,246,255,.55)'); set(11, 9, accent); set(12, 9, accent); set(7,9,accent); set(16,9,accent); set(7,10,accent); set(16,10,accent); }
    if (look.visor) { rect(6, 8, 17, 10, look.visorColor || '#ff3fa4'); rect(7, 9, 16, 9, shade(look.visorColor || '#ff3fa4', 1.5)); }
    if (look.eyepatch) { rect(13, 9, 15, 10, '#111'); set(12, 8, '#111'); set(16, 8, '#111'); }
    if (look.scar) { set(15, 6, '#c86b5a'); set(15, 7, '#c86b5a'); set(16, 8, '#c86b5a'); }
    if (look.mask) { rect(8, 12, 15, 15, look.maskColor || '#1b2233'); rect(9, 13, 14, 13, accent); }
    // headgear
    const hat = look.hat || 'none';
    if (hat === 'hood') { rect(5, 2, 18, 6, outfit); rect(4, 4, 4, 15, outfit); rect(19, 4, 19, 15, outfit); rect(5, 7, 5, 15, outfit); rect(18, 7, 18, 15, outfit); rect(6, 3, 17, 3, shade(outfit, 1.25)); }
    if (hat === 'cap') { rect(6, 3, 17, 5, accent); rect(5, 5, 20, 6, shade(accent, .8)); }
    if (hat === 'beanie') { rect(6, 2, 17, 6, accent); rect(6, 6, 17, 6, shade(accent, .75)); set(11,1,accent); set(12,1,accent); }
    if (hat === 'headset') { rect(6, 5, 6, 11, '#111'); rect(17, 5, 17, 11, '#111'); rect(7, 3, 16, 3, '#111'); rect(4, 10, 6, 12, '#111'); set(4, 13, accent); set(5,13,accent); rect(16, 10, 18, 12, '#111'); }
    if (hat === 'halo') { rect(8, 1, 15, 1, accent); set(7,2,accent); set(16,2,accent); }
    if (hat === 'antenna') { set(12, 0, accent); set(12, 1, accent); set(12, 2, accent); set(12, 3, '#888'); set(11,0,accent); set(13,0,accent); }
    if (hat === 'crown') { rect(7, 2, 16, 4, '#ffd23f'); set(7,1,'#ffd23f'); set(10,1,'#ffd23f'); set(13,1,'#ffd23f'); set(16,1,'#ffd23f'); set(11,3,'#ff3fa4'); }
    if (hat === 'labcoat') { rect(5, 17, 18, 23, '#e6ecf5'); rect(10, 17, 13, 23, outfit); rect(9, 17, 9, 23, '#c7d0de'); rect(14,17,14,23,'#c7d0de'); }
    if (hat === 'tie') { rect(11, 18, 12, 22, accent); }
    if (hat === 'mohawkfin') { for (let x = 9; x <= 14; x++) set(x, 1 + (x % 2), accent); rect(9, 3, 14, 4, accent); }
    // implants / chrome
    if (look.chrome) { rect(16, 6, 17, 7, '#c9ced8'); set(17, 8, accent); set(16, 12, '#c9ced8'); }
    if (look.cheekLED) { set(7, 12, accent); set(16, 12, accent); }
    // sidekick: tiny dog (bottom-left) or drone (top-right)
    if (look.pet === 'dog') { rect(0, 19, 4, 22, '#7a5a3a'); rect(0, 18, 1, 18, '#7a5a3a'); set(1, 19, '#111'); rect(0,23,0,23,'#5a3f28'); rect(3,23,3,23,'#5a3f28'); set(4, 18, '#7a5a3a'); }
    if (look.pet === 'drone') { rect(19, 2, 22, 4, '#3c4a63'); set(20, 3, accent); set(18, 2, accent); set(23, 2, accent); set(20,1,'#aaa'); set(21,1,'#aaa'); }
    if (look.pet === 'cat') { rect(19, 19, 23, 22, '#2a2a33'); set(19, 18, '#2a2a33'); set(23, 18, '#2a2a33'); set(20, 20, '#4dff88'); set(22, 20, '#4dff88'); }
    return px;
  }

  function draw(canvas, look, opts){
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const px = make(look, opts);
    // backdrop glow gradient (transparent, CSS supplies the rest)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = px[y][x]; if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }
  }

  // blink loop management
  const live = new Set();
  function animate(canvas, look){
    draw(canvas, look);
    live.add(canvas);
    canvas._look = look;
  }
  setInterval(() => {
    live.forEach(c => { if (!document.body.contains(c)) { live.delete(c); return; }
      if (Math.random() < 0.22) { draw(c, c._look, { blink: true }); setTimeout(() => { if (document.body.contains(c)) draw(c, c._look); }, 140); } });
  }, 900);

  window.Sprite = { draw, animate, W, H };
})();
