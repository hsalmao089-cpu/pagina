import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Confete, mola, Toque} from '../componentes/Efeitos';
import {Arrow, Pip, Shield} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, CENAS, dsp, f, grad, MARCAS, prog, tag} from '../tema';

/* ==========================================================================
   ATO 4 · OFERTA
   A barra volta uma última vez — e agora é a única que acaba: a do lote.
   "O acesso é limitado. O uso, nunca." Um dedo aperta o botão no golpe final
   da trilha, o confete sobe, e o quadro final fica parado como um cartaz.
   ========================================================================== */

const GOLPE = MARCAS.golpeFinal - CENAS.oferta.de;
const TOCA = GOLPE - 2;
const BOTAO = {x: 80, y: 870};
const BARRA_LOTE = {y: 404, w: 880, h: 60};
const CORES_CONFETE = ['#FFFFFF', '#FFC83D', '#2EE59D', '#22D3EE', '#A855F7', '#FF3D9A'];

export const Oferta: React.FC<{r: Roteiro; dur: number}> = ({r}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const o = r.oferta;
	const vendidas = (o.total - o.restantes) / o.total;
	const linha1 = {...dsp, letterSpacing: '-0.04em'};
	const corpo1 = useCorpo([o.titulo[0]], 92, 920, linha1);
	const corpo2 = useCorpo([o.titulo[1] ?? ''], 156, 920, dsp);

	const pMarca = prog(frame, 0, 16);
	const lote = frame < 4 ? 0 : mola(frame, 4, fps, 200);
	const barra = prog(frame, 8, 26);
	const botao = frame < 26 ? 0 : mola(frame, 26, fps, 170);
	const pRodape = prog(frame, 36, 18);
	// o botão afunda no toque e salta no golpe final
	const salto = frame >= GOLPE ? Math.sin(Math.min(1, (frame - GOLPE) / 10) * Math.PI) : 0;
	const escalaBotao = frame >= TOCA && frame < GOLPE ? 0.95 : 1 + 0.07 * salto;
	// brilho que atravessa o botão
	const brilho = ((frame - 30) % 40) / 40;

	return (
		<AbsoluteFill>
			{/* marca */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 262,
					display: 'flex',
					alignItems: 'baseline',
					gap: 20,
					opacity: pMarca,
					transform: `translateY(${(1 - pMarca) * 20}px)`,
				}}
			>
				<span
					style={{
						fontFamily: f.display,
						fontWeight: 800,
						fontSize: 52,
						letterSpacing: '0.01em',
						fontVariationSettings: "'wdth' 100, 'opsz' 48",
						color: c.branco,
					}}
				>
					{r.marca}
				</span>
				<span style={{...tag, fontSize: 19, color: c.nevoa}}>provisionamento de capacidade</span>
			</div>

			{/* a barra, uma última vez: agora a única que acaba é a do lote */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 344,
					width: BARRA_LOTE.w,
					opacity: Math.min(1, lote * 1.5),
					transformOrigin: 'left center',
					transform: `scale(${interpolate(lote, [0, 1], [0.8, 1])})`,
				}}
			>
				<div
					style={{
						...tag,
						fontSize: 23,
						color: c.branco,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
					}}
				>
					<Pip color={c.verde} size={13} glow={0.8 + 0.4 * Math.sin(frame / 4)} />
					{o.lote} · {o.restantes} de {o.total} chaves disponíveis
				</div>
				<div
					style={{
						position: 'absolute',
						top: BARRA_LOTE.y - 344,
						width: BARRA_LOTE.w,
						height: BARRA_LOTE.h,
						display: 'flex',
						gap: 6,
						padding: 6,
						borderRadius: 999,
						background: 'rgba(30,5,40,.35)',
						border: '2px solid rgba(255,255,255,.3)',
					}}
				>
					<div
						style={{
							width: `${vendidas * 100 * barra}%`,
							borderRadius: 999,
							background: 'rgba(255,255,255,.8)',
							display: 'flex',
							alignItems: 'center',
							paddingLeft: 20,
							fontFamily: f.mono,
							fontWeight: 700,
							fontSize: 20,
							color: c.tinta,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
						}}
					>
						{barra > 0.6 ? `${o.total - o.restantes} vendidas` : ''}
					</div>
					<div
						style={{
							flex: 1,
							borderRadius: 999,
							background: c.verde,
							opacity: barra,
							boxShadow: '0 0 30px rgba(46,229,157,.9)',
						}}
					/>
				</div>
			</div>

			<div style={{...dsp, position: 'absolute', left: 80, top: 540, width: 940}}>
				<Cut at={14} dur={20} style={{fontSize: corpo1, color: c.nevoa, letterSpacing: '-0.04em'}}>
					{o.titulo[0]}
				</Cut>
				<Cut at={20} dur={20} style={{fontSize: corpo2, marginTop: 12}}>
					{o.titulo[1]}
				</Cut>
			</div>

			{/* chamada */}
			<div
				style={{
					position: 'absolute',
					left: BOTAO.x,
					top: BOTAO.y,
					opacity: Math.min(1, botao * 1.5),
					transformOrigin: 'left center',
					transform: `translateY(${(1 - botao) * 50}px) scale(${interpolate(botao, [0, 1], [0.7, 1]) * escalaBotao})`,
				}}
			>
				<div
					style={{
						position: 'relative',
						overflow: 'hidden',
						display: 'inline-flex',
						alignItems: 'center',
						gap: 28,
						padding: '30px 30px 30px 52px',
						borderRadius: 999,
						background: c.branco,
						color: c.tinta,
						fontFamily: f.text,
						fontWeight: 700,
						fontSize: 54,
						letterSpacing: '-0.015em',
						boxShadow: `0 40px 90px -30px rgba(60,0,40,.75), 0 0 ${40 + salto * 60}px rgba(255,255,255,${0.35 + salto * 0.4})`,
					}}
				>
					{o.cta}
					<span
						style={{
							width: 84,
							height: 84,
							borderRadius: 999,
							background: grad.marca,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Arrow size={46} color={c.branco} stroke={2.6} />
					</span>
					{frame > 30 ? (
						<span
							style={{
								position: 'absolute',
								top: -20,
								bottom: -20,
								left: `${-40 + brilho * 170}%`,
								width: '22%',
								transform: 'skewX(-20deg)',
								background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent)',
								mixBlendMode: 'overlay',
							}}
						/>
					) : null}
				</div>
				<div style={{marginTop: 26}}>
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 12,
							padding: '12px 22px',
							borderRadius: 999,
							background: 'rgba(30,5,40,.35)',
							border: '2px solid rgba(255,255,255,.3)',
							...tag,
							fontSize: 24,
							color: c.branco,
						}}
					>
						<Arrow size={26} color={c.branco} stroke={2.6} style={{transform: 'rotate(90deg)'}} />
						{o.ctaSub}
					</span>
				</div>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 1150,
					width: 880,
					opacity: pRodape,
					transform: `translateY(${(1 - pRodape) * 20}px)`,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						fontFamily: f.text,
						fontWeight: 700,
						fontSize: 36,
						color: c.branco,
						textShadow: '0 4px 24px rgba(60,0,40,.35)',
					}}
				>
					<Shield size={44} color={c.branco} stroke={2} />
					{o.garantia}
				</div>
				<p
					style={{
						margin: '34px 0 0',
						fontFamily: f.text,
						fontSize: 21,
						fontWeight: 500,
						lineHeight: 1.45,
						color: 'rgba(255,255,255,.78)',
						textWrap: 'pretty',
					}}
				>
					{o.aviso}
				</p>
			</div>

			{/* o dedo mira a seta, não o texto do botão */}
			<Toque chega={TOCA - 22} toca={TOCA} x={BOTAO.x + 580} y={BOTAO.y + 72} />
			<Confete at={GOLPE} x={BOTAO.x + 580} y={BOTAO.y + 72} cores={CORES_CONFETE} n={130} semente={960} />

			<Som efeito="impacto-leve" at={0} volume={0.3} />
			<Som efeito="pop" at={4} volume={0.45} />
			<Som efeito="pop" at={26} volume={0.5} />
			<Som efeito="toque" at={TOCA} volume={0.7} />
			<Som efeito="sucesso" at={GOLPE} volume={0.5} />
			<Som efeito="brilho" at={GOLPE} volume={0.35} />
		</AbsoluteFill>
	);
};
