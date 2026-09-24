import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {c} from '../tema';

/* Camadas de acabamento que ficam por cima de tudo. */

// Ruído fino. Além da textura, ele faz dithering: sem ele, o degradê grande
// do fundo vira faixas depois da compressão do Instagram.
const RUIDO =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

export const Grao: React.FC<{opacidade?: number}> = ({opacidade = 0.06}) => {
	const frame = useCurrentFrame();
	// o grão troca a cada 2 quadros: vivo, sem virar chuvisco
	const q = Math.floor(frame / 2);
	const x = Math.floor(random(`gx${q}`) * 240);
	const y = Math.floor(random(`gy${q}`) * 240);
	return (
		<AbsoluteFill
			style={{
				backgroundImage: RUIDO,
				backgroundSize: '240px 240px',
				backgroundPosition: `${x}px ${y}px`,
				opacity: opacidade,
				mixBlendMode: 'overlay',
				pointerEvents: 'none',
			}}
		/>
	);
};

/** Vinheta leve, colorida em vez de preta: concentra o olhar sem escurecer. */
export const Vinheta: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(130% 85% at 50% 45%, transparent 55%, rgba(20,4,50,.28) 85%, rgba(20,4,50,.45) 100%)',
			pointerEvents: 'none',
		}}
	/>
);

/** Clarão de tela inteira — usado no drop. */
export const Clarao: React.FC<{intensidade: number; cor?: string}> = ({
	intensidade,
	cor = c.branco,
}) =>
	intensidade <= 0.001 ? null : (
		<AbsoluteFill style={{background: cor, opacity: intensidade, pointerEvents: 'none'}} />
	);

type VarreduraProps = {
	/** Quadro do corte: a faixa cobre a tela inteira exatamente aqui. */
	em: number;
	fundo: string;
	sentido?: 1 | -1;
	dur?: number;
};

/**
 * Transição de varredura: uma faixa inclinada com degradê cruza a tela e
 * esconde o corte entre duas cenas. Rápida no meio, como um chicote.
 */
export const Varredura: React.FC<VarreduraProps> = ({em, fundo, sentido = 1, dur = 14}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [em - dur / 2, em + dur / 2], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.65, 0, 0.35, 1),
	});
	if (p <= 0 || p >= 1) return null;
	const x = interpolate(p, [0, 1], [-2300, 2300]) * sentido;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: 540 - 1250 + x,
					top: -200,
					width: 2500,
					height: 2320,
					transform: 'skewX(-16deg)',
					background: fundo,
					boxShadow: '0 0 120px 40px rgba(255,255,255,.35)',
				}}
			/>
			{/* fio de luz na borda de ataque */}
			<div
				style={{
					position: 'absolute',
					left: 540 + 1250 * sentido + x - 12,
					top: -200,
					width: 24,
					height: 2320,
					transform: 'skewX(-16deg)',
					background: 'rgba(255,255,255,.9)',
					filter: 'blur(6px)',
				}}
			/>
		</AbsoluteFill>
	);
};

/** Áreas que a interface do Reels cobre. Só para conferência (prop `guias`). */
export const GuiasReels: React.FC = () => {
	const faixa = (s: React.CSSProperties, rotulo: string) => (
		<div
			style={{
				position: 'absolute',
				background: 'rgba(229,86,91,.18)',
				border: '2px dashed rgba(229,86,91,.7)',
				color: '#fff',
				font: '600 22px system-ui',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				...s,
			}}
		>
			{rotulo}
		</div>
	);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{faixa({left: 0, top: 0, width: 1080, height: 220}, 'topo do Reels')}
			{faixa({left: 0, top: 1500, width: 1080, height: 420}, 'perfil, legenda e áudio')}
			{faixa({left: 950, top: 980, width: 130, height: 520}, 'botões')}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 285,
					height: 1350,
					border: '2px dashed rgba(63,191,127,.7)',
				}}
			/>
		</AbsoluteFill>
	);
};
