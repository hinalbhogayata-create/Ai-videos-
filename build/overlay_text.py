import re,sys,subprocess
from PIL import Image,ImageDraw,ImageFont,ImageFilter
exec(open("make_ass.py").read().split("def t(x)")[0])  # lines, titles
W,H,FPS,D=1080,1920,30,46.3
FB="/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf"
fc=ImageFont.truetype(FB,66,layout_engine=ImageFont.Layout.RAQM)
ft=ImageFont.truetype(FB,110,layout_engine=ImageFont.Layout.RAQM)
caps=[]
for s,e,x in lines:
    w=x.split(); n=3 if len(w)>4 else 2
    ch=[" ".join(w[i:i+n]) for i in range(0,len(w),n)]; d=(e-s)/len(ch)
    for i,c in enumerate(ch): caps.append((s+i*d,s+(i+1)*d,c))
def cap_img(t):
    im=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.text((W/2+3,1460+3),t,font=fc,fill=(0,0,0,150),anchor="ms",stroke_width=5,stroke_fill=(0,0,0,150))
    d.text((W/2,1460),t,font=fc,fill=(255,255,255,255),anchor="ms",stroke_width=5,stroke_fill=(0,0,0,255))
    return im
def title_img(t):
    g=Image.new("RGBA",(W,H),(0,0,0,0)); ImageDraw.Draw(g).text((W/2,260),t,font=ft,fill=(42,245,245,255),anchor="ms",stroke_width=10,stroke_fill=(245,245,42,255))
    g=g.filter(ImageFilter.GaussianBlur(14)); g.putalpha(g.getchannel("A").point(lambda a:int(a*0.7)))
    im=Image.new("RGBA",(W,H),(0,0,0,0)); ImageDraw.Draw(im).text((W/2,260),t,font=ft,fill=(245,245,42,255),anchor="ms")
    return Image.alpha_composite(g,im)
ci=[cap_img(c[2]) for c in caps]; ti=[title_img(t[2]) for t in titles]
p=subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgba","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-c:v","qtrle","text_overlay.mov"],stdin=subprocess.PIPE)
blank=Image.new("RGBA",(W,H),(0,0,0,0))
for f in range(int(D*FPS)):
    t=f/FPS; im=blank
    for (s,e,_),c in zip(caps,ci):
        if s<=t<e: im=Image.alpha_composite(im,c)
    for (s,e,_),c in zip(titles,ti):
        if s<=t<e:
            a=min(1,(t-s)/0.2,(e-t)/0.2)
            c2=c.copy(); c2.putalpha(c2.getchannel("A").point(lambda v:int(v*a))); im=Image.alpha_composite(im,c2)
    p.stdin.write(im.tobytes())
p.stdin.close(); p.wait()
