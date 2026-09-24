import React, {useLayoutEffect, useRef} from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {ALTURA, DURACAO, LARGURA} from '../tema';

/* ==========================================================================
   CAMPO DE FLUXO — a arte da página, portada para vídeo.
   Mesma corrente de senos sobrepostos e o mesmo rastro que acumula luz.

   A página desenha por cima do quadro anterior e escurece um pouco a cada
   passo. Em vídeo isso não serve: o Remotion renderiza quadros fora de ordem
   e em várias abas ao mesmo tempo. Então a simulação inteira é calculada uma
   vez, com semente fixa, e cada quadro redesenha só a janela de rastro que
   lhe cabe — mesmo resultado, em qualquer ordem.
   ========================================================================== */

const N = 1400;
/** Passos de simulação por quadro: a página roda a ~60 passos por segundo. */
const SUB = 2;
/** Passos antes do quadro 0 — o campo já nasce composto, como na página. */
const AQUECE = 320;
/** Comprimento do rastro, em passos. */
const RASTRO = 150;
/** O rastro é desenhado em faixas de idade; cada faixa tem uma opacidade. */
const FAIXAS = 15;
/** Classes de brilho das partículas (a página sorteia entre .07 e .27). */
const CLASSES = [0.08, 0.13, 0.19, 0.27];
/** Decaimento por passo — o mesmo .012 do fillRect da página. */
const DECAI = 0.988;

type Sim = {
	xs: Float32Array;
	ys: Float32Array;
	salto: Uint8Array;
	porClasse: Int32Array[];
	passos: number;
};

let cache: Sim | null = null;

/** Gerador determinístico (mulberry32): mesma semente, mesmo campo, sempre. */
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

/** Quadro (absoluto) → multiplicador de velocidade. A corrente acelera na
 *  virada, explode no drop e assenta; volta a subir na oferta. */
const velocidade = (quadro: number) =>
	interpolate(
		quadro,
		[0, 240, 294, 300, 336, 868, 878, 930, DURACAO],
		[1, 1, 1.9, 2.5, 1.35, 1.25, 2.2, 1.3, 1.3],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

const simular = (): Sim => {
	const W = LARGURA;
	const H = ALTURA;
	const passos = AQUECE + (DURACAO + 2) * SUB;
	const xs = new Float32Array(passos * N);
	const ys = new Float32Array(passos * N);
	const salto = new Uint8Array(passos * N);
	const px = new Float32Array(N);
	const py = new Float32Array(N);
	const pv = new Float32Array(N);
	const vida = new Float32Array(N);
	const classe = new Uint8Array(N);
	const rnd = gerador(20260924);

	const nasce = (i: number) => {
		px[i] = rnd() * W;
		py[i] = rnd() * H;
		pv[i] = 0.8 + rnd() * 3.1;
		vida[i] = 90 + rnd() * 320;
	};
	for (let i = 0; i < N; i++) {
		nasce(i);
		classe[i] = Math.floor(rnd() * CLASSES.length);
	}

	let t = 0;
	for (let s = 0; s < passos; s++) {
		const k = velocidade((s - AQUECE) / SUB);
		for (let i = 0; i < N; i++) {
			const x = px[i];
			const y = py[i];
			// corrente suave por senos sobrepostos — a mesma da página, em escala
			// maior porque a tela aqui é vista de perto, num celular
			const an =
				(Math.sin(x * 0.0011 + t) +
					Math.cos(y * 0.0014 - t * 0.7) +
					Math.sin((x + y) * 0.0006 + t * 1.25)) *
				1.45;
			let nx = x + Math.cos(an) * pv[i] * k;
			let ny = y + Math.sin(an) * pv[i] * k;
			vida[i] -= 1;
			let pulou = 0;
			if (vida[i] < 0 || nx < -40 || nx > W + 40 || ny < -40 || ny > H + 40) {
				nasce(i);
				nx = px[i];
				ny = py[i];
				pulou = 1;
			}
			px[i] = nx;
			py[i] = ny;
			const j = s * N + i;
			xs[j] = nx;
			ys[j] = ny;
			salto[j] = pulou;
		}
		t += 0.0022;
	}

	const porClasse = CLASSES.map((_, cl) => {
		const idx: number[] = [];
		for (let i = 0; i < N; i++) if (classe[i] === cl) idx.push(i);
		return Int32Array.from(idx);
	});

	return {xs, ys, salto, porClasse, passos};
};

/** Visibilidade do campo ao longo do vídeo (quadros absolutos). Escuro enquanto
 *  o assunto é limite; acende na virada; recua atrás do terminal. */
export const brilhoDoCampo = (quadro: number) =>
	interpolate(
		quadro,
		[0, 240, 294, 300, 330, 400, 432, 600, 620, 736, 756, 862, 892, DURACAO],
		[0, 0, 0.4, 0.62, 0.55, 0.55, 0.26, 0.26, 0.4, 0.4, 0.22, 0.22, 0.55, 0.55],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.quad),
		},
	);

type Props = {
	/** Quadro absoluto — o campo é um só para o vídeo todo. */
	quadro?: number;
	brilho?: number;
};

export const CampoDeFluxo: React.FC<Props> = ({quadro, brilho}) => {
	const local = useCurrentFrame();
	const q = quadro ?? local;
	const alpha = brilho ?? brilhoDoCampo(q);
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const g = cv.getContext('2d');
		if (!g) return;
		g.clearRect(0, 0, LARGURA, ALTURA);
		if (alpha <= 0.001) return;

		if (!cache) cache = simular();
		const {xs, ys, salto, porClasse, passos} = cache;
		const agora = Math.min(passos - 1, AQUECE + Math.round(q * SUB));
		const passoFaixa = RASTRO / FAIXAS;

		g.globalCompositeOperation = 'lighter';
		g.lineWidth = 1.7;
		g.lineCap = 'round';
		g.lineJoin = 'round';

		for (let fx = 0; fx < FAIXAS; fx++) {
			const idade0 = fx * passoFaixa;
			const idade1 = idade0 + passoFaixa;
			const decai = Math.pow(DECAI, (idade0 + idade1) / 2);
			// cada faixa começa onde a anterior terminou (um passo de sobreposição)
			const s0 = Math.max(0, agora - idade1);
			const s1 = agora - idade0;
			if (s1 <= 0) continue;
			for (let cl = 0; cl < CLASSES.length; cl++) {
				g.strokeStyle = `rgba(242,239,233,${(CLASSES[cl] * decai * alpha).toFixed(4)})`;
				g.beginPath();
				const lista = porClasse[cl];
				for (let m = 0; m < lista.length; m++) {
					const i = lista[m];
					let j = s0 * N + i;
					g.moveTo(xs[j], ys[j]);
					for (let s = s0 + 1; s <= s1; s++) {
						j = s * N + i;
						if (salto[j]) g.moveTo(xs[j], ys[j]);
						else g.lineTo(xs[j], ys[j]);
					}
				}
				g.stroke();
			}
		}
		g.globalCompositeOperation = 'source-over';
	}, [q, alpha]);

	return (
		<canvas
			ref={ref}
			width={LARGURA}
			height={ALTURA}
			style={{position: 'absolute', inset: 0, width: LARGURA, height: ALTURA}}
		/>
	);
};
