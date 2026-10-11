# SSLTermux Checker

CLI JavaScript ringan untuk Android/Termux guna memeriksa sertifikat SSL/TLS sebuah host: validasi sertifikat dan hostname, masa berlaku, issuer, SAN, versi TLS, serta cipher yang dinegosiasikan. Menggunakan modul bawaan Node.js, tanpa dependensi npm. **Hanya melakukan koneksi TLS baca-saja**; tidak melakukan eksploitasi atau pemindaian massal. Gunakan hanya pada host yang Anda miliki atau berwenang uji.

## Instalasi di Termux

```bash
pkg install -y git
git clone https://github.com/husein2014123/ssltermux-checker.git
cd ssltermux-checker
chmod +x install.sh
./install.sh
```

Installer memasang Node.js LTS dan membuat perintah `sslcheck`.

## Penggunaan

```bash
sslcheck example.com
sslcheck example.com --port 8443
sslcheck example.com --json
```

Jangan sertakan `https://` atau path pada argumen host. Validasi sertifikat dan hostname aktif secara default. Program melaporkan error jika sertifikat tidak tepercaya, hostname tidak cocok, DNS gagal, atau koneksi timeout.

## Pengembangan / uninstall

Jalankan tanpa instalasi global: `node sslcheck.js example.com`.
Hapus: `rm -f "$PREFIX/bin/sslcheck"` lalu `rm -rf "$HOME/.local/opt/ssltermux-checker"`.

## Batasan

Hasil mencerminkan TLS handshake dari perangkat/jaringan saat itu. Tidak menguji konfigurasi seluruh cipher/protokol server dan bukan audit keamanan menyeluruh.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
