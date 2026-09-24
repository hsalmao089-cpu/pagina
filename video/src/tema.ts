import {Easing, interpolate} from 'remotion';
import timeline from './timeline.json';

export const FPS = timeline.fps;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const DURACAO = timeline.duracao;
export const CENAS = timeline.cenas;
export const MARCAS = timeline.marcas;

/** Um tempo da trilha em quadros: 120 bpm a 30 fps = 15 quadros. */
export const TEMPO = (60 / timeline.bpm) * FPS;

/* ==========================================================================
   TOKENS — os mesmos da página (index.html, seção 1 · TOKENS).
   Monocromático por decisão: verde e vermelho são sinal, não decoração.
   Verde = disponível / funcionando. Vermelho = limite / erro.
   ========================================================================== */
export const c = {
	pitch: '#060507',
	void: '#0A090C',
	surf: '#111015',
	surf2: '#17161C',
	edge: 'rgba(242,239,233,.09)',
	edge2: 'rgba(242,239,233,.17)',
	bone: '#F2EFE9',
	ash: '#9E9A94',
	dim: '#66625D',
	live: '#3FBF7F',
	halt: '#E5565B',
} as const;

export const f = {
	display: "'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif",
	text: "'Instrument Sans', system-ui, sans-serif",
	mono: "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace",
} as const;

/** .dsp da página, com o espaçamento aberto um pouco: a -0.042em da página as
 *  letras se tocam no corpo de 120px+ usado aqui. */
export const dsp: React.CSSProperties = {
	fontFamily: f.display,
	fontWeight: 800,
	fontVariationSettings: "'wdth' 96, 'opsz' 48",
	letterSpacing: '-0.032em',
	lineHeight: 0.9,
	color: c.bone,
};

/** .tag da página: mono, caixa alta, espaçado. */
export const tag: React.CSSProperties = {
	fontFamily: f.mono,
	fontWeight: 500,
	fontSize: 24,
	letterSpacing: '0.2em',
	textTransform: 'uppercase',
	color: c.dim,
};

/* Curvas — --ease e --slow da página, mais uma de saída. */
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const slow = Easing.bezier(0.16, 1, 0.3, 1);
export const exit = Easing.bezier(0.7, 0, 0.84, 0);

/** Progresso 0→1 entre `de` e `de + dur`, travado nas pontas. */
export const prog = (
	frame: number,
	de: number,
	dur: number,
	easing: (t: number) => number = slow,
) =>
	interpolate(frame, [de, de + dur], [0, 1], {
		easing,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

/** Entrada e saída na mesma chamada: sobe de 0 a 1 e, a partir de `sai`, volta a 0. */
export const inOut = (
	frame: number,
	entra: number,
	sai: number,
	durIn = 16,
	durOut = 10,
) => prog(frame, entra, durIn) * (1 - prog(frame, sai, durOut, exit));

/** Área que a interface do Reels não cobre (topo, legenda e coluna de botões). */
export const SEGURA = {x: 80, topo: 250, base: 1480, direita: 940} as const;
