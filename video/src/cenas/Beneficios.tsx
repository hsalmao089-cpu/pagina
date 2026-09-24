import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Marca, mola} from '../componentes/Efeitos';
import {Etiqueta, InfinitoIcone, Raio, Relogio, Selo, Shield} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {Camera, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, grad, prog, tag, vidro} from '../tema';

/* 0:25–0:29 · O QUE VEM COM A CHAVE
   Cartão de vidro com um selo colorido por benefício. O traço no lugar do
   número é o argumento: não é "alto", é "não existe". */

const PASSO = 9;
const INICIO = 14;

const ICONES = [Raio, InfinitoIcone, Relogio, Shield, Etiqueta];
const FUNDOS = [grad.alerta, grad.marca, grad.frio, grad.sucesso, grad.marca];

const Valor: React.FC<{valor: string; at: number}> = ({valor, at}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at + 3, 14);
	if (valor === '—') {
		// o traço é desenhado, não digitado
		return (
			<span
				style={{
					display: 'inline-block',
					width: 92 * p,
					height: 12,
					borderRadius: 999,
					background: grad.marca,
					boxShadow: '0 0 26px rgba(255,90,160,.6)',
					transform: 'translateY(-14px)',
				}}
			/>
		);
	}
	const bom = /^0([,.]0+)?\s*%?$/.test(valor.trim());
	return (
		<span
			style={{
				display: 'inline-block',
				opacity: p,
				transform: `translateY(${(1 - p) * 18}px)`,
				color: bom ? c.verde : c.branco,
				textShadow: bom ? '0 0 30px rgba(46,229,157,.6)' : '0 4px 24px rgba(40,0,80,.35)',
			}}
		>
			{valor}
		</span>
	);
};

export const Beneficios: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const b = r.beneficios;
	const corpo = useCorpo(b.titulo, 156, 920, dsp);
	const sai = prog(frame, dur - 9, 9, exit);
	const cartao = frame < 6 ? 0 : mola(frame, 6, fps, 150);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.03}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					<Secao n="04" at={0} style={{position: 'absolute', left: 80, top: 262}}>
						{b.secao}
					</Secao>

					<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 370, width: 940}}>
						<Cut at={2} dur={18}>
							{b.titulo[0]}
						</Cut>
						<Cut at={6} dur={18}>
							<Marca at={14} fundo={c.amarelo} corTexto={c.tinta}>
								{b.titulo[1]}
							</Marca>
						</Cut>
					</div>

					<div
						style={{
							...vidro,
							position: 'absolute',
							left: 80,
							top: 700,
							width: 880,
							padding: '12px 36px 18px',
							opacity: Math.min(1, cartao * 1.4),
							transformOrigin: 'center top',
							transform: `translateY(${(1 - cartao) * 70}px) scale(${interpolate(cartao, [0, 1], [0.92, 1])})`,
						}}
					>
						{b.itens.map((it, i) => {
							const at = INICIO + i * PASSO;
							const s = frame < at ? 0 : mola(frame, at, fps, 220);
							const Icone = ICONES[i % ICONES.length];
							return (
								<div
									key={i}
									style={{
										position: 'relative',
										display: 'flex',
										alignItems: 'center',
										gap: 26,
										height: 118,
										borderTop: i > 0 ? '2px solid rgba(255,255,255,.14)' : undefined,
									}}
								>
									<div
										style={{
											opacity: Math.min(1, s * 1.5),
											transform: `scale(${interpolate(s, [0, 1], [0.3, 1])}) rotate(${interpolate(s, [0, 1], [-30, 0])}deg)`,
										}}
									>
										<Selo fundo={FUNDOS[i % FUNDOS.length]} tamanho={72}>
											<Icone size={40} color={c.tinta} stroke={2.4} />
										</Selo>
									</div>
									<div
										style={{
											flex: 1,
											opacity: Math.min(1, s * 1.5),
											transform: `translateX(${(1 - s) * -30}px)`,
										}}
									>
										<div
											style={{
												fontFamily: f.display,
												fontWeight: 700,
												fontVariationSettings: "'wdth' 100, 'opsz' 24",
												fontSize: 38,
												letterSpacing: '-0.02em',
												color: c.branco,
											}}
										>
											{it.rotulo}
										</div>
										<div style={{...tag, fontSize: 18, color: c.fumaca, marginTop: 6}}>{it.nota}</div>
									</div>
									<div
										style={{
											fontFamily: f.mono,
											fontWeight: 700,
											fontSize: 58,
											letterSpacing: '-0.03em',
											fontVariantNumeric: 'tabular-nums',
										}}
									>
										<Valor valor={it.valor} at={at} />
									</div>
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			</Camera>

			{b.itens.map((_, i) => (
				<Som key={i} efeito="pop" at={INICIO + i * PASSO} volume={0.45} />
			))}
		</AbsoluteFill>
	);
};
