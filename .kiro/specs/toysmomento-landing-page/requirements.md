# Requirements Document

## Introduction

ToysMomento adalah brand yang memproduksi custom figure untuk mengabadikan momen berharga seseorang. Website ini terdiri dari dua bagian utama: (1) **Home Page** berupa one-page landing page yang menampilkan hero section, detail produk (kualitas, kustomisasi, bahan), testimoni, dan order form; serta (2) **Make Your Moment Page** sebagai halaman terpisah dengan fitur interaktif upload foto, konversi ke gambar chibi, dan visualisasi model 3D figure berukuran 100cm.

## Glossary

- **Landing_Page**: Halaman utama (home) website ToysMomento yang bersifat one-page, berisi semua section utama dari hero hingga order form.
- **Hero_Section**: Bagian pertama Landing_Page yang menampilkan tagline brand dan call-to-action utama.
- **Product_Detail_Section**: Bagian Landing_Page yang menampilkan tiga sub-section: kualitas, kustomisasi, dan bahan produk.
- **Testimoni_Section**: Bagian Landing_Page yang menampilkan ulasan dan testimoni pelanggan ToysMomento.
- **Make_Your_Moment_Page**: Halaman terpisah dengan fitur interaktif konversi foto ke chibi dan model 3D figure.
- **Chibi_Converter**: Komponen yang memproses foto pengguna dan menghasilkan gambar bergaya chibi.
- **3D_Visualizer**: Komponen yang mengonversi gambar chibi menjadi representasi visual model 3D figure berukuran 100cm.
- **Figure**: Produk fisik custom berbentuk miniatur 3D yang dibuat berdasarkan foto pelanggan.
- **Order_Form**: Formulir pemesanan yang diisi pelanggan untuk memesan custom figure, ditampilkan sebagai section di Landing_Page.
- **Navigation_Menu**: Menu navigasi utama website yang berisi tautan ke Home dan Make Your Moment.
- **Visitor**: Pengguna yang mengakses website ToysMomento.

---

## Requirements

### Requirement 1: Landing Page One-Page (Halaman Utama)

**User Story:** Sebagai seorang Visitor, saya ingin melihat halaman utama yang lengkap dalam satu halaman, sehingga saya dapat memahami brand ToysMomento, melihat detail produk, membaca testimoni, dan langsung memesan tanpa berpindah halaman.

#### Acceptance Criteria

1. THE Landing_Page SHALL menampilkan section-section berikut secara berurutan dalam satu halaman: Hero_Section, Product_Detail_Section, Testimoni_Section, dan Order_Form.
2. THE Hero_Section SHALL menampilkan layout dua kolom: kolom kiri berisi tagline brand dan tombol "Order Now", kolom kanan berisi foto atau gambar produk figure ToysMomento.
3. WHEN Visitor mengklik tombol "Order Now" di Hero_Section, THE Landing_Page SHALL melakukan scroll ke Order_Form dalam halaman yang sama.
4. THE Landing_Page SHALL menampilkan footer yang berisi informasi kontak dan tautan media sosial ToysMomento.
5. WHEN Visitor mengakses Landing_Page dari perangkat mobile, THE Landing_Page SHALL menampilkan layout responsif yang dapat digunakan dengan baik pada layar berukuran minimal 320px.
6. THE Landing_Page SHALL memuat seluruh konten above-the-fold dalam waktu tidak lebih dari 3 detik pada koneksi internet standar (10 Mbps).

---

### Requirement 2: Section Detail Produk di Landing Page

**User Story:** Sebagai seorang Visitor, saya ingin melihat informasi lengkap tentang produk ToysMomento langsung di halaman utama, sehingga saya dapat membuat keputusan pembelian tanpa harus berpindah halaman.

#### Acceptance Criteria

1. THE Product_Detail_Section SHALL menampilkan tiga sub-section secara terstruktur: kualitas produk, kustomisasi, dan bahan.
2. THE Product_Detail_Section SHALL menampilkan sub-section kualitas yang menjelaskan standar kualitas figure ToysMomento secara spesifik.
3. THE Product_Detail_Section SHALL menampilkan sub-section kustomisasi yang menjelaskan pilihan kustomisasi yang tersedia (pose, ekspresi, aksesori, warna, dan lainnya).
4. THE Product_Detail_Section SHALL menampilkan sub-section bahan yang menjelaskan material yang digunakan dalam pembuatan figure beserta keunggulannya.
5. WHEN Visitor mengakses Landing_Page dari perangkat mobile, THE Product_Detail_Section SHALL menampilkan layout responsif yang dapat digunakan dengan baik pada layar berukuran minimal 320px.

---

### Requirement 3: Section Testimoni di Landing Page

**User Story:** Sebagai seorang Visitor, saya ingin membaca testimoni pelanggan ToysMomento di halaman utama, sehingga saya dapat memperoleh kepercayaan terhadap kualitas produk sebelum memesan.

#### Acceptance Criteria

1. THE Testimoni_Section SHALL menampilkan minimal 3 testimoni dari pelanggan ToysMomento.
2. THE Testimoni_Section SHALL menampilkan setiap testimoni dengan informasi: nama pelanggan, isi ulasan, dan foto atau gambar produk yang dipesan (jika tersedia).
3. WHEN Visitor mengakses Landing_Page dari perangkat mobile, THE Testimoni_Section SHALL menampilkan layout responsif yang dapat digunakan dengan baik pada layar berukuran minimal 320px.

---

### Requirement 4: Navigasi Menu

**User Story:** Sebagai seorang Visitor, saya ingin menggunakan menu navigasi untuk berpindah antar section dan halaman, sehingga saya dapat mengakses bagian website yang saya butuhkan dengan mudah.

#### Acceptance Criteria

1. THE Navigation_Menu SHALL menampilkan empat item menu: "Home", "Detail Product", "Testimoni", dan "Make Your Moment".
2. WHEN Visitor mengklik menu "Home", THE Navigation_Menu SHALL melakukan scroll ke bagian atas Landing_Page.
3. WHEN Visitor mengklik menu "Detail Product", THE Navigation_Menu SHALL melakukan scroll ke Product_Detail_Section di Landing_Page.
4. WHEN Visitor mengklik menu "Testimoni", THE Navigation_Menu SHALL melakukan scroll ke Testimoni_Section di Landing_Page.
5. WHEN Visitor mengklik menu "Make Your Moment", THE Navigation_Menu SHALL mengarahkan Visitor ke Make_Your_Moment_Page sebagai halaman terpisah.
6. THE Navigation_Menu SHALL menampilkan indikator visual (highlight atau underline) pada item menu yang sedang aktif atau section yang sedang terlihat di viewport.
7. WHEN Visitor mengakses website dari perangkat mobile, THE Navigation_Menu SHALL menampilkan menu dalam format hamburger atau drawer yang dapat dibuka dan ditutup.

---

### Requirement 5: Upload Foto pada Fitur "Make Your Moment"

**User Story:** Sebagai seorang Visitor, saya ingin mengunggah foto saya ke fitur "Make Your Moment", sehingga saya dapat melihat bagaimana tampilan saya sebagai custom figure.

#### Acceptance Criteria

1. THE Make_Your_Moment_Page SHALL menampilkan area upload foto dengan instruksi yang jelas bagi Visitor.
2. WHEN Visitor mengunggah file foto dengan format JPG, JPEG, atau PNG berukuran maksimal 10MB, THE Make_Your_Moment_Page SHALL menerima dan memproses file tersebut.
3. IF Visitor mengunggah file dengan format selain JPG, JPEG, atau PNG, THEN THE Make_Your_Moment_Page SHALL menampilkan pesan kesalahan: "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG."
4. IF Visitor mengunggah file foto berukuran lebih dari 10MB, THEN THE Make_Your_Moment_Page SHALL menampilkan pesan kesalahan: "Ukuran file terlalu besar. Maksimal 10MB."
5. WHEN foto berhasil diunggah, THE Make_Your_Moment_Page SHALL menampilkan pratinjau foto yang diunggah sebelum proses konversi dimulai.
6. THE Make_Your_Moment_Page SHALL menampilkan tombol untuk memulai proses konversi setelah foto berhasil diunggah.

---

### Requirement 6: Konversi Foto ke Gambar Chibi

**User Story:** Sebagai seorang Visitor, saya ingin foto saya dikonversi menjadi gambar chibi, sehingga saya dapat membayangkan tampilan custom figure saya.

#### Acceptance Criteria

1. WHEN Visitor memulai proses konversi, THE Chibi_Converter SHALL memproses foto yang diunggah dan menghasilkan gambar bergaya chibi.
2. WHILE proses konversi berlangsung, THE Make_Your_Moment_Page SHALL menampilkan indikator loading yang menginformasikan Visitor bahwa proses sedang berjalan.
3. WHEN proses konversi selesai, THE Make_Your_Moment_Page SHALL menampilkan hasil gambar chibi kepada Visitor.
4. IF proses konversi gagal karena kesalahan sistem, THEN THE Chibi_Converter SHALL menampilkan pesan kesalahan: "Konversi gagal. Silakan coba lagi." dan menyediakan opsi untuk mengulang proses.
5. THE Make_Your_Moment_Page SHALL menampilkan tombol untuk mengunduh gambar chibi hasil konversi.
6. WHEN gambar chibi berhasil dihasilkan, THE Make_Your_Moment_Page SHALL menampilkan tombol untuk melanjutkan ke tahap visualisasi 3D.

---

### Requirement 7: Visualisasi Model 3D Figure

**User Story:** Sebagai seorang Visitor, saya ingin melihat gambar chibi saya diubah menjadi representasi model 3D figure berukuran 100cm, sehingga saya dapat membayangkan tampilan produk fisik yang akan saya pesan.

#### Acceptance Criteria

1. WHEN Visitor melanjutkan dari tahap chibi ke tahap 3D, THE 3D_Visualizer SHALL memproses gambar chibi dan menghasilkan representasi visual model 3D figure.
2. THE 3D_Visualizer SHALL menampilkan keterangan ukuran figure sebesar 100cm pada hasil visualisasi.
3. WHILE proses pembuatan model 3D berlangsung, THE Make_Your_Moment_Page SHALL menampilkan indikator loading yang menginformasikan Visitor bahwa proses sedang berjalan.
4. WHEN model 3D berhasil dihasilkan, THE Make_Your_Moment_Page SHALL menampilkan hasil visualisasi model 3D figure kepada Visitor.
5. IF proses pembuatan model 3D gagal karena kesalahan sistem, THEN THE 3D_Visualizer SHALL menampilkan pesan kesalahan: "Pembuatan model 3D gagal. Silakan coba lagi." dan menyediakan opsi untuk mengulang proses.
6. WHEN model 3D berhasil dihasilkan, THE Make_Your_Moment_Page SHALL menampilkan tombol "Order Now" yang mengarahkan Visitor ke Order_Form di Landing_Page.

---

### Requirement 8: Formulir Pemesanan

**User Story:** Sebagai seorang Visitor, saya ingin mengisi formulir pemesanan yang tersedia di halaman utama, sehingga saya dapat memesan custom figure ToysMomento dengan mudah.

#### Acceptance Criteria

1. THE Order_Form SHALL menampilkan field input untuk: nama lengkap, nomor telepon, alamat email, dan catatan kustomisasi tambahan.
2. WHEN Visitor mengisi semua field wajib dan mengklik tombol kirim, THE Order_Form SHALL mengirimkan data pemesanan dan menampilkan pesan konfirmasi kepada Visitor.
3. IF Visitor mengklik tombol kirim dengan field wajib yang belum diisi, THEN THE Order_Form SHALL menampilkan pesan validasi pada field yang belum diisi tanpa mengirimkan data.
4. IF Visitor mengisi field email dengan format yang tidak valid, THEN THE Order_Form SHALL menampilkan pesan kesalahan: "Format email tidak valid."
5. WHEN pemesanan berhasil dikirim, THE Order_Form SHALL menampilkan pesan konfirmasi yang menyatakan bahwa tim ToysMomento akan menghubungi Visitor dalam waktu 1x24 jam.

---

### Requirement 9: Aksesibilitas dan Performa Website

**User Story:** Sebagai seorang Visitor, saya ingin website ToysMomento dapat diakses dengan mudah dan cepat, sehingga saya mendapatkan pengalaman browsing yang nyaman.

#### Acceptance Criteria

1. THE Landing_Page SHALL memiliki nilai Lighthouse Performance Score minimal 80 pada perangkat desktop.
2. THE Landing_Page SHALL memiliki nilai Lighthouse Accessibility Score minimal 90.
3. THE Landing_Page SHALL menampilkan atribut `alt` yang deskriptif pada setiap elemen gambar.
4. WHEN Visitor menggunakan keyboard untuk navigasi, THE Landing_Page SHALL memastikan semua elemen interaktif dapat diakses melalui tombol Tab dan diaktifkan melalui tombol Enter atau Space.
5. THE Landing_Page SHALL menggunakan kontras warna antara teks dan latar belakang dengan rasio minimal 4.5:1 sesuai standar WCAG 2.1 Level AA.
