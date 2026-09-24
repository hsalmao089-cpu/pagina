import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Marca, mola} from '../componentes/Efeitos';
import {Etiqueta, Raio, Selo, Shield} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, f, grad, TEMPO, vidro} from '../tema';

/* ==========================================================================
   ATO 3 · CONFIANÇA
   As três objeções que sobram depois da prova — quanto custa, quanto demora
   para começar, e se não servir — respondidas em três cartões, um por batida.
   ========================================================================== */

const ICONES = [Etiqueta, Raio, Shield];
const FUNDOS = [grad.marca, grad.alerta, grad.sucesso];
const Y0 = 590;
const ALTURA = 212;
const VAO = 30;

export const Confianca: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const k = r.confianca;
	const corpo = useCorpo(k.titulo, 136, 920, dsp);
	const sai = interpolate(frame, [dur - 12, dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});

	return (
		<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 120}px)`}}>
			<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 262, width: 940}}>
				<Cut at={4} dur={18}>
					{k.titulo[0]}
				</Cut>
				<Cut at={9} dur={18}>
					<Marca at={16} fundo={c.amarelo} corTexto={c.tinta}>
						{k.titulo[1]}
					</Marca>
				</Cut>
			</div>

			{k.cartoes.slice(0, 3).map((ct, i) => {
				const at = 14 + i * TEMPO;
				const s = frame < at ? 0 : mola(frame, at, fps, 200);
				const Icone = ICONES[i % ICONES.length];
				return (
					<div
						key={i}
						style={{
							...vidro,
							position: 'absolute',
							left: 80,
							top: Y0 + i * (ALTURA + VAO),
							width: 880,
							height: ALTURA,
							borderRadius: 34,
							display: 'flex',
							alignItems: 'center',
							gap: 34,
							padding: '0 40px',
							opacity: Math.min(1, s * 1.5),
							transformOrigin: 'left center',
							transform: `translateX(${(1 - s) * -140}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
						}}
					>
						<div style={{transform: `rotate(${interpolate(s, [0, 1], [-40, 0])}deg) scale(${0.5 + 0.5 * s})`}}>
							<Selo fundo={FUNDOS[i % FUNDOS.length]} tamanho={120}>
								<Icone size={64} color={c.tinta} stroke={2.2} />
							</Selo>
						</div>
						<div>
							<div
								style={{
									fontFamily: f.display,
									fontWeight: 800,
									fontVariationSettings: "'wdth' 98, 'opsz' 48",
									fontSize: 62,
									letterSpacing: '-0.03em',
									lineHeight: 1,
									color: c.branco,
									textShadow: '0 6px 24px rgba(40,0,80,.35)',
								}}
							>
								{ct.titulo}
							</div>
							<div style={{fontFamily: f.text, fontWeight: 600, fontSize: 31, color: c.nevoa, marginTop: 12}}>
								{ct.sub}
							</div>
						</div>
					</div>
				);
			})}

			{k.cartoes.slice(0, 3).map((_, i) => (
				<Som key={i} efeito="pop" at={14 + i * TEMPO} volume={0.5} />
			))}
		</AbsoluteFill>
	);
};
