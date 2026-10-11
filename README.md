# SSLTermux Checker

CLI ringan untuk Android/Termux guna memeriksa sertifikat SSL/TLS sebuah host: validasi sertifikat dan hostname, masa berlaku, issuer, SAN, versi TLS, serta cipher yang dinegosiasikan. **Hanya melakukan koneksi TLS baca-saja**; tidak melakukan eksploitasi atau pemindaian massal. Gunakan hanya pada host yang Anda miliki atau berwenang uji.

## Instalasi di Termux

```bash
pkg install -y git
 git clone https://github.com/husein2014123/ssltermux-checker.git
cd ssltermux-checker
chmod +x install.sh
./install.sh
```

Setelah pemasangan:

```bash
sslcheck example.com
sslcheck example.com --port 8443
sslcheck example.com --json
```

Jangan sertakan `https://` atau path pada argumen host. Kode menggunakan verifikasi sertifikat bawaan Python dan akan gagal dengan pesan jelas jika sertifikat tidak tepercaya, nama host tidak cocok, DNS gagal, atau koneksi timeout.

## Pengembangan / uninstall

Jalankan tanpa instalasi: `python sslcheck.py example.com`.
Hapus: `rm -f "$PREFIX/bin/sslcheck"; rm -rf "$HOME/.local/opt/ssltermux-checker"`.

## Batasan

Hasil mencerminkan TLS handshake dari perangkat/jaringan saat itu. Tidak menguji konfigurasi seluruh cipher/protokol server dan bukan audit keamanan menyeluruh.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
