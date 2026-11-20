"""Procedural cinematic backgrounds (used when no footage is supplied, or for title cards):
drifting smoke / nebula lit by a warm key light, plus out-of-focus bokeh and dust."""
import numpy as np
from PIL import Image
from scipy import ndimage

PALETTES = {
    # shadow -> mid -> highlight
    "teal_amber": [(0.0, (0.0, 0.01, 0.02)), (0.45, (0.02, 0.10, 0.13)), (0.75, (0.35, 0.22, 0.10)), (1.0, (1.0, 0.72, 0.38))],
    "gold":       [(0.0, (0.0, 0.0, 0.0)), (0.5, (0.12, 0.07, 0.02)), (0.8, (0.55, 0.36, 0.10)), (1.0, (1.0, 0.85, 0.5))],
    "crimson":    [(0.0, (0.0, 0.0, 0.0)), (0.5, (0.15, 0.01, 0.02)), (0.8, (0.55, 0.06, 0.05)), (1.0, (1.0, 0.55, 0.35))],
    "blue":       [(0.0, (0.0, 0.0, 0.01)), (0.5, (0.01, 0.04, 0.12)), (0.8, (0.08, 0.25, 0.55)), (1.0, (0.7, 0.9, 1.0))],
    "royal":      [(0.0, (0.0, 0.0, 0.0)), (0.5, (0.07, 0.02, 0.12)), (0.8, (0.35, 0.12, 0.40)), (1.0, (1.0, 0.75, 0.55))],
}


def _lut(palette, n=256):
    stops = PALETTES.get(palette, PALETTES["teal_amber"])
    xs = np.array([s[0] for s in stops])
    cs = np.array([s[1] for s in stops])
    g = np.linspace(0, 1, n)
    return np.stack([np.interp(g, xs, cs[:, c]) for c in range(3)], axis=1).astype(np.float32)


class Smoke:
    def __init__(self, W, H, fps, palette="teal_amber", seed=1, intensity=1.0):
        rng = np.random.default_rng(seed)
        self.W, self.H, self.fps = W, H, fps
        self.lw, self.lh = 256, int(256 * H / W)
        self.fields = [ndimage.gaussian_filter(rng.standard_normal((512, 512)), s, mode="wrap") for s in (22, 10, 4)]
        self.fields = [f / f.std() for f in self.fields]
        self.lut = _lut(palette)
        self.intensity = intensity
        yy, xx = np.mgrid[0:self.lh, 0:self.lw].astype(np.float32)
        self.yy, self.xx = yy, xx
        # key light from upper-right, soft
        self.light = np.exp(-(((xx - self.lw * 0.68) / (self.lw * 0.45)) ** 2 + ((yy - self.lh * 0.35) / (self.lh * 0.6)) ** 2))
        # bokeh
        n = 38
        self.bk = dict(x=rng.uniform(0, 1, n), y=rng.uniform(0, 1, n), r=rng.uniform(0.006, 0.03, n),
                       vx=rng.uniform(-0.004, 0.008, n), vy=rng.uniform(-0.012, -0.002, n),
                       ph=rng.uniform(0, 6.28, n), a=rng.uniform(0.15, 0.55, n))
        self.sprite = {}

    def _sample(self, f, ox, oy, scale):
        ys = (self.yy * scale + oy) % 512
        xs = (self.xx * scale + ox) % 512
        return ndimage.map_coordinates(f, [ys, xs], order=1, mode="wrap")

    def _disc(self, r):
        r = max(2, int(r))
        if r not in self.sprite:
            s = 2 * r + 1
            yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
            d = np.sqrt(xx ** 2 + yy ** 2) / r
            disc = np.clip(1.2 - d, 0, 1) ** 0.6 * (0.75 + 0.25 * d ** 4)  # bright rim, like real bokeh
            disc[d > 1] = 0
            self.sprite[r] = ndimage.gaussian_filter(disc, r * 0.08).astype(np.float32)
        return self.sprite[r]

    def frame(self, t):
        n = (self._sample(self.fields[0], t * 6, t * 2.5, 1.0) * 0.6
             + self._sample(self.fields[1], -t * 9, t * 4, 1.3) * 0.3
             + self._sample(self.fields[2], t * 14, -t * 6, 1.6) * 0.1)
        v = 1 / (1 + np.exp(-(n * 1.6 - 0.2)))  # wispy contrast
        v = v * (0.24 + 0.78 * self.light) * self.intensity
        v = 1 - np.exp(-v * 1.9)  # filmic roll-off, no blown-out highlights
        idx = np.clip(v * 255, 0, 255).astype(np.int32)
        low = self.lut[idx]
        img = np.asarray(Image.fromarray((low * 255).astype(np.uint8)).resize((self.W, self.H), Image.BICUBIC),
                         dtype=np.float32) / 255.0
        img = img.copy()
        # bokeh / dust drifting upward
        b = self.bk
        u = min(self.W, self.H)
        for i in range(len(b["x"])):
            x = ((b["x"][i] + b["vx"][i] * t) % 1.0) * self.W
            y = ((b["y"][i] + b["vy"][i] * t) % 1.0) * self.H
            r = b["r"][i] * u
            a = b["a"][i] * (0.6 + 0.4 * np.sin(t * 1.3 + b["ph"][i]))
            sp = self._disc(r)
            h = sp.shape[0] // 2
            x0, y0 = int(x) - h, int(y) - h
            xa, ya = max(x0, 0), max(y0, 0)
            xb, yb = min(x0 + sp.shape[1], self.W), min(y0 + sp.shape[0], self.H)
            if xb <= xa or yb <= ya:
                continue
            s = sp[ya - y0:yb - y0, xa - x0:xb - x0, None] * a
            img[ya:yb, xa:xb] += s * self.lut[-1] * 0.6
        np.minimum(img, 1.0, out=img)
        return img
