const SOUND_FILES = [
  "sound1.mp3","sound2.mp3","sound3.mp3","sound4.mp3","sound5.mp3",
  "sound6.mp3","sound7.mp3","sound8.mp3",
];

let players = [];
let listWrap; // scroll alanı

function preload() {
  for (let i = 0; i < SOUND_FILES.length; i++) {
    const filename = SOUND_FILES[i];
    const snd = loadSound(filename);
    players.push({
      sound: snd,
      name: filename,
      vol: 0.7,
      muted: false,
      prevVol: 0.7,
      btnPlay: null,
      btnMute: null,
      volLabel: null,
    });
  }
}

function setup() {
  // Canvas'ı küçük tutup sadece arka/başlık gibi kullanıyoruz
  createCanvas(900, 140);
  background(245);

  const container = createDiv();
  container.style("padding", "16px");
  container.style("max-width", "900px");

  const header = createDiv("10 Ses Player");
  header.style("font-weight", "700");
  header.style("font-size", "18px");
  header.style("margin-bottom", "10px");
  container.child(header);

  // 🔽 Scroll alanı: yüksekliği ekranın içine sığacak şekilde
  listWrap = createDiv();
  listWrap.style("height", "380px");          // bunu istersen değiştir
  listWrap.style("overflow-y", "auto");
  listWrap.style("padding-right", "6px");
  listWrap.style("display", "flex");
  listWrap.style("flex-direction", "column");
  listWrap.style("gap", "10px");
  container.child(listWrap);

  // Satırları scroll alanının içine bas
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    p.sound.setVolume(p.vol);

    const row = createDiv();
    row.style("display", "grid");
    row.style("grid-template-columns", "1fr repeat(5, 105px) 110px");
    row.style("align-items", "center");
    row.style("gap", "8px");
    row.style("padding", "10px");
    row.style("border", "1px solid #ddd");
    row.style("border-radius", "10px");
    row.style("background", "#fff");

    const title = createDiv(`${i + 1}. ${p.name}`);
    title.style("white-space", "nowrap");
    title.style("overflow", "hidden");
    title.style("text-overflow", "ellipsis");
    title.style("min-width", "0");

    const btnPlay = createButton("Play");
    const btnStop = createButton("Stop");
    const btnVolDown = createButton("Vol -");
    const btnVolUp = createButton("Vol +");
    const btnMute = createButton("Mute");
    const volLabel = createDiv(`Vol: ${p.vol.toFixed(2)}`);

    [btnPlay, btnStop, btnVolDown, btnVolUp, btnMute].forEach(b => {
      b.style("padding", "8px 10px");
      b.style("border-radius", "10px");
      b.style("border", "1px solid #ccc");
      b.style("background", "#f7f7f7");
      b.style("cursor", "pointer");
      b.style("width", "100%");
    });

    btnPlay.mousePressed(() => togglePlay(i));
    btnStop.mousePressed(() => stopSound(i));
    btnVolDown.mousePressed(() => changeVolume(i, -0.1));
    btnVolUp.mousePressed(() => changeVolume(i, +0.1));
    btnMute.mousePressed(() => toggleMute(i));

    row.child(title);
    row.child(btnPlay);
    row.child(btnStop);
    row.child(btnVolDown);
    row.child(btnVolUp);
    row.child(btnMute);
    row.child(volLabel);

    listWrap.child(row);

    p.btnPlay = btnPlay;
    p.btnMute = btnMute;
    p.volLabel = volLabel;
  }

  const note = createDiv("İpucu: Liste kaydırılabilir. Dosyaları aynı klasöre koy (index.html + sketch.js + sesler).");
  note.style("opacity", "0.7");
  note.style("margin-top", "10px");
  note.style("font-size", "12px");
  container.child(note);
}

function draw() {
  background(245);
  fill(20);
  noStroke();
  textSize(12);
  text("Kontroller altta, liste scroll’lu.", 16, height - 16);

  // Play/Pause yazılarını güncelle
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.btnPlay) continue;
    p.btnPlay.html(p.sound.isPlaying() ? "Pause" : "Play");
  }
}

function togglePlay(i) {
  const p = players[i];
  if (!p?.sound) return;
  userStartAudio();
  if (p.sound.isPlaying()) p.sound.pause();
  else p.sound.play();
}

function stopSound(i) {
  const p = players[i];
  if (!p?.sound) return;
  p.sound.stop();
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function changeVolume(i, delta) {
  const p = players[i];
  if (!p?.sound) return;

  if (p.muted) {
    p.muted = false;
    p.btnMute?.html("Mute");
  }

  p.vol = clamp(p.vol + delta, 0, 1);
  p.sound.setVolume(p.vol);
  p.volLabel?.html(`Vol: ${p.vol.toFixed(2)}`);
}

function toggleMute(i) {
  const p = players[i];
  if (!p?.sound) return;

  if (!p.muted) {
    p.prevVol = p.vol;
    p.sound.setVolume(0);
    p.muted = true;
    p.btnMute?.html("Unmute");
  } else {
    p.sound.setVolume(p.prevVol);
    p.vol = p.prevVol;
    p.muted = false;
    p.btnMute?.html("Mute");
    p.volLabel?.html(`Vol: ${p.vol.toFixed(2)}`);
  }
}
