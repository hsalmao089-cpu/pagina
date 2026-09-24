import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cut} from '../componentes/Cut';
import {Arrow, Pip, Shield} from '../componentes/Icones';
import {Som} from '../componentes/Som';
import {useCorpo} from '../componentes/useCorpo';
import type {Roteiro} from '../roteiro';
import {c, dsp, f, MARCAS, prog, slow, tag, CENAS} from '../tema';

/* 0:29–0:33 · OFERTA E CHAMADA
   Escassez verdadeira (o lote), a frase de fechamento da página, o botão e a
   garantia. O último quadro é um cartaz completo: se o vídeo pausar ou voltar
   ao início, a oferta inteira está na tela. */

const GOLPE = MARCAS.golpeFinal - CENAS.oferta.de;

export const Oferta: React.FC<{r: Roteiro; dur: number}> = ({r}) => {
	const frame = useCurrentFrame();
	const o = r.oferta;
	const linha1 = {...dsp, letterSpacing: '-0.04em'};
	const corpo1 = useCorpo([o.titulo[0]], 92, 920, linha1);
	const corpo2 = useCorpo([o.titulo[1] ?? ''], 150, 920, dsp);
	const vendidas = (o.total - o.restantes) / o.total;

	const pMarca = prog(frame, 0, 16, slow);
	const pLote = prog(frame, 4, 16, slow);
	const barra = prog(frame, 8, 30, slow);
	const pBotao = prog(frame, 20, 18, slow);
	const pRodape = prog(frame, 28, 18, slow);
	// o botão respira no golpe final da trilha
	const pulso = interpolate(frame - GOLPE, [0, 4, 16], [0, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill>
			{/* marca, como na navegação da página */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 276,
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
						fontWeight: 600,
						fontSize: 46,
						letterSpacing: '-0.02em',
						fontVariationSettings: "'wdth' 100, 'opsz' 18",
						color: c.bone,
					}}
				>
					{r.marca}
				</span>
				<span style={{...tag, fontSize: 20, color: c.ash}}>provisionamento de capacidade</span>
			</div>

			{/* lote: a única escassez do vídeo, e ela é real */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 400,
					width: 920,
					opacity: pLote,
					transform: `translateY(${(1 - pLote) * 20}px)`,
				}}
			>
				<div
					style={{
						...tag,
						color: c.bone,
						display: 'flex',
						alignItems: 'center',
						gap: 16,
					}}
				>
					<Pip color={c.live} size={12} />
					<span>
						{o.lote} — {o.restantes} chaves de {o.total}
					</span>
				</div>
				<div
					style={{
						marginTop: 22,
						height: 10,
						display: 'flex',
						gap: 4,
						borderRadius: 2,
						overflow: 'hidden',
					}}
				>
					<div style={{width: `${vendidas * 100 * barra}%`, background: 'rgba(242,239,233,.34)'}} />
					<div
						style={{
							flex: 1,
							background: c.live,
							opacity: barra,
							boxShadow: `0 0 18px ${c.live}`,
						}}
					/>
				</div>
			</div>

			<div style={{...dsp, position: 'absolute', left: 80, top: 540, width: 940}}>
				<Cut at={10} dur={20} style={{fontSize: corpo1, color: c.ash, letterSpacing: '-0.04em'}}>
					{o.titulo[0]}
				</Cut>
				<Cut at={16} dur={20} style={{fontSize: corpo2, marginTop: 10}}>
					{o.titulo[1]}
				</Cut>
			</div>

			{/* chamada */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 930,
					width: 920,
					opacity: pBotao,
					transform: `translateY(${(1 - pBotao) * 40}px)`,
				}}
			>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 26,
						padding: '38px 56px',
						borderRadius: 4,
						background: c.bone,
						color: c.pitch,
						fontFamily: f.text,
						fontWeight: 600,
						fontSize: 52,
						letterSpacing: '-0.01em',
						transform: `scale(${1 + pulso * 0.05})`,
						transformOrigin: 'left center',
						boxShadow: `0 40px 90px -36px rgba(242,239,233,${0.45 + pulso * 0.4})`,
					}}
				>
					{o.cta}
					<Arrow size={48} color={c.pitch} stroke={2.4} style={{transform: `translateX(${pulso * 8}px)`}} />
				</div>
				<div
					style={{
						...tag,
						fontSize: 26,
						color: c.bone,
						marginTop: 30,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
					}}
				>
					<Arrow size={26} color={c.bone} stroke={2.4} style={{transform: 'rotate(90deg)'}} />
					{o.ctaSub}
				</div>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 1200,
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
						fontWeight: 500,
						fontSize: 34,
						color: c.ash,
					}}
				>
					<Shield size={40} color={c.live} stroke={1.8} />
					{o.garantia}
				</div>
				<p
					style={{
						margin: '40px 0 0',
						fontFamily: f.text,
						fontSize: 21,
						lineHeight: 1.45,
						color: 'rgba(158,154,148,.8)',
						textWrap: 'pretty',
					}}
				>
					{o.aviso}
				</p>
			</div>

			<Som efeito="impacto-leve" at={0} volume={0.65} />
			<Som efeito="blip" at={20} volume={0.4} />
			<Som efeito="sucesso" at={GOLPE} volume={0.65} />
		</AbsoluteFill>
	);
};
