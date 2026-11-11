/**
 * 3D Golden Floating Typography for 'HAPPY DIWALI'
 * Features:
 * - High-res metallic golden typography with glowing edges and sparkling particle aura
 * - Subtitle plaque: 'May your life shine brighter than a thousand diyas!'
 * - Floating hover kinematics (sinusoidal levitation & gentle camera tilt)
 * - Orbiting golden star dust particles
 */
import * as THREE from 'three';
import { createGlowSpriteTexture } from './proceduralTextures';

export interface GoldTypography {
  group: THREE.Group;
  update: (delta: number, elapsed: number) => void;
  setVisible: (visible: boolean) => void;
}

export function createGoldTypography(): GoldTypography {
  const group = new THREE.Group();
  group.position.set(0, 11.5, -8.5);

  // 1. Generate High-Fidelity Golden Metallic Typography Texture on Canvas
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, width, height);

  // Outer ambient golden glow
  const glowGrad = ctx.createRadialGradient(
    width / 2, height * 0.38, 100,
    width / 2, height * 0.38, 800
  );
  glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
  glowGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Draw main "HAPPY DIWALI" text with deep metallic bevels and radiant gold
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontTitle = 'bold 128px "Cinzel", "Times New Roman", serif';
  ctx.font = fontTitle;

  const textX = width / 2;
  const textY = height * 0.36;

  // Shadow passes for 3D extrusion illusion
  for (let s = 14; s >= 1; s--) {
    ctx.fillStyle = `rgba(120, 53, 15, ${0.12 + (14 - s) * 0.04})`;
    ctx.fillText('DIWALI GIFT SURPRISE', textX, textY + s * 2.2);
  }

  // Golden stroke outline
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#78350f';
  ctx.strokeText('DIWALI GIFT SURPRISE', textX, textY);

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#fbbf24';
  ctx.strokeText('DIWALI GIFT SURPRISE', textX, textY);

  // Metallic Gold Gradient Fill
  const goldGrad = ctx.createLinearGradient(0, textY - 90, 0, textY + 90);
  goldGrad.addColorStop(0.0, '#ffffff');
  goldGrad.addColorStop(0.2, '#fef08a');
  goldGrad.addColorStop(0.45, '#f59e0b');
  goldGrad.addColorStop(0.75, '#b45309');
  goldGrad.addColorStop(0.9, '#fde047');
  goldGrad.addColorStop(1.0, '#ca8a04');

  ctx.fillStyle = goldGrad;
  ctx.fillText('DIWALI GIFT SURPRISE', textX, textY);

  // Specular sheen highlight across center
  ctx.save();
  ctx.beginPath();
  ctx.rect(textX - 700, textY - 70, 1400, 45);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('DIWALI GIFT SURPRISE', textX, textY);
  ctx.restore();

  // Decorative Golden Filigree Flankers & Stars
  const drawOrnament = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(6, -6);
    ctx.lineTo(20, 0);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 20);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-6, -6);
    ctx.closePath();
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.restore();
  };

  drawOrnament(textX - 720, textY);
  drawOrnament(textX + 720, textY);

  // Subtitle acknowledging Diwali is over but special gift shines forever
  ctx.font = '500 42px "Plus Jakarta Sans", sans-serif';
  const subY = height * 0.62;

  // Subtitle ribbon glow
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.fillText('Special gift from Badrinath R', textX, subY);

  // Subtitle underline ornament
  ctx.beginPath();
  ctx.moveTo(textX - 350, subY + 36);
  ctx.lineTo(textX + 350, subY + 36);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  drawOrnament(textX, subY + 36);

  // Create Three.js Texture & Quad Mesh
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const planeGeo = new THREE.PlaneGeometry(16, 8);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.98,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const textMesh = new THREE.Mesh(planeGeo, planeMat);
  group.add(textMesh);

  // 2. Orbiting Golden Sparkle Dust Particles around the 3D Text
  const glowTexture = createGlowSpriteTexture();
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const particleRadii = new Float32Array(particleCount);
  const particleAngles = new Float32Array(particleCount);
  const particleSpeeds = new Float32Array(particleCount);
  const particleYOffsets = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particleRadii[i] = 4.0 + Math.random() * 5.0;
    particleAngles[i] = Math.random() * Math.PI * 2;
    particleSpeeds[i] = (Math.random() - 0.5) * 0.8;
    particleYOffsets[i] = (Math.random() - 0.5) * 3.5;

    positions[i * 3 + 0] = Math.cos(particleAngles[i]) * particleRadii[i];
    positions[i * 3 + 1] = particleYOffsets[i];
    positions[i * 3 + 2] = Math.sin(particleAngles[i]) * 1.5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.28,
    color: 0xfef08a,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const sparklePoints = new THREE.Points(particleGeo, particleMat);
  group.add(sparklePoints);

  const initialY = group.position.y;

  const update = (delta: number, elapsed: number) => {
    // Gentle levitation floating
    group.position.y = initialY + Math.sin(elapsed * 1.4) * 0.25;
    group.rotation.y = Math.sin(elapsed * 0.6) * 0.04;

    // Update sparkling orbiters
    const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < particleCount; i++) {
      particleAngles[i] += particleSpeeds[i] * delta;
      positions[i * 3 + 0] = Math.cos(particleAngles[i]) * particleRadii[i];
      positions[i * 3 + 1] = particleYOffsets[i] + Math.sin(elapsed * 2.0 + i) * 0.2;
      positions[i * 3 + 2] = Math.sin(particleAngles[i]) * 2.0;
    }
    posAttr.needsUpdate = true;
  };

  const setVisible = (visible: boolean) => {
    group.visible = visible;
  };

  return {
    group,
    update,
    setVisible,
  };
}
