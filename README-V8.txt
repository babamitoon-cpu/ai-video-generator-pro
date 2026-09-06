BABA AI GENERATOR VIDEO PRO V8 — REAL IMAGE + MP4

FILES
1. index.html
2. app.js
3. worker.js

WHAT V8 FIXES
- Tidak lagi membuat background placeholder seperti "SHORTS FACTORY".
- Story per scene mengikuti VIDEO IDEA.
- Setiap scene mempunyai narration dan image prompt yang berbeda.
- Image generation memakai GPT-Image-2 melalui backend.
- Ada ADD IMAGE untuk upload gambar sendiri.
- Create MP4 membuat slideshow 9:16 dari scene images dengan zoom/pan ringan.
- Footer tidak lagi nyempil di tengah form.

PENTING
GitHub Pages hanya menjalankan frontend. API key OpenAI jangan dimasukkan ke app.js/index.html.
OpenAI menyatakan API key adalah secret dan tidak boleh diekspos pada browser/client-side code.
Karena itu worker.js harus dideploy sebagai backend dan OPENAI_API_KEY disimpan sebagai secret.

SETUP PALING MUDAH DI HP
1. Buat/deploy Cloudflare Worker baru.
2. Masukkan isi worker.js sebagai Worker code.
3. Tambahkan secret bernama OPENAI_API_KEY dengan API key milikmu.
4. Copy URL Worker, misalnya https://baba-ai-v8.xxxxx.workers.dev
5. Di GitHub Pages, buka aplikasi V8.
6. Masukkan URL Worker ke "AI Backend URL".
7. Masukkan "Kucing naik pohon".
8. Klik GENERATE STORY.
9. Klik GENERATE ALL REAL IMAGES.
10. Setelah semua gambar muncul dan memang kucing/pohon, klik CREATE MP4.

CATATAN
- Pembuatan gambar menggunakan API berbayar sesuai akun/API provider.
- MP4 dibuat di browser HP dari gambar yang sudah dibuat; tidak memakai Sora.
- Jika browser HP terlalu berat saat konversi MP4, gunakan 5 scene atau durasi 2 detik dulu.
- Tombol ADD IMAGE tetap bisa dipakai jika ingin mengganti scene dengan gambar sendiri.
