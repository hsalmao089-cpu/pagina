import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Confete, Marca, Raios} from '../componentes/Efeitos';
import {Infinito} from '../componentes/Infinito';
import {Som} from '../componentes/Som';
import {Camera} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, grad, prog, tag, textoDegrade} from '../tema';

/* 0:10–0:14 · REVELAÇÃO (drop da trilha)
   O ∞ nasce do cruzamento e fecha o laço num degradê que corre pela fita;
   confete explode do centro, raios giram por trás, e a promessa sobe. */

const CORES_CONFETE = ['#FFC83D', '#FF7A1A', '#FF3D9A', '#A855F7', '#22D3EE', '#2EE59D', '#FFFFFF'];

export const Revelacao: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const v = r.revelacao;
	const corpo = useCorpo(v.titulo, 164, 920, dsp);
	const sai = prog(frame, dur - 10, 10, exit);
	const pMarca = prog(frame, 4, 16);
	const pSub = prog(frame, 22, 18);
	const brilhoInf = interpolate(frame, [dur - 12, dur], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const raios = interpolate(frame, [0, 8, dur - 12, dur], [1, 0.75, 0.55, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1.05} ate={1}>
				<Raios cx={540} cy={640} raio={1100} opacidade={raios} giro={frame * 0.5} />
				<div style={{position: 'absolute', left: 0, top: 380, width: 1080, height: 520}}>
					<Infinito nasce={0} largura={1080} altura={520} A={410} brilho={brilhoInf} />
				</div>

				{/* assinatura */}
				<div
					style={{
						position: 'absolute',
						left: 80,
						top: 280,
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
							fontWeight: 700,
							fontSize: 48,
							letterSpacing: '-0.02em',
							fontVariationSettings: "'wdth' 100, 'opsz' 24",
							color: c.branco,
						}}
					>
						{r.marca}
					</span>
					<span style={{...tag, fontSize: 22, color: c.nevoa}}>{v.apresenta}</span>
				</div>

				<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 930, width: 940}}>
					<Cut at={8} dur={20} out={dur - 10} outDur={10}>
						{v.titulo[0]}
					</Cut>
					<Cut at={13} dur={20} out={dur - 9} outDur={10}>
						<Marca at={17} fundo={c.branco}>
							<span style={{...textoDegrade(grad.tinta), filter: 'none'}}>{v.titulo[1]}</span>
						</Marca>
					</Cut>
				</div>

				<p
					style={{
						position: 'absolute',
						left: 80,
						top: 1296,
						width: 880,
						margin: 0,
						fontFamily: f.text,
						fontSize: 42,
						lineHeight: 1.32,
						fontWeight: 600,
						color: c.nevoa,
						opacity: pSub * (1 - sai),
						transform: `translateY(${(1 - pSub) * 24 - sai * 40}px)`,
						textWrap: 'pretty',
						textShadow: '0 4px 24px rgba(40,0,80,.35)',
					}}
				>
					{v.sub}
				</p>
			</Camera>

			<Confete at={1} x={540} y={640} cores={CORES_CONFETE} n={170} semente={300} />

			<Som efeito="impacto" at={0} volume={0.7} />
			<Som efeito="brilho" at={1} volume={0.45} />
		</AbsoluteFill>
	);
};
