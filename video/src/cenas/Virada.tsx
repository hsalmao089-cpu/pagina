import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, prog, slow} from '../tema';

/* 0:08–0:10 · A VIRADA
   A pergunta. O campo de partículas começa a acender por trás, a palavra
   "limite" é riscada, e tudo é puxado para dentro da câmera no último meio
   segundo — o drop acontece no corte. */

const RISCO = 30;

/** Envolve a palavra "limite" (se existir na linha) num traço que a risca. */
const comRisco = (linha: string, risco: number) => {
	const m = /limite/i.exec(linha);
	if (!m) return linha;
	const antes = linha.slice(0, m.index);
	const palavra = linha.slice(m.index, m.index + m[0].length);
	const depois = linha.slice(m.index + m[0].length);
	return (
		<>
			{antes}
			<span style={{position: 'relative', display: 'inline-block'}}>
				<span style={{color: risco > 0.5 ? c.ash : c.bone}}>{palavra}</span>
				<span
					style={{
						position: 'absolute',
						left: '-4%',
						top: '52%',
						height: '0.085em',
						width: `${risco * 108}%`,
						background: c.halt,
						boxShadow: `0 0 28px ${c.halt}`,
						borderRadius: 4,
					}}
				/>
			</span>
			{depois}
		</>
	);
};

export const Virada: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const corpo = useCorpo(r.virada.linhas, 132, 920, dsp);
	const risco = prog(frame, RISCO, 10, slow);
	// sucção final: o texto vem para a câmera e se desfaz no clarão do drop
	const puxa = interpolate(frame, [dur - 14, dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					transform: `scale(${1 + puxa * 0.5})`,
					filter: puxa > 0.02 ? `blur(${puxa * 18}px)` : undefined,
					opacity: 1 - puxa * 0.9,
				}}
			>
				<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 760, width: 920}}>
					<Cut at={0} dur={16}>{comRisco(r.virada.linhas[0], risco)}</Cut>
					<Cut at={5} dur={16}>{comRisco(r.virada.linhas[1] ?? '', risco)}</Cut>
				</div>
			</AbsoluteFill>
			<Som efeito="whoosh" at={RISCO - 2} volume={0.45} />
		</AbsoluteFill>
	);
};
