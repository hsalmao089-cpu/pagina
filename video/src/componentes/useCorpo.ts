import type React from 'react';
import {useLayoutEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {fontesProntas} from '../fontes';

const medidas = new Map<string, number>();

/**
 * Maior corpo, até `max`, em que todas as `linhas` cabem em `largura` sem quebrar.
 *
 * Todo texto do vídeo é editável pelo Studio; sem isso, uma manchete um pouco
 * mais longa quebra em três linhas e invade o bloco de baixo. A medida é feita
 * no DOM, com o mesmo estilo e com a fonte já carregada — medir antes disso
 * mediria a fonte de fallback. O quadro só é capturado depois da medida.
 */
export const useCorpo = (
	linhas: string[],
	max: number,
	largura: number,
	estilo: React.CSSProperties,
) => {
	const chave = JSON.stringify([linhas, max, largura, estilo.fontFamily, estilo.letterSpacing]);
	const [, remedir] = useState(0);

	useLayoutEffect(() => {
		if (medidas.has(chave)) return;
		const espera = delayRender(`medindo: ${linhas.join(' / ')}`);
		fontesProntas.then(() => {
			const el = document.createElement('span');
			const s = el.style;
			s.position = 'absolute';
			s.left = '-99999px';
			s.top = '0';
			s.visibility = 'hidden';
			s.whiteSpace = 'nowrap';
			s.fontFamily = String(estilo.fontFamily ?? '');
			s.fontWeight = String(estilo.fontWeight ?? 400);
			s.fontVariationSettings = String(estilo.fontVariationSettings ?? 'normal');
			s.letterSpacing = String(estilo.letterSpacing ?? 'normal');
			s.fontSize = `${max}px`;
			document.body.appendChild(el);
			let maior = 0;
			for (const l of linhas) {
				el.textContent = l;
				maior = Math.max(maior, el.getBoundingClientRect().width);
			}
			el.remove();
			medidas.set(chave, maior > largura ? Math.floor((max * largura) / maior) : max);
			remedir((v) => v + 1);
			continueRender(espera);
		});
		// `chave` resume todas as entradas da medida
	}, [chave]);

	return medidas.get(chave) ?? max;
};
