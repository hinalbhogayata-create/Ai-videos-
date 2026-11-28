/*
 * bhrigu.js — भृगु सूत्र (महर्षि भृगु) अनुसार ग्रह-भाव फल
 * आधार: भृगु सूत्र, सिद्धनाथ शर्मा कृत "सिद्धप्रभाकरी" हिन्दी टीका सहित (अध्याय 1–8:
 * सूर्य, चन्द्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु-केतु — तन्वादि द्वादश भाव स्थित फल)।
 * पाठ मूल सूत्रों का स्वयं लिखा संक्षिप्त भावार्थ है — शब्दशः अनुवाद या टीका की प्रति नहीं।
 * प्रत्येक प्रविष्टि: [सूत्र-संख्या, हिन्दी, English]. राहु-केतु दोनों का फल एक ही अध्याय से।
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const DATA = {
"Sun": [
[
"1–21",
"आरोग्य, पित्त-प्रकृति, नेत्र-रोग की सम्भावना; मेधावी, सदाचारी, तीक्ष्ण बुद्धि, अल्पभाषी, प्रवास-प्रिय और सुखी; पुत्र-सुख कम। उच्च (मेष) में कीर्तिमान; बली ग्रह की दृष्टि हो तो विद्वान; नीच (तुला) में तेजस्वी पर दरिद्रता व नेत्र-दोष — शुभ दृष्टि हो तो दोष नहीं। सिंह राशि/नवांश में किसी स्थान का अधिपति; कर्क में ज्ञानी परन्तु फोड़े-फुंसी; मकर में हृदय-रोग; मीन में स्त्रीजन-सेवी। पापयुत होकर शत्रु/नीच राशि में हो तो तीसरे वर्ष ज्वर-पीड़ा।",
"Good health, pitta constitution, possible eye trouble; intelligent, well-behaved, sharp-minded, speaks little, fond of travel and happy; few sons. Exalted (Aries) — famous; aspected by a strong planet — learned; debilitated (Libra) — spirited but poor with eye defects, unless a benefic aspects. In Leo sign/navamsa — head of some place; in Cancer — wise but prone to boils; in Capricorn — heart trouble; in Pisces — serves women. With malefics in an enemy/debilitation sign — fever in the 3rd year."
],
[
"22–32",
"मुख-रोग; 25वें वर्ष राजदण्ड से धन-हानि (उच्च/स्वराशि में यह दोष नहीं)। पापयुत हो तो नेत्र-रोग और अल्प विद्या; शुभ-दृष्ट हो तो धनवान और दोष दूर, नेत्र-सुख। उच्च/स्वराशि में बहुत धन। बुध साथ हो तो रुक-रुककर बोलना। धनेश उच्च हो तो वाक्पटु, शास्त्रज्ञ, ज्ञानी और राजयोग।",
"Mouth ailments; loss of wealth by state penalty in the 25th year (not if exalted/own sign). With malefics — eye disease and little learning; with a benefic aspect — wealthy, faults removed, good eyesight. Exalted/own sign — great wealth. With Mercury — halting speech. If the 2nd lord is exalted — eloquent, learned in shastras, wise, with Raja Yoga."
],
[
"33–42",
"बुद्धिमान; छोटे भाई का अभाव या बड़े भाई को कष्ट; 5वें (या 4/8/12वें) वर्ष कुछ शरीर-पीड़ा। पराक्रमी, युद्ध में शूर, कीर्तिमान और अपने धन का भोगी। पापयुत हो तो कठोर कर्म; शुभयुत हो तो भाइयों की वृद्धि; तृतीयेश बली हो तो भाई दीर्घायु; पाप-दृष्टि से भाई को हानि; शुभ-दृष्टि से धनवान और सुखी।",
"Intelligent; no younger brother or trouble to an elder one; some bodily trouble in the 5th (or 4th/8th/12th) year. Valiant, brave in battle, famous, enjoys his own wealth. With malefics — harsh deeds; with benefics — siblings prosper; strong 3rd lord — long-lived brothers; malefic aspect — loss of a brother; benefic aspect — wealthy and happy."
],
[
"43–50",
"किसी अंग में कमी, अहंकारी, लोगों से विरोध, उष्ण शरीर और मानसिक पीड़ा; 32वें वर्ष से सब कार्य अनुकूल — प्रतिष्ठा, पद, ज्ञान और शौर्य। धन-धान्य कम। चतुर्थेश बली होकर स्वराशि/केन्द्र/त्रिकोण में हो तो उत्तम वाहन (पालकी); पापयुत हो तो साधारण वाहन, अपना घर न होना और दूसरे के घर में वास।",
"Some bodily defect, proud, at odds with people, hot body and mental distress; from the 32nd year all works turn favourable — prestige, position, knowledge and valour. Little wealth and grain. A strong 4th lord in its own sign/kendra/trikona gives fine conveyances; with malefics — ordinary vehicles, no house of one's own, living in another's house."
],
[
"51–58",
"धन की कमी, स्थूल शरीर; 7वें वर्ष पिता को अरिष्ट; मेधावी, बुद्धिमान, अल्प संतान। पंचमेश बली हो तो संतान-सिद्धि। राहु-केतु साथ हों तो सर्प-शाप से संतान-हानि; मंगल साथ हो तो शत्रु के कारण। शुभ-दृष्टि/युति हो तो दोष नहीं।",
"Lack of money, stout body; danger to the father in the 7th year; intelligent, few children. A strong 5th lord gives children. With Rahu–Ketu — loss of children by a serpent curse; with Mars — through enemies. A benefic aspect/conjunction removes the fault."
],
[
"59–68",
"शत्रु-वृद्धि के साथ धन-धान्य की वृद्धि; 20वें वर्ष नेत्र-रोग (शुभ-दृष्टि हो तो नहीं); मंत्रज्ञ, यशस्वी, चिन्तनशील, उष्ण शरीर। षष्ठेश शुभयुत हो तो आरोग्य; षष्ठेश निर्बल हो तो शत्रु-नाश, परन्तु पिता निर्बल।",
"Enemies increase but so do wealth and grain; eye disease in the 20th year (not with a benefic aspect); knows mantras, famous, thoughtful, hot body. 6th lord with benefics — good health; a weak 6th lord destroys enemies but the father is weak."
],
[
"69–74",
"विवाह में विलम्ब, जीवनसाथी से विरोध, दो विवाह की सम्भावना; 25वें वर्ष परदेश-गमन; कार्यों में बाधक बुद्धि। सूर्य स्वराशि (सिंह) में बली हो तो एक ही विवाह; शत्रु/नीच दृष्टि या पापयुत हो तो दाम्पत्य में अधिक उलझनें।",
"Delayed marriage, opposition from the spouse, possibility of two marriages; travel abroad in the 25th year; a mind that spoils undertakings. Strong in its own sign Leo — one marriage; with enemy/debilitated aspects or malefics — more marital complications."
],
[
"75–82",
"अल्प संतान, नेत्र-रोग; 10वें वर्ष सिर में चोट (शुभ-दृष्टि हो तो नहीं); अल्प धन, पशु-हानि, रोग-प्रवृत्ति पर प्रसिद्ध। अष्टमेश बली हो तो इच्छित भूमि; सूर्य उच्च/स्वराशि में हो तो दीर्घायु।",
"Few children, eye trouble; a head injury in the 10th year (not with a benefic aspect); little wealth, loss of cattle, prone to illness yet well known. A strong 8th lord gives desired land; Sun exalted/in own sign gives long life."
],
[
"83–87",
"सूर्य-शिव आदि देवों का सेवक, पुण्यात्मा, स्त्री-पुत्र युक्त; भाग्य कुछ कम और पिता से मतभेद। उच्च/स्वराशि में पिता दीर्घायु, स्वयं धनाढ्य, भक्त और गुरु-देव-भक्त। नीच/पाप-राशि में पाप-दृष्ट हो तो पिता को कष्ट; शुभ-दृष्टि से पिता दीर्घायु।",
"Devoted to Surya, Shiva and the gods, virtuous, blessed with wife and sons; fortune somewhat less and differences with the father. Exalted/own sign — long-lived father, rich, devout. Debilitated or in a malefic sign with malefic aspects — trouble to the father; benefic aspect — long-lived father."
],
[
"88–95",
"18वें वर्ष विद्या के प्रताप से प्रसिद्धि और धन; तीन ग्रहों की दृष्टि हो तो राजप्रिय, सत्कर्मी, शूर और विख्यात। उच्च/स्वराशि में बली और यशस्वी — जलाशय, गौ, ग्राम, देव-प्रतिष्ठा आदि पुण्य-कार्यों से ख्याति। पाप-राशि/पापयुत हो तो कार्यों में विघ्न और अनुचित आचरण।",
"Fame through learning and gain of wealth in the 18th year; aspected by three planets — dear to the king, of good deeds, brave and renowned. Exalted/own sign — strong and famous through public works (tanks, cows, villages, temples). In a malefic sign or with malefics — obstacles in work and improper conduct."
],
[
"96–102",
"अत्यधिक धन-धान्य; 25वें वर्ष वाहन-प्राप्ति; वाणी और चतुराई से धनोपार्जन; सेवकों से प्रेम; तीव्र ज्वर का भय। पापयुत हो तो अधिक व्यय और वाहन-हीनता; उच्च/स्वराशि में अत्यन्त बली; चतुर्थेश साथ हो तो अनेक स्थानों में अधिकार।",
"Abundant wealth and grain; a vehicle in the 25th year; earns through speech and cleverness; affectionate to servants; risk of severe fever. With malefics — heavy spending and no vehicle; exalted/own sign — very strong; with the 4th lord — authority in many places."
],
[
"103–110",
"36वें वर्ष गुल्म (उदर) रोग; अनुचित स्थानों में व्यय, धन-हानि, परदेश-वास। द्वादशेश बली हो तो देव-सिद्धि और शय्या-सुख; पापयुत हो तो अनुचित व्यय और सुख-हीनता; षष्ठेश साथ हो तो त्वचा-रोग (कुष्ठ) का भय — शुभ-दृष्टि से निवारण।",
"Abdominal disease (gulma) in the 36th year; spending in wrong places, loss of wealth, living abroad. A strong 12th lord gives spiritual attainment and bed comforts; with malefics — wasteful spending and lack of comfort; with the 6th lord — fear of skin disease (leprosy), removed by a benefic aspect."
]
],
"Moon": [
[
"1–8",
"मेष, वृषभ या कर्क में लग्नस्थ चन्द्र हो तो शास्त्रज्ञ, धनी, सुखी, लोगों का रक्षक, मधुरभाषी, कोमल शरीर और तेजस्वी। शुभ-दृष्ट चन्द्र बली — बुद्धिमान, नीरोग और धनवान। लग्नेश निर्बल हो तो रोग; लग्नेश शुभ-दृष्ट हो तो आरोग्य।",
"Moon in the Lagna in Aries, Taurus or Cancer: learned, wealthy, happy, a protector of people, sweet-spoken, tender-bodied and radiant. Aspected by benefics it is strong — intelligent, healthy and rich. A weak Lagna lord gives illness; a Lagna lord aspected by benefics gives health."
],
[
"9–14",
"सुन्दर, अत्यन्त तेजस्वी, धनी पर अल्प-सन्तोषी; 18वें वर्ष राजद्वार में अधिकार (सेना-नायक तुल्य)। पापयुत हो तो विद्या में कमी; शुभयुत हो तो अनेक विद्याएँ और धनाढ्यता; अकेला पूर्ण चन्द्र हो तो पूर्ण धन और बहु-विद्या।",
"Handsome, very radiant, rich but rarely content; authority at the royal court (like a commander) in the 18th year. With malefics — less learning; with benefics — many branches of learning and great wealth; a lone full Moon gives full wealth and varied learning."
],
[
"15–18",
"बहन का सुख, वात-प्रकृति; अन्न व भाग्य में कमी; 24वें वर्ष किसी अपराध पर राजदण्ड से धन-हानि; पशुधन में कमी; चुगली की प्रवृत्ति; सगे भाइयों की वृद्धि।",
"Happiness from a sister, vata constitution; less food and fortune; loss of money by a state penalty in the 24th year; few cattle; a tendency to gossip; brothers prosper."
],
[
"19–24",
"राजयोग, वाहन (अश्व) और दुग्ध-धन की वृद्धि, धन-धान्य युक्त, सुखी; माता को रोग। पूर्ण चन्द्र स्वराशि (कर्क) में हो तो माता दीर्घायु; क्षीण चन्द्र पापयुत हो तो माता को कष्ट और वाहन-हीनता। बली ग्रह साथ हों तो वाहन; चतुर्थेश उच्च हो तो अनेक वाहन।",
"Raja yoga, vehicles (horses) and abundant milk, wealth and grain, happy; mother may be ill. A full Moon in its own sign Cancer — long-lived mother; a waning Moon with malefics — trouble to the mother and no vehicle. With strong planets — vehicles; an exalted 4th lord — many vehicles."
],
[
"25–32",
"स्त्री व देव-आराधना में सिद्ध, सुन्दर जीवनसाथी (कभी क्रोधी); पशु-लाभ, सत्यवादी, परिश्रमी, एक पुत्र। शुभयुत/दृष्ट हो तो दयालु; पापयुत हो तो कठोर स्वभाव। पूर्ण चन्द्र हो तो बली, अन्नदाता, विद्वानों के आशीर्वाद से ऐश्वर्य, सत्कर्मी, भाग्यवान, राजयोग और ज्ञानी।",
"Successful in worship, a beautiful (sometimes short-tempered) spouse; gains from cattle, truthful, hard-working, one son. With benefics — compassionate; with malefics — harsh nature. A full Moon here gives strength, generosity with food, prosperity through the blessings of the learned, good deeds, fortune, Raja yoga and wisdom."
],
[
"33–40",
"शारीरिक दुर्बलता व आर्थिक तंगी; 36वें वर्ष अनुचित सम्बन्ध की प्रवृत्ति; पापयुत हो तो पाप-कर्म; राहु-केतु साथ हों तो धन-हानि; प्रबल शत्रु से विवाद, मन्दाग्नि, जल-भय। क्षीण चन्द्र में पूर्ण फल; शुभयुत हो तो बली और नीरोग।",
"Weak body and financial strain; a tendency to improper relations in the 36th year; with malefics — sinful deeds; with Rahu–Ketu — loss of money; quarrels with strong enemies, weak digestion, fear of water. A waning Moon gives the full effect; with benefics — strong and free from disease."
],
[
"41–46",
"मधुरभाषी; 32वें वर्ष विवाह; जीवनसाथी के कारण कष्ट/शस्त्र-पीड़ा का भय; राजकृपा से लाभ। सप्तमेश बली हो तो दो विवाह; क्षीण चन्द्र हो तो जीवनसाथी को कष्ट; पूर्ण, बली या उच्च (वृषभ) चन्द्र हो तो एक ही विवाह; भोग-प्रिय।",
"Sweet-spoken; marriage in the 32nd year; trouble or injury connected with the spouse; gains through royal favour. A strong 7th lord — two marriages; a waning Moon — trouble to the spouse; a full, strong or exalted (Taurus) Moon — one marriage; fond of pleasures."
],
[
"क–ग",
"वाहन कम, जलाशय आदि से भय; जीवनसाथी के कारण बन्धुओं से दूरी। स्वराशि/उच्च चन्द्र हो तो दीर्घायु, क्षीण हो तो मध्यम आयु।",
"Few vehicles, danger from tanks/wells; distance from relatives because of the spouse. Moon in its own/exaltation sign — long life; waning — medium life."
],
[
"47–53",
"बहुश्रुत, धर्मात्मा, घाट-ग्राम आदि पुण्य-निर्माण करने वाला; भाग्यशाली संतान। पूर्ण चन्द्र बलियुत हो तो बड़ा भाग्यशाली और पिता दीर्घायु; पापयुत/पाप-राशि में भाग्य-हीनता और माता-पिता को कष्ट।",
"Widely learned, righteous, builds ghats and villages as merit; fortunate children. A full Moon with strong planets — very fortunate and a long-lived father; with malefics/in a malefic sign — lack of fortune and trouble to the parents."
],
[
"54–60",
"विद्वान, अत्यन्त बुद्धिमान, सत्कर्म में लीन, यशस्वी और दयालु; पापयुत हो तो 27वें वर्ष अनुचित सम्बन्ध से लोक-विरोध। दशमेश बली हो तो अत्यन्त पवित्र कर्म; पाप-दृष्ट हो तो अनुचित कर्म और कार्यों में विघ्न।",
"Learned, highly intelligent, devoted to good deeds, famous and kind; with malefics — public hostility through improper relations in the 27th year. A strong 10th lord — very pious deeds; malefic aspects — wrong deeds and obstacles."
],
[
"61–69",
"बहुश्रुत, पुत्रवान, परोपकारी और गुणी; 50वें वर्ष पुत्र-ऋण से मुक्ति (पुत्र-सुख)। लाभेश निर्बल हो तो अधिक व्यय, बलियुत हो तो बहुत लाभ; भूमिगत वस्तु/धन का लाभ। शुक्र साथ हो तो उत्तम वाहन और अनेक विद्याएँ; अनेक लोगों का पालक और बड़ा भाग्यशाली।",
"Widely learned, has sons, benevolent and virtuous; freedom from the debt to sons (joy of a son) in the 50th year. A weak 11th lord — heavy spending; strong — great gains; gain of buried treasure. With Venus — fine conveyances and varied learning; supports many and is very fortunate."
],
[
"70–71",
"अनुचित भोजन, अनुचित स्थानों में व्यय, क्रोधवश कलह; जीवनसाथी को रोग, अन्न-कष्ट। शुभयुत हो तो पण्डित और दयालु; पाप/शत्रु ग्रह साथ हों तो अधोगति; शुभ-मित्र ग्रह साथ हों तो उत्तम लोक की प्राप्ति।",
"Poor food, spending in wrong places, quarrels from anger; illness to the spouse, scarcity of food. With benefics — learned and kind; with malefic/enemy planets — a downward course; with benefic friends — attainment of higher worlds."
]
],
"Mars": [
[
"1–9",
"शरीर पर घाव/चिह्न; सुदृढ़ शरीर, तेजस्वी, बली, क्रोधी, चंचल, धनवान; विविध रोगों की प्रवृत्ति। उच्च (मकर)/स्वराशि (मेष, वृश्चिक) में आरोग्य, पुष्ट शरीर, राज-सम्मान, यश और दीर्घायु; उच्च में धनाढ्य, विद्वान, नेत्र-सुख। पाप/शत्रु ग्रह साथ हों तो आयु-भय, अल्प संतान, वात-शूल; पाप-राशि/दृष्टि में नेत्र-रोग।",
"Wound or mark on the body; sturdy, radiant, strong, short-tempered, restless, wealthy; prone to various ailments. Exalted (Capricorn)/own sign (Aries, Scorpio) — health, a robust body, royal honour, fame and long life; exalted — rich, learned, good eyesight. With malefic/enemy planets — danger to longevity, few children, colic; in a malefic sign or aspect — eye disease."
],
[
"10–15",
"विद्या में कमी पर धन-लाभ; षष्ठेश साथ हो तो नेत्र-रोग (शुभ-दृष्टि से निवारण)। उच्च/स्वराशि में विद्वान और नेत्र-सुख; पापयुत/पाप-दृष्ट हो तो नेत्र-रोग।",
"Less learning but gain of wealth; with the 6th lord — eye disease (removed by a benefic aspect). Exalted/own sign — learned with good eyesight; with malefics or their aspect — eye disease."
],
[
"16–25",
"दाम्पत्य में निष्ठा की चिन्ता (शुभ-दृष्टि हो तो नहीं); छोटे भाई का अभाव, धन की कमी; राहु-केतु साथ हों तो अनुचित सम्बन्ध व भाई से कपट; पाप-दृष्ट हो तो भाई को हानि। उच्च/स्वराशि में शुभयुत हो तो भाई दीर्घायु, स्वयं गम्भीर, प्रतापी और युद्ध में शूरवीर; मित्र-राशि में धैर्यवान।",
"Concern about fidelity in marriage (not with a benefic aspect); no younger brother, lack of money; with Rahu–Ketu — improper relations and deceit towards a brother; malefic aspect — harm to a brother. Exalted/own sign with benefics — long-lived brothers, oneself grave, glorious and brave in battle; in a friend's sign — patient."
],
[
"26–33",
"घर में कलह; 8वें वर्ष पिता को अरिष्ट, माता को रोग; घर व धन-धान्य में कमी, पुराने घर में वास। उच्च/स्वराशि/शुभयुत/मित्र-राशि में वाहन, घर और माता दीर्घायु; नीच (कर्क) या अष्टमेश के साथ हो तो माता को कष्ट; भाई-कुटुम्ब से विरोध, स्वदेश-त्याग।",
"Domestic quarrels; danger to the father in the 8th year and illness to the mother; lack of house and grain, living in an old house. Exalted/own sign, with benefics or in a friendly sign — vehicles, house and a long-lived mother; debilitated (Cancer) or with the 8th lord — trouble to the mother; opposition from siblings and family, leaving one's homeland."
],
[
"34–45",
"धन की कमी, संतान-चिन्ता, उग्र स्वभाव; 6वें वर्ष शस्त्र से कष्ट; ज्ञानी, तीक्ष्ण बुद्धि। उच्च/स्वराशि में संतान-वृद्धि, अन्नदान में कुशल, राज्य-अधिकार पर शत्रु-पीड़ा; पापयुत/पाप-राशि में संतान को कष्ट और बुद्धि-भ्रम से रोग; दत्तक संतान का योग।",
"Lack of money, worry about children, fierce nature; injury by a weapon in the 6th year; knowledgeable with a sharp intellect. Exalted/own sign — more children, generous with food, authority in the state but trouble from enemies; with malefics/in a malefic sign — trouble to children and illness from confusion; adoption is possible."
],
[
"46–53",
"प्रसिद्ध, हर कार्य में समर्थ, शत्रु-नाशक, पुत्रवान; 27वें वर्ष विवाह या वाहन-प्राप्ति। पाप-राशि/पापयुत हो तो भी पूर्ण फल पर वात-शूल; बुध की राशि (मिथुन/कन्या) में त्वचा-रोग का भय — शुभ-दृष्टि से निवारण।",
"Famous, capable in every task, destroyer of enemies, blessed with sons; marriage or a vehicle in the 27th year. Even in a malefic sign or with malefics the results hold, but with colic; in Mercury's signs (Gemini/Virgo) — fear of skin disease, removed by a benefic aspect."
],
[
"54–65",
"जीवनसाथी को रोग; पाप-राशि या स्वराशि में हो तो जीवनसाथी को कष्ट और परदेश-भ्रमण। पाप-राशि/दृष्टि में चरित्र-दोष और व्यसन (मद्य) की प्रवृत्ति; शनि/केतु के साथ आचरण-दोष बढ़ते हैं; शत्रु ग्रह साथ हों तो दाम्पत्य में बार-बार कष्ट। शुभ-दृष्टि हो तो ये अशुभ फल नहीं होते।",
"Illness to the spouse; in a malefic or its own sign — trouble to the spouse and wandering abroad. In a malefic sign/aspect — moral lapses and a tendency to addiction (liquor); with Saturn/Ketu these faults grow; with enemy planets — repeated marital trouble. A benefic aspect prevents these ill effects."
],
[
"66–71",
"नेत्र-रोग, आयु पर संकट, पिता को अरिष्ट, मूत्र-मल सम्बन्धी रोग, अल्प संतान, वात-शूल; जीवनसाथी का सुख। शुभयुत हो तो नीरोग, दीर्घायु और परिवार-वृद्धि; पाप-राशि/दृष्टि में वात-क्षय आदि रोग और मध्यम आयु; अष्टमेश बली हो तो पूर्ण आयु।",
"Eye disease, danger to longevity, danger to the father, urinary/excretory ailments, few children, colic; happiness from the spouse. With benefics — healthy, long-lived, the family grows; in a malefic sign/aspect — wasting diseases and medium life; a strong 8th lord — full life span."
],
[
"72–74",
"पिता को अरिष्ट और भाग्य में कमी। उच्च/स्वराशि में भी आचरण-दोष (गुरु-मर्यादा भंग) से सावधान।",
"Danger to the father and lack of fortune. Even when exalted/in its own sign, guard against moral lapses (breaching a teacher's honour)."
],
[
"75–85",
"लोक-प्रिय; 18वें वर्ष धन-संग्रह में समर्थ; कीर्ति-प्रतिष्ठा, सब कार्यों में समर्थ, पुष्ट शरीर। दशमेश बली हो तो भाई दीर्घायु, बड़ा भाग्यशाली, ईश्वर-ध्यानी और गुरु-सेवी; शुभयुत/शुभ-राशि में कार्य-सिद्धि; पापयुत में विघ्न व अनुचित कर्म। नवमेश-दशमेश के साथ राजा/युवराज तुल्य पद; गुरु साथ हो तो गज-वाहन, भूमि-समृद्धि और महाभाग्य।",
"Popular; able to accumulate wealth in the 18th year; fame and prestige, capable in all tasks, a robust body. A strong 10th lord — long-lived brothers, very fortunate, meditative and serving the guru; with benefics/in a benefic sign — success; with malefics — obstacles and wrong deeds. With the 9th and 10th lords — a royal or princely position; with Jupiter — elephant-like conveyances, rich in land, great fortune."
],
[
"86–89",
"अनेक कार्यों का कर्ता, धनाढ्य और गुणों से शीघ्र लाभ। लाभेश साथ हो तो राज्य-स्वामित्व; दो शुभ ग्रह साथ हों तो महाराज्य; भाई धनवान।",
"Does many works, rich and gains quickly by merit. With the 11th lord — ownership of a realm; with two benefics — a great realm; brothers are wealthy."
],
[
"90–91",
"धन की कमी और वात-पित्त रोग; पापयुत हो तो पाखण्ड की प्रवृत्ति।",
"Lack of money and vata–pitta ailments; with malefics — a tendency to hypocrisy."
]
],
"Mercury": [
[
"1–17",
"विद्वान, बहुश्रुत, अनेक देशों में भ्रमण, मंत्र-विद्या में समर्थ, मधुरभाषी, क्षमाशील और दयालु; 27वें वर्ष तीर्थयात्रा, बहुत लाभ और अनेक विद्याएँ; 17वें वर्ष भाइयों में कलह। पापयुत/पाप-राशि में पित्त-पाण्डु रोग; शुभयुत/शुभ-राशि में आरोग्य, स्वर्ण-सी कान्ति, ज्योतिष-ज्ञान। उच्च/स्वराशि में भाइयों का सुख और उत्तम गति; नीच (मीन)/पाप-दृष्ट में अधोगति। शुभयुत हो तो निश्चय ही धन-धान्य, धार्मिक बुद्धि, गणित-तर्क-शस्त्र विद्या और सुदृढ़ शरीर।",
"Learned, widely read, travels many lands, skilled in mantras, sweet-spoken, forgiving and kind; pilgrimage, great gains and many skills in the 27th year; quarrels among brothers in the 17th year. With malefics/in a malefic sign — bile and anaemic ailments; with benefics/in a benefic sign — health, a golden complexion, knowledge of astrology. Exalted/own sign — happiness from brothers and a good destiny; debilitated (Pisces) or aspected by malefics — a lower course. With benefics — certainly wealth and grain, a religious mind, mastery of mathematics, logic and arms, and a sturdy body."
],
[
"18–24",
"संतान-वृद्धि, वाक्पटु, वेद-शास्त्रज्ञ, संकल्प से कार्य-सिद्धि, धनी और गुणी; 15वें वर्ष अनेक विद्याएँ और विद्या से लाभ। पापयुत/शत्रु/नीच राशि में विद्या-हीनता और वात-रोग; शुभयुत/दृष्ट हो तो धनाढ्य और विद्वान; गुरु साथ/दृष्ट हो तो गणित में निपुण।",
"More children, eloquent, knows the Vedas and shastras, accomplishes what he resolves, rich and virtuous; varied learning and gains from it in the 15th year. With malefics/in an enemy or debilitation sign — lack of learning and wind ailments; with benefics — rich and learned; with or aspected by Jupiter — expert in mathematics."
],
[
"25–31",
"भाई-बहनों से युक्त और अत्यन्त सुखी; 15वें वर्ष स्थान व संतान-लाभ, धन-लाभ, उत्तम गुण। तृतीयेश बली हो तो गम्भीर, दीर्घायु और भाई दीर्घायु; निर्बल हो तो भाइयों को पीड़ा और भीरुता।",
"Blessed with siblings and very happy; gains of position, children and money in the 15th year, good qualities. A strong 3rd lord — serious, long-lived, with long-lived brothers; a weak one — trouble to brothers and timidity."
],
[
"32–37",
"गम्भीर, विशाल नेत्र, माता-पिता का सुख, ज्ञानी और सुखी; 16वें वर्ष अनेक वाहन। गुरु, शुक्र, शनि साथ हों तो अनेक वाहन; चतुर्थेश बली हो तो उत्तम वाहन; राहु-केतु-शनि साथ हों तो वाहन व स्थान-सुख में कमी और कुटुम्ब से विरोध।",
"Serious, large eyes, happiness from parents, wise and content; many vehicles in the 16th year. With Jupiter, Venus, Saturn — many vehicles; a strong 4th lord — fine conveyances; with Rahu, Ketu, Saturn — lack of vehicles and home comforts, and opposition to the family."
],
[
"38–40",
"मामा को रोग; माता का सुख, संतान-सुख में विघ्न, बुद्धिमान और मधुरभाषी। पंचमेश पापयुत/निर्बल हो तो संतान-कष्ट या दत्तक संतान; मंत्रज्ञ।",
"Illness to the maternal uncle; happiness from the mother, obstacles to children, intelligent and sweet-spoken. A 5th lord with malefics or weak — trouble to children or adoption; knows mantras."
],
[
"41–47",
"राज-पूज्य, विद्या में विघ्न, चतुर और विवाद में प्रबल; 30वें वर्ष राजकृपा; लेखन में दक्ष। मंगल की राशि (मेष/वृश्चिक) में त्वचा-रोग; शनि-राहु-केतु साथ हों तो वात-शूल व जाति-विरोध; षष्ठेश बली हो तो जाति में प्रबल; शत्रु/नीच राशि में कुटुम्ब-हानि।",
"Honoured by rulers, obstacles in studies, clever and strong in disputes; royal favour in the 30th year; skilled at writing. In Mars's signs (Aries/Scorpio) — skin disease; with Saturn, Rahu, Ketu — colic and clan disputes; a strong 6th lord — powerful in one's community; in an enemy/debilitation sign — loss within the family."
],
[
"48–56",
"माता का सुख, वाहन, धर्मज्ञ, निर्मल व उदार बुद्धि, चारों दिशाओं में कीर्ति, राज-पूज्य; शुभयुत हो तो 24वें वर्ष उत्तम वाहन; जीवनसाथी के अनुकूल। सप्तमेश बली हो तो एक ही विवाह; निर्बल/पापयुत या पाप-राशि में मंगल-युत हो तो जीवनसाथी को कष्ट।",
"Happiness from the mother, vehicles, knows dharma, a pure and generous mind, fame in all directions, honoured by rulers; with benefics — a fine conveyance in the 24th year; agreeable to the spouse. A strong 7th lord — one marriage; a weak or afflicted one, or with Mars in a malefic sign — trouble to the spouse."
],
[
"57–63",
"दीर्घायु और अनेक स्थानों का स्वामी; अनेक संतान; 25वें वर्ष प्रतिष्ठा और यश। अष्टमेश बली हो तो पूर्ण आयु; शत्रु/नीच राशि या पापयुत हो तो आयु-भय; उच्च/स्वराशि या शुभयुत हो तो पूर्ण आयु।",
"Long-lived and master of many places; many children; prestige and fame in the 25th year. A strong 8th lord — full life; in an enemy/debilitation sign or with malefics — danger to longevity; exalted/own sign or with benefics — full life."
],
[
"64–66",
"बहु-संतान, वेद-शास्त्र में निपुण, संगीत-प्रेमी, चतुर, धर्मात्मा, तेजस्वी, अत्यन्त लाभ; पिता दीर्घायु; ईश्वर-भक्ति, ध्यान और भजन की प्रवृत्ति।",
"Many children, expert in Vedas and shastras, fond of music, clever, righteous, radiant, great gains; a long-lived father; inclined to devotion, meditation and bhajan."
],
[
"67–70",
"पवित्र कार्य सिद्ध करने वाला, गम्भीर, अतुल कीर्ति, बहुमुखी चित्त; 28वें वर्ष नेत्र-रोग। उच्च/स्वराशि या गुरु-युत हो तो यज्ञ आदि पवित्र कर्म; शत्रु-राशि में पापयुत हो तो अनुचित आचरण।",
"Accomplishes sacred works, serious, of matchless fame, many-sided mind; eye disease in the 28th year. Exalted/own sign or with Jupiter — performs yajnas and sacred rites; with malefics in an enemy's sign — improper conduct."
],
[
"71–75",
"अनेक मंगल-कार्य और अनेक प्रकार से धन; 19वें वर्ष के बाद स्थान, संतान और धन; दयालु। पाप-राशि/पापयुत हो तो अनुचित कर्म से धन-हानि; उच्च/स्वराशि में शुभ कार्यों से लाभ।",
"Many auspicious events and wealth from many sources; position, children and money after the 19th year; kind. In a malefic sign/with malefics — loss of money through wrong deeds; exalted/own sign — gains through good works."
],
[
"76–81",
"ज्ञानी और दानशील; पापयुत हो तो चंचल चित्त और राजा-जनता से विरोध; शुभयुत हो तो धर्म-कार्यों में व्यय, विद्या में कमी।",
"Wise and generous in giving; with malefics — a fickle mind and enmity with rulers and people; with benefics — spending on dharma, less learning."
]
],
"Jupiter": [
[
"1–6",
"स्वराशि (धनु/मीन) में व्याकरण आदि शास्त्रों का अधिकारी, वेदज्ञ, अनेक संतान, सुखी, दीर्घायु और ज्ञानी; उच्च (कर्क) में पूर्ण फल; 16वें वर्ष महान राजयोग। शत्रु/नीच/पाप राशि में या पापयुत हो तो अनुचित कर्म, चंचल मन, मध्यम आयु, संतान-कष्ट, स्वजनों से दूरी, कृतघ्नता और अहंकार।",
"In its own sign (Sagittarius/Pisces) — master of grammar and shastras, versed in the Vedas, many children, happy, long-lived and wise; exalted (Cancer) — full results; a great Raja yoga in the 16th year. In an enemy/debilitation/malefic sign or with malefics — improper deeds, a fickle mind, medium life, trouble with children, distance from one's own people, ingratitude and pride."
],
[
"7–12",
"धनी, बुद्धिमान, मधुरभाषी; 16वें वर्ष धन-धान्य की बड़ी वृद्धि और प्रताप। उच्च/स्वराशि में महाधनी; पापयुत हो तो विद्या में विघ्न और असत्य-कपट की प्रवृत्ति; नीच (मकर) में पापयुत हो तो व्यसन, कुटुम्ब-हानि और संतान-कष्ट।",
"Rich, intelligent, sweet-spoken; a big rise in wealth and influence in the 16th year. Exalted/own sign — very rich; with malefics — obstacles in studies and a tendency to lies and deceit; debilitated (Capricorn) with malefics — addictions, harm to the family and trouble with children."
],
[
"13–18",
"लोभ की प्रवृत्ति, भाइयों की वृद्धि, चतुर, संकल्प से कार्य-सिद्धि। तृतीयेश बली हो तो भाई दीर्घायु; पापयुत हो तो भाइयों को हानि, असन्तोष, जड़ता और दरिद्रता।",
"A greedy streak, siblings prosper, clever, accomplishes what he resolves. A strong 3rd lord — long-lived brothers; with malefics — harm to brothers, discontent, dullness and poverty."
],
[
"19–23",
"सुखी, स्थान-सम्पन्न, बुद्धिमान, दुग्ध-धन की वृद्धि, शुद्ध चित्त और पवित्र बुद्धि। चतुर्थेश बली या शुक्र-चन्द्र युत/शुभ वर्ग में हो तो उत्तम वाहन, अनेक स्थान और बड़ा घर; चतुर्थेश पापयुत/दृष्ट हो तो घर-वाहन में कमी, दूसरे के घर वास और माता को कष्ट।",
"Happy, well established, intelligent, plenty of milk, a pure heart and a sacred mind. A strong 4th lord, or with Venus/Moon or in benefic vargas — fine conveyances, many places and a large house; a 4th lord with or aspected by malefics — lack of house and vehicles, living in another's house and trouble to the mother."
],
[
"24–31",
"चतुर बुद्धि, विशाल नेत्र, वाक्पटु, तेजस्वी, अन्नदान-प्रेमी, कुटुम्ब-प्रिय; 18वें वर्ष राजद्वार से अधिकार (सेना-नायक तुल्य) और संतान-समृद्धि। पंचमेश पाप/शत्रु/नीच राशि में हो तो संतान-कष्ट या एक ही संतान; राज्य-सम्बन्धी कारणों से व्यय; राहु-केतु साथ हों तो सर्प-दोष से संतान-हानि — शुभ-दृष्टि से निवारण।",
"Shrewd mind, large eyes, eloquent, radiant, fond of giving food, dear to the family; authority from the royal court (like a commander) and prosperity of children in the 18th year. A 5th lord in a malefic/enemy/debilitation sign — trouble with children or only one child; expenses through state matters; with Rahu–Ketu — loss of children through a serpent dosha, removed by a benefic aspect."
],
[
"32–34",
"शत्रु-नाश, कुल-वृद्धि, पौत्र-दर्शन; शरीर पर चिह्न। शुभयुत हो तो नीरोग; पापयुत/पाप-राशि में वात-शीत रोग; शनि की राशि (मकर/कुम्भ) में राहु के साथ हो तो गम्भीर रोग का भय।",
"Destruction of enemies, growth of the family, sees grandchildren; a mark on the body. With benefics — free of disease; with malefics/in a malefic sign — wind and cold ailments; in Saturn's signs (Capricorn/Aquarius) with Rahu — risk of serious illness."
],
[
"35–37",
"विद्या और धन का स्वामी, अत्यन्त लाभ; पतिव्रता/निष्ठावान जीवनसाथी। सप्तमेश निर्बल हो या राहु-केतु-शनि-मंगल साथ/पाप-दृष्ट हों तो चरित्र-दोष की प्रवृत्ति; सप्तमेश शुभयुत, उच्च (कर्क) या स्वराशि में हो तो एक ही विवाह, जीवनसाथी से धन, सुख और प्रतिष्ठा।",
"Master of learning and wealth, great gains; a devoted, faithful spouse. A weak 7th lord or Rahu/Ketu/Saturn/Mars with it or malefic aspects — a tendency to moral lapses; a 7th lord with benefics, exalted (Cancer) or in its own sign — one marriage, wealth through the spouse, happiness and prestige."
],
[
"38–43",
"आयु पर संकट और निम्न कर्म की प्रवृत्ति; पापयुत हो तो पतन। अष्टमेश शुभयुत होकर अष्टम में हो तो दीर्घायु; अष्टमेश निर्बल हो तो अल्पायु। उच्च (कर्क) या स्वराशि में दीर्घायु, उद्यमी, पण्डित और वेदज्ञ।",
"Danger to longevity and a tendency to low deeds; with malefics — a fall. The 8th lord with benefics in the 8th — long life; a weak 8th lord — short life. Exalted (Cancer) or in its own sign — long life, enterprising, learned and versed in the Vedas."
],
[
"44–45",
"धर्म-कर्म और तप करने वाला, पवित्र, धनवान; 35वें वर्ष यज्ञ; पिता दीर्घायु; शुभ कर्मों से अनेक प्रतिष्ठाएँ और बहुत लोगों का रक्षक।",
"Devoted to dharma and austerity, pure, wealthy; performs a yajna in the 35th year; long-lived father; many honours through good deeds and protector of many people."
],
[
"46–49",
"धर्म व शुभ कर्म करने वाला, गीता-पाठी, चतुर, उज्ज्वल यश, बहुत लोगों द्वारा पूजनीय। दशमेश की स्थिति प्रतिकूल हो तो कार्यों में विघ्न और यात्रा में लाभ की कमी।",
"Does righteous and good deeds, recites the Gita, clever, of bright fame, revered by many. If the 10th lord is adversely placed — obstacles in work and little gain from travel."
],
[
"50–53",
"पण्डित, धनाढ्य और अत्यन्त लाभ; 32वें वर्ष वाहन और बड़ी प्रतिष्ठा; अन्य ग्रहों के साथ हो तो गज-वाहन और भाग्य-वृद्धि; चन्द्र साथ हो तो भूमिगत धन का लाभ।",
"Learned, rich and great gains; a vehicle and high prestige in the 32nd year; with other planets — elephant-like conveyances and growing fortune; with the Moon — gain of buried treasure."
],
[
"54–58",
"धन में कमी, विद्याभ्यासी, अल्प संतान, गणितज्ञ, अनेक भोग; गाँठ/घाव का भय। शुभयुत, उच्च या स्वराशि में उत्तम गति; पापयुत हो तो अधोगति और आचरण-दोष; धर्म-कार्यों में व्यय।",
"Less money, studious, few children, knows mathematics, enjoys many pleasures; risk of growths or wounds. With benefics, exalted or in its own sign — a good destiny; with malefics — a lower course and moral lapses; spends on dharma."
]
],
"Venus": [
[
"1–13",
"गणित-शास्त्र का ज्ञाता, दीर्घायु, जीवनसाथी से प्रेम, वस्त्र-आभूषण प्रिय, सुन्दर, गुणवान, धनी और विद्वान; शुभयुत हो तो अनेक आभूषण और स्वर्ण-सी कान्ति। पाप-दृष्ट/युत, नीच (कन्या) या अस्त हो तो छल-कपट की प्रवृत्ति और वात-कफ रोग। स्वराशि (वृषभ/तुला) में महान राजयोग; अष्टमेश होकर निर्बल हो तो दाम्पत्य में उलझन, चंचल भाग्य।",
"Knows mathematics, long-lived, loves the spouse, fond of clothes and ornaments, handsome, virtuous, rich and learned; with benefics — many ornaments and a golden complexion. Aspected by or with malefics, debilitated (Virgo) or combust — a tendency to deceit and vata–kapha ailments. In its own sign (Taurus/Libra) — a great Raja yoga; weak as 8th lord — marital complications and fluctuating fortune."
],
[
"14–19",
"धनी, कुटुम्ब-युक्त, उत्तम भोजन, विनम्र, सुन्दर नेत्र, दयालु और परोपकारी; 32वें वर्ष सुन्दर जीवनसाथी। द्वितीयेश निर्बल/दुःस्थान में हो तो नेत्र-रोग; चन्द्र साथ हो तो रतौंधी, कुटुम्ब से दूरी और धन-हानि।",
"Rich, with a family, good food, modest, beautiful eyes, kind and helpful to others; a beautiful spouse in the 32nd year. A weak 2nd lord or one in a dusthana — eye disease; with the Moon — night blindness, distance from family and loss of wealth."
],
[
"20–22",
"लोभ की प्रवृत्ति, सुन्दर, भाइयों की वृद्धि, सोच-विचार कर कार्य-सिद्धि; भाइयों से सुख। तृतीयेश बलियुत, उच्च (मीन) या स्वराशि में हो तो भाइयों की वृद्धि; दुःस्थान या पापयुत हो तो भाइयों को हानि।",
"A greedy streak, handsome, siblings prosper, accomplishes after careful thought; happiness through brothers. A 3rd lord with strong planets, exalted (Pisces) or in its own sign — siblings prosper; in a dusthana or with malefics — harm to brothers."
],
[
"23–28",
"सुन्दर, बुद्धिमान, भाइयों का सुख, आनन्दी और शान्त; 30वें वर्ष वाहन; दुग्ध-धन की वृद्धि। चतुर्थेश बलियुत हो तो उत्तम वाहन और स्वर्ण-सम्पत्ति। पापयुत/पाप-शत्रु राशि या नीच (कन्या) में निर्बल हो तो घर-वाहन में कमी, माता को कष्ट और आचरण-दोष।",
"Handsome, intelligent, happiness from brothers, joyful and peaceful; a vehicle in the 30th year; abundant milk. A 4th lord with strong planets — fine conveyances and gold. With malefics, in a malefic/enemy sign or weak in debilitation (Virgo) — lack of house and vehicle, trouble to the mother and moral lapses."
],
[
"29–33",
"बुद्धिमान, मन्त्री और सेनापति तुल्य, संतान-सुख। पापयुत, पाप/शत्रु राशि या नीच (कन्या) में हो तो बुद्धि-मन्दता और संतान की चिन्ता; शुभयुत हो तो नीतिज्ञ, संतानवान और वाहन-प्राप्ति।",
"Intelligent, like a minister or commander, happiness from children. With malefics, in a malefic/enemy sign or debilitated (Virgo) — dull mind and worry about children; with benefics — skilled in policy, blessed with children and gains vehicles."
],
[
"34–36",
"कुल व संतान की वृद्धि, शत्रु-नाशक, पुत्र-पौत्र युक्त; अनुचित स्थानों में व्यय, वाणी में कपट और रोग की प्रवृत्ति। षष्ठेश बलियुत हो तो शत्रु व जाति की वृद्धि; शत्रु/पापयुत, नीच (कन्या) या षष्ठेश-चन्द्र साथ हों तो शत्रु व जाति-पक्ष का नाश।",
"Growth of the clan and children, destroys enemies, has sons and grandsons; spending in wrong places, deceitful speech and a tendency to illness. A 6th lord with strong planets — growth of enemies and kin; with enemies/malefics, debilitated (Virgo) or with the 6th lord and Moon — downfall of enemies and kin."
],
[
"37–44",
"प्रबल काम-भावना, धनवान, वाहन-युक्त, सब कार्यों में कुशल और बड़े कुटुम्ब वाला; चरित्र-दोष से सावधान। पापयुत, शत्रु या नीच (कन्या) राशि में हो तो जीवनसाथी को कष्ट और द्वि-विवाह योग; अनेक पापग्रह साथ हों तो संतान-कष्ट। शुभयुत, उच्च (मीन) या स्वराशि में हो तो जीवनसाथी के देश/पक्ष से बहुत धन और उसके प्रताप से तेज।",
"Strong desires, rich, has vehicles, skilled in all tasks, with a large family; guard against moral lapses. With malefics, in an enemy sign or debilitated (Virgo) — trouble to the spouse and a two-marriage yoga; with several malefics — trouble with children. With benefics, exalted (Pisces) or in its own sign — great wealth from the spouse's side and radiance through the spouse."
],
[
"45–48",
"सुखी; 4थे वर्ष माता को (गण्डमाला आदि) रोग; मध्यम आयु, रोग-प्रवृत्ति, हितैषी जीवनसाथी, असन्तोष। शुभ-अशुभ मिश्रित राशि में पूर्ण आयु; पापयुत हो तो आयु-भय।",
"Happy; illness to the mother (glandular swellings etc.) in the 4th year; medium life, prone to illness, a well-wishing spouse, discontent. In a sign of mixed influence — full life; with malefics — danger to longevity."
],
[
"49–58",
"पुण्यात्मा, तपस्वी, अनुष्ठान करने वाला; चरणों में शुभ चिह्न, धार्मिक, भोग-वृद्धि, संतान व जीवनसाथी का सुख; पिता दीर्घायु। पापयुत हो तो पिता को अरिष्ट; पाप/शत्रु/नीच (कन्या) राशि में धन-हानि और गुरु-मर्यादा भंग का दोष। शुभयुत हो तो भाग्य-वृद्धि और राजयोग; चतुर्थेश-सप्तमेश साथ हों तो महाभाग्यशाली, वाहन और वस्त्राभूषण।",
"Virtuous, ascetic, performs rituals; auspicious marks on the feet, religious, enjoyments grow, happiness from children and spouse; long-lived father. With malefics — danger to the father; in a malefic/enemy/debilitation (Virgo) sign — loss of wealth and the fault of breaching a teacher's honour. With benefics — growing fortune and Raja yoga; with the 4th and 7th lords — very fortunate, with vehicles, clothes and ornaments."
],
[
"59–61",
"अत्यन्त तेजस्वी; पापयुत हो तो कार्यों में विघ्न। गुरु, बुध, चन्द्र साथ हों तो अनेक वाहन, विविध यज्ञ, सब दिशाओं में यश, अनेक राजयोग, महाभाग्य और वाक्पटुता।",
"Very radiant; with malefics — obstacles in work. With Jupiter, Mercury, Moon — many vehicles, various yajnas, fame in all directions, several Raja yogas, great fortune and eloquence."
],
[
"62–64",
"पण्डित, बहुत धनी, भूमि-लाभ और दयालु; शुभयुत हो तो अनेक वाहन और शुभ कार्यों से धन; पापयुत हो तो अनुचित साधनों से धन। नीच (कन्या) में या पापग्रह/अष्टमेश साथ हों तो लाभ में रुकावट।",
"Learned, very rich, gains land, kind; with benefics — many vehicles and wealth through good works; with malefics — money by improper means. Debilitated (Virgo) or with malefics/the 8th lord — gains are blocked."
],
[
"65–68",
"धन की तंगी; पापयुत हो तो भोग-विषयों में लोभ। शुभयुत हो तो बहुत धन, शय्या-सुख और उत्तम लोक; पापयुत हो तो अधोगति।",
"Financial hardship; with malefics — greed for pleasures. With benefics — much wealth, bed comforts and higher worlds; with malefics — a lower course."
]
],
"Saturn": [
[
"1–7",
"वात-पित्त प्रकृति; उच्च (तुला) में नगर/ग्राम का अधिपति और धन-धान्य से समृद्ध; स्वराशि (मकर/कुम्भ) में पिता धनवान; चतुर्थेश या दशमेश की राशि में हो तो बड़ा भाग्यवान और प्रबल राजयोग। केवल चन्द्र-दृष्टि हो तो आर्थिक संघर्ष (दूसरों पर निर्भरता); शुभ-दृष्टि से यह दोष नहीं।",
"Vata–pitta constitution; exalted (Libra) — head of a town or village, rich in wealth and grain; in its own sign (Capricorn/Aquarius) — a wealthy father; in the sign of the 4th or 10th lord — very fortunate with a strong Raja yoga. Aspected only by the Moon — financial struggle (dependence on others); a benefic aspect removes this fault."
],
[
"8–9",
"धन-संचय में कठिनाई, दाम्पत्य में उलझन (द्वि-विवाह योग); पापयुत हो तो छल की प्रवृत्ति, सीमित स्थान/आश्रय और नेत्र-रोग।",
"Difficulty in saving money, marital complications (a two-marriage yoga); with malefics — a deceitful streak, limited home or shelter and eye disease."
],
[
"10–13",
"भाइयों को हानि, दुःखी मन और निम्न कर्मों की प्रवृत्ति। उच्च (तुला) या स्वराशि में भाइयों की वृद्धि; पापयुत हो तो भाइयों से वैर।",
"Harm to brothers, a sorrowful mind and a tendency to low deeds. Exalted (Libra) or in its own sign — siblings prosper; with malefics — enmity with brothers."
],
[
"14–21",
"माता को कष्ट (कभी दो माताओं का योग), सुख-हीनता, शारीरिक कष्ट और धन की कमी। उच्च/स्वराशि में यह दोष नहीं — सुखी, धनी और वाहन-युक्त; शनि लग्नेश हो तो माता दीर्घायु और स्वयं सुखी; अष्टमेश साथ हो तो माता को अरिष्ट और शरीर-कष्ट।",
"Trouble to the mother (sometimes two mothers), lack of comfort, bodily trouble and lack of money. Exalted/own sign removes this — happy, rich and with vehicles; if Saturn is the Lagna lord — a long-lived mother and happiness; with the 8th lord — danger to the mother and bodily distress."
],
[
"22–26",
"संतान-सुख में बाधा, आर्थिक तंगी, निम्न वृत्ति, दत्तक संतान का योग। स्वराशि में कन्या-संतान; गुरु-दृष्ट हो तो दो विवाह — पहले में संतान-कष्ट, दूसरे से संतान; बलियुत हो तो दाम्पत्य-सुख।",
"Obstacles to children, financial strain, low occupation, a yoga for adoption. In its own sign — daughters; aspected by Jupiter — two marriages, children from the second; with strong planets — marital happiness."
],
[
"27–31",
"छोटा परिवार-पक्ष, शत्रु-नाश, धन-धान्य से समृद्ध; मंगल साथ हो तो परदेश-भ्रमण और अल्प राजयोग (कभी सुख, कभी योग-भंग)। शनि अष्टमेश हो तो वात-शूल रोग और घाव का भय।",
"A small circle of kin, destruction of enemies, rich in wealth and grain; with Mars — travel abroad and a minor Raja yoga (sometimes happiness, sometimes the yoga breaks). If Saturn is the 8th lord — colic, wind disorders and risk of wounds."
],
[
"32–36",
"शरीर में दोष, निर्बल जीवनसाथी, अत्यन्त दुःख और चरित्र-दोष की प्रवृत्ति; उच्च/स्वराशि में भी अधिक भोग-लालसा; केतु, मंगल या शुक्र साथ हों तो दाम्पत्य में असंयम — संयम और मर्यादा आवश्यक।",
"Bodily defects, a frail spouse, great sorrow and a tendency to moral lapses; even exalted/in its own sign — excessive desires; with Ketu, Mars or Venus — lack of restraint in married life — self-control and propriety are needed."
],
[
"37–40",
"लम्बी आयु (शास्त्र में 75 वर्ष), पर आर्थिक कष्ट, सेवा-वृत्ति और आचरण-दोष की प्रवृत्ति। उच्च (तुला) या स्वराशि में दीर्घायु; अष्टमेश शत्रु या नीच (मेष) राशि में हो तो आयु पर संकट और कठिनाई से अन्न।",
"A long life (75 years in the text) but financial hardship, a service occupation and a tendency to moral lapses. Exalted (Libra) or in its own sign — long life; an 8th lord in an enemy or debilitation (Aries) sign — danger to longevity and food earned with difficulty."
],
[
"41–43",
"आचार में शिथिलता पर प्राचीन वस्तुओं (मन्दिर, कुएँ आदि) का जीर्णोद्धार करने वाला; 39वें वर्ष घाट, गौशाला, ग्राम आदि का निर्माण। उच्च/स्वराशि में पिता दीर्घायु; पापयुत और निर्बल हो तो पिता को अरिष्ट।",
"Lax in conduct but restores old things (temples, wells etc.); builds ghats, cowsheds or villages in the 39th year. Exalted/own sign — a long-lived father; with malefics and weak — danger to the father."
],
[
"44–45",
"25वें वर्ष गंगा-स्नान (तीर्थ-योग), अत्यन्त लोभी, चित्र-विचित्र शरीर; पापयुत हो तो कार्यों में विघ्न, शुभयुत हो तो कार्य-सिद्धि।",
"A bath in the Ganga (pilgrimage) in the 25th year, very greedy, a distinctive body; with malefics — obstacles in work; with benefics — success."
],
[
"46–48",
"बहुत धनी, भूमि-लाभ और राज-सेवा; कार्यों में कुछ विलम्ब। उच्च (तुला)/स्वराशि में पण्डित, बड़ा भाग्यशाली, अत्यन्त धनवान और वाहन-युक्त।",
"Very rich, gains land and serves the government; some delay in work. Exalted (Libra)/own sign — learned, very fortunate, very rich and with vehicles."
],
[
"49–53",
"मर्यादा-भंग का भय और अंग-कष्ट; पापयुत हो तो नेत्र-दोष, अनुचित व्यय, धन-हानि और अधोगति; शुभयुत हो तो सुखी, सुन्दर नेत्र और उत्तम लोक।",
"Risk of losing one's standing and bodily trouble; with malefics — eye defects, wasteful spending, poverty and a lower course; with benefics — happy, beautiful eyes and higher worlds."
]
],
"Rahu": [
[
"1–4",
"संतान सम्बन्धी कष्ट का योग; मेष, वृषभ या कर्क में हो तो दयालु और बहुत भोग-सुख; शुभ या पाप ग्रह की दृष्टि हो तो मुख पर चिह्न।",
"A yoga for trouble regarding children; in Aries, Taurus or Cancer — compassionate and enjoys many pleasures; aspected by benefics or malefics — a mark on the face."
],
[
"5–6",
"धन की कमी, शारीरिक रोग, संतान की चिन्ता और साँवला वर्ण; पापयुत हो तो ठोड़ी/होंठ पर चिह्न।",
"Lack of money, bodily ailments, worry about children and a dark complexion; with malefics — a mark on the chin or lips."
],
[
"7–8",
"तिल, मूँग, कोदों आदि धान्य से समृद्ध (कृषि-लाभ); शुभयुत हो तो कण्ठ पर चिह्न।",
"Prosperous in grains such as sesame, mung and kodo (agricultural gains); with benefics — a mark on the throat."
],
[
"9–10",
"बहुत आभूषण, द्वि-विवाह योग, सेवा-वृत्ति; पापयुत हो तो निश्चय ही माता को कष्ट; शुभयुत/दृष्ट हो तो यह दोष नहीं — माता का अच्छा सुख।",
"Many ornaments, a two-marriage yoga, a service occupation; with malefics — surely trouble to the mother; with or aspected by benefics this fault does not arise — good happiness from the mother."
],
[
"11–13",
"संतान-सुख में बाधा (सर्प-दोष); नाग-प्रतिष्ठा (नाग-पूजा) करने से संतान-सुख; वात-रोग, गलत मार्ग की प्रवृत्ति, शासन से विरोध और साधारण स्थान में निवास।",
"Obstacles to children (serpent dosha); consecrating/worshipping a Naga brings the joy of children; wind ailments, a tendency to go astray, conflict with authorities and living in a humble place."
],
[
"14–16",
"गम्भीर और अत्यन्त सुखी (शत्रु-विजय); चन्द्र साथ हो तो चरित्र-दोष, धन की कमी और चोरी-छल की प्रवृत्ति।",
"Grave and very happy (victory over enemies); with the Moon — moral lapses, lack of money and a tendency to theft or deceit."
],
[
"17–21",
"द्वि-विवाह योग — पहले जीवनसाथी को कष्ट, दूसरे को उदर-रोग; पापयुत हो तो गण्डमाला (ग्रन्थि) रोग, शुभयुत होने पर दोष दूर; शुभ ग्रह साथ हों तो एक ही विवाह।",
"A two-marriage yoga — trouble to the first spouse, abdominal disease to the second; with malefics — glandular swellings, removed with benefics; with benefic planets — one marriage."
],
[
"22–23",
"अत्यधिक रोग और आयु पर संकट (शास्त्र में अल्पायु 32 वर्ष); शुभयुत हो तो मध्यम (45 वर्ष); अष्टमेश बलियुत या उच्च हो तो दीर्घ (60+ वर्ष)। आयु-निर्णय केवल इस एक योग से नहीं — सम्पूर्ण कुण्डली देखें।",
"Much illness and danger to longevity (short life of 32 years in the text); with benefics — medium (45 years); a strong or exalted 8th lord — long (60+ years). Longevity is never judged from this single yoga — the whole chart must be weighed."
],
[
"24",
"संतान-सुख में कमी, सेवा-वृत्ति, आचरण-दोष और धर्म में अरुचि की प्रवृत्ति।",
"Less joy from children, a service occupation, moral lapses and a tendency to lose interest in dharma."
],
[
"25–28",
"चरित्र-दोष की प्रवृत्ति और साधारण स्थान में वास (कुछ टीकाकार: वस्त्र-निर्माण का व्यवसाय); शुभयुत हो तो सुन्दर नगर में वास और काव्य-शास्त्र का अध्ययन।",
"A tendency to moral lapses and living in a humble place (some commentators: a weaving trade); with benefics — living in a fine town and studying poetry and literature."
],
[
"29–30",
"संतान-सुख और धन-धान्य से युक्त।",
"Blessed with children, wealth and grain."
],
[
"31–32",
"अल्प संतान, नेत्र-रोग और अधोगति की प्रवृत्ति।",
"Few children, eye disease and a tendency to a lower course."
]
]
};
  const BEN = ["Jupiter", "Venus", "Mercury", "Moon"];
  const MAL = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];
  const ASP = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], Rahu: [5, 7, 9], Ketu: [5, 7, 9] };
  const CH = ["", "प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ", "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश"];

  function aspects(r, a, b) { // does a aspect b (sign-based drishti)
    const h = ((r.planets[b].sign - r.planets[a].sign + 12) % 12) + 1;
    return (ASP[a] || [7]).includes(h);
  }

  function analyze(r) {
    const L = J.L, G = J.GRAHA, ORD = J.ORD, P = r.planets;
    const ALL = Object.keys(P);
    const order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].filter((p) => P[p]);
    const items = order.map((p) => {
      const x = P[p], ch = p === "Ketu" ? "Rahu" : p;
      const e = DATA[ch][x.house - 1];
      const withP = ALL.filter((q) => q !== p && P[q].sign === x.sign && !(p === "Rahu" && q === "Ketu") && !(p === "Ketu" && q === "Rahu"));
      const aspBy = ALL.filter((q) => q !== p && !withP.includes(q) && q !== "Rahu" && q !== "Ketu" && aspects(r, q, p));
      const wb = withP.filter((q) => BEN.includes(q)), wm = withP.filter((q) => MAL.includes(q));
      const ab = aspBy.filter((q) => BEN.includes(q)), am = aspBy.filter((q) => MAL.includes(q));
      const nm = (a) => a.map((q) => G[q]).join(", ");
      const cond = [];
      if (p !== "Rahu" && p !== "Ketu") cond.push(x.dignity.label);
      if (x.combust) cond.push(L("अस्त", "Combust"));
      if (wb.length) cond.push(L(`शुभयुत (${nm(wb)})`, `with benefics (${nm(wb)})`));
      if (wm.length) cond.push(L(`पापयुत (${nm(wm)})`, `with malefics (${nm(wm)})`));
      if (ab.length) cond.push(L(`शुभ-दृष्ट (${nm(ab)})`, `aspected by benefics (${nm(ab)})`));
      if (am.length) cond.push(L(`पाप-दृष्ट (${nm(am)})`, `aspected by malefics (${nm(am)})`));
      if (!withP.length && !aspBy.length) cond.push(L("युति/दृष्टि रहित", "no conjunction or aspect"));
      const lordOf = r.houses.filter((hs) => hs.lord === p).map((hs) => hs.h);
      if (lordOf.length) cond.push(L(`${lordOf.map(ORD).join(", ")} भाव का स्वामी`, `lord of the ${lordOf.map(ORD).join(", ")}`));
      const dk = x.dignity && x.dignity.key;
      const good = ![6, 8, 12].includes(x.house) ? !(dk === "debil" || wm.length > wb.length) : ["exalt", "own", "moola"].includes(dk) || (wb.length + ab.length > wm.length + am.length);
      const chap = L(`भृगु सूत्र — ${G[p]}, ${CH[x.house]} भाव (सूत्र ${e[0]})`, `Bhrigu Sutra — ${G[p]} in the ${ORD(x.house)} house (sutras ${e[0]})`);
      return {
        title: chap,
        text: `${L(e[1], e[2])}<div class="note" style="margin-top:6px">🔎 ${L("आपकी कुंडली में इस ग्रह की स्थिति", "This planet in your chart")}: <b>${J.RASHI[x.sign]}</b> — ${cond.join(" · ")}${L("।", ".")} ${L("सूत्र में दी गई शर्तों (उच्च/स्वराशि/शुभयुत/पापयुत आदि) में से जो आपकी कुंडली पर लागू हों, वही फल प्रधान मानें।", "Of the conditions given in the sutra (exalted/own sign/with benefics/with malefics etc.), the ones that match your chart are the ones that apply.")}</div>`,
        good,
      };
    });
    return {
      granth: L("भृगु सूत्र", "Bhrigu Sutra"),
      author: L("महर्षि भृगु · सिद्धनाथ शर्मा की हिन्दी टीका के आधार पर", "Maharshi Bhrigu · based on Siddhanath Sharma's Hindi commentary"),
      note: L("भृगु सूत्र में प्रत्येक ग्रह के बारह भावों का फल सूत्र-रूप में है। यहाँ आपके प्रत्येक ग्रह के भाव का भावार्थ, सूत्र-संख्या सहित, दिया गया है। सूत्रों में आयु, संतान आदि के कठोर वचन सामान्य नियम हैं — अकेले एक योग से निर्णय नहीं होता; पूरी कुंडली, दशा और शुभ दृष्टियों से फल बदलता है।", "Bhrigu Sutra gives, in aphorisms, the results of every planet in each of the twelve houses. Here the meaning for the house of each of your planets is given with its sutra numbers. Stern statements on longevity, children etc. are general rules — no judgement rests on a single combination; the whole chart, dasha and benefic aspects modify the result."),
      items,
    };
  }

  const api = { analyze, DATA };
  root.Bhrigu = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
