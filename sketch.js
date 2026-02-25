const SOUND_FILES = [
  "sound1.mp3",
  "sound2.mp3",
  "sound3.mp3",
  "sound4.mp3",
  "sound5.mp3",
  "sound6.mp3",
  "sound7.mp3",
  "sound8.mp3",
];

const META_TEXT = "17.01.2026 11.00-13.30 İzzet Güçlü Cd. - İstiklal Cd.";

let players = [];
let audioUnlocked = false;
let btnUnlock = null;
let unlockHint = null;

function preload() {
  for (let i = 0; i < SOUND_FILES.length; i++) {
    const filename = SOUND_FILES[i];
    const snd = loadSound(filename);
    players.push({
      sound: snd,
      name: filename,
      meta: META_TEXT,
      vol: 0.7,
      row: null,
      title: null,
      metaDiv: null,
      btnPlay: null,
      btnStop: null,
      btnVolDown: null,
      btnVolUp: null,
      btnMute: null,
      volLabel: null,
      muted: false,
      prevVol: 0.7,
    });
  }
}

async function unlockAudio() {
  try {
    // p5.sound helper
    userStartAudio();

    // iOS Safari için kritik: context resume
    const ctx = getAudioContext();
    if (ctx && ctx.state !== "running") {
      await ctx.resume();
    }

    // bazen masterVolume 0 kalabiliyor (emin olmak için)
    masterVolume(1);

    audioUnlocked = (getAudioContext()?.state === "running");
    if (unlockHint) {
      unlockHint.html(audioUnlocked ? "✅ Ses hazır" : "⚠️ Ses açılmadı, tekrar dokun");
      unlockHint.style("opacity", audioUnlocked ? "0.8" : "1");
    }
  } catch (e) {
    if (unlockHint) unlockHint.html("⚠️ Ses açılırken hata oldu");
    // console için:
    // console.error(e);
  }
}

function setup() {
  createCanvas(900, 520);
  background(245);

  const container = createDiv();
  container.style("padding", "16px");
  container.style("display", "flex");
  container.style("flex-direction", "column");
  container.style("gap", "10px");

  const header = createDiv("Ses Player");
  header.style("font-weight", "700");
  header.style("font-size", "18px");
  header.style("margin-bottom", "6px");
  container.child(header);

  // ✅ Telefon için: önce sesi açtıran bar
  const unlockBar = createDiv();
  unlockBar.style("display", "flex");
  unlockBar.style("gap", "10px");
  unlockBar.style("align-items", "center");
  unlockBar.style("padding", "10px");
  unlockBar.style("border", "1px solid #ddd");
  unlockBar.style("border-radius", "10px");
  unlockBar.style("background", "#fff");

  btnUnlock = createButton("Sesi Aç");
  btnUnlock.style("padding", "10px 12px");
  btnUnlock.style("border-radius", "10px");
  btnUnlock.style("border", "1px solid #ccc");
  btnUnlock.style("background", "#f7f7f7");
  btnUnlock.style("cursor", "pointer");
  btnUnlock.mousePressed(() => unlockAudio());

  unlockHint = createDiv("📱 Telefonda önce ‘Sesi Aç’a dokun.");
  unlockHint.style("font-size", "12px");
  unlockHint.style("opacity", "0.85");

  unlockBar.child(btnUnlock);
  unlockBar.child(unlockHint);
  container.child(unlockBar);

  // Her ses için satır oluştur
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    p.sound.setVolume(p.vol);

    const row = createDiv();
    row.style("display", "grid");
    row.style("grid-template-columns", "280px repeat(5, 110px) 120px");
    row.style("align-items", "center");
    row.style("gap", "8px");
    row.style("padding", "10px");
    row.style("border", "1px solid #ddd");
    row.style("border-radius", "10px");
    row.style("background", "#fff");

    const metaDiv = createDiv(p.meta);
    metaDiv.style("font-size", "12px");
    metaDiv.style("opacity", "0.75");
    metaDiv.style("margin-bottom", "6px");

    const title = createDiv(`${i + 1}. ${p.name}`);
    title.style("white-space", "nowrap");
    title.style("overflow", "hidden");
    title.style("text-overflow", "ellipsis");

    const btnPlay = createButton("Play");
    const btnStop = createButton("Stop");
    const btnVolDown = createButton("Vol -");
    const btnVolUp = createButton("Vol +");
    const btnMute = createButton("Mute");

    [btnPlay, btnStop, btnVolDown, btnVolUp, btnMute].forEach(b => {
      b.style("padding", "8px 10px");
      b.style("border-radius", "10px");
      b.style("border", "1px solid #ccc");
      b.style("background", "#f7f7f7");
      b.style("cursor", "pointer");
    });

    const volLabel = createDiv(`Vol: ${p.vol.toFixed(2)}`);
    volLabel.style("font-variant-numeric", "tabular-nums");

    // Eventler
    btnPlay.mousePressed(() => togglePlay(i));
    btnStop.mousePressed(() => stopSound(i));
    btnVolDown.mousePressed(() => changeVolume(i, -0.1));
    btnVolUp.mousePressed(() => changeVolume(i, +0.1));
    btnMute.mousePressed(() => toggleMute(i));

    const block = createDiv();
    block.style("display", "flex");
    block.style("flex-direction", "column");
    block.style("gap", "0px");

    row.child(title);
    row.child(btnPlay);
    row.child(btnStop);
    row.child(btnVolDown);
    row.child(btnVolUp);
    row.child(btnMute);
    row.child(volLabel);

    block.child(metaDiv);
    block.child(row);

    container.child(block);

    p.row = row;
    p.title = title;
    p.metaDiv = metaDiv;
    p.btnPlay = btnPlay;
    p.btnStop = btnStop;
    p.btnVolDown = btnVolDown;
    p.btnVolUp = btnVolUp;
    p.btnMute = btnMute;
    p.volLabel = volLabel;
  }
}

function draw() {
  background(245);
  noStroke();
  fill(20);
  textSize(12);
  text("Sesleri kontrol etmek için üstteki butonları kullan.", 16, height - 16);

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.btnPlay) continue;
    p.btnPlay.html(p.sound.isPlaying() ? "Pause" : "Play");
  }
}

// ✅ iOS için ekstra: sayfaya ilk dokunuşta da açmayı dene
function touchStarted() {
  if (!audioUnlocked) unlockAudio();
  return false; // mobilde bazı scroll/tap davranışlarını düzeltir
}

async function togglePlay(i) {
  const p = players[i];
  if (!p || !p.sound) return;

  if (!audioUnlocked) {
    await unlockAudio();
  }

  // hâlâ running değilse kullanıcıya net uyarı
  if (getAudioContext()?.state !== "running") {
    if (unlockHint) unlockHint.html("⚠️ Ses izin vermedi. Tekrar ‘Sesi Aç’a dokun.");
    return;
  }

  if (p.sound.isPlaying()) {
    p.sound.pause();
  } else {
    p.sound.play();
  }
}

function stopSound(i) {
  const p = players[i];
  if (!p || !p.sound) return;
  p.sound.stop();
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function changeVolume(i, delta) {
  const p = players[i];
  if (!p || !p.sound) return;

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
  if (!p || !p.sound) return;

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
