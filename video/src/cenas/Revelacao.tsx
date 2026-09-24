import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Confete, Marca, Raios} from '../componentes/Efeitos';
import {FitaRiscada} from '../componentes/Fita';
import {Infinito} from '../componentes/Infinito';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, f, grad, prog, tag, textoDegrade} from '../tema';
import {BARRA, FITAS} from './Limite';

/* ==========================================================================
   ATO 2 · A BARRA VIRA ∞ (drop da trilha)

   No quadro do drop a barra de uso deixa de ser barra: vira uma linha de
   partículas no mesmo lugar e na mesma cor, que se abre em ∞ e ganha o
   degradê da marca. Os pedaços das fitas rasgadas voam como confete. As três
   dores voltam, pequenas, riscadas de verde.
   ========================================================================== */

const CENTRO_BARRA = BARRA.y + BARRA.h / 2;
const CENTRO_INF = 690;
const ALTURA_CANVAS = 700;
const PEDACOS = ['#FFD60A', '#FFD60A', '#161000', '#FFFFFF'];

export const Revelacao: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const corpo = useCorpo(r.revelacao.titulo, 150, 920, dsp);

	// a barra se abre em ∞ nos primeiros 30 quadros
	const abre = interpolate(frame, [2, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.34, 1.3, 0.5, 1),
	});
	const cor = interpolate(frame, [6, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const A = interpolate(abre, [0, 1], [BARRA.w / 2, 405]);
	const cy = interpolate(abre, [0, 1], [CENTRO_BARRA, CENTRO_INF]);

	// saída: zoom para dentro do ∞, que leva à grade de agentes
	const mergulho = interpolate(frame, [dur - 16, dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});
	const pMarca = prog(frame, 10, 16);
	const raios = interpolate(frame, [4, 14, dur - 16, dur], [0, 0.8, 0.55, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				transformOrigin: `540px ${CENTRO_INF}px`,
				transform: `scale(${1 + mergulho * 2.2})`,
				opacity: 1 - mergulho,
				filter: mergulho > 0.02 ? `blur(${mergulho * 14}px)` : undefined,
			}}
		>
			<Raios cx={540} cy={CENTRO_INF} raio={1150} opacidade={raios} giro={frame * 0.5} />

			<div style={{position: 'absolute', left: 0, top: cy - ALTURA_CANVAS / 2, width: 1080, height: ALTURA_CANVAS}}>
				<Infinito
					nasce={0}
					modo="linha"
					abertura={abre}
					mistura={cor}
					corBase={c.vermelho}
					A={A}
					largura={1080}
					altura={ALTURA_CANVAS}
				/>
			</div>

			{/* a marca */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 262,
					display: 'flex',
					alignItems: 'baseline',
					gap: 20,
					opacity: pMarca,
					transform: `translateY(${(1 - pMarca) * 24}px)`,
				}}
			>
				<span
					style={{
						fontFamily: f.display,
						fontWeight: 800,
						fontSize: 64,
						letterSpacing: '0.01em',
						fontVariationSettings: "'wdth' 100, 'opsz' 48",
						color: c.branco,
						textShadow: '0 8px 30px rgba(40,0,80,.4)',
					}}
				>
					{r.marca}
				</span>
				<span style={{...tag, fontSize: 22, color: c.nevoa}}>apresenta</span>
			</div>

			<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 985, width: 940}}>
				<Cut at={16} dur={18}>
					{r.revelacao.titulo[0]}
				</Cut>
				<Cut at={21} dur={18}>
					<Marca at={27} fundo={c.branco}>
						<span style={{...textoDegrade(grad.tinta), filter: 'none'}}>{r.revelacao.titulo[1]}</span>
					</Marca>
				</Cut>
			</div>

			{/* as três dores, de volta, riscadas */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 1318,
					width: 900,
					display: 'flex',
					flexWrap: 'wrap',
					gap: '22px 18px',
				}}
			>
				{r.amarras.fitas.map((t, i) => (
					<FitaRiscada key={i} texto={t} at={40 + i * 7} risca={50 + i * 7} />
				))}
			</div>

			{/* pedaços das fitas rasgadas */}
			{FITAS.map((ft, i) => (
				<Confete key={i} at={0} x={540 + ft.corte} y={ft.y} cores={PEDACOS} n={46} semente={71 + i} />
			))}

			<Som efeito="impacto" at={0} volume={0.55} />
			<Som efeito="brilho" at={4} volume={0.3} />
			{r.amarras.fitas.map((_, i) => (
				<Som key={i} efeito="pop" at={50 + i * 7} volume={0.4} />
			))}
			<Som efeito="whoosh" at={dur - 18} volume={0.45} />
		</AbsoluteFill>
	);
};
