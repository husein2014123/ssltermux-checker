#!/usr/bin/env node
'use strict';

const tls = require('node:tls');
const net = require('node:net');

function usage() {
  console.log(`SSLTermux Checker — pemeriksa SSL/TLS baca-saja

Pemakaian: sslcheck <hostname> [--port <angka>] [--timeout <detik>] [--json]
Contoh:    sslcheck example.com
           sslcheck example.com --port 8443 --json

Gunakan hanya pada host yang Anda miliki atau berwenang untuk diuji.`);
}

function parseArgs(argv) {
  const opts = { port: 443, timeout: 8, json: false };
  let host = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') return { help: true };
    if (arg === '--json') opts.json = true;
    else if (arg === '-p' || arg === '--port' || arg === '--timeout') {
      if (!argv[i + 1]) throw new Error(`Nilai ${arg} wajib diisi.`);
      const n = Number(argv[++i]);
      if (!Number.isFinite(n)) throw new Error(`Nilai ${arg} tidak valid.`);
      if (arg === '--timeout') opts.timeout = n;
      else opts.port = n;
    } else if (arg.startsWith('-')) throw new Error(`Opsi tidak dikenal: ${arg}`);
    else if (host !== null) throw new Error('Masukkan hanya satu hostname.');
    else host = arg;
  }
  if (!host) throw new Error('Hostname wajib diisi.');
  host = host.trim().replace(/\.$/, '');
  if (!host || /[\/?#@]/.test(host) || !(net.isIP(host) || /^[a-zA-Z0-9.-]+$/.test(host)))
    throw new Error('Hostname tidak valid; jangan sertakan https:// atau path.');
  if (!Number.isInteger(opts.port) || opts.port < 1 || opts.port > 65535)
    throw new Error('Port harus berupa angka bulat 1-65535.');
  if (opts.timeout <= 0 || opts.timeout > 300) throw new Error('Timeout harus lebih dari 0 dan maksimum 300 detik.');
  return { host, ...opts };
}

function inspect(host, port, timeout) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: net.isIP(host) ? undefined : host, rejectUnauthorized: true });
    const timer = setTimeout(() => socket.destroy(new Error('Koneksi timeout.')), timeout * 1000);
    socket.once('secureConnect', () => {
      clearTimeout(timer);
      const cert = socket.getPeerCertificate();
      const expires = new Date(cert.valid_to);
      const remaining = expires.getTime() - Date.now();
      const days = Math.floor(remaining / 86400000);
      const report = {
        host, port, verified: socket.authorized,
        tls_version: socket.getProtocol(), cipher: socket.getCipher()?.name || null,
        subject: cert.subject || {}, issuer: cert.issuer || {},
        subject_alt_names: cert.subjectaltname ? cert.subjectaltname.split(/,\s*/).map(x => x.replace(/^DNS:/, '')) : [],
        valid_from: cert.valid_from, valid_until: expires.toISOString(), days_remaining: days,
        status: remaining < 0 ? 'expired' : days <= 30 ? 'expiring_soon' : 'valid',
      };
      socket.end();
      resolve(report);
    });
    socket.once('error', err => { clearTimeout(timer); reject(err); });
  });
}

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) return usage();
    const report = await inspect(args.host, args.port, args.timeout);
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Laporan SSL/TLS: ${report.host}:${report.port}`);
      console.log(`Status        : ${report.status} (${report.days_remaining} hari tersisa)`);
      console.log(`Terverifikasi : ${report.verified ? 'Ya' : 'Tidak'}`);
      console.log(`TLS / cipher  : ${report.tls_version} / ${report.cipher}`);
      console.log(`Subjek        : ${JSON.stringify(report.subject)}`);
      console.log(`Penerbit      : ${JSON.stringify(report.issuer)}`);
      console.log(`Berlaku s/d   : ${report.valid_until}`);
      console.log(`SAN           : ${report.subject_alt_names.join(', ') || '-'}`);
    }
  } catch (err) {
    console.error(`Gagal: ${err.message}`);
    process.exitCode = 2;
  }
})();
