// Site content: edit the lists here, the page rebuilds itself.
(function () {
  const skills = [
    ['嵌入式系統開發', 'PSoC · Arduino · micro:bit'],
    ['微系統開發', 'Raspberry Pi'],
    ['程式設計', 'C · Python · LabVIEW · Scratch'],
    ['手機程式開發', 'Android'],
    ['感測器設計與開發'], ['訊號同步擷取'], ['數位資料整理分析'], ['電路板設計與製作'],
    ['馬達自動控制'], ['機電整合'],
    ['積層製造', 'ME · SLA'],
    ['電腦向量繪圖', 'Inkscape'],
    ['數位立體建模', 'SolidWorks · Creo · Fusion 360 · 3D Slicer · Blender'],
    ['IoT 物聯網'],
  ];

  const programs = [
    '動作分析儀 PTI 系統與力板之訊號同步擷取程式',
    '六軸手握式力量傳感器訊號擷取程式',
    'PG drive 馬達驅動控制器之外接分壓模組',
    '投球動作分析，VICON 擷取資料分析程式',
    '步態研究資料分析（十字韌帶），VICON 擷取資料分析程式',
    '足底壓力資料分析，VICON 與力板資料分析程式',
    '超音波圖片影像分析程式，分析足底筋膜的厚度',
    '簡易職能治療電子病歷產生程式',
    '雷射快門曝光時序控制程式',
    '依觸發訊號控制雷射快門曝光時序程式',
    'PSoC 與 cRIO 溝通介面軟硬體設計',
    '多尺度熵值分析程式（Multiscale entropy, MSE）',
    '運用 PSoC 設計可攜式 ECG',
    '透過 PSoC3 擷取加速規訊號，以控制馬達線短路與斷路來調整馬達扭力',
    '運用 NXT 馬達與角度偵測，設計患者協調性控制程式',
    '行走步態分析程式',
    '無母數分析之 Post-Hoc 語法產生程式',
    '運用 PSoC 製作無刷馬達控制訊號產生器',
    '3D 列印切層接續打印程式',
  ];

  // [year, text (use *journal* for italics), doi]
  const journals = [
    [2024, 'Wu, C.-H., Wu, H.-K., Tsai, P.-J., & Lin, C.-L. Early monitoring for 3D-printed patient-specific mandible reconstructive implant biomechanical behavior under different occlusal conditions using a wireless module system. *International Journal of Bioprinting, 10*(3), 2553.', '10.36922/ijb.2553'],
    [2022, 'Chen, P. Y., Cheen, J. R., Jheng, Y. C., Wu, H.-K., Huang, S. E., & Kao, C. L. Clinical applications and consideration of interventions of electrotherapy for orthopedic and neurological rehabilitation. *Journal of the Chinese Medical Association, 85*(1), 24–29.'],
    [2021, 'Wu, H.-K., Chen, P.-Y., Wu, H.-Y., & Yu, C.-H. User local coordinate-based accompanying robot for human natural movement of daily life. *Sensors, 21*(11), 3889.', '10.3390/s21113889'],
    [2021, 'Sow, L. C., Liu, H. H., Wang, R. Y., Wei, S. H., Wu, H.-K., & Yang, Y. R. Feasibility and effectiveness of interactive stepping exercise on community-dwelling older adults: A pilot randomized controlled trial. *Geriatric Nursing, 42*(5), 1099–1104.', '10.1016/j.gerinurse.2021.06.004'],
    [2020, 'Wu, H.-K., Chen, H.-R., Chen, W.-Y., Lu, C.-F., Tsai, M., & Yu, C.-H. A novel instrumented walker for individualized visual cue setting for gait training in patients with Parkinson’s disease. *Assistive Technology, 32*(1), 1–11.', '10.1080/10400435.2018.1525442'],
    [2019, 'Wu, H.-K., Lai, H.-J., Teng, T., & Yu, C.-H. Development of an objective portable measurement device for spinal joint accessory motion testing. *Sensors, 20*(1), 100.', '10.3390/s20010100'],
    [2019, 'Wu, H.-K. The “Anthro-Mechatronic Harmonious Design Canvas” enhances innovation in precision rehabilitation (Doctoral dissertation). National Yang Ming University, Taiwan.'],
  ];

  const conferences = [
    [2024, 'Wu, H.-K., Liao, Y.-H., Lin, Y.-Y., Lin, P.-H., Li, W.-X., & Chou, C.-C. Comparing acute exercise intensity using somatosensory game interventions: A study of exercise self-efficacy and perception of exercise among middle-aged and elderly people using Nintendo for Switch as an example. *ASAPE Sapporo 2024 — International Symposium of the Asian Society for Adapted Physical Education and Exercise.* Poster presentation.'],
    [2024, 'Wu, H.-K., Lin, Y.-Y., Chou, T.-H., Yang, C.-C., Liao, Y.-H., & Chou, C.-C. Effects of sugar-sweetened soy milk supplementation and meridian massage on exercise recovery and muscle soreness status. Poster, *101st Annual Meeting of the Physiological Society of Japan.*'],
    [2017, 'Wu, K.-L., Lin, Y.-Y., Wu, H.-K., Chen, P.-Y., Yu, C.-H., & Wang, F.-C. The development of an automatic assisted device for neuro-developmental treatment. *Proceedings of the SICE Annual Conference 2017*, 1262–1265.', '10.1109/SICE.2017.8105758'],
    [2016, 'Tseng, R.-F., Chen, P.-Y., Wu, H.-K., Lin, Y.-Y., Wang, Z.-J., Yu, C.-H., Wang, F.-C., & Lin, P.-C. A treadmill with multi-axis force measurement for neuro-developmental treatment for stroke patients. *Proceedings of the XIV International Symposium on 3D Analysis of Human Movement (3DAHM-2016)*, O17.'],
    [2011, 'Wu, H.-K., Chien, C.-H., Jheng, Y.-C., Chen, C.-H., Chen, H.-R., & Yu, C.-H. Development of intelligent walker with dynamic support. *Proceedings of the 18th IFAC World Congress*, 5980–5984. Milano, Italy.'],
    [2010, 'Wu, H.-K., Chen, H.-R., & Yu, C.-H. Development of posterior walker with adjustable visual cues to improve gait performance for patients with Parkinson’s disease. *IECON 2010 — 36th Annual Conference on IEEE Industrial Electronics Society*, Glendale, AZ.', '10.1109/IECON.2010.5674937'],
  ];

  const chinese = [
    [2016, '林育佑、吳凱麟、吳孝觀、陳博因、游忠煌、王富正。神經發展治療步態訓練機。中國機械工程學會第三十三屆全國學術研討會論文集，#1533。工業技術研究院，新竹。'],
    [2015, '游忠煌、吳孝觀、陳博因。從神經發展理論看機器人協助復健的策略。中國機械工程學會第三十二屆全國學術研討會論文集。國立高雄應用技術大學，高雄。'],
    [2009, '吳孝觀。研發視覺提醒輔具以提升巴金森氏症患者之行走表現（碩士論文）。'],
  ];

  // [number, year, text]
  const patents = [
    ['TWI900298B', 2025, '觸覺及痛覺敏感程度測試器械模組 Mechanical sensitivity testing apparatus module.'],
    ['TWI850162B', 2024, '關節附屬動作量化裝置及系統 Joint accessory movement quantification device and system.'],
    ['US11744762B2', 2023, 'Gait activity learning assistance system and the application method thereof.'],
    ['US11350873B2', 2022, 'Portable quantification apparatus for assessing joint accessory movement.'],
    ['US20200238527A1', 2020, 'An automatic accompanying system.（申請中）'],
    ['TW202007382A', 2020, '步態學習輔助系統及其應用方法 Gait learning assisting system and method of application thereof.'],
    ['TW201915513A', 2019, '自動隨行系統及其應用方法 Automatic accompanying system and application method thereof.'],
    ['TW201532598A', 2015, '步態訓練工具 Gait training tool.'],
    ['TW201519865A', 2015, '可攜式關節附屬動作量化裝置 Portable apparatus for quantifying joint accessory movement.'],
  ];

  const skillsEn = ["Embedded systems", "Microcomputer systems", "Programming", "Mobile app development", "Sensor design & development", "Synchronised signal acquisition", "Digital data processing & analysis", "PCB design & fabrication", "Motor control", "Mechatronic integration", "Additive manufacturing", "Vector graphics", "3D modelling", "Internet of Things"];
  const programsEn = [
    "Synchronised signal acquisition for the PTI motion-analysis system and force plates",
    "Signal acquisition for a six-axis hand-held force transducer",
    "External voltage-divider module for the PG Drives motor controller",
    "Pitching-motion analysis: processing of VICON capture data",
    "Gait study data analysis (cruciate ligament): processing of VICON capture data",
    "Plantar-pressure analysis: VICON and force-plate data processing",
    "Ultrasound image analysis of plantar fascia thickness",
    "Simple generator for occupational-therapy electronic records",
    "Laser-shutter exposure timing control",
    "Trigger-driven laser-shutter exposure timing control",
    "Hardware and software interface between PSoC and cRIO",
    "Multiscale entropy (MSE) analysis",
    "Portable ECG built on PSoC",
    "Accelerometer acquisition on PSoC 3, adjusting motor torque by shorting or opening the motor leads",
    "Patient coordination-control program using NXT motors and angle sensing",
    "Walking gait analysis",
    "Syntax generator for post-hoc tests in non-parametric analysis",
    "Brushless-motor control signal generator on PSoC",
    "3D-print layer-resume printing program",
  ];

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const fmt = s => esc(s)
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/Wu, H\.-K\.|吳孝觀/g, m => '<strong>' + m + '</strong>');
  const $ = id => document.getElementById(id);
  const T = {
    zh: { j: '學術著作', c: '研討會文章', z: '中文著作', p: '發明專利', more: '其他曾協助開發之研究程式', n: ' 項' },
    en: { j: 'Journal articles', c: 'Conference papers', z: 'Publications in Chinese', p: 'Patents', more: 'Other research software I helped develop', n: ' items' },
  };

  // lang: 'zh' | 'en'; shown: true when re-rendering a page that is already on screen
  window.renderContent = function (lang, shown) {
    const en = lang === 'en', t = T[lang];
    $('skills').innerHTML = skills.map(([a, b], i) => `<li>${esc(en ? skillsEn[i] : a)}${b ? `<small>${esc(b)}</small>` : ''}</li>`).join('');
    $('programs').innerHTML = (en ? programsEn : programs).map(p => `<li>${esc(p)}</li>`).join('');
    document.querySelector('.more summary').innerHTML = `${t.more} <i id="prog-count">${programs.length}${t.n}</i>`;

    const paper = ([y, x, doi]) =>
      `<li><span class="y">${y}</span><span>${fmt(x)}${doi ? ` <a href="https://doi.org/${doi}" target="_blank" rel="noopener">doi ↗</a>` : ''}</span></li>`;
    // patents carry a Chinese and an English title; the English page shows the English one
    const pat = x => en ? x.replace(/^[^A-Za-z]*(?=[A-Z])/, '').replace('（申請中）', ' (pending)') : x;
    const patent = ([n, y, x]) =>
      `<li class="pat"><span class="y">${y}</span><span><strong>${n}</strong>　${esc(pat(x))}</span></li>`;
    const group = (title, items, fn) =>
      `<div class="pub-group reveal${shown ? ' in' : ''}"><h3>${title}</h3><ol>${items.map(fn).join('')}</ol></div>`;

    $('pub-lists').innerHTML =
      group(t.j, journals, paper) + group(t.c, conferences, paper) + group(t.z, chinese, paper) + group(t.p, patents, patent);
    $('tally').innerHTML = [
      [patents.length, t.p], [journals.length, t.j], [conferences.length, t.c], [chinese.length, t.z],
    ].map(([n, l]) => `<div><b data-count="${n}">${n}</b><span>${l}</span></div>`).join('');
  };
  window.renderContent('zh', false);
})();
