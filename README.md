# 🎡 SpinMaster - Roda Putar & Pengacak Nama Elegan

Aplikasi web modern, interaktif, dan elegan untuk pengundian nama, giveaway, arisan, dan turnamen. Didesain dengan tema **Luxury Dark Glassmorphism** beraksen emas dan teal mewah.

🌐 **Demo Live**: [https://kasyfurafi-stack.github.io/SpinMaster/](https://kasyfurafi-stack.github.io/SpinMaster/)

---

## ✨ Fitur Utama

### 1. 🏆 Mode 1: Spin Juara 1, 2, 3 (Turnamen Bertahap)
- Pengundian bertingkat dari **Juara 3 (Perunggu)** ➔ **Juara 2 (Perak)** ➔ **Juara 1 (Emas / Grand Prize)**.
- Roda putar presisi tinggi dengan jarum penunjuk di posisi atas (jam 12).
- Visual **Podium 3D** yang otomatis terisi nama pemenang.
- Modal selebrasi pemenang dengan opsi:
  - **Simpan & Hapus Dari Roda** (eliminasi agar tidak terpilih ulang).
  - **Biarkan Nama Tetap di Roda**.

### 2. 🎲 Mode 2: Pengacak Langsung Semua (Bulk Randomizer)
- Mengacak seluruh urutan nama sekaligus dalam hitungan detik.
- Animasi keriuhan **Slot Machine Ticker**.
- Hasil lengkap dari peringkat **#1 sampai selesai**.
- Tombol **Salin ke Clipboard** dan **Unduh File TXT**.

### 3. 🔊 Audio Synthesizer Tanpa Aset Eksternal (Web Audio API)
- Suara klik roda mekanik (*tick*) saat melewati batas irisan.
- Suara keriuhan nada kemenangan (*fanfare*) saat pemenang ditentukan.
- Tombol mute/unmute suara yang tersimpan di memori browser.

### 4. 🎨 Tampilan Elegan & Responsif
- Efek *Frosted Glass* (Glassmorphism) dengan kontras teks tajam.
- Tombol emas 3D dengan efek tekan dinamis.
- Efek ledakan konfeti (*confetti blast*) saat perayaan pemenang.
- Responsif optimal untuk smartphone, tablet, maupun layar desktop.

---

## 🚀 Cara Menjalankan Secara Lokal

1. Clone repositori ini:
   ```bash
   git clone https://github.com/kasyfurafi-stack/SpinMaster.git
   cd SpinMaster
   ```
2. Buka file `index.html` langsung di browser favorit Anda (Chrome, Edge, Firefox, Safari).

---

## 🛠️ Teknologi yang Digunakan

- **HTML5 & CSS3**: Semantic layout, Custom Glassmorphism, CSS Variables, & Flexbox/Grid.
- **Tailwind CSS**: Styling modern dan utilitas responsive.
- **HTML5 Canvas 2D**: Rendering roda putar sudut radial dinamis & fisika perlambatan (*cubic ease-out*).
- **Web Audio API**: Generator suara *tick* dan *fanfare* bawaan browser tanpa dependensi file MP3.
- **Canvas Confetti**: Animasi partikel perayaan kemenangan.
- **Phosphor Icons**: Ikon modern dan tajam.

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Bebas digunakan untuk keperluan pribadi, komunitas, maupun komersial.
