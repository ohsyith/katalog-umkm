# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01.

Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.

Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Tulisan "Masih data contoh" hilang dan 6 kartu produk tetap tampil dari tabel `produk`. Setelah nama salah satu produk diubah di Supabase Table Editor menjadi "Kopi Spesial" dan halaman dimuat ulang, nama produk ikut berubah.

**Perbaikan:**

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02.

Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
Klik salah satu kartu produk membuka halaman detail dengan foto, harga, dan deskripsi. Setelah deskripsi produk diubah di Supabase dan halaman dimuat ulang, deskripsi ikut berubah. Membuka `localhost:3000/produk/9999` menampilkan halaman "Halaman tidak ditemukan".

**Perbaikan:**

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".

Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
Klik tombol WhatsApp di halaman detail membuka WhatsApp Web atau aplikasi WhatsApp ke nomor toko dengan pesan yang sudah terisi, misalnya "Halo, saya mau pesan Kopi Bubuk Robusta 250 g (Rp 45.000)".

**Perbaikan:**

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.

Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
Membuka `localhost:3000/admin/login` dan masuk dengan password salah menampilkan pesan error. Masuk dengan email dan password bawaan berhasil diarahkan ke halaman daftar produk admin. Klik tombol "Keluar" mengakhiri sesi dan kembali ke halaman login.

**Perbaikan:**

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05.

Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Setelah login dan membuka menu Ganti password, mengisi password baru minimal 8 karakter menampilkan pesan berhasil. Setelah keluar, login dengan password bawaan gagal, sedangkan login dengan password baru berhasil.

**Perbaikan:**

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.

Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
Di jendela penyamaran, membuka `localhost:3000/admin` langsung dialihkan ke halaman login. Membuka `localhost:3000/admin/password` juga dialihkan ke login. Setelah login, halaman admin terbuka normal.

**Perbaikan:**


## US-07 List Produk [SENDIRI]

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-07.

Ubah app/admin/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai koneksi Supabase server yang sudah dibuat di lib/supabase. Hapus data contoh yang masih tertulis di halaman dan tampilkan produk yang benar-benar ada di database. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Jangan ubah tampilan tabel/daftar produk yang sudah ada. Pastikan halaman tetap hanya bisa diakses setelah login.

**Hasil:**
Daftar produk di /admin sekarang diambil dari tabel "produk" di database, bukan data contoh. Setelah nama produk diubah di Supabase Table Editor dan halaman dimuat ulang, nama produk ikut berubah. Jika tabel kosong, muncul tulisan "Belum ada produk". Jika pengambilan data gagal, muncul pesan error yang jelas di halaman. Halaman tetap hanya bisa diakses setelah login.

**Perbaikan:**

## US-08 Tambah produk [SENDIRI]

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-08.

Buat fitur tambah produk dari halaman admin. Form di app/admin/produk/baru/page.jsx harus menyimpan produk baru ke tabel "produk" di Supabase. Proses simpan dibuat sebagai Server Action di app/admin/actions.js. Sebelum menyimpan, Server Action wajib memeriksa sesi login di server; kalau tidak ada sesi, tolak dengan error yang jelas dan jangan menyimpan apa pun. Setelah berhasil menyimpan, arahkan (redirect) ke /admin. Kalau gagal, tampilkan pesan error yang jelas di halaman form. Jangan ubah tampilan form yang sudah ada selain menyambungkannya ke Server Action.

**Hasil:**
Mengisi form di /admin/produk/baru lalu menyimpan berhasil menambahkan produk baru ke tabel "produk" di database dan diarahkan ke /admin; produk baru langsung tampil di daftar. Jika penyimpanan gagal, muncul pesan error yang jelas di halaman form. Tanpa login, aksi simpan ditolak di server dan tidak ada data yang tersimpan.

**Perbaikan:**

## US-09 Ubah produk [SENDIRI]

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-09.

Buat fitur ubah produk. Halaman app/admin/produk/[id]/ubah/page.jsx mengambil data produk lama dari tabel "produk" di Supabase berdasarkan id di URL (di sisi server) dan mengisi form dengan data tersebut. Kalau produk tidak ditemukan, panggil notFound(). Form disambungkan ke Server Action di app/admin/actions.js yang menyimpan perubahan ke tabel "produk". Server Action wajib memeriksa sesi login di server; kalau tidak ada sesi, tolak dengan error yang jelas dan jangan menyimpan. Setelah berhasil menyimpan, arahkan kembali ke /admin. Kalau gagal, tampilkan pesan error yang jelas. Jangan ubah tampilan form.

**Hasil:**
Membuka /admin/produk/[id]/ubah menampilkan form yang sudah terisi data produk lama dari database. Setelah perubahan disimpan, data di tabel "produk" ikut berubah dan halaman kembali ke /admin. Jika produk tidak ditemukan, muncul halaman "Halaman tidak ditemukan". Tanpa login, aksi simpan ditolak di server dan tidak ada perubahan yang tersimpan.

**Perbaikan:**

## US-10 Hapus produk [SENDIRI]

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-10.

Buat fitur hapus produk di halaman /admin. Tambahkan tombol "Hapus" pada setiap baris produk yang meminta konfirmasi dulu (misalnya pakai window.confirm atau dialog konfirmasi) sebelum benar-benar menghapus. Proses hapus dibuat sebagai Server Action di app/admin/actions.js yang menghapus baris produk dari tabel "produk" di Supabase berdasarkan id. Server Action wajib memeriksa sesi login di server; kalau tidak ada sesi, tolak dengan error yang jelas dan jangan menghapus apa pun. Setelah berhasil, muat ulang daftar produk di /admin. Kalau gagal, tampilkan pesan error yang jelas. Jangan ubah tampilan tabel yang sudah ada selain menambahkan tombol Hapus dan dialog konfirmasi.

**Hasil:**
Klik tombol "Hapus" pada baris produk memunculkan dialog konfirmasi terlebih dahulu. Setelah dikonfirmasi, produk terhapus dari tabel "produk" di database dan hilang dari daftar di /admin. Jika penghapusan gagal, muncul pesan error yang jelas. Tanpa login, aksi hapus ditolak di server dan tidak ada data yang terhapus.

**Perbaikan:**

## Debugging dan fitur bonus

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.