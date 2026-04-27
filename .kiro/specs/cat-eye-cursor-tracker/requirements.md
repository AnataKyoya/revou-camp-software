# Requirements Document

## Introduction

Fitur ini adalah halaman utama (homepage) interaktif yang menampilkan ilustrasi kucing dengan animasi mata yang mengikuti pergerakan kursor mouse secara real-time. Halaman dibangun menggunakan HTML, Tailwind CSS, dan JavaScript vanilla tanpa dependensi eksternal tambahan. Tujuannya adalah memberikan pengalaman visual yang menarik dan interaktif bagi pengguna.

## Glossary

- **Homepage**: Halaman utama aplikasi web yang diakses melalui `index.html`
- **Cat_Illustration**: Elemen visual berupa div/dom elemen
- **Eye_Tracker**: Komponen JavaScript yang menghitung dan mengaplikasikan rotasi mata kucing berdasarkan posisi kursor
- **Pupil**: Elemen lingkaran kecil di dalam mata kucing yang bergerak mengikuti arah kursor
- **Eyeball**: Elemen lingkaran besar yang menjadi bola mata kucing, menjadi batas pergerakan pupil
- **Cursor**: Pointer mouse milik pengguna di layar browser

---

## Requirements

### Requirement 1: Tampilan Halaman Utama

**User Story:** Sebagai pengguna, saya ingin melihat halaman utama yang menarik dengan ilustrasi kucing, sehingga saya mendapatkan pengalaman visual yang menyenangkan saat membuka situs.

#### Acceptance Criteria

1. THE Homepage SHALL menampilkan ilustrasi kucing di tengah halaman secara vertikal dan horizontal.
2. THE Homepage SHALL menggunakan Tailwind CSS untuk seluruh styling layout dan komponen visual.
3. THE Homepage SHALL memiliki latar belakang berwarna yang kontras agar ilustrasi kucing terlihat jelas.
4. THE Cat_Illustration SHALL terdiri dari elemen-elemen SVG atau HTML/CSS yang merepresentasikan wajah kucing, termasuk kepala, telinga, mata, hidung, dan mulut.
5. THE Homepage SHALL dapat diakses melalui file `index.html` tanpa memerlukan server backend.

---

### Requirement 2: Komponen Mata Kucing

**User Story:** Sebagai pengguna, saya ingin melihat mata kucing yang realistis dengan pupil yang dapat bergerak, sehingga animasi terlihat natural dan menarik.

#### Acceptance Criteria

1. THE Cat_Illustration SHALL memiliki dua buah Eyeball yang simetris di posisi kiri dan kanan wajah kucing.
2. THE Eyeball SHALL memiliki warna putih atau terang sebagai dasar bola mata.
3. EACH Eyeball SHALL mengandung satu Pupil berbentuk lingkaran berwarna gelap di dalamnya.
4. THE Pupil SHALL memiliki ukuran yang lebih kecil dari Eyeball sehingga terdapat ruang untuk bergerak di dalam Eyeball.
5. THE Cat_Illustration SHALL menampilkan kedua mata dengan proporsi yang sesuai terhadap ukuran wajah kucing.

---

### Requirement 3: Pelacakan Kursor Mouse

**User Story:** Sebagai pengguna, saya ingin melihat mata kucing bergerak mengikuti kursor saya secara real-time, sehingga halaman terasa interaktif dan hidup.

#### Acceptance Criteria

1. WHEN pengguna menggerakkan kursor di atas halaman, THE Eye_Tracker SHALL menghitung sudut antara posisi kursor dan pusat masing-masing Eyeball.
2. WHEN sudut telah dihitung, THE Eye_Tracker SHALL memperbarui posisi Pupil di dalam Eyeball sesuai arah kursor.
3. THE Pupil SHALL bergerak di dalam batas area Eyeball dan tidak melampaui tepi Eyeball.
4. WHEN kursor berada di sisi kanan halaman, THE Pupil SHALL bergeser ke arah kanan di dalam Eyeball.
5. WHEN kursor berada di sisi kiri halaman, THE Pupil SHALL bergeser ke arah kiri di dalam Eyeball.
6. WHEN kursor berada di atas halaman, THE Pupil SHALL bergeser ke arah atas di dalam Eyeball.
7. WHEN kursor berada di bawah halaman, THE Pupil SHALL bergeser ke arah bawah di dalam Eyeball.
8. THE Eye_Tracker SHALL memperbarui posisi Pupil pada setiap event `mousemove` tanpa delay yang terasa oleh pengguna.

---

### Requirement 4: Performa dan Kompatibilitas

**User Story:** Sebagai pengguna, saya ingin animasi mata kucing berjalan mulus di browser modern, sehingga pengalaman interaktif tidak terganggu oleh lag atau error.

#### Acceptance Criteria

1. THE Eye_Tracker SHALL menggunakan `addEventListener('mousemove', ...)` untuk mendeteksi pergerakan kursor.
2. THE Eye_Tracker SHALL menghitung posisi Pupil menggunakan fungsi trigonometri `Math.atan2` untuk mendapatkan sudut yang akurat.
3. THE Homepage SHALL memuat seluruh aset (HTML, CSS, JavaScript) dalam satu file `index.html` atau dengan referensi file lokal tanpa CDN yang memerlukan koneksi internet, kecuali Tailwind CSS CDN.
4. IF browser pengguna tidak mendukung event `mousemove`, THEN THE Homepage SHALL tetap menampilkan ilustrasi kucing dengan posisi Pupil di tengah Eyeball sebagai fallback.
5. THE Homepage SHALL dapat dirender dengan benar pada resolusi layar minimal 320px lebar (mobile) hingga 1920px lebar (desktop).

---

### Requirement 5: Aksesibilitas dan Struktur HTML

**User Story:** Sebagai pengembang, saya ingin kode HTML yang terstruktur dengan baik, sehingga halaman mudah dipelihara dan memenuhi standar web dasar.

#### Acceptance Criteria

1. THE Homepage SHALL memiliki elemen `<title>` yang deskriptif di dalam `<head>`.
2. THE Cat_Illustration SHALL memiliki atribut `aria-label` atau elemen teks alternatif yang mendeskripsikan konten ilustrasi untuk pembaca layar.
3. THE Homepage SHALL menggunakan struktur HTML5 semantik yang valid, termasuk `<!DOCTYPE html>`, `<html>`, `<head>`, dan `<body>`.
4. THE Eye_Tracker SHALL diimplementasikan dalam blok `<script>` yang dieksekusi setelah DOM selesai dimuat menggunakan event `DOMContentLoaded` atau dengan menempatkan script di akhir `<body>`.
