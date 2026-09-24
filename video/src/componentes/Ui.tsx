import React from 'react';
import {c, f} from '../tema';
import {Pip} from './Icones';

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
