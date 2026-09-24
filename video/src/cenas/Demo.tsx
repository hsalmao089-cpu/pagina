import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Som} from '../componentes/Som';
import {Linha, tempoDeDigitar, Terminal} from '../componentes/Terminal';
import {Camera, Chip, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, exit, f, dsp, prog, slow, tag} from '../tema';

/* 0:14–0:20 · DEMONSTRAÇÃO
   A prova antes da promessa: duas variáveis de ambiente, `claude`, e o
   agente trabalhando em paralelo sem bater em nada. */

const CPS_ENV = 2;

const Contador: React.FC<{
	rotulo: string;
	de: number;
	ate: number;
	inicio: number;
	fim: number;
	formato: (v: number) => string;
	cor?: string;
}> = ({rotulo, de, ate, inicio, fim, formato, cor = c.bone}) => {
	const frame = useCurrentFrame();
	const v = interpolate(frame, [inicio, fim], [de, ate], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: (t) => 1 - Math.pow(1 - t, 3),
	});
	return (
		<div style={{flex: 1, borderTop: `2px solid ${c.edge2}`, paddingTop: 18}}>
			<div style={{...tag, fontSize: 20}}>{rotulo}</div>
			<div
				style={{
					fontFamily: f.mono,
					fontWeight: 500,
					fontSize: 46,
					marginTop: 10,
					color: cor,
					fontVariantNumeric: 'tabular-nums',
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
	const d = r.demo;
	const corpo = useCorpo(d.titulo, 108, 920, dsp);

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
		{tipo: 'info', at: tInfo, texto: 'conectado · uso ilimitado · fila 0', cor: c.live},
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
	const pStats = prog(frame, tPassos, 14, slow);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.025}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					<Secao n="§02" at={0} style={{position: 'absolute', left: 80, top: 272, width: 920}}>
						{d.secao}
					</Secao>

					<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 360, width: 940}}>
						<Cut at={2} dur={18}>{d.titulo[0]}</Cut>
						<Cut at={tInfo} dur={16} style={{color: c.live}}>
							{d.titulo[1]}
						</Cut>
					</div>

					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 640,
							opacity: prog(frame, 4, 14, slow),
							transform: `translateY(${(1 - prog(frame, 4, 18, slow)) * 60}px)`,
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

					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 1300,
							width: 880,
							display: 'flex',
							gap: 36,
							opacity: pStats,
							transform: `translateY(${(1 - pStats) * 24}px)`,
						}}
					>
						<Contador rotulo="requisições" de={0} ate={3482} inicio={tPassos} fim={dur - 6} formato={milhar} />
						<Contador rotulo="tokens" de={0} ate={18.4} inicio={tPassos} fim={dur - 6} formato={milhoes} />
						<Contador rotulo="limites" de={0} ate={0} inicio={tPassos} fim={dur} formato={milhar} cor={c.live} />
					</div>
				</AbsoluteFill>
			</Camera>

			<Som efeito="whoosh" at={0} volume={0.35} />
			<Som efeito="digitacao" at={t1} dur={tempoDeDigitar(env1, CPS_ENV)} volume={0.6} />
			<Som efeito="enter" at={t2 - 3} volume={0.6} />
			<Som efeito="digitacao" at={t2} dur={tempoDeDigitar(env2, CPS_ENV)} volume={0.6} />
			<Som efeito="enter" at={t3 - 3} volume={0.6} />
			<Som efeito="digitacao" at={t3} dur={tempoDeDigitar('claude', 1)} volume={0.6} />
			<Som efeito="enter" at={tInfo - 4} volume={0.7} />
			<Som efeito="blip" at={tInfo} volume={0.5} />
			<Som efeito="digitacao" at={tPedido} dur={tempoDeDigitar(d.pedido, 2.5)} volume={0.55} />
			<Som efeito="enter" at={tPassos - 3} volume={0.6} />
			{d.saida.map((_, i) => (
				<Som key={i} efeito="check" at={tPassos + 16 + i * 12} volume={0.4} />
			))}
			<Som efeito="sucesso" at={tFim} volume={0.7} />
		</AbsoluteFill>
	);
};
