import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALTURA, c, f, FPS, LARGURA, prog} from '../tema';

/* Peças de energia: pop com mola, marcador, carimbo, confete, raios e toque. */

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

/** Mola com um pouco de sobra: o elemento passa do ponto e volta. */
export const mola = (frame: number, at: number, fps: number, rigidez = 200) =>
	spring({frame: frame - at, fps, config: {damping: 12, stiffness: rigidez, mass: 0.6}});

type PopProps = {
	at: number;
	de?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** Entra crescendo com mola. */
export const Pop: React.FC<PopProps> = ({at, de = 0.5, style, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	const s = mola(frame, at, fps);
	return (
		<div
			style={{
				transform: `scale(${interpolate(s, [0, 1], [de, 1])})`,
				opacity: Math.min(1, (frame - at) / 4),
				...style,
			}}
		>
			{children}
		</div>
	);
};

type MarcaProps = {
	at: number;
	fundo: string;
	corTexto?: string;
	children: React.ReactNode;
};

/** Marca-texto: um bloco de cor corre por trás da palavra e ela muda de cor. */
export const Marca: React.FC<MarcaProps> = ({at, fundo, corTexto = c.branco, children}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, 9);
	return (
		<span style={{position: 'relative', display: 'inline-block', padding: '0 0.16em', margin: '0 -0.06em'}}>
			<span
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: '0.06em',
					bottom: '-0.02em',
					background: fundo,
					borderRadius: '0.16em',
					transformOrigin: 'left center',
					transform: `scaleX(${p}) rotate(-1.6deg)`,
					boxShadow: '0 18px 50px -12px rgba(30,0,60,.6)',
				}}
			/>
			<span style={{position: 'relative', color: p > 0.35 ? corTexto : undefined, textShadow: p > 0.35 ? 'none' : undefined}}>
				{children}
			</span>
		</span>
	);
};

type CarimboProps = {
	at: number;
	linhas: string[];
	fundo?: string;
	style?: React.CSSProperties;
};

/** Carimbo de alerta: cai grande e gira, bate e fica. */
export const Carimbo: React.FC<CarimboProps> = ({at, linhas, fundo = c.vermelho, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 10, stiffness: 260, mass: 0.7}});
	return (
		<div
			style={{
				position: 'absolute',
				transform: `rotate(${interpolate(s, [0, 1], [-22, -8])}deg) scale(${interpolate(s, [0, 1], [2.6, 1])})`,
				opacity: Math.min(1, (frame - at) / 3),
				background: fundo,
				color: c.branco,
				borderRadius: 30,
				padding: '26px 46px 30px',
				boxShadow: `0 40px 90px -20px rgba(120,0,30,.8), 0 0 80px rgba(255,45,85,.55), inset 0 0 0 7px rgba(255,255,255,.9)`,
				fontFamily: f.display,
				fontWeight: 800,
				fontVariationSettings: "'wdth' 88, 'opsz' 48",
				fontSize: 104,
				lineHeight: 0.95,
				letterSpacing: '0.01em',
				textAlign: 'center',
				textTransform: 'uppercase',
				...style,
			}}
		>
			{linhas.map((l, i) => (
				<div key={i}>{l}</div>
			))}
		</div>
	);
};

type ConfeteProps = {
	/** Quadro local da explosão. */
	at: number;
	x: number;
	y: number;
	cores: string[];
	n?: number;
	semente?: number;
};

/** Explosão de confete — física simples, tudo função do quadro. */
export const Confete: React.FC<ConfeteProps> = ({at, x, y, cores, n = 150, semente = 1}) => {
	const frame = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);
	const pedacos = useMemo(() => {
		const rnd = gerador(semente);
		return Array.from({length: n}, () => {
			const ang = -Math.PI / 2 + (rnd() - 0.5) * Math.PI * 1.9;
			const v = 900 + rnd() * 1500;
			return {
				vx: Math.cos(ang) * v,
				vy: Math.sin(ang) * v,
				w: 12 + rnd() * 16,
				h: 6 + rnd() * 8,
				giro: (rnd() - 0.5) * 18,
				vira: 6 + rnd() * 12,
				fase: rnd() * Math.PI * 2,
				vida: 1.1 + rnd() * 0.8,
				cor: cores[Math.floor(rnd() * cores.length)],
				redondo: rnd() < 0.25,
			};
		});
	}, [n, semente, cores]);

	useLayoutEffect(() => {
		const g = ref.current?.getContext('2d');
		if (!g) return;
		g.clearRect(0, 0, LARGURA, ALTURA);
		const t = (frame - at) / FPS;
		if (t < 0 || t > 2.2) return;
		const k = 2.2; // arrasto do ar
		for (const p of pedacos) {
			if (t > p.vida) continue;
			const d = (1 - Math.exp(-k * t)) / k;
			const px = x + p.vx * d;
			const py = y + p.vy * d + 0.5 * 1600 * t * t * 0.55;
			const alpha = t > p.vida * 0.7 ? 1 - (t - p.vida * 0.7) / (p.vida * 0.3) : 1;
			g.save();
			g.globalAlpha = Math.max(0, alpha);
			g.translate(px, py);
			g.rotate(p.fase + p.giro * t);
			g.scale(1, Math.cos(p.fase + p.vira * t));
			g.fillStyle = p.cor;
			if (p.redondo) {
				g.beginPath();
				g.arc(0, 0, p.h, 0, Math.PI * 2);
				g.fill();
			} else {
				g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
			}
			g.restore();
		}
	}, [frame, at, x, y, pedacos]);

	return (
		<canvas
			ref={ref}
			width={LARGURA}
			height={ALTURA}
			style={{position: 'absolute', inset: 0, width: LARGURA, height: ALTURA, pointerEvents: 'none'}}
		/>
	);
};

/** Raios de luz girando atrás de um elemento. */
export const Raios: React.FC<{cx: number; cy: number; raio: number; opacidade: number; giro: number}> = ({
	cx,
	cy,
	raio,
	opacidade,
	giro,
}) =>
	opacidade <= 0.001 ? null : (
		<div
			style={{
				position: 'absolute',
				left: cx - raio,
				top: cy - raio,
				width: raio * 2,
				height: raio * 2,
				borderRadius: '50%',
				background:
					'repeating-conic-gradient(from 0deg, rgba(255,255,255,.34) 0deg 4deg, rgba(255,255,255,0) 4deg 15deg)',
				WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,.55) 30%, transparent 68%)',
				maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,.55) 30%, transparent 68%)',
				transform: `rotate(${giro}deg)`,
				opacity: opacidade,
				mixBlendMode: 'screen',
			}}
		/>
	);

type ToqueProps = {
	/** Quadro em que o dedo aparece. */
	chega: number;
	/** Quadro do toque. */
	toca: number;
	x: number;
	y: number;
};

/** Indicador de toque: um círculo chega, aperta o botão e solta duas ondas. */
export const Toque: React.FC<ToqueProps> = ({chega, toca, x, y}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < chega) return null;
	const s = spring({frame: frame - chega, fps, config: {damping: 16, stiffness: 120, mass: 0.8}});
	const px = interpolate(s, [0, 1], [x + 300, x]);
	const py = interpolate(s, [0, 1], [y + 380, y]);
	const aperta = interpolate(frame - toca, [-2, 0, 4, 10], [1, 0.72, 0.72, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// depois do toque o dedo se afasta e some: o cartaz final fica limpo
	const vai = interpolate(frame - toca, [10, 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const ondas = [0, 7].map((atraso) => {
		const t = frame - toca - atraso;
		if (t < 0 || t > 22) return null;
		const p = t / 22;
		return {r: 50 + p * 190, a: (1 - p) * 0.8};
	});
	return (
		<>
			{ondas.map((o, i) =>
				o ? (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - o.r,
							top: y - o.r,
							width: o.r * 2,
							height: o.r * 2,
							borderRadius: '50%',
							border: `5px solid rgba(255,255,255,${o.a})`,
							pointerEvents: 'none',
						}}
					/>
				) : null,
			)}
			<div
				style={{
					position: 'absolute',
					left: px - 46,
					top: py - 46,
					width: 92,
					height: 92,
					borderRadius: '50%',
					background: 'radial-gradient(circle at 40% 35%, #fff, rgba(255,255,255,.82))',
					border: '4px solid rgba(255,255,255,.95)',
					boxShadow: '0 20px 50px rgba(40,0,80,.5), 0 0 0 10px rgba(255,255,255,.18)',
					transform: `translate(${vai * 120}px, ${vai * 160}px) scale(${aperta * (1 - vai * 0.3)})`,
					opacity: Math.min(1, (frame - chega) / 5) * (1 - vai),
					pointerEvents: 'none',
				}}
			/>
		</>
	);
};
