import subprocess
SRC="/home/user/Ai-videos-/Row videos/Ekadashi_raw.mov"
MUS="/home/user/Ai-videos-/reference_clip/music_only.wav"
D=46.3
cuts=[0,1.5,3.5,8,11,13.5,17.5,21,22.5,26.5,29.5,31,34,38,41,44,D]
zooms=[1.0,1.3,1.0,1.2,1.0,1.4,1.0,1.25,1.0,1.35,1.0,1.2,1.0,1.3,1.0,1.2]
n=len(zooms)
fc=f"[0:v:0]split={n}"+"".join(f"[s{i}]" for i in range(n))+";"
for i in range(n):
    a,b=cuts[i],cuts[i+1];z=zooms[i]
    fc+=f"[s{i}]trim={a}:{b},setpts=PTS-STARTPTS,crop=iw/{z}:ih/{z}:(iw-iw/{z})/2:(ih-ih/{z})*0.25,scale=1080:1920:flags=lanczos,setsar=1[v{i}];"
fc+="".join(f"[v{i}]" for i in range(n))+f"concat=n={n}:v=1:a=0[cat];"
# colour grade: bright, clean, slightly cool like the reference
fc+="[cat]eq=contrast=1.08:saturation=1.12:brightness=0.015:gamma=0.97,colorbalance=rs=-0.03:bs=0.05:rm=-0.02:bm=0.04,unsharp=5:5:0.6[g];"
fc+="[g][1:v]overlay=enable='between(t,11,13.5)'[o1];[o1][2:v]overlay=enable='between(t,34,36.5)'[o2];"
fc+="[o2][4:v]overlay=format=auto[vout];"
fc+=f"[0:a:0]volume=2.9,alimiter=limit=0.95[vo];[3:a]atrim=0:{D},volume=0.6,afade=t=in:d=0.5,afade=t=out:st={D-2.5}:d=2.5[mu];[vo][mu]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.97[aout]"
cmd=["ffmpeg","-y","-v","error","-stats","-i",SRC,"-loop","1","-t",str(D),"-i","card1.png","-loop","1","-t",str(D),"-i","card2.png","-i",MUS,"-i","text_overlay.mov",
"-filter_complex",fc,"-map","[vout]","-map","[aout]","-t",str(D),"-r","30","-c:v","libx264","-preset","medium","-crf","23","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart","Ekadashi_edit.mp4"]
subprocess.run(cmd,check=True)
