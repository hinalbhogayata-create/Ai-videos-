# AI Videos: સિનેમેટિક વિડીયો સ્ટુડિયો

આ ઓટોમેટિક એડિટિંગ સિસ્ટમ છે. તમે ફૂટેજ અને ટેક્સ્ટ આપો, અને તે ટ્રેલર જેવો પ્રોફેશનલ વિડીયો બનાવે છે.

## આ સિસ્ટમ શું કરે છે

| ફીચર | વિગત |
|---|---|
| 🎵 સિનેમેટિક મ્યુઝિક | દરેક વિડીયો માટે નવું ઓરિજિનલ મ્યુઝિક બને છે, તેથી copyright-ની સમસ્યા નથી. શરૂઆતમાં પિયાનો અને પેડ, પછી taiko ડ્રમ અને riser, થોડી સેકન્ડની ચૂપકીદી, મોટો **HIT**, braam અને અંતે final impact. Mood: `epic`, `dark`, `emotional`, `heroic` |
| ✂️ બીટ પર કટ | શરૂઆતમાં દર બારે કટ, build-માં દર 2 બીટે, અને climax-માં દર બીટે. એટલે ગતિ ધીમે ધીમે વધે છે |
| 🔤 મોટા સિનેમેટિક ટેક્સ્ટ | 4 સ્ટાઈલ: `trailer`, `reveal`, `impact`, `endcard`. ગુજરાતી ટેક્સ્ટ પણ સાચી રીતે બને છે |
| 🎨 કલર ગ્રેડિંગ | `teal_orange`, `moody`, `warm_gold`, `cold_blue`, `bw`, `natural` |
| 🎬 ફિલ્મ લુક | ધીમું push-in, 2.39:1 letterbox, film grain, vignette, flash, anamorphic lens streak |
| 🔊 ઓડિયો | -14 LUFS (YouTube/Instagram સ્ટાન્ડર્ડ). વોઈસ-ઓવર બોલાય ત્યારે મ્યુઝિક આપોઆપ ધીમું થાય છે |
| 📐 ફોર્મેટ | `16:9` (YouTube), `9:16` (Reels/Shorts), `1:1`, `4:5`, `4k` |

## ઉપયોગ કેવી રીતે કરવો (સૌથી સરળ રીત)

1. તમારા વિડીયો ક્લિપ્સ **`Row videos/`** ફોલ્ડરમાં મૂકો, અથવા Google Drive પર મૂકીને Claude-ને ફાઈલનું નામ કહો.
2. Claude-ને ચેટમાં આટલું કહો:
   - કયું પ્લેટફોર્મ? (Reel / YouTube)
   - કેટલી લંબાઈ? (દા.ત. 30 સેકન્ડ)
   - કયા શબ્દો મોટા ટેક્સ્ટમાં આવવા જોઈએ? (ક્રમ પ્રમાણે)
   - Mood: epic / dark / emotional / heroic
   - અંતમાં બ્રાન્ડનું નામ અને tagline
3. Claude પ્રોજેક્ટ ફાઈલ બનાવીને વિડીયો રેન્ડર કરશે.

## ટેક્નિકલ: જાતે ચલાવવું

```bash
pip install -r requirements.txt     # ffmpeg પણ જરૂરી છે
python -m studio.render projects/demo.json
```

પ્રોજેક્ટ ફાઈલ (`projects/*.json`):

```json
{
  "format": "9:16",
  "duration": 30,
  "music": {"mode": "auto", "mood": "epic"},
  "footage": "Row videos",
  "grade": "teal_orange",
  "titles": [
    {"text": "Every great story", "sub": "begins here", "style": "trailer", "at": 1, "until": "build"},
    {"text": "મોટું વિચારો", "style": "reveal", "at": "build", "until": "climax-0.4"},
    {"text": "RISE", "style": "impact", "at": "climax", "until": "bar11"},
    {"text": "BRAND NAME", "sub": "tagline", "style": "endcard", "at": "end", "until": "end+5"}
  ]
}
```

- **સમય (`at` / `until`)**: સેકન્ડ (`3.5`), સેક્શન (`build`, `climax`, `end`), બાર (`bar6`), અથવા offset (`climax-0.4`). આ રીતે ટેક્સ્ટ હંમેશા મ્યુઝિકના બીટ સાથે આવે છે.
- **તમારું પોતાનું મ્યુઝિક**: `"music": {"file": "music/song.mp3"}` લખો. બીટ આપોઆપ શોધાઈ જશે.
- **વોઈસ-ઓવર**: `"voiceover": "vo.wav", "voiceover_at": 2.0`
- **ચોક્કસ ક્લિપ અને ક્રમ**: `"clips": [{"file": "a.mp4", "in": 4.2}, {"file": "b.mp4", "speed": 0.5}]`
- ફૂટેજ ન હોય તો એનિમેટેડ સિનેમેટિક બેકગ્રાઉન્ડ (smoke અને bokeh) વપરાય છે. Palette: `teal_amber`, `gold`, `crimson`, `blue`, `royal`

## ફાઈલો

```
studio/music.py        સિનેમેટિક મ્યુઝિક કમ્પોઝર
studio/beats.py        તમારા ગીતમાં બીટ શોધે છે
studio/text.py         મોટા એનિમેટેડ ટાઈટલ્સ
studio/backgrounds.py  એનિમેટેડ બેકગ્રાઉન્ડ
studio/render.py       મુખ્ય એડિટર (કટ, ગ્રેડ, કમ્પોઝિટ, ઓડિયો મિક્સ)
assets/fonts/          Cinzel, Bebas Neue, Anton, Montserrat, Noto Sans Gujarati, Hind Vadodara (OFL, કોમર્શિયલ ઉપયોગ માટે ફ્રી)
```
