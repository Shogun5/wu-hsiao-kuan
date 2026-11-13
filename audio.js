// All sound is synthesised in the browser (no audio files): mountain wind, a low drone,
// a singing bowl, guqin-like plucked strings, a frame drum and a sleeve "whoosh".
const PENTA = [73.42, 82.41, 92.5, 110, 123.47, 146.83, 164.81, 185, 220, 246.94]; // D 宮商角徵羽, two octaves

export class Sound {
  constructor() { this.on = false; this.ctx = null; this.cache = new Map(); this.last = 0; }

  async toggle() {
    if (!this.ctx) this.#build();
    this.on = !this.on;
    if (this.on) { await this.ctx.resume(); this.master.gain.setTargetAtTime(.8, this.ctx.currentTime, .4); this.bowl(); }
    else this.master.gain.setTargetAtTime(0, this.ctx.currentTime, .15);
    return this.on;
  }

  #noise(sec) {
    const c = this.ctx, b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  #build() {
    const c = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = c.createGain(); this.master.gain.value = 0;
    const comp = c.createDynamicsCompressor(); this.master.connect(comp).connect(c.destination);

    // reverb: decaying noise as the impulse of a stone hall
    const len = c.sampleRate * 3.2, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.verb = c.createConvolver(); this.verb.buffer = ir;
    const wet = c.createGain(); wet.gain.value = .5; this.verb.connect(wet).connect(this.master);
    this.white = this.#noise(2);

    // wind: band-passed noise that swells slowly
    const wind = c.createBufferSource(); wind.buffer = this.white; wind.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .7;
    const wg = c.createGain(); wg.gain.value = .035;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .07; lg.gain.value = .022; lfo.connect(lg).connect(wg.gain);
    const lfo2 = c.createOscillator(), lg2 = c.createGain(); lfo2.frequency.value = .11; lg2.gain.value = 160; lfo2.connect(lg2).connect(bp.frequency);
    wind.connect(bp).connect(wg).connect(this.master); wind.start(); lfo.start(); lfo2.start();

    // drone: D + A, barely there
    [[73.42, .03], [73.9, .022], [110, .016]].forEach(([f, g]) => {
      const o = c.createOscillator(), og = c.createGain(); o.frequency.value = f; og.gain.value = g;
      o.connect(og).connect(this.master); og.connect(this.verb); o.start();
    });
  }

  #out(node, dry = 1, wet = .6) {
    const d = this.ctx.createGain(); d.gain.value = dry; node.connect(d).connect(this.master);
    const w = this.ctx.createGain(); w.gain.value = wet; node.connect(w).connect(this.verb);
  }

  // Karplus–Strong string, rendered once per pitch
  #string(freq) {
    if (this.cache.has(freq)) return this.cache.get(freq);
    const sr = this.ctx.sampleRate, n = Math.round(sr / freq), len = Math.floor(sr * 3.4);
    const buf = this.ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < n; i++) { const x = Math.random() * 2 - 1; prev = d[i] = prev * .55 + x * .45; }   // soft pluck: pre-filtered burst
    for (let i = n; i < len; i++) d[i] = (d[i - n] + d[i - n + 1]) * .5 * .9975;
    this.cache.set(freq, buf); return buf;
  }

  pluck(i = 0, gain = .5) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime;
    if (t - this.last < .06) return; this.last = t;
    const f = PENTA[((i % PENTA.length) + PENTA.length) % PENTA.length];
    const s = c.createBufferSource(); s.buffer = this.#string(f);
    s.playbackRate.setValueAtTime(1.035, t); s.playbackRate.exponentialRampToValueAtTime(1, t + .22);   // the finger slide of a guqin
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 2.4);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.setTargetAtTime(0, t + 1.6, .6);
    s.connect(lp).connect(g); this.#out(g, 1, .55); s.start(t); s.stop(t + 3.4);
  }

  bowl(base = 220, gain = .16) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime, g = c.createGain(); g.gain.value = gain;
    [[1, 1, 7], [1.004, .6, 7], [2.71, .5, 4.5], [2.725, .3, 4.5], [5.18, .22, 2.6], [8.3, .1, 1.5]].forEach(([m, a, dur]) => {
      const o = c.createOscillator(), og = c.createGain(); o.frequency.value = base * m;
      og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(a, t + .012); og.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(og).connect(g); o.start(t); o.stop(t + dur + .1);
    });
    this.#out(g, 1, .8);
  }

  drum(gain = .7) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(118, t); o.frequency.exponentialRampToValueAtTime(46, t + .28);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
    o.connect(g); this.#out(g, 1, .5); o.start(t); o.stop(t + 1.2);
    const n = c.createBufferSource(); n.buffer = this.white;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    const ng = c.createGain(); ng.gain.setValueAtTime(gain * .4, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .09);
    n.connect(lp).connect(ng); this.#out(ng, 1, .3); n.start(t); n.stop(t + .12);
  }

  // a soft electronic "signal" blip with one echo
  blip(freq = 880, gain = .09) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime;
    if (t - this.lastBlip < .08) return; this.lastBlip = t;
    [0, .16].forEach((dly, i) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(freq * (i ? 1.5 : 1), t + dly); o.frequency.exponentialRampToValueAtTime(freq * (i ? 1.5 : 1) * .985, t + dly + .2);
      g.gain.setValueAtTime(0, t + dly); g.gain.linearRampToValueAtTime(gain / (1 + i * 1.6), t + dly + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dly + .28);
      o.connect(g); this.#out(g, 1, .7); o.start(t + dly); o.stop(t + dly + .3);
    });
  }

  whoosh(power = 1) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime, k = Math.min(1, power / 18);
    const n = c.createBufferSource(); n.buffer = this.white; n.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(260, t); bp.frequency.exponentialRampToValueAtTime(900 + 1400 * k, t + .22); bp.frequency.exponentialRampToValueAtTime(240, t + .9 + k);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.1 + .16 * k, t + .16); g.gain.exponentialRampToValueAtTime(.0001, t + 1 + k);
    n.connect(bp).connect(g); this.#out(g, 1, .5); n.start(t); n.stop(t + 1.2 + k);
  }
}
