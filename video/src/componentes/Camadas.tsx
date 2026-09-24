import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {c} from '../tema';

/* Camadas de acabamento que ficam por cima de tudo. */

// O mesmo ruído do .grain da página. Além da textura, ele faz dithering: sem
// ele, o degradê da vinheta sobre o breu vira faixas depois da compressão
// do Instagram.
const RUIDO =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

export const Grao: React.FC<{opacidade?: number}> = ({opacidade = 0.07}) => {
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
				pointerEvents: 'none',
			}}
		/>
	);
};

export const Vinheta: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(120% 78% at 50% 44%, transparent 38%, rgba(6,5,7,.55) 72%, rgba(6,5,7,.92) 100%)',
			pointerEvents: 'none',
		}}
	/>
);

/** Clarão de tela inteira — usado no corte da virada para o drop. */
export const Clarao: React.FC<{intensidade: number; cor?: string}> = ({
	intensidade,
	cor = c.bone,
}) =>
	intensidade <= 0.001 ? null : (
		<AbsoluteFill style={{background: cor, opacity: intensidade, pointerEvents: 'none'}} />
	);

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
