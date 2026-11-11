/**
 * Procedural texture generators for Diwali 3D Scene.
 * 100% code-generated with HTML5 2D Canvas.
 * Zero external asset dependencies / zero 404s.
 */
import * as THREE from 'three';

/**
 * Creates an authentic, intricate Rangoli Mandala canvas texture
 */
export function createRangoliTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Background - transparent circle
  ctx.clearRect(0, 0, size, size);

  // Outer glow ring
  const grad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.48);
  grad.addColorStop(0, 'rgba(255, 180, 0, 0.25)');
  grad.addColorStop(0.7, 'rgba(230, 50, 70, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Concentric decorative rings
  const drawConcentricRing = (radius: number, color: string, width: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };

  // Outer border with lotus scalloped petals
  const outerPetalCount = 24;
  const rOuter = size * 0.44;
  for (let i = 0; i < outerPetalCount; i++) {
    const angle = (i * Math.PI * 2) / outerPetalCount;
    const nextAngle = ((i + 1) * Math.PI * 2) / outerPetalCount;
    const midAngle = (angle + nextAngle) / 2;

    const x1 = cx + Math.cos(angle) * (rOuter - 30);
    const y1 = cy + Math.sin(angle) * (rOuter - 30);
    const x2 = cx + Math.cos(nextAngle) * (rOuter - 30);
    const y2 = cy + Math.sin(nextAngle) * (rOuter - 30);
    const xm = cx + Math.cos(midAngle) * (rOuter + 25);
    const ym = cy + Math.sin(midAngle) * (rOuter + 25);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(xm, ym, x2, y2);
    ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#f59e0b'; // vermilion red & amber gold
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Small dot at peak
    ctx.beginPath();
    ctx.arc(xm, ym, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // Inner ring band
  drawConcentricRing(size * 0.38, '#f59e0b', 12);
  drawConcentricRing(size * 0.36, '#ffffff', 4);
  drawConcentricRing(size * 0.34, '#065f46', 10); // emerald green

  // 16 Petals Lotus Layer
  const petals = 16;
  const rMid = size * 0.28;
  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Lotus petal shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(45, rMid * 0.4, 40, rMid * 0.8, 0, rMid);
    ctx.bezierCurveTo(-40, rMid * 0.8, -45, rMid * 0.4, 0, 0);
    ctx.fillStyle = i % 2 === 0 ? '#e11d48' : '#d97706'; // rose & turmeric
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Inner petal teardrop
    ctx.beginPath();
    ctx.moveTo(0, rMid * 0.2);
    ctx.bezierCurveTo(18, rMid * 0.5, 15, rMid * 0.7, 0, rMid * 0.85);
    ctx.bezierCurveTo(-15, rMid * 0.7, -18, rMid * 0.5, 0, rMid * 0.2);
    ctx.fillStyle = '#fde047';
    ctx.fill();

    ctx.restore();
  }

  // Intermediate floral star
  drawConcentricRing(size * 0.18, '#ffffff', 5);
  drawConcentricRing(size * 0.16, '#9333ea', 12); // royal purple

  // Center 8-petal golden lotus core
  const centerPetals = 8;
  const rCore = size * 0.14;
  for (let i = 0; i < centerPetals; i++) {
    const angle = (i * Math.PI * 2) / centerPetals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(24, rCore * 0.5, 20, rCore * 0.8, 0, rCore);
    ctx.bezierCurveTo(-20, rCore * 0.8, -24, rCore * 0.5, 0, 0);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  // Golden Om/Diya center sunburst
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // White traditional rice flour dots (kolam/rangoli dots)
  for (let r = size * 0.08; r <= size * 0.42; r += 45) {
    const count = Math.floor((r * 2 * Math.PI) / 36);
    for (let i = 0; i < count; i++) {
      const a = (i * Math.PI * 2) / count;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates dark polished Indian marble courtyard floor with gold veining & tile joints
 */
export function createMarbleFloorTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian/emerald dark marble base
  ctx.fillStyle = '#0b0c10';
  ctx.fillRect(0, 0, size, size);

  // Subtle tonal marble clouding
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 60 + Math.random() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, 'rgba(25, 28, 38, 0.15)');
    g.addColorStop(1, 'rgba(11, 12, 16, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Golden and bronze marble veins
  ctx.lineWidth = 1.8;
  for (let v = 0; v < 14; v++) {
    ctx.beginPath();
    let vx = Math.random() * size;
    let vy = Math.random() * size;
    ctx.moveTo(vx, vy);
    const steps = 18;
    for (let s = 0; s < steps; s++) {
      vx += (Math.random() - 0.4) * 80;
      vy += (Math.random() - 0.4) * 80;
      ctx.lineTo(vx, vy);
    }
    ctx.strokeStyle = v % 2 === 0 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.12)';
    ctx.stroke();
  }

  // Elegant square tile grid joints with gold brass inlay borders
  const tileSize = 256;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.28)'; // warm brass inlay
  for (let x = 0; x <= size; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates ornate carved Indian Jali / Lattice screen pattern
 */
export function createJaliLatticeTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c1917'; // warm sandstone / dark wood
  ctx.fillRect(0, 0, size, size);

  // Geometric 8-pointed star cutout repeating lattice
  const cell = 64;
  for (let x = 0; x < size; x += cell) {
    for (let y = 0; y < size; y += cell) {
      const cx = x + cell / 2;
      const cy = y + cell / 2;

      // Outer gold diamond
      ctx.beginPath();
      ctx.moveTo(cx, y + 4);
      ctx.lineTo(x + cell - 4, cy);
      ctx.lineTo(cx, y + cell - 4);
      ctx.lineTo(x + 4, cy);
      ctx.closePath();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner warm glowing cutout
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#78350f';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates soft radial glow sprite texture for sparks, flames and fireworks
 */
export function createGlowSpriteTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 220, 100, 0.9)');
  grad.addColorStop(0.5, 'rgba(255, 130, 20, 0.45)');
  grad.addColorStop(0.8, 'rgba(255, 60, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates flower petal texture (marigold orange / rose red)
 */
export function createPetalTexture(isRose = false): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.bezierCurveTo(cx + 45, 30, cx + 50, 90, cx, 115);
  ctx.bezierCurveTo(cx - 50, 90, cx - 45, 30, cx, 10);
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, 10, cx, 115);
  if (isRose) {
    grad.addColorStop(0, '#be123c'); // deep rose crimson
    grad.addColorStop(0.6, '#f43f5e');
    grad.addColorStop(1, '#fda4af');
  } else {
    grad.addColorStop(0, '#ea580c'); // vivid marigold saffron
    grad.addColorStop(0.6, '#f59e0b');
    grad.addColorStop(1, '#fef08a');
  }

  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle petal veins
  ctx.beginPath();
  ctx.moveTo(cx, 15);
  ctx.lineTo(cx, 110);
  ctx.strokeStyle = isRose ? 'rgba(159, 18, 57, 0.4)' : 'rgba(194, 65, 12, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
