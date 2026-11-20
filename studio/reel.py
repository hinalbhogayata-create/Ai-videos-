"""Talking-head Reel editor (9:16): HDR->SDR fix, warm grade, punch-in jump zooms,
word-by-word karaoke captions, glowing title cards, a "mantra" mode with blurred
background + golden particles, devotional score with voice ducking, -14 LUFS.

    python -m studio.reel projects/ekadashi.json
"""
import json
import os
import subprocess
import sys
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from . import devotional, music
from .render import ROOT, p, probe_duration
from .text import composite, ease_in_out, ease_out, font, glow_layer, blurred, scaled

W, H = 1080, 1920

HDR_FIX = ("zscale=w={w}:h={h}:t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,"
           "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
LOOKS = {
    "devotional_warm": "eq=gamma=1.10:contrast=1.06:saturation=1.08,colorbalance=rs=0.03:gs=0.01:bs=-0.03:rm=0.04:gm=0.01:bm=-0.04:rh=0.02:bh=-0.03",
    "clean": "eq=gamma=1.06:contrast=1.04:saturation=1.05",
    "moody": "eq=gamma=1.0:contrast=1.12:saturation=0.9,colorbalance=bs=0.04:rh=0.03",
}
GOLD_TOP, GOLD_BOT = (255, 236, 170), (214, 150, 40)
SAFFRON = (255, 176, 32)


def is_hdr(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer",
                          "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return any(k in out for k in ("arib-std-b67", "smpte2084"))


# ---------------------------------------------------------------- text helpers
def gold_text(text, fnt, stroke=0):
    """Render text filled with a vertical gold gradient."""
    l, t, r, b = fnt.getbbox(text, stroke_width=stroke)
    w, h = r - l + 8, b - t + 8
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text((4 - l, 4 - t), text, font=fnt, fill=255)
    g = np.linspace(0, 1, h)[:, None]
    grad = np.zeros((h, w, 4), np.uint8)
    for c in range(3):
        grad[..., c] = (GOLD_TOP[c] * (1 - g) + GOLD_BOT[c] * g).astype(np.uint8)
    grad[..., 3] = np.asarray(mask)
    return Image.fromarray(grad, "RGBA")


def plain_text(text, fnt, fill=(255, 255, 255), stroke=0, stroke_fill=(0, 0, 0)):
    l, t, r, b = fnt.getbbox(text, stroke_width=stroke)
    im = Image.new("RGBA", (r - l + 8, b - t + 8), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((4 - l, 4 - t), text, font=fnt, fill=fill + (255,), stroke_width=stroke,
                            stroke_fill=stroke_fill + (255,))
    return im


def shadow(im, radius=10, opacity=0.75):
    pad = radius * 3
    big = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    a = np.zeros((big.height, big.width, 4), np.uint8)
    a[pad:pad + im.height, pad:pad + im.width, 3] = (np.asarray(im)[..., 3] * opacity).astype(np.uint8)
    return Image.fromarray(a, "RGBA").filter(ImageFilter.GaussianBlur(radius)), pad


def fit_font(name, text, size, max_w):
    while size > 20 and font(name, size).getlength(text) > max_w:
        size *= 0.95
    return font(name, size)


# ---------------------------------------------------------------- captions
class Captions:
    """Word-by-word karaoke captions: chunk pops in, active word turns saffron & grows."""

    def __init__(self, words, keywords=(), y=0.70, size=108, max_words=3, max_chars=16):
        self.y = y
        self.fnt = font("Mukta-ExtraBold.ttf", size)
        self.keywords = set(keywords)
        self.chunks = []
        cur = []
        for i, w in enumerate(words):
            cur.append(w)
            nxt = words[i + 1] if i + 1 < len(words) else None
            text_len = sum(len(x["w"]) for x in cur)
            if (nxt is None or nxt["s"] - w["e"] > 0.28 or len(cur) >= max_words or text_len >= max_chars
                    or w["w"].endswith((",", "।", "!", "?"))):
                self.chunks.append(cur)
                cur = []
        self.cache = {}

    def word_im(self, w, active):
        key = (w, active)
        if key not in self.cache:
            col = SAFFRON if active or w.strip(",।") in self.keywords else (255, 255, 255)
            shown = w.strip(",।!?.")  # caption fonts lack Latin punctuation; reels read cleaner without it
            self.cache[key] = plain_text(shown, self.fnt, col, stroke=8, stroke_fill=(20, 12, 6))
        return self.cache[key]

    def draw(self, frame, t):
        for ch in self.chunks:
            s, e = ch[0]["s"], ch[-1]["e"] + 0.15
            if not (s - 0.05 <= t <= e):
                continue
            pop = 0.82 + 0.18 * ease_out((t - s + 0.05) / 0.14)
            ims = [self.word_im(w["w"], w["s"] <= t < w["e"] + 0.05) for w in ch]
            space = self.fnt.getlength(" ") * 0.9
            total = sum(i.width for i in ims) + space * (len(ims) - 1)
            x = (W - total * pop) / 2
            cy = H * self.y
            for w, im in zip(ch, ims):
                active = w["s"] <= t < w["e"] + 0.05
                s2 = pop * (1.1 if active else 1.0)
                im2 = scaled(im, s2)
                sh, pad = shadow(im2, 9, 0.6)
                ox = x + (im.width * pop - im2.width) / 2
                composite(frame, sh, ox - pad + 4, cy - im2.height / 2 - pad + 8, 1.0)
                composite(frame, im2, ox, cy - im2.height / 2, 1.0)
                x += im.width * pop + space * pop
            return


# ---------------------------------------------------------------- particles
class Particles:
    def __init__(self, n=55, seed=3):
        r = np.random.default_rng(seed)
        self.x, self.y = r.uniform(0, 1, n), r.uniform(0, 1, n)
        self.vy, self.vx = r.uniform(-0.05, -0.015, n), r.uniform(-0.01, 0.01, n)
        self.r, self.a, self.ph = r.uniform(3, 16, n), r.uniform(0.3, 0.9, n), r.uniform(0, 6.3, n)
        self.sprites = {}

    def sprite(self, r):
        r = int(r)
        if r not in self.sprites:
            yy, xx = np.mgrid[-3 * r:3 * r + 1, -3 * r:3 * r + 1]
            d = np.sqrt(xx ** 2 + yy ** 2)
            self.sprites[r] = (np.exp(-(d / r) ** 2) + 0.25 * np.exp(-(d / (2.5 * r)) ** 2)).astype(np.float32)
        return self.sprites[r]

    def draw(self, frame, t, opacity):
        if opacity <= 0.01:
            return
        col = np.array([1.0, 0.78, 0.38], np.float32)
        for i in range(len(self.x)):
            x = ((self.x[i] + self.vx[i] * t) % 1) * W
            y = ((self.y[i] + self.vy[i] * t) % 1) * H
            sp = self.sprite(self.r[i])
            a = self.a[i] * (0.6 + 0.4 * np.sin(t * 2 + self.ph[i])) * opacity
            h = sp.shape[0] // 2
            x0, y0 = int(x) - h, int(y) - h
            xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + sp.shape[1], W), min(y0 + sp.shape[0], H)
            if xb > xa and yb > ya:
                frame[ya:yb, xa:xb] += sp[ya - y0:yb - y0, xa - x0:xb - x0, None] * col * a
        np.minimum(frame, 1, out=frame)


# ---------------------------------------------------------------- cards
class Card:
    """Glowing gold title. kind: title (top, with sub + ornament), mantra (centre lines), finale (big centre)."""

    def __init__(self, spec):
        self.s = spec
        self.kind = spec.get("kind", "title")
        self.start, self.end = float(spec["start"]), float(spec["end"])
        fname = {"title": "RozhaOne.ttf", "mantra": "NotoSerifDevanagari-Bold.ttf", "finale": "RozhaOne.ttf"}[self.kind]
        size = {"title": 132, "mantra": 122, "finale": 160}[self.kind] * float(spec.get("scale", 1))
        lines = spec["text"].split("\n")
        self.lines = [gold_text(l, fit_font(fname, l, size, W * 0.88)) for l in lines]
        self.sub = None
        if spec.get("sub"):
            sf = fit_font("Mukta-Bold.ttf", spec["sub"], 64, W * 0.8)
            self.sub = plain_text(spec["sub"], sf, (255, 248, 235), stroke=0)
        self.y = float(spec.get("y", {"title": 0.12, "mantra": 0.47, "finale": 0.42}[self.kind]))
        self.block = self._stack()
        self.glow, self.gpad = glow_layer(self.block, 26, 0.9, (1.0, 0.75, 0.35))
        self.label = None
        if spec.get("label"):
            self.label = gold_text(spec["label"], font("NotoSerifDevanagari-Bold.ttf", 58))

    def _stack(self):
        gap = 14
        w = max(l.width for l in self.lines)
        h = sum(l.height for l in self.lines) + gap * (len(self.lines) - 1)
        out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        y = 0
        for l in self.lines:
            out.alpha_composite(l, ((w - l.width) // 2, y))
            y += l.height + gap
        return out

    def draw(self, frame, t):
        if not (self.start <= t <= self.end):
            return
        lt, d = t - self.start, self.end - self.start
        fin, fout = min(0.6, d * 0.3), min(0.5, d * 0.25)
        a = ease_in_out(lt / fin) * (1 - ease_in_out((lt - (d - fout)) / fout))
        if self.kind == "finale":
            s = 1.15 - 0.15 * ease_out(lt / 0.6) + 0.03 * lt / d
        elif self.kind == "mantra":
            s = 1.0 + 0.04 * lt / d
        else:
            s = 0.92 + 0.08 * ease_out(lt / 0.7)
        im = scaled(self.block, s)
        blur = 10 * (1 - ease_out(lt / fin))
        x, y = (W - im.width) / 2, H * self.y - im.height / 2
        sh, pad = shadow(im, 16, 0.8)
        composite(frame, sh, x - pad, y - pad + 6, a)
        g = scaled(self.glow, s)
        composite(frame, g, (W - g.width) / 2, H * self.y - g.height / 2, a * 0.75, "add")
        main = blurred(im, blur)
        off = (main.width - im.width) / 2
        composite(frame, main, x - off, y - off, a)
        # light sweep
        sw = (lt - 0.5) / 1.1
        if 0 < sw < 1 and self.kind != "mantra":
            al = np.asarray(im, np.float32)[..., 3:4] / 255
            xs = np.linspace(0, 1, im.width)[None, :, None]
            band = np.exp(-((xs - (sw * 1.4 - 0.2)) / 0.07) ** 2)
            hl = np.concatenate([np.ones_like(al).repeat(3, 2), al * band], 2)
            composite(frame, Image.fromarray((hl * 255).astype(np.uint8), "RGBA"), x, y, a * 0.8, "add")
        bottom = y + im.height
        if self.kind == "title":  # ornament rule
            L = ease_out((lt - 0.2) / 0.8) * W * 0.32
            if L > 2:
                rule = Image.new("RGBA", (int(2 * L), 4), GOLD_BOT + (255,))
                composite(frame, rule, W / 2 - L, bottom + 22, a)
            bottom += 34
        if self.label is not None:
            composite(frame, self.label, (W - self.label.width) / 2, y - self.label.height - 40, a * 0.9)
        if self.sub is not None:
            sa = a * ease_out((lt - 0.35) / 0.6)
            ss, sp = shadow(self.sub, 10, 0.8)
            sy = bottom + 18
            composite(frame, ss, (W - self.sub.width) / 2 - sp, sy - sp + 4, sa)
            composite(frame, self.sub, (W - self.sub.width) / 2, sy, sa)


# ---------------------------------------------------------------- video
def zoom_frame(img, z, cx, cy):
    """Crop-zoom around (cx, cy) in 0..1 coords with sub-pixel smoothness."""
    if z <= 1.0005:
        return np.asarray(Image.fromarray(img), np.float32) / 255
    w, h = W / z, H / z
    x0 = min(max(cx * W - w / 2, 0), W - w)
    y0 = min(max(cy * H - h / 2, 0), H - h)
    im = Image.fromarray(img).resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + w, y0 + h))
    return np.asarray(im, np.float32) / 255


def render(cfg_path):
    cfg = json.load(open(cfg_path, encoding="utf-8"))
    name = cfg.get("name", "reel")
    src = p(cfg["video"])
    out = p(cfg.get("output", f"output/{name}.mp4"))
    work = os.path.join(os.path.dirname(out), f".{name}_work")
    os.makedirs(work, exist_ok=True)
    fps = int(cfg.get("fps", 30))
    src_dur = probe_duration(src)
    tail = float(cfg.get("tail", 2.5))
    D = src_dur + tail

    # --- music
    print("» composing devotional score ...")
    mc = cfg.get("music", {})
    score = devotional.compose(D, root=int(mc.get("root", 49)), bells=mc.get("bells", [0.2]),
                               conch_at=mc.get("conch", []), swell=[tuple(x) for x in mc.get("swell", [])],
                               plucks=[tuple(x) for x in mc.get("plucks", [])])
    music_wav = os.path.join(work, "score.wav")
    music.write_wav(music_wav, score)

    # --- voice clean-up
    print("» cleaning voice ...")
    voice_wav = os.path.join(work, "voice.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "48000", "-af",
                    "highpass=f=85,afftdn=nf=-28:tn=1,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.5:g=3,"
                    "equalizer=f=9000:t=q:w=1:g=1.5,acompressor=threshold=-24dB:ratio=3.5:attack=8:release=180:makeup=6dB,"
                    "loudnorm=I=-16:TP=-2:LRA=7", voice_wav], check=True)

    # --- video
    cap = Captions(cfg["words"], cfg.get("keywords", []), y=float(cfg.get("caption_y", 0.70)))
    cards = [Card(c) for c in cfg.get("cards", [])]
    zooms = sorted(cfg.get("zooms", []), key=lambda z: z["at"])
    face = cfg.get("face", [0.5, 0.33])
    mantra = [tuple(m) for m in cfg.get("mantra_mode", [])]
    parts = Particles()
    vf = []
    if is_hdr(src):
        vf.append(HDR_FIX.format(w=W, h=H))
    else:
        vf.append(f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}")
    vf += [f"fps={fps}", LOOKS.get(cfg.get("look", "devotional_warm"), "")]
    rd = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-an", "-vf", ",".join(v for v in vf if v),
                           "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, bufsize=W * H * 6)
    silent = os.path.join(work, "video.mp4")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(fps), "-i", "-", "-vf", "vignette=PI/6,noise=alls=3:allf=t+u,format=yuv420p",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "12M", "-bufsize", "24M",
                            "-movflags", "+faststart", silent], stdin=subprocess.PIPE)
    last = np.zeros((H, W, 3), np.uint8)
    t0 = time.time()
    for fi in range(int(D * fps)):
        t = fi / fps
        buf = rd.stdout.read(W * H * 3)
        if buf and len(buf) == W * H * 3:
            last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        # punch-in level for this moment (jump-cut style) + slow drift
        z = 1.0
        zs = 0.0
        for zz in zooms:
            if t >= zz["at"]:
                z, zs = float(zz["z"]), zz["at"]
        z *= 1 + 0.012 * min(t - zs, 6) / 6
        frame = zoom_frame(last, z, *face)
        # mantra mode: soft blur + darken + golden particles
        m_amt = 0.0
        for a, b in mantra + ([(src_dur, D + 1)] if tail > 0 else []):
            m_amt = max(m_amt, min(ease_in_out((t - a) / 0.6), 1 - ease_in_out((t - b + 0.6) / 0.6)))
        if m_amt > 0.01:
            bl = np.asarray(Image.fromarray((frame * 255).astype(np.uint8)).resize((W // 4, H // 4), Image.BILINEAR)
                            .filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.BICUBIC), np.float32) / 255
            frame = frame * (1 - m_amt * 0.85) + bl * m_amt * 0.85
            frame *= 1 - 0.45 * m_amt
            parts.draw(frame, t, m_amt)
        else:
            parts.draw(frame, t, 0.25)  # faint dust all the time
        cap.draw(frame, t)
        for c in cards:
            c.draw(frame, t)
        frame *= min(1.0, t / 0.4) * min(1.0, (D - t) / 0.8)
        enc.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
        if fi % (fps * 5) == 0:
            print(f"  {t:5.1f}s / {D:.1f}s  ({time.time() - t0:.0f}s)", flush=True)
    rd.stdout.close()
    rd.kill()
    enc.stdin.close()
    enc.wait()

    # --- mix: voice on top, score ducked under it
    print("» mixing audio ...")
    mlevel = float(mc.get("level", 0.32))
    fc = (f"[1:a]volume={mlevel}[m];[2:a]apad=whole_dur={D},asplit[v1][v2];"
          "[m][v1]sidechaincompress=threshold=0.04:ratio=6:attack=30:release=600:makeup=1[duck];"
          f"[duck][v2]amix=inputs=2:normalize=0:duration=first,atrim=0:{D},loudnorm=I=-14:TP=-1.5:LRA=9[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", music_wav, "-i", voice_wav, "-filter_complex", fc,
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                    "-movflags", "+faststart", out], check=True)
    print(f"✔ done: {out}  ({time.time() - t0:.0f}s)")


if __name__ == "__main__":
    render(sys.argv[1])
