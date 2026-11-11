/**
 * 3D Royal Indian Diwali Gift Box Builder & Unboxing Animation.
 * Features:
 * - Multi-part composite model: Velvet red gift hamper box, gold filigree trim,
 *   3D ornate ribbon bow, and pivoting/lifting lid.
 * - Interior magical treasures: Floating gold coins, sweets platter, radiant royal heart,
 *   volumetric golden light beam, and erupting particle fountain.
 * - Interactive unwrap animation with GSAP kinematics.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { createGlowSpriteTexture } from './proceduralTextures';
import { soundManager } from '../audio/soundManager';

export interface GiftBoxInstance {
  group: THREE.Group;
  lidGroup: THREE.Group;
  treasuresGroup: THREE.Group;
  fountainParticles: THREE.Points;
  isOpen: boolean;
  openGift: (onComplete?: () => void) => void;
  closeGift: (onComplete?: () => void) => void;
  toggleGift: () => void;
  update: (delta: number, elapsed: number) => void;
  clickProxy: THREE.Mesh;
}

export function createGiftBox(): GiftBoxInstance {
  const group = new THREE.Group();
  const glowTexture = createGlowSpriteTexture();

  // Materials
  const boxVelvetMat = new THREE.MeshStandardMaterial({
    color: 0x9f1239, // deep royal velvet ruby
    roughness: 0.45,
    metalness: 0.15,
  });

  const goldRibbonMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.2,
    metalness: 0.9,
    envMapIntensity: 2.2,
  });

  const boxInteriorMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.3,
    metalness: 0.6,
  });

  const coinGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.15,
    metalness: 0.95,
  });

  const sweetSilverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // silver vark on kaju katli
    roughness: 0.2,
    metalness: 0.8,
  });

  // 1. Box Base Body (1.4 wide x 1.0 high x 1.4 deep)
  const bodyGeo = new THREE.BoxGeometry(1.4, 0.95, 1.4);
  const bodyMesh = new THREE.Mesh(bodyGeo, boxVelvetMat);
  bodyMesh.position.y = 0.475;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Box golden corner brackets
  const bracketGeo = new THREE.BoxGeometry(0.12, 0.96, 0.12);
  const corners = [
    [-0.7, -0.7],
    [0.7, -0.7],
    [-0.7, 0.7],
    [0.7, 0.7],
  ];
  corners.forEach(([cx, cz]) => {
    const bracket = new THREE.Mesh(bracketGeo, goldRibbonMat);
    bracket.position.set(cx, 0.475, cz);
    group.add(bracket);
  });

  // Vertical & Horizontal Golden Ribbons around body
  const ribbonV1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.96, 1.42), goldRibbonMat);
  ribbonV1.position.y = 0.475;
  group.add(ribbonV1);

  const ribbonV2 = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.96, 0.22), goldRibbonMat);
  ribbonV2.position.y = 0.475;
  group.add(ribbonV2);

  // Plinth rim base
  const baseRim = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), goldRibbonMat);
  baseRim.position.y = 0.04;
  group.add(baseRim);

  // Interior cavity lining (visible when lid opens)
  const interiorGeo = new THREE.BoxGeometry(1.3, 0.88, 1.3);
  const interior = new THREE.Mesh(interiorGeo, boxInteriorMat);
  interior.position.y = 0.52;
  group.add(interior);

  // Internal Warm Radiant Spotlight / PointLight
  const giftLight = new THREE.PointLight(0xffb703, 0, 10.0);
  giftLight.position.set(0, 0.8, 0);
  group.add(giftLight);

  // 2. Box Lid Group (Pivots up and back)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.96, 0);

  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.22, 1.48), boxVelvetMat);
  lidMesh.position.y = 0.11;
  lidMesh.castShadow = true;
  lidGroup.add(lidMesh);

  // Lid golden rim
  const lidRim = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.06, 1.52), goldRibbonMat);
  lidRim.position.y = 0.22;
  lidGroup.add(lidRim);

  // Lid cross ribbons
  const lidRibbonX = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.5), goldRibbonMat);
  lidRibbonX.position.y = 0.11;
  lidGroup.add(lidRibbonX);

  const lidRibbonZ = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.24, 0.24), goldRibbonMat);
  lidRibbonZ.position.y = 0.11;
  lidGroup.add(lidRibbonZ);

  // Ornate 3D Golden Ribbon Bow on Lid top
  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, 0.24, 0);

  // Bow knot center
  const knotGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const knot = new THREE.Mesh(knotGeo, goldRibbonMat);
  bowGroup.add(knot);

  // 4 Torus Bow Loops
  for (let b = 0; b < 4; b++) {
    const angle = (b * Math.PI) / 2 + Math.PI / 4;
    const loopGeo = new THREE.TorusGeometry(0.22, 0.05, 10, 20);
    const loop = new THREE.Mesh(loopGeo, goldRibbonMat);
    loop.position.set(Math.cos(angle) * 0.18, 0.14, Math.sin(angle) * 0.18);
    loop.rotation.y = angle;
    loop.rotation.x = 0.4;
    bowGroup.add(loop);
  }

  // 2 Flowing Ribbon Tails
  [-0.15, 0.15].forEach(tx => {
    const tailGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.45, 8);
    const tail = new THREE.Mesh(tailGeo, goldRibbonMat);
    tail.position.set(tx, 0.1, 0.22);
    tail.rotation.x = 0.6;
    bowGroup.add(tail);
  });

  lidGroup.add(bowGroup);
  group.add(lidGroup);

  // 3. Treasures Group (Hidden inside, elevates and levitates when opened)
  const treasuresGroup = new THREE.Group();
  treasuresGroup.position.set(0, 0.4, 0);
  treasuresGroup.scale.set(0.001, 0.001, 0.001); // starts collapsed inside box
  treasuresGroup.visible = false;

  // A. Floating Golden Mithai (Sweets) Platter
  const platterGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.05, 20);
  const platter = new THREE.Mesh(platterGeo, goldRibbonMat);
  platter.position.y = 0.1;
  treasuresGroup.add(platter);

  // Kaju Katli Diamond Sweets on platter
  for (let s = 0; s < 6; s++) {
    const sa = (s * Math.PI * 2) / 6;
    const sweetGeo = new THREE.BoxGeometry(0.14, 0.04, 0.14);
    sweetGeo.rotateY(Math.PI / 4);
    const sweet = new THREE.Mesh(sweetGeo, sweetSilverMat);
    sweet.position.set(Math.cos(sa) * 0.28, 0.15, Math.sin(sa) * 0.28);
    treasuresGroup.add(sweet);
  }

  // Golden Ladoos in center
  for (let l = 0; l < 3; l++) {
    const la = (l * Math.PI * 2) / 3;
    const ladooGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const ladoo = new THREE.Mesh(ladooGeo, goldRibbonMat);
    ladoo.position.set(Math.cos(la) * 0.1, 0.18, Math.sin(la) * 0.1);
    treasuresGroup.add(ladoo);
  }

  // B. Floating Gold Coins orbiting the gift
  const coinGroup = new THREE.Group();
  const coinCount = 10;
  const coins: THREE.Mesh[] = [];
  for (let c = 0; c < coinCount; c++) {
    const coinGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
    coinGeo.rotateX(Math.PI / 2);
    const coin = new THREE.Mesh(coinGeo, coinGoldMat);
    coinGroup.add(coin);
    coins.push(coin);
  }
  treasuresGroup.add(coinGroup);

  // C. Floating Royal Heart Badge
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0.2);
  heartShape.bezierCurveTo(0.2, 0.45, 0.45, 0.35, 0.45, 0.1);
  heartShape.bezierCurveTo(0.45, -0.15, 0.2, -0.3, 0, -0.45);
  heartShape.bezierCurveTo(-0.2, -0.3, -0.45, -0.15, -0.45, 0.1);
  heartShape.bezierCurveTo(-0.45, 0.35, -0.2, 0.45, 0, 0.2);

  const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  const heartMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48, // royal crimson heart
    emissive: 0x9f1239,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.5,
  });
  const heartMesh = new THREE.Mesh(heartGeo, heartMat);
  heartMesh.scale.set(0.65, 0.65, 0.65);
  heartMesh.position.set(0, 0.85, 0);
  treasuresGroup.add(heartMesh);

  group.add(treasuresGroup);

  // 4. Erupting Magical Spark Fountain Particles
  const fountainCount = 120;
  const fountainGeo = new THREE.BufferGeometry();
  const fountainPos = new Float32Array(fountainCount * 3);
  const fountainVels = new Float32Array(fountainCount * 3);
  const fountainLifetimes = new Float32Array(fountainCount);
  const fountainAges = new Float32Array(fountainCount);

  for (let i = 0; i < fountainCount; i++) {
    fountainPos[i * 3 + 0] = (Math.random() - 0.5) * 0.6;
    fountainPos[i * 3 + 1] = 0.5;
    fountainPos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

    fountainVels[i * 3 + 0] = (Math.random() - 0.5) * 1.5;
    fountainVels[i * 3 + 1] = 2.2 + Math.random() * 3.5; // upward eruption
    fountainVels[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

    fountainLifetimes[i] = 1.0 + Math.random() * 1.2;
    fountainAges[i] = Math.random() * fountainLifetimes[i];
  }

  fountainGeo.setAttribute('position', new THREE.BufferAttribute(fountainPos, 3));
  const fountainMat = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.32,
    color: 0xfef08a,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0,
  });

  const fountainParticles = new THREE.Points(fountainGeo, fountainMat);
  group.add(fountainParticles);

  // 5. Click Proxy Sphere (for raycasting touch & click)
  const clickGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
  const clickMat = new THREE.MeshBasicMaterial({ visible: false });
  const clickProxy = new THREE.Mesh(clickGeo, clickMat);
  clickProxy.position.y = 0.8;
  group.add(clickProxy);

  let isOpen = false;

  const openGift = (onComplete?: () => void) => {
    if (isOpen) return;
    isOpen = true;

    soundManager.playGiftUnwrap();

    // 1. Lid lifts up and rotates backwards smoothly
    gsap.killTweensOf(lidGroup.position);
    gsap.killTweensOf(lidGroup.rotation);

    gsap.to(lidGroup.position, {
      y: 2.3,
      z: -0.9,
      duration: 1.2,
      ease: 'back.out(1.5)',
    });

    gsap.to(lidGroup.rotation, {
      x: -Math.PI * 0.42,
      y: 0.15,
      duration: 1.2,
      ease: 'back.out(1.5)',
      onComplete: () => {
        soundManager.playGiftRevealFanfare();
        if (onComplete) onComplete();
      },
    });

    // 2. Light beam & PointLight flares up
    gsap.to(giftLight, {
      intensity: 4.8,
      duration: 0.8,
      ease: 'power2.out',
    });

    // 3. Treasures emerge & elevate
    treasuresGroup.visible = true;
    gsap.to(treasuresGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.4,
      ease: 'elastic.out(1, 0.6)',
      delay: 0.2,
    });
    gsap.to(treasuresGroup.position, {
      y: 1.15,
      duration: 1.4,
      ease: 'power2.out',
      delay: 0.2,
    });

    // 4. Spark fountain activation
    gsap.to(fountainMat, {
      opacity: 1,
      duration: 0.5,
    });
  };

  const closeGift = (onComplete?: () => void) => {
    if (!isOpen) return;
    isOpen = false;

    // Retract treasures
    gsap.to(treasuresGroup.scale, {
      x: 0.001,
      y: 0.001,
      z: 0.001,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        treasuresGroup.visible = false;
      },
    });
    gsap.to(treasuresGroup.position, {
      y: 0.4,
      duration: 0.6,
    });

    // Turn off light
    gsap.to(giftLight, {
      intensity: 0,
      duration: 0.5,
    });

    // Turn off fountain
    gsap.to(fountainMat, {
      opacity: 0,
      duration: 0.4,
    });

    // Lid closes back
    gsap.to(lidGroup.position, {
      x: 0,
      y: 0.96,
      z: 0,
      duration: 0.9,
      ease: 'bounce.out',
      delay: 0.2,
      onComplete,
    });
    gsap.to(lidGroup.rotation, {
      x: 0,
      y: 0,
      duration: 0.8,
      delay: 0.2,
    });
  };

  const toggleGift = () => {
    if (isOpen) {
      closeGift();
    } else {
      openGift();
    }
  };

  const update = (delta: number, elapsed: number) => {
    // Gentle floating hover kinematics on heart & platter when open
    if (isOpen) {
      heartMesh.position.y = 0.85 + Math.sin(elapsed * 2.5) * 0.08;
      heartMesh.rotation.y = elapsed * 1.2;

      // Orbit gold coins
      for (let i = 0; i < coins.length; i++) {
        const angle = elapsed * 1.5 + (i * Math.PI * 2) / coins.length;
        const radius = 0.65 + Math.sin(elapsed * 3 + i) * 0.05;
        coins[i].position.set(
          Math.cos(angle) * radius,
          0.35 + Math.sin(elapsed * 2 + i) * 0.12,
          Math.sin(angle) * radius
        );
        coins[i].rotation.y = angle + Math.PI / 2;
        coins[i].rotation.z = Math.sin(elapsed * 4 + i) * 0.3;
      }

      // Update erupting spark fountain
      const posAttr = fountainGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < fountainCount; i++) {
        fountainAges[i] += delta;
        if (fountainAges[i] >= fountainLifetimes[i]) {
          fountainAges[i] = 0;
          fountainPos[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
          fountainPos[i * 3 + 1] = 0.5;
          fountainPos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

          fountainVels[i * 3 + 0] = (Math.random() - 0.5) * 1.6;
          fountainVels[i * 3 + 1] = 2.4 + Math.random() * 3.2;
          fountainVels[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
        } else {
          fountainPos[i * 3 + 0] += fountainVels[i * 3 + 0] * delta;
          fountainPos[i * 3 + 1] += fountainVels[i * 3 + 1] * delta;
          fountainPos[i * 3 + 2] += fountainVels[i * 3 + 2] * delta;

          fountainVels[i * 3 + 1] -= 3.0 * delta; // gravity
        }
      }
      posAttr.needsUpdate = true;
    }
  };

  const giftInstance: GiftBoxInstance = {
    group,
    lidGroup,
    treasuresGroup,
    fountainParticles,
    get isOpen() {
      return isOpen;
    },
    openGift,
    closeGift,
    toggleGift,
    update,
    clickProxy,
  };

  (clickProxy as unknown as { __giftInstance: GiftBoxInstance }).__giftInstance = giftInstance;

  return giftInstance;
}
