import segno, glob
from PIL import Image, ImageDraw, ImageFont
W='/home/user/Ai-videos-/website/'
MAROON=(107,16,32); MAROON_D=(63,8,18); GOLD=(212,164,55); GOLD_L=(241,207,115); CREAM=(255,248,236); FIND=(107,16,32)

def font(names,sz):
    for n in names:
        g=glob.glob('/usr/share/fonts/**/'+n,recursive=True)
        if g: return ImageFont.truetype(g[0],sz)
    return ImageFont.load_default()
SERIF=['DejaVuSerif-Bold.ttf','LiberationSerif-Bold.ttf']; SANS=['DejaVuSans.ttf']; SANSB=['DejaVuSans-Bold.ttf']

def styled_qr(data, size=2000, logo=True):
    q=segno.make(data, error='h', micro=False)
    m=[list(r) for r in q.matrix]; n=len(m); quiet=4
    cell=size/(n+2*quiet)
    img=Image.new('RGB',(size,size),'white'); d=ImageDraw.Draw(img)
    def in_finder(r,c):
        return any(r0<=r<r0+7 and c0<=c<c0+7 for r0,c0 in [(0,0),(0,n-7),(n-7,0)])
    # logo clear zone (centre)
    lz=int(n*0.24)//2*2+1; l0=(n-lz)//2
    def in_logo(r,c): return logo and l0<=r<l0+lz and l0<=c<l0+lz
    for r in range(n):
        for c in range(n):
            if m[r][c] and not in_finder(r,c) and not in_logo(r,c):
                x=(c+quiet)*cell; y=(r+quiet)*cell; p=cell*0.04
                d.rounded_rectangle([x+p,y+p,x+cell-p,y+cell-p],radius=cell*0.3,fill=MAROON)
    for r0,c0 in [(0,0),(0,n-7),(n-7,0)]:
        x=(c0+quiet)*cell; y=(r0+quiet)*cell
        d.rounded_rectangle([x,y,x+7*cell,y+7*cell],radius=cell*1.0,fill=MAROON)
        d.rounded_rectangle([x+cell,y+cell,x+6*cell,y+6*cell],radius=cell*0.6,fill='white')
        d.rounded_rectangle([x+2*cell,y+2*cell,x+5*cell,y+5*cell],radius=cell*0.4,fill=FIND)
    if logo:
        lg=Image.open(W+'images/niyati-logo.webp').convert('RGBA')
        ls=int(lz*cell*0.92); lg=lg.resize((ls,ls),Image.LANCZOS)
        cx=size//2; ring=int(ls/2+cell*0.35)
        d.ellipse([cx-ring,cx-ring,cx+ring,cx+ring],fill=GOLD)
        img.paste(lg,(cx-ls//2,cx-ls//2),lg)
    return img

def card(qr_img, title, line1, line2, url_text, fname):
    Wc,Hc=1240,1748  # A6 @ 300dpi
    c=Image.new('RGB',(Wc,Hc),CREAM); d=ImageDraw.Draw(c)
    d.rectangle([0,0,Wc,330],fill=MAROON_D)
    for i in range(330):  # gradient
        t=i/330; col=tuple(int(MAROON_D[k]*(1-t)+MAROON[k]*t) for k in range(3)); d.line([(0,i),(Wc,i)],fill=col)
    d.rectangle([0,326,Wc,336],fill=GOLD)
    lg=Image.open(W+'images/niyati-logo.webp').convert('RGBA').resize((210,210),Image.LANCZOS)
    d.ellipse([Wc//2-113,60-3,Wc//2+113,60+223],fill=GOLD); c.paste(lg,(Wc//2-105,65),lg)
    def ctext(y,t,f,fill):
        w=d.textlength(t,font=f); d.text(((Wc-w)/2,y),t,font=f,fill=fill)
    ctext(380,'Niyati',font(SERIF,96),MAROON)
    ctext(500,'Hindu Religious Work Services',font(SERIF,40),MAROON_D)
    ctext(560,line1,font(SANS,34),(110,90,76))
    q=qr_img.resize((820,820),Image.LANCZOS)
    d.rounded_rectangle([Wc//2-440,640,Wc//2+440,1500],radius=40,fill='white',outline=GOLD,width=6)
    c.paste(q,(Wc//2-410,660))
    ctext(1525,title,font(SANSB,46),MAROON)
    if url_text=='STARS':
        import math
        for i in range(5):
            cx=Wc//2+(i-2)*62; cy=1615; R=26; r=11
            pts=[(cx+(R if k%2==0 else r)*math.sin(k*math.pi/5), cy-(R if k%2==0 else r)*math.cos(k*math.pi/5)) for k in range(10)]
            d.polygon(pts,fill=(251,188,5))
    else:
        ctext(1590,url_text,font(SERIF,40),(196,87,11))
    ctext(1655,line2,font(SANS,30),(110,90,76))
    c.save(fname,dpi=(300,300))

web='https://www.niyatiweddings.co.uk'
review='https://g.page/r/CXJyZFwRMldxEBM/review'
q1=styled_qr(web); q1.save('niyati-website-qr.png',dpi=(300,300))
segno.make(web,error='h').save('niyati-website-qr.svg',scale=20,border=4,dark='#6b1020')
q2=styled_qr(review); q2.save('niyati-google-review-qr.png',dpi=(300,300))
card(q1,'Scan to visit our website','Vedic Weddings · Pujas · Sanskaras','WhatsApp +44 7741 922710','www.niyatiweddings.co.uk','niyati-website-qr-card.png')
card(q2,'Scan to review us on Google','Thank you for letting us serve your family 🙏'.replace(' 🙏',''),'Your blessings help other families find us','STARS','niyati-google-review-qr-card.png')
print('done')
