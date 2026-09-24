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
   PALETA DE CAMPANHA — vibrante, feita para o feed.
   A tipografia é a da página; a cor não: no Reels o vídeo disputa atenção
   com tudo que está acima e abaixo dele no feed.
   Verde continua querendo dizer "funciona" e vermelho, "travou".
   ========================================================================== */
export const c = {
	branco: '#FFFFFF',
	nevoa: 'rgba(255,255,255,.82)',
	fumaca: 'rgba(255,255,255,.62)',
	tinta: '#170A3D',
	violeta: '#7C3AED',
	roxo: '#A855F7',
	rosa: '#FF3D9A',
	laranja: '#FF7A1A',
	amarelo: '#FFC83D',
	ciano: '#22D3EE',
	azul: '#3B82F6',
	verde: '#2EE59D',
	vermelho: '#FF2D55',
	/** fita de interdição */
	fita: '#FFD60A',
	fitaTexto: '#161000',
} as const;

export const grad = {
	/** amarelo → laranja → rosa → roxo: o degradê da marca. */
	marca: 'linear-gradient(100deg, #FFC83D 0%, #FF7A1A 28%, #FF3D9A 62%, #A855F7 100%)',
	sucesso: 'linear-gradient(100deg, #2EE59D 0%, #22D3EE 100%)',
	alerta: 'linear-gradient(100deg, #FFC83D 0%, #FF7A1A 45%, #FF2D55 100%)',
	/** para texto sobre branco: sem o amarelo, que sumiria. */
	tinta: 'linear-gradient(100deg, #FF5A00 0%, #FF2D8A 45%, #7C3AED 100%)',
} as const;

export const f = {
	display: "'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif",
	text: "'Instrument Sans', system-ui, sans-serif",
	mono: "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace",
} as const;

/** Manchete: Bricolage no peso máximo, branca, com sombra colorida que
 *  segura a leitura em cima de qualquer fundo. */
export const dsp: React.CSSProperties = {
	fontFamily: f.display,
	fontWeight: 800,
	fontVariationSettings: "'wdth' 96, 'opsz' 48",
	letterSpacing: '-0.032em',
	lineHeight: 0.92,
	color: c.branco,
	textShadow: '0 8px 40px rgba(40,0,80,.35)',
};

/** Rótulo mono em caixa alta. */
export const tag: React.CSSProperties = {
	fontFamily: f.mono,
	fontWeight: 600,
	fontSize: 24,
	letterSpacing: '0.18em',
	textTransform: 'uppercase',
	color: c.nevoa,
};

/** Vidro claro: o fundo colorido aparece através. */
export const vidro: React.CSSProperties = {
	background: 'linear-gradient(160deg, rgba(255,255,255,.2), rgba(255,255,255,.07))',
	border: '2px solid rgba(255,255,255,.28)',
	borderRadius: 30,
	boxShadow: '0 40px 90px -30px rgba(25,0,70,.55), inset 0 2px 0 rgba(255,255,255,.4)',
};

/** Vidro escuro: para código, que precisa de contraste. */
export const vidroEscuro: React.CSSProperties = {
	background: 'linear-gradient(160deg, rgba(20,8,56,.84), rgba(20,8,56,.7))',
	border: '2px solid rgba(255,255,255,.22)',
	borderRadius: 30,
	boxShadow:
		'0 60px 120px -40px rgba(15,0,50,.75), 0 0 0 1px rgba(168,85,247,.25), inset 0 2px 0 rgba(255,255,255,.2)',
};

/** Texto preenchido com degradê. `display: inline-block` faz o degradê caber
 *  na palavra, não na largura da linha. */
export const textoDegrade = (fundo: string): React.CSSProperties => ({
	display: 'inline-block',
	backgroundImage: fundo,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	color: 'transparent',
	textShadow: 'none',
	filter: 'drop-shadow(0 8px 30px rgba(40,0,80,.35))',
	paddingRight: '0.04em',
});

/* Curvas */
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
