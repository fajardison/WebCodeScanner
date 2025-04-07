# Barcode Scanner Web App

Proyek ini merupakan aplikasi web berbasis JavaScript yang memungkinkan pengguna untuk memindai barcode menggunakan kamera perangkat. Aplikasi ini mendukung deteksi barcode secara real-time, pengalihan kamera depan/belakang, serta kontrol lampu flash (torch) pada perangkat yang mendukung.

## Fitur

- **Pemindaian Barcode Real-Time:** Menggunakan `BarcodeDetector` API untuk mendeteksi barcode secara langsung dari kamera.
- **Dukungan Kamera Depan & Belakang:** Dapat beralih antara kamera depan dan belakang.
- **Kontrol Lampu Flash:** Nyalakan atau matikan torch untuk membantu pemindaian di kondisi cahaya rendah.
- **Tampilan Interaktif:** Menampilkan hasil deteksi barcode secara langsung di layar dan dalam input teks.
- **Indikator Deteksi:** Status teks yang menunjukkan apakah barcode berhasil dideteksi.
- **Kotak Fokus:** Tampilan visual area fokus untuk membantu pengguna saat pemindaian.

## Struktur File

- `reader.js` – Skrip utama yang mengatur kamera, deteksi barcode, kontrol UI, dan interaksi pengguna.
- Elemen HTML yang diperlukan:
  - `video#barcode-scanner`
  - `canvas#frame`
  - `button#open-camera-btn`
  - `button#close-camera-btn`
  - `button#flash-light-btn`
  - `button#change-camera`
  - `div#scan-result`
  - `input#BarcodeInput`
  - `div.focus-box`
  - `span#indicator-text`
  - `img#flash-light-img`

## Cara Penggunaan

1. **Pastikan menggunakan browser yang mendukung `BarcodeDetector API`**, seperti Chrome (versi terbaru).
2. Buka halaman HTML yang memuat skrip ini.
3. Klik tombol **"Open Camera"** untuk mengakses kamera.
4. Arahkan kamera ke barcode yang ingin dipindai.
5. Gunakan tombol tambahan untuk:
   - Mengalihkan kamera (depan/belakang)
   - Menyalakan/mematikan flash
   - Menutup kamera jika sudah selesai

## Kompatibilitas

Fitur `BarcodeDetector` hanya didukung oleh browser tertentu (terutama Chromium-based browser). Jika tidak tersedia, pengguna akan mendapat peringatan.

## Catatan Keamanan

- Aplikasi ini membutuhkan izin akses kamera dari pengguna.
- Pastikan situs diakses melalui **HTTPS** untuk menggunakan API `getUserMedia`.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://github.com/fajardison/WebCodeScanner/blob/main/LICENSE).

---
