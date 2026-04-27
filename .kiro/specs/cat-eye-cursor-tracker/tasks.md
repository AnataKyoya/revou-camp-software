# Implementation Plan: Cat Eye Cursor Tracker

## Overview

Implementasi halaman web interaktif single-file (`index.html`) yang menampilkan ilustrasi wajah kucing dengan pupil yang mengikuti kursor mouse secara real-time menggunakan HTML, Tailwind CSS CDN, dan JavaScript vanilla.

## Tasks

- [x] 1. Buat struktur HTML dasar dan layout halaman
  - Buat file `index.html` dengan boilerplate HTML5 (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
  - Tambahkan elemen `<title>` yang deskriptif di `<head>`
  - Sertakan Tailwind CSS via CDN di `<head>`
  - Buat elemen `<main>` dengan class Tailwind untuk centering konten secara vertikal dan horizontal (full viewport height)
  - Tambahkan atribut `aria-label` pada container ilustrasi kucing
  - _Requirements: 1.1, 1.2, 1.5, 4.3, 5.1, 5.2, 5.3_

- [x] 2. Implementasi ilustrasi wajah kucing dengan HTML/CSS
  - [x] 2.1 Buat elemen kepala kucing (`div.cat-face`) dengan Tailwind CSS
    - Styling: rounded-full, background color, ukuran ~280px, posisi relatif
    - Tambahkan latar belakang halaman yang kontras terhadap wajah kucing
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 2.2 Buat elemen telinga kucing menggunakan CSS clip-path atau border trick
    - Dua telinga berbentuk segitiga di kiri atas dan kanan atas kepala
    - Posisikan secara absolut di atas `div.cat-face`
    - _Requirements: 1.4_

  - [x] 2.3 Buat dua elemen Eyeball simetris kiri dan kanan
    - Setiap eyeball: `div.eyeball` dengan `position: relative`, rounded-full, background putih/terang
    - Diameter ~60px, ditempatkan dalam `div.eyes-row` yang flex
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 2.4 Buat elemen Pupil di dalam setiap Eyeball
    - Setiap pupil: `div.pupil` dengan `position: absolute`, rounded-full, background gelap
    - Diameter ~24px, posisi default di tengah eyeball (`left: 50%; top: 50%; transform: translate(-50%, -50%)`)
    - _Requirements: 2.3, 2.4_

  - [x] 2.5 Buat elemen hidung dan mulut kucing
    - Hidung: `div.nose` berbentuk segitiga kecil atau oval di tengah bawah mata
    - Mulut: `div.mouth` berupa dua kurva kecil di bawah hidung
    - _Requirements: 1.4_

- [x] 3. Checkpoint — Pastikan tampilan statis berjalan dengan benar
  - Buka `index.html` di browser, verifikasi ilustrasi kucing tampil di tengah halaman
  - Pastikan semua elemen (telinga, mata, hidung, mulut) terlihat dengan proporsi yang sesuai
  - Pastikan pupil berada di tengah eyeball secara default

- [x] 4. Implementasi Eye_Tracker (JavaScript)
  - [x] 4.1 Buat fungsi `initEyeTracker` yang dijalankan saat `DOMContentLoaded`
    - Query selector untuk kedua elemen eyeball dan pupil (kiri & kanan)
    - Daftarkan `addEventListener('mousemove', onMouseMove)` pada `document`
    - _Requirements: 3.1, 4.1, 5.4_

  - [x] 4.2 Implementasi fungsi `updatePupil(eyeball, pupil, cursorX, cursorY)`
    - Ambil `eyeball.getBoundingClientRect()` untuk mendapatkan posisi dan ukuran eyeball
    - Hitung pusat eyeball: `eyeCenterX = rect.left + rect.width / 2`, `eyeCenterY = rect.top + rect.height / 2`
    - Hitung sudut dengan `Math.atan2(cursorY - eyeCenterY, cursorX - eyeCenterX)`
    - Hitung `maxRadius = (eyeball.offsetWidth / 2) - (pupil.offsetWidth / 2)`
    - Terapkan posisi pupil: `left = cos(angle) * maxRadius`, `top = sin(angle) * maxRadius` (relatif terhadap eyeball)
    - _Requirements: 3.1, 3.2, 3.3, 4.2_

  - [x] 4.3 Implementasi fungsi `onMouseMove(event)` sebagai handler utama
    - Panggil `updatePupil` untuk eyeball kiri dan kanan dengan `event.clientX`, `event.clientY`
    - Pastikan update terjadi setiap `mousemove` tanpa delay
    - _Requirements: 3.2, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 4.4 Tulis unit test manual untuk kalkulasi `updatePupil`
    - Verifikasi: kursor di kanan → pupil bergeser kanan
    - Verifikasi: kursor di kiri → pupil bergeser kiri
    - Verifikasi: kursor di atas → pupil bergeser atas
    - Verifikasi: kursor di bawah → pupil bergeser bawah
    - Verifikasi: pupil tidak melampaui batas eyeball (offset ≤ maxRadius)
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 5. Implementasi fallback state
  - Pastikan pupil tetap di tengah eyeball sebelum event `mousemove` pertama (via CSS default)
  - Verifikasi posisi default CSS: `left: 50%; top: 50%; transform: translate(-50%, -50%)`
  - _Requirements: 4.4_

- [x] 6. Verifikasi responsivitas dan kompatibilitas
  - [x] 6.1 Pastikan layout responsif dari 320px hingga 1920px lebar
    - Gunakan Tailwind responsive utilities jika diperlukan
    - _Requirements: 4.5_

  - [ ]* 6.2 Tulis komentar inline pada kode JavaScript untuk dokumentasi kalkulasi
    - Dokumentasikan rumus `Math.atan2`, `maxRadius`, dan penerapan offset pupil
    - _Requirements: 4.2_

- [x] 7. Final checkpoint — Pastikan semua fitur berjalan
  - Buka `index.html` di browser, gerakkan mouse ke berbagai arah
  - Verifikasi kedua pupil mengikuti kursor secara real-time
  - Verifikasi pupil tidak keluar dari batas eyeball
  - Verifikasi tampilan responsif di berbagai ukuran layar
  - Pastikan semua tests pass, tanyakan kepada user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Seluruh implementasi berada dalam satu file `index.html` (single-file delivery)
- Tidak ada backend atau build step yang diperlukan
- Tailwind CSS dimuat via CDN — koneksi internet diperlukan untuk styling
