export interface SafetyRule {
  id: string;
  ruleTitleEn: string;
  ruleTitleTa: string;
  shortTagEn: string;
  shortTagTa: string;
  speechTextEn: string;
  speechTextTa: string;
  phoneticTa: string;
  iconName: 'ShieldAlert' | 'Ban' | 'HeartHandshake' | 'Footprints' | 'Users' | 'Eye';
  severity: 'critical' | 'advisory' | 'courtesy';
}

export const MTC_SAFETY_RULES: SafetyRule[] = [
  {
    id: 'rule-footboard',
    ruleTitleEn: 'Footboard Travel is Strictly Prohibited',
    ruleTitleTa: 'படிக்கட்டு பயணம் முற்றிலும் தடை செய்யப்பட்டுள்ளது',
    shortTagEn: 'No Footboard Travel',
    shortTagTa: 'படியில் நிற்காதீர்',
    speechTextEn:
      'Passenger safety rule: Footboard travel is strictly prohibited and punishable by law. Please step fully inside the bus and hold the handrails firmly.',
    speechTextTa:
      'பயணிகள் பாதுகாப்பு விதி: படிக்கட்டில் பயணம் செய்வது முற்றிலும் தடை செய்யப்பட்டுள்ளது. தயவுசெய்து பேருந்தின் உள்ளே சென்று பிடிகம்பிகளை கெட்டியாகப் பிடித்துக் கொள்ளவும்.',
    phoneticTa:
      'Payanigal paadhugaappu vidhi: Padikkattil payanam seivadhu muttrilum thadaiseiyyappattadhu. Thayavuseidhu perundhin ulle sendru kaipidiyai kettiyaga pidithukkollavum.',
    iconName: 'Ban',
    severity: 'critical',
  },
  {
    id: 'rule-moving-bus',
    ruleTitleEn: 'Do Not Board or Alight from a Moving Bus',
    ruleTitleTa: 'ஓடும் பேருந்தில் ஏறவோ இறங்கவோ கூடாது',
    shortTagEn: 'Wait for Full Halt',
    shortTagTa: 'நின்ற பின் ஏறவும்',
    speechTextEn:
      'Safety reminder: Do not attempt to board or alight from a moving bus. Please wait until the vehicle comes to a complete halt at the designated platform.',
    speechTextTa:
      'பாதுகாப்பு நினைவூட்டல்: ஓடும் பேருந்தில் ஏறவோ அல்லது இறங்கவோ முயற்சி செய்யாதீர்கள். பேருந்து நடைமேடையில் முழுமையாக நின்ற பின்னரே பாதுகாப்பாக ஏறி இறங்கவும்.',
    phoneticTa:
      'Paadhugaappu ninaivoottal: Odum perundhil eravo irangavo muyarchi seiyadheergal. Perundhu mudhumaiyaaga nindra pinnaare nadaimedaiyil paadhugaappaaga eravum irangavum.',
    iconName: 'ShieldAlert',
    severity: 'critical',
  },
  {
    id: 'rule-priority-seating',
    ruleTitleEn: 'Offer Priority Seats to Women & Elders',
    ruleTitleTa: 'பெண்கள் மற்றும் முதியவர்களுக்கு முன்னுரிமை இருக்கை',
    shortTagEn: 'Priority Seating',
    shortTagTa: 'முன்னுரிமை இருக்கை',
    speechTextEn:
      'Courtesy advisory: Please offer priority seats to women, senior citizens, expectant mothers, and differently-abled passengers.',
    speechTextTa:
      'மரியாதை அறிவிப்பு: பெண்கள், முதியவர்கள், கர்ப்பிணித் தாய்மார்கள் மற்றும் மாற்றுத்திறனாளி பயணிகளுக்கு ஒதுக்கப்பட்ட முன்னுரிமை இருக்கைகளை விட்டுக் கொடுத்து உதவவும்.',
    phoneticTa:
      'Mariyaadhai arivippu: Pengal, mudhiyavargal, karppini thaaimargal mattrum maatrruthiranaali payanigalukku munnurimai irukkaigalai vittukkoduthu udhavavum.',
    iconName: 'HeartHandshake',
    severity: 'courtesy',
  },
  {
    id: 'rule-yellow-line',
    ruleTitleEn: 'Stand Behind the Yellow Platform Safety Line',
    ruleTitleTa: 'நடைமேடையில் மஞ்சள் கோட்டிற்குப் பின்னால் நிற்கவும்',
    shortTagEn: 'Mind Platform Line',
    shortTagTa: 'மஞ்சள் கோடு',
    speechTextEn:
      'Platform safety notice: Please stand behind the yellow safety line on the platform until the arriving bus has fully docked at its bay.',
    speechTextTa:
      'நடைமேடை பாதுகாப்பு அறிவிப்பு: பேருந்து வந்து நிற்கும் வரை நடைமேடையில் உள்ள மஞ்சள் கோட்டிற்குப் பின்னால் பாதுகாப்பாக நிற்கவும்.',
    phoneticTa:
      'Nadaimedai paadhugaappu arivippu: Perundhu vandhu nirkum varai nadaimedaiyil ulla manjal kottirku pinnaal paadhugaappaaga nirkavum.',
    iconName: 'Footprints',
    severity: 'advisory',
  },
  {
    id: 'rule-belongings-ticket',
    ruleTitleEn: 'Safeguard Belongings & Hold Valid Ticket',
    ruleTitleTa: 'உடைமைகளை கவனிக்கவும் & பயணச்சீட்டு வாங்கவும்',
    shortTagEn: 'Ticket & Belongings',
    shortTagTa: 'பயணச்சீட்டு & உடைமை',
    speechTextEn:
      'Station advisory: Keep a close watch on your personal belongings, and ensure you purchase a valid ticket or carry a valid bus pass throughout your journey.',
    speechTextTa:
      'நிலைய அறிவிப்பு: கூட்ட நெரிசலில் உங்கள் உடைமைகளை கவனமாகப் பாதுகாத்துக் கொள்ளவும். உரிய பயணச்சீட்டு அல்லது பாஸ் பெற்று பயணம் செய்யவும்.',
    phoneticTa:
      'Nilaiya arivippu: Kootta nerisalil ungal udaimaigalai kavanamaaga paadhukaathukkollavum. Uriya payanacheettu alladhu pass petru payanam seiyavum.',
    iconName: 'Eye',
    severity: 'advisory',
  },
  {
    id: 'rule-driver-peace',
    ruleTitleEn: 'Do Not Distract Driver & Keep Aisles Clear',
    ruleTitleTa: 'ஓட்டுநரின் கவனத்தை சிதறடிக்காதீர்கள் & வழியை அடைக்காதீர்',
    shortTagEn: 'Keep Aisles Clear',
    shortTagTa: 'வழியை அடைக்காதீர்',
    speechTextEn:
      'Transit rule: Do not engage in unnecessary conversation with the driver while driving, and please keep the central gangway clear for other passengers.',
    speechTextTa:
      'போக்குவரத்து விதி: பேருந்து இயங்கும் போது ஓட்டுநருடன் பேசுவதை தவிர்க்கவும். பயணிகள் எளிதாக செல்ல நடுப்பகுதி வழியை அடைக்காமல் இருக்கவும்.',
    phoneticTa:
      'Pokkuvarathu vidhi: Perundhu iyangum podhu ottunarudan pesuvadhai thavirkkavum. Payanigal elidhaaga sella naduppagudhi vazhiyai adaikkaamal irukkavum.',
    iconName: 'Users',
    severity: 'courtesy',
  },
];
