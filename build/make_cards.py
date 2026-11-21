from PIL import Image, ImageDraw, ImageFont
import numpy as np
W,H=1080,1920
F="/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf"
def card(path,num,text):
    top=np.array([14,110,185]);bot=np.array([3,38,84])
    g=np.linspace(0,1,H)[:,None,None]
    img=Image.fromarray((top*(1-g)+bot*g).repeat(W,1).astype(np.uint8))
    d=ImageDraw.Draw(img,"RGBA")
    # big soft yellow circle like the reference
    d.ellipse((-330,380,330,1040),fill=(245,245,60,215))
    # number badge
    d.ellipse((690,200,990,500),fill=(245,245,60,255))
    f=ImageFont.truetype(F,230); d.text((840,350),str(num),font=f,fill=(14,70,140),anchor="mm")
    ft=ImageFont.truetype(F,120)
    for i,line in enumerate(text):
        d.text((540,900+i*160),line,font=ft,fill=(255,255,255),anchor="mm",stroke_width=0)
    img.save(path)
card("card1.png",1,["चातुर्मास","का अंत"])
card("card2.png",2,["सबका","मंगल हो"])
