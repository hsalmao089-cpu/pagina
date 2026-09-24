import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import {ALTURA, FPS, LARGURA, MARCAS, TEMPO} from '../tema';

/* ==========================================================================
   AURORA — o fundo do vídeo inteiro.
   Quatro manchas de luz colorida derivando devagar sobre uma base saturada,
   mais um bokeh de partículas subindo. Cada trecho do roteiro tem a sua
   paleta (trabalho em violeta e azul, alerta em vermelho, revelação no
   degradê da marca…) e a troca acontece por dentro das transições.
   No groove, as manchas respiram junto com o bumbo.
   ========================================================================== */

type Paleta = {base: string; manchas: [string, string, string, string]};

export const PALETAS = {
	trabalho: {base: '#1C1257', manchas: ['#6D28D9', '#2563EB', '#06B6D4', '#C026D3']},
	alerta: {base: '#5C0A24', manchas: ['#FF2D55', '#FF6B00', '#D6186F', '#FF3B30']},
	tensao: {base: '#150B3A', manchas: ['#4C1D95', '#9D174D', '#1E3A8A', '#6D28D9']},
	revelacao: {base: '#2E1065', manchas: ['#FF3D9A', '#FF7A1A', '#8B5CF6', '#22D3EE']},
	demo: {base: '#12195E', manchas: ['#3B82F6', '#7C3AED', '#06B6D4', '#DB2777']},
	compat: {base: '#0B3358', manchas: ['#06B6D4', '#8B5CF6', '#10B981', '#EC4899']},
	beneficios: {base: '#3B0F70', manchas: ['#A855F7', '#EC4899', '#6366F1', '#F97316']},
	oferta: {base: '#7A1350', manchas: ['#FF7A1A', '#FF3D9A', '#FFC83D', '#8B5CF6']},
} satisfies Record<string, Paleta>;

type NomePaleta = keyof typeof PALETAS;

/** Quadro → paleta. Entre dois marcos, as cores se misturam. */
const MARCOS: [number, NomePaleta][] = [
	[0, 'trabalho'],
	[MARCAS.erro - 1, 'trabalho'],
	[MARCAS.erro + 2, 'alerta'],
	[236, 'alerta'],
	[252, 'tensao'],
	[MARCAS.drop - 2, 'tensao'],
	[MARCAS.drop + 1, 'revelacao'],
	[416, 'revelacao'],
	[424, 'demo'],
	[596, 'demo'],
	[604, 'compat'],
	[746, 'compat'],
	[754, 'beneficios'],
	[866, 'beneficios'],
	[874, 'oferta'],
];

const rgb = (hex: string): [number, number, number] => {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mistura = (a: string, b: string, t: number): [number, number, number] => {
	const [r1, g1, b1] = rgb(a);
	const [r2, g2, b2] = rgb(b);
	return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t];
};

const paletaEm = (q: number) => {
	let i = 0;
	while (i < MARCOS.length - 1 && MARCOS[i + 1][0] <= q) i++;
	const [q0, p0] = MARCOS[i];
	const prox = MARCOS[i + 1];
	const a = PALETAS[p0];
	if (!prox) return {base: rgb(a.base), manchas: a.manchas.map(rgb)};
	const [q1, p1] = prox;
	const b = PALETAS[p1];
	const t = Math.min(1, Math.max(0, (q - q0) / (q1 - q0)));
	const s = t * t * (3 - 2 * t);
	return {
		base: mistura(a.base, b.base, s),
		manchas: a.manchas.map((m, k) => mistura(m, b.manchas[k], s)),
	};
};

/** Batida visual: 1 no bumbo, caindo até o próximo. Só onde a trilha tem groove. */
const batida = (q: number) => {
	const noGroove = q < MARCAS.erro || (q >= MARCAS.drop && q < MARCAS.golpeFinal - TEMPO);
	if (!noGroove) return 0;
	const desde = q < MARCAS.erro ? q % TEMPO : (q - MARCAS.drop) % TEMPO;
	return Math.exp(-desde / 3.5);
};

const MANCHAS = [
	{x: 0.12, y: 0.16, ax: 0.2, ay: 0.1, w1: 0.31, w2: 0.23, r: 900, fase: 0},
	{x: 0.9, y: 0.36, ax: 0.14, ay: 0.14, w1: 0.26, w2: 0.37, r: 820, fase: 1.7},
	{x: 0.2, y: 0.74, ax: 0.18, ay: 0.12, w1: 0.35, w2: 0.29, r: 940, fase: 3.1},
	{x: 0.86, y: 0.92, ax: 0.16, ay: 0.08, w1: 0.22, w2: 0.41, r: 800, fase: 4.4},
];

const gerador = (semente: number) => {
	let a = semente >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};
const rnd = gerador(4242);
const BOKEH = Array.from({length: 46}, () => ({
	x: rnd() * LARGURA,
	y: rnd() * ALTURA,
	r: 4 + Math.pow(rnd(), 2.4) * 46,
	sobe: 18 + rnd() * 70,
	balanco: 14 + rnd() * 50,
	freq: 0.3 + rnd() * 0.9,
	fase: rnd() * Math.PI * 2,
	cor: Math.floor(rnd() * 4),
}));

export const Aurora: React.FC = () => {
	const q = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		const g = ref.current?.getContext('2d');
		if (!g) return;
		const t = q / FPS;
		const {base, manchas} = paletaEm(q);
		const pulso = batida(q);

		g.globalCompositeOperation = 'source-over';
		g.fillStyle = `rgb(${base.map(Math.round).join(',')})`;
		g.fillRect(0, 0, LARGURA, ALTURA);

		g.globalCompositeOperation = 'screen';
		MANCHAS.forEach((m, k) => {
			const x = LARGURA * (m.x + m.ax * Math.sin(m.w1 * t + m.fase));
			const y = ALTURA * (m.y + m.ay * Math.cos(m.w2 * t + m.fase * 1.3));
			const r = m.r * (1 + 0.06 * Math.sin(0.5 * t + m.fase) + 0.1 * pulso);
			const [cr, cg, cb] = manchas[k].map(Math.round);
			const gr = g.createRadialGradient(x, y, 0, x, y, r);
			const a = 0.92 + 0.08 * pulso;
			gr.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
			gr.addColorStop(0.42, `rgba(${cr},${cg},${cb},${a * 0.55})`);
			gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
			g.fillStyle = gr;
			g.fillRect(x - r, y - r, r * 2, r * 2);
		});

		// bokeh: partículas de luz subindo, cada uma com a cor de uma mancha
		g.globalCompositeOperation = 'lighter';
		for (const b of BOKEH) {
			const y = ((((b.y - b.sobe * t) % (ALTURA + 120)) + ALTURA + 120) % (ALTURA + 120)) - 60;
			const x = b.x + b.balanco * Math.sin(b.freq * t + b.fase);
			const brilho = 0.16 + 0.22 * (0.5 + 0.5 * Math.sin(b.freq * 2.3 * t + b.fase)) + 0.12 * pulso;
			const [cr, cg, cb] = manchas[b.cor].map((v) => Math.round(v + (255 - v) * 0.55));
			const gr = g.createRadialGradient(x, y, 0, x, y, b.r);
			gr.addColorStop(0, `rgba(${cr},${cg},${cb},${brilho})`);
			gr.addColorStop(0.55, `rgba(${cr},${cg},${cb},${brilho * 0.45})`);
			gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
			g.fillStyle = gr;
			g.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
		}
		g.globalCompositeOperation = 'source-over';
	}, [q]);

	return (
		<canvas
			ref={ref}
			width={LARGURA}
			height={ALTURA}
			style={{position: 'absolute', inset: 0, width: LARGURA, height: ALTURA}}
		/>
	);
};
