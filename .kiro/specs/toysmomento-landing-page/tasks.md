# Implementation Plan: ToysMomento Landing Page

## Overview

Implementasi website dua-halaman ToysMomento menggunakan Next.js 14 (App Router), Tailwind CSS, Framer Motion, React Three Fiber, React Hook Form + Zod, dan Replicate API. Pendekatan incremental: mulai dari setup proyek dan fondasi, lalu bangun setiap section secara bertahap, integrasikan fitur AI + 3D, dan akhiri dengan testing serta optimasi aksesibilitas.

## Tasks

- [x] 1. Setup proyek dan fondasi
  - Inisialisasi proyek Next.js 14 dengan App Router, TypeScript, dan Tailwind CSS
  - Install semua dependencies: `framer-motion`, `@react-three/fiber`, `@react-three/drei`, `three`, `react-hook-form`, `zod`, `react-intersection-observer`, `lucide-react`, `replicate`
  - Install dev dependencies testing: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `fast-check`, `jsdom`, `@vitejs/plugin-react`
  - Buat `vitest.config.ts` dengan konfigurasi environment `jsdom` dan setup file
  - Buat `src/test/setup.ts` untuk import `@testing-library/jest-dom`
  - Konfigurasi `tailwind.config.ts` dengan custom color palette dan font ToysMomento
  - Buat `app/layout.tsx` sebagai root layout dengan global font dan metadata
  - Buat struktur direktori: `components/layout/`, `components/sections/`, `components/make-your-moment/`, `components/ui/`, `components/hooks/`, `data/`, `lib/`, `public/images/`
  - Buat `data/testimoni.ts` dengan minimal 3 data testimoni statis (sesuai interface `Testimoni`)
  - Buat `data/navItems.ts` dengan 4 nav items sesuai spesifikasi
  - Buat `data/productSections.ts` dengan data 3 sub-section produk (kualitas, kustomisasi, bahan)
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. UI primitives dan shared components
  - [x] 2.1 Buat komponen `components/ui/Button.tsx`
    - Varian: `primary`, `secondary`, `ghost`
    - Support props: `onClick`, `disabled`, `type`, `className`, `children`
    - Pastikan accessible: `aria-label` support, fokus keyboard visible
    - _Requirements: 1.3, 9.4_

  - [x] 2.2 Buat komponen `components/ui/LoadingSpinner.tsx`
    - Animasi spinner dengan Tailwind atau Framer Motion
    - Tambahkan `aria-label="Loading..."` dan `role="status"` untuk aksesibilitas
    - _Requirements: 6.2, 7.3_

  - [x] 2.3 Buat komponen `components/ui/ErrorMessage.tsx`
    - Menerima props: `message: string`, `onRetry?: () => void`
    - Tampilkan pesan error dan tombol "Coba Lagi" jika `onRetry` tersedia
    - _Requirements: 6.4, 7.5_

- [x] 3. Custom hooks untuk navigasi
  - [x] 3.1 Buat `components/hooks/useActiveSection.ts`
    - Implementasi menggunakan `IntersectionObserver` dari `react-intersection-observer`
    - Threshold `[0.3, 0.7]`, return `activeSection: string`
    - Terima list `sectionIds: string[]` sebagai parameter
    - _Requirements: 4.6_

  - [x] 3.2 Buat `components/hooks/useSmoothScroll.ts`
    - Fungsi `scrollToSection(sectionId: string)` yang scroll ke elemen dengan id tersebut
    - Gunakan `behavior: 'smooth'` pada `scrollIntoView`
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]\* 3.3 Tulis property test untuk scroll navigation (Property 2)
    - **Property 2: Scroll Navigation Mengarah ke Section yang Benar**
    - **Validates: Requirements 4.2, 4.3, 4.4**
    - Untuk setiap nav item dengan `sectionId`, verifikasi scroll target adalah elemen dengan id yang sesuai
    - Tag: `// Feature: toysmomento-landing-page, Property 2`
    - `numRuns: 100`

  - [ ]\* 3.4 Tulis property test untuk active section (Property 3)
    - **Property 3: Active Section Sesuai dengan Section yang Terlihat**
    - **Validates: Requirements 4.6**
    - Untuk setiap section yang masuk viewport >= 50%, nav item dengan `sectionId` yang sesuai harus aktif
    - Tag: `// Feature: toysmomento-landing-page, Property 3`
    - `numRuns: 100`

- [x] 4. Layout: Navbar dan Footer
  - [x] 4.1 Buat komponen `components/layout/MobileMenu.tsx`
    - Hamburger drawer yang dapat dibuka/tutup
    - Menerima props: `items: NavItem[]`, `activeSection: string`, `isOpen: boolean`, `onClose: () => void`
    - Animasi slide-in dengan Framer Motion
    - _Requirements: 4.7_

  - [x] 4.2 Buat komponen `components/layout/Navbar.tsx`
    - Gunakan `useActiveSection` hook untuk highlight item aktif
    - Gunakan `useSmoothScroll` hook untuk scroll ke section
    - Tampilkan 4 item menu sesuai `navItems` data
    - Integrasikan `MobileMenu` untuk tampilan mobile
    - Item "Make Your Moment" navigasi ke `/make-your-moment` (Next.js Link)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.3 Buat komponen `components/layout/Footer.tsx`
    - Tampilkan informasi kontak ToysMomento
    - Tampilkan tautan media sosial dengan ikon Lucide
    - _Requirements: 1.4_

  - [ ]\* 4.4 Tulis unit tests untuk Navbar
    - Test: 4 item menu tampil dengan benar
    - Test: klik item scroll (Home, Detail Product, Testimoni) memanggil `scrollToSection` dengan id yang benar
    - Test: klik "Make Your Moment" menggunakan Next.js Link (href `/make-your-moment`)
    - Test: item aktif mendapat class highlight/underline
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Checkpoint — Fondasi dan navigasi
  - Pastikan semua komponen di atas dapat di-render tanpa error
  - Pastikan semua unit tests di task 4 lulus
  - Pastikan semua property tests di task 3 lulus
  - Tanyakan kepada user jika ada pertanyaan sebelum lanjut

- [x] 6. Landing page — Hero Section
  - [x] 6.1 Buat komponen `components/sections/HeroSection.tsx`
    - Layout dua kolom: kiri (tagline + tombol "Order Now"), kanan (gambar produk)
    - Tombol "Order Now" memanggil `useSmoothScroll` ke `#order-form`
    - Animasi entrance dengan Framer Motion (fade in + slide up)
    - Section memiliki `id="hero"` untuk scroll anchor
    - Responsif mobile dengan layout satu kolom
    - Gambar menggunakan Next.js `<Image>` dengan atribut `alt` deskriptif
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 9.3_

  - [ ]\* 6.2 Tulis unit tests untuk HeroSection
    - Test: tagline brand tampil
    - Test: tombol "Order Now" ada dan dapat diklik
    - Test: klik tombol "Order Now" memicu scroll ke `#order-form`
    - Test: gambar produk memiliki atribut `alt` yang tidak kosong
    - _Requirements: 1.2, 1.3, 9.3_

- [x] 7. Landing page — Product Detail Section
  - [x] 7.1 Buat komponen `components/sections/ProductDetailSection.tsx`
    - Section dengan `id="product-detail"` untuk scroll anchor
    - Menyusun tiga sub-section dari `productSections` data
    - _Requirements: 2.1_

  - [x] 7.2 Buat `components/sections/QualitySubSection.tsx`
    - Tampilkan fitur kualitas produk dengan ikon Lucide dan deskripsi
    - Animasi entrance Framer Motion saat masuk viewport
    - _Requirements: 2.2_

  - [x] 7.3 Buat `components/sections/CustomizationSubSection.tsx`
    - Tampilkan pilihan kustomisasi (pose, ekspresi, aksesori, warna)
    - Animasi entrance Framer Motion saat masuk viewport
    - _Requirements: 2.3_

  - [x] 7.4 Buat `components/sections/MaterialSubSection.tsx`
    - Tampilkan informasi bahan dan keunggulannya
    - Animasi entrance Framer Motion saat masuk viewport
    - _Requirements: 2.4_

  - [ ]\* 7.5 Tulis unit tests untuk ProductDetailSection
    - Test: ketiga sub-section tampil (kualitas, kustomisasi, bahan)
    - Test: layout responsif pada mobile viewport
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Landing page — Testimoni Section
  - [x] 8.1 Buat komponen `components/sections/TestimoniCard.tsx`
    - Menerima props dari interface `Testimoni`: `id`, `customerName`, `review`, `productImageUrl?`, `rating?`
    - Tampilkan nama pelanggan, ulasan, dan gambar produk (jika ada)
    - Jika `productImageUrl` tersedia, gunakan Next.js `<Image>` dengan `alt` deskriptif
    - _Requirements: 3.2, 9.3_

  - [ ]\* 8.2 Tulis property test untuk TestimoniCard rendering (Property 1)
    - **Property 1: Testimoni Card Menampilkan Semua Field yang Diperlukan**
    - **Validates: Requirements 3.2**
    - Untuk setiap data testimoni valid (customerName + review non-empty), card selalu menampilkan keduanya
    - Tag: `// Feature: toysmomento-landing-page, Property 1`
    - `numRuns: 100`

  - [x] 8.3 Buat komponen `components/sections/TestimoniSection.tsx`
    - Section dengan `id="testimoni"` untuk scroll anchor
    - Render minimal 3 `TestimoniCard` dari `testimoniData`
    - Layout grid responsif (1 kolom mobile, 3 kolom desktop)
    - Animasi entrance Framer Motion
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]\* 8.4 Tulis unit tests untuk TestimoniSection
    - Test: minimal 3 card ditampilkan
    - Test: setiap card memuat nama dan ulasan
    - _Requirements: 3.1, 3.2_

- [x] 9. Landing page — Order Form Section
  - [x] 9.1 Buat `lib/orderFormSchema.ts`
    - Definisikan Zod schema `orderFormSchema` sesuai spesifikasi desain
    - Field: `fullName` (required), `phoneNumber` (required), `email` (required, format email), `customizationNotes` (optional)
    - Export type `OrderFormData`
    - _Requirements: 8.1, 8.3, 8.4_

  - [ ]\* 9.2 Tulis property tests untuk validasi Order Form (Property 7 & 8)
    - **Property 7: Validasi Form — Field Wajib Kosong Ditolak**
    - **Validates: Requirements 8.3**
    - **Property 8: Validasi Form — Email Tidak Valid Ditolak**
    - **Validates: Requirements 8.4**
    - Implementasi sesuai contoh kode di design document
    - Tag: `// Feature: toysmomento-landing-page, Property 7` dan `Property 8`
    - `numRuns: 100`

  - [x] 9.3 Buat komponen `components/sections/OrderFormSection.tsx`
    - Section dengan `id="order-form"` untuk scroll anchor
    - Implementasi form menggunakan React Hook Form + `orderFormSchema` Zod
    - Field: nama lengkap, nomor telepon, email, catatan kustomisasi
    - Validasi `onBlur` + saat submit; tampilkan error di bawah field yang bermasalah
    - Submit memanggil `POST /api/submit-order`
    - Saat loading tampilkan `LoadingSpinner`, saat error tampilkan `ErrorMessage`
    - Saat sukses tampilkan pesan konfirmasi "tim ToysMomento akan menghubungi Anda dalam 1x24 jam"
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]\* 9.4 Tulis unit tests untuk OrderFormSection
    - Test: semua 4 field input tampil
    - Test: submit dengan field kosong menampilkan pesan validasi (tidak submit)
    - Test: submit dengan email invalid menampilkan "Format email tidak valid."
    - Test: submit sukses menampilkan pesan konfirmasi 1x24 jam
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. API Route — Submit Order
  - [x] 10.1 Buat `app/api/submit-order/route.ts`
    - Menerima `POST` request dengan body `SubmitOrderRequest`
    - Validasi input menggunakan `orderFormSchema`
    - Kirim notifikasi ke tim ToysMomento (email atau webhook — gunakan `console.log` sebagai placeholder untuk MVP, sertakan TODO komentar untuk integrasi email service)
    - Return `{ success: true, message: "..." }` atau `{ success: false, error: "..." }`
    - Semua error di-wrap dalam try-catch, tidak mengekspos stack trace
    - _Requirements: 8.2_

  - [ ]\* 10.2 Tulis integration tests untuk `/api/submit-order`
    - Test: request valid mengembalikan `{ success: true }`
    - Test: request dengan field kosong mengembalikan error validasi
    - Test: simulasi service failure mengembalikan `{ success: false, error: "Gagal mengirim pesanan." }`
    - _Requirements: 8.2_

- [x] 11. Rakitan Landing Page
  - [x] 11.1 Buat `app/page.tsx`
    - Susun semua section secara berurutan: `HeroSection`, `ProductDetailSection`, `TestimoniSection`, `OrderFormSection`
    - Import dan render `Navbar` dan `Footer`
    - Pastikan setiap section memiliki `id` yang benar untuk scroll anchor
    - _Requirements: 1.1, 1.4_

  - [ ]\* 11.2 Tulis property test untuk alt text gambar (Property 9)
    - **Property 9: Setiap Gambar Memiliki Atribut Alt**
    - **Validates: Requirements 9.3**
    - Render `LandingPage`, query semua `<img>`, verifikasi setiap elemen memiliki `alt` tidak kosong
    - Tag: `// Feature: toysmomento-landing-page, Property 9`

  - [ ]\* 11.3 Tulis unit tests untuk aksesibilitas keyboard (Property 10)
    - **Property 10: Semua Elemen Interaktif Dapat Difokus dengan Keyboard**
    - **Validates: Requirements 9.4**
    - Query semua `button`, `a`, `input`, `textarea` di Landing Page, verifikasi `tabIndex >= 0` atau merupakan elemen focusable default
    - Tag: `// Feature: toysmomento-landing-page, Property 10`

- [x] 12. Checkpoint — Landing page lengkap
  - Pastikan semua section Landing Page tampil dan dapat di-scroll dengan benar
  - Pastikan Navbar active state bekerja saat scroll
  - Pastikan Order Form dapat disubmit dan menampilkan pesan konfirmasi
  - Pastikan semua tests di task 6–11 lulus
  - Tanyakan kepada user jika ada pertanyaan sebelum lanjut ke Make Your Moment page

- [x] 13. File validation library
  - [x] 13.1 Buat `lib/validateFile.ts`
    - Fungsi `validateFile({ type: string, size: number }): { valid: true } | { valid: false, reason: 'format' | 'size' }`
    - Format yang diterima: `image/jpeg`, `image/jpg`, `image/png`
    - Ukuran maksimal: `10 * 1024 * 1024` bytes (10MB)
    - Periksa format terlebih dahulu, lalu ukuran
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]\* 13.2 Tulis property tests untuk validasi file (Property 4, 5, 6)
    - **Property 4: Validasi Format File Upload**
    - **Validates: Requirements 5.3**
    - **Property 5: Validasi Ukuran File Upload**
    - **Validates: Requirements 5.4**
    - **Property 6: File Valid Diterima oleh Validasi Upload**
    - **Validates: Requirements 5.2**
    - Implementasi sesuai contoh kode di design document
    - Tag: `// Feature: toysmomento-landing-page, Property 4`, `Property 5`, `Property 6`
    - `numRuns: 100`

- [x] 14. Make Your Moment — Photo Uploader
  - [x] 14.1 Buat komponen `components/make-your-moment/StepIndicator.tsx`
    - Tampilkan progress 3 langkah: Upload → Chibi → 3D
    - Menerima props: `currentStep: UploadStep`
    - Highlight step yang aktif
    - _Requirements: 5.1_

  - [x] 14.2 Buat komponen `components/make-your-moment/PhotoUploader.tsx`
    - Area drag & drop + file input button
    - Validasi menggunakan `validateFile` dari `lib/validateFile.ts`
    - Pada format invalid: tampilkan `ErrorMessage` dengan pesan "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG."
    - Pada ukuran > 10MB: tampilkan `ErrorMessage` dengan pesan "Ukuran file terlalu besar. Maksimal 10MB."
    - Pada file valid: panggil `onFileAccepted(file)` dan tampilkan preview foto
    - Tombol "Mulai Konversi" muncul setelah foto berhasil diupload
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]\* 14.3 Tulis unit tests untuk PhotoUploader
    - Test: upload file GIF menampilkan pesan error format
    - Test: upload file PNG > 10MB menampilkan pesan error ukuran
    - Test: upload file JPEG valid menampilkan preview dan tombol "Mulai Konversi"
    - Test: `onFileAccepted` dipanggil dengan file yang benar saat file valid
    - Test: `onFileRejected` dipanggil dengan reason yang benar saat file invalid
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 15. API Route — Convert Chibi
  - [x] 15.1 Buat `app/api/convert-chibi/route.ts`
    - Menerima `POST` request dengan `multipart/form-data` berisi field `image: File`
    - Encode gambar ke base64
    - Kirim request ke Replicate API menggunakan model Stable Diffusion img2img
    - Prompt: `"nendoroid style chibi figure, big round head, small cute body, smooth face, large round eyes, small nose, gentle smile, detailed clothing with visible buttons and pockets, rounded hands, matte plastic finish, white background, full body, high quality"`
    - Negative prompt: `"flat 2d anime, realistic face, thin body, elongated limbs, detailed fingers, sharp features"`
    - Poll prediction status Replicate hingga selesai atau timeout 60 detik
    - Return `{ success: true, chibiImageUrl: "..." }` atau `{ success: false, error: "Konversi gagal. Silakan coba lagi." }`
    - Semua error di-wrap dalam try-catch; tidak mengekspos stack trace
    - _Requirements: 6.1_

  - [ ]\* 15.2 Tulis integration tests untuk `/api/convert-chibi`
    - Test dengan mock Replicate API: request valid mengembalikan `{ success: true, chibiImageUrl: "..." }`
    - Test: Replicate API error mengembalikan `{ success: false, error: "Konversi gagal. Silakan coba lagi." }`
    - Test: timeout 60 detik mengembalikan error response
    - _Requirements: 6.1, 6.4_

- [x] 16. Make Your Moment — Chibi Converter
  - [x] 16.1 Buat komponen `components/make-your-moment/ChibiConverter.tsx`
    - Menerima props: `sourceFile: File`, `onConversionComplete(chibiImageUrl: string)`, `onConversionError()`
    - State internal: `status: 'idle' | 'converting' | 'success' | 'error'`
    - Saat render: otomatis mulai konversi dengan `POST /api/convert-chibi`
    - Saat `converting`: tampilkan `LoadingSpinner` dengan teks status
    - Saat `success`: tampilkan gambar chibi hasil, tombol download, dan tombol "Lanjut ke 3D"
    - Saat `error`: tampilkan `ErrorMessage` dengan tombol "Coba Lagi"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]\* 16.2 Tulis unit tests untuk ChibiConverter
    - Test: LoadingSpinner tampil saat status `converting`
    - Test: gambar chibi tampil saat status `success`
    - Test: tombol download tampil saat `success`
    - Test: ErrorMessage tampil saat status `error`
    - Test: `onConversionComplete` dipanggil dengan URL yang benar saat API sukses (mock fetch)
    - Test: `onConversionError` dipanggil saat API gagal (mock fetch)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 17. Make Your Moment — 3D Visualizer
  - [x] 17.1 Siapkan aset 3D Nendoroid template
    - Tempatkan file GLTF/GLB Nendoroid figure template di `public/models/nendoroid-template.glb`
    - Template harus memiliki proporsi Nendoroid: kepala besar, badan pendek gempal, pose standing relaxed
    - Pastikan UV mapping disiapkan untuk texture replacement pada area kepala/wajah
    - _Requirements: 7.1_

  - [x] 17.2 Buat komponen `components/make-your-moment/ThreeDVisualizer.tsx`
    - Buat React Three Fiber Canvas dengan `FigureScene` sub-komponen
    - `FigureScene`: load GLTF template via `useGLTF`, apply chibi texture ke material kepala/wajah
    - Lighting: `AmbientLight` (intensity 0.6) + `DirectionalLight` (intensity 1.0) untuk matte finish effect
    - Tambahkan `OrbitControls`: `enablePan=false`, `minDistance=3`, `maxDistance=8`
    - Label "100cm" sebagai `Html` overlay dari `@react-three/drei`
    - Subtle platform/base di bawah figure
    - Bungkus Canvas dengan React Error Boundary untuk fallback jika WebGL tidak tersedia
    - Fallback: gambar chibi 2D dengan overlay "Visualisasi 3D tidak tersedia di browser ini"
    - Tampilkan tombol "Order Now" di bawah Canvas yang memanggil `onOrderNowClick`
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_

  - [ ]\* 17.3 Tulis unit tests untuk ThreeDVisualizer
    - Test: label "100cm" tampil dalam scene (via `Html` overlay)
    - Test: tombol "Order Now" ada dan dapat diklik
    - Test: `onOrderNowClick` dipanggil saat tombol diklik
    - Test: fallback tampil ketika WebGL tidak tersedia (mock WebGL context)
    - _Requirements: 7.2, 7.5, 7.6_

- [x] 18. Rakitan Make Your Moment Page
  - [x] 18.1 Buat `app/make-your-moment/page.tsx`
    - State management: `MakeYourMomentState` (currentStep, uploadedFile, chibiImageUrl, dsb.)
    - Render `StepIndicator` dengan `currentStep` aktif
    - Step `upload`: render `PhotoUploader`; `onFileAccepted` → set file dan pindah ke step `chibi`
    - Step `chibi`: render `ChibiConverter`; `onConversionComplete` → set chibiUrl dan pindah ke step `3d`
    - Step `3d`: render `ThreeDVisualizer`; `onOrderNowClick` → navigasi ke `/#order-form`
    - Saat proses 3D loading: tampilkan `LoadingSpinner`
    - Pastikan Navbar dan Footer tersedia di halaman ini
    - _Requirements: 5.1, 6.1, 7.1, 7.3, 7.4_

  - [ ]\* 18.2 Tulis unit tests untuk Make Your Moment page
    - Test: halaman mulai di step `upload` dengan `PhotoUploader` tampil
    - Test: setelah file diterima, pindah ke step `chibi` dengan `ChibiConverter` tampil
    - Test: setelah konversi selesai, pindah ke step `3d` dengan `ThreeDVisualizer` tampil
    - Test: `StepIndicator` memperbarui step aktif dengan benar
    - _Requirements: 5.1, 6.3, 7.4_

- [x] 19. Checkpoint — Make Your Moment lengkap
  - Pastikan alur Upload → Chibi → 3D berjalan dari ujung ke ujung
  - Pastikan semua error states ditangani dan ditampilkan dengan benar
  - Pastikan semua tests di task 13–18 lulus
  - Tanyakan kepada user jika ada pertanyaan sebelum lanjut ke optimasi

- [x] 20. Optimasi aksesibilitas dan performa
  - [x] 20.1 Audit dan perbaiki kontras warna
    - Verifikasi semua kombinasi teks/background memiliki rasio kontras minimal 4.5:1 (WCAG 2.1 AA)
    - Perbaiki warna Tailwind jika kontras tidak memenuhi syarat
    - _Requirements: 9.5_

  - [x] 20.2 Optimasi gambar dan performa
    - Pastikan semua gambar menggunakan Next.js `<Image>` dengan `width`, `height`, dan `priority` yang tepat
    - Tambahkan `loading="lazy"` pada gambar below-the-fold
    - Verifikasi tidak ada layout shift (CLS) pada Navbar dan Hero
    - _Requirements: 1.6, 9.1_

  - [x] 20.3 Setup Lighthouse CI
    - Buat `.lighthouserc.js` dengan threshold: `performance >= 80`, `accessibility >= 90`
    - Konfigurasi script npm `"lighthouse": "lhci autorun"` di `package.json`
    - _Requirements: 9.1, 9.2_

  - [ ]\* 20.4 Verifikasi Lighthouse score
    - Jalankan Lighthouse CI secara lokal terhadap build produksi
    - Pastikan Performance Score >= 80 dan Accessibility Score >= 90
    - _Requirements: 9.1, 9.2_

- [x] 21. Final checkpoint — Semua tests lulus
  - Jalankan seluruh test suite: `vitest --run`
  - Pastikan semua unit tests, property tests, dan integration tests lulus
  - Pastikan tidak ada TypeScript errors (`tsc --noEmit`)
  - Tanyakan kepada user jika ada pertanyaan atau hal yang perlu disesuaikan

## Notes

- Task yang diikuti tanda `*` adalah opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirements spesifik untuk keterlacakan
- Property tests menggunakan fast-check dengan minimum 100 iterasi (`numRuns: 100`)
- Seluruh kode menggunakan TypeScript strict mode
- Komponen 3D (ThreeDVisualizer) harus di-dynamic import dengan `ssr: false` karena ketergantungan pada WebGL
- API Route Replicate memerlukan environment variable `REPLICATE_API_TOKEN` di `.env.local`
- Model GLTF Nendoroid template dapat diganti dengan model custom yang lebih sesuai brand ToysMomento
