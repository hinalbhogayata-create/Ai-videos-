"""Big cinematic title rendering (Pillow + numpy).

Styles
  trailer : elegant serif, letters slowly spread apart, blur-in, soft glow
  impact  : HUGE condensed type that slams in (scale-down + flash + lens streak)
  reveal  : tall condensed type rising from behind a line mask, thin rules grow out
  endcard : brand name with light sweep, tagline and call to action
Gujarati text is detected automatically and set in a Gujarati font with proper shaping.
"""
import math
import os
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")

STYLE_FONTS = {
    #           latin font            gujarati font
    "trailer": ("Cinzel-Bold.ttf", "NotoSansGujarati-Bold.ttf"),
    "impact": ("Anton.ttf", "NotoSansGujarati-Black.ttf"),
    "reveal": ("BebasNeue.ttf", "NotoSansGujarati-Black.ttf"),
    "endcard": ("Cinzel-Black.ttf", "NotoSansGujarati-Black.ttf"),
    "sub": ("Montserrat-Light.ttf", "HindVadodara-Light.ttf"),
    "sub_bold": ("Montserrat-SemiBold.ttf", "HindVadodara-Bold.ttf"),
}
GUJ_BOOST = 1.22  # Gujarati glyphs look smaller than Latin caps at the same point size
STYLE_SIZE = {"trailer": 0.115, "impact": 0.24, "reveal": 0.19, "endcard": 0.15}


def is_gujarati(s):
    return any("઀" <= ch <= "૿" for ch in s)


@lru_cache(maxsize=64)
def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), int(size), layout_engine=ImageFont.Layout.RAQM)


def pick_font(style, text, size):
    latin, guj = STYLE_FONTS[style]
    return font(guj, size * GUJ_BOOST) if is_gujarati(text) else font(latin, size)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


# ---------------------------------------------------------------- layout
def script_runs(text):
    """Split text into (is_gujarati, chunk) runs; spaces/punctuation stick to the previous run."""
    runs = []
    for ch in text:
        g = "\u0A80" <= ch <= "\u0AFF"
        neutral = not ch.isalnum()
        if runs and (neutral or runs[-1][0] == g):
            runs[-1][1] += ch
        else:
            runs.append([g, ch])
    return runs


def render_mixed(text, style, size, tracking_em, fill):
    runs = script_runs(text)
    latin_name, guj_name = STYLE_FONTS[style]
    parts = []
    for g, chunk in runs:
        f = font(guj_name, size * GUJ_BOOST) if g else font(latin_name, size)
        parts.append((render_line(chunk, f, 0 if g else tracking_em * size, fill, force_plain=g), f))
    asc = max(f.getmetrics()[0] for _, f in parts)
    h = max(asc + f.getmetrics()[1] for _, f in parts)
    w = sum(im.width for im, _ in parts)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = 0
    for im, f in parts:
        out.alpha_composite(im, (x, asc - f.getmetrics()[0]))
        x += im.width
    return out


def render_line(text, fnt, tracking=0.0, fill=(255, 255, 255), force_plain=False):
    """Render one line to an RGBA image. tracking is extra spacing in px per glyph.
    Gujarati (complex script) is rendered as a whole string so conjuncts shape correctly."""
    asc, desc = fnt.getmetrics()
    h = asc + desc
    if tracking <= 0.01 or force_plain or is_gujarati(text):
        w = int(math.ceil(fnt.getlength(text))) + 4
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((2, 0), text, font=fnt, fill=fill + (255,))
        return im
    adv = [fnt.getlength(c) for c in text]
    w = int(sum(adv) + tracking * (len(text) - 1)) + 4
    im = Image.new("RGBA", (max(w, 1), h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x = 2.0
    for c, a in zip(text, adv):
        d.text((x, 0), c, font=fnt, fill=fill + (255,))
        x += a + tracking
    return im


def fit_size(style, text, size, max_w, tracking_em=0.0):
    """Shrink font size until the widest line fits max_w."""
    lines = text.split("\n")
    while size > 12:
        f = pick_font(style, text, size)
        widest = max(f.getlength(l) + tracking_em * size * max(0, len(l) - 1) for l in lines)
        if widest <= max_w:
            return size
        size *= 0.94
    return size


def render_block(text, style, size, tracking_em=0.0, fill=(255, 255, 255), line_gap=0.05):
    lines = text.split("\n")
    f = pick_font(style, text, size)
    ims = [render_mixed(l, style, size, tracking_em, fill) if is_gujarati(l) and any(c.isascii() and c.isalpha() for c in l)
           else render_line(l, f, tracking_em * size, fill) for l in lines]
    w = max(i.width for i in ims)
    gap = int(size * line_gap)
    # tighten line height for all-caps display fonts
    hs = [i.height for i in ims]
    h = sum(hs) + gap * (len(ims) - 1)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    y = 0
    for i in ims:
        out.alpha_composite(i, ((w - i.width) // 2, y))
        y += i.height + gap
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


# ---------------------------------------------------------------- compositing
def to_np(im):
    a = np.asarray(im, dtype=np.float32) / 255.0
    return a[..., :3], a[..., 3:4]


def composite(frame, layer, x, y, opacity=1.0, mode="normal"):
    """frame: float32 HxWx3 (0..1). layer: PIL RGBA. x,y: top-left (can be off-screen)."""
    if opacity <= 0.002:
        return
    H, W = frame.shape[:2]
    rgb, a = to_np(layer)
    x, y = int(round(x)), int(round(y))
    x0, y0 = max(x, 0), max(y, 0)
    x1, y1 = min(x + layer.width, W), min(y + layer.height, H)
    if x1 <= x0 or y1 <= y0:
        return
    sl = (slice(y0 - y, y1 - y), slice(x0 - x, x1 - x))
    rgb, a = rgb[sl], a[sl] * opacity
    dst = frame[y0:y1, x0:x1]
    if mode == "add":
        dst += rgb * a
        np.minimum(dst, 1.0, out=dst)
    else:
        dst *= 1 - a
        dst += rgb * a


def glow_layer(im, radius, strength=0.6, tint=(1.0, 0.85, 0.6)):
    pad = int(radius * 3)
    big = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    big.alpha_composite(im, (pad, pad))
    g = big.filter(ImageFilter.GaussianBlur(radius))
    arr = np.asarray(g, dtype=np.float32)
    arr[..., 0] *= tint[0]
    arr[..., 1] *= tint[1]
    arr[..., 2] *= tint[2]
    arr[..., 3] *= strength
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA"), pad


def scaled(im, s):
    if abs(s - 1) < 1e-3:
        return im
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)


def blurred(im, r):
    if r < 0.4:
        return im
    pad = int(r * 3)
    big = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    big.alpha_composite(im, (pad, pad))
    return big.filter(ImageFilter.GaussianBlur(r))


def lens_streak(frame, cy, strength, color=(0.35, 0.6, 1.0)):
    """Anamorphic horizontal flare line across the frame."""
    if strength <= 0.01:
        return
    H, W = frame.shape[:2]
    ys = np.arange(H, dtype=np.float32)[:, None]
    xs = np.arange(W, dtype=np.float32)[None, :]
    v = np.exp(-((ys - cy) / (H * 0.006)) ** 2) + 0.25 * np.exp(-((ys - cy) / (H * 0.04)) ** 2)
    hx = np.exp(-((xs - W / 2) / (W * 0.35)) ** 2)
    band = (v * hx * strength)[..., None] * np.array(color, dtype=np.float32)
    frame += band
    np.minimum(frame, 1.0, out=frame)


# ---------------------------------------------------------------- title animator
class Title:
    """One animated title. t is seconds relative to the title's own start."""

    def __init__(self, spec, W, H, safe_top=0, safe_bottom=None):
        self.spec = spec
        self.W, self.H = W, H
        self.style = spec.get("style", "trailer")
        self.text = spec["text"].upper()
        self.sub = spec.get("sub")
        self.dur = float(spec.get("duration", 3.0))
        self.color = tuple(spec.get("color", (246, 238, 226)))
        self.accent = tuple(spec.get("accent", (255, 196, 110)))
        u = min(W, H)
        base = STYLE_SIZE.get(self.style, 0.12) * u * float(spec.get("scale", 1.0))
        self.max_track = {"trailer": 0.32, "impact": 0.02, "reveal": 0.06, "endcard": 0.12}[self.style]
        self.size = fit_size(self.style, self.text, base, W * 0.86, self.max_track)
        self.cy = H * float(spec.get("y", 0.5))
        self._cache = {}
        if self.sub:
            sub_style = "sub_bold" if self.style == "impact" else "sub"
            ssize = fit_size(sub_style, self.sub, u * 0.034 * float(spec.get("sub_scale", 1.0)), W * 0.8, 0.45)
            self.sub_im = render_block(self.sub.upper(), sub_style, ssize, 0.45,
                                       fill=self.accent if self.style != "trailer" else (220, 210, 195))
        self.flash = 0.0
        self.streak = 0.0

    def block(self, tracking_em, fill=None):
        key = (round(tracking_em, 3), fill)
        if key not in self._cache:
            if len(self._cache) > 400:
                self._cache.clear()
            self._cache[key] = render_block(self.text, self.style, self.size, tracking_em, fill or self.color)
        return self._cache[key]

    def draw(self, frame, t):
        self.flash = 0.0
        self.streak = 0.0
        if t < 0 or t > self.dur:
            return
        getattr(self, "_" + self.style)(frame, t)

    def _sub(self, frame, t, start, y, fade_out=0.5):
        if not self.sub:
            return
        a = ease_out((t - start) / 0.9) * (1 - ease_in_out((t - (self.dur - fade_out)) / fade_out))
        drift = (1 - ease_out((t - start) / 1.2)) * self.H * 0.015
        composite(frame, self.sub_im, (self.W - self.sub_im.width) / 2, y + drift, a)

    # --- styles -----------------------------------------------------------
    def _trailer(self, frame, t):
        d = self.dur
        fin, fout = min(1.1, d * 0.3), min(0.8, d * 0.25)
        p = t / d
        tracking = 0.06 + (self.max_track - 0.06) * ease_out(p * 0.9)
        im = self.block(round(tracking * 200) / 200)
        a = ease_in_out(t / fin) * (1 - ease_in_out((t - (d - fout)) / fout))
        blur = 14 * (1 - ease_out(t / fin)) + 10 * ease_in_out((t - (d - fout)) / fout)
        s = 1.0 + 0.04 * p
        im2 = scaled(im, s)
        g, pad = glow_layer(im2, self.size * 0.18, 0.55)
        x, y = (self.W - im2.width) / 2, self.cy - im2.height / 2
        composite(frame, g, x - pad, y - pad, a * 0.9, "add")
        main = blurred(im2, blur)
        off = (main.width - im2.width) / 2
        composite(frame, main, x - off, y - off, a)
        self._sub(frame, t, fin * 0.6, y + im2.height + self.size * 0.45, fout)

    def _impact(self, frame, t):
        d = self.dur
        slam = 0.16
        s = 1.35 - 0.35 * ease_out(t / slam) + 0.05 * (t / d)
        im = self.block(0.02)
        im2 = scaled(im, s)
        a = min(1.0, t / 0.05) * (1 - ease_in_out((t - (d - 0.12)) / 0.12))
        x, y = (self.W - im2.width) / 2, self.cy - im2.height / 2
        g, pad = glow_layer(im2, self.size * 0.12, 0.45, (0.7, 0.85, 1.0))
        composite(frame, g, x - pad, y - pad, a, "add")
        if t < slam:
            composite(frame, blurred(im2, 8), x - 24, y - 24, a * 0.6)
        composite(frame, im2, x, y, a)
        self.flash = max(0.0, 1 - t / 0.18) * 0.55
        self.streak = max(0.0, 1 - t / 0.9) * 0.9
        self.streak_y = self.cy
        self._sub(frame, t, 0.25, y + im2.height + self.size * 0.18, 0.12)

    def _reveal(self, frame, t):
        d = self.dur
        im = self.block(0.02 + 0.04 * (t / d))
        rise = ease_out(t / 0.9)
        a = 1 - ease_in_out((t - (d - 0.6)) / 0.6)
        x = (self.W - im.width) / 2
        base_y = self.cy - im.height / 2
        line_y = base_y + im.height + self.size * 0.08
        # text rises from below the line; crop everything below line_y
        y = base_y + (1 - rise) * im.height * 1.05
        visible = int(max(0, min(im.height, line_y - y)))
        if visible > 0:
            composite(frame, im.crop((0, 0, im.width, visible)), x, y, a)
        # thin accent rules grow from the centre
        L = ease_out((t - 0.1) / 1.0) * (im.width * 0.55)
        if L > 2:
            th = max(2, int(self.size * 0.018))
            rule = Image.new("RGBA", (int(2 * L), th), self.accent + (255,))
            composite(frame, rule, self.W / 2 - L, line_y, a)
        self._sub(frame, t, 0.6, line_y + self.size * 0.25, 0.6)

    def _endcard(self, frame, t):
        d = self.dur
        p = t / d
        im = self.block(0.12 - 0.06 * ease_out(p))
        s = 1.08 - 0.08 * ease_out(t / 2.5)
        im2 = scaled(im, s)
        a = ease_in_out(t / 1.2) * (1 - ease_in_out((t - (d - 0.8)) / 0.8))
        x, y = (self.W - im2.width) / 2, self.cy - im2.height / 2
        g, pad = glow_layer(im2, self.size * 0.2, 0.6)
        composite(frame, g, x - pad, y - pad, a, "add")
        composite(frame, im2, x, y, a)
        # light sweep across the letters
        sw = (t - 0.8) / 1.4
        if 0 < sw < 1:
            rgb, al = to_np(im2)
            xs = np.linspace(0, 1, im2.width)[None, :, None]
            band = np.exp(-((xs - (sw * 1.4 - 0.2)) / 0.06) ** 2)
            hl = Image.fromarray((np.concatenate([np.ones_like(rgb), al * band], axis=2) * 255).astype(np.uint8), "RGBA")
            composite(frame, hl, x, y, a * 0.85, "add")
        self.streak = max(0.0, 1 - abs(t - 0.4) / 0.6) * 0.5
        self.streak_y = self.cy
        self._sub(frame, t, 1.0, y + im2.height + self.size * 0.35, 0.8)
