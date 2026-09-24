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
			boxShadow: `0 0 ${size * 1.6}px ${color}${Math.round(glow * 0.6 * 255)
				.toString(16)
				.padStart(2, '0')}`,
		}}
	/>
);
