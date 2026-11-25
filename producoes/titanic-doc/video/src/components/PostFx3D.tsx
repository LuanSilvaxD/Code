import { useFrame, useThree } from "@react-three/fiber";
import { BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { HalfFloatType } from "three";
import { useCurrentFrame } from "remotion";

/**
 * Pós-processamento 3D real, DENTRO do <ThreeCanvas>: bloom (luzes, janelas, fogo, emissivos brilham de
 * verdade), tonemapping de cinema (ACES, opcional) e vinheta 3D (opcional).
 *
 * - Feito à mão com a lib `postprocessing` (npm i postprocessing@6.39.6). O <EffectComposer> do
 *   @react-three/postprocessing sai EM BRANCO no render do Remotion (frameloop "never"): não use.
 * - Custo medido no render por software (swangle): ~2,5× mais lento. Ligue por cena/vídeo onde há luz
 *   (noite, fogo, vigias, faróis, espaço, neon), não em tudo.
 * - ACES escurece cenas já escuras: deixe desligado em noite; use em cenas de dia/estúdio muito saturadas.
 * - Só materiais acima de `threshold` de luminância brilham: use emissive/meshBasic claros para o que deve brilhar.
 */
export const PostFx3D: React.FC<{ bloom?: number; threshold?: number; aces?: boolean; vignette?: number; hq?: boolean }> = ({ bloom = 0.9, threshold = 0.62, aces = false, vignette = 0, hq = false }) => {
  const { gl, scene, camera, size, advance } = useThree();
  const frame = useCurrentFrame();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, hq ? { frameBufferType: HalfFloatType } : {});
    c.addPass(new RenderPass(scene, camera));
    const fx = [];
    if (bloom > 0) fx.push(new BloomEffect({ intensity: bloom, luminanceThreshold: threshold, luminanceSmoothing: 0.2, mipmapBlur: true, resolutionScale: hq ? 1 : 0.5, levels: hq ? 8 : 5 }));
    if (aces) fx.push(new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }));
    if (vignette > 0) fx.push(new VignetteEffect({ offset: 0.3, darkness: vignette }));
    if (fx.length) c.addPass(new EffectPass(camera, ...fx));
    return c;
  }, [gl, scene, camera, bloom, threshold, aces, vignette, hq]);
  useLayoutEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);
  useLayoutEffect(() => () => composer.dispose(), [composer]);
  // o Remotion avança o R3F antes deste componente montar: renderiza de novo quando o composer já existe
  useEffect(() => {
    advance(performance.now());
  }, [frame, advance, composer]);
  useFrame(() => {
    composer.render();
  }, 1);
  return null;
};
