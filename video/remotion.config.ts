import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');

// Saída pensada para o Instagram: H.264 + AAC, 4:2:0, BT.709 em faixa limitada
// (sem isso o arquivo sai marcado como JPEG de faixa cheia e alguns celulares
// lavam o preto). O Instagram recomprime tudo, então teto de 16 Mbps basta —
// acima disso é só arquivo pesado.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(94);
Config.setCodec('h264');
Config.setCrf(19);
Config.setX264Preset('slow');
Config.setEncodingMaxRate('16M');
Config.setEncodingBufferSize('32M');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
