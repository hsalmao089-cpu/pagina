import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Pip} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {Camera, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, prog, slow} from '../tema';

/* 0:20–0:25 · QUALQUER CLI, QUALQUER IDE
   Três esteiras de ferramentas correndo em sentidos alternados, como a faixa
   de clientes da página. O ponto verde em cada uma diz "funciona aqui". */

const Ferramenta: React.FC<{nome: string}> = ({nome}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 18,
			flex: 'none',
			padding: '24px 34px',
			borderRadius: 4,
			background: c.surf,
			border: `2px solid ${c.edge2}`,
			boxShadow: '0 2px 0 rgba(242,239,233,.06) inset',
			fontFamily: f.display,
			fontWeight: 600,
			fontVariationSettings: "'wdth' 100, 'opsz' 24",
			fontSize: 42,
			letterSpacing: '-0.02em',
			color: c.bone,
			whiteSpace: 'nowrap',
		}}
	>
		<Pip color={c.live} size={13} />
		{nome}
	</div>
);

const Esteira: React.FC<{nomes: string[]; sentido: 1 | -1; at: number; velocidade: number}> = ({
	nomes,
	sentido,
	at,
	velocidade,
}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, 18, slow);
	// três cópias da fila garantem que a esteira nunca mostre o fim
	const fila = [...nomes, ...nomes, ...nomes];
	const desloca = frame * velocidade * sentido;
	const base = sentido === 1 ? -700 : -200;
	return (
		<div
			style={{
				display: 'flex',
				gap: 20,
				width: 'max-content',
				transform: `translateX(${base + desloca + (1 - p) * 140 * sentido}px)`,
				opacity: p,
			}}
		>
			{fila.map((n, i) => (
				<Ferramenta key={i} nome={n} />
			))}
		</div>
	);
};

export const Compat: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const k = r.compat;
	const corpo = useCorpo(k.titulo, 124, 920, dsp);
	const sai = prog(frame, dur - 9, 9, exit);
	const pFecho = prog(frame, 44, 18, slow);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.03}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					<Secao n="§03" at={0} style={{position: 'absolute', left: 80, top: 272, width: 920}}>
						{k.secao}
					</Secao>

					<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 360, width: 940}}>
						<Cut at={2} dur={18}>{k.titulo[0]}</Cut>
						<Cut at={7} dur={18}>{k.titulo[1]}</Cut>
					</div>

					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 700,
							width: 1080,
							display: 'flex',
							flexDirection: 'column',
							gap: 22,
							WebkitMaskImage:
								'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)',
							maskImage: 'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)',
						}}
					>
						{k.ferramentas.map((nomes, i) => (
							<Esteira
								key={i}
								nomes={nomes}
								sentido={i % 2 === 0 ? -1 : 1}
								at={10 + i * 5}
								velocidade={2.2 + i * 0.35}
							/>
						))}
					</div>

					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 1180,
							width: 920,
							opacity: pFecho,
							transform: `translateY(${(1 - pFecho) * 24}px)`,
						}}
					>
						<div
							style={{
								fontFamily: f.display,
								fontWeight: 700,
								fontVariationSettings: "'wdth' 98, 'opsz' 40",
								fontSize: 58,
								letterSpacing: '-0.03em',
								lineHeight: 1.05,
								color: c.bone,
							}}
						>
							{k.fecho}
						</div>
					</div>
				</AbsoluteFill>
			</Camera>

			<Som efeito="whoosh" at={0} volume={0.4} />
			{k.ferramentas.map((_, i) => (
				<Som key={i} efeito="blip" at={10 + i * 5} volume={0.3} />
			))}
			<Som efeito="blip" at={44} volume={0.4} />
		</AbsoluteFill>
	);
};
