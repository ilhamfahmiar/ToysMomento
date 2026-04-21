# Design Document: ToysMomento Landing Page

## Overview

ToysMomento Landing Page adalah website dua-halaman yang dibangun dengan Next.js 14 (App Router). Halaman pertama adalah **one-page landing page** yang menampilkan Hero, Detail Produk, Testimoni, dan Order Form dalam satu scroll. Halaman kedua adalah **Make Your Moment** — pengalaman interaktif di mana pengunjung mengunggah foto, mendapatkan konversi chibi berbasis AI, lalu melihat visualisasi 3D figure 100cm.

### Ringkasan Temuan Riset

- **Smooth scroll + active nav**: Intersection Observer API (via `react-intersection-observer` v9) adalah pendekatan modern yang performant untuk mendeteksi section aktif tanpa scroll listener. Threshold 0.5 (50% visibility) memberikan UX terbaik.
- **Chibi AI Conversion**: Replicate API menyediakan model Stable Diffusion img2img yang dapat diakses via Next.js API Route. Model yang digunakan harus menghasilkan output bergaya **Nendoroid/chibi 3D figure** — kepala besar dengan proporsi ~1:2 terhadap badan, wajah smooth dengan mata bulat besar, rambut bervolume solid, detail pakaian timbul (pocket, button), tangan membulat tanpa jari detail, dan finish matte seperti figure plastik/resin. Prompt yang digunakan: `"nendoroid style chibi figure, big round head, small cute body, smooth face, large round eyes, small nose, gentle smile, detailed clothing with visible buttons and pockets, rounded hands, matte plastic finish, white background, full body, high quality"`. Model rekomendasi: `stability-ai/stable-diffusion-img2img` atau model LoRA chibi-nendoroid di Replicate.
- **3D Visualization**: React Three Fiber (R3F) + `@react-three/drei` adalah pilihan terbaik untuk integrasi Three.js dengan React. Model 3D GLTF/GLB yang digunakan harus memiliki proporsi dan estetika **Nendoroid** — kepala besar, badan pendek dan gempal, dengan pose standing relaxed. Gambar chibi hasil konversi digunakan sebagai texture mapping pada wajah/kepala figure. Scene ditampilkan dengan OrbitControls untuk rotasi interaktif.

### Chibi & 3D Style Reference

Output chibi dan model 3D ToysMomento mengacu pada style **Nendoroid/chibi figure** dengan karakteristik berikut:

| Aspek           | Spesifikasi                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| Proporsi        | Kepala besar (~1:2 head-to-body ratio), badan pendek dan gempal                  |
| Wajah           | Smooth & clean, mata bulat besar dengan highlight, hidung kecil, senyum tipis    |
| Rambut          | Volume solid, tekstur jelas, tidak flat — mengikuti bentuk rambut asli dari foto |
| Pakaian         | Detail timbul (relief): pocket, button, collar terlihat jelas                    |
| Tangan          | Kecil dan membulat, tanpa detail jari individual                                 |
| Kaki & Sepatu   | Pendek dan gempal, sepatu dengan bentuk simpel                                   |
| Finish material | Matte dengan sedikit ambient occlusion — menyerupai figure plastik/resin         |
| Pose default    | Standing relaxed, kedua tangan sedikit ke samping (T-pose ringan)                |
| Background      | Putih bersih untuk output chibi 2D; scene netral untuk 3D                        |

- **Form handling**: React Hook Form + Zod untuk validasi client-side yang ringan dan type-safe.

---

## Architecture

### Tech Stack

| Layer          | Teknologi                             | Versi             | Alasan                                                                       |
| -------------- | ------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| Framework      | Next.js                               | 14.x (App Router) | SSG untuk landing page, API Routes untuk AI proxy, image optimization bawaan |
| UI Library     | React                                 | 18.x              | Component-based, concurrent features                                         |
| Styling        | Tailwind CSS                          | 3.x               | Utility-first, responsive design mudah, tidak ada runtime overhead           |
| Animation      | Framer Motion                         | 11.x              | Smooth scroll animations, entrance effects                                   |
| 3D Rendering   | React Three Fiber + @react-three/drei | 8.x               | Deklaratif Three.js di React, OrbitControls, useGLTF                         |
| Form           | React Hook Form + Zod                 | 7.x + 3.x         | Validasi type-safe, minimal re-render                                        |
| Active Section | react-intersection-observer           | 9.x               | Performant, no scroll listener                                               |
| AI API         | Replicate API                         | -                 | Akses model Stable Diffusion img2img untuk chibi conversion                  |
| HTTP Client    | Native fetch (Next.js)                | -                 | Built-in, cukup untuk kebutuhan ini                                          |
| Icons          | Lucide React                          | -                 | Tree-shakeable, konsisten                                                    |

### Struktur Routing (App Router)

```
app/
├── layout.tsx              # Root layout: font, metadata global
├── page.tsx                # Landing page (one-page)
├── make-your-moment/
│   └── page.tsx            # Make Your Moment page
└── api/
    ├── convert-chibi/
    │   └── route.ts        # POST: proxy ke Replicate API untuk chibi conversion
    └── submit-order/
        └── route.ts        # POST: handle form submission (email/webhook)
```

### Arsitektur Komponen

```
app/
├── page.tsx                        # Orchestrator: menyusun semua section
│
components/
├── layout/
│   ├── Navbar.tsx                  # Navigation dengan active state
│   ├── Footer.tsx                  # Footer dengan kontak & sosmed
│   └── MobileMenu.tsx              # Hamburger drawer untuk mobile
│
├── sections/                       # Section-section landing page
│   ├── HeroSection.tsx
│   ├── ProductDetailSection.tsx
│   │   ├── QualitySubSection.tsx
│   │   ├── CustomizationSubSection.tsx
│   │   └── MaterialSubSection.tsx
│   ├── TestimoniSection.tsx
│   │   └── TestimoniCard.tsx
│   └── OrderFormSection.tsx
│
├── make-your-moment/               # Komponen halaman MYM
│   ├── PhotoUploader.tsx           # Drag & drop + file input
│   ├── ChibiConverter.tsx          # Trigger konversi + tampilkan hasil
│   ├── ThreeDVisualizer.tsx        # React Three Fiber scene
│   └── StepIndicator.tsx           # Progress: Upload → Chibi → 3D
│
├── ui/                             # Reusable UI primitives
│   ├── Button.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
│
└── hooks/
    ├── useActiveSection.ts         # Intersection Observer untuk active nav
    └── useSmoothScroll.ts          # Smooth scroll ke section by ID
```

### Diagram Alur Data

```mermaid
graph TD
    A[Visitor] -->|Akses /| B[Landing Page]
    B --> C[Navbar]
    B --> D[Hero Section]
    B --> E[Product Detail Section]
    B --> F[Testimoni Section]
    B --> G[Order Form Section]

    C -->|Klik Make Your Moment| H[/make-your-moment]
    D -->|Klik Order Now| G
    G -->|Submit| I[API Route /api/submit-order]
    I -->|Email/Webhook| J[Notifikasi Tim ToysMomento]

    A -->|Akses /make-your-moment| H
    H --> K[PhotoUploader]
    K -->|File valid| L[ChibiConverter]
    L -->|POST foto| M[API Route /api/convert-chibi]
    M -->|Proxy request| N[Replicate API]
    N -->|Gambar chibi| M
    M -->|URL gambar chibi| L
    L -->|Gambar chibi| O[ThreeDVisualizer]
    O -->|Render 3D scene| P[Three.js / R3F]
    O -->|Klik Order Now| G
```

---

## Components and Interfaces

### Navbar

```typescript
interface NavItem {
  label: string;
  // Jika href dimulai dengan '#', lakukan smooth scroll ke section ID
  // Jika href adalah path ('/make-your-moment'), lakukan navigasi halaman
  href: string;
  sectionId?: string; // ID section untuk Intersection Observer
}

interface NavbarProps {
  items: NavItem[];
}

// State internal
// activeSection: string — ID section yang sedang aktif di viewport
// isMenuOpen: boolean — state hamburger menu mobile
```

**Logika Active Section:**

- `useActiveSection` hook menggunakan `IntersectionObserver` dengan threshold `[0.3, 0.7]`
- Setiap `<section>` di landing page memiliki `id` unik: `"hero"`, `"product-detail"`, `"testimoni"`, `"order-form"`
- Hook mengembalikan `activeSection: string` yang digunakan Navbar untuk highlight item aktif

### PhotoUploader

```typescript
interface PhotoUploaderProps {
  onFileAccepted: (file: File) => void;
  onFileRejected: (reason: "format" | "size") => void;
}

// Validasi:
// - Format: ['image/jpeg', 'image/jpg', 'image/png']
// - Ukuran: <= 10 * 1024 * 1024 bytes (10MB)
```

### ChibiConverter

```typescript
interface ChibiConverterProps {
  sourceFile: File;
  onConversionComplete: (chibiImageUrl: string) => void;
  onConversionError: () => void;
}

// State internal
// status: 'idle' | 'converting' | 'success' | 'error'
// chibiImageUrl: string | null
```

**API Contract — POST `/api/convert-chibi`:**

```typescript
// Request body (multipart/form-data)
interface ConvertChibiRequest {
  image: File; // foto asli
}

// Response (JSON)
interface ConvertChibiResponse {
  success: true;
  chibiImageUrl: string; // URL gambar chibi hasil konversi
}

interface ConvertChibiErrorResponse {
  success: false;
  error: string;
}
```

**Implementasi API Route (`/api/convert-chibi/route.ts`):**

- Menerima foto, encode ke base64
- Kirim ke Replicate API dengan model Stable Diffusion img2img yang mendukung style Nendoroid/chibi
- Prompt: `"nendoroid style chibi figure, big round head, small cute body, smooth face, large round eyes, small nose, gentle smile, detailed clothing with visible buttons and pockets, rounded hands, matte plastic finish, white background, full body, high quality"`
- Negative prompt: `"flat 2d anime, realistic face, thin body, elongated limbs, detailed fingers, sharp features"`
- Poll prediction status hingga selesai (Replicate async)
- Return URL gambar hasil

### ThreeDVisualizer

```typescript
interface ThreeDVisualizerProps {
  chibiImageUrl: string;
  onOrderNowClick: () => void;
}

// State internal
// isLoading: boolean
// hasError: boolean
```

**Strategi 3D Visualization:**

Karena konversi foto ke model 3D yang akurat memerlukan pipeline ML yang kompleks (NeRF, 3D Gaussian Splatting), pendekatan yang realistis dan dapat diimplementasikan adalah:

1. **Pre-built Nendoroid 3D Figure Template**: Gunakan model GLTF/GLB figure humanoid dengan proporsi Nendoroid — kepala besar, badan pendek dan gempal, pose standing relaxed. Model ini berfungsi sebagai template dasar yang merepresentasikan produk fisik ToysMomento.
2. **Texture Mapping**: Terapkan gambar chibi hasil konversi sebagai texture pada bagian kepala/wajah figure. Texture di-map menggunakan UV mapping yang sudah disiapkan di template.
3. **Scene Setup**: Tampilkan figure dengan label "100cm", pencahayaan ambient + directional yang menonjolkan efek matte finish, OrbitControls untuk rotasi 360°, dan subtle platform/base di bawah figure.
4. **Fallback**: Jika WebGL tidak tersedia, tampilkan gambar chibi dengan overlay "Visualisasi 3D tidak tersedia di browser ini"

```typescript
// Komponen R3F Scene
function FigureScene({ chibiImageUrl }: { chibiImageUrl: string }) {
  // Load model GLTF Nendoroid template (kepala besar, badan gempal)
  // Apply chibi texture ke material kepala/wajah
  // Setup lighting: AmbientLight + DirectionalLight untuk matte finish effect
  // Tambahkan label "100cm" sebagai Html overlay (@react-three/drei)
  // OrbitControls: enablePan=false, minDistance=3, maxDistance=8
  // Platform/base subtle di bawah figure
}
```

### OrderForm

```typescript
// Zod schema untuk validasi
const orderFormSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  customizationNotes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

// State internal (via React Hook Form)
// formState: { errors, isSubmitting, isSubmitSuccessful }
```

**API Contract — POST `/api/submit-order`:**

```typescript
interface SubmitOrderRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  customizationNotes?: string;
}

interface SubmitOrderResponse {
  success: boolean;
  message: string;
}
```

---

## Data Models

### Testimoni Data

Data testimoni disimpan sebagai static data (tidak perlu database untuk MVP):

```typescript
interface Testimoni {
  id: string;
  customerName: string;
  review: string;
  productImageUrl?: string; // opsional
  rating?: number; // 1-5, opsional
}

// Contoh data statis di /data/testimoni.ts
const testimoniData: Testimoni[] = [
  {
    id: "1",
    customerName: "Rina Kusuma",
    review:
      "Figurnya persis banget sama foto saya! Kualitasnya bagus dan pengirimannya cepat.",
    productImageUrl: "/images/testimoni/rina-figure.jpg",
    rating: 5,
  },
  // ... minimal 3 item
];
```

### Navigation Items

```typescript
const navItems: NavItem[] = [
  { label: "Home", href: "#hero", sectionId: "hero" },
  {
    label: "Detail Product",
    href: "#product-detail",
    sectionId: "product-detail",
  },
  { label: "Testimoni", href: "#testimoni", sectionId: "testimoni" },
  { label: "Make Your Moment", href: "/make-your-moment" },
];
```

### Product Detail Data

```typescript
interface ProductFeature {
  icon: string; // Lucide icon name
  title: string;
  description: string;
}

interface ProductSubSection {
  id: "quality" | "customization" | "material";
  title: string;
  description: string;
  features: ProductFeature[];
  imageUrl?: string;
}
```

### File Upload State (Make Your Moment)

```typescript
type UploadStep = "upload" | "chibi" | "3d";

interface MakeYourMomentState {
  currentStep: UploadStep;
  uploadedFile: File | null;
  uploadPreviewUrl: string | null;
  chibiImageUrl: string | null;
  conversionStatus: "idle" | "converting" | "success" | "error";
  visualizationStatus: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
}
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Berdasarkan analisis prework, fitur ini memiliki beberapa area yang cocok untuk property-based testing, terutama pada validasi input, rendering data dinamis, dan form validation. Library yang digunakan: **fast-check** (TypeScript/JavaScript PBT library).

### Property 1: Testimoni Card Menampilkan Semua Field yang Diperlukan

_For any_ data testimoni yang valid (memiliki `customerName` dan `review`), merender komponen `TestimoniCard` harus menghasilkan output yang mengandung nama pelanggan dan isi ulasan tersebut.

**Validates: Requirements 3.2**

### Property 2: Scroll Navigation Mengarah ke Section yang Benar

_For any_ item menu navigasi yang memiliki `sectionId`, mengklik item tersebut harus memicu scroll ke elemen DOM dengan `id` yang sesuai dengan `sectionId` tersebut.

**Validates: Requirements 4.2, 4.3, 4.4**

### Property 3: Active Section Sesuai dengan Section yang Terlihat

_For any_ section di landing page, ketika section tersebut memasuki viewport (>= 50% terlihat), item navigasi yang memiliki `sectionId` yang sesuai harus mendapatkan class aktif.

**Validates: Requirements 4.6**

### Property 4: Validasi Format File Upload

_For any_ file dengan MIME type selain `image/jpeg`, `image/jpg`, atau `image/png`, fungsi validasi upload harus mengembalikan `{ valid: false, reason: 'format' }`.

**Validates: Requirements 5.3**

### Property 5: Validasi Ukuran File Upload

_For any_ file dengan ukuran lebih dari 10MB (10 × 1024 × 1024 bytes), fungsi validasi upload harus mengembalikan `{ valid: false, reason: 'size' }`.

**Validates: Requirements 5.4**

### Property 6: File Valid Diterima oleh Validasi Upload

_For any_ file dengan MIME type `image/jpeg`, `image/jpg`, atau `image/png` dan ukuran <= 10MB, fungsi validasi upload harus mengembalikan `{ valid: true }`.

**Validates: Requirements 5.2**

### Property 7: Validasi Form — Field Wajib Kosong Ditolak

_For any_ kombinasi data form di mana setidaknya satu field wajib (`fullName`, `phoneNumber`, atau `email`) kosong atau hanya berisi whitespace, validasi Zod schema harus gagal (mengembalikan error).

**Validates: Requirements 8.3**

### Property 8: Validasi Form — Email Tidak Valid Ditolak

_For any_ string yang bukan merupakan format email yang valid (tidak mengandung `@` dan domain yang valid), validasi field `email` pada Zod schema harus gagal dengan pesan "Format email tidak valid."

**Validates: Requirements 8.4**

### Property 9: Setiap Gambar Memiliki Atribut Alt

_For any_ elemen `<img>` yang dirender di Landing Page, elemen tersebut harus memiliki atribut `alt` yang tidak kosong (panjang > 0).

**Validates: Requirements 9.3**

### Property 10: Semua Elemen Interaktif Dapat Difokus dengan Keyboard

_For any_ elemen interaktif (`<button>`, `<a>`, `<input>`, `<textarea>`) yang dirender di Landing Page, elemen tersebut harus memiliki `tabIndex >= 0` atau merupakan elemen yang secara default dapat difokus.

**Validates: Requirements 9.4**

**Catatan Refleksi Properti:**

- Property 4, 5, dan 6 bersama-sama membentuk spesifikasi lengkap validasi file upload. Ketiganya dipertahankan karena menguji kondisi yang berbeda (format invalid, ukuran invalid, valid).
- Property 7 dan 8 menguji aspek berbeda dari validasi form (field kosong vs format email), sehingga keduanya dipertahankan.
- Property 9 dan 10 menguji aspek aksesibilitas yang berbeda (alt text vs keyboard navigation).

---

## Error Handling

### Strategi Error Handling per Layer

#### Client-Side Validation (Sebelum Request)

- **File upload**: Validasi format dan ukuran dilakukan secara sinkron di browser sebelum upload dimulai. Error ditampilkan inline di area upload.
- **Order form**: React Hook Form + Zod memvalidasi setiap field saat `onBlur` dan saat submit. Error ditampilkan di bawah field yang bermasalah.

#### API Route Errors

- **`/api/convert-chibi`**: Jika Replicate API gagal atau timeout (> 60 detik), return `{ success: false, error: "Konversi gagal. Silakan coba lagi." }` dengan HTTP 500.
- **`/api/submit-order`**: Jika pengiriman email/webhook gagal, return `{ success: false, error: "Gagal mengirim pesanan." }` dengan HTTP 500.
- Semua API route menggunakan try-catch dan tidak pernah mengekspos stack trace ke client.

#### Network Errors

- Semua `fetch` call di client dibungkus dengan try-catch.
- Jika network error, tampilkan `ErrorMessage` component dengan pesan generik dan tombol retry.

#### 3D Rendering Errors

- Gunakan React Error Boundary di sekitar `ThreeDVisualizer`.
- Jika WebGL tidak tersedia atau model gagal load, tampilkan fallback: gambar chibi 2D dengan pesan "Visualisasi 3D tidak tersedia."

#### Error States per Komponen

| Komponen         | Error Condition    | Pesan yang Ditampilkan                                     | Aksi                        |
| ---------------- | ------------------ | ---------------------------------------------------------- | --------------------------- |
| PhotoUploader    | Format tidak valid | "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG." | Reset input                 |
| PhotoUploader    | Ukuran > 10MB      | "Ukuran file terlalu besar. Maksimal 10MB."                | Reset input                 |
| ChibiConverter   | API gagal          | "Konversi gagal. Silakan coba lagi."                       | Tombol "Coba Lagi"          |
| ThreeDVisualizer | Render gagal       | "Pembuatan model 3D gagal. Silakan coba lagi."             | Tombol "Coba Lagi"          |
| OrderForm        | Submit gagal       | "Gagal mengirim pesanan. Silakan coba lagi."               | Tombol submit aktif kembali |

---

## Testing Strategy

### Pendekatan Dual Testing

Testing menggunakan dua pendekatan komplementer:

1. **Unit/Component Tests** (Vitest + React Testing Library): Menguji contoh spesifik, edge case, dan interaksi komponen.
2. **Property-Based Tests** (Vitest + fast-check): Menguji properti universal yang harus berlaku untuk semua input valid.

### Setup

```bash
# Dependencies testing
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom fast-check jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

### Property-Based Tests (fast-check)

Setiap property test dikonfigurasi dengan minimum **100 iterasi** (`numRuns: 100`).

**Tag format**: `// Feature: toysmomento-landing-page, Property {N}: {property_text}`

#### Property 4 & 5 & 6 — Validasi File Upload

```typescript
// Feature: toysmomento-landing-page, Property 4: Validasi Format File Upload
// Feature: toysmomento-landing-page, Property 5: Validasi Ukuran File Upload
// Feature: toysmomento-landing-page, Property 6: File Valid Diterima

import fc from "fast-check";
import { validateFile } from "@/lib/validateFile";

test("Property 4: file dengan format tidak valid selalu ditolak", () => {
  fc.assert(
    fc.property(
      fc.constantFrom(
        "image/gif",
        "image/bmp",
        "application/pdf",
        "video/mp4",
        "text/plain",
      ),
      fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
      (mimeType, size) => {
        const result = validateFile({ type: mimeType, size });
        return result.valid === false && result.reason === "format";
      },
    ),
    { numRuns: 100 },
  );
});

test("Property 5: file dengan ukuran > 10MB selalu ditolak", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 10 * 1024 * 1024 + 1, max: 100 * 1024 * 1024 }),
      (size) => {
        const result = validateFile({ type: "image/jpeg", size });
        return result.valid === false && result.reason === "size";
      },
    ),
    { numRuns: 100 },
  );
});

test("Property 6: file valid selalu diterima", () => {
  fc.assert(
    fc.property(
      fc.constantFrom("image/jpeg", "image/jpg", "image/png"),
      fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
      (mimeType, size) => {
        const result = validateFile({ type: mimeType, size });
        return result.valid === true;
      },
    ),
    { numRuns: 100 },
  );
});
```

#### Property 7 & 8 — Validasi Order Form

```typescript
// Feature: toysmomento-landing-page, Property 7: Validasi Form — Field Wajib Kosong Ditolak
// Feature: toysmomento-landing-page, Property 8: Validasi Form — Email Tidak Valid Ditolak

import fc from "fast-check";
import { orderFormSchema } from "@/lib/orderFormSchema";

test("Property 7: form dengan field wajib kosong selalu gagal validasi", () => {
  fc.assert(
    fc.property(
      fc.record({
        fullName: fc.oneof(fc.constant(""), fc.stringMatching(/^\s+$/)),
        phoneNumber: fc.string({ minLength: 1 }),
        email: fc.emailAddress(),
        customizationNotes: fc.option(fc.string()),
      }),
      (data) => {
        const result = orderFormSchema.safeParse(data);
        return result.success === false;
      },
    ),
    { numRuns: 100 },
  );
});

test("Property 8: email tidak valid selalu ditolak", () => {
  fc.assert(
    fc.property(
      // String yang bukan email valid: tidak ada @, atau tidak ada domain
      fc.oneof(
        fc.string().filter((s) => !s.includes("@")),
        fc.string().filter((s) => s.endsWith("@")),
        fc.string().filter((s) => s.startsWith("@")),
      ),
      (invalidEmail) => {
        const result = orderFormSchema.safeParse({
          fullName: "Test User",
          phoneNumber: "08123456789",
          email: invalidEmail,
        });
        return (
          result.success === false &&
          result.error.issues.some((i) => i.path.includes("email"))
        );
      },
    ),
    { numRuns: 100 },
  );
});
```

#### Property 1 — Testimoni Card Rendering

```typescript
// Feature: toysmomento-landing-page, Property 1: Testimoni Card Menampilkan Semua Field

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import TestimoniCard from '@/components/sections/TestimoniCard';

test('Property 1: TestimoniCard selalu menampilkan nama dan ulasan', () => {
  fc.assert(
    fc.property(
      fc.record({
        id: fc.uuid(),
        customerName: fc.string({ minLength: 1, maxLength: 100 }),
        review: fc.string({ minLength: 1, maxLength: 500 }),
        productImageUrl: fc.option(fc.webUrl()),
      }),
      (testimoni) => {
        const { unmount } = render(<TestimoniCard {...testimoni} />);
        const hasName = screen.queryByText(testimoni.customerName) !== null;
        const hasReview = screen.queryByText(testimoni.review) !== null;
        unmount();
        return hasName && hasReview;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 9 — Alt Text pada Gambar

```typescript
// Feature: toysmomento-landing-page, Property 9: Setiap Gambar Memiliki Atribut Alt

import { render } from '@testing-library/react';
import LandingPage from '@/app/page';

test('Property 9: semua elemen img memiliki atribut alt yang tidak kosong', () => {
  const { container } = render(<LandingPage />);
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    expect(img).toHaveAttribute('alt');
    expect(img.getAttribute('alt')!.length).toBeGreaterThan(0);
  });
});
```

### Unit Tests (Contoh Spesifik)

```typescript
// Contoh unit test untuk interaksi navigasi
test('klik tombol Order Now di Hero melakukan scroll ke Order Form', async () => {
  const user = userEvent.setup();
  render(<LandingPage />);
  const orderNowBtn = screen.getByRole('button', { name: /order now/i });
  await user.click(orderNowBtn);
  // Verifikasi scroll dipanggil dengan ID yang benar
  expect(window.scrollTo).toHaveBeenCalled();
});

// Contoh unit test untuk error message upload
test('menampilkan pesan error saat format file tidak valid', async () => {
  const user = userEvent.setup();
  render(<PhotoUploader onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />);
  const file = new File(['content'], 'test.gif', { type: 'image/gif' });
  const input = screen.getByLabelText(/upload foto/i);
  await user.upload(input, file);
  expect(screen.getByText(/format file tidak didukung/i)).toBeInTheDocument();
});
```

### Integration Tests

- **`/api/convert-chibi`**: Test dengan mock Replicate API, verifikasi request format dan response parsing.
- **`/api/submit-order`**: Test dengan mock email service, verifikasi data dikirim dengan benar.

### Smoke Tests (Lighthouse)

- Jalankan Lighthouse CI di pipeline untuk memverifikasi Performance Score >= 80 dan Accessibility Score >= 90.
- Konfigurasi di `.lighthouserc.js`.

### Cakupan Test yang Diharapkan

| Area                     | Tipe Test          | Target Coverage         |
| ------------------------ | ------------------ | ----------------------- |
| Validasi file upload     | Property-based     | 100% branch             |
| Validasi order form      | Property-based     | 100% branch             |
| Rendering testimoni      | Property-based     | 100%                    |
| Navigasi scroll          | Unit               | Semua 3 item scroll     |
| Error states             | Unit               | Semua 5 error condition |
| API routes               | Integration        | Happy path + error path |
| Performa & aksesibilitas | Smoke (Lighthouse) | Score threshold         |
