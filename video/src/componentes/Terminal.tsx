import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {c, f, prog, slow, vidroEscuro} from '../tema';
import {Check, Cross, Pip, Spinner} from './Icones';

type Trecho = {t: string; cor: string};

export type Linha =
	/** `$ comando`, digitado. */
	| {tipo: 'cmd'; at: number; texto: string; cps?: number}
	/** `› pedido` ao agente, digitado. */
	| {tipo: 'pedido'; at: number; texto: string; cps?: number}
	/** Passo do agente: gira até `fim` (✓) ou até `falha` (✗). */
	| {tipo: 'passo'; at: number; texto: string; fim?: number; falha?: number}
	| {tipo: 'info'; at: number; texto: string; cor?: string}
	| {tipo: 'ok'; at: number; texto: string}
	| {tipo: 'erro'; at: number; texto: string; sub?: string};

type Props = {
	titulo: string;
	linhas: Linha[];
	chip?: React.ReactNode;
	largura?: number;
	fonte?: number;
	alturaMin?: number;
	style?: React.CSSProperties;
};

/** Destaque de sintaxe: palavra-chave em rosa, nome em ciano, valor em amarelo. */
const realce = (texto: string): Trecho[] => {
	const env = /^(export )(\w+)(=)(.*)$/.exec(texto);
	if (env) {
		return [
			{t: env[1], cor: c.rosa},
			{t: env[2], cor: c.ciano},
			{t: env[3], cor: c.fumaca},
			{t: env[4], cor: c.amarelo},
		];
	}
	return [{t: texto, cor: c.branco}];
};

const digitados = (frame: number, at: number, total: number, cps: number) =>
	Math.max(0, Math.min(total, Math.floor((frame - at) * cps)));

/** Quantos quadros um texto leva para ser digitado — usado pelas cenas para
 *  casar o som de teclado com o que aparece na tela. */
export const tempoDeDigitar = (texto: string, cps = 2) => Math.ceil(texto.length / cps);

export const Terminal: React.FC<Props> = ({
	titulo,
	linhas,
	chip,
	largura = 940,
	fonte = 27,
	alturaMin,
	style,
}) => {
	const frame = useCurrentFrame();
	const visiveis = linhas.filter((l) => frame >= l.at);
	const ultima = visiveis[visiveis.length - 1];
	const lh = fonte * 1.8;

	return (
		<div
			style={{
				...vidroEscuro,
				position: 'relative',
				width: largura,
				minHeight: alturaMin,
				overflow: 'hidden',
				...style,
			}}
		>
			{/* barra de janela */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					height: 76,
					padding: '0 28px',
					borderBottom: '2px solid rgba(255,255,255,.12)',
				}}
			>
				{[c.rosa, c.amarelo, c.verde].map((cor) => (
					<span key={cor} style={{width: 16, height: 16, borderRadius: '50%', background: cor}} />
				))}
				<span
					style={{
						flex: 1,
						textAlign: 'center',
						fontFamily: f.mono,
						fontSize: 21,
						color: c.fumaca,
						letterSpacing: '0.02em',
						marginRight: chip ? 0 : 66,
					}}
				>
					{titulo}
				</span>
				{chip}
			</div>

			<div
				style={{
					padding: '30px 36px 36px',
					fontFamily: f.mono,
					fontSize: fonte,
					lineHeight: `${lh}px`,
					color: c.nevoa,
				}}
			>
				{visiveis.map((l, i) => {
					const ativa = l === ultima;
					const entra = prog(frame, l.at, 6, slow);
					const base: React.CSSProperties = {
						display: 'flex',
						alignItems: 'flex-start',
						gap: fonte * 0.55,
						minHeight: lh,
					};

					if (l.tipo === 'cmd' || l.tipo === 'pedido') {
						const cps = l.cps ?? 2;
						const n = digitados(frame, l.at, l.texto.length, cps);
						const digitando = n < l.texto.length;
						const trechos = l.tipo === 'cmd' ? realce(l.texto) : [{t: l.texto, cor: c.branco}];
						let resto = n;
						const pisca = digitando || Math.floor((frame - l.at) / 8) % 2 === 0;
						return (
							<div key={i} style={{...base, marginTop: l.tipo === 'pedido' && i > 0 ? fonte * 0.5 : 0}}>
								<span style={{color: l.tipo === 'cmd' ? c.rosa : c.roxo, flex: 'none', width: fonte * 0.9, fontWeight: 700}}>
									{l.tipo === 'cmd' ? '$' : '›'}
								</span>
								<span style={{flex: 1, wordBreak: 'break-all'}}>
									{trechos.map((tr, k) => {
										const vis = tr.t.slice(0, Math.max(0, resto));
										resto -= tr.t.length;
										return (
											<span key={k} style={{color: tr.cor}}>
												{vis}
											</span>
										);
									})}
									{ativa ? (
										<span
											style={{
												display: 'inline-block',
												width: fonte * 0.6,
												height: fonte * 1.15,
												marginLeft: 2,
												verticalAlign: 'middle',
												transform: 'translateY(-2px)',
												background: c.rosa,
												opacity: pisca ? 0.9 : 0,
											}}
										/>
									) : null}
								</span>
							</div>
						);
					}

					if (l.tipo === 'passo') {
						const feito = l.fim !== undefined && frame >= l.fim;
						const falhou = l.falha !== undefined && frame >= l.falha;
						const traco = l.fim === undefined ? 0 : prog(frame, l.fim, 8, slow);
						return (
							<div
								key={i}
								style={{
									...base,
									alignItems: 'center',
									opacity: entra,
									transform: `translateY(${(1 - entra) * 10}px)`,
								}}
							>
								<span style={{flex: 'none', width: fonte * 0.9, display: 'flex', justifyContent: 'center'}}>
									<Pip color={falhou ? c.vermelho : feito ? c.verde : c.ciano} size={12} glow={1} />
								</span>
								<span style={{flex: 1, color: falhou ? c.vermelho : feito ? c.branco : c.nevoa}}>{l.texto}</span>
								<span style={{flex: 'none', width: 34, display: 'flex', justifyContent: 'center'}}>
									{falhou ? (
										<Cross size={28} color={c.vermelho} />
									) : feito ? (
										<Check size={30} color={c.verde} draw={traco} />
									) : (
										<Spinner size={26} color={c.ciano} frame={frame} />
									)}
								</span>
							</div>
						);
					}

					if (l.tipo === 'erro') {
						const pulso = interpolate(frame - l.at, [0, 4, 14], [1, 0.55, 0.22], {
							extrapolateRight: 'clamp',
						});
						return (
							<div
								key={i}
								style={{
									marginTop: fonte * 0.7,
									padding: `${fonte * 0.6}px ${fonte * 0.8}px`,
									borderLeft: `6px solid ${c.vermelho}`,
									borderRadius: 12,
									background: `rgba(255,45,85,${0.14 + pulso * 0.2})`,
									boxShadow: `0 0 ${30 + pulso * 50}px rgba(255,45,85,.35)`,
									opacity: entra,
								}}
							>
								<div style={{display: 'flex', alignItems: 'center', gap: fonte * 0.55, color: '#FF6B86', fontWeight: 700}}>
									<Cross size={30} color="#FF6B86" stroke={3.2} />
									<span>{l.texto}</span>
								</div>
								{l.sub ? (
									<div style={{color: c.nevoa, paddingLeft: 30 + fonte * 0.55}}>{l.sub}</div>
								) : null}
							</div>
						);
					}

					if (l.tipo === 'ok') {
						return (
							<div
								key={i}
								style={{
									...base,
									alignItems: 'center',
									marginTop: fonte * 0.5,
									color: c.verde,
									fontWeight: 700,
									textShadow: '0 0 24px rgba(46,229,157,.45)',
									opacity: entra,
									transform: `translateY(${(1 - entra) * 10}px)`,
								}}
							>
								<span style={{flex: 'none', width: fonte * 0.9, display: 'flex', justifyContent: 'center'}}>
									<Check size={30} color={c.verde} draw={prog(frame, l.at, 8, slow)} />
								</span>
								<span>{l.texto}</span>
							</div>
						);
					}

					// info
					return (
						<div
							key={i}
							style={{
								...base,
								alignItems: 'center',
								color: l.cor ?? c.fumaca,
								opacity: entra,
								transform: `translateY(${(1 - entra) * 10}px)`,
							}}
						>
							<span style={{flex: 'none', width: fonte * 0.9, display: 'flex', justifyContent: 'center'}}>
								<Pip color={l.cor ?? c.fumaca} size={12} />
							</span>
							<span>{l.texto}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};
