import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {mola, Pop} from '../componentes/Efeitos';
import {Som} from '../componentes/Som';
import {Linha, tempoDeDigitar, Terminal} from '../componentes/Terminal';
import {Camera, Chip, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, grad, prog, tag, textoDegrade, vidro} from '../tema';

/* 0:14–0:20 · DEMONSTRAÇÃO
   A prova antes da promessa: duas variáveis de ambiente, `claude`, e o
   agente trabalhando em paralelo sem bater em nada. */

const CPS_ENV = 2;

const Contador: React.FC<{
	rotulo: string;
	ate: number;
	inicio: number;
	fim: number;
	formato: (v: number) => string;
	cor?: string;
	brilho?: string;
}> = ({rotulo, ate, inicio, fim, formato, cor = c.branco, brilho}) => {
	const frame = useCurrentFrame();
	const v = interpolate(frame, [inicio, fim], [0, ate], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: (t) => 1 - Math.pow(1 - t, 3),
	});
	return (
		<div style={{...vidro, borderRadius: 24, padding: '20px 22px 22px'}}>
			<div style={{...tag, fontSize: 18, color: c.fumaca}}>{rotulo}</div>
			<div
				style={{
					fontFamily: f.mono,
					fontWeight: 700,
					fontSize: 44,
					marginTop: 8,
					color: cor,
					fontVariantNumeric: 'tabular-nums',
					textShadow: brilho ? `0 0 26px ${brilho}` : undefined,
				}}
			>
				{formato(v)}
			</div>
		</div>
	);
};

const milhar = (v: number) => Math.round(v).toLocaleString('pt-BR');
const milhoes = (v: number) =>
	`${v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})} mi`;

export const Demo: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const d = r.demo;
	const corpo = useCorpo(d.titulo, 112, 920, dsp);

	// roteiro do terminal, em quadros da cena
	const env1 = `export ANTHROPIC_BASE_URL=https://${r.endpoint}`;
	const env2 = `export ANTHROPIC_AUTH_TOKEN=${r.chave}`;
	const t1 = 14;
	const t2 = t1 + tempoDeDigitar(env1, CPS_ENV) + 4;
	const t3 = t2 + tempoDeDigitar(env2, CPS_ENV) + 4;
	const tInfo = t3 + tempoDeDigitar('claude', 1) + 6;
	const tPedido = tInfo + 8;
	const tPassos = tPedido + tempoDeDigitar(d.pedido, 2.5) + 4;
	const tFim = tPassos + 44;

	const linhas: Linha[] = [
		{tipo: 'cmd', at: t1, texto: env1, cps: CPS_ENV},
		{tipo: 'cmd', at: t2, texto: env2, cps: CPS_ENV},
		{tipo: 'cmd', at: t3, texto: 'claude', cps: 1},
		{tipo: 'info', at: tInfo, texto: 'conectado · uso ilimitado · fila 0', cor: c.verde},
		{tipo: 'pedido', at: tPedido, texto: d.pedido, cps: 2.5},
		...d.saida.map<Linha>((s, i) => ({
			tipo: 'passo',
			at: tPassos + i * 8,
			texto: s,
			fim: tPassos + 16 + i * 12,
		})),
		{tipo: 'ok', at: tFim, texto: d.fim},
	];

	const sai = prog(frame, dur - 9, 9, exit);
	// o terminal cai deitado e se levanta com mola; depois balança de leve
	const levanta = mola(frame, 4, fps, 120);
	const inclina = interpolate(levanta, [0, 1], [28, 0]);
	const balanco = Math.sin(frame / 22) * 2.2;

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.025}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					<Secao n="02" at={0} style={{position: 'absolute', left: 80, top: 262}}>
						{d.secao}
					</Secao>

					<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 370, width: 940}}>
						<Cut at={2} dur={18}>
							{d.titulo[0]}
						</Cut>
						<Cut at={tInfo} dur={16}>
							<span style={textoDegrade(grad.sucesso)}>{d.titulo[1]}</span>
						</Cut>
					</div>

					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 650,
							perspective: 1600,
							opacity: Math.min(1, Math.max(0, (frame - 4) / 6)),
						}}
					>
						<div
							style={{
								transformOrigin: 'center top',
								transform: `rotateX(${inclina}deg) rotateY(${balanco}deg) translateY(${(1 - levanta) * 80}px)`,
							}}
						>
							<Terminal
								largura={880}
								fonte={25}
								titulo="~/loja-api — zsh"
								chip={<Chip tom="live">operacional</Chip>}
								linhas={linhas}
							/>
						</div>
					</div>

					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 1290,
							width: 880,
							display: 'grid',
							gridTemplateColumns: '1fr 1fr 1fr',
							gap: 18,
						}}
					>
						<Pop at={tPassos}>
							<Contador rotulo="requisições" ate={3482} inicio={tPassos} fim={dur - 6} formato={milhar} />
						</Pop>
						<Pop at={tPassos + 4}>
							<Contador rotulo="tokens" ate={18.4} inicio={tPassos} fim={dur - 6} formato={milhoes} />
						</Pop>
						<Pop at={tPassos + 8}>
							<Contador
								rotulo="limites"
								ate={0}
								inicio={tPassos}
								fim={dur}
								formato={milhar}
								cor={c.verde}
								brilho="rgba(46,229,157,.7)"
							/>
						</Pop>
					</div>
				</AbsoluteFill>
			</Camera>

			<Som efeito="digitacao" at={t1} dur={tempoDeDigitar(env1, CPS_ENV)} volume={0.6} />
			<Som efeito="enter" at={t2 - 3} volume={0.6} />
			<Som efeito="digitacao" at={t2} dur={tempoDeDigitar(env2, CPS_ENV)} volume={0.6} />
			<Som efeito="enter" at={t3 - 3} volume={0.6} />
			<Som efeito="digitacao" at={t3} dur={tempoDeDigitar('claude', 1)} volume={0.6} />
			<Som efeito="enter" at={tInfo - 4} volume={0.7} />
			<Som efeito="blip" at={tInfo} volume={0.5} />
			<Som efeito="digitacao" at={tPedido} dur={tempoDeDigitar(d.pedido, 2.5)} volume={0.55} />
			<Som efeito="enter" at={tPassos - 3} volume={0.6} />
			{[0, 4, 8].map((k) => (
				<Som key={`p${k}`} efeito="pop" at={tPassos + k} volume={0.35} />
			))}
			{d.saida.map((_, i) => (
				<Som key={i} efeito="check" at={tPassos + 16 + i * 12} volume={0.4} />
			))}
			<Som efeito="sucesso" at={tFim} volume={0.7} />
		</AbsoluteFill>
	);
};
