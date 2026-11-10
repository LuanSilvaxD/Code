import type { SceneModule } from "./types";

// Todas as camadas 2D deste vídeo ficam em CityOverlay (globais); nenhuma cena precisa de módulo próprio.
export const CITY_MODULES: Record<string, SceneModule> = {};
