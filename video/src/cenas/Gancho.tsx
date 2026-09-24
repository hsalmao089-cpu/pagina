import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Clarao} from '../componentes/Camadas';
import {Glitch} from '../componentes/Glitch';
import {Som} from '../componentes/Som';
import {Terminal} from '../componentes/Terminal';
import {Camera, Chip} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, prog} from '../tema';

/* 0:00–0:03 · GANCHO
   Começa no meio da ação — o terminal já está trabalhando no primeiro quadro,
   que é o que o feed mostra antes de alguém decidir parar o dedo.
   No 1,5 s o trabalho quebra: limite atingido. */

const ERRO = 45;

export const Gancho: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const g = r.gancho;
	const corpo = useCorpo([...g.antes, ...g.depois], 132, 920, dsp);

	// glitch em rajadas curtas logo depois do erro
	const forca = interpolate(frame - ERRO, [0, 1, 3, 4, 6, 7, 10, 12], [0, 1, 0.75, 0.2, 0.85, 0.35, 0.15, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const clarao = interpolate(frame - ERRO, [0, 1, 9], [0, 0.16, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// o empurrão de câmera trava no erro, com um tranco
	const tranco = interpolate(frame - ERRO, [0, 3, 14], [0, 0.03, 0.022], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const sai = prog(frame, dur - 8, 8, exit);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.03 + tranco}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					{/* manchete: troca no instante do erro */}
					<div style={{position: 'absolute', left: 80, top: 370, width: 920}}>
						<div style={{...dsp, fontSize: corpo, position: 'absolute', top: 0}}>
							<Cut at={-6} dur={12} out={ERRO - 7} outDur={7}>{g.antes[0]}</Cut>
							<Cut at={-3} dur={12} out={ERRO - 6} outDur={7} style={{color: c.ash}}>
								{g.antes[1]}
							</Cut>
						</div>
						<div style={{...dsp, fontSize: corpo, position: 'absolute', top: 0}}>
							<Cut at={ERRO + 1} dur={14}>{g.depois[0]}</Cut>
							<Cut at={ERRO + 4} dur={14} style={{color: c.halt}}>
								{g.depois[1]}
							</Cut>
						</div>
					</div>

					<Glitch forca={forca} id="gancho" style={{position: 'absolute', left: 80, top: 730}}>
						<Terminal
							largura={920}
							fonte={29}
							titulo={`${g.pasta} — claude`}
							chip={
								frame < ERRO ? (
									<Chip tom="live">executando</Chip>
								) : (
									<Chip tom="halt">interrompido</Chip>
								)
							}
							linhas={[
								{tipo: 'pedido', at: -40, texto: g.pedido},
								{tipo: 'passo', at: -24, texto: g.passos[0], fim: 5},
								{tipo: 'passo', at: 7, texto: g.passos[1], fim: 25},
								{tipo: 'passo', at: 27, texto: g.passos[2], falha: ERRO},
								{tipo: 'erro', at: ERRO, texto: g.erro, sub: g.volta},
							]}
							style={{
								borderColor: frame >= ERRO ? 'rgba(229,86,91,.35)' : undefined,
							}}
						/>
					</Glitch>
				</AbsoluteFill>
			</Camera>

			<Clarao intensidade={clarao} cor={c.halt} />

			<Som efeito="check" at={5} volume={0.35} />
			<Som efeito="check" at={25} volume={0.35} />
			<Som efeito="erro" at={ERRO} volume={0.9} />
		</AbsoluteFill>
	);
};
