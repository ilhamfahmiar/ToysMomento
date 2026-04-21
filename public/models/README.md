# 3D Model Assets — ToysMomento

Direktori ini menyimpan aset model 3D yang digunakan oleh komponen `ThreeDVisualizer`.

## File yang Dibutuhkan

### `nendoroid-template.glb`

File model 3D utama dalam format **GLTF Binary (.glb)** yang berfungsi sebagai template figure Nendoroid.

#### Spesifikasi Model

| Aspek           | Spesifikasi                                                                |
| --------------- | -------------------------------------------------------------------------- |
| Format          | GLTF 2.0 Binary (`.glb`)                                                   |
| Ukuran file     | Disarankan < 5MB untuk performa web optimal                                |
| Proporsi        | Nendoroid: kepala besar (~1:2 head-to-body ratio), badan pendek dan gempal |
| Pose default    | Standing relaxed, kedua tangan sedikit ke samping                          |
| UV Mapping      | Wajib ada UV mapping pada area kepala/wajah untuk texture replacement      |
| Material kepala | Material terpisah bernama `head` atau `face` untuk texture mapping chibi   |
| Skala           | Tinggi total figure ≈ 1–2 unit Three.js (dapat disesuaikan via scale prop) |
| Polygon count   | Disarankan < 50.000 triangles untuk performa mobile                        |

#### Karakteristik Visual

- **Kepala**: Besar, bulat, dengan area wajah yang flat untuk texture mapping
- **Badan**: Pendek dan gempal, detail pakaian timbul (pocket, button, collar)
- **Tangan**: Kecil dan membulat, tanpa detail jari individual
- **Kaki & Sepatu**: Pendek dan gempal, sepatu dengan bentuk simpel
- **Finish**: Matte — cocok dengan pencahayaan AmbientLight + DirectionalLight

#### Cara Mendapatkan Model

1. **Buat sendiri** menggunakan Blender dengan referensi proporsi Nendoroid
2. **Gunakan model dari Sketchfab** (pastikan lisensi mengizinkan penggunaan komersial)
3. **Komisikan** kepada 3D artist dengan spesifikasi di atas

## Status Saat Ini

⚠️ **File `nendoroid-template.glb` belum tersedia.**

Komponen `ThreeDVisualizer` saat ini menggunakan fallback 3D scene dengan Three.js primitives.
Tempatkan file `.glb` di direktori ini untuk mengaktifkan model 3D penuh.
