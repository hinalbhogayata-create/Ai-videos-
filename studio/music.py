"""Cinematic trailer-style music generator (pure numpy/scipy, no samples needed).

Structure: intro (piano + pad + drone) -> build (string ostinato, taiko, riser)
-> short silence -> HIT -> climax (braams, full drums, big pad) -> final impact + tail.

Returns the audio plus exact timing markers (beats, bars, hits, sections) so the
video editor can cut precisely on the music.
"""
import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(7)

MOODS = {
    # root midi note, chord progression (as semitone offsets from root + quality)
    "epic":     {"root": 45, "prog": [(0, "m"), (-4, "M"), (3, "M"), (-2, "M")], "bpm": 90},   # Am F C G
    "dark":     {"root": 43, "prog": [(0, "m"), (1, "M"), (0, "m"), (-4, "M")], "bpm": 84},    # Gm Ab Gm Eb
    "emotional": {"root": 48, "prog": [(0, "M"), (-3, "m"), (-7, "M"), (-5, "M")], "bpm": 76},  # C Am F G
    "heroic":   {"root": 50, "prog": [(0, "m"), (-2, "M"), (-4, "M"), (-5, "M")], "bpm": 96},  # Dm C Bb A
}


def mtof(n):
    return 440.0 * 2 ** ((np.asarray(n, dtype=float) - 69) / 12)


def chord(root, quality):
    third = 3 if quality == "m" else 4
    return [root, root + third, root + 7]


# ---------------------------------------------------------------- oscillators
def saw(freq, n, phase=None):
    dt = freq / SR
    p = ((RNG.random() if phase is None else phase) + dt * np.arange(n)) % 1.0
    y = 2 * p - 1
    m = p < dt
    t = p[m] / dt
    y[m] -= t + t - t * t - 1
    m = p > 1 - dt
    t = (p[m] - 1) / dt
    y[m] -= t * t + t + t + 1
    return y


def lowpass(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def pan(mono, p):
    """p in [-1,1] -> stereo (equal power)."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def add(bus, x, start):
    i = int(start * SR)
    if i >= len(bus):
        return
    j = min(len(bus), i + len(x))
    bus[i:j] += x[: j - i]


# ---------------------------------------------------------------- instruments
def string_pad(notes, dur, attack=1.5, release=1.5, bright=0.4):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k, note in enumerate(notes):
        f0 = mtof(note)
        for v in range(5):
            det = 2 ** ((v - 2) * 0.07 / 12)
            out += pan(saw(f0 * det, n), (v - 2) / 2.5 * 0.8) * 0.12
    dark = lowpass(out, 700)
    brt = lowpass(out, 3200)
    sig = highpass(dark * (1 - bright) + brt * bright, 110)
    env = np.clip(t / attack, 0, 1) ** 1.5
    env *= np.where(t > dur, np.exp(-(t - dur) * 4 / release), 1.0)
    return sig * env[:, None] / max(1, len(notes)) * 1.6


def piano(note, dur=4.0, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = mtof(note)
    y = np.zeros(n)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > SR * 0.45:
            break
        y += np.sin(2 * np.pi * fk * t) * np.exp(-t * (0.9 + 0.7 * k)) / k ** 1.3
    y *= np.clip(t / 0.003, 0, 1)
    y += lowpass(RNG.standard_normal(n) * np.exp(-t * 120), 2500) * 0.15  # hammer
    return pan(y * vel * 0.35, RNG.uniform(-0.3, 0.3))


def spiccato(note, vel=1.0, length=0.22):
    n = int(length * 2 * SR)
    t = np.arange(n) / SR
    f0 = mtof(note)
    y = sum(saw(f0 * 2 ** (d / 1200), n) for d in (-6, 0, 7))
    y = lowpass(y, 1400 + 900 * vel)
    env = np.clip(t / 0.006, 0, 1) * np.exp(-t / length * 3)
    return pan(y * env * 0.18 * vel, 0.0)


def taiko(vel=1.0):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 52 + 95 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)
    skin = lowpass(RNG.standard_normal(n), 900) * np.exp(-t * 35) * 0.8
    y = np.tanh((body + skin) * 1.8) * vel * 0.55
    return pan(y, RNG.uniform(-0.15, 0.15))


def impact(scale=1.0):
    n = int(5.0 * SR)
    t = np.arange(n) / SR
    f = 30 + 70 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3)
    crash_l = lowpass(RNG.standard_normal(n), 4200) * np.exp(-t * 3.2)
    crash_r = lowpass(RNG.standard_normal(n), 4200) * np.exp(-t * 3.2)
    thump = np.tanh(sub * 2.2) * 0.9
    out = np.stack([thump + crash_l * 0.35, thump + crash_r * 0.35], axis=1)
    out[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))[:, None]
    return out * scale * 0.8


def braam(notes, dur=3.0):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    y = np.zeros((n, 2))
    for note in notes:
        f0 = mtof(note)
        for v in range(4):
            y += pan(saw(f0 * 2 ** ((v - 1.5) * 0.12 / 12), n), (v - 1.5) / 2) * 0.25
    opening = np.clip(t / 0.25, 0, 1) * np.exp(-np.maximum(t - 0.4, 0) * 0.9)
    dark = lowpass(y, 180, 4)
    brt = lowpass(y, 1600, 2)
    sig = dark * (1 - opening[:, None]) + brt * opening[:, None]
    env = np.clip(t / 0.04, 0, 1) * np.where(t > dur, np.exp(-(t - dur) * 3), 1.0)
    return np.tanh(sig * env[:, None] * 2.5) * 0.45


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    noise = RNG.standard_normal((n, 2))
    # time-varying band via STFT mask
    out = np.zeros_like(noise)
    for ch in range(2):
        f, tt, Z = signal.stft(noise[:, ch], SR, nperseg=2048)
        prog = np.clip(tt / dur, 0, 1)
        centre = 300 * (40 ** prog)  # 300 Hz -> 12 kHz
        mask = np.exp(-((np.log(f[:, None] + 1) - np.log(centre[None, :])) ** 2) / 0.6)
        _, y = signal.istft(Z * mask, SR, nperseg=2048)
        out[:, ch] = y[:n] if len(y) >= n else np.pad(y, (0, n - len(y)))
    tone_f = 180 * (8 ** x)
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.25
    env = x ** 2.2
    return (out * 0.9 + tone[:, None]) * env[:, None] * 0.5


def drone(note, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = mtof(note)
    y = np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 2.003 * t)
    y += lowpass(saw(f0, n), 220) * 0.6
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t)
    env = np.clip(t / 6.0, 0, 1) ** 2 * np.clip((dur - t) / 2.0, 0, 1)
    return pan(y * lfo * env * 0.11, 0)


def reverb(x, rt60=3.2, predelay=0.025):
    n = int(rt60 * SR)
    t = np.arange(n) / SR
    decay = np.exp(-t * 6.9 / rt60)
    ir = RNG.standard_normal((n, 2)) * decay[:, None]
    ir = lowpass(ir, 6000)
    ir[: int(0.003 * SR)] *= 0
    ir = np.concatenate([np.zeros((int(predelay * SR), 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return wet


# ---------------------------------------------------------------- arranger
def compose(duration, mood="epic", tail=5.0):
    """Compose a trailer cue that lasts exactly `duration` seconds."""
    m = MOODS.get(mood, MOODS["epic"])
    body = max(duration - tail, 8.0)
    bpm0 = m["bpm"]
    bar0 = 4 * 60 / bpm0
    bars = max(4, int(round(body / bar0)))
    bar = body / bars
    beat = bar / 4
    bpm = 60 / beat

    intro = max(2, int(round(bars * 0.32)))
    build = max(2, int(round(bars * 0.40)))
    climax = max(1, bars - intro - build)
    t_build = intro * bar
    t_climax = (intro + build) * bar
    t_end = bars * bar
    total = t_end + tail

    n = int(total * SR) + SR
    dry = np.zeros((n, 2))
    wet = np.zeros((n, 2))
    root = m["root"]
    prog = m["prog"]

    def chord_at(b):
        off, q = prog[(b // 2) % len(prog)]
        return chord(root + off, q)

    # drone throughout
    d = drone(root - 12, t_end + 2)
    add(dry, d, 0)

    # pads: every 2 bars, swelling
    for b in range(0, bars, 2):
        notes = [x + 12 for x in chord_at(b)]
        brightness = 0.15 if b < intro else (0.4 if b < intro + build else 0.75)
        level = 0.55 if b < intro else (0.8 if b < intro + build else 1.15)
        if b >= intro + build:
            notes = notes + [notes[0] + 12]
        p = string_pad(notes, 2 * bar, attack=bar * (0.9 if b < intro else 0.3), bright=brightness)
        add(dry, p * level * 0.6, b * bar)
        add(wet, p * level * 0.7, b * bar)

    # intro piano motif (sparse, emotional)
    motif = [0, 2, 1, 2, 0, 1]
    for b in range(intro + build):
        ch = chord_at(b)
        hits = [0, 1.5, 3] if b < intro else [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]
        vel = 0.9 if b < intro else 0.45
        for i, h in enumerate(hits):
            note = ch[motif[(b + i) % len(motif)]] + 24
            pn = piano(note, 4.0, vel * (1.0 if i == 0 else 0.75))
            add(dry, pn * 0.7, b * bar + h * beat)
            add(wet, pn * 0.9, b * bar + h * beat)

    # build: string ostinato in 8ths, taikos, accelerating density
    for b in range(intro, intro + build):
        ch = chord_at(b)
        prog_b = (b - intro) / max(1, build - 1)
        for e in range(8):
            accent = 1.0 if e in (0, 3, 6) else 0.6
            sp = spiccato(ch[0] - 12 + (12 if e % 2 else 0) * 0, accent * (0.6 + 0.5 * prog_b))
            add(dry, sp, b * bar + e * beat / 2)
            add(wet, sp * 0.3, b * bar + e * beat / 2)
        tk_pattern = [0, 2.5] if prog_b < 0.5 else [0, 1.5, 2.5, 3, 3.5]
        for h in tk_pattern:
            tk = taiko(0.6 + 0.4 * prog_b)
            add(dry, tk, b * bar + h * beat)
            add(wet, tk * 0.35, b * bar + h * beat)

    # riser into climax with a short silence (classic trailer "suck-out")
    gap = beat * 0.5
    r_len = min(2 * bar, t_climax - t_build)
    r = riser(r_len - gap)
    add(dry, r, t_climax - r_len)
    add(wet, r * 0.6, t_climax - r_len)
    gi, gj = int((t_climax - gap) * SR), int(t_climax * SR)
    fade = np.linspace(1, 0, int(0.03 * SR))[:, None]
    dry[gi:gi + len(fade)] *= fade
    wet[gi:gi + len(fade)] *= fade
    dry[gi + len(fade):gj] = 0
    wet[gi + len(fade):gj] *= 0.15

    hits = [t_climax]
    # climax: braam every 2 bars, big drums
    for b in range(intro + build, bars):
        ch = chord_at(b)
        if (b - intro - build) % 2 == 0:
            br = braam([ch[0] - 24, ch[0] - 12, ch[2] - 12], 2 * bar * 0.9)
            add(dry, br * 0.8, b * bar)
            add(wet, br * 0.6, b * bar)
            im = impact(1.0)
            add(dry, im, b * bar)
            add(wet, im * 0.5, b * bar)
            if b * bar not in hits:
                hits.append(b * bar)
        for e in range(8):
            sp = spiccato(ch[0] - 12 + (12 if e % 2 else 0), 1.0)
            add(dry, sp * 1.1, b * bar + e * beat / 2)
        for h in [0, 1, 1.5, 2, 3, 3.25, 3.5, 3.75]:
            tk = taiko(0.9 if h == int(h) else 0.6)
            add(dry, tk, b * bar + h * beat)
            add(wet, tk * 0.3, b * bar + h * beat)

    # final hit + tail
    im = impact(1.3)
    add(dry, im, t_end)
    add(wet, im * 0.8, t_end)
    br = braam([root - 24, root - 12, root - 5], tail * 0.6)
    add(dry, br * 0.7, t_end)
    add(wet, br * 0.8, t_end)
    fin = string_pad([root + 12, root + 15, root + 19, root + 24], tail * 0.5, attack=0.05, bright=0.5)
    add(wet, fin * 0.6, t_end)
    hits.append(t_end)

    wet = highpass(wet, 160)  # keep reverb out of the low end
    mix = dry + reverb(wet, rt60=3.4) * 0.55
    mix = highpass(mix, 28)
    mix = mix[: int(total * SR)]
    # fade the very end
    fl = int(1.2 * SR)
    mix[-fl:] *= np.linspace(1, 0, fl)[:, None] ** 2
    # glue + soft clip
    mix /= np.max(np.abs(mix)) + 1e-9
    mix = np.tanh(mix * 1.6) / np.tanh(1.6)
    mix *= 0.89

    beats = [i * beat for i in range(int(t_end / beat) + 1)]
    markers = {
        "bpm": bpm, "beat": beat, "bar": bar, "duration": total,
        "sections": {"intro": 0.0, "build": t_build, "climax": t_climax, "end": t_end},
        "hits": sorted(hits), "beats": beats,
        "bars": [i * bar for i in range(bars + 1)],
    }
    return mix.astype(np.float32), markers


def write_wav(path, audio):
    from scipy.io import wavfile
    wavfile.write(path, SR, (np.clip(audio, -1, 1) * 32767).astype(np.int16))


if __name__ == "__main__":
    import json, sys
    dur = float(sys.argv[1]) if len(sys.argv) > 1 else 40
    mood = sys.argv[2] if len(sys.argv) > 2 else "epic"
    a, mk = compose(dur, mood)
    write_wav("music_test.wav", a)
    print(json.dumps({k: v for k, v in mk.items() if k not in ("beats",)}, indent=1))
