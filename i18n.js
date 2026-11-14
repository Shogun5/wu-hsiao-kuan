// Chinese ⇄ English. The page is written in Chinese; this table holds the English for each element,
// by selector, in document order. Switching swaps innerHTML and keeps the Chinese it found on first use.
const EN = [
  ['.brand-name', ['Wu, Hsiao-Kuan']],
  ['.links a', ['About', 'Research', 'Work', 'Publications', 'Contact']],
  ['.hero-meta', ['Assistant Professor · Department of Exercise and Health Science<br>National Taipei University of Nursing and Health Sciences']],
  ['.motto', ['Exploring human movement, <br>advancing smart health technology']],
  ['.fields', ['Sports Science × Rehabilitation × Smart Sensing × AI']],
  ['.forms button', ['Taiji<i>太極</i>', 'Xingyi<i>形意</i>', 'Bagua<i>八卦</i>']],
  ['.sec-head h2', ['About', 'Research', 'Philosophy', 'Work', 'Publications', 'Practice', 'Contact']],
  ['.sec-head .en', ['其人', '研究 · RESEARCH &amp; INNOVATION', '理念', '成果 · RESEARCH &amp; DEVELOPMENT', '著作 · PATENTS', '修身 · INTERNAL MARTIAL ARTS', '聯絡']],
  ['#about h3', ['Current position', 'Education', 'Certifications', 'Experience']],
  ['#about .lead', ['National Taipei University of Nursing and Health Sciences<br>Assistant Professor, Department of Exercise and Health Science']],
  ['#about .plain li', [
    '<b>PhD</b>, Physical Therapy and Assistive Technology, National Yang-Ming University',
    '<b>MS</b>, Physical Therapy and Assistive Technology, National Yang-Ming University',
    '<b>BS</b>, Physical Therapy, National Yang-Ming University',
    'Licensed Physical Therapist', 'Certified 3D Printing Engineer', 'LabVIEW CLAD (Certified LabVIEW Associate Developer)']],
  ['#about .path li', [
    '<b>National Yang Ming Chiao Tung University</b>Adjunct Assistant Professor, Physical Therapy and Assistive Technology',
    '<b>National Yang Ming Chiao Tung University</b>Postdoctoral Researcher, Makerspace',
    '<b>National Yang-Ming University</b>Project Manager, Biomedical Engineering R&amp;D Center',
    '<b>National Taiwan Sport University</b>Adjunct Lecturer, Adapted Physical Education',
    '<b>Chen-An Rehabilitation Clinic</b>Physical Therapist',
    '<b>Yuan-Sheng Rehabilitation Clinic</b>Physical Therapist',
    '<b>Han-Ming Hospital</b>Physical Therapist']],
  ['#spec .intro', ['Bringing together sports biomechanics, rehabilitation science and artificial intelligence. Through human movement analysis, smart sensing, virtual reality and wearable technology, I develop precise measurement and health-promotion techniques, and work to turn interdisciplinary research into practical use.']],
  ['.pillar b', ['Sports Biomechanics &amp; Human Movement Analysis', 'Smart Sensing &amp; Rehabilitation Technology', 'Neuromuscular Control, Balance &amp; Mind-Body Health', 'Assistive Technology &amp; Smart Healthcare']],
  ['.pillar > span', ['運動生物力學與人體動作分析', '智慧感測與復健科技', '神經肌肉控制、平衡與身心健康', '輔助科技與智慧健康應用']],
  ['.pillar-more p', [
    'The kinematics, kinetics and neuromuscular control of human movement. Using motion analysis, force measurement and signal processing, this work examines movement efficiency, joint loading and injury risk: spinal mechanics, range of motion, postural control, musculoskeletal loading, and the biomechanics of functional movements such as squatting, jumping and gait. A particular focus is measurement that is objective, reliable and repeatable.',
    'New systems for measuring movement and assisting rehabilitation, built from sensors, microcontrollers, computer vision and data analysis. Projects include the multi-axis mechanical tissue-property device (JAMTD), wearable motion sensing, AI pose recognition, and movement-analysis tools combining MediaPipe and Python, aiming for smart health technology that is low-cost, portable and easy to use.',
    'How sensory integration, postural control and neurophysiological activity relate to balance. With virtual-reality sweep-frequency balance assessment, Taijiquan training, EEG and functional near-infrared spectroscopy (fNIRS), this work studies postural stability, neural regulation, attention and the physiological response to mind-body interventions, joining traditional mind-body exercise with modern neuroscience.',
    'Applied research on rehabilitation devices, smart wearables and human-machine interaction, exploring how technology can improve movement ability, participation and quality of life. Directions include exoskeleton assistance, movement-feedback systems, interactive rehabilitation training, and mobile platforms for health monitoring and exercise analysis, from proof of concept and prototype to use in the field.']],
  ['.creed', ['Understanding human movement through science,<br>improving healthy living through technology.']],
  ['.idea-grid p', [
    'My work integrates sports biomechanics, physical therapy, rehabilitation medicine and smart technology to study the scientific mechanisms of movement control, neuromuscular function and performance, and develops interdisciplinary techniques for new applications in sports science and health care.',
    'It combines human movement analysis, smart sensing, virtual reality, artificial intelligence and wearable assistive devices to build assessment methods that are objective, quantitative and clinically useful, extending laboratory research into clinical rehabilitation, sports training and community health promotion.']],
  ['#idea > h3', ['Research Highlights　研究與技術特色']],
  ['.highlights b', ['Interdisciplinary Integration', 'Quantitative Assessment', 'Intelligent Technology', 'Translational Research', 'International Collaboration']],
  ['.highlights span', ['跨領域整合', '量化評估', '智慧科技應用', '實務導向研發', '國際學術合作']],
  ['.highlights p', [
    'Physical therapy, sports science, engineering and information technology combined, starting from what the human body needs to do.',
    'Attention to the reliability, validity and biomechanical meaning of every measuring tool, so that assessment rests on objective data.',
    'AI, computer vision, VR, wearable sensors and data visualisation brought together for better movement analysis and health monitoring.',
    'Research turned into techniques and tools for the clinic, sports training, education and community health promotion.',
    'International research exchange, cross-university projects and overseas student internships in smart health and sports technology.']],
  ['.vision h3', ['Research Vision　研究願景']],
  ['.vision p', [
    'I will continue to integrate sports biomechanics, artificial intelligence and smart sensing into precise assessment and personalised health-promotion systems centred on human function, building a complete line of research from basic study and technical development through functional validation to clinical and community use.',
    'Human movement at the centre, scientific research as the foundation, and innovative technology as the link to a healthier future.']],
  ['.work h3', ['Visual-cue walker for<br>Parkinson’s disease', 'Joint accessory motion<br>measurement device', 'Front-following<br>accompanying robot']],
  ['.work p', [
    'An instrumented walker with individually adjustable visual cues, for gait training in patients with Parkinson’s disease.',
    'An objective, portable device for measuring spinal joint accessory motion, patented in Taiwan and the United States.',
    'An accompanying robot that follows from the user’s own local coordinates, matching natural movement in daily life.']],
  ['.featured h3', ['Featured Research　精選研究主題']],
  ['.feat b', ['JAMTD: spinal tissue mechanics', 'VR sweep-frequency balance &amp; Taijiquan training', 'Smart human movement analysis platform', 'Neurophysiology &amp; mind-body exercise', 'Exoskeletons &amp; rehabilitation technology']],
  ['.feat span', [
    'Multi-axis measurement, segmental displacement and stiffness, reliability analysis',
    'Postural control, dynamic balance and intervention outcomes',
    'AI video analysis of gait, squats, jumps and sports skills',
    'EEG, fNIRS, seated meditation and neuromuscular control',
    'Smart assistive devices, wearable feedback and functional improvement']],
  ['.skills h3', ['Engineering skills learned along the way, as each project required']],
  ['#wu .big', ['<b>20</b>+ years of practice']],
  ['#wu .intro', ['More than 20 years of training in the internal arts of the Zhongnan Xingyi–Bagua school of Chinese martial arts: Taijiquan, Xingyiquan and Baguazhang. I study the theory and application of the internal arts and hope to share this traditional form of exercise for health.']],
  ['.art b', ['Taijiquan', 'Xingyiquan', 'Baguazhang']],
  ['.art span', ['Yin · Yang', 'Five Elements', 'Eight Trigrams']],
  ['.addr', ['No. 365, Mingde Rd., Beitou Dist., Taipei City, Taiwan<br>Department of Exercise and Health Science, National Taipei University of Nursing and Health Sciences']],
  ['.foot span:last-child', ['© Wu, Hsiao-Kuan 吳孝觀']],
];
const TITLE = { zh: '吳孝觀 ｜ 探索人體動作，創新智慧健康科技', en: 'Wu, Hsiao-Kuan ｜ Exploring human movement, advancing smart health technology' };
const HINT = {
  zh: { taiji: ['撥動懷中的太極　·　腳踏太極圖', '左右滑過懷中的太極'], xingyi: ['撥動雙掌間的五行氣團　·　點擊腳下五行', '左右滑過人物手中的氣團　·　點一下腳下五行'], bagua: ['撥動雙掌間的太極　·　點擊腳下八卦', '左右滑過掌間的太極　·　點一下腳下八卦'] },
  en: { taiji: ['Stir the taiji held in the arms', 'Swipe sideways through the taiji'], xingyi: ['Stir the orb　·　click the five elements', 'Swipe sideways through the orb　·　tap the elements'], bagua: ['Stir the taiji　·　click the trigrams', 'Swipe sideways through the taiji　·　tap the trigrams'] },
};

let cache = null;
export function hint(lang, form) { return HINT[lang][form] || HINT[lang].xingyi; }
export function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'zh') return q;
  try { const s = localStorage.getItem('lang'); if (s === 'en' || s === 'zh') return s; } catch (e) { /* private mode */ }
  return (navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
export function setLang(lang) {
  if (!cache) cache = EN.map(([sel]) => [...document.querySelectorAll(sel)].map(el => [el, el.innerHTML]));
  cache.forEach((els, k) => els.forEach(([el, zh], i) => { const en = EN[k][1][i]; if (en !== undefined) el.innerHTML = lang === 'en' ? en : zh; }));
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
  document.title = TITLE[lang];
  try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
}
