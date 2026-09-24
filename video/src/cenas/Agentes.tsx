import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Marca, mola} from '../componentes/Efeitos';
import {InfinitoIcone, Pip} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, f, prog, vidroEscuro} from '../tema';

/* ==========================================================================
   ATO 3 · A PROVA: AGENTES EM PARALELO
   Uma grade de terminais, cada um com um agente numa tarefa, todos rodando
   ao mesmo tempo. Cada painel tem o próprio medidor de uso — e ele mostra ∞.
   É a barra do começo, agora sem fim.
   ========================================================================== */

export const GRADE = {x: 80, y: 632, w: 270, h: 250, gap: 18};
export const retanguloDoPainel = (i: number) => ({
	x: GRADE.x + (i % 3) * (GRADE.w + GRADE.gap),
	y: GRADE.y + Math.floor(i / 3) * (GRADE.h + GRADE.gap),
	w: GRADE.w,
	h: GRADE.h,
});
/** O painel do meio vira a janela do editor na cena seguinte. */
export const PAINEL_CENTRAL = 4;

const ARQUIVOS = ['auth.ts', 'pedidos.ts', 'db/schema.ts', 'README.md', 'carrinho.ts', 'Home.tsx', 'pr-218', 'deploy.yml', 'pt-BR.json'];

const gerador = (semente: number) => {
	let a = semente >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

type LinhaPainel = {texto: string; cor: string};

const linhaDoAgente = (tarefa: string, i: number, j: number): LinhaPainel => {
	const rnd = gerador(i * 1000 + j);
	const n = 12 + Math.floor(rnd() * 180);
	const m = 20 + Math.floor(rnd() * 240);
	const arq = ARQUIVOS[(i + Math.floor(j / 6)) % ARQUIVOS.length];
	const hash = Math.floor(rnd() * 0xfffff).toString(16).padStart(5, '0');
	switch (j % 6) {
		case 0:
			return {texto: `› ${tarefa}`, cor: c.rosa};
		case 1:
			return {texto: `lendo ${n} arquivos`, cor: c.nevoa};
		case 2:
			return {texto: `editando ${arq}`, cor: c.nevoa};
		case 3:
			return {texto: `rodando ${m} testes`, cor: c.nevoa};
		case 4:
			return {texto: `ok ${m} passando`, cor: c.verde};
		default:
			return {texto: `commit ${hash}`, cor: c.amarelo};
	}
};

const Painel: React.FC<{i: number; tarefa: string; entra: number; ritmo: number}> = ({i, tarefa, entra, ritmo}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = frame < entra ? 0 : mola(frame, entra, fps, 210);
	const inicio = entra + 4;
	const total = Math.max(0, Math.floor((frame - inicio) / ritmo) + 1);
	const vistas = Array.from({length: Math.min(5, total)}, (_, k) => total - Math.min(5, total) + k);
	const fluxo = (frame * 6 + i * 40) % 400;
	return (
		<div
			style={{
				...vidroEscuro,
				borderRadius: 22,
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				opacity: Math.min(1, s * 1.5),
				transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					height: 46,
					padding: '0 14px',
					borderBottom: '2px solid rgba(255,255,255,.1)',
				}}
			>
				<Pip color={c.verde} size={10} glow={0.8 + 0.2 * Math.sin(frame / 3 + i)} />
				<span style={{fontFamily: f.mono, fontWeight: 700, fontSize: 17, color: c.branco}}>
					agente {String(i + 1).padStart(2, '0')}
				</span>
				<span
					style={{
						marginLeft: 'auto',
						fontFamily: f.display,
						fontWeight: 700,
						fontSize: 19,
						color: c.ciano,
						whiteSpace: 'nowrap',
					}}
				>
					{tarefa}
				</span>
			</div>
			<div style={{flex: 1, padding: '10px 14px 0', fontFamily: f.mono, fontSize: 16, lineHeight: '25px'}}>
				{vistas.map((j) => {
					const l = linhaDoAgente(tarefa, i, j);
					const nova = j === total - 1 ? prog(frame, inicio + j * ritmo, 4) : 1;
					return (
						<div
							key={j}
							style={{
								color: l.cor,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								opacity: nova,
								transform: `translateY(${(1 - nova) * 8}px)`,
							}}
						>
							{l.texto}
						</div>
					);
				})}
			</div>
			{/* medidor do painel: a barra do começo, agora sem fim */}
			<div style={{display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 14px'}}>
				<span style={{fontFamily: f.mono, fontSize: 14, color: c.fumaca, letterSpacing: '0.12em'}}>USO</span>
				<div
					style={{
						flex: 1,
						height: 10,
						borderRadius: 999,
						background: `linear-gradient(90deg, transparent, ${c.verde} 30%, ${c.ciano} 60%, transparent) ${fluxo}px 0 / 400px 100% repeat-x`,
						boxShadow: '0 0 12px rgba(46,229,157,.4)',
						opacity: 0.9,
					}}
				/>
				<InfinitoIcone size={34} color={c.verde} stroke={2.8} style={{filter: 'drop-shadow(0 0 8px rgba(46,229,157,.8))'}} />
			</div>
		</div>
	);
};

export const Agentes: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const a = r.agentes;
	const corpo = useCorpo(a.titulo, 124, 920, dsp);
	const qtd = Math.min(9, a.tarefas.length);

	// entrada: vem de dentro do ∞ (a cena anterior mergulha nele)
	const chega = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	// saída: os painéis se afastam; o do meio fica e vira o editor
	const sai = interpolate(frame, [dur - 14, dur - 4], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});
	const pilula = frame < 22 ? 0 : mola(frame, 22, fps, 180);
	const ordem = [4, 1, 3, 5, 7, 0, 2, 6, 8];

	return (
		<AbsoluteFill style={{opacity: chega, transform: `scale(${1.35 - 0.35 * chega})`, transformOrigin: '540px 1000px'}}>
			<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 262, width: 940, opacity: 1 - sai}}>
				<Cut at={4} dur={18}>
					{a.titulo[0]}
				</Cut>
				<Cut at={9} dur={18}>
					<Marca at={16} fundo={c.ciano} corTexto={c.tinta}>
						{a.titulo[1]}
					</Marca>
				</Cut>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 540,
					opacity: Math.min(1, pilula * 1.5) * (1 - sai),
					transformOrigin: 'left center',
					transform: `scale(${0.7 + 0.3 * pilula})`,
					display: 'inline-flex',
					alignItems: 'center',
					gap: 14,
					padding: '10px 22px',
					borderRadius: 999,
					background: 'rgba(10,20,60,.55)',
					border: '2px solid rgba(46,229,157,.45)',
					fontFamily: f.mono,
					fontWeight: 700,
					fontSize: 24,
					color: c.branco,
				}}
			>
				<Pip color={c.verde} size={12} />
				{qtd} agentes rodando · <span style={{color: c.verde}}>0 limites</span>
			</div>

			{Array.from({length: qtd}, (_, i) => {
				const ret = retanguloDoPainel(i);
				const central = i === PAINEL_CENTRAL;
				const dx = ret.x + ret.w / 2 - 540;
				const dy = ret.y + ret.h / 2 - 1025;
				// o painel central some no instante em que o editor assume o lugar dele
				if (central && frame >= dur - 6) return null;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: ret.x,
							top: ret.y,
							width: ret.w,
							height: ret.h,
							opacity: central ? 1 : 1 - sai,
							transform: central ? undefined : `translate(${dx * sai * 1.2}px, ${dy * sai * 1.2}px) scale(${1 - sai * 0.3})`,
						}}
					>
						<Painel i={i} tarefa={a.tarefas[i]} entra={8 + ordem.indexOf(i) * 3} ritmo={7 + (i % 4)} />
					</div>
				);
			})}

			{ordem.slice(0, qtd).map((i, k) => (
				<Som key={i} efeito="pop" at={8 + k * 3} volume={0.3} />
			))}
			<Som efeito="blip" at={22} volume={0.45} />
		</AbsoluteFill>
	);
};
