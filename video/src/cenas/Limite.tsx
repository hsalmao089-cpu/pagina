import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Clarao} from '../componentes/Camadas';
import {Cut} from '../componentes/Cut';
import {Carimbo, Marca} from '../componentes/Efeitos';
import {Fita} from '../componentes/Fita';
import {Glitch} from '../componentes/Glitch';
import {Som} from '../componentes/Som';
import {Linha, tempoDeDigitar, Terminal} from '../componentes/Terminal';
import {Chip} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, MARCAS, prog, TEMPO} from '../tema';

/* ==========================================================================
   ATO 1 · O LIMITE (0:00–0:12, um plano só)

   A barra de uso é o vilão do vídeo inteiro. Ela enche até 100% com o
   agente trabalhando; o carimbo bate; três fitas de interdição amarram o
   terminal — uma por dor —; duas linhas coladas no terminal e um Enter
   rasgam tudo no drop. A barra, liberada, vira o ∞ na cena seguinte.
   ========================================================================== */

export const BARRA = {x: 80, y: 690, w: 920, h: 64};
/** Onde cada fita cruza a tela e onde ela rasga no drop. */
export const FITAS = [
	{y: 720, angulo: -10, de: 1 as const, corte: -140},
	{y: 915, angulo: 7, de: -1 as const, corte: 170},
	{y: 1095, angulo: -4, de: 1 as const, corte: -40},
];

const ERRO = MARCAS.erro;
const DROP = MARCAS.drop;
const CPS = 2.5;

/** Cor da barra conforme enche: laranja → vermelho. */
const corDoUso = (v: number) => (v < 97 ? '#FF9F1C' : v < 99 ? '#FF6B00' : c.vermelho);

const Medidor: React.FC<{r: Roteiro}> = ({r}) => {
	const frame = useCurrentFrame();
	const ini = r.gancho.inicio;
	const passo = ERRO / (100 - ini);
	const valor = Math.min(100, ini + Math.floor(frame / passo));
	const desdeTroca = frame - (valor - ini) * passo;
	// o primeiro valor já nasce assentado: é o quadro que o feed mostra
	const rola =
		valor === ini ? 0 : interpolate(desdeTroca, [0, 4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const cheio = frame >= ERRO;
	const enche = interpolate(frame, [0, ERRO], [ini, 100], {extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
	// pulso de ansiedade a cada ponto
	const pulso = cheio ? 0 : rola;
	// o número grande sai quando as fitas chegam; fica o "100%" dentro da barra
	const encolhe = prog(frame, MARCAS.amarras - 12, 16, exit);
	const pisca = cheio && frame < ERRO + 14 ? (Math.floor((frame - ERRO) / 2) % 2 === 0 ? 1 : 0.55) : 1;
	const cor = corDoUso(valor);

	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 356,
					fontFamily: f.mono,
					fontWeight: 600,
					fontSize: 26,
					letterSpacing: '0.2em',
					textTransform: 'uppercase',
					color: c.nevoa,
					opacity: 1 - encolhe,
				}}
			>
				{r.gancho.rotulo}
			</div>
			<div
				style={{
					...dsp,
					position: 'absolute',
					left: 70,
					top: 396,
					fontSize: 236,
					letterSpacing: '-0.05em',
					color: cor,
					textShadow: `0 0 ${40 + pulso * 40}px ${cor}88, 0 12px 40px rgba(40,0,10,.45)`,
					fontVariantNumeric: 'tabular-nums',
					transformOrigin: 'left center',
					transform: `scale(${(1 + pulso * 0.04) * (1 - encolhe * 0.6)}) translateY(${encolhe * 180}px)`,
					opacity: 1 - encolhe,
				}}
			>
				<span style={{display: 'inline-block', transform: `translateY(${rola * 18}%)`, opacity: 1 - rola * 0.5}}>
					{valor}
				</span>
				<span style={{fontSize: '0.55em', marginLeft: '0.04em'}}>%</span>
			</div>

			{/* a barra */}
			<div
				style={{
					position: 'absolute',
					left: BARRA.x,
					top: BARRA.y,
					width: BARRA.w,
					height: BARRA.h,
					borderRadius: 999,
					background: 'rgba(255,255,255,.14)',
					border: '2px solid rgba(255,255,255,.22)',
					boxShadow: 'inset 0 4px 12px rgba(0,0,0,.3)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: `${enche}%`,
						height: '100%',
						borderRadius: 999,
						background: `linear-gradient(90deg, #FFC83D, #FF7A1A 45%, ${cor})`,
						boxShadow: `0 0 40px ${cor}`,
						opacity: pisca,
						display: 'flex',
						alignItems: 'center',
						paddingLeft: 26,
					}}
				>
					<span
						style={{
							fontFamily: f.mono,
							fontWeight: 700,
							fontSize: 30,
							color: c.branco,
							opacity: encolhe,
							textShadow: '0 2px 10px rgba(80,0,20,.6)',
						}}
					>
						100% · {r.gancho.rotulo}
					</span>
				</div>
			</div>
		</>
	);
};

export const Limite: React.FC<{r: Roteiro; dur: number}> = ({r}) => {
	const frame = useCurrentFrame();
	const g = r.gancho;
	const corpoAmarras = useCorpo(r.amarras.titulo, 124, 920, dsp);
	const corpoChave = useCorpo(r.soltura.titulo, 124, 920, dsp);

	// relógio de volta do limite: um segundo a menos por tempo da música
	const passados = frame < ERRO ? 0 : Math.floor((frame - ERRO) / TEMPO);
	const total = 4 * 3600 + 59 * 60 + 59 - passados;
	const relogio = `${Math.floor(total / 3600)}h ${String(Math.floor((total % 3600) / 60)).padStart(2, '0')}min ${String(total % 60).padStart(2, '0')}s`;

	// terminal: o trabalho, a falha, e depois as duas linhas que soltam tudo
	const env1 = `export ANTHROPIC_BASE_URL=https://${r.endpoint}`;
	const env2 = `export ANTHROPIC_AUTH_TOKEN=${r.chave}`;
	const t1 = MARCAS.chave + 6;
	const t2 = t1 + tempoDeDigitar(env1, CPS) + 4;
	const linhas: Linha[] = [
		{tipo: 'pedido', at: -40, texto: g.pedido},
		{tipo: 'passo', at: -22, texto: g.passos[1] ?? '', fim: 8},
		{tipo: 'passo', at: 12, texto: g.passos[2] ?? '', falha: ERRO},
		{tipo: 'erro', at: ERRO, texto: g.erro, sub: `${g.volta} ${relogio}`},
		{tipo: 'cmd', at: t1, texto: env1, cps: CPS},
		{tipo: 'cmd', at: t2, texto: env2, cps: CPS},
	];

	// glitch em rajadas no erro
	const forca = interpolate(frame - ERRO, [0, 1, 3, 4, 6, 7, 10, 12], [0, 1, 0.75, 0.2, 0.85, 0.35, 0.15, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const claraoErro = interpolate(frame - ERRO, [0, 1, 8], [0, 0.35, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// tremor: no erro, no carimbo e em cada fita
	const impactos = [ERRO, ERRO + 3, ...MARCAS.fitas];
	const tremor = impactos.reduce((a, q) => a + (frame >= q && frame < q + 7 ? (q + 7 - frame) / 7 : 0), 0);
	const tx = Math.sin(frame * 9.7) * 11 * tremor;
	const ty = Math.cos(frame * 8.1) * 7 * tremor;

	// câmera: aproxima no gancho, respira nas amarras, entra no terminal na chave
	const zoom =
		interpolate(frame, [0, ERRO, MARCAS.amarras, MARCAS.chave, DROP - 3], [1, 1.035, 1.0, 1.0, 1.07], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.quad),
		}) + interpolate(frame - ERRO, [0, 3, 14], [0, 0.03, 0.015], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// no drop, tudo que não é fita é soprado para fora
	const sopro = interpolate(frame, [DROP, DROP + 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const carimboSai = prog(frame, MARCAS.amarras - 14, 12, exit);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					transformOrigin: '540px 1200px',
					transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
				}}
			>
				<Glitch forca={forca} id="limite" style={{position: 'absolute', inset: 0}}>
					<AbsoluteFill
						style={{
							opacity: 1 - sopro,
							transform: `translateY(${sopro * 240}px) scale(${1 - sopro * 0.15})`,
							filter: sopro > 0.01 ? `blur(${sopro * 16}px)` : undefined,
						}}
					>
						<Medidor r={r} />
						<div style={{position: 'absolute', left: 80, top: 800}}>
							<Terminal
								largura={920}
								fonte={26}
								titulo={`${g.pasta} — claude`}
								chip={
									frame < ERRO ? (
										<Chip tom="live">executando</Chip>
									) : frame < MARCAS.enter ? (
										<Chip tom="halt">bloqueado</Chip>
									) : (
										<Chip tom="live">liberado</Chip>
									)
								}
								linhas={linhas}
								style={{
									borderColor: frame >= ERRO && frame < MARCAS.enter ? 'rgba(255,45,85,.7)' : undefined,
									boxShadow:
										frame >= ERRO && frame < MARCAS.enter
											? '0 60px 120px -40px rgba(60,0,20,.8), 0 0 70px rgba(255,45,85,.4)'
											: undefined,
								}}
							/>
						</div>
					</AbsoluteFill>
				</Glitch>

				{FITAS.map((ft, i) => (
					<Fita
						key={i}
						texto={r.amarras.fitas[i] ?? ''}
						y={ft.y}
						angulo={ft.angulo}
						de={ft.de}
						entra={MARCAS.fitas[i]}
						rasga={DROP}
						corte={ft.corte}
					/>
				))}

				<div
					style={{
						position: 'absolute',
						left: 560,
						top: 740,
						width: 0,
						height: 0,
						opacity: 1 - carimboSai,
						transform: `scale(${1 - carimboSai * 0.4})`,
					}}
				>
					<Carimbo
						at={ERRO}
						linhas={[g.carimbo]}
						style={{left: 0, top: -95, fontSize: 150, whiteSpace: 'nowrap', translate: '-50% 0'}}
					/>
				</div>
			</AbsoluteFill>

			{/* manchetes das amarras e da chave, por cima de tudo */}
			<div style={{...dsp, fontSize: corpoAmarras, position: 'absolute', left: 80, top: 380, width: 920}}>
				<Cut at={MARCAS.tituloAmarras} dur={16} out={MARCAS.chave - 8} outDur={8}>
					{r.amarras.titulo[0]}
				</Cut>
				<Cut at={MARCAS.tituloAmarras + 5} dur={16} out={MARCAS.chave - 7} outDur={8}>
					<Marca at={MARCAS.tituloAmarras + 14} fundo={c.fita} corTexto={c.fitaTexto}>
						{r.amarras.titulo[1]}
					</Marca>
				</Cut>
			</div>
			<div
				style={{
					...dsp,
					fontSize: corpoChave,
					position: 'absolute',
					left: 80,
					top: 380,
					width: 920,
					opacity: 1 - sopro,
					transform: `scale(${1 + sopro * 0.3})`,
					transformOrigin: 'left top',
				}}
			>
				<Cut at={MARCAS.chave} dur={16}>
					{r.soltura.titulo[0]}
				</Cut>
				<Cut at={MARCAS.chave + 5} dur={16}>
					<Marca at={MARCAS.chave + 14} fundo={c.verde} corTexto={c.tinta}>
						{r.soltura.titulo[1]}
					</Marca>
				</Cut>
			</div>

			<Clarao intensidade={claraoErro} cor={c.vermelho} />

			{/* sons */}
			{Array.from({length: 100 - g.inicio}, (_, i) => (
				<Som key={`t${i}`} efeito="tique" at={Math.round((i + 1) * (ERRO / (100 - g.inicio)))} volume={0.45} />
			))}
			<Som efeito="check" at={8} volume={0.35} />
			<Som efeito="erro" at={ERRO} volume={0.55} />
			<Som efeito="carimbo" at={ERRO} volume={0.7} />
			{MARCAS.fitas.map((q) => (
				<Som key={`f${q}`} efeito="fita" at={q} volume={0.8} />
			))}
			<Som efeito="whoosh" at={MARCAS.tituloAmarras - 4} volume={0.35} />
			<Som efeito="digitacao" at={t1} dur={tempoDeDigitar(env1, CPS)} volume={0.65} />
			<Som efeito="enter" at={t2 - 3} volume={0.6} />
			<Som efeito="digitacao" at={t2} dur={tempoDeDigitar(env2, CPS)} volume={0.65} />
			<Som efeito="enter" at={MARCAS.enter} volume={1} />
			<Som efeito="rasgo" at={DROP} volume={0.6} />
		</AbsoluteFill>
	);
};
