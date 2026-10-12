# 📸 Photobooth Web App

Aplikasi photobooth interaktif berbasis web (HTML5, CSS3, Vanilla JavaScript) dengan integrasi live webcam, timer countdown, filter real-time, dan beragam pilihan template frame estetik beresolusi tinggi.

🌐 **Live Demo:** [https://nnoeel.github.io/photobooth/](https://nnoeel.github.io/photobooth/)

---

## ✨ Fitur Utama

- 🎥 **Live Webcam & Shutter Audio**: Pratinjau kamera real-time dengan efek suara shutter kamera dan countdown beep via Web Audio API.
- ⏱️ **Pilihan Timer Countdown**: Bebas memilih jeda pemotretan: Instan (0s), 3 detik, 5 detik, atau 10 detik.
- 🎨 **Filter Real-Time**: Normal, Vintage, B&W, Cyberpunk, Warm Glow, Cute, Pastel, dan Sepia.
- 🖼️ **8 Pilihan Frame Estetik**:
  1. **💖 Retro Vibes (6 Slot)** — Frame merah retro berukuran 1067×1600 px dengan tipografi melengkung, 4 stiker hati glossy 3D, dan bunga daisy.
  2. **🌼 70s Groovy (6 Slot)** — Kolase polaroid bernuansa 1970-an warna kuning-oranye dengan stiker smiley retro, hati berlapis konsentris, dan quote *"SPREAD HAPPINESS"*.
  3. **🎧 Music Player (6 Slot)** — Desain twin strip berkonsep lockscreen dan antarmuka pemutar musik digital dengan cover art serta playback controls.
  4. **🧸 Toy Story (3 Slot)** — Frame vertikal bergaya langit berawan ikonik khas animasi Toy Story.
  5. **🎀 K-Pop Idol (4 Slot)** — Grid 2×2 bernuansa pastel pink dengan dekorasi stiker manis.
  6. **🖤 Monochrome Chic (3 Slot)** — Strip foto monokrom vertikal minimalis dan elegan dengan aksen bintang.
  7. **🎞️ Vintage Retro (3 Slot)** — Strip analog klasik bernuansa hangat nostalgia.
  8. **🎈 Cartoon Fun (4 Slot)** — Format strip pop-art komik ceria penuh warna.
- 💾 **Download High-Resolution**: Foto dirender otomatis ke elemen HTML5 Canvas beresolusi tinggi dan diunduh langsung dalam format `.png`.
- 📱 **Desain Responsif**: Tampilan antarmuka adaptif dan nyaman digunakan di perangkat desktop, tablet, maupun smartphone.

---

## 🚀 Cara Menjalankan Secara Lokal

Aplikasi ini sepenuhnya statis (zero-dependency). Anda dapat menjalankannya dengan local web server sederhana:

### Menggunakan Python:
```bash
# Clone repositori
git clone https://github.com/NnoeeL/photobooth.git
cd photobooth

# Jalankan local HTTP server
python -m http.server 8000
```
Buka browser dan kunjungi `http://localhost:8000`.

### Menggunakan VS Code Live Server:
1. Buka folder proyek di Visual Studio Code.
2. Klik kanan pada file `index.html` lalu pilih **"Open with Live Server"**.

---

## 📁 Struktur Direktori

```text
photobooth/
├── assets/
│   ├── groovy_overlay.png        # Lapisan transparan frame 70s Groovy (1067×1600)
│   ├── music_player_overlay.png  # Lapisan transparan frame Music Player (1067×1600)
│   ├── retro_vibes_overlay.png   # Lapisan transparan frame Retro Vibes (1067×1600)
│   ├── groovy.jpg                # Referensi desain Groovy
│   ├── music_player.jpg          # Referensi desain Music Player
│   └── retro_vibes.jpg           # Referensi desain Retro Vibes
├── index.html                    # Antarmuka utama aplikasi photobooth
├── style.css                     # Pengaturan tema, layout responsif & posisi slot foto
├── app.js                        # Alur webcam, timer, state management & render canvas
└── README.md                     # Dokumentasi proyek
```

---

## 🛠️ Teknologi

- **HTML5**: Media Capture (`navigator.mediaDevices.getUserMedia`), Canvas API.
- **CSS3**: CSS Grid, Flexbox, Custom Properties (CSS Variables), Keyframe Animations.
- **JavaScript (Vanilla ES6+)**: Web Audio API (sound synthesis), Async/Await, Canvas Compositing.

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan hiburan dan eksplorasi web development. Bebas dikembangkan dan dimodifikasi!
