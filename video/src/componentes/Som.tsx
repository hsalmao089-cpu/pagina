import React, {createContext, useContext} from 'react';
import {Html5Audio, interpolate, Sequence, staticFile} from 'remotion';

/** Efeitos gerados por scripts/gerar-audio.mjs em public/audio/. */
export type Efeito =
	| 'digitacao'
	| 'enter'
	| 'blip'
	| 'check'
	| 'erro'
	| 'golpe'
	| 'tique'
	| 'whoosh'
	| 'impacto'
	| 'impacto-leve'
	| 'sucesso';

/** Volume geral dos efeitos, vindo da prop `efeitos`. */
export const VolumeEfeitos = createContext(1);

type Props = {
	efeito: Efeito;
	/** Quadro (relativo à cena) em que o som começa. */
	at: number;
	volume?: number;
	/** Corta o som depois de N quadros, com fade curto para não estalar. */
	dur?: number;
};

// Cada som é posicionado dentro da própria cena, ao lado do quadro que ele
// acompanha — mexeu na animação, o som vai junto.
export const Som: React.FC<Props> = ({efeito, at, volume = 1, dur}) => {
	const geral = useContext(VolumeEfeitos);
	const v = volume * geral;
	if (v <= 0) return null;
	return (
		<Sequence from={at} durationInFrames={dur} layout="none" name={`som: ${efeito}`}>
			<Html5Audio
				src={staticFile(`audio/${efeito}.wav`)}
				volume={
					dur === undefined
						? v
						: (f) =>
								interpolate(f, [0, Math.max(1, dur - 3), dur], [v, v, 0], {
									extrapolateRight: 'clamp',
								})
				}
			/>
		</Sequence>
	);
};
