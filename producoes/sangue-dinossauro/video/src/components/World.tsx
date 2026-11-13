import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { AMBER, BONE, CANAL, DINO_Z, DIORAMA, DNA, HEME, HOURGLASS, MAP, MINE, MUSEUM, SECTION, SPLIT } from "../data/sangue";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { BrazilMap, brPos } from "./Apagao";
import { Aratasaurus } from "./Dino";
import { Person, personLook } from "./Person";
import { AmberMosquito, BloodDrop, BoneSection, CanalClose, CretaceousDiorama, DNAHelix, FossilLeg, GypsumMine, Heme, Hourglass, MuseumFacade, RBC } from "./Sangue";
import { MascotFromTracks } from "./Mascot";

// Mundos do "sangue de dinossauro": diorama do Cretáceo, mapa, mina, museu, osso (corte, canal, heme) e DNA/âmbar.
// Tudo lê o estado de track("alvo.prop", frameGlobal). Posições em data/sangue.ts.

/** Luz que acompanha o alvo da câmera (a sombra cobre só o que está em quadro). */
export const KolaLighting: React.FC = () => {
  const f = useCurrentFrame();
  const pose = cameraPoseAt(f);
  const d = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const ext = clamp(d * 0.55, 0.4, 12);
  const myth = 0;
  const k = 1 - 0.3 * myth;
  const t = pose.target;
  const L: Vec3 = [t[0] + ext * 1.2, t[1] + ext * 2.2, t[2] + ext * 1.4];
  return (
    <>
      <ambientLight intensity={LIGHTING.ambient * k} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity * k]} />
      <directionalLight
        position={L}
        target-position={t}
        intensity={LIGHTING.key.intensity * k}
        color={new Color(LIGHTING.key.color).lerp(new Color("#ff9a7a"), myth * 0.5)}
        castShadow
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-ext}
        shadow-camera-near={0.01}
        shadow-camera-far={ext * 8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02 * Math.max(0.05, ext / 4)}
        shadow-radius={3}
      />
      <directionalLight position={LIGHTING.fill.position} intensity={LIGHTING.fill.intensity * k} color={LIGHTING.fill.color} />
      <directionalLight position={LIGHTING.rim.position} intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} />
    </>
  );
};


const show = (k: string, f: number) => track(`${k}.show`, f) > 0.5;

const Diorama: React.FC<{ f: number }> = ({ f }) => {
  const reveal = track("dino.reveal", f, 1);
  const ghost = track("dino.ghost", f);
  const person = track("person.show", f);
  return (
    <group position={DIORAMA}>
      <CretaceousDiorama f={f} />
      <group position={[track("dino.x", f, -1.4), 0, DINO_Z]}>
        <Aratasaurus frame={f} walk={track("dino.walk", f)} feathers={1} ghost={Math.max(ghost, 1 - clamp(reveal, 0, 1))} />
      </group>
      {person > 0.01 ? <Person {...personLook(7)} frame={f} position={[3.0, 0, -0.4]} scale={(1.7 / 1.8) * clamp(person, 0, 1)} rotY={-0.4} seed={7} /> : null}
    </group>
  );
};

const MapWorld: React.FC<{ f: number }> = ({ f }) => {
  const ce = brPos("CE");
  const k = track("ce.pulse", f);
  return (
    <group position={MAP}>
      <BrazilMap f={f} />
      {k > 0.01
        ? [0, 1].map((i) => {
            const ph = (f * 0.03 + i * 0.5) % 1;
            return (
              <mesh key={i} position={[ce[0], 0.2, ce[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={(0.3 + ph * 1.6) * clamp(k, 0, 1)}>
                <ringGeometry args={[0.85, 1, 40]} />
                <meshBasicMaterial color="#ff4a3d" transparent opacity={1 - ph} toneMapped={false} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

const BoneWorld: React.FC<{ f: number }> = ({ f }) => {
  const sec = track("section.show", f);
  const split = track("split.show", f);
  return (
    <group>
      <group position={BONE}>
        <FossilLeg glow={track("bone.glow", f)} />
      </group>
      {sec > 0.01 ? (
        <group position={SECTION} rotation={[Math.PI / 2, 0, 0]} scale={clamp(sec, 0, 1)}>
          <BoneSection f={f} flow={track("canals.flow", f)} />
        </group>
      ) : null}
      <group position={CANAL}>
        <CanalClose f={f} rbc={track("rbc.show", f)} stone={track("rbc.stone", f)} />
        <group position={[0.4, 0.3, 1.6]} scale={0.7}>
          <BloodDrop show={track("drop.show", f)} brk={track("drop.break", f)} />
        </group>
      </group>
      {track("heme.show", f) > 0.01 ? (
        <group position={HEME} scale={clamp(track("heme.show", f), 0, 1)}>
          <Heme f={f} ghost={track("heme.ghost", f)} o2={track("o2.dock", f)} />
        </group>
      ) : null}
      {split > 0.01 ? (
        <group position={SPLIT} scale={clamp(split, 0, 1)}>
          <group position={[-1.5, 0, 0]} rotation={[0.25, track("rbcA.spin", f) * Math.PI, 0]}>
            <RBC kind="domed" s={1.15} />
          </group>
          <group position={[1.5, 0, 0]} rotation={[0.25, track("rbcB.spin", f) * Math.PI, 0]}>
            <RBC kind="concave" s={1.15} />
          </group>
        </group>
      ) : null}
    </group>
  );
};

const DNAWorld: React.FC<{ f: number }> = ({ f }) => {
  const d = track("dna.show", f);
  const h = track("hourglass.show", f);
  const a = track("amber.show", f);
  const frost = track("frost.show", f);
  return (
    <group>
      {d > 0.01 ? (
        <group position={DNA} scale={clamp(d, 0, 1)}>
          <DNAHelix f={f} decay={track("dna.decay", f)} />
        </group>
      ) : null}
      {h > 0.01 ? (
        <group position={HOURGLASS} scale={clamp(h, 0, 1) * 0.9}>
          <Hourglass f={f} flip={track("hourglass.flip", f)} />
        </group>
      ) : null}
      {frost > 0.01
        ? Array.from({ length: 40 }, (_, i) => {
            const ph = (f * 0.004 + i / 40) % 1;
            return (
              <mesh key={i} position={[DNA[0] + Math.sin(i * 7.3) * 3, DNA[1] + 2.5 - ph * 5, DNA[2] + Math.cos(i * 3.1) * 2]} scale={0.06 * clamp(frost, 0, 1)}>
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#cfe8ff" transparent opacity={0.8} />
              </mesh>
            );
          })
        : null}
      {a > 0.01 ? (
        <group position={AMBER} scale={clamp(a, 0, 1) * 1.2}>
          <AmberMosquito f={f} />
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("diorama", f) ? <Diorama f={f} /> : null}
      {show("map", f) ? <MapWorld f={f} /> : null}
      {show("mine", f) ? (
        <group position={MINE}>
          <GypsumMine fossil={track("fossil.rise", f)} />
        </group>
      ) : null}
      {show("museum", f) ? (
        <group position={MUSEUM}>
          <MuseumFacade f={f} fire={track("fire.level", f)} />
        </group>
      ) : null}
      {show("bone", f) ? <BoneWorld f={f} /> : null}
      {show("dna", f) ? <DNAWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
