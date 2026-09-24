import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {c, exit, f, grad, prog, tag} from '../tema';
import {mola} from './Efeitos';
import {Pip} from './Icones';

type SecaoProps = {
	n: string;
	at?: number;
	out?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
};

/** Cabeçalho de seção em pílula de vidro, com o número num selo colorido. */
export const Secao: React.FC<SecaoProps> = ({n, at = 0, out, children, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = frame < at ? 0 : mola(frame, at, fps, 180);
	const po = out === undefined ? 0 : prog(frame, out, 10, exit);
	return (
		<div style={{...style, opacity: Math.min(1, Math.max(0, (frame - at) / 4)) * (1 - po)}}>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 16,
					padding: '9px 26px 9px 9px',
					borderRadius: 999,
					background: 'rgba(255,255,255,.14)',
					border: '2px solid rgba(255,255,255,.26)',
					boxShadow: '0 16px 40px -18px rgba(30,0,70,.6)',
					transformOrigin: 'left center',
					transform: `scale(${0.7 + 0.3 * s})`,
				}}
			>
				<span
					style={{
						width: 48,
						height: 48,
						borderRadius: 999,
						background: grad.marca,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: f.mono,
						fontWeight: 700,
						fontSize: 20,
						color: c.tinta,
					}}
				>
					{n}
				</span>
				<span style={{...tag, color: c.branco, fontSize: 22}}>{children}</span>
			</div>
		</div>
	);
};

type ChipProps = {
	tom: 'live' | 'halt' | 'neutro';
	children: React.ReactNode;
	style?: React.CSSProperties;
};

/** Selo de estado no terminal: verde funcionando, vermelho travado. */
export const Chip: React.FC<ChipProps> = ({tom, children, style}) => {
	const cor = tom === 'live' ? c.verde : tom === 'halt' ? c.vermelho : c.nevoa;
	const rgb = tom === 'live' ? '46,229,157' : tom === 'halt' ? '255,45,85' : '255,255,255';
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 12,
				fontFamily: f.mono,
				fontWeight: 700,
				fontSize: 19,
				letterSpacing: '0.14em',
				textTransform: 'uppercase',
				padding: '9px 16px',
				borderRadius: 999,
				color: cor,
				border: `2px solid rgba(${rgb},.5)`,
				background: `rgba(${rgb},.14)`,
				boxShadow: `0 0 30px rgba(${rgb},.25)`,
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{tom === 'neutro' ? null : <Pip color={cor} size={10} />}
			{children}
		</span>
	);
};

/** Empurrão lento de câmera: a cena nunca fica parada, mesmo quando o texto está. */
export const Camera: React.FC<{
	dur: number;
	de?: number;
	ate?: number;
	children: React.ReactNode;
}> = ({dur, de = 1, ate = 1.035, children}) => {
	const frame = useCurrentFrame();
	const s = de + (ate - de) * Math.min(1, Math.max(0, frame / dur));
	return (
		<div style={{position: 'absolute', inset: 0, transform: `scale(${s})`}}>{children}</div>
	);
};
