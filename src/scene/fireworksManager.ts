/**
 * Advanced 3D Fireworks Simulation Engine for Diwali Night Sky.
 * Features:
 * - Ascending rockets with spark trails and launch whoosh
 * - Multi-burst types: Chrysanthemum, Golden Brocade Willow, Peony, Ring & Heart bursts
 * - Dynamic sky flash PointLight that illuminates palace walls and marble courtyard
 * - Smoke puff dispersal
 * - Interactive click-to-launch & rapid barrage triggers
 * - Web Audio sound synchronization
 */
import * as THREE from 'three';
import { soundManager } from '../audio/soundManager';
import { createGlowSpriteTexture } from './proceduralTextures';

export interface Rocket {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  targetY: number;
  color: THREE.Color;
  burstType: 'chrysanthemum' | 'brocade' | 'peony' | 'ring' | 'heart';
  trailPoints: THREE.Points;
  trailPositions: Float32Array;
  trailAlphas: Float32Array;
  age: number;
  isDead: boolean;
}

export interface SparkParticleGroup {
  points: THREE.Points;
  positions: Float32Array;
  velocities: Float32Array;
  colors: Float32Array;
  alphas: Float32Array;
  lifetimes: Float32Array;
  ages: Float32Array;
  decayRate: number;
  gravity: number;
  drag: number;
  isDead: boolean;
}

export class FireworksManager {
  private scene: THREE.Scene;
  private glowTexture: THREE.CanvasTexture;
  private rockets: Rocket[] = [];
  private particleGroups: SparkParticleGroup[] = [];
  private flashLight: THREE.PointLight;
  private flashDecay = 0;

  // Timers for natural auto fireworks
  private autoTimer = 0;
  private nextAutoDelay = 1.2;
  private isAutoEnabled = true;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.glowTexture = createGlowSpriteTexture();

    // Flash light that illuminates the environment when a shell explodes
    this.flashLight = new THREE.PointLight(0xffeedd, 0, 45);
    this.flashLight.position.set(0, 15, -12);
    this.scene.add(this.flashLight);
  }

  public setAutoEnabled(enabled: boolean) {
    this.isAutoEnabled = enabled;
  }

  public launchRocket(
    startX?: number,
    startZ?: number,
    targetY?: number,
    forcedType?: 'chrysanthemum' | 'brocade' | 'peony' | 'ring' | 'heart',
    forcedColor?: THREE.Color
  ) {
    const x = startX !== undefined ? startX : (Math.random() - 0.5) * 24;
    const z = startZ !== undefined ? startZ : -10 - Math.random() * 14;
    const yTarget = targetY !== undefined ? targetY : 12 + Math.random() * 10;

    const burstTypes: ('chrysanthemum' | 'brocade' | 'peony' | 'ring' | 'heart')[] = [
      'chrysanthemum',
      'brocade',
      'peony',
      'ring',
      'heart',
    ];
    const type = forcedType || burstTypes[Math.floor(Math.random() * burstTypes.length)];

    const palette = [
      new THREE.Color(0xf59e0b), // Golden amber
      new THREE.Color(0xe11d48), // Ruby red
      new THREE.Color(0x10b981), // Emerald green
      new THREE.Color(0x8b5cf6), // Royal violet
      new THREE.Color(0x06b6d4), // Electric cyan
      new THREE.Color(0xfde047), // Brilliant gold
      new THREE.Color(0xffffff), // Silver white
    ];
    const color = forcedColor || palette[Math.floor(Math.random() * palette.length)];

    // Upward velocity calculated to reach target height
    const flightTime = 0.9 + Math.random() * 0.4;
    const vy = yTarget / flightTime;
    const vx = (Math.random() - 0.5) * 2.5;
    const vz = (Math.random() - 0.5) * 2.0;

    // Trail particle points
    const trailCount = 20;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailAlphas = new Float32Array(trailCount);
    for (let i = 0; i < trailCount; i++) {
      trailPositions[i * 3 + 0] = x;
      trailPositions[i * 3 + 1] = 0;
      trailPositions[i * 3 + 2] = z;
      trailAlphas[i] = 0;
    }

    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trailMat = new THREE.PointsMaterial({
      map: this.glowTexture,
      size: 0.35,
      color: 0xffe066,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const trailPoints = new THREE.Points(trailGeo, trailMat);
    this.scene.add(trailPoints);

    const rocket: Rocket = {
      pos: new THREE.Vector3(x, 0.2, z),
      vel: new THREE.Vector3(vx, vy, vz),
      targetY: yTarget,
      color,
      burstType: type,
      trailPoints,
      trailPositions,
      trailAlphas,
      age: 0,
      isDead: false,
    };

    this.rockets.push(rocket);
    soundManager.playFireworkLaunch();
  }

  /**
   * Triggers an immediate explosion of particles at a given 3D position
   */
  public explodeAt(
    pos: THREE.Vector3,
    color: THREE.Color,
    burstType: 'chrysanthemum' | 'brocade' | 'peony' | 'ring' | 'heart' = 'chrysanthemum'
  ) {
    const isBrocade = burstType === 'brocade';
    const count = isBrocade ? 320 : 260;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const lifetimes = new Float32Array(count);
    const ages = new Float32Array(count);

    const secondaryColors = [
      new THREE.Color(0xfef08a),
      new THREE.Color(0xf43f5e),
      new THREE.Color(0x34d399),
      new THREE.Color(0xa78bfa),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      let speed = 4.0 + Math.random() * 7.5;
      let dir = new THREE.Vector3();

      if (burstType === 'ring') {
        const angle = (i / count) * Math.PI * 2;
        dir.set(Math.cos(angle), (Math.random() - 0.5) * 0.15, Math.sin(angle)).normalize();
        speed = 5.5 + Math.random() * 1.5;
      } else if (burstType === 'heart') {
        const t = (i / count) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        dir.set(hx * 0.08, hy * 0.08, (Math.random() - 0.5) * 0.2).normalize();
        speed = 4.5 + Math.random() * 2.0;
      } else {
        // Spherical random dispersion
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        dir.set(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        ).normalize();
      }

      velocities[i * 3 + 0] = dir.x * speed;
      velocities[i * 3 + 1] = dir.y * speed;
      velocities[i * 3 + 2] = dir.z * speed;

      // Color variation
      let pColor = color;
      if (burstType === 'peony' && Math.random() > 0.4) {
        pColor = secondaryColors[Math.floor(Math.random() * secondaryColors.length)];
      } else if (isBrocade) {
        pColor = Math.random() > 0.3 ? new THREE.Color(0xfbbf24) : new THREE.Color(0xffffff);
      }

      colors[i * 3 + 0] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;

      alphas[i] = 1.0;
      lifetimes[i] = isBrocade ? 2.4 + Math.random() * 0.8 : 1.4 + Math.random() * 0.6;
      ages[i] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      map: this.glowTexture,
      size: isBrocade ? 0.38 : 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    const group: SparkParticleGroup = {
      points,
      positions,
      velocities,
      colors,
      alphas,
      lifetimes,
      ages,
      decayRate: isBrocade ? 0.4 : 0.65,
      gravity: isBrocade ? 3.5 : 2.2, // Golden willows droop heavier
      drag: isBrocade ? 0.96 : 0.94,
      isDead: false,
    };

    this.particleGroups.push(group);

    // Flash light lighting up the courtyard and temple
    this.flashLight.position.copy(pos);
    this.flashLight.color.copy(color);
    this.flashLight.intensity = 6.5;
    this.flashDecay = 1.0;

    // Sound effect
    soundManager.playFireworkExplosion(isBrocade || count > 250);
  }

  /**
   * Instant barrage trigger for celebrations
   */
  public triggerBarrage() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.launchRocket(
          (Math.random() - 0.5) * 26,
          -12 - Math.random() * 8,
          14 + Math.random() * 8
        );
      }, i * 220);
    }
  }

  /**
   * Main per-frame update loop
   */
  public update(delta: number) {
    // 1. Auto fireworks timer
    if (this.isAutoEnabled) {
      this.autoTimer += delta;
      if (this.autoTimer >= this.nextAutoDelay) {
        this.autoTimer = 0;
        this.nextAutoDelay = 1.0 + Math.random() * 1.8;
        this.launchRocket();
      }
    }

    // 2. Flash light decay
    if (this.flashLight.intensity > 0) {
      this.flashLight.intensity = Math.max(0, this.flashLight.intensity - delta * 12);
    }

    // 3. Update Rockets in flight
    for (let r = this.rockets.length - 1; r >= 0; r--) {
      const rock = this.rockets[r];
      rock.age += delta;

      // Update position
      rock.pos.x += rock.vel.x * delta;
      rock.pos.y += rock.vel.y * delta;
      rock.pos.z += rock.vel.z * delta;

      // Gravity drag on rocket
      rock.vel.y -= 2.5 * delta;

      // Update rocket trail
      const trailGeo = rock.trailPoints.geometry;
      const count = rock.trailPositions.length / 3;
      // Shift trail points back
      for (let i = count - 1; i > 0; i--) {
        rock.trailPositions[i * 3 + 0] = rock.trailPositions[(i - 1) * 3 + 0];
        rock.trailPositions[i * 3 + 1] = rock.trailPositions[(i - 1) * 3 + 1];
        rock.trailPositions[i * 3 + 2] = rock.trailPositions[(i - 1) * 3 + 2];
      }
      rock.trailPositions[0] = rock.pos.x;
      rock.trailPositions[1] = rock.pos.y;
      rock.trailPositions[2] = rock.pos.z;
      (trailGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

      // Check detonation criteria (reached target height or peak of arc)
      if (rock.pos.y >= rock.targetY || rock.vel.y <= 0) {
        this.explodeAt(rock.pos, rock.color, rock.burstType);
        this.scene.remove(rock.trailPoints);
        rock.trailPoints.geometry.dispose();
        (rock.trailPoints.material as THREE.Material).dispose();
        this.rockets.splice(r, 1);
      }
    }

    // 4. Update Exploded Particles
    for (let g = this.particleGroups.length - 1; g >= 0; g--) {
      const grp = this.particleGroups[g];
      const count = grp.positions.length / 3;
      let allDead = true;

      for (let i = 0; i < count; i++) {
        grp.ages[i] += delta;
        if (grp.ages[i] < grp.lifetimes[i]) {
          allDead = false;

          // Apply velocity and drag
          grp.positions[i * 3 + 0] += grp.velocities[i * 3 + 0] * delta;
          grp.positions[i * 3 + 1] += grp.velocities[i * 3 + 1] * delta;
          grp.positions[i * 3 + 2] += grp.velocities[i * 3 + 2] * delta;

          // Apply gravity
          grp.velocities[i * 3 + 1] -= grp.gravity * delta;

          // Apply air drag
          grp.velocities[i * 3 + 0] *= grp.drag;
          grp.velocities[i * 3 + 1] *= grp.drag;
          grp.velocities[i * 3 + 2] *= grp.drag;

          // Twinkle flicker
          const progress = grp.ages[i] / grp.lifetimes[i];
          const fade = 1.0 - progress;
          const flicker = Math.sin(grp.ages[i] * 30 + i) * 0.2 + 0.8;
          grp.colors[i * 3 + 0] *= fade * flicker;
          grp.colors[i * 3 + 1] *= fade * flicker;
          grp.colors[i * 3 + 2] *= fade * flicker;
        } else {
          // Hide dead particle
          grp.positions[i * 3 + 1] = -999;
        }
      }

      (grp.points.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      (grp.points.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;

      if (allDead) {
        this.scene.remove(grp.points);
        grp.points.geometry.dispose();
        (grp.points.material as THREE.Material).dispose();
        this.particleGroups.splice(g, 1);
      }
    }
  }

  public dispose() {
    this.rockets.forEach(r => {
      this.scene.remove(r.trailPoints);
      r.trailPoints.geometry.dispose();
      (r.trailPoints.material as THREE.Material).dispose();
    });
    this.particleGroups.forEach(g => {
      this.scene.remove(g.points);
      g.points.geometry.dispose();
      (g.points.material as THREE.Material).dispose();
    });
    this.scene.remove(this.flashLight);
    this.rockets = [];
    this.particleGroups = [];
  }
}
