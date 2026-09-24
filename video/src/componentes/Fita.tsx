import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {c, f, FPS} from '../tema';

/* ==========================================================================
   FITA DE INTERDIÇÃO
   Cada dor do roteiro vira uma fita amarela que atravessa a tela e "amarra"
   o terminal. Entra batendo, com mola; no drop, rasga num ponto e as duas
   metades caem para lados opostos.
   ========================================================================== */

const ALTURA_FITA = 124;
const COMPRIMENTO = 4200;

type Props = {
	texto: string;
	/** Centro vertical da fita na tela. */
	y: number;
	angulo: number;
	/** Lado de onde a fita chega. */
	de: 1 | -1;
	entra: number;
	/** Quadro em que a fita rasga (opcional). */
	rasga?: number;
	/** Onde rasga, em px a partir do centro da tela. */
	corte?: number;
	escurece?: number;
};

const Listras: React.FC = () => (
	<span
		style={{
			flex: 'none',
			width: 110,
			height: '100%',
			background: `repeating-linear-gradient(-45deg, ${c.fitaTexto} 0 18px, transparent 18px 36px)`,
		}}
	/>
);

const Faixa: React.FC<{texto: string; desliza: number; clip?: string}> = ({texto, desliza, clip}) => {
	const itens = Array.from({length: 9}, (_, i) => i);
	return (
		<div
			style={{
				position: 'absolute',
				left: -COMPRIMENTO / 2,
				top: -ALTURA_FITA / 2,
				width: COMPRIMENTO,
				height: ALTURA_FITA,
				boxSizing: 'border-box',
				background: c.fita,
				borderTop: `9px solid ${c.fitaTexto}`,
				borderBottom: `9px solid ${c.fitaTexto}`,
				boxShadow: '0 26px 50px -12px rgba(0,0,0,.55)',
				overflow: 'hidden',
				clipPath: clip,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 34,
					height: '100%',
					whiteSpace: 'nowrap',
					transform: `translateX(${desliza - 600}px)`,
				}}
			>
				{itens.map((i) => (
					<React.Fragment key={i}>
						<Listras />
						<span
							style={{
								fontFamily: f.display,
								fontWeight: 800,
								fontVariationSettings: "'wdth' 88, 'opsz' 48",
								fontSize: 64,
								letterSpacing: '0.01em',
								textTransform: 'uppercase',
								color: c.fitaTexto,
								lineHeight: 1,
							}}
						>
							{texto}
						</span>
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

/** Borda de rasgo em zigue-zague, na coordenada local da faixa. */
const bordaRasgada = (x: number) => {
	const dentes = [0, 16, -12, 18, -8, 14, -16, 10, 0];
	return dentes.map((d, k) => [COMPRIMENTO / 2 + x + d, (k / (dentes.length - 1)) * ALTURA_FITA] as const);
};

export const Fita: React.FC<Props> = ({texto, y, angulo, de, entra, rasga, corte = 0, escurece = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < entra) return null;

	// batida: a fita chega pelo próprio eixo, passa um pouco do ponto e volta
	const s = spring({frame: frame - entra, fps, config: {damping: 13, stiffness: 240, mass: 0.7}});
	const chegada = interpolate(s, [0, 1], [2600 * -de, 0]);
	const desliza = (frame - entra) * 1.6 * de;
	const brilho = 1 - escurece;

	const rasgada = rasga !== undefined && frame >= rasga;
	if (!rasgada) {
		return (
			<div style={{position: 'absolute', left: 540, top: y, filter: brilho < 1 ? `brightness(${brilho})` : undefined}}>
				<div style={{position: 'absolute', transform: `rotate(${angulo}deg) translateX(${chegada}px)`}}>
					<Faixa texto={texto} desliza={desliza} />
				</div>
			</div>
		);
	}

	// depois do rasgo: cada metade gira e cai para o seu lado
	const t = (frame - (rasga as number)) / FPS;
	const borda = bordaRasgada(corte);
	const esquerda = `polygon(0 0, ${borda.map(([bx, by]) => `${bx}px ${by}px`).join(', ')}, 0 ${ALTURA_FITA}px)`;
	const direita = `polygon(${borda.map(([bx, by]) => `${bx}px ${by}px`).join(', ')}, ${COMPRIMENTO}px ${ALTURA_FITA}px, ${COMPRIMENTO}px 0)`;
	const some = interpolate(t, [0.25, 0.7], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div style={{position: 'absolute', left: 540, top: y, opacity: some}}>
			{[
				{clip: esquerda, lado: -1},
				{clip: direita, lado: 1},
			].map(({clip, lado}) => (
				<div
					key={lado}
					style={{
						position: 'absolute',
						transform: `translate(${lado * (900 * t)}px, ${2600 * t * t - 380 * t}px) rotate(${lado * 55 * t}deg)`,
					}}
				>
					<div style={{position: 'absolute', transform: `rotate(${angulo}deg)`}}>
						<Faixa texto={texto} desliza={desliza} clip={clip} />
					</div>
				</div>
			))}
		</div>
	);
};

/** Fita em miniatura, riscada — a dor cancelada, na revelação. */
export const FitaRiscada: React.FC<{texto: string; at: number; risca: number}> = ({texto, at, risca}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
	const r = interpolate(frame, [risca, risca + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'relative',
				display: 'inline-flex',
				alignItems: 'center',
				gap: 14,
				padding: '10px 22px 10px 12px',
				background: c.fita,
				borderTop: `5px solid ${c.fitaTexto}`,
				borderBottom: `5px solid ${c.fitaTexto}`,
				transform: `rotate(-2deg) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
				opacity: Math.min(1, s * 1.4) * (1 - r * 0.25),
				boxShadow: '0 16px 30px -12px rgba(0,0,0,.5)',
			}}
		>
			<span
				style={{
					width: 46,
					height: 34,
					background: `repeating-linear-gradient(-45deg, ${c.fitaTexto} 0 8px, transparent 8px 16px)`,
				}}
			/>
			<span
				style={{
					fontFamily: f.display,
					fontWeight: 800,
					fontVariationSettings: "'wdth' 88, 'opsz' 48",
					fontSize: 38,
					textTransform: 'uppercase',
					color: c.fitaTexto,
					lineHeight: 1,
				}}
			>
				{texto}
			</span>
			{/* risco verde: a dor foi cancelada */}
			<span
				style={{
					position: 'absolute',
					left: -10,
					top: '50%',
					height: 10,
					width: `calc(${r * 100}% + 20px)`,
					background: c.verde,
					borderRadius: 999,
					boxShadow: '0 0 20px rgba(46,229,157,.8)',
					transform: 'translateY(-50%) rotate(-3deg)',
				}}
			/>
		</div>
	);
};
