# Rancangan Teknis

## Alur data

```
Browser pengunjung/admin
        |
        v
Next.js di Vercel (server)          <- semua akses Supabase terjadi di sini
  - Server Component: membaca data
  - Server Action: memproses form
  - proxy.js: menjaga halaman /admin
        |
        v
Supabase
  - Tabel produk (RLS aktif)
  - Auth (akun admin)
```

Browser tidak pernah berhubungan langsung dengan Supabase. Alamat proyek dan kunci Supabase hanya ada di server.

## Dua jenis koneksi Supabase

| Koneksi | Kunci | Dipakai untuk |
| --- | --- | --- |
| Koneksi server untuk pengunjung | `SUPABASE_SECRET_KEY` | Membaca katalog dan detail produk (pengunjung tidak login, dan RLS menolak akses publik) |
| Koneksi sesi admin | `SUPABASE_PUBLISHABLE_KEY` + cookie login (`@supabase/ssr`) | Login, keluar, ganti password, dan aksi tambah/ubah/hapus produk |

Kunci rahasia melewati semua aturan RLS, jadi hanya dipakai untuk membaca data publik. Aksi yang mengubah data memakai koneksi sesi admin, sehingga RLS tetap berlaku.

## Struktur folder

```
app/
  page.jsx                  katalog (US-01)
  produk/[id]/page.jsx      detail produk (US-02)
  admin/
    login/page.jsx          login (US-04)
    page.jsx                daftar produk admin (US-07, bonus)
    password/page.jsx       ganti password (US-05)
    produk/baru/page.jsx    tambah produk (US-08, bonus)
    produk/[id]/ubah/...    ubah produk (US-09, bonus)
components/                 komponen tampilan (lihat DESIGN.md)
lib/
  toko.js                   identitas toko dan nomor WhatsApp
  data-contoh.js            data contoh sebelum terhubung database
  format.js                 format rupiah
docs/                       dokumen proyek
```

File yang akan dibuat saat mengerjakan user story:

```
lib/supabase/            koneksi Supabase untuk server
app/admin/actions.js     Server Action untuk login, ganti password, dan kelola produk
proxy.js                 proteksi halaman /admin (US-06)
```

## Pesan WhatsApp (US-03, US-12)

Format link: `https://wa.me/<nomor>?text=<pesan>`

- `<nomor>` diambil dari `lib/toko.js`, format internasional tanpa tanda + (contoh `6281234567890`).
- `<pesan>` berisi nama produk, jumlah, dan harga satuan; total harga disertakan jika jumlah lebih dari satu. Pesan di-encode dengan `encodeURIComponent`.
- Pemilihan varian dan pembatasan stok belum tersedia karena skema tabel `produk` tidak memiliki kolom varian atau stok.

## PWA (US-13)

- Manifest berada di `public/manifest.json` dan memakai ikon `public/icons/icon-192.png` serta `public/icons/icon-512.png`.
- Instalasi memakai event `beforeinstallprompt` bila didukung; browser lain mendapat petunjuk pemasangan manual.
- Service worker dan cache tidak digunakan agar data katalog tetap segar dan sesi admin tidak tersimpan di cache publik.

## Deskripsi produk dengan AI (US-14)

- Fitur memakai Gemini Interactions API dari Server Action yang hanya dapat dipanggil admin terautentikasi.
- `GEMINI_API_KEY` wajib disediakan pada environment server; `GEMINI_MODEL` opsional dengan default `gemini-3.8-flash`.
- API key tidak dikirim ke browser. Deskripsi hasil AI hanya mengisi kolom yang dapat ditinjau dan diedit, lalu disimpan setelah admin mengirim form produk.

## Akun admin

Akun admin dibuat dari skrip di panduan workshop (bukan dari aplikasi) dan password bawaannya wajib diganti lewat US-05. Pendaftaran akun baru dimatikan di pengaturan Supabase Auth.
