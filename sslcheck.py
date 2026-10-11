#!/usr/bin/env python3
"""Read-only SSL/TLS certificate checker for hosts you are authorized to test."""
import argparse
import datetime as dt
import json
import socket
import ssl
import sys


def get_report(host, port=443, timeout=8):
    ctx = ssl.create_default_context()
    with socket.create_connection((host, port), timeout=timeout) as raw:
        with ctx.wrap_socket(raw, server_hostname=host) as conn:
            cert = conn.getpeercert()
            expires = dt.datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=dt.timezone.utc)
            now = dt.datetime.now(dt.timezone.utc)
            remaining = expires - now
            sans = [v for kind, v in cert.get("subjectAltName", []) if kind == "DNS"]
            subject = dict(x[0] for x in cert.get("subject", []))
            issuer = dict(x[0] for x in cert.get("issuer", []))
            return {
                "host": host, "port": port, "verified": True,
                "tls_version": conn.version(), "cipher": conn.cipher()[0],
                "subject": subject, "issuer": issuer,
                "subject_alt_names": sans,
                "valid_from": cert.get("notBefore"),
                "valid_until": expires.isoformat(),
                "days_remaining": remaining.days,
                "status": "expired" if remaining.total_seconds() < 0 else "expiring_soon" if remaining.days <= 30 else "valid",
            }


def main():
    p = argparse.ArgumentParser(description="Audit sertifikat SSL/TLS host (read-only).")
    p.add_argument("host", help="Nama host/domain, tanpa https://")
    p.add_argument("-p", "--port", type=int, default=443)
    p.add_argument("--timeout", type=float, default=8)
    p.add_argument("--json", action="store_true", help="Output JSON")
    args = p.parse_args()
    host = args.host.strip().rstrip(".")
    if not host or any(c in host for c in "/?#@") or not 1 <= args.port <= 65535:
        p.error("Masukkan hostname valid dan port 1-65535")
    try:
        result = get_report(host, args.port, args.timeout)
    except (OSError, ssl.SSLError, ValueError, KeyError) as exc:
        print(f"Gagal memeriksa {host}:{args.port}: {exc}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"SSL/TLS report: {result['host']}:{result['port']}")
        print(f"Status       : {result['status']} ({result['days_remaining']} hari tersisa)")
        print(f"Terverifikasi: {'Ya' if result['verified'] else 'Tidak'}")
        print(f"TLS / cipher: {result['tls_version']} / {result['cipher']}")
        print(f"Subjek       : {result['subject']}")
        print(f"Penerbit     : {result['issuer']}")
        print(f"Berlaku s/d  : {result['valid_until']}")
        print(f"SAN          : {', '.join(result['subject_alt_names']) or '-'}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
