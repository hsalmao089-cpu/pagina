#!/usr/bin/env node
/* ==========================================================================
   TRILHA E EFEITOS — sintetizados do zero, sem sample, sem dependência.

   Gera em public/audio/:
     trilha.wav  música de 33 s, 120 bpm, lá menor, montada sobre a linha do
                 tempo do vídeo (src/timeline.json): trabalho → trava (tape
                 stop) → tensão → subida → drop no quadro 300 → golpe final.
     *.wav       efeitos curtos que as cenas posicionam quadro a quadro.

   Tudo sai de um gerador com semente fixa: rodar de novo gera arquivos
   idênticos, bit a bit.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tl = JSON.parse(fs.readFileSync(path.join(RAIZ, 'src/timeline.json'), 'utf8'));
const SAIDA = path.join(RAIZ, 'public/audio');
fs.mkdirSync(SAIDA, {recursive: true});

const SR = 48000;
const TEMPO = 60 / tl.bpm; // 0,5 s
const COMPASSO = TEMPO * 4; // 2 s
const DUR = tl.duracao / tl.fps; // 33 s
const seg = (quadro) => quadro / tl.fps;

// marcas da linha do tempo (src/timeline.json) que a música obedece
const T_ERRO = seg(tl.marcas.erro); // a barra chega a 100%: tape stop
const T_TENSAO = seg(tl.marcas.amarras); // batimento enquanto as fitas amarram
const T_SUBIDA = seg(tl.marcas.chave); // subida enquanto as duas linhas são digitadas
const T_DROP = seg(tl.marcas.drop); // o Enter: drop
const T_ENERGIA = seg(tl.marcas.agentes); // palmas, chimbal e arpejo
const T_OITAVA = seg(tl.marcas.editores); // arpejo sobe uma oitava
const T_FINAL = seg(tl.marcas.golpeFinal); // golpe final

/* --------------------------------------------------------------------------
   Utilidades
   -------------------------------------------------------------------------- */

const gerador = (semente) => {
	let a = semente >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};
let rnd = gerador(33);
const ruido = () => rnd() * 2 - 1;

const amostras = (s) => Math.max(1, Math.round(s * SR));
const vazio = (s) => new Float32Array(amostras(s));
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

class Biquad {
	constructor() {
		this.x1 = this.x2 = this.y1 = this.y2 = 0;
		this.b0 = 1;
		this.b1 = this.b2 = this.a1 = this.a2 = 0;
	}
	set(tipo, f, q = 0.707) {
		const w = (2 * Math.PI * Math.min(Math.max(f, 10), SR * 0.45)) / SR;
		const cs = Math.cos(w);
		const al = Math.sin(w) / (2 * q);
		let b0, b1, b2;
		if (tipo === 'lp') [b0, b1, b2] = [(1 - cs) / 2, 1 - cs, (1 - cs) / 2];
		else if (tipo === 'hp') [b0, b1, b2] = [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2];
		else [b0, b1, b2] = [al, 0, -al]; // bp, pico em 0 dB
		const a0 = 1 + al;
		this.b0 = b0 / a0;
		this.b1 = b1 / a0;
		this.b2 = b2 / a0;
		this.a1 = (-2 * cs) / a0;
		this.a2 = (1 - al) / a0;
		return this;
	}
	p(x) {
		const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
		this.x2 = this.x1;
		this.x1 = x;
		this.y2 = this.y1;
		this.y1 = y;
		return y;
	}
}

/** Filtro com corte variando no tempo (coeficientes recalculados a cada 32 amostras). */
const filtrar = (x, tipo, corte, q = 0.707) => {
	const f = new Biquad();
	const y = new Float32Array(x.length);
	for (let i = 0; i < x.length; i++) {
		if (i % 32 === 0) f.set(tipo, typeof corte === 'function' ? corte(i / SR) : corte, q);
		y[i] = f.p(x[i]);
	}
	return y;
};

// dente de serra com PolyBLEP: sem o chiado de aliasing da serra ingênua
const blep = (t, dt) => {
	if (t < dt) {
		t /= dt;
		return t + t - t * t - 1;
	}
	if (t > 1 - dt) {
		t = (t - 1) / dt;
		return t * t + t + t + 1;
	}
	return 0;
};
const serra = (p, dt) => 2 * p - 1 - blep(p, dt);

/** Soma `x` em `L`/`R` a partir de `t0`, com pan de potência constante (-1..1). */
const somar = (L, R, x, t0, ganho = 1, pan = 0) => {
	const i0 = Math.round(t0 * SR);
	const gl = Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2 * ganho;
	const gr = Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2 * ganho;
	for (let i = 0; i < x.length; i++) {
		const j = i0 + i;
		if (j < 0 || j >= L.length) continue;
		L[j] += x[i] * gl;
		R[j] += x[i] * gr;
	}
};

const pico = (...cs) => cs.reduce((m, c) => c.reduce((a, v) => Math.max(a, Math.abs(v)), m), 0);
const normalizar = (cs, alvo) => {
	const p = pico(...cs) || 1;
	for (const c of cs) for (let i = 0; i < c.length; i++) c[i] *= alvo / p;
	return cs;
};
const dB = (db) => Math.pow(10, db / 20);

/* Reverb Freeverb (Schroeder–Moorer). Devolve só o sinal molhado. */
class Pente {
	constructor(n) {
		this.b = new Float32Array(n);
		this.i = 0;
		this.s = 0;
	}
	p(x, fb, amort) {
		const y = this.b[this.i];
		this.s = y * (1 - amort) + this.s * amort;
		this.b[this.i] = x + this.s * fb;
		if (++this.i >= this.b.length) this.i = 0;
		return y;
	}
}
class PassaTudo {
	constructor(n) {
		this.b = new Float32Array(n);
		this.i = 0;
	}
	p(x) {
		const bo = this.b[this.i];
		this.b[this.i] = x + bo * 0.5;
		if (++this.i >= this.b.length) this.i = 0;
		return bo - x;
	}
}
const reverb = (L, R, {sala = 0.82, amort = 0.3} = {}) => {
	const esc = SR / 44100;
	const pentes = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
	const passa = [556, 441, 341, 225];
	const lado = (d) => ({
		c: pentes.map((n) => new Pente(Math.round((n + d) * esc))),
		a: passa.map((n) => new PassaTudo(Math.round((n + d) * esc))),
	});
	const l = lado(0);
	const r = lado(23);
	const fb = sala * 0.28 + 0.7;
	const am = amort * 0.4;
	const oL = new Float32Array(L.length);
	const oR = new Float32Array(L.length);
	for (let i = 0; i < L.length; i++) {
		const e = (L[i] + R[i]) * 0.015;
		let sl = 0;
		let sr = 0;
		for (const c of l.c) sl += c.p(e, fb, am);
		for (const c of r.c) sr += c.p(e, fb, am);
		for (const a of l.a) sl = a.p(sl);
		for (const a of r.a) sr = a.p(sr);
		oL[i] = sl;
		oR[i] = sr;
	}
	return [oL, oR];
};

/** Eco pingue-pongue in-place. */
const pingue = (L, R, tempo, fb, mix) => {
	const n = Math.round(tempo * SR);
	const bl = new Float32Array(n);
	const br = new Float32Array(n);
	let i = 0;
	const lp = new Biquad().set('lp', 4200);
	for (let k = 0; k < L.length; k++) {
		const dl = bl[i];
		const dr = br[i];
		const e = lp.p((L[k] + R[k]) * 0.5);
		bl[i] = e + dr * fb;
		br[i] = dl * fb;
		L[k] += dl * mix;
		R[k] += dr * mix;
		if (++i >= n) i = 0;
	}
};

/** Limitador com antecipação: segura picos sem estalar. */
const limitar = (L, R, teto = dB(-1), antecipa = 0.005, solta = 0.12) => {
	const n = L.length;
	const look = Math.round(antecipa * SR);
	const precisa = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
		precisa[i] = p > teto ? teto / p : 1;
	}
	// mínimo na janela [i, i+look] (fila monotônica)
	const minimo = new Float32Array(n);
	const fila = [];
	for (let i = n - 1; i >= 0; i--) {
		while (fila.length && precisa[fila[fila.length - 1]] >= precisa[i]) fila.pop();
		fila.push(i);
		while (fila[0] > i + look) fila.shift();
		minimo[i] = precisa[fila[0]];
	}
	const rel = Math.exp(-1 / (solta * SR));
	let g = 1;
	const env = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		g = minimo[i] < g ? minimo[i] : minimo[i] + (g - minimo[i]) * rel;
		env[i] = g;
	}
	// média móvel: ataque suave que chega ao ganho certo exatamente no pico
	let soma = 0;
	for (let i = 0; i < n; i++) {
		soma += env[i];
		if (i >= look) soma -= env[i - look];
		// cada ganho da janela já contempla o pico à frente, então a média também
		const gm = soma / Math.min(i + 1, look);
		L[i] *= gm;
		R[i] *= gm;
	}
};

const salvar = (nome, canais) => {
	const n = canais[0].length;
	const ch = canais.length;
	const buf = Buffer.alloc(44 + n * ch * 2);
	buf.write('RIFF', 0);
	buf.writeUInt32LE(36 + n * ch * 2, 4);
	buf.write('WAVE', 8);
	buf.write('fmt ', 12);
	buf.writeUInt32LE(16, 16);
	buf.writeUInt16LE(1, 20);
	buf.writeUInt16LE(ch, 22);
	buf.writeUInt32LE(SR, 24);
	buf.writeUInt32LE(SR * ch * 2, 28);
	buf.writeUInt16LE(ch * 2, 32);
	buf.writeUInt16LE(16, 34);
	buf.write('data', 36);
	buf.writeUInt32LE(n * ch * 2, 40);
	let o = 44;
	for (let i = 0; i < n; i++) {
		for (let c = 0; c < ch; c++) {
			const v = Math.max(-1, Math.min(1, canais[c][i]));
			buf.writeInt16LE(Math.round(v * 32767), o);
			o += 2;
		}
	}
	fs.writeFileSync(path.join(SAIDA, `${nome}.wav`), buf);
	return `${nome}.wav  ${(n / SR).toFixed(2)} s  pico ${(20 * Math.log10(pico(...canais) || 1e-9)).toFixed(1)} dBFS`;
};

/* --------------------------------------------------------------------------
   Instrumentos (one-shots mono)
   -------------------------------------------------------------------------- */

// Celular não reproduz abaixo de ~150 Hz: o bumbo precisa de soco e clique,
// não só de subgrave, ou ele some no alto-falante.
const bumbo = (v = 1, grave = 54) => {
	const x = vazio(0.45);
	let fase = 0;
	let fase2 = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f = grave + 95 * Math.exp(-t / 0.04) + 40 * Math.exp(-t / 0.007);
		fase += (2 * Math.PI * f) / SR;
		fase2 += (2 * Math.PI * (95 + 70 * Math.exp(-t / 0.015))) / SR;
		const corpo = Math.sin(fase) * Math.exp(-t / 0.19) * Math.min(1, t / 0.001);
		const soco = Math.sin(fase2) * Math.exp(-t / 0.035) * 0.45;
		x[i] = Math.tanh((corpo + soco) * 1.7);
	}
	const clique = filtrar(
		Float32Array.from({length: amostras(0.012)}, (_, i) => ruido() * Math.exp(-i / SR / 0.0022)),
		'hp',
		2500,
	);
	for (let i = 0; i < clique.length; i++) x[i] += clique[i] * 0.55;
	for (let i = 0; i < x.length; i++) x[i] *= v;
	return x;
};

const chimbal = (aberto = false, v = 1) => {
	const dur = aberto ? 0.3 : 0.07;
	const tau = aberto ? 0.11 : 0.026;
	const x = Float32Array.from({length: amostras(dur)}, (_, i) => ruido() * Math.exp(-i / SR / tau));
	const y = filtrar(filtrar(x, 'hp', 7200), 'hp', 5200);
	for (let i = 0; i < y.length; i++) y[i] *= v;
	return y;
};

const palma = (v = 1) => {
	const x = vazio(0.45);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		let e = 0;
		for (const k of [0, 0.011, 0.022]) if (t >= k) e += Math.exp(-(t - k) / 0.0045);
		if (t >= 0.028) e += 0.9 * Math.exp(-(t - 0.028) / 0.12);
		x[i] = ruido() * e;
	}
	const y = filtrar(x, 'bp', 1150, 1.1);
	for (let i = 0; i < y.length; i++) y[i] *= v * 1.6;
	return y;
};

const caixa = (v = 1) => {
	const x = vazio(0.3);
	let fase = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (185 + 60 * Math.exp(-t / 0.01))) / SR;
		x[i] = ruido() * Math.exp(-t / 0.075) * 0.9 + Math.sin(fase) * Math.exp(-t / 0.05) * 0.6;
	}
	const y = filtrar(x, 'bp', 1900, 0.7);
	for (let i = 0; i < y.length; i++) y[i] *= v * 1.4;
	return y;
};

/** Pulsação grave, como batimento: a tensão da cena do custo. */
const pulso = (v = 1) => {
	const x = vazio(0.5);
	let fase = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (72 + 70 * Math.exp(-t / 0.02))) / SR;
		x[i] = Math.tanh(Math.sin(fase) * 1.5) * Math.exp(-t / 0.16) * Math.min(1, t / 0.003) * v;
	}
	return x;
};

/** Prato: ruído agudo + quadradas desafinadas (receita do 808). */
const prato = (v = 1, dur = 2.2) => {
	const freqs = [205.3, 304.4, 369.6, 522.7, 540, 800].map((f) => f * 2.1);
	const x = vazio(dur);
	const fases = freqs.map(() => rnd());
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		let m = 0;
		for (let k = 0; k < freqs.length; k++) {
			fases[k] = (fases[k] + freqs[k] / SR) % 1;
			m += fases[k] < 0.5 ? 1 : -1;
		}
		x[i] = (ruido() * 0.8 + (m / freqs.length) * 0.5) * Math.exp(-t / 0.7) * Math.min(1, t / 0.002);
	}
	const y = filtrar(x, 'hp', 5500);
	for (let i = 0; i < y.length; i++) y[i] *= v;
	return y;
};

const baixo = (freq, dur, v = 1) => {
	const x = vazio(dur + 0.05);
	const dt = freq / SR;
	let p = 0;
	let s = 0;
	const f = new Biquad();
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		p = (p + dt) % 1;
		s = (s + dt) % 2; // meia frequência: o sub fica uma oitava abaixo da serra
		if (i % 32 === 0) f.set('lp', 480 + 1800 * Math.exp(-t / 0.07), 1.2);
		const corpo = f.p(serra(p, dt) * 0.8) + Math.sin(Math.PI * s) * 0.4;
		const amp = Math.min(1, t / 0.003) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.05));
		x[i] = Math.tanh(corpo * 1.3) * amp * v;
	}
	return x;
};

/** Acorde de pad: duas serras desafinadas por nota, abertas no estéreo. */
const pad = (notas, dur, v = 1, corte = 1500) => {
	const n = amostras(dur + 0.6);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	for (const nota of notas) {
		const fr = midi(nota);
		for (const [cents, pan] of [
			[-8, -0.7],
			[7, 0.7],
			[0, 0],
		]) {
			const f = fr * Math.pow(2, cents / 1200);
			const dt = f / SR;
			let p = rnd();
			const x = new Float32Array(n);
			for (let i = 0; i < n; i++) {
				const t = i / SR;
				p = (p + dt) % 1;
				const env = Math.min(1, t / 0.09) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.5));
				x[i] = serra(p, dt) * env;
			}
			somar(L, R, x, 0, (cents === 0 ? 0.5 : 0.8) / notas.length, pan);
		}
	}
	const oL = filtrar(L, 'lp', corte, 0.6);
	const oR = filtrar(R, 'lp', corte, 0.6);
	for (let i = 0; i < n; i++) {
		oL[i] *= v;
		oR[i] *= v;
	}
	return [oL, oR];
};

const pluck = (freq, v = 1) => {
	const x = vazio(0.45);
	const dt = freq / SR;
	let p = 0;
	const f = new Biquad();
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		p = (p + dt) % 1;
		if (i % 32 === 0) f.set('lp', 700 + 3200 * Math.exp(-t / 0.05), 0.9);
		const tri = 1 - 4 * Math.abs(p - 0.5);
		x[i] = f.p(tri * 0.6 + serra(p, dt) * 0.4) * Math.exp(-t / 0.12) * Math.min(1, t / 0.002) * v;
	}
	return x;
};

/* --------------------------------------------------------------------------
   TRILHA
   -------------------------------------------------------------------------- */

const trilha = () => {
	rnd = gerador(1207);
	const n = amostras(DUR + 0.5);
	const bus = () => [new Float32Array(n), new Float32Array(n)];
	const bateria = bus();
	const graves = bus(); // baixo: recebe o sidechain
	const harmonia = bus(); // pad: recebe o sidechain
	const arpejo = bus();
	const efeitos = bus(); // drone, subida
	const envio = bus(); // manda para o reverb

	// harmonia do drop em diante, um acorde por compasso: i – VI – III – VII
	const Am = {baixo: 45, pad: [57, 60, 64], arp: [69, 72, 76, 81]};
	const F = {baixo: 41, pad: [57, 60, 65], arp: [65, 69, 72, 77]};
	const C = {baixo: 48, pad: [55, 60, 64], arp: [67, 72, 76, 79]};
	const G = {baixo: 43, pad: [55, 59, 62], arp: [67, 71, 74, 79]};
	const compassos = Math.round((T_FINAL - T_DROP) / COMPASSO);
	const progressao = Array.from({length: compassos}, (_, i) =>
		i >= compassos - 2 ? [F, G][i - (compassos - 2)] : [Am, F, C, G][i % 4],
	);

	const bumbos = [];

	/* ---- A · trabalho (0 → erro): groove leve, o Claude Code rodando ---- */
	const A = bus();
	for (let b = 0; b * TEMPO < T_ERRO + 0.5; b++) {
		const t = b * TEMPO;
		somar(A[0], A[1], bumbo(0.55), t, 0.8);
		somar(A[0], A[1], chimbal(false, 0.5), t + TEMPO / 2, 0.5, 0.3);
		somar(A[0], A[1], chimbal(false, 0.25), t + TEMPO / 4, 0.4, -0.3);
		somar(A[0], A[1], chimbal(false, 0.25), t + (3 * TEMPO) / 4, 0.4, -0.3);
		somar(A[0], A[1], baixo(midi(45), TEMPO / 2 - 0.03, 0.5), t + TEMPO / 2, 0.8);
	}
	const [paL, paR] = pad(Am.pad, T_ERRO + 0.5, 0.35, 2000);
	somar(A[0], A[1], paL, 0, 1, -1);
	somar(A[0], A[1], paR, 0, 1, 1);

	// tape stop: a música perde rotação até parar, exatamente no erro
	const PARA = 0.42;
	for (let i = 0; i < amostras(T_ERRO + PARA); i++) {
		const t = i / SR;
		let pos = t;
		let g = 1;
		if (t > T_ERRO) {
			const u = Math.min(1, (t - T_ERRO) / PARA);
			// integral da rotação 1 → 0 com curva
			pos = T_ERRO + PARA * (u - (u * u * u) / 3) * 0.75;
			g = 1 - u * u;
		}
		const k = pos * SR;
		const k0 = Math.floor(k);
		const fr = k - k0;
		for (let c = 0; c < 2; c++) {
			const v = A[c][k0] * (1 - fr) + (A[c][k0 + 1] ?? 0) * fr;
			// +3 dB: o gancho é a primeira impressão de quem está com som
			efeitos[c][i] += v * g * 1.4;
		}
	}

	/* ---- B · tensão (depois do erro → drop): drone que abre devagar ---- */
	{
		const ini = T_ERRO + 0.55;
		const fim = T_DROP - 0.2;
		const x = new Float32Array(amostras(fim - ini));
		let p1 = 0;
		let p2 = 0;
		let p3 = 0;
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			const d1 = midi(33) / SR;
			const d2 = midi(40) / SR;
			p1 = (p1 + d1) % 1;
			p2 = (p2 + d2 * 1.002) % 1;
			p3 = (p3 + midi(33) / SR) % 1;
			x[i] = serra(p1, d1) * 0.5 + serra(p2, d2) * 0.4 + Math.sin(2 * Math.PI * p3) * 0.3;
		}
		const total = fim - ini;
		const y = filtrar(x, 'lp', (t) => 320 + 1900 * Math.pow(t / total, 1.8), 1.3);
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			y[i] *= Math.min(1, t / 1.2) * (0.25 + 0.35 * (t / total)) * Math.min(1, (total - t) / 0.05);
		}
		somar(efeitos[0], efeitos[1], y, ini, 0.9);

		// fio agudo: lá e mi batendo devagar, com tremolo — suspense audível no celular
		const fio = new Float32Array(y.length);
		for (let i = 0; i < fio.length; i++) {
			const t = i / SR;
			const trem = 0.6 + 0.4 * Math.sin(2 * Math.PI * 4 * t);
			fio[i] =
				(Math.sin(2 * Math.PI * midi(81) * t) + 0.7 * Math.sin(2 * Math.PI * midi(88) * 1.003 * t)) *
				trem *
				Math.pow(Math.min(1, t / total), 1.5) *
				Math.min(1, (total - t) / 0.05);
		}
		somar(efeitos[0], efeitos[1], fio, ini, 0.05, -0.3);
		somar(envio[0], envio[1], fio, ini, 0.08);
	}
	// batimento a cada tempo, do custo até a virada
	for (let t = T_TENSAO; t < T_SUBIDA - 0.01; t += TEMPO) {
		somar(bateria[0], bateria[1], pulso(0.8), t, 0.75);
	}

	/* ---- C · subida (virada → drop) ---- */
	{
		const dur = T_DROP - T_SUBIDA - 0.18;
		const x = Float32Array.from({length: amostras(dur)}, () => ruido());
		const y = filtrar(x, 'bp', (t) => 350 * Math.pow(9000 / 350, t / dur), 1.8);
		let fase = 0;
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			const u = t / dur;
			fase += (2 * Math.PI * 110 * Math.pow(8, u)) / SR;
			y[i] = y[i] * Math.pow(u, 1.6) * 1.5 + Math.sin(fase) * Math.pow(u, 2) * 0.18;
			y[i] *= Math.min(1, (dur - t) / 0.02);
		}
		somar(efeitos[0], efeitos[1], y, T_SUBIDA, 0.8);
		somar(envio[0], envio[1], y, T_SUBIDA, 0.3);

		// rufar acelerando: colcheia → semicolcheia → fusa
		const marcas = [];
		for (let t = T_SUBIDA; t < T_SUBIDA + 1.0; t += TEMPO / 2) marcas.push(t);
		for (let t = T_SUBIDA + 1.0; t < T_SUBIDA + 1.5; t += TEMPO / 4) marcas.push(t);
		for (let t = T_SUBIDA + 1.5; t < T_DROP - 0.2; t += TEMPO / 8) marcas.push(t);
		for (const t of marcas) {
			const u = (t - T_SUBIDA) / (T_DROP - T_SUBIDA);
			somar(bateria[0], bateria[1], caixa(0.15 + 0.6 * u * u), t, 0.7, (rnd() - 0.5) * 0.3);
			somar(envio[0], envio[1], caixa(0.1 + 0.3 * u), t, 0.3);
		}
	}

	/* ---- D · drop (drop → golpe final) ---- */
	for (let t = T_DROP; t < T_FINAL - 0.01; t += TEMPO) {
		const b = Math.round((t - T_DROP) / TEMPO); // tempo desde o drop
		const noCompasso = b % 4;
		const nivel = t < T_ENERGIA ? 0.9 : 1;
		// meio segundo sem bumbo antes do golpe final: o respiro que faz o golpe bater
		const respiro = t >= T_FINAL - TEMPO - 0.01;
		if (!respiro) {
			somar(bateria[0], bateria[1], bumbo(1), t, 0.95 * nivel);
			bumbos.push(t);
		}
		somar(bateria[0], bateria[1], chimbal(true, 0.7), t + TEMPO / 2, 0.6, 0.25);
		if (t >= T_ENERGIA) {
			for (const k of [1, 3]) {
				somar(bateria[0], bateria[1], chimbal(false, 0.4 + rnd() * 0.15), t + (k * TEMPO) / 4, 0.5, -0.35);
			}
			if (noCompasso === 1 || noCompasso === 3) {
				somar(bateria[0], bateria[1], palma(0.8), t, 0.55);
				somar(envio[0], envio[1], palma(0.8), t, 0.35);
			}
		}
	}
	// rufar de novo no último segundo, subindo para o golpe final
	for (let t = T_FINAL - 1; t < T_FINAL - 0.02; t += t < T_FINAL - 0.5 ? TEMPO / 4 : TEMPO / 8) {
		const u = (t - (T_FINAL - 1)) / 1;
		somar(bateria[0], bateria[1], caixa(0.2 + 0.55 * u), t, 0.6, (rnd() - 0.5) * 0.3);
	}

	progressao.forEach((ac, i) => {
		const t0 = T_DROP + i * COMPASSO;
		if (t0 >= T_FINAL) return;
		const dur = Math.min(COMPASSO, T_FINAL - t0);
		// baixo no contratempo, estilo house: deixa o bumbo sozinho no tempo
		for (let k = 0; k < 4; k++) {
			const t = t0 + k * TEMPO + TEMPO / 2;
			if (t >= T_FINAL) break;
			somar(graves[0], graves[1], baixo(midi(ac.baixo), TEMPO / 2 - 0.02, 0.9), t, 0.8);
		}
		const aberto = 1700 + 1800 * Math.min(1, (t0 - T_DROP) / 16);
		const [l, r] = pad(ac.pad, dur - 0.02, 0.55, aberto);
		somar(harmonia[0], harmonia[1], l, t0, 1, -1);
		somar(harmonia[0], harmonia[1], r, t0, 1, 1);
		somar(envio[0], envio[1], l, t0, 0.25, -1);
		somar(envio[0], envio[1], r, t0, 0.25, 1);
		// arpejo a partir da demo; ganha oitava a partir da compatibilidade
		if (t0 + COMPASSO > T_ENERGIA) {
			for (let k = 0; k < 16; k++) {
				const t = t0 + (k * TEMPO) / 4;
				if (t < T_ENERGIA || t >= T_FINAL) continue;
				const nota = ac.arp[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]] + (t >= T_OITAVA && k >= 8 && k % 4 === 3 ? 12 : 0);
				const v = k % 4 === 0 ? 0.55 : 0.35;
				somar(arpejo[0], arpejo[1], pluck(midi(nota), v), t, 0.55, k % 2 ? 0.35 : -0.35);
			}
		}
	});

	/* ---- E · golpe final ---- */
	somar(bateria[0], bateria[1], bumbo(1.1, 44), T_FINAL, 1);
	somar(bateria[0], bateria[1], prato(0.5), T_FINAL, 0.7);
	somar(envio[0], envio[1], prato(0.4), T_FINAL, 0.5);
	somar(graves[0], graves[1], baixo(midi(45), 1.2, 1), T_FINAL, 0.9);
	{
		const [l, r] = pad([57, 60, 64, 69], Math.max(0.7, DUR - T_FINAL - 0.6), 0.7, 2600);
		somar(harmonia[0], harmonia[1], l, T_FINAL, 1, -1);
		somar(harmonia[0], harmonia[1], r, T_FINAL, 1, 1);
		somar(envio[0], envio[1], l, T_FINAL, 0.6, -1);
		somar(envio[0], envio[1], r, T_FINAL, 0.6, 1);
	}

	// sidechain: o bumbo abre espaço no baixo e no pad — é o que faz "respirar"
	const duck = new Float32Array(n).fill(1);
	for (const t of bumbos) {
		const i0 = Math.round(t * SR);
		for (let i = 0; i < amostras(0.4) && i0 + i < n; i++) {
			const x = i / SR;
			const e = x < 0.008 ? x / 0.008 : Math.exp(-(x - 0.008) / 0.1);
			duck[i0 + i] = Math.min(duck[i0 + i], 1 - e);
		}
	}
	for (let i = 0; i < n; i++) {
		const d = duck[i];
		graves[0][i] *= 1 - 0.85 * (1 - d);
		graves[1][i] *= 1 - 0.85 * (1 - d);
		harmonia[0][i] *= 1 - 0.6 * (1 - d);
		harmonia[1][i] *= 1 - 0.6 * (1 - d);
		arpejo[0][i] *= 1 - 0.3 * (1 - d);
		arpejo[1][i] *= 1 - 0.3 * (1 - d);
	}

	pingue(arpejo[0], arpejo[1], TEMPO * 0.75, 0.38, 0.5);
	for (let i = 0; i < n; i++) {
		envio[0][i] += arpejo[0][i] * 0.3;
		envio[1][i] += arpejo[1][i] * 0.3;
	}
	const [rvL, rvR] = reverb(envio[0], envio[1], {sala: 0.86, amort: 0.35});

	const L = new Float32Array(n);
	const R = new Float32Array(n);
	const mix = [
		[bateria, 1],
		[graves, 0.8],
		[harmonia, 0.75],
		[arpejo, 0.65],
		[efeitos, 0.8],
		[[rvL, rvR], 1.1],
	];
	for (const [[a, b], g] of mix) {
		for (let i = 0; i < n; i++) {
			L[i] += a[i] * g;
			R[i] += b[i] * g;
		}
	}
	// corta o subgrave que só gasta headroom e o topo áspero; realce leve
	// acima de 3,5 kHz, em paralelo, para a mixagem não soar abafada no celular
	const oL = filtrar(filtrar(L, 'hp', 35), 'lp', 16000);
	const oR = filtrar(filtrar(R, 'hp', 35), 'lp', 16000);
	const brilhoL = filtrar(oL, 'hp', 3500);
	const brilhoR = filtrar(oR, 'hp', 3500);
	for (let i = 0; i < n; i++) {
		oL[i] += brilhoL[i] * 0.55;
		oR[i] += brilhoR[i] * 0.55;
	}
	// sobe tudo e deixa o limitador segurar só as pontas dos bumbos
	normalizar([oL, oR], dB(-1));
	limitar(oL, oR, dB(-4));
	return [oL.subarray(0, amostras(DUR)), oR.subarray(0, amostras(DUR))];
};

/* --------------------------------------------------------------------------
   EFEITOS
   -------------------------------------------------------------------------- */

const tecla = (v = 1, pesada = false) => {
	const x = vazio(pesada ? 0.14 : 0.06);
	const tom = pesada ? 120 : 170 + rnd() * 60;
	const centro = 700 + rnd() * 900;
	const corpo = new Biquad().set('bp', centro, 1.4);
	let fase = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * tom) / SR;
		const clique = ruido() * Math.exp(-t / 0.0012);
		const madeira = corpo.p(ruido()) * Math.exp(-t / (pesada ? 0.03 : 0.014));
		const baque = Math.sin(fase) * Math.exp(-t / (pesada ? 0.035 : 0.016));
		x[i] = (clique * 0.5 + madeira * 1.6 + baque * (pesada ? 0.7 : 0.35)) * v;
	}
	return filtrar(x, 'hp', 90);
};

const digitacao = () => {
	rnd = gerador(501);
	const x = vazio(3.2);
	const L = new Float32Array(x.length);
	const R = new Float32Array(x.length);
	let t = 0.004;
	while (t < 3.1) {
		const v = 0.55 + rnd() * 0.45;
		somar(L, R, tecla(v), t, 1, (rnd() - 0.5) * 0.4);
		// soltura da tecla, mais baixa
		if (rnd() < 0.5) somar(L, R, tecla(v * 0.35), t + 0.035 + rnd() * 0.02, 1, (rnd() - 0.5) * 0.4);
		t += 0.055 + rnd() * 0.035;
	}
	return normalizar([L, R], dB(-4));
};

const enter = () => {
	rnd = gerador(502);
	const x = tecla(1, true);
	return normalizar([x], dB(-4));
};

const blip = () => {
	const x = vazio(0.14);
	let fase = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (1500 + 400 * Math.exp(-t / 0.01))) / SR;
		x[i] = Math.sin(fase) * Math.exp(-t / 0.035) * Math.min(1, t / 0.0015);
	}
	return normalizar([x], dB(-6));
};

const sino = (freq, dur, tau) => {
	const x = vazio(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] =
			(Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t / 0.08)) *
			Math.exp(-t / tau) *
			Math.min(1, t / 0.002);
	}
	return x;
};

const check = () => {
	const n = amostras(0.6);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	somar(L, R, sino(midi(88), 0.4, 0.09), 0, 0.6, -0.2); // mi
	somar(L, R, sino(midi(95), 0.5, 0.13), 0.055, 0.5, 0.2); // si
	const [rl, rr] = reverb(L, R, {sala: 0.6, amort: 0.5});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * 0.9;
		R[i] += rr[i] * 0.9;
	}
	return normalizar([L, R], dB(-6));
};

const sucesso = () => {
	const n = amostras(1.8);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	// mi – lá – si – mi: pentatônica de lá menor, casa com a harmonia inteira
	[76, 81, 83, 88].forEach((nota, k) => {
		somar(L, R, sino(midi(nota), 1.2, 0.35 + k * 0.08), k * 0.045, 0.45, -0.3 + k * 0.2);
	});
	const [rl, rr] = reverb(L, R, {sala: 0.8, amort: 0.4});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * 1.4;
		R[i] += rr[i] * 1.4;
	}
	return normalizar([L, R], dB(-4));
};

const erro = () => {
	rnd = gerador(404);
	const x = vazio(0.75);
	let f1 = 0;
	let f2 = 0;
	let seg = 0;
	let retido = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		f1 = (f1 + 110 / SR) % 1;
		f2 = (f2 + (440 * Math.pow(0.5, Math.min(1, t / 0.28))) / SR) % 1;
		const quadrada = (f1 < 0.5 ? 1 : -1) * 0.5 + (f2 < 0.5 ? 1 : -1) * 0.35 + ruido() * 0.25;
		// bitcrush: segura a amostra por 12 amostras (≈4 kHz) e quantiza em 5 bits
		if (seg++ % 12 === 0) retido = Math.round(quadrada * 16) / 16;
		// gagueira: liga e desliga em fatias de 38 ms nos primeiros 300 ms
		const fatia = Math.floor(t / 0.038);
		const gate = t < 0.3 ? (fatia % 3 === 2 ? 0.15 : 1) : 1;
		x[i] = retido * gate * Math.exp(-t / 0.22) * Math.min(1, t / 0.001);
	}
	const y = filtrar(x, 'lp', 5200);
	const baque = bumbo(0.9, 40);
	for (let i = 0; i < baque.length && i < y.length; i++) y[i] += baque[i] * 0.8;
	return normalizar([y], dB(-3));
};

const tique = () => {
	rnd = gerador(12);
	const x = vazio(0.1);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = ruido() * Math.exp(-t / 0.004) + Math.sin(2 * Math.PI * 2300 * t) * Math.exp(-t / 0.012) * 0.5;
	}
	return normalizar([filtrar(x, 'bp', 3200, 2.5)], dB(-6));
};

const whoosh = () => {
	rnd = gerador(8);
	const dur = 0.75;
	const x = Float32Array.from({length: amostras(dur)}, () => ruido());
	const pico_ = 0.42;
	const y = filtrar(x, 'bp', (t) => (t < pico_ ? 450 * Math.pow(4200 / 450, t / pico_) : 4200 * Math.pow(900 / 4200, (t - pico_) / (dur - pico_))), 1.1);
	const L = new Float32Array(y.length);
	const R = new Float32Array(y.length);
	for (let i = 0; i < y.length; i++) {
		const t = i / SR;
		const env = t < pico_ ? Math.pow(t / pico_, 2.2) : Math.pow(1 - (t - pico_) / (dur - pico_), 1.6);
		const pan = -0.7 + 1.4 * (t / dur);
		L[i] = y[i] * env * Math.cos(((pan + 1) * Math.PI) / 4);
		R[i] = y[i] * env * Math.sin(((pan + 1) * Math.PI) / 4);
	}
	return normalizar([L, R], dB(-5));
};

const impacto = (leve = false) => {
	rnd = gerador(leve ? 91 : 90);
	const dur = leve ? 1.6 : 3;
	const n = amostras(dur);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	// queda de subgrave
	const sub = vazio(leve ? 1.2 : 2.2);
	let fase = 0;
	for (let i = 0; i < sub.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (30 + (leve ? 60 : 80) * Math.exp(-t / 0.18))) / SR;
		sub[i] = Math.tanh(Math.sin(fase) * 1.8) * Math.exp(-t / (leve ? 0.45 : 0.8)) * Math.min(1, t / 0.002);
	}
	somar(L, R, sub, 0, 0.55);
	somar(L, R, bumbo(1, 46), 0, 0.7);
	// baque médio: o que o alto-falante do celular consegue tocar
	const baque = vazio(0.6);
	let fb = 0;
	for (let i = 0; i < baque.length; i++) {
		const t = i / SR;
		fb += (2 * Math.PI * (110 + 120 * Math.exp(-t / 0.03))) / SR;
		baque[i] = Math.tanh(Math.sin(fb) * 2) * Math.exp(-t / (leve ? 0.09 : 0.14));
	}
	somar(L, R, baque, 0, leve ? 0.8 : 0.95);
	// explosão de ruído
	const expl = filtrar(
		Float32Array.from({length: amostras(1)}, (_, i) => ruido() * Math.exp(-i / SR / (leve ? 0.09 : 0.2))),
		'lp',
		leve ? 3200 : 4500,
	);
	somar(L, R, expl, 0, leve ? 0.55 : 0.8);
	if (!leve) {
		// brilho: um acorde agudo de lá menor que fica no ar
		for (const [nota, pan] of [
			[81, -0.5],
			[84, 0.5],
			[88, 0],
			[93, 0.3],
		]) {
			somar(L, R, sino(midi(nota), 2.4, 0.9), 0.01, 0.12, pan);
		}
		somar(L, R, prato(0.35, 2.5), 0, 0.5);
	}
	const [rl, rr] = reverb(L, R, {sala: leve ? 0.8 : 0.92, amort: 0.35});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * (leve ? 1 : 1.5);
		R[i] += rr[i] * (leve ? 1 : 1.5);
	}
	const oL = filtrar(L, 'hp', 25);
	const oR = filtrar(R, 'hp', 25);
	const fim = amostras(0.4);
	for (let i = 0; i < fim; i++) {
		oL[n - 1 - i] *= i / fim;
		oR[n - 1 - i] *= i / fim;
	}
	return normalizar([oL, oR], dB(-2));
};

/** Carimbo: baque grave, tapa médio e estalo — lê como "bateu e ficou". */
const carimbo = () => {
	rnd = gerador(606);
	const n = amostras(0.9);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	const baque = vazio(0.5);
	let fase = 0;
	for (let i = 0; i < baque.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (48 + 70 * Math.exp(-t / 0.025))) / SR;
		baque[i] = Math.tanh(Math.sin(fase) * 2.4) * Math.exp(-t / 0.12);
	}
	const tapa = filtrar(
		Float32Array.from({length: amostras(0.2)}, (_, i) => ruido() * Math.exp(-i / SR / 0.035)),
		'bp',
		950,
		0.9,
	);
	const estalo = filtrar(
		Float32Array.from({length: amostras(0.03)}, (_, i) => ruido() * Math.exp(-i / SR / 0.006)),
		'hp',
		3200,
	);
	somar(L, R, baque, 0, 0.9);
	somar(L, R, tapa, 0, 2.2);
	somar(L, R, estalo, 0, 0.7);
	const [rl, rr] = reverb(L, R, {sala: 0.55, amort: 0.5});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * 0.6;
		R[i] += rr[i] * 0.6;
	}
	return normalizar([L, R], dB(-2));
};

/** Pop de bolha: entrada de elemento. */
const pop = () => {
	rnd = gerador(707);
	const x = vazio(0.12);
	let fase = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (320 + 900 * (1 - Math.exp(-t / 0.018)))) / SR;
		x[i] = Math.sin(fase) * Math.exp(-t / 0.035) * Math.min(1, t / 0.002) + ruido() * Math.exp(-t / 0.0015) * 0.3;
	}
	return normalizar([filtrar(x, 'hp', 150)], dB(-6));
};

/** Faíscas: uma chuva de sininhos agudos — confete e brilho. */
const brilho = () => {
	rnd = gerador(808);
	const n = amostras(1.6);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	// notas da pentatônica de lá menor, oitavas altas
	const notas = [88, 91, 93, 95, 98, 100, 103, 105];
	for (let k = 0; k < 16; k++) {
		const t = k * 0.035 + rnd() * 0.03;
		const nota = notas[Math.floor(rnd() * notas.length)];
		somar(L, R, sino(midi(nota), 0.5, 0.08 + rnd() * 0.08), t, 0.3 * (1 - k / 20), rnd() * 1.6 - 0.8);
	}
	const [rl, rr] = reverb(L, R, {sala: 0.85, amort: 0.25});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * 1.6;
		R[i] += rr[i] * 1.6;
	}
	return normalizar([L, R], dB(-6));
};

/** Toque na tela: clique seco e macio. */
const toque = () => {
	rnd = gerador(909);
	const x = vazio(0.08);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = ruido() * Math.exp(-t / 0.0025) * 0.6 + Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t / 0.02);
	}
	return normalizar([filtrar(x, 'hp', 200)], dB(-6));
};

/** Fita batendo: tapa seco, corpo grave e o "zzip" da fita esticando. */
const fita = () => {
	rnd = gerador(1010);
	const n = amostras(0.8);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	const corpo = vazio(0.3);
	let fase = 0;
	for (let i = 0; i < corpo.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (70 + 90 * Math.exp(-t / 0.02))) / SR;
		corpo[i] = Math.tanh(Math.sin(fase) * 2) * Math.exp(-t / 0.08);
	}
	const tapa = filtrar(
		Float32Array.from({length: amostras(0.12)}, (_, i) => ruido() * Math.exp(-i / SR / 0.022)),
		'bp',
		1400,
		0.8,
	);
	const zip = Float32Array.from({length: amostras(0.22)}, (_, i) => {
		const t = i / SR;
		return ruido() * (0.55 + 0.45 * Math.sin(2 * Math.PI * 70 * t)) * Math.exp(-t / 0.07);
	});
	somar(L, R, corpo, 0, 0.9);
	somar(L, R, tapa, 0, 2.4);
	somar(L, R, filtrar(zip, 'bp', 2900, 1.2), 0.01, 1.4, 0.2);
	const [rl, rr] = reverb(L, R, {sala: 0.5, amort: 0.5});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * 0.5;
		R[i] += rr[i] * 0.5;
	}
	return normalizar([L, R], dB(-2));
};

/** Rasgo: fita rasgando — ruído granulado que varre para o agudo, com peso embaixo. */
const rasgo = () => {
	rnd = gerador(1111);
	const dur = 0.75;
	const n = amostras(dur + 0.4);
	const L = new Float32Array(n);
	const R = new Float32Array(n);
	const x = new Float32Array(amostras(dur));
	let grao = 0;
	let resta = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		if (resta-- <= 0) {
			grao = Math.pow(rnd(), 1.5);
			resta = Math.floor(SR * (0.002 + rnd() * 0.006));
		}
		x[i] = ruido() * grao * Math.min(1, t / 0.004) * Math.exp(-t / 0.28);
	}
	const y = filtrar(x, 'bp', (t) => 1500 + 2600 * (t / dur), 0.9);
	const peso = vazio(0.4);
	let fase = 0;
	for (let i = 0; i < peso.length; i++) {
		const t = i / SR;
		fase += (2 * Math.PI * (45 + 60 * Math.exp(-t / 0.05))) / SR;
		peso[i] = Math.sin(fase) * Math.exp(-t / 0.15);
	}
	somar(L, R, y, 0, 2.2, -0.35);
	somar(L, R, y, 0.012, 1.8, 0.35);
	somar(L, R, peso, 0, 0.7);
	const [rl, rr] = reverb(L, R, {sala: 0.7, amort: 0.4});
	for (let i = 0; i < n; i++) {
		L[i] += rl[i] * 0.6;
		R[i] += rr[i] * 0.6;
	}
	return normalizar([L, R], dB(-3));
};

/* --------------------------------------------------------------------------
   Saída
   -------------------------------------------------------------------------- */

const lista = [
	['trilha', trilha],
	['digitacao', digitacao],
	['enter', enter],
	['blip', blip],
	['check', check],
	['sucesso', sucesso],
	['erro', erro],
	['tique', tique],
	['whoosh', whoosh],
	['impacto', () => impacto(false)],
	['impacto-leve', () => impacto(true)],
	['carimbo', carimbo],
	['pop', pop],
	['brilho', brilho],
	['toque', toque],
	['fita', fita],
	['rasgo', rasgo],
];

const t0 = Date.now();
for (const [nome, fn] of lista) console.log('  ' + salvar(nome, fn()));
console.log(`áudio gerado em ${((Date.now() - t0) / 1000).toFixed(1)} s → public/audio/`);
