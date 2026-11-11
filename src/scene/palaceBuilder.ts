/**
 * Grand Traditional Indian Palace & Temple Environment Builder.
 * Features:
 * - Polished Indian marble courtyard with central Rangoli
 * - Multi-tiered Rajasthani / Mughal palace architecture (arches, domes, chhatris, kalash pinnacles)
 * - Ornate carved Jali screens with warm glowing inner temple
 * - Hanging Akash Kandils (star lanterns) with gentle sway
 * - Marigold garlands (torans) along arches and columns
 * - Golden fairy string lights
 * - Swirling marigold and rose flower petals
 */
import * as THREE from 'three';
import {
  createRangoliTexture,
  createMarbleFloorTexture,
  createJaliLatticeTexture,
  createPetalTexture,
  createGlowSpriteTexture,
} from './proceduralTextures';

export interface PalaceEnvironment {
  group: THREE.Group;
  lanterns: THREE.Group[];
  petalSystem: THREE.Points;
  updatePetals: (delta: number, elapsed: number) => void;
  updateLanterns: (elapsed: number) => void;
  rangoliMesh: THREE.Mesh;
}

export function buildPalaceEnvironment(): PalaceEnvironment {
  const envGroup = new THREE.Group();

  // 1. Textures & Materials
  const marbleTexture = createMarbleFloorTexture();
  const rangoliTexture = createRangoliTexture();
  const jaliTexture = createJaliLatticeTexture();
  const glowTexture = createGlowSpriteTexture();

  // Materials
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: marbleTexture,
    roughness: 0.15,
    metalness: 0.2,
    envMapIntensity: 1.2,
  });

  const sandstoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd97706, // warm golden sandstone
    roughness: 0.75,
    metalness: 0.1,
  });

  const palaceDarkMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a3412, // terracotta red stone
    roughness: 0.8,
    metalness: 0.05,
  });

  const goldTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.2,
    metalness: 0.9,
    envMapIntensity: 2.0,
  });

  const marbleWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.35,
    metalness: 0.1,
  });

  const jaliMaterial = new THREE.MeshStandardMaterial({
    map: jaliTexture,
    roughness: 0.6,
    metalness: 0.2,
  });

  // 2. Courtyard Ground
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
  floorMesh.receiveShadow = true;
  envGroup.add(floorMesh);

  // 3. Central Sacred Rangoli
  const rangoliGeo = new THREE.CircleGeometry(3.6, 64);
  rangoliGeo.rotateX(-Math.PI / 2);
  const rangoliMaterial = new THREE.MeshBasicMaterial({
    map: rangoliTexture,
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const rangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMaterial);
  rangoliMesh.position.set(0, 0.02, 0); // slightly above ground to prevent Z-fighting
  envGroup.add(rangoliMesh);

  // 4. Hero Diya Pedestal (Carved Octagonal Lotus Marble Plinth)
  const pedestalGeo = new THREE.CylinderGeometry(0.85, 1.0, 0.22, 16);
  const pedestal = new THREE.Mesh(pedestalGeo, marbleWhiteMaterial);
  pedestal.position.set(0, 0.11, 0);
  pedestal.receiveShadow = true;
  pedestal.castShadow = true;

  const pedestalRimGeo = new THREE.TorusGeometry(0.88, 0.04, 12, 32);
  pedestalRimGeo.rotateX(Math.PI / 2);
  const pedestalRim = new THREE.Mesh(pedestalRimGeo, goldTrimMaterial);
  pedestalRim.position.set(0, 0.21, 0);
  pedestal.add(pedestalRim);
  envGroup.add(pedestal);

  // 5. Grand Temple / Palace Façade in Background (Z = -14)
  const palaceGroup = new THREE.Group();
  palaceGroup.position.set(0, 0, -14);

  // Main Terrace Platform
  const terraceGeo = new THREE.BoxGeometry(32, 1.2, 10);
  const terrace = new THREE.Mesh(terraceGeo, sandstoneMaterial);
  terrace.position.set(0, 0.6, 0);
  terrace.receiveShadow = true;
  palaceGroup.add(terrace);

  // Terrace Steps leading down to courtyard
  for (let s = 1; s <= 3; s++) {
    const stepGeo = new THREE.BoxGeometry(14, 0.2, 0.8 * s);
    const step = new THREE.Mesh(stepGeo, sandstoneMaterial);
    step.position.set(0, 0.6 - s * 0.2, 5 + (s * 0.4));
    step.receiveShadow = true;
    palaceGroup.add(step);
  }

  // Central Portal (Main Archway Sanctum)
  const portalWallGeo = new THREE.BoxGeometry(12, 9, 3);
  const portalWall = new THREE.Mesh(portalWallGeo, palaceDarkMaterial);
  portalWall.position.set(0, 5.7, 0);
  portalWall.castShadow = true;
  palaceGroup.add(portalWall);

  // Inner Sanctum Arch Cutout with warm glowing god statue / golden diya glow inside
  const archInnerGeo = new THREE.BoxGeometry(6, 6.5, 2.5);
  const archInnerMat = new THREE.MeshStandardMaterial({
    color: 0x1a0f08,
    roughness: 0.9,
  });
  const archInner = new THREE.Mesh(archInnerGeo, archInnerMat);
  archInner.position.set(0, 4.5, 0.4);
  palaceGroup.add(archInner);

  // Inner Sanctum warm divine light
  const sanctumLight = new THREE.PointLight(0xffaa33, 4.0, 16);
  sanctumLight.position.set(0, 4.8, 0);
  palaceGroup.add(sanctumLight);

  // Inner sanctum golden deity silhouette/pillar
  const deityGeo = new THREE.CylinderGeometry(0.35, 0.5, 2.2, 16);
  const deity = new THREE.Mesh(deityGeo, goldTrimMaterial);
  deity.position.set(0, 2.8, 0);
  palaceGroup.add(deity);

  // Jali lattice screen inside upper arch
  const jaliMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), jaliMaterial);
  jaliMesh.position.set(0, 6.6, 1.4);
  palaceGroup.add(jaliMesh);

  // Ornate Colonnade Pillars across Palace
  const pillarPositions = [-12, -8, -4, 4, 8, 12];
  pillarPositions.forEach(px => {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(px, 1.2, 2.5);

    // Square base plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), sandstoneMaterial);
    plinth.position.y = 0.4;
    plinth.castShadow = true;
    pillarGroup.add(plinth);

    // Carved fluted column shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 6.5, 16), marbleWhiteMaterial);
    shaft.position.y = 4.05;
    shaft.castShadow = true;
    pillarGroup.add(shaft);

    // Gold rings on column
    [2.2, 4.2, 6.0].forEach(ry => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 20), goldTrimMaterial);
      ring.position.y = ry;
      ring.rotateX(Math.PI / 2);
      pillarGroup.add(ring);
    });

    // Sculpted Rajput Bracket Capital
    const capital = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), sandstoneMaterial);
    capital.position.y = 7.55;
    capital.castShadow = true;
    pillarGroup.add(capital);

    palaceGroup.add(pillarGroup);
  });

  // Palace Roof Cornice & Golden Railings
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(34, 0.6, 5), goldTrimMaterial);
  cornice.position.set(0, 9.8, 0.5);
  cornice.castShadow = true;
  palaceGroup.add(cornice);

  // Royal Chhatris (Domes / Pavilions) on Roof
  const domeX = [-11, 0, 11];
  domeX.forEach((dx, idx) => {
    const isCenter = idx === 1;
    const chhatriGroup = new THREE.Group();
    chhatriGroup.position.set(dx, 10.1, 0.5);

    // Chhatri 4 small pillars
    const cSize = isCenter ? 2.8 : 2.0;
    const cHeight = isCenter ? 3.0 : 2.2;

    const corners = [
      [-cSize / 2, -cSize / 2],
      [cSize / 2, -cSize / 2],
      [-cSize / 2, cSize / 2],
      [cSize / 2, cSize / 2],
    ];

    corners.forEach(([cx, cz]) => {
      const cPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, cHeight, 10),
        marbleWhiteMaterial
      );
      cPillar.position.set(cx, cHeight / 2, cz);
      chhatriGroup.add(cPillar);
    });

    // Ornate traditional ribbed dome (shikhara)
    const domeRadius = isCenter ? 2.2 : 1.6;
    const domePoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const angle = (t * Math.PI) / 2;
      const x = Math.sin(angle) * domeRadius * (1.0 - t * 0.25);
      const y = Math.cos(angle) * domeRadius * 1.35;
      domePoints.push(new THREE.Vector2(x, -y + domeRadius * 1.35));
    }
    const domeGeo = new THREE.LatheGeometry(domePoints, 24);
    const dome = new THREE.Mesh(domeGeo, goldTrimMaterial);
    dome.position.set(0, cHeight, 0);
    dome.castShadow = true;
    chhatriGroup.add(dome);

    // Golden Kalash pinnacle on dome top
    const kalashGeo = new THREE.CylinderGeometry(0.04, 0.25, 1.2, 12);
    const kalash = new THREE.Mesh(kalashGeo, goldTrimMaterial);
    kalash.position.set(0, cHeight + (isCenter ? 3.3 : 2.5), 0);
    chhatriGroup.add(kalash);

    palaceGroup.add(chhatriGroup);
  });

  envGroup.add(palaceGroup);

  // 6. Hanging Akash Kandils (Traditional Indian Diwali Star Lanterns)
  const lanterns: THREE.Group[] = [];
  const lanternX = [-9, -4.5, 0, 4.5, 9];

  lanternX.forEach(lx => {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(lx, 7.8, -10.5);

    // Brass chain hanging from ceiling
    const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 6);
    const chainMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8 });
    const chain = new THREE.Mesh(chainGeo, chainMat);
    chain.position.y = -1.1;
    lanternGroup.add(chain);

    // Lantern Core (Rhombic / Star body)
    const lanternBodyGeo = new THREE.OctahedronGeometry(0.55, 1);
    const lanternBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const body = new THREE.Mesh(lanternBodyGeo, lanternBodyMat);
    body.position.y = -2.5;
    lanternGroup.add(body);

    // Hanging paper tassels (kandil streamers)
    for (let t = 0; t < 6; t++) {
      const a = (t * Math.PI * 2) / 6;
      const tasselGeo = new THREE.CylinderGeometry(0.02, 0.06, 0.9, 6);
      const tasselMat = new THREE.MeshStandardMaterial({
        color: t % 2 === 0 ? 0xe11d48 : 0xfbbf24,
      });
      const tassel = new THREE.Mesh(tasselGeo, tasselMat);
      tassel.position.set(Math.cos(a) * 0.25, -3.2, Math.sin(a) * 0.25);
      lanternGroup.add(tassel);
    }

    // Warm lantern point light
    const lanternLight = new THREE.PointLight(0xff9922, 1.2, 7.0);
    lanternLight.position.set(0, -2.5, 0);
    lanternGroup.add(lanternLight);

    envGroup.add(lanternGroup);
    lanterns.push(lanternGroup);
  });

  // 7. Golden Decorative Fairy String Lights draped along palace front
  const stringLightsGeo = new THREE.BufferGeometry();
  const stringCount = 180;
  const stringPositions = new Float32Array(stringCount * 3);

  for (let i = 0; i < stringCount; i++) {
    const t = i / stringCount;
    const x = -14 + t * 28;
    // Catenary sag curve between pillars
    const cycle = (t * 5) % 1;
    const sag = Math.sin(cycle * Math.PI) * 0.7;
    const y = 8.2 - sag;
    const z = -11.5 + Math.sin(t * 12) * 0.2;

    stringPositions[i * 3 + 0] = x;
    stringPositions[i * 3 + 1] = y;
    stringPositions[i * 3 + 2] = z;
  }
  stringLightsGeo.setAttribute('position', new THREE.BufferAttribute(stringPositions, 3));
  const stringLightsMat = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.18,
    color: 0xfef08a,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const stringLights = new THREE.Points(stringLightsGeo, stringLightsMat);
  envGroup.add(stringLights);

  // 8. Floating Flower Petals System (Marigold & Rose petals swirling in the air)
  const petalCount = 350;
  const petalGeo = new THREE.BufferGeometry();
  const petalPos = new Float32Array(petalCount * 3);
  const petalVels = new Float32Array(petalCount * 3);
  const petalRotSpeeds = new Float32Array(petalCount);

  for (let i = 0; i < petalCount; i++) {
    petalPos[i * 3 + 0] = (Math.random() - 0.5) * 26;
    petalPos[i * 3 + 1] = Math.random() * 9;
    petalPos[i * 3 + 2] = (Math.random() - 0.5) * 24;

    petalVels[i * 3 + 0] = (Math.random() - 0.5) * 0.3;
    petalVels[i * 3 + 1] = -(0.18 + Math.random() * 0.32); // gentle falling
    petalVels[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

    petalRotSpeeds[i] = 1.0 + Math.random() * 2.5;
  }

  petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));

  const petalTexture = createPetalTexture(false); // marigold saffron
  const petalMaterial = new THREE.PointsMaterial({
    map: petalTexture,
    size: 0.28,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const petalSystem = new THREE.Points(petalGeo, petalMaterial);
  envGroup.add(petalSystem);

  // Animation update helpers
  const updatePetals = (delta: number, elapsed: number) => {
    const positions = petalGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < petalCount; i++) {
      // Wind swirl
      const windX = Math.sin(elapsed * 0.8 + petalPos[i * 3 + 1]) * 0.4;
      const windZ = Math.cos(elapsed * 0.6 + petalPos[i * 3 + 0]) * 0.3;

      petalPos[i * 3 + 0] += (petalVels[i * 3 + 0] + windX) * delta;
      petalPos[i * 3 + 1] += petalVels[i * 3 + 1] * delta;
      petalPos[i * 3 + 2] += (petalVels[i * 3 + 2] + windZ) * delta;

      // Wrap around when touching ground
      if (petalPos[i * 3 + 1] < 0.05) {
        petalPos[i * 3 + 1] = 8.5 + Math.random() * 2.0;
        petalPos[i * 3 + 0] = (Math.random() - 0.5) * 26;
        petalPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
      }
    }
    positions.needsUpdate = true;
  };

  const updateLanterns = (elapsed: number) => {
    lanterns.forEach((lantern, idx) => {
      // Gentle wind swaying
      const sway = Math.sin(elapsed * 1.5 + idx * 1.2) * 0.08;
      const swayZ = Math.cos(elapsed * 1.2 + idx * 0.9) * 0.06;
      lantern.rotation.z = sway;
      lantern.rotation.x = swayZ;
    });
  };

  return {
    group: envGroup,
    lanterns,
    petalSystem,
    updatePetals,
    updateLanterns,
    rangoliMesh,
  };
}
