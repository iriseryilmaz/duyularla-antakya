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

let players = []; // her eleman: { sound, name, vol, ui... }

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

    // 🔽 "Her sesin üstüne" metin: satırın üstüne küçük başlık gibi ekliyoruz
    const metaDiv = createDiv(p.meta);
    metaDiv.style("font-size", "12px");
    metaDiv.style("opacity", "0.75");
    metaDiv.style("margin-bottom", "6px");

    // Başlık: dosya adı
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

    // Meta + Row'u birlikte sarmalayalım (üstüne yazı için)
    const block = createDiv();
    block.style("display", "flex");
    block.style("flex-direction", "column");
    block.style("gap", "0px");

    // satıra diz
    row.child(title);
    row.child(btnPlay);
    row.child(btnStop);
    row.child(btnVolDown);
    row.child(btnVolUp);
    row.child(btnMute);
    row.child(volLabel);

    block.child(metaDiv); // üstte metin
    block.child(row);     // altta kontroller

    container.child(block);

    // ref kaydet
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

  const note = createDiv(

  );
  note.style("opacity", "0.7");
  note.style("margin-top", "8px");
  note.style("font-size", "12px");
  container.child(note);
}

function draw() {
  background(245);
  noStroke();
  fill(20);
  textSize(12);
  text("Sesleri kontrol etmek için üstteki butonları kullan.", 16, height - 16);

  // Buton metinlerini oynama durumuna göre güncelle
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.btnPlay) continue;
    p.btnPlay.html(p.sound.isPlaying() ? "Pause" : "Play");
  }
}

function togglePlay(i) {
  const p = players[i];
  if (!p || !p.sound) return;

  userStartAudio();

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
