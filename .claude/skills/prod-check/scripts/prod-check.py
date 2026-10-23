#!/usr/bin/env python3
"""本番の実挙動チェック（#258）。

e2e/fixtures/routing-expectations.json（期待値の正）を読み、各URLの「最初の1ホップ」を
curl で叩いて、ステータス・location・x-vercel-id・最初の1バイトまでの時間を1行ずつ出す。
期待と違えば FAIL、既知の問題（knownIssue）は KNOWN と表示する。GET のみで本番への書き込みは無い。

使い方:
  python3 .claude/skills/prod-check/scripts/prod-check.py [BASE_URL]
  BASE_URL 省略時は https://www.bo-no.design
"""
import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[4]
FIXTURE = ROOT / "e2e" / "fixtures" / "routing-expectations.json"


def fetch(base, path, cookie, dummy_cookie, body=False):
    """1ホップだけ取得して (status, headers, ttfb, html) を返す。"""
    cmd = ["curl", "-s", "-D", "-", "-w", "__TTFB__%{time_starttransfer}", base + path]
    if not body:
        cmd[1:1] = ["-o", "/dev/null"]
    if cookie == "dummy":
        cmd[1:1] = ["-H", f"Cookie: {dummy_cookie}"]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=30).stdout
    out, _, ttfb = out.rpartition("__TTFB__")
    # text=True は改行を \n に正規化するので、ヘッダの区切りも \n で見る
    head, _, html = out.partition("\n\n")
    lines = head.split("\n")
    status = int(lines[0].split()[1]) if lines and lines[0].startswith("HTTP") else 0
    headers = {}
    for line in lines[1:]:
        k, _, v = line.partition(":")
        headers[k.strip().lower()] = v.strip()
    return status, headers, float(ttfb or 0), html


def normalize(location, base):
    resolved = urljoin(base + "/", location)
    if urlparse(resolved).netloc != urlparse(base).netloc:
        return location
    p = urlparse(resolved)
    return p.path + (f"?{p.query}" if p.query else "")


def main():
    base = (sys.argv[1] if len(sys.argv) > 1 else "https://www.bo-no.design").rstrip("/")
    spec = json.loads(FIXTURE.read_text())
    dummy = spec["dummyAuthCookie"]
    failures = 0

    print(f"# prod-check {base}")
    for r in spec["routes"]:
        status, h, ttfb, _ = fetch(base, r["path"], r["cookie"], dummy)
        loc = normalize(h.get("location", ""), base) if h.get("location") else ""
        exp = r["expectStatus"]
        ok = (300 <= status < 400) if exp == "3xx" else status == exp
        if r.get("expectLocation"):
            ok = ok and loc == r["expectLocation"]
        if r.get("expectLocationPrefix"):
            ok = ok and loc.startswith(r["expectLocationPrefix"])
        mark = ("KNOWN" if not ok else "FIXED?") if r.get("knownIssue") else ("PASS" if ok else "FAIL")
        if mark in ("FAIL", "FIXED?"):
            failures += 1
        print(f"{mark:6} {r['path']:<14} cookie={r['cookie']:<5} -> {status} {loc or '-':<28} "
              f"ttfb={ttfb:.3f}s id={h.get('x-vercel-id', '-')}")

    reg = spec["region"]
    host = urlparse(base).hostname or ""
    if host.endswith("bo-no.design") or host.endswith(".vercel.app"):
        status, h, ttfb, _ = fetch(base, reg["path"], reg["cookie"], dummy)
        vid = h.get("x-vercel-id", "")
        ok = status == 200 and f"::{reg['expectRegion']}::" in vid
        failures += 0 if ok else 1
        print(f"{'PASS' if ok else 'FAIL':6} region {reg['path']} -> {status} id={vid} (expect ::{reg['expectRegion']}::)")

    for item in spec["htmlMustNotContain"]:
        status, _, _, html = fetch(base, item["path"], item["cookie"], dummy, body=True)
        ok = status == 200 and item["text"] not in html
        failures += 0 if ok else 1
        print(f"{'PASS' if ok else 'FAIL':6} html {item['path']} has no {item['text']} (status {status})")

    print(f"# {'OK' if failures == 0 else f'{failures} problem(s)'}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
