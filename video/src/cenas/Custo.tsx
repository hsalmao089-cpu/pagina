import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Marca, mola} from '../componentes/Efeitos';
import {Pip} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {Camera, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, grad, prog, TEMPO, vidro} from '../tema';

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
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	// batida seca: entra grande, girada e desfocada, e assenta com mola
	const s = mola(frame, at, fps, 260);
	const escala = interpolate(s, [0, 1], [1.7, 1]);
	const giro = interpolate(s, [0, 1], [-7, 0]);
	const blur = interpolate(frame - at, [0, 4], [12, 0], {extrapolateRight: 'clamp'});
	const pc = prog(frame, at + 3, 8);
	const ps = prog(frame, sai, 9, exit);
	return (
		<div
			style={{
				opacity: Math.min(1, (frame - at) / 2) * (1 - ps),
				transform: `translateY(${-ps * 80}px)`,
				marginBottom: 30,
			}}
		>
			<div
				style={{
					...dsp,
					fontSize: corpo,
					transformOrigin: 'left 70%',
					transform: `scale(${escala}) rotate(${giro}deg)`,
					filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
				}}
			>
				{palavra}
			</div>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 14,
					marginTop: 14,
					padding: '10px 20px',
					borderRadius: 999,
					background: 'rgba(40,0,15,.45)',
					border: '2px solid rgba(255,255,255,.22)',
					fontFamily: f.mono,
					fontSize: 32,
					fontWeight: 600,
					color: c.branco,
					letterSpacing: '0.02em',
					opacity: pc,
					transform: `translateX(${(1 - pc) * -24}px)`,
				}}
			>
				<Pip color={c.amarelo} size={12} />
				{codigo}
			</div>
		</div>
	);
};

const Relogio: React.FC<{at: number; rotulo: string}> = ({at, rotulo}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame - at;
	if (t < 0) return null;
	// um segundo a menos por tempo da música: o tique do relógio é o chimbal
	const passados = Math.floor(t / TEMPO) + 1;
	const total = 4 * 3600 + 59 * 60 + 60 - passados;
	const hh = String(Math.floor(total / 3600)).padStart(2, '0');
	const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
	const ss = String(total % 60).padStart(2, '0');
	const pulo = interpolate(t % TEMPO, [0, 4], [1, 0], {extrapolateRight: 'clamp'});
	const s = mola(frame, at, fps, 170);
	return (
		<div
			style={{
				...vidro,
				padding: '34px 40px 38px',
				transformOrigin: 'left top',
				transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
				opacity: Math.min(1, t / 5),
			}}
		>
			<div
				style={{
					fontFamily: f.mono,
					fontWeight: 600,
					fontSize: 24,
					letterSpacing: '0.2em',
					textTransform: 'uppercase',
					color: c.nevoa,
				}}
			>
				{rotulo}
			</div>
			<div
				style={{
					fontFamily: f.mono,
					fontWeight: 600,
					fontSize: 150,
					letterSpacing: '-0.05em',
					lineHeight: 1,
					color: c.branco,
					marginTop: 16,
					fontVariantNumeric: 'tabular-nums',
					display: 'flex',
					textShadow: '0 10px 40px rgba(60,0,20,.4)',
				}}
			>
				<span>
					{hh}:{mm}:
				</span>
				<span
					style={{
						color: c.amarelo,
						display: 'inline-block',
						transform: `translateY(${-pulo * 16}px) scale(${1 + pulo * 0.08})`,
						textShadow: '0 0 40px rgba(255,200,61,.55)',
					}}
				>
					{ss}
				</span>
			</div>
			{/* cota consumida: a barra já nasce cheia */}
			<div style={{marginTop: 28, display: 'flex', alignItems: 'center', gap: 22}}>
				<div
					style={{
						flex: 1,
						height: 16,
						background: 'rgba(255,255,255,.18)',
						borderRadius: 999,
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							width: `${prog(frame, at + 4, 18) * 100}%`,
							height: '100%',
							borderRadius: 999,
							background: grad.alerta,
							boxShadow: '0 0 30px rgba(255,90,60,.7)',
						}}
					/>
				</div>
				<span
					style={{
						fontFamily: f.mono,
						fontWeight: 700,
						fontSize: 24,
						letterSpacing: '0.12em',
						color: c.amarelo,
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
		220,
		920,
		dsp,
	);
	const corpoPrazo = useCorpo(k.prazo, 150, 920, dsp);
	// tremor curto a cada golpe
	const tremor = k.golpes.reduce((acc, _, i) => {
		const t = frame - i * TEMPO;
		return acc + (t >= 0 && t < 6 ? (6 - t) / 6 : 0);
	}, 0);
	const tx = Math.sin(frame * 9.1) * 9 * tremor;
	const ty = Math.cos(frame * 7.3) * 6 * tremor;
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
					<Secao n="01" at={0} out={dur - 10} style={{position: 'absolute', left: 80, top: 262}}>
						{k.secao}
					</Secao>

					<div style={{position: 'absolute', left: 80, top: 370, width: 920}}>
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

					<div style={{position: 'absolute', left: 80, top: 390, width: 920}}>
						<Relogio at={TROCA} rotulo={k.rotulo} />
					</div>

					<div style={{...dsp, fontSize: corpoPrazo, position: 'absolute', left: 80, top: 880, width: 920}}>
						<Cut at={TROCA + 14} dur={16}>
							{k.prazo[0]}
						</Cut>
						<Cut at={TROCA + 19} dur={16}>
							<Marca at={TROCA + 28} fundo={c.amarelo} corTexto={c.tinta}>
								{k.prazo[1]}
							</Marca>
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
			<Som efeito="pop" at={TROCA + 28} volume={0.5} />
		</AbsoluteFill>
	);
};
