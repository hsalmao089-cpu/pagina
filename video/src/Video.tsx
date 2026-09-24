import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Aurora} from './componentes/Aurora';
import {Clarao, Grao, GuiasReels, Varredura, Vinheta} from './componentes/Camadas';
import {Som, VolumeEfeitos} from './componentes/Som';
import {Agentes} from './cenas/Agentes';
import {Confianca} from './cenas/Confianca';
import {Editores} from './cenas/Editores';
import {Limite} from './cenas/Limite';
import {Oferta} from './cenas/Oferta';
import {Revelacao} from './cenas/Revelacao';
import type {Roteiro} from './roteiro';
import {CENAS, DURACAO, grad, MARCAS} from './tema';

// As cenas se sobrepõem alguns quadros: cada passagem é feita por
// continuidade — a barra vira ∞, o ∞ vira a grade, um painel vira o editor.
const ordem = [
	['limite', Limite],
	['revelacao', Revelacao],
	['agentes', Agentes],
	['editores', Editores],
	['confianca', Confianca],
	['oferta', Oferta],
] as const;

// A trilha abaixa onde o som da cena conta a história — o teclado da chave,
// os tiques do medidor — e some nos últimos quadros, para o loop do Reels não
// emendar com estalo.
const mixDaTrilha = (f: number) =>
	interpolate(
		f,
		[0, 44, 50, 118, 124, 266, 274, 326, 330, DURACAO - 6, DURACAO],
		[0.85, 0.85, 1, 1, 0.92, 0.92, 0.8, 0.8, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

export const Video: React.FC<Roteiro> = (r) => {
	const frame = useCurrentFrame();

	// clarão branco no drop: o Enter rasga as fitas
	const clarao = interpolate(frame, [MARCAS.drop - 2, MARCAS.drop, MARCAS.drop + 7], [0, 0.9, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<VolumeEfeitos.Provider value={r.efeitos}>
			<AbsoluteFill>
				{/* fundo único para o vídeo todo: a paleta muda com a história */}
				<Aurora />

				{ordem.map(([chave, Cena]) => {
					const {de, dur} = CENAS[chave];
					return (
						<Sequence key={chave} name={chave} from={de} durationInFrames={dur}>
							<Cena r={r} dur={dur} />
						</Sequence>
					);
				})}

				{/* a entrada do último ato ganha uma varredura com o degradê da marca */}
				<Varredura em={MARCAS.oferta} fundo={grad.marca} sentido={-1} />
				<Som efeito="whoosh" at={MARCAS.oferta - 8} volume={0.5} />

				<Clarao intensidade={clarao} />
				<Vinheta />
				<Grao />
				{r.guias ? <GuiasReels /> : null}

				{r.trilha > 0 ? (
					<Html5Audio
						src={staticFile('audio/trilha.wav')}
						volume={(f) => r.trilha * mixDaTrilha(f)}
					/>
				) : null}
			</AbsoluteFill>
		</VolumeEfeitos.Provider>
	);
};
