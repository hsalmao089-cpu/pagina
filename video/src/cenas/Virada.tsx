import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Raios} from '../componentes/Efeitos';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {dsp, grad, prog} from '../tema';

/* 0:08–0:10 · A VIRADA
   A pergunta. O fundo escurece para o violeta da tensão, a palavra "limite" é
   riscada, raios de luz começam a girar por trás e tudo é puxado para dentro
   da câmera no último meio segundo — o drop acontece no corte. */

const RISCO = 28;

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
				<span style={{opacity: 1 - risco * 0.45}}>{palavra}</span>
				<span
					style={{
						position: 'absolute',
						left: '-5%',
						top: '50%',
						height: '0.11em',
						width: `${risco * 110}%`,
						background: grad.alerta,
						boxShadow: '0 0 34px rgba(255,80,80,.9)',
						borderRadius: 999,
						transform: 'rotate(-4deg)',
						transformOrigin: 'left center',
					}}
				/>
			</span>
			{depois}
		</>
	);
};

export const Virada: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const corpo = useCorpo(r.virada.linhas, 136, 920, dsp);
	const risco = prog(frame, RISCO, 10);
	// sucção final: o texto vem para a câmera e se desfaz no clarão do drop
	const puxa = interpolate(frame, [dur - 14, dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});
	const raios = interpolate(frame, [10, dur], [0, 0.9], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.quad),
	});

	return (
		<AbsoluteFill>
			<Raios cx={540} cy={900} raio={1300} opacidade={raios} giro={frame * (0.6 + puxa * 4)} />
			<AbsoluteFill
				style={{
					transform: `scale(${1 + puxa * 0.55})`,
					filter: puxa > 0.02 ? `blur(${puxa * 18}px)` : undefined,
					opacity: 1 - puxa * 0.9,
				}}
			>
				<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 760, width: 920}}>
					<Cut at={0} dur={16}>
						{comRisco(r.virada.linhas[0], risco)}
					</Cut>
					<Cut at={5} dur={16}>
						{comRisco(r.virada.linhas[1] ?? '', risco)}
					</Cut>
				</div>
			</AbsoluteFill>
			<Som efeito="whoosh" at={RISCO - 2} volume={0.45} />
		</AbsoluteFill>
	);
};
