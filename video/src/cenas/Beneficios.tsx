import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Pip} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {Camera, painel, Secao} from '../componentes/Ui';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, exit, f, prog, slow, tag} from '../tema';

/* 0:25–0:29 · O QUE VEM COM A CHAVE
   A régua de instrumentos do herói da página, em tamanho de celular. O traço
   no lugar do número é o argumento: não é "alto", é "não existe". */

const PASSO = 9;
const INICIO = 14;

const Valor: React.FC<{valor: string; at: number}> = ({valor, at}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at + 3, 14, slow);
	if (valor === '—') {
		// o traço é desenhado, não digitado
		return (
			<span
				style={{
					display: 'inline-block',
					width: 84 * p,
					height: 8,
					borderRadius: 2,
					background: c.bone,
					boxShadow: '0 0 22px rgba(242,239,233,.45)',
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
				color: bom ? c.live : c.bone,
				opacity: p,
				transform: `translateY(${(1 - p) * 18}px)`,
			}}
		>
			{valor}
		</span>
	);
};

export const Beneficios: React.FC<{r: Roteiro; dur: number}> = ({r, dur}) => {
	const frame = useCurrentFrame();
	const b = r.beneficios;
	const corpo = useCorpo(b.titulo, 150, 920, dsp);
	const sai = prog(frame, dur - 9, 9, exit);
	const pPainel = prog(frame, 6, 16, slow);

	return (
		<AbsoluteFill>
			<Camera dur={dur} de={1} ate={1.03}>
				<AbsoluteFill style={{opacity: 1 - sai, transform: `translateY(${-sai * 60}px)`}}>
					<Secao n="§04" at={0} style={{position: 'absolute', left: 80, top: 272, width: 920}}>
						{b.secao}
					</Secao>

					<div style={{...dsp, fontSize: corpo, position: 'absolute', left: 80, top: 360, width: 940}}>
						<Cut at={2} dur={18}>{b.titulo[0]}</Cut>
						<Cut at={6} dur={18}>{b.titulo[1]}</Cut>
					</div>

					<div
						style={{
							...painel,
							position: 'absolute',
							left: 80,
							top: 700,
							width: 880,
							padding: '14px 44px 30px',
							opacity: pPainel,
							transform: `translateY(${(1 - pPainel) * 50}px)`,
						}}
					>
						{b.itens.map((it, i) => {
							const at = INICIO + i * PASSO;
							const p = prog(frame, at, 14, slow);
							const fio = prog(frame, at - 2, 18, slow);
							return (
								<div
									key={i}
									style={{
										position: 'relative',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										height: 122,
									}}
								>
									{i > 0 ? (
										<div
											style={{
												position: 'absolute',
												left: 0,
												right: 0,
												top: 0,
												height: 2,
												background: c.edge2,
												transformOrigin: 'left',
												transform: `scaleX(${fio})`,
											}}
										/>
									) : null}
									<div style={{opacity: p, transform: `translateX(${(1 - p) * -24}px)`}}>
										<div style={{...tag, fontSize: 26, color: c.ash}}>{it.rotulo}</div>
										<div
											style={{
												...tag,
												fontSize: 19,
												marginTop: 10,
												display: 'flex',
												alignItems: 'center',
												gap: 12,
											}}
										>
											<Pip color={c.live} size={9} glow={0.6} />
											{it.nota}
										</div>
									</div>
									<div
										style={{
											fontFamily: f.mono,
											fontWeight: 500,
											fontSize: 64,
											letterSpacing: '-0.02em',
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

			<Som efeito="whoosh" at={0} volume={0.35} />
			{b.itens.map((_, i) => (
				<Som key={i} efeito="blip" at={INICIO + i * PASSO + 2} volume={0.45} />
			))}
		</AbsoluteFill>
	);
};
