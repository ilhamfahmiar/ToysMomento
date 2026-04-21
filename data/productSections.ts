import type { ProductSubSection } from "@/types";

export const productSections: ProductSubSection[] = [
  {
    id: "quality",
    title: "Kualitas Premium",
    description:
      "Setiap figure ToysMomento dibuat dengan standar kualitas tertinggi menggunakan teknologi cetak 3D presisi tinggi. Detail wajah, rambut, dan pakaian direproduksi dengan akurasi luar biasa.",
    features: [
      {
        icon: "Star",
        title: "Detail Tinggi",
        description:
          "Teknologi cetak 3D resolusi tinggi menghasilkan detail wajah dan ekspresi yang sangat akurat.",
      },
      {
        icon: "Shield",
        title: "Tahan Lama",
        description:
          "Material resin premium yang tahan terhadap benturan ringan dan tidak mudah pudar warnanya.",
      },
      {
        icon: "Award",
        title: "Quality Control Ketat",
        description:
          "Setiap figure melewati proses quality control berlapis sebelum dikirimkan ke pelanggan.",
      },
      {
        icon: "Palette",
        title: "Warna Akurat",
        description:
          "Sistem pewarnaan presisi memastikan warna figure sesuai dengan foto asli Anda.",
      },
    ],
    imageUrl: "/images/product/quality-showcase.jpg",
  },
  {
    id: "customization",
    title: "Kustomisasi Penuh",
    description:
      "Wujudkan figure impian Anda dengan pilihan kustomisasi yang lengkap. Dari pose, ekspresi, aksesori, hingga detail pakaian — semuanya bisa disesuaikan.",
    features: [
      {
        icon: "User",
        title: "Pose Bebas",
        description:
          "Pilih dari berbagai pose: standing, sitting, action pose, atau pose custom sesuai keinginan.",
      },
      {
        icon: "Smile",
        title: "Ekspresi Wajah",
        description:
          "Tersedia berbagai pilihan ekspresi: senyum, serius, ceria, atau ekspresi khas Anda.",
      },
      {
        icon: "Shirt",
        title: "Pakaian & Aksesori",
        description:
          "Reproduksi pakaian favorit Anda atau pilih dari koleksi kostum ToysMomento.",
      },
      {
        icon: "Layers",
        title: "Ukuran Fleksibel",
        description:
          "Tersedia dalam berbagai ukuran: 10cm, 20cm, 50cm, hingga 100cm sesuai kebutuhan.",
      },
    ],
    imageUrl: "/images/product/customization-showcase.jpg",
  },
  {
    id: "material",
    title: "Bahan Berkualitas",
    description:
      "ToysMomento menggunakan material pilihan yang aman, tahan lama, dan ramah lingkungan. Setiap bahan dipilih dengan cermat untuk menghasilkan figure terbaik.",
    features: [
      {
        icon: "Zap",
        title: "Resin Premium",
        description:
          "Resin food-grade berkualitas tinggi yang aman untuk semua usia dan tidak mengandung BPA.",
      },
      {
        icon: "Droplets",
        title: "Cat Ramah Lingkungan",
        description:
          "Cat berbasis air yang aman, tidak beracun, dan memiliki ketahanan warna jangka panjang.",
      },
      {
        icon: "Package",
        title: "Finishing Matte",
        description:
          "Lapisan finishing matte premium yang memberikan tampilan elegan dan melindungi dari debu.",
      },
      {
        icon: "Recycle",
        title: "Eco-Friendly",
        description:
          "Komitmen kami terhadap lingkungan: menggunakan material yang dapat didaur ulang.",
      },
    ],
    imageUrl: "/images/product/material-showcase.jpg",
  },
];
