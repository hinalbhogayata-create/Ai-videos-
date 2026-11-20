"""Devotional background score: tanpura drone (with jawari shimmer), warm pad,
temple bells, conch (shankh) swell and soft santoor-like plucks. Pure numpy."""
import numpy as np

from .music import SR, add, highpass, lowpass, mtof, pan, reverb, saw, string_pad

RNG = np.random.default_rng(11)


def tanpura_pluck(note, dur=3.6, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = mtof(note)
    K = 24
    y = np.zeros(n)
    centre = 4 + 20 * (1 - np.exp(-t / 1.2))  # jawari: bright band sweeps up the harmonics
    for k in range(1, K + 1):
        fk = f0 * k * (1 + 0.0003 * k)
        if fk > SR * 0.4:
            break
        shimmer = 0.35 + 0.65 * np.exp(-((k - centre) / 3.5) ** 2)
        y += np.sin(2 * np.pi * fk * t + RNG.uniform(0, 6.28)) * shimmer * np.exp(-t * (0.5 + 0.08 * k)) / k ** 0.6
    y *= np.clip(t / 0.004, 0, 1) * vel * 0.06
    return y


def bell(note=85, dur=6.0, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = mtof(note)
    y = np.zeros(n)
    for r, a, d in [(1, 1.0, 0.9), (2.76, 0.55, 1.4), (5.40, 0.35, 2.2), (8.93, 0.2, 3.5), (13.34, 0.12, 5), (0.5, 0.3, 0.7)]:
        y += a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) * (1 + 0.15 * np.sin(2 * np.pi * 3.1 * t))
    y += lowpass(RNG.standard_normal(n), 7000) * np.exp(-t * 60) * 0.3  # strike
    y *= np.clip(t / 0.001, 0, 1) * vel * 0.22
    return y


def conch(note=61, dur=3.8, vel=1.0):
    """Shankh: breathy horn that swells, with a slight upward pitch scoop."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(note) * (0.94 + 0.06 * np.clip(t / 0.5, 0, 1)) * (1 + 0.004 * np.sin(2 * np.pi * 5 * t))
    ph = np.cumsum(f) / SR
    tone = sum(np.sin(2 * np.pi * k * ph) / k ** 1.1 for k in range(1, 12))
    breath = lowpass(highpass(RNG.standard_normal(n), 600), 3500) * 0.25
    env = np.clip(t / 0.9, 0, 1) ** 1.5 * np.clip((dur - t) / 0.9, 0, 1)
    y = lowpass((tone * 0.35 + breath) * env, 2600) * vel * 0.45
    return np.tanh(y * 1.5)


def santoor(note, vel=1.0, dur=2.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = mtof(note)
    y = sum(np.sin(2 * np.pi * f0 * k * t * (1 + 0.0008 * k * k)) * np.exp(-t * (2 + 1.2 * k)) / k for k in range(1, 7))
    # double string, slightly detuned
    y += 0.6 * np.sin(2 * np.pi * f0 * 1.003 * t) * np.exp(-t * 2.2)
    return y * np.clip(t / 0.002, 0, 1) * vel * 0.12


def compose(duration, root=49, bells=(), conch_at=(), swell=(), plucks=()):
    """root: MIDI of Sa (49 = C#3). swell: list of (start, end) where the pad rises.
    plucks: list of (start, end) windows for soft santoor phrases."""
    n = int((duration + 1) * SR)
    dry = np.zeros((n, 2))
    wet = np.zeros((n, 2))
    # tanpura cycle: Pa Sa' Sa' Sa (classic), ~1.25 s per cycle of four
    cycle = [root - 5, root, root, root - 12]
    step = 0.62
    i, t = 0, 0.0
    while t < duration:
        note = cycle[i % 4]
        y = tanpura_pluck(note, vel=0.9 if i % 4 else 1.0)
        p = [-0.4, -0.1, 0.15, 0.4][i % 4]
        add(dry, pan(y, p), t)
        add(wet, pan(y, p) * 0.6, t)
        i += 1
        t += step
    # warm pad, open fifth + octave
    pad = string_pad([root, root + 7, root + 12], duration, attack=4.0, release=2.0, bright=0.25)
    lvl = np.full(len(pad), 0.35)
    for a, b in swell:
        tt = np.arange(len(pad)) / SR
        lvl += 0.45 * np.clip((tt - a) / 2.0, 0, 1) * np.clip((b - tt) / 1.5, 0, 1)
    pad *= lvl[:, None]
    add(dry, pad * 0.5, 0)
    add(wet, pad * 0.8, 0)
    for bt in bells:
        b = bell(root + 36, vel=1.0)
        add(dry, pan(b, 0.25), bt)
        add(wet, pan(b, 0.25) * 0.9, bt)
    for ct in conch_at:
        c = conch(root + 12)
        add(dry, pan(c, -0.1) * 0.8, ct)
        add(wet, pan(c, -0.1) * 1.0, ct)
    scale = [0, 2, 4, 7, 9, 12, 14, 16]  # Sa Re Ga Pa Dha Sa' Re' Ga'
    for a, b in plucks:
        t = a
        k = 0
        phrase = [5, 4, 3, 4, 2, 3, 1, 0]
        while t < b:
            nt = root + 12 + scale[phrase[k % len(phrase)]]
            s = santoor(nt, 0.9 if k % 4 == 0 else 0.6)
            add(dry, pan(s, RNG.uniform(-0.4, 0.4)), t)
            add(wet, pan(s, 0) * 0.8, t)
            t += 0.31 if k % 4 != 3 else 0.62
            k += 1
    wet = highpass(wet, 150)
    mix = dry + reverb(wet, rt60=4.0) * 0.6
    mix = highpass(mix, 35)[: int(duration * SR)]
    fl = int(2.0 * SR)
    mix[-fl:] *= np.linspace(1, 0, fl)[:, None] ** 2
    mix /= np.max(np.abs(mix)) + 1e-9
    return (np.tanh(mix * 1.3) / np.tanh(1.3) * 0.89).astype(np.float32)
