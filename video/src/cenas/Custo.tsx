import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Som} from '../componentes/Som';
import {Camera, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, prog, slow, TEMPO} from '../tema';

/* 0:03–0:08 · O CUSTO DO LIMITE
   Três golpes no tempo da música — Cota. Fila. 429. —, cada um com o código de
   erro que o dev já viu no terminal. Depois, o relógio: o limite volta em cinco
   horas; o prazo não. */

const TROCA = 75; // quadro em que as palavras saem e o relógio entra

const Golpe: React.FC<{at: number; palavra: string; codigo: string; sai: number; corpo: number}> = ({
	at,
	palavra,
	codigo,
	sai,
	corpo,
}) => {
	const frame = useCurrentFrame();
	const t = frame - at;
	if (t < 0) return null;
	// batida seca: entra grande e desfocada, assenta em 5 quadros
	const p = prog(frame, at, 6, slow);
	const escala = interpolate(p, [0, 1], [1.45, 1]);
	const blur = interpolate(p, [0, 1], [14, 0]);
	const pc = prog(frame, at + 3, 8, slow);
	const ps = prog(frame, sai, 9, exit);
	return (
		<div
			style={{
				opacity: Math.min(1, p * 1.6) * (1 - ps),
				transform: `translateY(${-ps * 80}px)`,
				marginBottom: 34,
			}}
		>
			<div
				style={{
					...dsp,
					fontSize: corpo,
					transformOrigin: 'left 70%',
					transform: `scale(${escala})`,
					filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
				}}
			>
				{palavra}
			</div>
			<div
				style={{
					fontFamily: f.mono,
					fontSize: 32,
					fontWeight: 500,
					color: c.halt,
					letterSpacing: '0.04em',
					marginTop: 6,
					opacity: pc,
					transform: `translateX(${(1 - pc) * -20}px)`,
				}}
			>
				{codigo}
			</div>
		</div>
	);
};

const Relogio: React.FC<{at: number; rotulo: string}> = ({at, rotulo}) => {
	const frame = useCurrentFrame();
	const t = frame - at;
	if (t < 0) return null;
	// um segundo a menos por tempo da música: o tique do relógio é o chimbal
	const passados = Math.floor(t / TEMPO) + 1;
	const total = 4 * 3600 + 59 * 60 + 60 - passados;
	const hh = String(Math.floor(total / 3600)).padStart(2, '0');
	const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
	const ss = String(total % 60).padStart(2, '0');
	const dentro = t % TEMPO;
	const pulo = interpolate(dentro, [0, 4], [1, 0], {extrapolateRight: 'clamp'});
	const p = prog(frame, at, 14, slow);
	return (
		<div style={{opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
			<div
				style={{
					fontFamily: f.mono,
					fontWeight: 500,
					fontSize: 24,
					letterSpacing: '0.2em',
					textTransform: 'uppercase',
					color: c.ash,
				}}
			>
				{rotulo}
			</div>
			<div
				style={{
					fontFamily: f.mono,
					fontWeight: 500,
					fontSize: 176,
					letterSpacing: '-0.04em',
					lineHeight: 1,
					color: c.bone,
					marginTop: 18,
					fontVariantNumeric: 'tabular-nums',
					display: 'flex',
				}}
			>
				<span>
					{hh}:{mm}:
				</span>
				<span
					style={{
						color: c.halt,
						display: 'inline-block',
						transform: `translateY(${-pulo * 14}px)`,
						opacity: 1 - pulo * 0.35,
					}}
				>
					{ss}
				</span>
			</div>
			{/* cota consumida: a barra já nasce cheia */}
			<div style={{marginTop: 34, display: 'flex', alignItems: 'center', gap: 22}}>
				<div style={{flex: 1, height: 10, background: c.edge, borderRadius: 2, overflow: 'hidden'}}>
					<div
						style={{
							width: `${prog(frame, at + 4, 18, slow) * 100}%`,
							height: '100%',
							background: c.halt,
							boxShadow: `0 0 24px ${c.halt}`,
						}}
					/>
				</div>
				<span
					style={{
						fontFamily: f.mono,
						fontSize: 24,
						letterSpacing: '0.14em',
						color: c.halt,
						textTransform: 'uppercase',
					}}
				>
					cota 100%
				</span>
			</div>
		</div>
	);
};

export const Custo: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const k = r.custo;
	const corpoGolpe = useCorpo(
		k.golpes.map((g) => g.palavra),
		212,
		920,
		dsp,
	);
	const corpoPrazo = useCorpo(k.prazo, 150, 920, dsp);
	// tremor curto a cada golpe
	const tremor = k.golpes.reduce((acc, _, i) => {
		const t = frame - i * TEMPO;
		return acc + (t >= 0 && t < 6 ? (6 - t) / 6 : 0);
	}, 0);
	const tx = Math.sin(frame * 9.1) * 7 * tremor;
	const ty = Math.cos(frame * 7.3) * 5 * tremor;
	const sai = prog(frame, dur - 8, 8, exit);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1.01} ate={1.045}>
				<AbsoluteFill
					style={{
						transform: `translate(${tx}px, ${ty - sai * 60}px)`,
						opacity: 1 - sai,
					}}
				>
					<Secao n="§01" at={0} out={dur - 10} style={{position: 'absolute', left: 80, top: 272, width: 920}}>
						{k.secao}
					</Secao>

					<div style={{position: 'absolute', left: 80, top: 360, width: 920}}>
						{k.golpes.map((gp, i) => (
							<Golpe
								key={i}
								at={i * TEMPO}
								palavra={gp.palavra}
								codigo={gp.codigo}
								sai={TROCA - 6 + i * 2}
								corpo={corpoGolpe}
							/>
						))}
					</div>

					<div style={{position: 'absolute', left: 80, top: 420, width: 920}}>
						<Relogio at={TROCA} rotulo={k.rotulo} />
					</div>

					<div style={{...dsp, fontSize: corpoPrazo, position: 'absolute', left: 80, top: 900, width: 920}}>
						<Cut at={TROCA + 16} dur={18}>{k.prazo[0]}</Cut>
						<Cut at={TROCA + 21} dur={18} style={{color: c.halt}}>
							{k.prazo[1]}
						</Cut>
					</div>
				</AbsoluteFill>
			</Camera>

			{k.golpes.map((_, i) => (
				<Som key={i} efeito="golpe" at={i * TEMPO} volume={0.85} />
			))}
			<Som efeito="whoosh" at={TROCA - 5} volume={0.5} />
			{[0, 1, 2, 3, 4].map((i) => (
				<Som key={`t${i}`} efeito="tique" at={TROCA + i * TEMPO} volume={0.55} />
			))}
		</AbsoluteFill>
	);
};
