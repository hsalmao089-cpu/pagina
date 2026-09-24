import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {FPS} from '../tema';

/* ==========================================================================
   ∞ DE PARTÍCULAS
   Uma fita de partículas correndo sobre a lemniscata de Bernoulli. Nasce como
   um cometa saindo do cruzamento e se espalha até fechar o laço: de um ponto
   ao infinito. Tudo é função do quadro — nada de estado entre quadros.
   ========================================================================== */

type Props = {
	/** Quadro local em que o ∞ nasce. */
	nasce?: number;
	/** Meia-largura do laço, em px. */
	A?: number;
	largura: number;
	altura: number;
	n?: number;
	brilho?: number;
	style?: React.CSSProperties;
};

type Particula = {s0: number; w: number; d: number; fase: number; a: number};

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

const TRILHA = 18;
const DT = 1 / 60;

export const Infinito: React.FC<Props> = ({
	nasce = 0,
	A = 420,
	largura,
	altura,
	n = 1100,
	brilho = 1,
	style,
}) => {
	const frame = useCurrentFrame();
	const ref = useRef<HTMLCanvasElement>(null);
	const buf = useRef<HTMLCanvasElement | null>(null);

	const ps = useMemo<Particula[]>(() => {
		const rnd = gerador(7);
		return Array.from({length: n}, () => {
			// deslocamento lateral quase gaussiano: a maioria cola na curva, poucas se afastam
			const g = (rnd() + rnd() + rnd() - 1.5) / 1.5;
			return {
				s0: rnd() * Math.PI * 2,
				w: 1.05 + rnd() * 0.45,
				d: g * 26,
				fase: rnd() * Math.PI * 2,
				a: 0.18 + Math.pow(rnd(), 2.2) * 0.8,
			};
		});
	}, [n]);

	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const g = cv.getContext('2d');
		if (!g) return;
		g.clearRect(0, 0, largura, altura);
		const tau = (frame - nasce) / FPS;
		if (tau < 0 || brilho <= 0.001) return;

		// o laço se abre como mola amortecida: rápido no começo, assentando no fim
		const abre = interpolate(tau, [0, 1.1], [0, 1], {
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.16, 1, 0.3, 1),
		});
		const cx = largura / 2;
		const cy = altura / 2;

		const ponto = (s: number, d: number): [number, number] => {
			const sn = Math.sin(s);
			const cs = Math.cos(s);
			const den = 1 + sn * sn;
			const x = (A * cs) / den;
			const y = (A * sn * cs) / den;
			// normal pela derivada numérica
			const e = 0.002;
			const sn2 = Math.sin(s + e);
			const cs2 = Math.cos(s + e);
			const den2 = 1 + sn2 * sn2;
			const tx = (A * cs2) / den2 - x;
			const ty = (A * sn2 * cs2) / den2 - y;
			const len = Math.hypot(tx, ty) || 1;
			return [cx + x - (ty / len) * d, cy + y + (tx / len) * d];
		};

		if (!buf.current) {
			buf.current = document.createElement('canvas');
			buf.current.width = largura;
			buf.current.height = altura;
		}
		const b = buf.current.getContext('2d');
		if (!b) return;
		b.clearRect(0, 0, largura, altura);
		b.globalCompositeOperation = 'lighter';
		b.lineCap = 'round';
		b.lineJoin = 'round';

		// quatro faixas de brilho por partícula, do rastro velho para a cabeça
		const cortes = [0, 5, 10, 14, TRILHA];
		for (let fx = cortes.length - 2; fx >= 0; fx--) {
			const k0 = cortes[fx];
			const k1 = cortes[fx + 1];
			const peso = 1 - (k0 + k1) / 2 / TRILHA;
			for (const faixaA of [0.35, 0.7, 1]) {
				b.strokeStyle = `rgba(242,239,233,${(faixaA * peso * 0.62 * brilho).toFixed(4)})`;
				b.lineWidth = 1.4 + faixaA * 1.2;
				b.beginPath();
				for (const p of ps) {
					const classe = p.a < 0.4 ? 0.35 : p.a < 0.75 ? 0.7 : 1;
					if (classe !== faixaA) continue;
					for (let k = k0; k <= k1; k++) {
						const t = Math.max(0, tau - k * DT);
						const ab = interpolate(t, [0, 1.1], [0, 1], {
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.16, 1, 0.3, 1),
						});
						const s = Math.PI / 2 + p.s0 * ab + p.w * t;
						const d = p.d * ab * (1 + 0.35 * Math.sin(2.1 * t + p.fase));
						const [x, y] = ponto(s, d);
						if (k === k0) b.moveTo(x, y);
						else b.lineTo(x, y);
					}
				}
				b.stroke();
			}
		}

		// brilho: a fita inteira borrada por baixo, depois a fita nítida por cima
		g.globalCompositeOperation = 'lighter';
		g.filter = 'blur(14px)';
		g.globalAlpha = 0.9;
		g.drawImage(buf.current, 0, 0);
		g.filter = 'blur(3px)';
		g.globalAlpha = 0.8;
		g.drawImage(buf.current, 0, 0);
		g.filter = 'none';
		g.globalAlpha = 1;
		g.drawImage(buf.current, 0, 0);

		// clarão no cruzamento no instante em que o laço nasce
		const clarao = interpolate(tau, [0, 0.05, 0.6], [0, 1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		if (clarao > 0.001) {
			const r = 40 + (1 - clarao) * 220 * abre;
			const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
			gr.addColorStop(0, `rgba(242,239,233,${0.9 * clarao})`);
			gr.addColorStop(1, 'rgba(242,239,233,0)');
			g.fillStyle = gr;
			g.fillRect(cx - r, cy - r, r * 2, r * 2);
		}
		g.globalCompositeOperation = 'source-over';
	}, [frame, nasce, A, largura, altura, ps, brilho]);

	return <canvas ref={ref} width={largura} height={altura} style={{width: largura, height: altura, ...style}} />;
};
