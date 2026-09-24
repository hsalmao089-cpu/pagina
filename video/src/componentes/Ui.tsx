import React from 'react';
import {useCurrentFrame} from 'remotion';
import {c, exit, f, prog, slow, tag} from '../tema';
import {Pip} from './Icones';

/** .panel da página: sombra difusa por baixo e um fio de luz na aresta de cima. */
export const painel: React.CSSProperties = {
	position: 'relative',
	background: c.surf,
	border: `2px solid ${c.edge}`,
	borderRadius: 6,
	boxShadow:
		'0 2px 0 rgba(242,239,233,.07) inset, 0 80px 140px -60px rgba(0,0,0,.95), 0 30px 60px -30px rgba(0,0,0,.8)',
};

type TagProps = {
	at?: number;
	out?: number;
	pip?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** Rótulo mono em caixa alta, entrando com um deslize curto. */
export const Tag: React.FC<TagProps> = ({at = 0, out, pip, style, children}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, 14, slow) * (out === undefined ? 1 : 1 - prog(frame, out, 10, exit));
	return (
		<div
			style={{
				...tag,
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				opacity: p,
				transform: `translateY(${(1 - p) * 18}px)`,
				...style,
			}}
		>
			{pip ? <Pip color={pip} size={12} /> : null}
			<span>{children}</span>
		</div>
	);
};

type SecaoProps = {
	n: string;
	at?: number;
	out?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
};

/** Cabeçalho de seção da página: número, título e um fio que corre até a borda. */
export const Secao: React.FC<SecaoProps> = ({n, at = 0, out, children, style}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, 16, slow);
	const po = out === undefined ? 0 : prog(frame, out, 10, exit);
	const fio = prog(frame, at + 4, 26, slow) * (1 - po);
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 22,
				opacity: p * (1 - po),
				...style,
			}}
		>
			<span
				style={{
					fontFamily: f.mono,
					fontWeight: 500,
					fontSize: 24,
					letterSpacing: '0.1em',
					color: c.dim,
					transform: `translateY(${(1 - p) * 16}px)`,
				}}
			>
				{n}
			</span>
			<span style={{...tag, color: c.ash, transform: `translateY(${(1 - p) * 16}px)`}}>
				{children}
			</span>
			<span
				style={{
					flex: 1,
					height: 2,
					background: c.edge2,
					transformOrigin: 'left center',
					transform: `scaleX(${fio})`,
				}}
			/>
		</div>
	);
};

type ChipProps = {
	tom: 'live' | 'halt' | 'neutro';
	children: React.ReactNode;
	style?: React.CSSProperties;
};

/** .chip / .chip-live / .chip-halt da página. */
export const Chip: React.FC<ChipProps> = ({tom, children, style}) => {
	const cor = tom === 'live' ? c.live : tom === 'halt' ? c.halt : c.ash;
	const rgb = tom === 'live' ? '63,191,127' : tom === 'halt' ? '229,86,91' : '242,239,233';
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 12,
				fontFamily: f.mono,
				fontWeight: 500,
				fontSize: 19,
				letterSpacing: '0.16em',
				textTransform: 'uppercase',
				padding: '8px 14px',
				borderRadius: 3,
				color: cor,
				border: `2px solid rgba(${rgb},.32)`,
				background: `rgba(${rgb},.07)`,
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{tom === 'neutro' ? null : <Pip color={cor} size={9} />}
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
