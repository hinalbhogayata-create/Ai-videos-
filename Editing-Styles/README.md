# वीडियो एडिटिंग स्टाइल्स: पूरी गाइड (2026)

यह गाइड आपकी एडिटिंग स्टाइल बदलने के लिए एक "स्टाइल लाइब्रेरी" है। हर स्टाइल में लिखा है:
**यह क्या है → किस तरह के वीडियो के लिए → मुख्य तकनीकें → FFmpeg रेसिपी** (जो इस सेटअप में टेस्ट की गई है)।

> नोट: नीचे "किसकी तरह" में मशहूर क्रिएटर्स के नाम सिर्फ़ यह समझाने के लिए हैं कि यह तकनीक कहाँ दिखती है। हम उनकी तकनीक सीखते हैं, उनकी नकल या ब्रांडिंग नहीं करते।

---

## भाग 1: हर स्टाइल की नींव (ये नियम हर वीडियो पर लागू)

### 1. Hook: पहले 1–3 सेकंड
2026 में TikTok, Reels और Shorts सबसे ज़्यादा **retention (कितनी देर तक देखा गया) और rewatch** को महत्व देते हैं। इसलिए:
- वीडियो सबसे दिलचस्प पल / सबसे बड़े दावे / नतीजे से शुरू करें ("result first")।
- पहले फ़्रेम में ही चलती हुई चीज़ + बड़ा टेक्स्ट हुक (जैसे: "यह गलती 90% लोग करते हैं")।
- कोई logo intro या "हेलो दोस्तों" वाली धीमी शुरुआत नहीं।

### 2. Pacing (गति)
- Shorts/Reels: हर **1–3 सेकंड** में कुछ बदले: कट, ज़ूम, टेक्स्ट, B-roll, साउंड।
- लंबे YouTube वीडियो: हर **5–10 सेकंड** में विज़ुअल बदलाव ("pattern interrupt")।
- सभी "उम्म", "आह", साँस और चुप्पी काट दें (jump cuts)।

### 3. Captions (कैप्शन)
- ज़्यादातर लोग बिना आवाज़ के देखते हैं, तो कैप्शन ज़रूरी हैं।
- बड़े, मोटे फ़ॉन्ट, मोटी काली outline, स्क्रीन के निचले-बीच हिस्से में (9:16 में नीचे से ~25–30% ऊपर, ताकि ऐप के बटन से न ढकें)।
- एक बार में 2–4 शब्द; ज़रूरी शब्द को अलग रंग (पीला/हरा) में।
- हिंदी: **Noto Sans Devanagari** फ़ॉन्ट (इंस्टॉल है)।

### 4. Sound design (आवाज़)
- आवाज़ सबसे साफ़ होनी चाहिए; बैकग्राउंड म्यूज़िक बोलते समय अपने-आप धीमा (ducking)।
- हर कट/ज़ूम/टेक्स्ट पर हल्का SFX: whoosh, pop, click, riser, bass hit।
- फ़ाइनल वॉल्यूम: सोशल मीडिया के लिए **-14 LUFS**।

### 5. Color (रंग)
- पूरे वीडियो में एक ही "लुक" रखें, यही आपकी पहचान बनती है।
- स्किन टोन प्राकृतिक रखें, चाहे बाकी रंग कितने भी stylized हों।

### 6. Format
| प्लेटफ़ॉर्म | आकार | लंबाई |
|---|---|---|
| Reels / Shorts / TikTok | 1080×1920 (9:16) | 15–60 सेकंड सबसे अच्छा (Shorts अब 3 मिनट तक) |
| YouTube लंबा वीडियो | 1920×1080 या 4K (16:9) | 8–20 मिनट |
| Instagram feed | 1080×1350 (4:5) | — |

---

## भाग 2: स्टाइल्स की लाइब्रेरी

### Style 1: High-Retention / "YouTuber" Edit
- **क्या:** बहुत तेज़ कट, हर लाइन पर punch-in zoom, स्क्रीन पर बड़े टेक्स्ट, ढेर सारे SFX, memes/रिएक्शन क्लिप्स।
- **किसकी तरह:** MrBeast जैसे बड़े चैलेंज/एंटरटेनमेंट चैनल।
- **किसके लिए:** चैलेंज, एंटरटेनमेंट, टॉप-10, रिएक्शन।
- **तकनीक:** हर 2–4 सेकंड में zoom in/out बदलें (100% → 115%); counters/progress bar; हर डायलॉग पर टेक्स्ट पॉप।

### Style 2: Talking-Head "Educational" Edit
- **क्या:** साफ़ बैकग्राउंड, jump cuts, ज़रूरी बातों पर टेक्स्ट/आइकॉन, B-roll, साइड में बुलेट-पॉइंट ग्राफ़िक्स।
- **किसकी तरह:** Ali Abdaal, Dhruv Rathee जैसे explainer/शिक्षा चैनल।
- **किसके लिए:** टिप्स, स्टडी, फ़ाइनेंस, explainers।
- **तकनीक:** दो कैमरा एंगल का भ्रम (एक ही शॉट में wide ↔ 120% zoom बदलना), keyword highlight, map/chart animations।

### Style 3: Cinematic Vlog
- **क्या:** फ़िल्म जैसा लुक: 2.39:1 काली पट्टियाँ (letterbox), टील-ऑरेंज कलर, धीमे/स्मूथ शॉट, म्यूज़िक पर कट।
- **किसकी तरह:** Casey Neistat जैसे ट्रैवल/लाइफ़स्टाइल व्लॉग।
- **किसके लिए:** ट्रैवल, ड्रोन (DJI) शॉट्स, लाइफ़स्टाइल, शादी/इवेंट।
- **तकनीक:** 24fps, J-cut/L-cut (आवाज़ पहले/बाद में), speed ramps, film grain, natural sound (हवा, पानी) की परत।

### Style 4: Beat-Sync Montage
- **क्या:** हर कट म्यूज़िक की बीट पर; ड्रॉप पर speed ramp या flash।
- **किसके लिए:** ट्रैवल हाइलाइट्स, फ़िटनेस, फ़ैशन, इवेंट रील।
- **तकनीक:** पहले बीट मार्क करें, फिर क्लिप्स बीट से बीट तक रखें; ड्रॉप पर white flash / zoom blur।

### Style 5: Mini-Vlog / "Day in my life"
- **क्या:** छोटे-छोटे पलों (1–2 सेकंड) की कहानी, voiceover या text-on-screen, cozy म्यूज़िक।
- **किसके लिए:** रोज़मर्रा, कुकिंग, काम, स्टडी।
- **तकनीक:** ASMR आवाज़ें (कॉफ़ी, कीबोर्ड), गर्म रंग, हैंडराइटिंग-स्टाइल टेक्स्ट, सीरीज़ फ़ॉर्मेट (Part 1, 2...)।

### Style 6: Storytelling / Documentary
- **क्या:** कहानी कहने वाला voiceover, archive फ़ोटो पर धीमा ज़ूम (Ken Burns), मैप, टाइमलाइन, सस्पेंस म्यूज़िक।
- **किसके लिए:** इतिहास, सच्ची घटनाएँ, बिज़नेस केस-स्टडी, बायोग्राफ़ी।
- **तकनीक:** ठहराव (pause) का इस्तेमाल, कहानी में "cliffhanger" हर 1–2 मिनट पर।

### Style 7: Brainrot / Sensory-Overload (Split-screen)
- **क्या:** ऊपर मुख्य वीडियो, नीचे गेमप्ले/satisfying क्लिप, शब्द-दर-शब्द कैप्शन, लगातार हलचल।
- **किसके लिए:** कहानियाँ, Reddit-स्टाइल किस्से, पॉडकास्ट क्लिप्स (युवा दर्शक)।
- **ध्यान दें:** ध्यान खींचता है, पर ब्रांड/प्रीमियम छवि के लिए ठीक नहीं।

### Style 8: Podcast Clip Edit
- **क्या:** लंबे पॉडकास्ट से 30–60 सेकंड का सबसे दमदार हिस्सा; बोलने वाले पर ऑटो-फ़्रेमिंग, बड़े कैप्शन।
- **किसके लिए:** इंटरव्यू, पॉडकास्ट, लाइव स्ट्रीम।
- **तकनीक:** Whisper से ट्रांसक्रिप्ट → सबसे अच्छी लाइन चुनें → 9:16 crop → कैप्शन।

### Style 9: Clean Minimal / Aesthetic
- **क्या:** कम कट, बहुत साफ़ फ़्रेम, हल्के pastel/"clean girl" रंग, छोटा सुंदर फ़ॉन्ट, धीमा म्यूज़िक।
- **किसके लिए:** ब्यूटी, फ़ैशन, प्रोडक्ट, होम डेकोर, ब्रांड्स।
- **तकनीक:** कोई भारी effect नहीं; soft fade transitions; थोड़ा brightness और कम contrast।

### Style 10: Retro / Y2K / VHS
- **क्या:** पुराना कैमरा लुक: grain, faded रंग, VHS लाइनें, date stamp, 4:3 फ़्रेम।
- **किसके लिए:** nostalgia, म्यूज़िक, फ़ैशन, दोस्तों के व्लॉग।

### Style 11: Glitch / Hype Edit
- **क्या:** RGB split, shake, flash, fast zoom transitions, bass-boosted म्यूज़िक।
- **किसके लिए:** गेमिंग, स्पोर्ट्स, कार/बाइक, gym।
- **ध्यान दें:** कम मात्रा में, सिर्फ़ ड्रॉप/हाईलाइट पर।

### Style 12: Faceless / Stock + Voiceover
- **क्या:** चेहरा नहीं; स्टॉक/AI विज़ुअल + voiceover + बड़े कैप्शन।
- **किसके लिए:** फ़ैक्ट्स, मोटिवेशन, न्यूज़-सार, लिस्ट वीडियो।
- **स्रोत:** Wikimedia Commons, Openverse (free license; यहाँ से डाउनलोड allowed है)।

### Style 13: Tutorial / Screen-Recording
- **क्या:** स्क्रीन पर ज़ूम करके क्लिक दिखाना, cursor highlight, कोने में चेहरा (picture-in-picture)।
- **किसके लिए:** सॉफ़्टवेयर, ऐप, ऑनलाइन काम।

### Style 14: Transition-Heavy Reel
- **क्या:** हाथ/कपड़े/कैमरे की हलचल से "मैजिक" ट्रांज़िशन (match cut, whip pan, cover transition)।
- **किसके लिए:** आउटफ़िट बदलना, before/after, ट्रैवल।
- **तकनीक:** शूटिंग के समय ही प्लान करना पड़ता है: दोनों शॉट में एक ही दिशा में हलचल।

### Style 15: AI-Assisted / Generative
- **क्या:** AI से बैकग्राउंड बदलना, AI B-roll, ऑटो-कैप्शन, ऑटो-क्लिपिंग, AI voiceover।
- **2026 में:** बहुत आम; पर लोग अब "authentic" (असली, कम पॉलिश) कंटेंट को भी उतना ही पसंद करते हैं, तो AI को सहायक की तरह इस्तेमाल करें, पूरी तरह उस पर निर्भर नहीं।

### Style 16: Lo-fi / Authentic (कम पॉलिश)
- **क्या:** फ़ोन से शूट, बहुत कम एडिट, सीधी बात। 2026 का बड़ा ट्रेंड: भरोसा > प्रोडक्शन।
- **किसके लिए:** राय, पर्सनल कहानी, behind-the-scenes।
- **तकनीक:** सिर्फ़ jump cuts + कैप्शन + हल्का color correction।

---

## भाग 3: कौन-सी स्टाइल कब? (जल्दी चुनाव)

| आपका वीडियो | सबसे अच्छी स्टाइल |
|---|---|
| ड्रोन / ट्रैवल फ़ुटेज | 3 Cinematic + 4 Beat-sync |
| सलाह / जानकारी (चेहरे के साथ) | 2 Educational + 1 High-retention (हल्का) |
| रोज़मर्रा की ज़िंदगी | 5 Mini-vlog या 16 Lo-fi |
| कहानी / इतिहास | 6 Storytelling |
| लंबा इंटरव्यू | 8 Podcast clips |
| ब्रांड / प्रोडक्ट | 9 Clean minimal |
| गेमिंग / स्पोर्ट्स | 11 Glitch/Hype |
| बिना चेहरा | 12 Faceless |

**सुझाव:** 1–2 स्टाइल चुनकर उन्हें अपनी "signature" बनाएँ: एक ही फ़ॉन्ट, एक ही कलर लुक, एक ही कैप्शन स्टाइल, एक जैसा intro hook। यही पहचान बनाता है।

---

## भाग 4: FFmpeg रेसिपी (इस सेटअप में टेस्ट की हुई)

`in.mp4` की जगह अपनी फ़ाइल का नाम लिखें।

**16:9 → 9:16 (Reels/Shorts), पीछे blur बैकग्राउंड**
```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy vertical.mp4
```

**Punch-in zoom (1 से 2 सेकंड के बीच 120%)**
```bash
ffmpeg -i in.mp4 -vf "crop='if(between(t,1,2),iw/1.2,iw)':'if(between(t,1,2),ih/1.2,ih)',scale=1920:1080" zoom.mp4
```

**Cinematic टील-ऑरेंज लुक + vignette**
```bash
ffmpeg -i in.mp4 -vf "colorbalance=rs=-0.1:bs=0.1:rh=0.1:bh=-0.1,eq=contrast=1.1:saturation=1.15,vignette=PI/5" cinematic.mp4
```

**Letterbox (फ़िल्म जैसी काली पट्टियाँ)**
```bash
ffmpeg -i in.mp4 -vf "drawbox=x=0:y=0:w=iw:h=ih*0.12:color=black:t=fill,drawbox=x=0:y=ih*0.88:w=iw:h=ih*0.12:color=black:t=fill" letterbox.mp4
```

**Retro / Vintage लुक + film grain**
```bash
ffmpeg -i in.mp4 -vf "curves=preset=vintage,noise=alls=12:allf=t,vignette" retro.mp4
```

**Speed ramp (2x तेज़)**
```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" fast.mp4
```

**दो क्लिप के बीच fade transition** (`offset` = पहली क्लिप की लंबाई − 0.5)
```bash
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=3.5[v];[0:a][1:a]acrossfade=d=0.5[a]" -map "[v]" -map "[a]" joined.mp4
```
अन्य transitions: `wipeleft`, `slideup`, `circleopen`, `zoomin`, `dissolve`, `pixelize`।

**Glitch (RGB split) 1.0–1.2 सेकंड पर**
```bash
ffmpeg -i in.mp4 -vf "rgbashift=rh=-8:bh=8:enable='between(t,1,1.2)'" glitch.mp4
```

**बैकग्राउंड म्यूज़िक, बोलते समय अपने-आप धीमा (ducking)**
```bash
ffmpeg -i in.mp4 -i music.mp3 -filter_complex "[1:a]volume=0.6[m];[m][0:a]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[md];[0:a][md]amix=inputs=2:duration=first[a]" -map 0:v -map "[a]" -c:v copy with_music.mp4
```

**हिंदी कैप्शन बर्न करना (पीला, मोटा, काली outline)**
```bash
ffmpeg -i vertical.mp4 -vf "subtitles=subs.srt:force_style='FontName=Noto Sans Devanagari,FontSize=16,Bold=1,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,Outline=3,Alignment=2,MarginV=60'" captioned.mp4
```

**आवाज़ को सोशल मीडिया स्टैंडर्ड (-14 LUFS) पर लाना**
```bash
ffmpeg -i in.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:v copy final.mp4
```

**Whisper से हिंदी सबटाइटल (`subs.srt`) बनाना**: Python:
```python
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe("in.mp4", language="hi")
def ts(s): return f"{int(s//3600):02}:{int(s%3600//60):02}:{int(s%60):02},{int(s%1*1000):03}"
with open("subs.srt", "w") as f:
    for i, s in enumerate(segs, 1):
        f.write(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n\n")
```

---

## भाग 5: आगे का प्लान
1. अपना वीडियो Google Drive लिंक से भेजें (YouTube से यहाँ डाउनलोड नहीं होता)।
2. ऊपर की तालिका से 1–2 स्टाइल चुनें।
3. मैं उसी स्टाइल में एडिट करके दिखाऊँगा; फिर उसे आपका "signature template" बना देंगे।

### स्रोत (2026 ट्रेंड रिसर्च)
- [11 Editing Aesthetics Dominating Short-Form in 2026, Opus](https://www.opus.pro/blog/editing-aesthetics-dominating-short-form-2026)
- [Latest CapCut Editing Trends in 2026](https://www.capcut.com/help/latest-capcut-editing-trends)
- [Brainrot Edit Style Explained, Opus](https://www.opus.pro/blog/brainrot-edit-style)
- [Short-Form Video Trends Reshaping Creator Marketing in 2026](https://opus.pro/blog/short-form-video-trends-reshaping-creator-marketing-2026)
- [The State of Short-Form Video in 2026, Fluxnote](https://fluxnote.io/blog/state-of-short-form-video-2026)
- [Short-form video trends, ShortGenius](https://shortgenius.com/blog/short-form-video-trends)
- [Trending YouTube Shorts, Teleprompter](https://www.teleprompter.com/blog/trending-youtube-shorts)

(ये ज़्यादातर एडिटिंग-टूल कंपनियों के ब्लॉग हैं, इसलिए इनके आँकड़ों को अनुमान मानें।)
