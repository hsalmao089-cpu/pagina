import React from 'react';
import {random, useCurrentFrame} from 'remotion';

type Props = {
	/** 0 = limpo, 1 = glitch no máximo. */
	forca: number;
	id: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
};

// Falha de sinal: tremor, separação de canais (vermelho para um lado, verde e
// azul para o outro) e faixas horizontais deslocadas. Com forca = 0 renderiza
// só os filhos, sem custo nenhum.
export const Glitch: React.FC<Props> = ({forca, id, children, style}) => {
	const frame = useCurrentFrame();
	if (forca <= 0.001) {
		return <div style={{position: 'relative', ...style}}>{children}</div>;
	}

	const r = (k: string) => random(`${id}-${k}-${frame}`) * 2 - 1;
	const dx = 14 * forca * (0.6 + 0.4 * Math.abs(r('dx')));
	const tremor = `translate(${r('tx') * 16 * forca}px, ${r('ty') * 9 * forca}px)`;
	const faixas = Array.from({length: 5}, (_, i) => {
		const topo = Math.abs(r(`t${i}`)) * 88;
		const alto = 2 + Math.abs(r(`h${i}`)) * 9;
		return {topo, alto, x: r(`x${i}`) * 60 * forca};
	});
	const filtro = `${id}-rgb`;

	return (
		<div style={{position: 'relative', transform: tremor, ...style}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<filter id={filtro} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
					<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
					<feOffset in="r" dx={-dx} dy={0} result="r2" />
					<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
					<feOffset in="gb" dx={dx} dy={0} result="gb2" />
					<feBlend in="r2" in2="gb2" mode="screen" />
				</filter>
			</svg>
			<div style={{filter: `url(#${filtro})`}}>{children}</div>
			{faixas.map((fx, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						inset: 0,
						clipPath: `inset(${fx.topo}% 0 ${Math.max(0, 100 - fx.topo - fx.alto)}% 0)`,
						transform: `translateX(${fx.x}px)`,
					}}
				>
					{children}
				</div>
			))}
		</div>
	);
};
