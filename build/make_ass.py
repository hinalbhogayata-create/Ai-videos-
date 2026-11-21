lines=[(0,4,"जय श्री कृष्ण, जय सियाराम, जय श्री राधे"),
(4,8,"सभी भक्तजनों को आज के दिन देवउठनी एकादशी की"),
(8,11,"देवउठनी एकादशी की हार्दिक शुभकामनाएँ"),
(11,17,"भगवान ठाकुर जी आज चातुर्मास के बाद आज प्रथम दिन है"),
(17.5,21,"जब भगवान जी निद्रा से जागे हैं"),
(21,23,"और उनको जगाने का आमंत्रण है"),
(23,26,"उत्तिष्ठ उत्तिष्ठ गोविंद"),
(26,29,"उत्तिष्ठ गरुड़ध्वज"),
(29,31,"उत्तिष्ठ कमलाकांत"),
(31,34,"त्रैलोक्यं मंगलं कुरु"),
(34,38,"हे नाथ, हे दयानिधि, करुणानिधि आप जागे हैं"),
(38,41,"और पूरे विश्व का मंगल करें"),
(41,44,"सबका मंगल हो, ऐसी कामना व प्रार्थना के साथ"),
(44,46.3,"जय श्री कृष्ण")]
titles=[(0.3,8,"देवउठनी एकादशी"),(23,34,"उत्तिष्ठ मंत्र"),(38.2,46.2,"जय श्री हरि")]
def t(x):
    h=int(x//3600);m=int(x%3600//60);s=x%60
    return f"{h}:{m:02d}:{s:05.2f}"
o="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Cap,Noto Sans Devanagari,66,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,5,2,2,60,60,450,1
Style: Title,Noto Sans Devanagari,110,&H002AF5F5,&H002AF5F5,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,8,40,40,150,1
Style: Glow,Noto Sans Devanagari,110,&H002AF5F5,&H002AF5F5,&H002AF5F5,&H00000000,1,0,0,0,100,100,0,0,1,10,0,8,40,40,150,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
for s,e,x in lines:
    w=x.split(); n=3 if len(w)>4 else 2
    ch=[" ".join(w[i:i+n]) for i in range(0,len(w),n)]
    d=(e-s)/len(ch)
    for i,c in enumerate(ch):
        o+=f"Dialogue: 2,{t(s+i*d)},{t(s+(i+1)*d)},Cap,,0,0,0,,{c}\n"
for s,e,x in titles:
    o+=f"Dialogue: 0,{t(s)},{t(e)},Glow,,0,0,0,,{{\\blur18\\alpha&H90&\\fad(200,200)}}{x}\n"
    o+=f"Dialogue: 1,{t(s)},{t(e)},Title,,0,0,0,,{{\\fad(200,200)\\fscx80\\fscy80\\t(0,250,\\fscx100\\fscy100)}}{x}\n"
open("subs.ass","w").write(o)
