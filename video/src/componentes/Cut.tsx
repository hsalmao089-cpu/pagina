import React from 'react';
import {useCurrentFrame} from 'remotion';
import {exit, prog, slow} from '../tema';

type Props = {
	/** Quadro em que a linha começa a subir. */
	at: number;
	dur?: number;
	/** Quadro em que a linha sai, subindo para trás da mesma aresta. */
	out?: number;
	outDur?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

// Corte de máscara da página (.cut): a linha sobe de trás de uma aresta em vez
// de aparecer por fade. O respiro vertical impede que acento e descendente
// (Á, ç, g) sejam aparados pela máscara; o deslocamento de 135% cobre esse
// respiro, então nenhuma lasca aparece antes da hora.
export const Cut: React.FC<Props> = ({
	at,
	dur = 20,
	out,
	outDur = 12,
	style,
	children,
}) => {
	const frame = useCurrentFrame();
	const pin = prog(frame, at, dur, slow);
	const pout = out === undefined ? 0 : prog(frame, out, outDur, exit);
	const y = (1 - pin) * 135 - pout * 135;

	return (
		<span
			style={{
				display: 'block',
				overflow: 'hidden',
				whiteSpace: 'nowrap',
				padding: '0.12em 0 0.18em',
				margin: '-0.12em 0 -0.18em',
				...style,
			}}
		>
			<span style={{display: 'block', transform: `translateY(${y}%)`}}>
				{children}
			</span>
		</span>
	);
};
