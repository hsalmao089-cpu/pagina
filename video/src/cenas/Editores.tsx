import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {INICIO_EDITOR, PASSO_EDITOR} from '../componentes/Aurora';
import {Cut} from '../componentes/Cut';
import {Marca} from '../componentes/Efeitos';
import {InfinitoIcone, Pip} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, CENAS, dsp, f} from '../tema';
import {PAINEL_CENTRAL, retanguloDoPainel} from './Agentes';

/* ==========================================================================
   ATO 3 · QUALQUER CLI, QUALQUER IDE
   O painel do meio da grade cresce e vira uma janela de editor. A cada tempo
   da música a janela troca de ferramenta — terminal do Claude Code, VS Code,
   Cursor, JetBrains, Zed, Neovim — e o código continua sendo escrito do
   ponto em que estava. A barra de status não muda: a mesma chave, conectada.
   ========================================================================== */

const JANELA = {x: 80, y: 560, w: 920, h: 760};
const INICIO = INICIO_EDITOR - CENAS.editores.de;

type Estilo = {acento: string; textoAcento: string; fundo: string; layout: 'terminal' | 'ide' | 'vim'};
// cores de identificação de cada ferramenta — só cor e nome, nenhum logotipo
const ESTILOS: Estilo[] = [
	{acento: '#D97757', textoAcento: '#FFFFFF', fundo: '#1B120F', layout: 'terminal'},
	{acento: '#3B9BFF', textoAcento: '#FFFFFF', fundo: '#101A2B', layout: 'ide'},
	{acento: '#E8E8EE', textoAcento: c.tinta, fundo: '#141417', layout: 'ide'},
	{acento: '#FF318C', textoAcento: '#FFFFFF', fundo: '#1E1321', layout: 'ide'},
	{acento: '#4C7DFF', textoAcento: '#FFFFFF', fundo: '#0F1530', layout: 'ide'},
	{acento: '#57C35E', textoAcento: c.tinta, fundo: '#0E1A12', layout: 'vim'},
];

type Trecho = [string, string];
const K = c.rosa;
const T = c.ciano;
const S = c.amarelo;
const W = c.branco;
const P = c.fumaca;
// o código que o agente escreve enquanto a ferramenta troca
const CODIGO: Trecho[][] = [
	[['export async function ', K], ['criarPedido', W], ['(', P]],
	[['  dados', W], [': ', P], ['Pedido', T], [',', P]],
	[[') {', P]],
	[['  const ', K], ['cliente', W], [' = ', P], ['await ', K], ['buscar', W], ['(dados.id)', P]],
	[['  const ', K], ['total', W], [' = ', P], ['somar', W], ['(dados.itens)', P]],
	[['  await ', K], ['fila.publicar', W], ['(', P], ["'pedido'", S], [', total)', P]],
	[['  return ', K], ['{ ...dados, total }', W]],
	[['}', P]],
];
const TOTAL_CHARS = CODIGO.reduce((a, l) => a + l.reduce((b, [t]) => b + t.length, 0), 0);

const Codigo: React.FC<{digitados: number; cursor: string; fonte: number; numeros: boolean}> = ({
	digitados,
	cursor,
	fonte,
	numeros,
}) => {
	let resto = digitados;
	let cursorPosto = false;
	return (
		<div style={{fontFamily: f.mono, fontSize: fonte, lineHeight: `${fonte * 1.75}px`}}>
			{CODIGO.map((linha, li) => {
				const tamanho = linha.reduce((b, [t]) => b + t.length, 0);
				const vis = Math.max(0, Math.min(tamanho, resto));
				const inteira = vis === tamanho;
				let r = vis;
				const partes = linha.map(([t, cor], k) => {
					const pedaco = t.slice(0, Math.max(0, r));
					r -= t.length;
					return (
						<span key={k} style={{color: cor}}>
							{pedaco}
						</span>
					);
				});
				// o que ainda não foi aceito aparece como sugestão fantasma
				const fantasma = !inteira && !cursorPosto ? linha.map(([t]) => t).join('').slice(vis) : '';
				const mostraCursor = !inteira && !cursorPosto;
				if (mostraCursor) cursorPosto = true;
				resto -= tamanho;
				const visivel = vis > 0 || mostraCursor;
				return (
					<div key={li} style={{display: 'flex', whiteSpace: 'pre', opacity: visivel ? 1 : 0}}>
						{numeros ? (
							<span style={{width: fonte * 2.2, flex: 'none', color: 'rgba(255,255,255,.28)'}}>{li + 1}</span>
						) : null}
						<span>
							{partes}
							{mostraCursor ? (
								<span
									style={{
										display: 'inline-block',
										width: 3,
										height: fonte * 1.2,
										verticalAlign: 'middle',
										background: cursor,
										boxShadow: `0 0 10px ${cursor}`,
									}}
								/>
							) : null}
							<span style={{color: 'rgba(255,255,255,.26)', fontStyle: 'italic'}}>{fantasma}</span>
						</span>
					</div>
				);
			})}
		</div>
	);
};

export const Editores: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const e = r.editores;
	const corpo = useCorpo(e.titulo, 124, 920, dsp);
	const qtd = Math.max(1, Math.min(ESTILOS.length, e.nomes.length));

	const idx = Math.max(0, Math.min(qtd - 1, Math.floor((frame - INICIO) / PASSO_EDITOR)));
	const est = ESTILOS[idx];
	const nome = e.nomes[idx] ?? '';
	const desdeTroca = frame - INICIO - idx * PASSO_EDITOR;
	const troca = frame >= INICIO ? interpolate(desdeTroca, [0, 2, 6], [1, 0.6, 0], {extrapolateRight: 'clamp'}) : 0;

	// entrada: cresce do painel do meio da grade
	const origem = retanguloDoPainel(PAINEL_CENTRAL);
	const cresce = spring({frame, fps, config: {damping: 16, stiffness: 130, mass: 0.8}});
	const x = interpolate(cresce, [0, 1], [origem.x, JANELA.x]);
	const y = interpolate(cresce, [0, 1], [origem.y, JANELA.y]);
	const w = interpolate(cresce, [0, 1], [origem.w, JANELA.w]);
	const h = interpolate(cresce, [0, 1], [origem.h, JANELA.h]);

	// saída: encolhe para dentro do primeiro cartão da cena seguinte
	const sai = interpolate(frame, [dur - 12, dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});

	const digitados = Math.max(0, Math.min(TOTAL_CHARS, Math.floor((frame - 12) * 2.3)));
	const ide = est.layout === 'ide';

	return (
		<AbsoluteFill>
			<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 262, width: 940, opacity: 1 - sai}}>
				<Cut at={6} dur={18}>
					{e.titulo[0]}
				</Cut>
				<Cut at={11} dur={18}>
					<Marca at={18} fundo={est.acento} corTexto={est.textoAcento}>
						{e.titulo[1]}
					</Marca>
				</Cut>
			</div>

			<div
				style={{
					position: 'absolute',
					left: x,
					top: y,
					width: w,
					height: h,
					borderRadius: 26,
					overflow: 'hidden',
					background: est.fundo,
					border: `2px solid ${est.acento}88`,
					boxShadow: `0 60px 120px -40px rgba(0,0,0,.7), 0 0 80px ${est.acento}55`,
					transform: `scaleX(${1 - troca * 0.05}) scale(${1 - sai * 0.35}) translateY(${sai * 60}px)`,
					opacity: 1 - sai,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* barra de título */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						height: 66,
						padding: '0 22px',
						flex: 'none',
						background: 'rgba(255,255,255,.04)',
						borderBottom: '2px solid rgba(255,255,255,.08)',
					}}
				>
					{[c.rosa, c.amarelo, c.verde].map((cor) => (
						<span key={cor} style={{width: 15, height: 15, borderRadius: '50%', background: cor}} />
					))}
					<span
						style={{
							marginLeft: 16,
							padding: '6px 16px',
							borderRadius: 999,
							background: est.acento,
							color: est.textoAcento,
							fontFamily: f.display,
							fontWeight: 800,
							fontSize: 26,
							letterSpacing: '-0.01em',
							transform: `scale(${1 + troca * 0.12})`,
							whiteSpace: 'nowrap',
						}}
					>
						{nome}
					</span>
					<span style={{marginLeft: 'auto', fontFamily: f.mono, fontSize: 19, color: c.fumaca}}>~/loja-api</span>
				</div>

				<div style={{flex: 1, display: 'flex', minHeight: 0}}>
					{ide ? (
						<>
							<div
								style={{
									width: 62,
									flex: 'none',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 18,
									paddingTop: 22,
									background: 'rgba(0,0,0,.18)',
								}}
							>
								{[0, 1, 2, 3].map((k) => (
									<span
										key={k}
										style={{
											width: 28,
											height: 28,
											borderRadius: 8,
											background: k === 0 ? est.acento : 'rgba(255,255,255,.18)',
										}}
									/>
								))}
							</div>
							<div
								style={{
									width: 214,
									flex: 'none',
									padding: '18px 16px',
									fontFamily: f.mono,
									fontSize: 19,
									lineHeight: '36px',
									color: c.nevoa,
									borderRight: '2px solid rgba(255,255,255,.07)',
								}}
							>
								<div style={{color: c.fumaca, fontSize: 15, letterSpacing: '0.14em'}}>LOJA-API</div>
								<div>› src</div>
								<div style={{paddingLeft: 18}}>api.ts</div>
								<div
									style={{
										paddingLeft: 18,
										margin: '0 -16px',
										paddingRight: 16,
										background: `${est.acento}33`,
										color: c.branco,
										borderLeft: `4px solid ${est.acento}`,
									}}
								>
									pedidos.ts
								</div>
								<div style={{paddingLeft: 18}}>carrinho.ts</div>
								<div>› testes</div>
							</div>
						</>
					) : null}
					<div style={{flex: 1, minWidth: 0, padding: '22px 24px'}}>
						{est.layout === 'terminal' ? (
							<div style={{fontFamily: f.mono, fontSize: 22, lineHeight: '38px', marginBottom: 14}}>
								<div style={{color: est.acento, fontWeight: 700}}>› crie o endpoint de pedidos</div>
								<div style={{color: c.verde, display: 'flex', alignItems: 'center', gap: 12}}>
									<Pip color={c.verde} size={12} />
									editando pedidos.ts
								</div>
							</div>
						) : null}
						<Codigo digitados={digitados} cursor={est.acento} fonte={ide ? 21 : 22} numeros={est.layout !== 'terminal'} />
					</div>
				</div>

				{/* a barra de status é a mesma em todas: a chave continua conectada */}
				<div
					style={{
						flex: 'none',
						height: 48,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						padding: '0 20px',
						background: est.layout === 'vim' ? '#1E2A22' : est.acento,
						color: est.layout === 'vim' ? c.verde : est.textoAcento,
						fontFamily: f.mono,
						fontWeight: 700,
						fontSize: 19,
						letterSpacing: '0.04em',
					}}
				>
					{est.layout === 'vim' ? <span style={{color: c.tinta, background: c.verde, padding: '2px 10px'}}>INSERT</span> : null}
					<Pip color={est.layout === 'vim' ? c.verde : est.textoAcento} size={10} />
					<span>{r.marca} conectado</span>
					<span style={{opacity: 0.7}}>·</span>
					<span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
						uso <InfinitoIcone size={26} color={est.layout === 'vim' ? c.verde : est.textoAcento} stroke={2.8} />
					</span>
					<span style={{opacity: 0.7}}>·</span>
					<span>fila 0</span>
				</div>

				{/* lampejo na troca de ferramenta */}
				<div style={{position: 'absolute', inset: 0, background: '#fff', opacity: troca * 0.18, pointerEvents: 'none'}} />
			</div>

			{Array.from({length: qtd}, (_, k) => (
				<Som key={k} efeito="pop" at={INICIO + k * PASSO_EDITOR} volume={0.45} />
			))}
			<Som efeito="whoosh" at={dur - 14} volume={0.35} />
		</AbsoluteFill>
	);
};
