"""color-fix.html 用の画像を作る（撮影済みPNG → 切り抜き・WebP）
使い方: python3 make-images.py <撮影PNGのフォルダ>
  撮影PNG: before / step1..4 / modal-step1 / modal-step2 （.png、2倍・窓1328×848・#stage-<版>・1行目の詳細を開いた状態）
  画面（1280×800）は窓の (24,24) から。2倍なので元画像では (48,48)-(2608,1648)。
  - 全体図: full-before / full-step4（導入とまとめだけで使う）
  - 変えた場所ごとの切り抜き: spots.json（座標は画面の CSS px）。前の版とこの版を同じ範囲で切り抜く
    mark の要素は紫の枠（tokens.css の --color-accent と同じ色）で囲む。2倍のまま保存し、記事では最大2倍で表示する
"""
import sys, os, json
from PIL import Image, ImageDraw

SRC = sys.argv[1]
OUT = os.path.dirname(os.path.abspath(__file__))
Q = 82
SIZES = {}
ACCENT = (0x5B, 0x3F, 0xD6)  # tokens.css --color-accent
PAD = 3     # 枠と要素のすき間（CSS px）
LINE = 2    # 枠の太さ（CSS px）
GAP = 12    # 縦に積むときの間（CSS px）

imgs = {}
def get(name):
    if name not in imgs:
        imgs[name] = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    return imgs[name]

def crop(img, r):  # r = 画面座標 (x0,y0,x1,y1)
    x0, y0, x1, y1 = r
    return img.crop(((x0 + 24) * 2, (y0 + 24) * 2, (x1 + 24) * 2, (y1 + 24) * 2))

def save(img, name, maxw=None):
    if maxw and img.width > maxw:
        img = img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
    p = os.path.join(OUT, name + ".webp")
    img.save(p, "WEBP", quality=Q, method=6)
    SIZES[name] = [img.width, img.height]
    print(f"{name}.webp {img.width}x{img.height} {os.path.getsize(p)//1024}KB")

def part(version, region, marks):
    src = ("modal-" + version) if region["src"] == "modal" else version
    x0, y0, x1, y1 = region["r"]
    c = crop(get(src), region["r"])
    d = ImageDraw.Draw(c)
    for m in marks:
        # この範囲に収まる枠だけ描く
        if m[0] - PAD < x0 or m[1] - PAD < y0 or m[2] + PAD > x1 or m[3] + PAD > y1:
            continue
        box = [(m[0] - PAD - x0) * 2, (m[1] - PAD - y0) * 2, (m[2] + PAD - x0) * 2, (m[3] + PAD - y0) * 2]
        d.rounded_rectangle(box, radius=12, outline=ACCENT, width=LINE * 2)
    return c

def stack(parts):
    w = max(p.width for p in parts)
    h = sum(p.height for p in parts) + GAP * 2 * (len(parts) - 1)
    out = Image.new("RGB", (w, h), (255, 255, 255))
    y = 0
    for p in parts:
        out.paste(p, (0, y)); y += p.height + GAP * 2
    return out

for v in ["before", "step1", "step2", "step3", "step4"]:  # step1..3 は撮影メモ（color-fix-rec.html）の「この段階のゴール」用
    save(crop(get(v), (0, 0, 1280, 800)), "full-" + v, 1280)

spots = json.load(open(os.path.join(OUT, "spots.json")))["spots"]
for s in spots:
    if "same" in s:
        continue
    for v in s["pair"]:
        parts = [part(v, r, s["mark"]) for r in s["regions"]]
        save(parts[0] if len(parts) == 1 else stack(parts), f"{s['id']}-{v}")

with open(os.path.join(OUT, "sizes.json"), "w") as f:
    json.dump(SIZES, f, indent=1)
