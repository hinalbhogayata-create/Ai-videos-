"""Automatic cinematic video editor.

    python -m studio.render projects/demo.json

Reads a project JSON, builds (or analyses) the music, cuts footage on the beat with
pacing that accelerates toward the climax, colour-grades, adds slow push-ins,
letterbox, big animated titles, flashes / lens streaks on hits, film grain and
vignette, then mixes and loudness-normalises the audio (-14 LUFS for YouTube/Instagram).
"""
import json
import os
import subprocess
import sys
import time

import numpy as np
from PIL import Image

from . import music as music_mod
from .backgrounds import Smoke
from .text import Title, lens_streak

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_EXT = (".mp4", ".mov", ".m4v", ".mkv", ".avi", ".webm", ".mts")

FORMATS = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1080, 1080), "4:5": (1080, 1350), "4k": (3840, 2160)}

GRADES = {
    "teal_orange": "colorbalance=rs=-0.07:gs=-0.01:bs=0.08:rh=0.07:gh=0.01:bh=-0.07,eq=contrast=1.12:saturation=1.08:gamma=0.96",
    "moody": "eq=contrast=1.15:saturation=0.72:gamma=0.92,colorbalance=bs=0.05:bm=0.03:rh=0.03",
    "warm_gold": "colorbalance=rs=0.04:rm=0.06:bm=-0.05:rh=0.05:bh=-0.06,eq=contrast=1.08:saturation=1.1",
    "cold_blue": "colorbalance=rs=-0.05:bs=0.07:bm=0.04:rh=-0.02:bh=0.04,eq=contrast=1.1:saturation=0.85",
    "bw": "hue=s=0,eq=contrast=1.28:gamma=0.95",
    "natural": "eq=contrast=1.05:saturation=1.05",
}


def p(path):
    return path if os.path.isabs(path) else os.path.join(ROOT, path)


def probe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


# ---------------------------------------------------------------- footage reader
class ClipReader:
    def __init__(self, path, start, dur, W, H, fps, grade, speed=1.0):
        self.W, self.H = W, H
        self.nbytes = W * H * 3
        vf = [f"setpts=PTS/{speed}" if speed != 1 else None,
              f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos", f"crop={W}:{H}",
              f"fps={fps}", GRADES.get(grade, "") or None]
        vf = ",".join(x for x in vf if x)
        cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", path, "-t", f"{dur * speed + 0.5:.3f}",
               "-an", "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
        self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=self.nbytes * 2)
        self.last = np.zeros((H, W, 3), np.uint8)

    def read(self):
        buf = self.proc.stdout.read(self.nbytes)
        if buf and len(buf) == self.nbytes:
            self.last = np.frombuffer(buf, np.uint8).reshape(self.H, self.W, 3)
        return self.last

    def close(self):
        try:
            self.proc.stdout.close()
            self.proc.kill()
        except Exception:
            pass


def push_in(img_u8, prog, direction, amount=0.07):
    """Slow sub-pixel smooth push-in / pull-out with a gentle drift."""
    H, W = img_u8.shape[:2]
    z = 1 + amount * (prog if direction % 2 == 0 else 1 - prog)
    w, h = W / z, H / z
    dx = (W - w) * (0.5 + 0.3 * (prog - 0.5) * (1 if direction % 3 else -1))
    dy = (H - h) * 0.5
    im = Image.fromarray(img_u8).resize((W, H), Image.BICUBIC, box=(dx, dy, dx + w, dy + h))
    return np.asarray(im, dtype=np.float32) / 255.0


# ---------------------------------------------------------------- edit planning
def resolve_time(v, mk):
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    off = 0.0
    for sign in ("+", "-"):
        if sign in s[1:]:
            i = s.index(sign, 1)
            off = float(s[i:])
            s = s[:i]
            break
    if s in mk["sections"]:
        return mk["sections"][s] + off
    if s.startswith("bar"):
        return mk["bars"][int(s[3:])] + off
    if s.startswith("hit"):
        return mk["hits"][int(s[3:])] + off
    return float(s) + off


def cut_points(mk, start, stop):
    """Pacing: intro = 1 cut per bar, build = every 2 beats, climax = every beat."""
    sec = mk["sections"]
    b = mk["beat"]
    pts, t = [start], start
    while t < stop - 1e-6:
        if t < sec["build"] - 1e-6:
            step = 4 * b
        elif t < sec["climax"] - 1e-6:
            step = 2 * b
        else:
            step = b
        t = round((t + step) / b) * b if b else t + step
        pts.append(min(t, stop))
    return sorted(set(round(x, 4) for x in pts))


def plan_segments(cfg, mk):
    folder = p(cfg.get("footage", "Row videos"))
    clips = cfg.get("clips")
    if not clips:
        files = sorted(f for f in os.listdir(folder) if f.lower().endswith(VIDEO_EXT)) if os.path.isdir(folder) else []
        clips = [{"file": os.path.join(folder, f)} for f in files]
    else:
        clips = [dict(c, file=p(c["file"]) if os.path.exists(p(c["file"])) else os.path.join(folder, c["file"])) for c in clips]
    if not clips:
        return []
    for c in clips:
        c["_len"] = probe_duration(c["file"])
        c["_used"] = 0
    sec = mk["sections"]
    pts = cut_points(mk, 0.0, sec["end"])
    segs = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        c = clips[i % len(clips)]
        dur = b - a
        speed = float(c.get("speed", 1.0 if a >= sec["build"] else 0.6 if cfg.get("slowmo_intro", True) else 1.0))
        need = dur * speed
        if "in" in c and c["_used"] == 0:
            src_in = float(c["in"])
        else:
            usable = max(0.0, c["_len"] * 0.85 - need)
            k = c["_used"]
            src_in = c["_len"] * 0.08 + (usable - c["_len"] * 0.08) * ((k * 0.618) % 1.0) if usable > c["_len"] * 0.08 else 0.0
        c["_used"] += 1
        segs.append({"start": a, "end": b, "file": c["file"], "in": max(0.0, src_in), "speed": speed, "dir": i})
    return segs


# ---------------------------------------------------------------- main render
def render(cfg_path):
    cfg = json.load(open(cfg_path, encoding="utf-8"))
    name = cfg.get("name", os.path.splitext(os.path.basename(cfg_path))[0])
    W, H = FORMATS.get(cfg.get("format", "16:9"), FORMATS["16:9"])
    fps = int(cfg.get("fps", 30))
    out = p(cfg.get("output", f"output/{name}.mp4"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    work = os.path.join(os.path.dirname(out), f".{name}_work")
    os.makedirs(work, exist_ok=True)

    # 1. music
    mcfg = cfg.get("music", {"mode": "auto"})
    music_wav = os.path.join(work, "music.wav")
    if mcfg.get("file"):
        from .beats import analyse
        print("» analysing music beats ...")
        music_wav = p(mcfg["file"])
        mk = analyse(music_wav)
        if cfg.get("duration"):
            mk["duration"] = min(mk["duration"], float(cfg["duration"]))
    else:
        print(f"» composing {mcfg.get('mood', 'epic')} score ...")
        audio, mk = music_mod.compose(float(cfg.get("duration", 40)), mcfg.get("mood", "epic"))
        music_mod.write_wav(music_wav, audio)
    D = mk["duration"]
    sec = mk["sections"]
    gap = mk["beat"] * 0.5
    print(f"  {mk['bpm']:.0f} BPM | intro 0s, build {sec['build']:.1f}s, climax {sec['climax']:.1f}s, end {sec['end']:.1f}s, total {D:.1f}s")

    # 2. edit
    segs = plan_segments(cfg, mk)
    print(f"» {len(segs)} shots" if segs else "» no footage found - using cinematic generated background")
    grade = cfg.get("grade", "teal_orange")
    bgcfg = cfg.get("background", {})
    smoke = Smoke(W, H, fps, bgcfg.get("palette", "teal_amber"), intensity=float(bgcfg.get("intensity", 1.0)))
    titles = []
    for tc in cfg.get("titles", []):
        st = resolve_time(tc.get("at", 0), mk)
        if "until" in tc:
            tc = dict(tc, duration=resolve_time(tc["until"], mk) - st)
        titles.append((st, Title(tc, W, H)))
    letterbox = cfg.get("letterbox", W > H)
    bar_h = int(round((H - W / 2.39) / 2)) if letterbox and W > H else 0

    # 3. video encode
    silent = os.path.join(work, "video.mp4")
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
         "-vf", f"vignette=PI/5,noise=alls={int(cfg.get('grain', 5))}:allf=t+u,format=yuv420p",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "14M", "-bufsize", "28M", "-tune", "film", "-movflags", "+faststart", silent],
        stdin=subprocess.PIPE)
    nframes = int(round(D * fps))
    reader, ri = None, -1
    t0 = time.time()
    hit_flash = [h for h in mk["hits"]]
    for fi in range(nframes):
        t = fi / fps
        # --- background
        si = next((i for i, s in enumerate(segs) if s["start"] <= t < s["end"]), None)
        in_end = t >= sec["end"]
        if si is not None and not in_end:
            s = segs[si]
            if si != ri:
                if reader:
                    reader.close()
                reader = ClipReader(s["file"], s["in"], s["end"] - s["start"], W, H, fps, grade, s["speed"])
                ri = si
            prog = (t - s["start"]) / (s["end"] - s["start"])
            frame = push_in(reader.read(), prog, s["dir"])
            if t < sec["build"]:  # intro: soft dips between shots
                edge = min(t - s["start"], s["end"] - t)
                frame *= min(1.0, 0.25 + edge / 0.35)
        else:
            frame = smoke.frame(t)
            if in_end and segs:
                frame *= 0.75
        # title contrast: dim footage under titles
        if segs and not in_end:
            act = [tt for st, tt in titles if 0 <= t - st <= tt.dur]
            if act:
                frame *= 0.55
        # silence-gap blackout before climax hit
        if sec["climax"] - gap <= t < sec["climax"]:
            frame[:] = 0
        # global fade in / out
        frame *= min(1.0, t / 1.2) * min(1.0, (D - t) / 1.0)
        if bar_h:
            frame[:bar_h] = 0
            frame[-bar_h:] = 0
        # --- titles
        flash, streaks = 0.0, []
        for st, tt in titles:
            tt.draw(frame, t - st)
            flash = max(flash, tt.flash)
            if tt.streak > 0:
                streaks.append((tt.streak_y, tt.streak))
        for h in hit_flash:
            if 0 <= t - h < 0.2:
                flash = max(flash, 0.7 * (1 - (t - h) / 0.2))
        for y, s in streaks:
            lens_streak(frame, y, s)
        if flash > 0:
            frame += (1 - frame) * flash
            if bar_h:
                frame[:bar_h] = 0
                frame[-bar_h:] = 0
        enc.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
        if fi % (fps * 5) == 0:
            el = time.time() - t0
            print(f"  rendering {t:5.1f}s / {D:.1f}s  ({el:.0f}s elapsed)", flush=True)
    if reader:
        reader.close()
    enc.stdin.close()
    enc.wait()

    # 4. audio mix + loudness
    print("» mixing audio (-14 LUFS) ...")
    vo = cfg.get("voiceover")
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", music_wav]
    if vo:
        cmd += ["-i", p(vo)]
        fc = (f"[1:a]atrim=0:{D},volume=0.8[m];[2:a]adelay={int(float(cfg.get('voiceover_at', 0)) * 1000)}:all=1,"
              "highpass=f=80,acompressor=threshold=-18dB:ratio=3,asplit[v1][v2];"
              "[m][v1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];"
              "[duck][v2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]")
    else:
        fc = f"[1:a]atrim=0:{D},afade=t=out:st={max(0, D - 1.0)}:d=1,loudnorm=I=-14:TP=-1:LRA=11[a]"
    cmd += ["-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
            "-ar", "48000", "-shortest", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print(f"✔ done: {out}  ({time.time() - t0:.0f}s)")
    return out


if __name__ == "__main__":
    render(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "projects", "demo.json"))
