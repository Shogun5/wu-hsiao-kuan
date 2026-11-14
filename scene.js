// Stage: ink mountains + a motion-capture figure practising taiji on a taiji "force plate",
// with live joint angles, marker trails and a signal ring; bagua / wuxing halo behind.
import * as THREE from 'three';

const PAPER = 0xece5d6, RED = 0xc23a22, INK = 0x0f1211, TECH = 0x63d6c6;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function fbm1(seed) {
  const r = rng(seed), g = Array.from({ length: 64 }, r);
  const n = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return g[i & 63] + (g[(i + 1) & 63] - g[i & 63]) * u; };
  return x => n(x) * .55 + n(x * 2.3 + 11) * .28 + n(x * 5.1 + 7) * .12 + n(x * 11.3 + 3) * .05;
}
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const deg = THREE.MathUtils.radToDeg;

// two-bone IK: where the middle joint sits between root a and target c
function ik(a, c, l1, l2, pole, out) {
  const dir = c.clone().sub(a); let d = dir.length(); d = Math.min(d, (l1 + l2) * .999); dir.normalize();
  const a1 = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a1 * a1));
  const perp = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  return out.copy(a).addScaledVector(dir, a1).addScaledVector(perp, h);
}

export function createStage(canvas, hooks = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const CAM_Z = 14;
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
  camera.position.set(0, 1.2, CAM_Z);

  // ---------- mountains: ink strips; two ridges also get a thin "contour scan" line
  const LAYERS = 6, mountains = [];
  for (let i = 0; i < LAYERS; i++) {
    const t = i / (LAYERS - 1);
    const z = lerp(-34, -6.5, t), k = (CAM_Z - z) / CAM_Z;
    const W = 34 * k, N = 260, f = fbm1(101 + i * 37);
    const top = lerp(.9, -2.5, t), amp = lerp(3.4, 1.3, t), foot = -6.5;
    const cTop = new THREE.Color(0x56605b).lerp(new THREE.Color(0x070908), Math.pow(t, .7));
    const cBot = new THREE.Color(0x2c322f).lerp(new THREE.Color(0x0e1110), t);
    const pos = [], col = [], idx = [], ridge = [];
    for (let j = 0; j <= N; j++) {
      const u = j / N, x = (u - .5) * W;
      const h = Math.pow(f(u * lerp(5, 9, t) + i * 3.1), 1.7), y = (top + h * amp) * k;
      pos.push(x, y, 0, x, foot * k, 0); ridge.push(V(x, y, .01));
      col.push(cTop.r, cTop.g, cTop.b, cBot.r, cBot.g, cBot.b);
      if (j < N) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true }));
    m.position.z = z; m.userData.depth = t;
    if (i === 1 || i === 3) m.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ridge),
      new THREE.LineBasicMaterial({ color: TECH, transparent: true, opacity: i === 1 ? .28 : .16 })));
    scene.add(m); mountains.push(m);
  }

  const sun = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: RED }));
  sun.position.z = -36; scene.add(sun);

  // ---------- drifting motes
  const MOTES = reduce ? 0 : 420, mp = new Float32Array(MOTES * 3), ms = new Float32Array(MOTES), r0 = rng(7);
  for (let i = 0; i < MOTES; i++) { mp[i * 3] = (r0() - .5) * 34; mp[i * 3 + 1] = r0() * 16; mp[i * 3 + 2] = lerp(-14, 8, r0()); ms[i] = .4 + r0(); }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(ms, 1));
  const moteMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `uniform float uTime,uPx; attribute float aSeed; varying float vA;
      void main(){ vec3 p=position; p.y=mod(p.y+uTime*.22*aSeed,16.)-7.; p.x+=sin(uTime*.25*aSeed+p.y)*.5;
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize=uPx*aSeed*26./-mv.z; vA=smoothstep(-7.,-4.,p.y)*smoothstep(9.,5.,p.y)*.45; }`,
    fragmentShader: `varying float vA; void main(){ float d=length(gl_PointCoord-.5);
      gl_FragColor=vec4(.925,.898,.839,vA*smoothstep(.5,.1,d)); }`,
  });
  const motes = new THREE.Points(moteGeo, moteMat); motes.frustumCulled = false; scene.add(motes);

  // ---------- emblem = floor plate + figure + halo
  const emblem = new THREE.Group(); scene.add(emblem);
  const FLOOR = -1.72;
  const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, ...o });

  // capture-volume grid that fades with distance
  {
    const pts = [], E = 9.35, STEP = .85;
    for (let v = -E; v <= E + .01; v += STEP) pts.push(v, 0, -E, v, 0, E, -E, 0, v, E, 0, v);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const grid = new THREE.LineSegments(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: `varying float vD; void main(){ vD=length(position.xz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.39,.84,.78,(1.-smoothstep(1.5,8.5,vD))*.22); }`,
    }));
    grid.position.y = FLOOR - .01; emblem.add(grid);
  }

  // taiji disc lying flat: the force plate
  const discMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { a: { value: new THREE.Color(PAPER) }, b: { value: new THREE.Color(INK) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 a,b;
      void main(){ vec2 p=vUv*2.-1.; float r=length(p), w=fwidth(r)*1.2;
        float up=length(p-vec2(0.,.5)), dn=length(p+vec2(0.,.5));
        float s=smoothstep(-w,w,p.x);
        s=mix(s,1.,1.-smoothstep(.5-w,.5+w,up)); s=mix(s,0.,1.-smoothstep(.5-w,.5+w,dn));
        s=mix(s,0.,1.-smoothstep(.15-w,.15+w,up)); s=mix(s,1.,1.-smoothstep(.15-w,.15+w,dn));
        s=mix(s,1.,smoothstep(.965-w,.965+w,r));
        gl_FragColor=vec4(mix(b,a,s),1.);
        #include <colorspace_fragment>
      }`,
  });
  const plate = new THREE.Group(); plate.position.y = FLOOR; plate.rotation.x = -Math.PI / 2; emblem.add(plate);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 64), new THREE.MeshBasicMaterial({ color: 0x0b0d0c, transparent: true, opacity: .55 })); plate.add(disc);
  // 太極 scene: the floor itself is the taiji diagram
  const yy = new THREE.Mesh(new THREE.CircleGeometry(1.55, 96), discMat); yy.position.z = .004; yy.scale.setScalar(.0001); plate.add(yy);
  // centre of pressure: dot + fading trace
  const cop = new THREE.Mesh(new THREE.CircleGeometry(.07, 24), basic(RED)); cop.position.z = .012; plate.add(cop);
  const COPN = 90, copPos = new Float32Array(COPN * 3), copGeo = new THREE.BufferGeometry();
  copGeo.setAttribute('position', new THREE.BufferAttribute(copPos, 3));
  plate.add(new THREE.Line(copGeo, new THREE.LineBasicMaterial({ color: RED })));

  // halo behind the figure: bagua (Fu Xi order) + tick scale + live signal ring
  const HS = .54, halo = new THREE.Group(); halo.position.set(0, FLOOR + .02, 0); halo.rotation.x = -Math.PI / 2; halo.scale.setScalar(HS); emblem.add(halo);
  const TRI = [[1, 1, 1], [0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1], [1, 1, 0]];
  const ring = new THREE.Group(); halo.add(ring);
  const R = 2.62, trigrams = [], hitPlates = [], hitMat = new THREE.MeshBasicMaterial({ visible: false });
  TRI.forEach((lines, i) => {
    const g = new THREE.Group(), a = i / 8 * Math.PI * 2, mat = basic(PAPER);
    g.position.set(Math.sin(a) * R, Math.cos(a) * R, 0); g.rotation.z = -a;
    lines.forEach((solid, j) => {
      const y = (j - 1) * .23;
      const bar = (w, x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, .115, .07), mat); m.position.set(x, y, 0); g.add(m); };
      if (solid) bar(.98, 0); else { bar(.41, -.285); bar(.41, .285); }
    });
    const hit = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .95), hitMat); hit.userData.tri = i; g.add(hit); hitPlates.push(hit);
    g.userData = { mat, pulse: 0 }; ring.add(g); trigrams.push(g);
  });
  {
    const pts = [];
    for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, r1 = i % 5 ? 2.09 : 2.15; pts.push(Math.sin(a) * 2.03, Math.cos(a) * 2.03, 0, Math.sin(a) * r1, Math.cos(a) * r1, 0); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    halo.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: TECH, transparent: true, opacity: .6 })));
  }
  const SIGN = 360, sig = new Float32Array(SIGN), sigPos = new Float32Array(SIGN * 3), sigGeo = new THREE.BufferGeometry();
  sigGeo.setAttribute('position', new THREE.BufferAttribute(sigPos, 3));
  const sigLine = new THREE.LineLoop(sigGeo, new THREE.LineBasicMaterial({ color: TECH })); halo.add(sigLine);

  // wuxing pentagon (形意五行) takes the halo's place
  const wuxing = new THREE.Group(); halo.add(wuxing); wuxing.scale.setScalar(0);
  const WXC = { 火: '#d8452b', 土: '#d9a441', 金: '#9aa3a0', 水: '#3f78bd', 木: '#4f9e5c' };
  const label = ch => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#ece5d6'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
    x.strokeStyle = WXC[ch]; x.lineWidth = 20; x.beginPath(); x.arc(128, 128, 108, 0, 7); x.stroke();
    x.fillStyle = '#0f1211'; x.font = '900 150px "Noto Serif TC",serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 128, 138);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  const WX = ['火', '土', '金', '水', '木'], wxPts = [], wxNodes = [];
  WX.forEach((ch, i) => {
    const a = i / 5 * Math.PI * 2, p = V(Math.sin(a) * 2.55, Math.cos(a) * 2.55, 0); wxPts.push(p);
    const m = new THREE.Mesh(new THREE.CircleGeometry(.48, 48), basic(0xffffff)); m.position.copy(p); m.position.z = .02; m.userData.ch = ch; m.userData.wx = i; m.userData.pulse = 0;
    wuxing.add(m); wxNodes.push(m);
  });
  const paintLabels = () => wxNodes.forEach(m => { m.material.map?.dispose(); m.material.map = label(m.userData.ch); m.material.needsUpdate = true; });
  paintLabels();
  document.fonts?.ready.then(() => document.fonts.load('900 150px "Noto Serif TC"', WX.join('')).then(paintLabels)).catch(() => {});
  wuxing.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([0, 2, 4, 1, 3].map(i => wxPts[i])), new THREE.LineBasicMaterial({ color: RED })));
  wuxing.add(new THREE.Mesh(new THREE.TorusGeometry(2.55, .01, 8, 160), basic(PAPER)));
  // 相生 runs round the circle (火→土→金→水→木), 相剋 along the star (火→金→木→土→水)
  const wxSheng = new THREE.Mesh(new THREE.CircleGeometry(.1, 24), basic(TECH)), wxKe = new THREE.Mesh(new THREE.CircleGeometry(.075, 24), basic(RED));
  const WXTAIL = 40, tailPos = new Float32Array(WXTAIL * 3), tailGeo = new THREE.BufferGeometry(); tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
  wuxing.add(wxSheng, wxKe, new THREE.Line(tailGeo, new THREE.LineBasicMaterial({ color: TECH })));
  const KE = [0, 2, 4, 1, 3];
  function updateWuxing(t, dt) {
    const ph = (t * .42) % 5;
    for (let i = 0; i < WXTAIL; i++) { const a = (ph - i * .012) / 5 * Math.PI * 2; tailPos[i * 3] = Math.sin(a) * 2.55; tailPos[i * 3 + 1] = Math.cos(a) * 2.55; tailPos[i * 3 + 2] = .03; }
    tailGeo.attributes.position.needsUpdate = true;
    wxSheng.position.set(tailPos[0], tailPos[1], .04);
    const kp = (t * .3) % 5, ki = Math.floor(kp), kf = kp - ki, e = kf * kf * (3 - 2 * kf);
    wxKe.position.copy(wxPts[KE[ki]]).lerp(wxPts[KE[(ki + 1) % 5]], e); wxKe.position.z = .04;
    wxNodes.forEach((n, i) => {
      const d = Math.abs(ph - i), near = Math.max(0, 1 - Math.min(d, 5 - d) * 2.2), hit = Math.max(0, 1 - Math.hypot(wxKe.position.x - wxPts[i].x, wxKe.position.y - wxPts[i].y) * 2.5);
      n.userData.pulse = Math.max(0, n.userData.pulse - dt * 1.2);
      n.scale.setScalar(1 + .2 * near + .12 * hit + .35 * n.userData.pulse);
    });
  }

  // ---------- the figure (metres, scaled ×2). x = its right, z = forward.
  const fig = new THREE.Group(); fig.position.y = FLOOR; fig.scale.setScalar(2); emblem.add(fig);
  const NAMES = ['pel', 'neck', 'head', 'shR', 'shL', 'elR', 'elL', 'haR', 'haL', 'hipR', 'hipL', 'knR', 'knL', 'anR', 'anL', 'toR', 'toL'];
  const J = Object.fromEntries(NAMES.map(n => [n, V()]));
  const BONES = [['neck', 'shR'], ['neck', 'shL'], ['shR', 'elR'], ['elR', 'haR'], ['shL', 'elL'], ['elL', 'haL'],
    ['pel', 'hipR'], ['pel', 'hipL'], ['hipR', 'knR'], ['knR', 'anR'], ['anR', 'toR'], ['hipL', 'knL'], ['knL', 'anL'], ['anL', 'toL'], ['neck', 'head']];
  // a ceramic-shelled humanoid robot: lit shells, glowing joints, an exposed spine at the waist
  emblem.add(new THREE.HemisphereLight(0xfff3e2, 0x1c2a28, 2.2));
  const key = new THREE.DirectionalLight(0xfff6ea, 4.2); key.position.set(-3, 5, 6); emblem.add(key);
  const rim = new THREE.DirectionalLight(TECH, 3.5); rim.position.set(4, 2, -5); emblem.add(rim);
  const shell = new THREE.MeshStandardMaterial({ color: 0x7d8885, roughness: .36, metalness: .5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x121615, roughness: .5, metalness: .6 });
  const boneMat = dark, glow = basic(TECH);
  const RAD = [0, 0, .04, .033, .04, .033, 0, 0, .056, .044, 0, .056, .044, 0, .028];
  const bones = BONES.map((_, i) => { if (!RAD[i]) return null; const m = new THREE.Mesh(new THREE.CapsuleGeometry(RAD[i], 1, 6, 16), i === 14 ? dark : shell); fig.add(m); return m; });
  const JR = { shR: .05, shL: .05, elR: .042, elL: .042, haR: .034, haL: .034, hipR: .06, hipL: .06, knR: .058, knL: .058, anR: .044, anL: .044 };
  const MARK = Object.keys(JR);
  const markers = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), glow, MARK.length); markers.frustumCulled = false; fig.add(markers);
  const part = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); fig.add(m); return m; };
  const ball = new THREE.SphereGeometry(1, 32, 20);
  const head = part(ball, shell, .092, .108, .1), visor = part(new THREE.BoxGeometry(.13, .042, .05), dark), eye = part(new THREE.BoxGeometry(.1, .008, .01), glow);
  const chest = part(ball, shell, .165, .14, .1), core = part(new THREE.CircleGeometry(.03, 24), glow), pelvis = part(ball, shell, .15, .075, .105);
  const hands = [part(new THREE.BoxGeometry(.028, .1, .075), shell), part(new THREE.BoxGeometry(.028, .1, .075), shell)];
  const feet = [part(new THREE.BoxGeometry(.095, .055, .25), shell), part(new THREE.BoxGeometry(.095, .055, .25), shell)];
  // the human posed in Blender (渾圓樁) with a MediaPipe Pose skeleton drawn over it; the robot above is the fallback
  const human = new THREE.Group(); fig.add(human); let HJ = null;
  const MP_EDGES = [[0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]];
  const forms = {}, skinMat = new THREE.MeshStandardMaterial({ color: 0x566260, roughness: .58, metalness: .2 });
  const lineMat = new THREE.MeshBasicMaterial({ color: TECH, depthTest: false, transparent: true, opacity: .95 });
  const dotMat = new THREE.MeshBasicMaterial({ color: PAPER, depthTest: false, transparent: true });
  const cyl = new THREE.CylinderGeometry(.0042, .0042, 1, 6), gltfLoader = import('three/addons/loaders/GLTFLoader.js').then(m => new m.GLTFLoader());
  const loadForm = (name, base) => Promise.all([
    fetch(`assets/${base}.json`).then(r => r.json()),
    gltfLoader.then(l => l.loadAsync(`assets/${base}.glb`)),
  ]).then(([j, gltf]) => {
    const g = new THREE.Group(); g.visible = false; human.add(g);
    gltf.scene.traverse(o => { if (o.isMesh) o.material = skinMat; });
    g.add(gltf.scene);
    const pts = j.mp.map(p => V(p[0], p[1], p[2]));
    MP_EDGES.forEach(([a, b]) => {
      const d = pts[b].clone().sub(pts[a]), m = new THREE.Mesh(cyl, lineMat);
      m.position.copy(pts[a]).addScaledVector(d, .5); m.scale.y = d.length(); m.quaternion.setFromUnitVectors(up, d.normalize()); m.renderOrder = 5; g.add(m);
    });
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), dotMat, pts.length);
    pts.forEach((p, i) => { const r = i < 11 ? .007 : .015; mtx.makeScale(r, r, r).setPosition(p); dots.setMatrixAt(i, mtx); });
    dots.renderOrder = 6; dots.frustumCulled = false; g.add(dots);
    forms[name] = { g, j }; applyForm();
  }).catch(e => console.warn('figure model unavailable: ' + base, e));
  function applyForm() {
    const f = forms[eff()] || Object.values(forms)[0]; if (!f) return; S.shown = eff();
    [...bones, head, visor, eye, chest, core, pelvis, ...hands, ...feet, ...vertebrae, markers].forEach(o => { if (o) o.visible = false; });
    Object.values(forms).forEach(o => { o.g.visible = o === f; });
    HJ = f.j; trails.forEach(([, l]) => { l.userData.fresh = true; });
    tCol.set(eff() === 'xingyi' ? tColW : tColB); tGeo.attributes.color.needsUpdate = true;
  }
  // 太極: the scan re-posed to a captured frame; 形意: the scan as it was taken (三體式); 八卦: the scan re-posed to frame 809
  loadForm('taiji', 'taiji'); loadForm('xingyi', 'scan'); loadForm('bagua', 'bagua');
  const VERT = 7, vertebrae = Array.from({ length: VERT }, (_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.075 - i * .004, .04, .055), boneMat); fig.add(m); return m; });
  const ribs = [];
  // exoskeleton (輔助科技): frames beside thigh and shank, actuator discs at hip and knee, a pelvic band
  const exo = new THREE.Group(); exo.visible = false; fig.add(exo);
  const exoMat = new THREE.MeshBasicMaterial({ color: TECH, wireframe: true }), exoSolid = basic(TECH);
  const exoSeg = [['hipR', 'knR', 1], ['knR', 'anR', 1], ['hipL', 'knL', -1], ['knL', 'anL', -1]].map(([a, b, side]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.035, 1, .07, 1, 6, 1), exoMat); exo.add(m); return { m, a, b, side }; });
  const exoAct = ['hipR', 'knR', 'hipL', 'knL'].map((n, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .03, 20), exoSolid); m.rotation.z = Math.PI / 2; exo.add(m); return { m, n, side: i < 2 ? 1 : -1 }; });
  const exoBelt = new THREE.Mesh(new THREE.TorusGeometry(.15, .012, 6, 40), exoSolid); exoBelt.rotation.x = Math.PI / 2; exo.add(exoBelt);
  // angle arcs
  const ARCN = 14, mkArc = () => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((ARCN + 2) * 3), 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: TECH })); l.frustumCulled = false; fig.add(l); return l; };
  const arcKnee = mkArc(), arcSh = mkArc();
  // marker trails
  const TRN = 110, mkTrail = () => {
    const g = new THREE.BufferGeometry(), p = new Float32Array(TRN * 3), c = new Float32Array(TRN * 3);
    for (let i = 0; i < TRN; i++) { const k = Math.pow(1 - i / TRN, 1.6); c[i * 3] = .39 * k; c[i * 3 + 1] = .84 * k; c[i * 3 + 2] = .78 * k; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); l.frustumCulled = false; l.userData.fresh = true; fig.add(l); return l;
  };
  const trails = [['haR', mkTrail()], ['haL', mkTrail()]];

  const up = V(0, 1, 0), tmp = V(), tmp2 = V(), q = new THREE.Quaternion(), mtx = new THREE.Matrix4(), yAxis = V(0, 1, 0);
  const A = { knee: 0, shoulder: 0, trunk: 0 };
  const spinePt = (u, yaw, sway, out) => out.set(-.035 * sway * Math.sin(Math.PI * u) + J.pel.x, J.pel.y + .05 + u * .5, J.pel.z + .025 * Math.sin(Math.PI * u) - .01);

  const ballC = V(); let BS = 1;
  function pose(t) {
    if (HJ) {
      for (const n of ['pel', 'neck', 'head', 'shR', 'shL', 'elR', 'elL', 'hipR', 'hipL', 'knR', 'knL', 'anR', 'anL', 'toR', 'toL']) J[n].fromArray(HJ[n]);
      J.haR.fromArray(HJ.wrR); J.haL.fromArray(HJ.wrL);
      // the taiji sits between the two palms, sized to the gap between them
      ballC.copy(J.haR).add(J.haL).multiplyScalar(.5); ballC.y += Math.sin(t * 1.1) * .004; ballC.z += HJ.ballZ || 0; ballC.y += HJ.ballY || 0;
      BS = (HJ.ballR || THREE.MathUtils.clamp(J.haR.distanceTo(J.haL) * .36, .11, .2)) / RB;
    } else {
    const br = Math.sin(t * 1.1), sway = Math.sin(t * .37) * .35, yaw = 0;
    J.pel.set(.012 * sway, .835 + .006 * br, -.02);
    J.anR.set(.19, .075, 0); J.anL.set(-.19, .075, 0);
    J.toR.set(.19, .03, .17); J.toL.set(-.19, .03, .17);
    J.hipR.set(.1, -.03, 0).add(J.pel); J.hipL.set(-.1, -.03, 0).add(J.pel);
    ik(J.hipR, J.anR, .44, .43, tmp.set(.18, 0, 1), J.knR);
    ik(J.hipL, J.anL, .44, .43, tmp.set(-.18, 0, 1), J.knL);
    spinePt(1, yaw, sway, J.neck);
    J.head.copy(J.neck).add(tmp.set(0, .17, .015));
    J.shR.set(.2, -.04, 0).add(J.neck); J.shL.set(-.2, -.04, 0).add(J.neck);
    // embracing the ball: hands in front of the chest, elbows sunk and rounded outward
    const open = .012 * br;
    J.haR.set(.135 + open, J.neck.y - .13, .46 + open * .6); J.haL.set(-.135 - open, J.neck.y - .13, .46 + open * .6);
    ik(J.shR, J.haR, .31, .29, tmp.set(1, -.42, .1), J.elR);
    ik(J.shL, J.haL, .31, .29, tmp.set(-1, -.42, .1), J.elL);
    ballC.set(0, J.neck.y - .15, .3);

    // bones
    BONES.forEach(([a, b], i) => {
      const m = bones[i]; if (!m) return; tmp.copy(J[b]).sub(J[a]); const len = tmp.length();
      m.position.copy(J[a]).addScaledVector(tmp, .5); m.quaternion.setFromUnitVectors(up, tmp.normalize()); m.scale.set(1, Math.max(.01, len - RAD[i] * 1.2), 1);
    });
    MARK.forEach((n, i) => { const r = JR[n] * (1 + S.wSignal * .25 * Math.max(0, Math.sin(t * 5 - i * .7))); mtx.makeScale(r, r, r).setPosition(J[n]); markers.setMatrixAt(i, mtx); });
    markers.instanceMatrix.needsUpdate = true;
    head.position.copy(J.head); visor.position.copy(J.head).add(tmp.set(0, .012, .068)); eye.position.copy(J.head).add(tmp.set(0, .012, .095));
    spinePt(.74, yaw, sway, chest.position); chest.position.z += .015; core.position.copy(chest.position); core.position.z += .102;
    pelvis.position.copy(J.pel); pelvis.position.y -= .005;
    [[J.elR, J.haR], [J.elL, J.haL]].forEach(([e, h], i) => { tmp.copy(h).sub(e).normalize(); hands[i].position.copy(h).addScaledVector(tmp, .06); hands[i].quaternion.setFromUnitVectors(up, tmp); });
    feet[0].position.set(J.anR.x, .03, J.anR.z + .06); feet[1].position.set(J.anL.x, .03, J.anL.z + .06);
    vertebrae.forEach((m, i) => { const u = (i + .5) / VERT; spinePt(u, yaw, sway, m.position); m.position.z -= .02; });
    }
    if (exo.visible) {
      exoSeg.forEach(({ m, a, b, side }) => { tmp.copy(J[b]).sub(J[a]); const len = tmp.length(); m.position.copy(J[a]).addScaledVector(tmp, .5); m.position.x += side * .065; m.quaternion.setFromUnitVectors(up, tmp.normalize()); m.scale.set(1, len * .86, 1); });
      exoAct.forEach(({ m, n, side }) => { m.position.copy(J[n]); m.position.x += side * .065; });
      exoBelt.position.copy(J.pel); exoBelt.position.y -= .01;
    }
    // measured angles
    tmp.copy(J.hipR).sub(J.knR).normalize(); tmp2.copy(J.anR).sub(J.knR).normalize();
    A.knee = 180 - deg(Math.acos(THREE.MathUtils.clamp(tmp.dot(tmp2), -1, 1))); arc(arcKnee, J.knR, tmp, tmp2, .13);
    tmp.copy(J.pel).sub(J.neck).normalize(); tmp2.copy(J.elL).sub(J.shL).normalize();
    A.shoulder = deg(Math.acos(THREE.MathUtils.clamp(tmp.dot(tmp2), -1, 1))); arc(arcSh, J.shL, tmp, tmp2, .15);
    tmp.copy(J.shR).sub(J.elR).normalize(); tmp2.copy(J.haR).sub(J.elR).normalize();
    A.trunk = 180 - deg(Math.acos(THREE.MathUtils.clamp(tmp.dot(tmp2), -1, 1)));

    trails.forEach(([n, l]) => {
      const p = l.geometry.attributes.position.array;
      if (l.userData.fresh) { for (let i = 0; i < TRN; i++) J[n].toArray(p, i * 3); l.userData.fresh = false; }
      else { p.copyWithin(3, 0, (TRN - 1) * 3); J[n].toArray(p, 0); }
      l.geometry.attributes.position.needsUpdate = true;
    });
    // centre of pressure follows the weight shift (plate space: x right, y = -z)
    cop.position.x = J.pel.x * 2 + Math.sin(t * 2.3) * .02 + Math.sin(t * .37) * .07; cop.position.y = -(J.pel.z + .06 + .03 * Math.sin(t * .53)) * 2;
    copPos.copyWithin(3, 0, (COPN - 1) * 3); copPos[0] = cop.position.x; copPos[1] = cop.position.y; copPos[2] = .011;
    copGeo.attributes.position.needsUpdate = true;
  }
  const a0 = V(), a1 = V();
  function arc(line, c, u, v, r) {
    const p = line.geometry.attributes.position.array; c.toArray(p, 0);
    for (let i = 0; i <= ARCN; i++) { a0.copy(u).lerp(v, i / ARCN).normalize(); a1.copy(c).addScaledVector(a0, i === ARCN ? r : r); a1.toArray(p, (i + 1) * 3); }
    line.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- qi / electron galaxy: spiral arms around the plate + a vortex rising round the body
  const small = Math.min(innerWidth, innerHeight) < 700;
  const NG = reduce ? 1200 : small ? 4500 : 10000, gP = new Float32Array(NG * 4), gK = new Float32Array(NG), gr = rng(21);
  const gauss = () => (gr() + gr() + gr() - 1.5) * .8;
  for (let i = 0; i < NG; i++) {
    const riser = i % 4 === 0, r = riser ? gr() : 1.78 + Math.pow(gr(), 1.5) * 5.2;
    gP[i * 4] = r; gP[i * 4 + 1] = riser ? gr() * 6.283 : Math.floor(gr() * 3) * 2.094 + r * .95 + gauss() * .42;
    gP[i * 4 + 2] = gr(); gP[i * 4 + 3] = gr(); gK[i] = riser ? 1 : 0;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NG * 3), 3));
  gGeo.setAttribute('aP', new THREE.BufferAttribute(gP, 4)); gGeo.setAttribute('aKind', new THREE.BufferAttribute(gK, 1));
  const gU = { uTime: { value: 0 }, uSpin: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uMouse: { value: V(99, 99, 0) },
    uBurst: { value: 2 }, uBurstPos: { value: V() }, uEnergy: { value: 0 } };
  const galaxy = new THREE.Points(gGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: gU,
    vertexShader: `attribute vec4 aP; attribute float aKind;
      uniform float uTime,uSpin,uPx,uBurst,uEnergy; uniform vec3 uMouse,uBurstPos; varying float vA; varying float vS;
      void main(){ float r=aP.x, sd=aP.w; vec3 p; vS=sd;
        if(aKind<.5){ float a=aP.y+(uTime*.2+uSpin*.55)/(.35+r*.42);
          p=vec3(cos(a)*r, ${FLOOR.toFixed(2)}+.03+sin(a*3.+sd*20.)*.035*r+(aP.z-.5)*.1, sin(a)*r);
          vA=smoothstep(7.,3.2,r)*(.45+.55*sd);
        } else { float u=fract(aP.z+uTime*(.03+.05*sd)*(1.+uEnergy));
          float rr=mix(1.55,.42,pow(u,.7))*(.55+r*.55), a=aP.y+u*8.+uTime*.25+uSpin*.4;
          p=vec3(cos(a)*rr, ${FLOOR.toFixed(2)}+u*4.1, sin(a)*rr);
          vA=sin(u*3.1416)*(.35+.65*sd);
        }
        vec3 d=p-uMouse; float f=exp(-dot(d,d)*1.3);
        p+=normalize(d+1e-4)*f*.5+cross(vec3(0.,0.,1.),d)*f*1.1;
        vec3 e=p-uBurstPos; float bw=length(e)-uBurst*6.; float b=exp(-bw*bw*7.)*clamp(1.-uBurst,0.,1.);
        p+=normalize(e+1e-4)*b*.4;
        vA*=1.+f*2.2+b*3.5+uEnergy*.5;
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize=uPx*(1.+sd*2.4)*(1.+f*1.4+b*2.)*20./-mv.z; }`,
    fragmentShader: `varying float vA; varying float vS;
      void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.05,d)*vA*1.25;
        vec3 c=mix(vec3(.39,.84,.78),vec3(.93,.9,.84),step(.72,vS)); c=mix(c,vec3(.9,.28,.16),step(.955,vS));
        gl_FragColor=vec4(c*a,a); }`,
  }));
  galaxy.frustumCulled = false; emblem.add(galaxy);

  // ---------- the taiji the robot holds: a ball of particles on springs. Push it and it scatters, then gathers again.
  const WXRGB = [[.95, .3, .18], [.92, .68, .24], [.93, .92, .88], [.3, .55, .92], [.36, .78, .45]];
  const NT = reduce ? 1500 : small ? 3200 : 6000, RB = .2, tr = rng(33);
  const tHome = new Float32Array(NT * 3), tPos = new Float32Array(NT * 3), tVel = new Float32Array(NT * 3), tCol = new Float32Array(NT * 3), tColB = new Float32Array(NT * 3), tColW = new Float32Array(NT * 3), tSize = new Float32Array(NT);
  for (let i = 0; i < NT; i++) {
    let x, y, z; do { x = tr() * 2 - 1; y = tr() * 2 - 1; z = tr() * 2 - 1; } while (x * x + y * y + z * z > 1);
    z *= .5;                                                    // a lens, so the yin-yang reads from the front
    const up_ = Math.hypot(x, y - .5), dn = Math.hypot(x, y + .5);
    let yang = x > 0; if (up_ < .5) yang = true; if (dn < .5) yang = false; if (up_ < .16) yang = false; if (dn < .16) yang = true;
    tHome.set([x * RB, y * RB, z * RB], i * 3);
    const b = .6 + tr() * .4; tColB.set(yang ? [.95 * b, .92 * b, .85 * b] : [.98 * b, .7 * b, .2 * b], i * 3);
    const w = WXRGB[Math.floor(((Math.atan2(x, y) / (Math.PI * 2) + 1.1) % 1) * 5)], core_ = Math.hypot(x, y) < .22;
    tColW.set(core_ ? [.95 * b, .92 * b, .85 * b] : [w[0] * b * 1.25, w[1] * b * 1.25, w[2] * b * 1.25], i * 3); tSize[i] = (yang ? 1 : .8) * (.6 + tr());
    tPos.set([(tr() - .5) * 3, tr() * 2, (tr() - .5) * 3], i * 3);   // they fly in from everywhere on load
  }
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3)); tGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3)); tGeo.setAttribute('aSize', new THREE.BufferAttribute(tSize, 1));
  const taiji = new THREE.Points(tGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, uniforms: { uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `uniform float uPx; attribute float aSize; varying vec3 vC; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=uPx*aSize*27./-mv.z; }`,
    fragmentShader: `varying vec3 vC; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.08,d); gl_FragColor=vec4(vC*a,a); }`,
  }));
  tCol.set(tColW); taiji.frustumCulled = false; fig.add(taiji);
  const rayO = V(), rayD = V(), rayP = V(); let rayOn = 0, raySpeed = 0;
  function updateTaiji(dt) {
    const cs = Math.cos(S.spin), sn = Math.sin(S.spin), K = 13, DAMP = 2.9, RM = .16;
    const push = rayOn > 0 ? (70 + Math.min(raySpeed, 4) * 70) : 0; rayOn -= dt; raySpeed *= Math.exp(-6 * dt);
    let hit = 0;
    for (let i = 0; i < NT; i++) {
      const j = i * 3, hx = (tHome[j] * cs - tHome[j + 1] * sn) * BS + ballC.x, hy = (tHome[j] * sn + tHome[j + 1] * cs) * BS + ballC.y, hz = tHome[j + 2] * BS + ballC.z;
      let ax = (hx - tPos[j]) * K - tVel[j] * DAMP, ay = (hy - tPos[j + 1]) * K - tVel[j + 1] * DAMP, az = (hz - tPos[j + 2]) * K - tVel[j + 2] * DAMP;
      if (push) {
        const vx = tPos[j] - rayO.x, vy = tPos[j + 1] - rayO.y, vz = tPos[j + 2] - rayO.z, tp = vx * rayD.x + vy * rayD.y + vz * rayD.z;
        const px = vx - rayD.x * tp, py = vy - rayD.y * tp, pz = vz - rayD.z * tp, d = Math.hypot(px, py, pz);
        if (d < RM) { const f = push * (1 - d / RM) / (d + .004); ax += px * f + rayP.x * push * 2; ay += py * f + rayP.y * push * 2; az += pz * f; hit++; }
      }
      tVel[j] += ax * dt; tVel[j + 1] += ay * dt; tVel[j + 2] += az * dt;
      tPos[j] += tVel[j] * dt; tPos[j + 1] += tVel[j + 1] * dt; tPos[j + 2] += tVel[j + 2] * dt;
    }
    tGeo.attributes.position.needsUpdate = true;
    if (hit > 40 && raySpeed > .6) hooks.onStir?.(raySpeed);
  }

  // ---------- human ⇄ machine: pulses leave the body's sensor points for the ring and come back
  const SRC = ['haR', 'haL', 'knR', 'knL', 'pel', 'neck', 'elR', 'elL', 'anR', 'anL'], NP = 30, pr = rng(5);
  const pulses = Array.from({ length: NP }, (_, i) => ({ j: SRC[i % SRC.length], ang: pr() * 6.283, u: pr(), sp: .22 + pr() * .3, dir: i % 3 ? 1 : -1 }));
  const pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), lPos = new Float32Array(NP * 6);
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, '#fff'); g.addColorStop(.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const pulsePts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: .2, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const lGeo = new THREE.BufferGeometry(); lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  const links = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: TECH, transparent: true, opacity: .1, depthWrite: false, blending: THREE.AdditiveBlending }));
  pulsePts.frustumCulled = links.frustumCulled = false; emblem.add(links, pulsePts);
  const pa = V(), pb = V();
  function updatePulses(dt) {
    pulses.forEach((p, i) => {
      p.u += dt * p.sp * (1 + S.wSignal * 1.6);
      if (p.u >= 1) { p.u = 0; p.dir = -p.dir; if (p.dir > 0) p.ang = Math.random() * 6.283; }
      pa.copy(J[p.j]).multiplyScalar(2); pa.y += FLOOR;
      const a = p.ang + S.ringSpin;
      pb.set(Math.sin(a) * 2.03 * HS, FLOOR + .02, -Math.cos(a) * 2.03 * HS);
      pa.toArray(lPos, i * 6); pb.toArray(lPos, i * 6 + 3);
      const u = p.u * p.u * (3 - 2 * p.u), k = Math.sin(p.u * Math.PI);
      (p.dir > 0 ? pa.lerp(pb, u) : pb.lerp(pa, u)).toArray(pPos, i * 3);
      if (p.dir > 0) { pCol[i * 3] = .39 * k; pCol[i * 3 + 1] = .84 * k; pCol[i * 3 + 2] = .78 * k; }
      else { pCol[i * 3] = .93 * k; pCol[i * 3 + 1] = .62 * k; pCol[i * 3 + 2] = .5 * k; }
    });
    pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = lGeo.attributes.position.needsUpdate = true;
    links.material.opacity = .07 + S.wSignal * .22;
  }

  // ---------- HUD tags (HTML, so the type stays crisp)
  const hud = document.createElement('div'); hud.className = 'hud'; hud.setAttribute('aria-hidden', 'true');
  const mkTag = (zh, en, flip) => { const d = document.createElement('div'); d.className = 'tag' + (flip ? ' flip' : ''); d.innerHTML = `<b>0°</b><span>${zh}<i>${en}</i></span>`; hud.appendChild(d); return { el: d, num: d.firstChild, last: -1 }; };
  const tags = { knee: mkTag('左膝 屈曲', 'KNEE FLEX', false), shoulder: mkTag('右肩 上舉', 'SHOULDER ELEV', true), trunk: mkTag('左肘 屈曲', 'ELBOW FLEX', false) };
  canvas.after(hud);
  const proj = V();
  function place(tag, joint, val) {
    proj.copy(joint); fig.localToWorld(proj); proj.project(camera);
    tag.el.style.transform = `translate(${((proj.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - proj.y) / 2 * innerHeight).toFixed(1)}px)`;
    const v = Math.round(val); if (v !== tag.last) { tag.num.textContent = v + '°'; tag.last = v; }
  }

  // ---------- state & interaction
  const S = {
    mode: 'taiji', form: 'xingyi', shown: '', tech: 'all', focus: 'hero', scroll: 0, mobile: false,
    mx: 0, my: 0, px: 0, py: 0, spin: 0, vel: 0, ringSpin: 0, drag: false, lastX: 0, dragMoved: 0,
    wDisc: 1, wYY: 0, wRing: 1, wWx: 0, wArc: 1, wTrail: .55, wSignal: 0, wExo: 0, ex: innerWidth < innerHeight ? 0 : 3.7, ey: .8, es: 1, sigT: 0, sigI: 0,
  };
  const eff = () => S.focus === 'wu' ? S.mode : S.form;      // in the 修身 section the three arts pick the figure
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const setNdc = e => ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const active = () => S.focus !== 'other';
  const isUi = e => e.target.closest && e.target.closest('a,button,summary,.nav,.pillar');
  const zPlane = new THREE.Plane(V(0, 0, 1), 0), hitPt = V();
  // cursor in the emblem's own space (on the plane facing the camera)
  const toLocal = (e, out) => { setNdc(e); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(zPlane, hitPt)) return false; emblem.worldToLocal(out.copy(hitPt)); return true; };
  const burst = e => { if (toLocal(e, gU.uBurstPos.value)) { gU.uBurst.value = 0; hooks.onBurst?.(); } };

  addEventListener('pointermove', e => {
    S.mx = e.clientX / innerWidth * 2 - 1; S.my = e.clientY / innerHeight * 2 - 1;
    if (!active() || !toLocal(e, gU.uMouse.value)) gU.uMouse.value.set(99, 99, 0);
    if (active()) {      // same ray, in the figure's space
      fig.worldToLocal(a0.copy(ray.ray.origin)); fig.worldToLocal(a1.copy(ray.ray.origin).add(ray.ray.direction));
      a1.sub(a0).normalize(); const prev = tmp2.copy(rayO).addScaledVector(rayD, 7);
      rayO.copy(a0); rayD.copy(a1); tmp.copy(rayO).addScaledVector(rayD, 7).sub(prev);
      if (rayOn > 0) { rayP.copy(tmp).multiplyScalar(4); raySpeed = Math.min(6, raySpeed + tmp.length() * 6); }
      rayOn = .25;
    }
    if (S.drag) { const d = (e.clientX - S.lastX) * .012; S.lastX = e.clientX; S.spin += d; S.vel = lerp(S.vel, d * 60, .5); S.dragMoved += Math.abs(d); }
    else if (active() && e.pointerType === 'mouse') {
      setNdc(e); ray.setFromCamera(ndc, camera);
      const over = (S.wRing > .5 && ray.intersectObjects(hitPlates).length) || (S.wWx > .5 && ray.intersectObjects(wxNodes).length);
      document.body.style.cursor = over && !isUi(e) ? 'grab' : '';
    }
  }, { passive: true });
  addEventListener('pointerdown', e => {
    if (!active() || isUi(e)) return;
    burst(e);
    setNdc(e); ray.setFromCamera(ndc, camera);
    const tri = S.wRing > .5 ? ray.intersectObjects(hitPlates)[0] : null;
    if (tri) { const i = tri.object.userData.tri; trigrams[i].userData.pulse = 1; S.vel += 3; hooks.onTrigram?.(i); return; }
    const wx = S.wWx > .5 ? ray.intersectObjects(wxNodes)[0] : null;
    if (wx) { const i = wx.object.userData.wx; wx.object.userData.pulse = 1; S.vel += 3; hooks.onTrigram?.(i); return; }
    S.vel += 4;
  });
  addEventListener('pointerup', () => {
    if (!S.drag) return; S.drag = false; document.body.style.cursor = '';
    if (S.dragMoved < .02) S.vel += 7;
    S.vel = THREE.MathUtils.clamp(S.vel, -22, 22);
    if (Math.abs(S.vel) > 2.5) hooks.onSpin?.(Math.abs(S.vel));
  });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; S.mobile = camera.aspect < 1.05;
    const base = Math.tan(THREE.MathUtils.degToRad(19));
    camera.fov = deg(Math.atan(base * Math.max(1, (S.mobile ? .62 : 1.45) / camera.aspect))) * 2;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const clock = new THREE.Clock(); let running = true, time = 0;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); tick(); } });
  const cRed = new THREE.Color(RED), cPaper = new THREE.Color(PAPER);

  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), .05); time += reduce ? 0 : dt; const t = time + 1.2;
    S.px = damp(S.px, S.mx, 3, dt); S.py = damp(S.py, S.my, 3, dt);

    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z, halfW = halfH * camera.aspect;
    let tx, ty, ts;
    if (S.mobile) { const hero = S.focus === 'hero';      // phone: the figure owns the top of the screen, the text sits below it
      ts = hero ? Math.min(1.2, halfW / 2.05, halfH / 4.3) : Math.min(1.2, halfW / 2.5, halfH / 5.4); tx = 0; ty = camera.position.y + halfH * (hero ? .3 : .34); }
    else { ts = Math.min(1.6, halfW / 5, halfH / 2.75); tx = halfW * .48; ty = camera.position.y + .25; }
    if (S.focus === 'other') { ts *= .8; if (!S.mobile) tx = halfW * .66; }
    S.ex = damp(S.ex, tx, 2.5, dt); S.ey = damp(S.ey, ty, 2.5, dt); S.es = damp(S.es, ts, 2.5, dt);

    const m = S.mode, k = S.tech;
    const e = eff(), five = e === 'xingyi'; if (e !== S.shown) applyForm();
    S.wRing = damp(S.wRing, five || e === 'taiji' ? 0 : 1.1, 4, dt);
    S.wYY = damp(S.wYY, e === 'taiji' ? 1 : 0, 4, dt); yy.scale.setScalar(Math.max(S.wYY, .0001)); yy.visible = S.wYY > .01; yy.rotation.z = -S.spin * .35;
    S.wWx = damp(S.wWx, five ? 1 : 0, 4, dt);
    S.wArc = damp(S.wArc, k === 'all' || k === 'ortho' || k === 'assist' ? 1 : 0, 5, dt);
    S.wTrail = damp(S.wTrail, k === 'motion' ? 1 : k === 'all' ? .55 : 0, 4, dt);
    S.wSignal = damp(S.wSignal, k === 'signal' ? 1 : k === 'assist' ? .45 : 0, 4, dt);
    S.wExo = damp(S.wExo, k === 'assist' ? 1 : 0, 5, dt); exo.visible = S.wExo > .02;

    camera.position.x = S.px * .55;
    camera.position.y = 1.2 - S.py * .3 - S.scroll * 2.2;
    camera.lookAt(camera.position.x * .4, camera.position.y - .15, 0);
    mountains.forEach(mn => { mn.position.y = S.scroll * lerp(3.5, 0, mn.userData.depth); });
    const sk = (CAM_Z + 36) / CAM_Z;
    sun.scale.setScalar(2.5 * sk * S.es);
    sun.position.set((S.ex + .9 * S.es) * sk, (S.ey - 1.2) * sk + 1.2 + 1.5 * S.es * sk, -36);

    if (!S.drag) { S.spin += (S.vel + (reduce ? 0 : .13)) * dt; S.vel *= Math.exp(-1.1 * dt); }
    S.ringSpin -= (reduce ? 0 : (eff() === 'bagua' ? .2 : .04)) * dt + S.vel * dt * .1;
    emblem.position.set(S.ex, S.ey, 0); emblem.scale.setScalar(S.es);
    emblem.rotation.set(.15 + S.py * .12, -.3 + S.px * .34, 0);
    ring.rotation.z = S.ringSpin; ring.scale.setScalar(Math.max(S.wRing, .0001)); ring.visible = S.wRing > .01;
    wuxing.rotation.z = -S.ringSpin * .6; wuxing.scale.setScalar(Math.max(S.wWx, .0001)); wuxing.visible = S.wWx > .01;
    wxNodes.forEach(n => { n.rotation.z = -wuxing.rotation.z; }); if (wuxing.visible) updateWuxing(t, dt);
    trigrams.forEach(g => { const u = g.userData; if (u.pulse > 0 || !u.mat.color.equals(cPaper)) { u.pulse = Math.max(0, u.pulse - dt * .9); u.mat.color.copy(cPaper).lerp(cRed, u.pulse); g.scale.setScalar(1 + u.pulse * .16); } });

    pose(t);
    updateTaiji(dt);
    arcKnee.visible = arcSh.visible = S.wArc > .5;
    trails.forEach(([, l]) => { l.material.opacity = S.wTrail; l.visible = S.wTrail > .02; });

    // signal ring: the knee angle, sampled 30×/s, wrapped around the halo
    S.sigT += dt;
    if (S.sigT > 1 / 30) { S.sigT = 0; S.sigI = (S.sigI + 1) % SIGN; sig[S.sigI] = (A.knee - 40) / 30 + Math.sin(t * 9) * .12 + (Math.random() - .5) * .1; }
    const amp = .1 + S.wSignal * .22;
    for (let i = 0; i < SIGN; i++) { const a = i / SIGN * Math.PI * 2, age = ((S.sigI - i + SIGN) % SIGN) / SIGN, r = 3.25 + sig[i] * amp * (1 - age * .6); sigPos[i * 3] = Math.sin(a) * r; sigPos[i * 3 + 1] = Math.cos(a) * r; }
    sigGeo.attributes.position.needsUpdate = true;

    updatePulses(dt);
    gU.uTime.value = t; gU.uSpin.value = S.spin; gU.uEnergy.value = S.wSignal;
    if (gU.uBurst.value < 1.5) gU.uBurst.value += dt * .7;

    emblem.updateMatrixWorld(true);
    place(tags.knee, J.knR, A.knee); place(tags.shoulder, J.shL, A.shoulder); place(tags.trunk, J.elR, A.trunk);
    hud.classList.toggle('show', S.wArc > .5 && active());

    moteMat.uniforms.uTime.value = t;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  return {
    setMode(m) { S.mode = m; },
    setForm(f) { S.form = f; applyForm(); },
    setTech(k) { S.tech = k; },
    setFocus(f) { S.focus = f; if (f !== 'wu') S.mode = 'taiji'; if (f !== 'tech') S.tech = 'all'; },
    setScroll(v) { S.scroll = v; },
    pulseAll() { trigrams.forEach((g, i) => setTimeout(() => { g.userData.pulse = .8; }, i * 70)); },
    taijiSpread() { let d = 0; const cs = Math.cos(S.spin), sn = Math.sin(S.spin); for (let i = 0; i < NT; i++) { const j = i * 3; d += Math.hypot(tPos[j] - ((tHome[j] * cs - tHome[j + 1] * sn) * BS + ballC.x), tPos[j + 1] - ((tHome[j] * sn + tHome[j + 1] * cs) * BS + ballC.y), tPos[j + 2] - tHome[j + 2] * BS - ballC.z); } return d / NT; },
    state: S, angles: A, renderer,
  };
}
