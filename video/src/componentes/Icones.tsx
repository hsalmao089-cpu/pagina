import React from 'react';

// Ícones em SVG: ✓ ✗ → ∞ não existem nas fontes da página, e cair em fonte de
// fallback muda de máquina para máquina.

type P = {size?: number; color?: string; stroke?: number; style?: React.CSSProperties};

export const Check: React.FC<P & {draw?: number}> = ({
	size = 28,
	color = 'currentColor',
	stroke = 3,
	draw = 1,
	style,
}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M4.5 12.5l5 5L19.5 7"
			stroke={color}
			strokeWidth={stroke}
			strokeLinecap="round"
			strokeLinejoin="round"
			pathLength={1}
			strokeDasharray={1}
			strokeDashoffset={1 - draw}
		/>
	</svg>
);

export const Cross: React.FC<P> = ({size = 28, color = 'currentColor', stroke = 3, style}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M6 6l12 12M18 6L6 18"
			stroke={color}
			strokeWidth={stroke}
			strokeLinecap="round"
		/>
	</svg>
);

export const Arrow: React.FC<P> = ({size = 28, color = 'currentColor', stroke = 2.4, style}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M5 12h13M12 5.5 18.5 12 12 18.5"
			stroke={color}
			strokeWidth={stroke}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const Shield: React.FC<P> = ({size = 28, color = 'currentColor', stroke = 2, style}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3z"
			stroke={color}
			strokeWidth={stroke}
			strokeLinejoin="round"
		/>
		<path
			d="M8.8 12.2l2.3 2.3 4.3-4.6"
			stroke={color}
			strokeWidth={stroke}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/** Arco girando: o "trabalhando…" de uma linha de terminal. */
export const Spinner: React.FC<P & {frame: number}> = ({
	size = 26,
	color = 'currentColor',
	stroke = 3,
	frame,
	style,
}) => (
	<svg
		viewBox="0 0 24 24"
		width={size}
		height={size}
		fill="none"
		style={{transform: `rotate(${frame * 24}deg)`, ...style}}
	>
		<circle cx="12" cy="12" r="8.5" stroke={color} strokeOpacity={0.18} strokeWidth={stroke} />
		<path
			d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"
			stroke={color}
			strokeWidth={stroke}
			strokeLinecap="round"
		/>
	</svg>
);

/** Ponto de status, como o .pip da página. */
export const Pip: React.FC<{color: string; size?: number; glow?: number}> = ({
	color,
	size = 12,
	glow = 1,
}) => (
	<span
		style={{
			display: 'inline-block',
			flex: 'none',
			width: size,
			height: size,
			borderRadius: '50%',
			background: color,
			boxShadow: glow > 0 ? `0 0 ${size * 1.6 * glow}px ${color}` : undefined,
		}}
	/>
);

/* Ícones dos benefícios — traço grosso, pensados para ler pequenos no celular. */

export const Raio: React.FC<P> = ({size = 28, color = 'currentColor', stroke = 2.2, style}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8z"
			stroke={color}
			strokeWidth={stroke}
			strokeLinejoin="round"
			fill={color}
			fillOpacity={0.25}
		/>
	</svg>
);

export const InfinitoIcone: React.FC<P> = ({size = 28, color = 'currentColor', stroke = 2.4, style}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M12 12c-2-2.6-3.6-4-5.5-4a4 4 0 1 0 0 8c1.9 0 3.5-1.4 5.5-4zm0 0c2 2.6 3.6 4 5.5 4a4 4 0 1 0 0-8c-1.9 0-3.5 1.4-5.5 4z"
			stroke={color}
			strokeWidth={stroke}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const Etiqueta: React.FC<P> = ({size = 28, color = 'currentColor', stroke = 2.2, style}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={style}>
		<path
			d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0L3.5 12.2z"
			stroke={color}
			strokeWidth={stroke}
			strokeLinejoin="round"
		/>
		<circle cx="8.3" cy="8.3" r="1.6" fill={color} />
	</svg>
);

/** Selo circular com degradê, que abriga um ícone. */
export const Selo: React.FC<{fundo: string; tamanho?: number; children: React.ReactNode}> = ({
	fundo,
	tamanho = 76,
	children,
}) => (
	<span
		style={{
			flex: 'none',
			width: tamanho,
			height: tamanho,
			borderRadius: tamanho * 0.32,
			background: fundo,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: '0 14px 30px -10px rgba(30,0,70,.55), inset 0 2px 0 rgba(255,255,255,.45)',
		}}
	>
		{children}
	</span>
);
