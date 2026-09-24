import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Infinito} from '../componentes/Infinito';
import {Som} from '../componentes/Som';
import {Camera} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, prog, slow, tag} from '../tema';

/* 0:10–0:14 · REVELAÇÃO (drop da trilha)
   O ∞ nasce do cruzamento e fecha o laço; a marca e a promessa sobem logo
   depois. O campo de partículas está no brilho máximo por trás. */

export const Revelacao: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const v = r.revelacao;
	const corpo = useCorpo(v.titulo, 158, 920, dsp);
	const sai = prog(frame, dur - 10, 10, exit);
	const pMarca = prog(frame, 4, 16, slow);
	const pSub = prog(frame, 22, 18, slow);
	const brilhoInf = interpolate(frame, [dur - 12, dur], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1.04} ate={1}>
				<div style={{position: 'absolute', left: 0, top: 380, width: 1080, height: 520}}>
					<Infinito nasce={0} largura={1080} altura={520} A={410} brilho={brilhoInf} />
				</div>

				{/* assinatura: a marca como na navegação da página */}
				<div
					style={{
						position: 'absolute',
						left: 80,
						top: 282,
						display: 'flex',
						alignItems: 'baseline',
						gap: 20,
						opacity: pMarca * (1 - sai),
						transform: `translateY(${(1 - pMarca) * 20 - sai * 40}px)`,
					}}
				>
					<span
						style={{
							fontFamily: f.display,
							fontWeight: 600,
							fontSize: 46,
							letterSpacing: '-0.02em',
							fontVariationSettings: "'wdth' 100, 'opsz' 18",
							color: c.bone,
						}}
					>
						{r.marca}
					</span>
					<span style={{...tag, fontSize: 22, color: c.ash}}>{v.apresenta}</span>
				</div>

				<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 944, width: 940}}>
					<Cut at={8} dur={20} out={dur - 10} outDur={10}>
						{v.titulo[0]}
					</Cut>
					<Cut at={13} dur={20} out={dur - 9} outDur={10}>
						{v.titulo[1]}
					</Cut>
				</div>

				<p
					style={{
						position: 'absolute',
						left: 80,
						top: 1290,
						width: 860,
						margin: 0,
						fontFamily: f.text,
						fontSize: 40,
						lineHeight: 1.35,
						fontWeight: 500,
						color: c.ash,
						opacity: pSub * (1 - sai),
						transform: `translateY(${(1 - pSub) * 24 - sai * 40}px)`,
						textWrap: 'pretty',
					}}
				>
					{v.sub}
				</p>
			</Camera>

			<Som efeito="impacto" at={0} volume={0.75} />
		</AbsoluteFill>
	);
};
