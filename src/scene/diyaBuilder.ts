/**
 * Diya (Traditional Indian Oil Lamp) 3D Model Builder & Flame Simulation.
 * Realistic 3-part composite model: Terracotta clay body, brass trim, oil pool, cotton wick,
 * animated flickering flame with point light and floating ember particles.
 */
import * as THREE from 'three';
import { createGlowSpriteTexture } from './proceduralTextures';

export interface DiyaInstance {
  group: THREE.Group;
  flameMesh: THREE.Mesh;
  flameLight: THREE.PointLight;
  wickMesh: THREE.Mesh;
  isLit: boolean;
  baseLightIntensity: number;
  flickerSpeed: number;
  flickerOffset: number;
  clickProxy: THREE.Mesh;
  isHero: boolean;
  emberParticles?: THREE.Points;
  emberPositions?: Float32Array;
  emberVelocities?: Float32Array;
}

// Reusable geometries & materials for efficiency
let diyaBowlGeo: THREE.BufferGeometry | null = null;
let diyaOilGeo: THREE.BufferGeometry | null = null;
let diyaWickGeo: THREE.BufferGeometry | null = null;
let diyaFlameGeo: THREE.BufferGeometry | null = null;
let clayMaterial: THREE.MeshStandardMaterial | null = null;
let heroClayMaterial: THREE.MeshStandardMaterial | null = null;
let brassMaterial: THREE.MeshStandardMaterial | null = null;
let oilMaterial: THREE.MeshStandardMaterial | null = null;
let wickMaterial: THREE.MeshStandardMaterial | null = null;
let flameShaderMaterial: THREE.ShaderMaterial | null = null;
let emberMaterial: THREE.PointsMaterial | null = null;

function initSharedResources() {
  if (diyaBowlGeo) return;

  // 1. Terracotta bowl profile using LatheGeometry (authentic traditional Diya curve)
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0.0, 0.0));
  points.push(new THREE.Vector2(0.18, 0.01));
  points.push(new THREE.Vector2(0.32, 0.05));
  points.push(new THREE.Vector2(0.42, 0.12));
  points.push(new THREE.Vector2(0.48, 0.22));
  points.push(new THREE.Vector2(0.50, 0.30));
  points.push(new THREE.Vector2(0.47, 0.32));
  points.push(new THREE.Vector2(0.40, 0.28));
  points.push(new THREE.Vector2(0.30, 0.20));
  points.push(new THREE.Vector2(0.12, 0.12));
  points.push(new THREE.Vector2(0.0, 0.11));

  diyaBowlGeo = new THREE.LatheGeometry(points, 32);
  diyaOilGeo = new THREE.CircleGeometry(0.36, 24);
  diyaOilGeo.rotateX(-Math.PI / 2);

  // Twisted cotton wick
  diyaWickGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.16, 8);

  // Teardrop Flame Geometry
  const flamePoints: THREE.Vector2[] = [];
  flamePoints.push(new THREE.Vector2(0.0, 0.0));
  flamePoints.push(new THREE.Vector2(0.05, 0.04));
  flamePoints.push(new THREE.Vector2(0.09, 0.12));
  flamePoints.push(new THREE.Vector2(0.08, 0.22));
  flamePoints.push(new THREE.Vector2(0.04, 0.32));
  flamePoints.push(new THREE.Vector2(0.01, 0.40));
  flamePoints.push(new THREE.Vector2(0.0, 0.44));
  diyaFlameGeo = new THREE.LatheGeometry(flamePoints, 20);

  // Standard Terracotta Clay Material
  clayMaterial = new THREE.MeshStandardMaterial({
    color: 0xb45309, // deep terracotta burnt amber
    roughness: 0.85,
    metalness: 0.05,
  });

  // Hero Diya with rich gold & polished red clay
  heroClayMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.6,
    metalness: 0.2,
  });

  // Brass trim material
  brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.85,
  });

  // Liquid mustard/sesame oil pool
  oilMaterial = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.05,
    metalness: 0.3,
  });

  // Cotton wick
  wickMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.9,
    metalness: 0.0,
  });

  // Custom Animated Flame Shader with blue base & hot golden core
  const glowTexture = createGlowSpriteTexture();

  flameShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color(0x38bdf8) }, // blue flame base
      uColorMid: { value: new THREE.Color(0xf97316) },  // fiery orange
      uColorTop: { value: new THREE.Color(0xfef08a) },  // brilliant yellow crest
      uTexture: { value: glowTexture },
      uFlicker: { value: 1.0 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uFlicker;
      varying vec2 vUv;
      varying float vHeight;

      void main() {
        vUv = uv;
        vHeight = position.y / 0.44;

        vec3 pos = position;
        // Natural wavering flame wind motion
        float wave = sin(uTime * 12.0 + position.y * 15.0) * 0.03 * vHeight;
        float waveZ = cos(uTime * 9.0 + position.y * 12.0) * 0.02 * vHeight;
        pos.x += wave * uFlicker;
        pos.z += waveZ * uFlicker;
        pos.y *= (0.95 + sin(uTime * 18.0) * 0.08 * uFlicker);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorBase;
      uniform vec3 uColorMid;
      uniform vec3 uColorTop;
      varying vec2 vUv;
      varying float vHeight;

      void main() {
        // Gradient from base (blue) -> mid (orange) -> tip (golden yellow)
        vec3 col = mix(uColorBase, uColorMid, smoothstep(0.0, 0.25, vHeight));
        col = mix(col, uColorTop, smoothstep(0.2, 0.85, vHeight));

        // Edge softening
        float alpha = clamp(1.2 - vHeight * 0.4, 0.0, 1.0);
        gl_FragColor = vec4(col * 1.5, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  // Ember particles material
  emberMaterial = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.12,
    color: 0xfde047,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

/**
 * Builds a single 3D Diya
 */
export function createDiya(isHero = false, startLit = true): DiyaInstance {
  initSharedResources();

  const group = new THREE.Group();

  // 1. Bowl body
  const bowl = new THREE.Mesh(
    diyaBowlGeo!,
    isHero ? heroClayMaterial! : clayMaterial!
  );
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  group.add(bowl);

  // 2. Brass rim accent for hero / decorative diyas
  if (isHero) {
    const rimGeo = new THREE.TorusGeometry(0.48, 0.025, 12, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, brassMaterial!);
    rim.position.y = 0.30;
    group.add(rim);

    // Ornate lotus petal base
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.08, 16);
    const base = new THREE.Mesh(baseGeo, brassMaterial!);
    base.position.y = -0.04;
    group.add(base);
  }

  // 3. Oil pool
  const oil = new THREE.Mesh(diyaOilGeo!, oilMaterial!);
  oil.position.y = 0.22;
  group.add(oil);

  // 4. Cotton wick tilted towards front/lip
  const wick = new THREE.Mesh(diyaWickGeo!, wickMaterial!);
  wick.position.set(0.12, 0.27, 0);
  wick.rotation.z = -0.35;
  group.add(wick);

  // 5. Animated 3D Flame
  // Clone shader material so each can flicker independently
  const flameMat = flameShaderMaterial!.clone();
  const flameMesh = new THREE.Mesh(diyaFlameGeo!, flameMat);
  flameMesh.position.set(0.15, 0.33, 0);
  group.add(flameMesh);

  // 6. Warm Point Light
  const lightColor = 0xffa040;
  const baseIntensity = isHero ? 3.5 : 1.2;
  const lightDistance = isHero ? 8.0 : 4.5;
  const flameLight = new THREE.PointLight(lightColor, startLit ? baseIntensity : 0, lightDistance);
  flameLight.position.set(0.15, 0.5, 0);
  flameLight.castShadow = isHero; // Only hero casts shadow for high performance
  if (isHero) {
    flameLight.shadow.bias = -0.001;
    flameLight.shadow.mapSize.width = 1024;
    flameLight.shadow.mapSize.height = 1024;
  }
  group.add(flameLight);

  // 7. Interactive Invisible Raycast Collision Proxy (for easy mobile touch & desktop click)
  const hitGeo = new THREE.SphereGeometry(isHero ? 0.7 : 0.45, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const clickProxy = new THREE.Mesh(hitGeo, hitMat);
  clickProxy.position.y = 0.25;
  group.add(clickProxy);

  // 8. Floating Golden Embers (Hero Diya)
  let emberParticles: THREE.Points | undefined;
  let emberPositions: Float32Array | undefined;
  let emberVelocities: Float32Array | undefined;

  if (isHero) {
    const emberCount = 35;
    const pos = new Float32Array(emberCount * 3);
    const vel = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      pos[i * 3 + 0] = 0.15 + (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 1] = 0.4 + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.08;
      vel[i * 3 + 1] = 0.25 + Math.random() * 0.35;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    emberParticles = new THREE.Points(emberGeo, emberMaterial!);
    group.add(emberParticles);

    emberPositions = pos;
    emberVelocities = vel;
  }

  // Initial lit state
  flameMesh.visible = startLit;
  if (!startLit) {
    flameLight.intensity = 0;
  }

  const diyaInstance: DiyaInstance = {
    group,
    flameMesh,
    flameLight,
    wickMesh: wick,
    isLit: startLit,
    baseLightIntensity: baseIntensity,
    flickerSpeed: 3.5 + Math.random() * 3.0,
    flickerOffset: Math.random() * 100,
    clickProxy,
    isHero,
    emberParticles,
    emberPositions,
    emberVelocities,
  };

  // Associate proxy with the instance for fast raycast lookup
  (clickProxy as unknown as { __diyaInstance: DiyaInstance }).__diyaInstance = diyaInstance;

  return diyaInstance;
}

/**
 * Updates flame flickers, materials and floating embers
 */
export function updateDiyas(diyas: DiyaInstance[], delta: number, elapsed: number) {
  for (let i = 0; i < diyas.length; i++) {
    const d = diyas[i];
    if (!d.isLit) {
      if (d.flameMesh.visible) d.flameMesh.visible = false;
      if (d.flameLight.intensity > 0) d.flameLight.intensity = 0;
      if (d.emberParticles) d.emberParticles.visible = false;
      continue;
    }

    d.flameMesh.visible = true;
    if (d.emberParticles) d.emberParticles.visible = true;

    // Organic flame flicker calculation
    const noise = Math.sin(elapsed * d.flickerSpeed + d.flickerOffset) * 0.5 +
                  Math.sin(elapsed * d.flickerSpeed * 2.3 + d.flickerOffset) * 0.3 +
                  (Math.random() - 0.5) * 0.2;

    const flickerFactor = 0.88 + noise * 0.22;

    // Update light intensity
    d.flameLight.intensity = d.baseLightIntensity * flickerFactor;

    // Update shader uniforms
    const mat = d.flameMesh.material as THREE.ShaderMaterial;
    if (mat.uniforms) {
      mat.uniforms.uTime.value = elapsed;
      mat.uniforms.uFlicker.value = flickerFactor;
    }

    // Update hero ember particles
    if (d.emberParticles && d.emberPositions && d.emberVelocities) {
      const posAttr = d.emberParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const count = d.emberPositions.length / 3;

      for (let j = 0; j < count; j++) {
        d.emberPositions[j * 3 + 1] += d.emberVelocities[j * 3 + 1] * delta;
        d.emberPositions[j * 3 + 0] += d.emberVelocities[j * 3 + 0] * delta + Math.sin(elapsed * 4 + j) * 0.002;
        d.emberPositions[j * 3 + 2] += d.emberVelocities[j * 3 + 2] * delta;

        // Reset if too high
        if (d.emberPositions[j * 3 + 1] > 1.4) {
          d.emberPositions[j * 3 + 1] = 0.38;
          d.emberPositions[j * 3 + 0] = 0.15 + (Math.random() - 0.5) * 0.1;
          d.emberPositions[j * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }
      }
      posAttr.needsUpdate = true;
    }
  }
}
