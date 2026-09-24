import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {mola} from '../componentes/Efeitos';
import {Chave, Pip, Selo} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {Camera, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, grad, prog} from '../tema';

/* 0:20–0:25 · QUALQUER CLI, QUALQUER IDE
   Três esteiras de ferramentas correndo em sentidos alternados; cada uma com
   o seu ponto de cor. A frase de fecho entra numa pílula com a chave. */

const PONTOS = [c.verde, c.ciano, c.amarelo, c.rosa, c.roxo, c.laranja];

const destaque: React.CSSProperties = {color: c.amarelo, textShadow: '0 0 40px rgba(255,200,61,.45)'};

/** A última palavra da linha ganha destaque em amarelo. */
const ultimaEmDestaque = (linha: string) => {
	const i = linha.trimEnd().lastIndexOf(' ');
	if (i < 0) return <span style={destaque}>{linha}</span>;
	return (
		<>
			{linha.slice(0, i + 1)}
			<span style={destaque}>{linha.slice(i + 1)}</span>
		</>
	);
};

const Ferramenta: React.FC<{nome: string; cor: string}> = ({nome, cor}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 18,
			flex: 'none',
			padding: '24px 34px',
			borderRadius: 999,
			background: 'linear-gradient(160deg, rgba(255,255,255,.24), rgba(255,255,255,.1))',
			border: '2px solid rgba(255,255,255,.34)',
			boxShadow: '0 20px 40px -20px rgba(20,0,60,.6), inset 0 2px 0 rgba(255,255,255,.4)',
			fontFamily: f.display,
			fontWeight: 700,
			fontVariationSettings: "'wdth' 100, 'opsz' 24",
			fontSize: 42,
			letterSpacing: '-0.02em',
			color: c.branco,
			whiteSpace: 'nowrap',
		}}
	>
		<Pip color={cor} size={16} />
		{nome}
	</div>
);

const Esteira: React.FC<{nomes: string[]; linha: number; sentido: 1 | -1; at: number; velocidade: number}> = ({
	nomes,
	linha,
	sentido,
	at,
	velocidade,
}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, 18);
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
				transform: `translateX(${base + desloca + (1 - p) * 160 * sentido}px)`,
				opacity: p,
			}}
		>
			{fila.map((n, i) => (
				<Ferramenta key={i} nome={n} cor={PONTOS[(i + linha * 2) % PONTOS.length]} />
			))}
		</div>
	);
};

export const Compat: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const k = r.compat;
	const corpo = useCorpo(k.titulo, 128, 920, dsp);
	const sai = prog(frame, dur - 9, 9, exit);
	const fecho = frame < 42 ? 0 : mola(frame, 42, fps, 170);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.03}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					<Secao n="03" at={0} style={{position: 'absolute', left: 80, top: 262}}>
						{k.secao}
					</Secao>

					<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 370, width: 940}}>
						<Cut at={2} dur={18}>
							{ultimaEmDestaque(k.titulo[0])}
						</Cut>
						<Cut at={7} dur={18}>
							{ultimaEmDestaque(k.titulo[1] ?? '')}
						</Cut>
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
							WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
							maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
						}}
					>
						{k.ferramentas.map((nomes, i) => (
							<Esteira
								key={i}
								nomes={nomes}
								linha={i}
								sentido={i % 2 === 0 ? -1 : 1}
								at={10 + i * 5}
								velocidade={2.4 + i * 0.4}
							/>
						))}
					</div>

					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 1170,
							opacity: Math.min(1, fecho * 1.5),
							transformOrigin: 'left center',
							transform: `scale(${0.6 + 0.4 * fecho})`,
						}}
					>
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 24,
								padding: '16px 36px 16px 16px',
								borderRadius: 999,
								background: 'rgba(15,5,45,.45)',
								border: '2px solid rgba(255,255,255,.26)',
								boxShadow: '0 30px 60px -30px rgba(10,0,40,.7)',
							}}
						>
							<Selo fundo={grad.marca} tamanho={84}>
								<Chave size={46} color={c.tinta} stroke={2.6} />
							</Selo>
							<span
								style={{
									fontFamily: f.display,
									fontWeight: 700,
									fontVariationSettings: "'wdth' 98, 'opsz' 40",
									fontSize: 46,
									letterSpacing: '-0.025em',
									color: c.branco,
									whiteSpace: 'nowrap',
								}}
							>
								{k.fecho}
							</span>
						</div>
					</div>
				</AbsoluteFill>
			</Camera>

			{k.ferramentas.map((_, i) => (
				<Som key={i} efeito="pop" at={10 + i * 5} volume={0.35} />
			))}
			<Som efeito="pop" at={42} volume={0.55} />
		</AbsoluteFill>
	);
};
