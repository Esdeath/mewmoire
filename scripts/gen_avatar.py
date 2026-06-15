#!/usr/bin/env python3
"""Generate a star-themed avatar for the Star diary site.

Palette follows style.css:
  --primary  #E86A5A (soft coral red)
  --primary2 #F28B7C (muted coral)
Outputs src/assets/avatar.png (square, used as header avatar + favicon).
"""
import math
from PIL import Image, ImageDraw

SIZE = 256          # final size
SS = 4              # supersample factor for smooth edges
S = SIZE * SS

CORAL = (232, 106, 90, 255)     # #E86A5A
CORAL2 = (242, 139, 124, 255)   # #F28B7C
CREAM = (255, 248, 240, 255)    # warm star fill
CREAM_SOFT = (255, 252, 247, 255)

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Background: filled coral circle with a slightly lighter top arc for depth.
d.ellipse([0, 0, S, S], fill=CORAL)
# soft lighter inner glow (concentric, top-biased)
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([S * 0.16, S * 0.10, S * 0.84, S * 0.78], fill=CORAL2)
img.alpha_composite(glow)
# re-cut the circle so the glow never spills past the badge edge
mask = Image.new("L", (S, S), 0)
ImageDraw.Draw(mask).ellipse([0, 0, S, S], fill=255)
img.putalpha(mask)
d = ImageDraw.Draw(img)


def sparkle(cx, cy, r, inner_ratio, fill, rot=0.0):
    """4-point sparkle (concave star) centered at cx,cy."""
    pts = []
    ri = r * inner_ratio
    for i in range(8):
        ang = math.radians(rot + i * 45)
        rad = r if i % 2 == 0 else ri
        # concave control: pull inner points further in for the sparkle look
        if i % 2 == 1:
            rad = ri
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, fill=fill)


cx, cy = S / 2, S / 2
# main sparkle (concave 4-point) -> the "亮晶晶" star
sparkle(cx, cy, S * 0.34, 0.26, CREAM, rot=-90)
# two small accent sparkles
sparkle(S * 0.74, S * 0.30, S * 0.085, 0.30, CREAM_SOFT, rot=-90)
sparkle(S * 0.30, S * 0.72, S * 0.06, 0.30, CREAM_SOFT, rot=-90)

# downscale for anti-aliasing
out = img.resize((SIZE, SIZE), Image.LANCZOS)
out.save("src/assets/avatar.png")
print("wrote src/assets/avatar.png", out.size)
