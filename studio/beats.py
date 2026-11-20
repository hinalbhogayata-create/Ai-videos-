"""Beat / section detection for a user-supplied music track, so cuts land on the beat."""
import subprocess

import numpy as np
from scipy import signal

SR = 22050


def load_mono(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def analyse(path):
    y = load_mono(path)
    duration = len(y) / SR
    hop = 512
    f, t, Z = signal.stft(y, SR, nperseg=2048, noverlap=2048 - hop)
    mag = np.log1p(np.abs(Z) * 100)
    flux = np.maximum(np.diff(mag, axis=1), 0).sum(axis=0)
    flux = np.concatenate([[0], flux])
    flux = flux - ndimage_mean(flux, 16)
    flux = np.maximum(flux, 0)
    fr = SR / hop
    # tempo by autocorrelation in 70..180 BPM
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lags = np.arange(len(ac)) / fr
    bpm_axis = 60 / np.maximum(lags, 1e-6)
    m = (bpm_axis >= 70) & (bpm_axis <= 180)
    weight = np.exp(-0.5 * (np.log2(bpm_axis[m] / 110) / 0.9) ** 2)
    lag = np.arange(len(ac))[m][np.argmax(ac[m] * weight)]
    period = lag / fr
    # phase: grid offset with most onset energy
    best, phase = -1, 0.0
    for ph in np.linspace(0, period, 48, endpoint=False):
        idx = (np.arange(ph, duration, period) * fr).astype(int)
        idx = idx[idx < len(flux)]
        s = flux[idx].sum()
        if s > best:
            best, phase = s, ph
    beats = list(np.arange(phase, duration, period))
    bars = beats[::4]
    # energy curve -> climax = loudest 25% window, build = before it
    rms = np.sqrt(signal.convolve(y ** 2, np.ones(SR) / SR, "same"))[::SR // 10]
    win = max(1, int(len(rms) * 0.25))
    sm = np.convolve(rms, np.ones(win) / win, "valid")
    c_start = np.argmax(sm) / 10
    climax = min(bars, key=lambda b: abs(b - c_start)) if bars else c_start
    build = min(bars, key=lambda b: abs(b - climax * 0.55)) if bars else climax * 0.55
    end = min(bars, key=lambda b: abs(b - (duration - 3.0))) if bars else duration - 3
    return {
        "bpm": 60 / period, "beat": period, "bar": period * 4, "duration": duration,
        "sections": {"intro": 0.0, "build": build, "climax": climax, "end": max(end, climax + period * 4)},
        "hits": [climax, end], "beats": beats, "bars": bars,
    }


def ndimage_mean(x, w):
    return np.convolve(x, np.ones(w) / w, "same")
