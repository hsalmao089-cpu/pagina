import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CampoDeFluxo} from './componentes/CampoDeFluxo';
import {Clarao, Grao, GuiasReels, Vinheta} from './componentes/Camadas';
import {VolumeEfeitos} from './componentes/Som';
import {Beneficios} from './cenas/Beneficios';
import {Compat} from './cenas/Compat';
import {Custo} from './cenas/Custo';
import {Demo} from './cenas/Demo';
import {Gancho} from './cenas/Gancho';
import {Oferta} from './cenas/Oferta';
import {Revelacao} from './cenas/Revelacao';
import {Virada} from './cenas/Virada';
import type {Roteiro} from './roteiro';
import {c, CENAS, DURACAO, MARCAS} from './tema';

const ordem = [
	['gancho', Gancho],
	['custo', Custo],
	['virada', Virada],
	['revelacao', Revelacao],
	['demo', Demo],
	['compat', Compat],
	['beneficios', Beneficios],
	['oferta', Oferta],
] as const;

// A trilha abaixa onde o som da cena conta a história — o teclado da demo, os
// cliques do terminal — e some nos últimos quadros, para o loop do Reels não
// emendar com estalo.
const mixDaTrilha = (f: number) =>
	interpolate(
		f,
		[0, 44, 50, 88, 94, 236, 244, 416, 426, 596, 606, 866, 874, DURACAO - 6, DURACAO],
		[0.85, 0.85, 1, 1, 0.9, 0.9, 1, 1, 0.72, 0.72, 0.9, 0.9, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

export const Video: React.FC<Roteiro> = (r) => {
	const frame = useCurrentFrame();

	// clarão branco no drop: fecha a virada e abre a revelação
	const clarao = interpolate(frame, [MARCAS.drop - 2, MARCAS.drop, MARCAS.drop + 7], [0, 0.9, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<VolumeEfeitos.Provider value={r.efeitos}>
			<AbsoluteFill style={{background: c.pitch}}>
				{/* o campo é um só, atrás de todas as cenas: a vazão é o fio do vídeo */}
				<CampoDeFluxo />

				{ordem.map(([chave, Cena]) => {
					const {de, dur} = CENAS[chave];
					return (
						<Sequence key={chave} name={chave} from={de} durationInFrames={dur}>
							<Cena r={r} dur={dur} />
						</Sequence>
					);
				})}

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
