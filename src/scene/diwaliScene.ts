/**
 * Master 3D Diwali Scene Coordinator.
 * Orchestrates Renderer, Camera, Lighting, Palace Architecture,
 * Hundreds of 3D Diyas, Fireworks Engine, and Raycasting.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { buildPalaceEnvironment, PalaceEnvironment } from './palaceBuilder';
import { createDiya, updateDiyas, DiyaInstance } from './diyaBuilder';
import { createGiftBox, GiftBoxInstance } from './giftBoxBuilder';
import { FireworksManager } from './fireworksManager';
import { createGoldTypography, GoldTypography } from './goldTypography';
import { soundManager } from '../audio/soundManager';

export type CameraPreset = 'cinematic' | 'courtyard' | 'gift' | 'sky' | 'balcony';

export class DiwaliScene {
  public canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;

  // Environment & Systems
  private palaceEnv: PalaceEnvironment;
  private fireworks: FireworksManager;
  private goldTypo: GoldTypography;
  private diyas: DiyaInstance[] = [];
  public heroDiya: DiyaInstance;
  public giftBox: GiftBoxInstance;
  private hoveredGift = false;

  // Interactive Lighting
  private ambientLight: THREE.AmbientLight;
  private dirKeyLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Camera & Mouse
  private clock = new THREE.Clock();
  private reqId = 0;
  private isDestroyed = false;

  // Mouse / Touch Interaction
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-1000, -1000);
  private hoveredDiya: DiyaInstance | null = null;
  private isDragging = false;
  private hasDragged = false;
  private pointerDownPos = { x: 0, y: 0 };
  private previousMousePosition = { x: 0, y: 0 };
  private cameraTarget = new THREE.Vector3(0, 2.5, 0);
  private cameraCurrentPreset: CameraPreset = 'cinematic';

  // Camera preset positions
  private presets: Record<CameraPreset, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
    cinematic: {
      pos: new THREE.Vector3(0, 4.5, 9.5),
      target: new THREE.Vector3(0, 3.0, -4.0),
    },
    courtyard: {
      pos: new THREE.Vector3(0, 8.5, 14.0),
      target: new THREE.Vector3(0, 1.5, -4.0),
    },
    gift: {
      pos: new THREE.Vector3(0, 1.9, 3.2),
      target: new THREE.Vector3(0, 0.95, 0),
    },
    sky: {
      pos: new THREE.Vector3(0, 3.0, 6.0),
      target: new THREE.Vector3(0, 15.0, -14.0),
    },
    balcony: {
      pos: new THREE.Vector3(10.0, 9.5, -6.0),
      target: new THREE.Vector3(0, 1.0, 0),
    },
  };

  // Callback hooks for UI state updates
  public onDiyaLitCountChange?: (litCount: number, totalCount: number) => void;
  public onGiftOpened?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // 1. Detect software WebGL as per guidelines
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2.0)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Scene & Fog (Midnight festive sky)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040308);
    this.scene.fog = new THREE.FogExp2(0x06040b, 0.022);

    // 4. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Camera setup with adaptive initial FOV
    const initialAspect = window.innerWidth / window.innerHeight;
    const initialFov = initialAspect < 0.8 ? 68 : initialAspect < 1.1 ? 60 : 52;
    this.camera = new THREE.PerspectiveCamera(
      initialFov,
      initialAspect,
      0.1,
      120
    );
    const initialPos = this.presets.cinematic.pos.clone();
    if (initialAspect < 1.0) {
      initialPos.z = 11.5;
    }
    this.camera.position.copy(initialPos);
    this.cameraTarget.copy(this.presets.cinematic.target);
    this.camera.lookAt(this.cameraTarget);

    // 6. Balanced 3-Point Studio Rig
    // Ambient fill
    this.ambientLight = new THREE.AmbientLight(0x2d1a3a, 0.6);
    this.scene.add(this.ambientLight);

    // Warm Key Directional Light (Moon / high temple brazier)
    this.dirKeyLight = new THREE.DirectionalLight(0xffdf99, 1.2);
    this.dirKeyLight.position.set(12, 24, 15);
    this.dirKeyLight.castShadow = !this.isSoftwareGl;
    if (this.dirKeyLight.castShadow) {
      this.dirKeyLight.shadow.mapSize.width = 1024;
      this.dirKeyLight.shadow.mapSize.height = 1024;
      this.dirKeyLight.shadow.bias = -0.0005;
      this.dirKeyLight.shadow.normalBias = 0.02;
      this.dirKeyLight.shadow.camera.near = 2;
      this.dirKeyLight.shadow.camera.far = 60;
      const d = 16;
      this.dirKeyLight.shadow.camera.left = -d;
      this.dirKeyLight.shadow.camera.right = d;
      this.dirKeyLight.shadow.camera.top = d;
      this.dirKeyLight.shadow.camera.bottom = -d;
    }
    this.scene.add(this.dirKeyLight);

    // Hemisphere cool sky / warm earth fill
    this.hemiLight = new THREE.HemisphereLight(0x4338ca, 0x7c2d12, 0.7);
    this.scene.add(this.hemiLight);

    // 7. Add Palace Architecture & Courtyard
    this.palaceEnv = buildPalaceEnvironment();
    this.scene.add(this.palaceEnv.group);

    // 8. Add Royal 3D Diwali Gift Box on Central Plinth
    this.giftBox = createGiftBox();
    this.giftBox.group.position.set(0, 0.22, 0);
    this.scene.add(this.giftBox.group);

    // 9. Add Hero Diya resting in front of the Gift Box
    this.heroDiya = createDiya(true, true);
    this.heroDiya.group.position.set(0, 0.22, 1.25);
    this.heroDiya.group.scale.set(1.2, 1.2, 1.2);
    this.scene.add(this.heroDiya.group);
    this.diyas.push(this.heroDiya);

    // 10. Add Hundreds of Glowing Diyas across the Courtyard
    this.populateCourtyardDiyas();

    // 10. Floating 3D Golden Typography: 'HAPPY DIWALI'
    this.goldTypo = createGoldTypography();
    this.scene.add(this.goldTypo.group);

    // 11. Fireworks Manager
    this.fireworks = new FireworksManager(this.scene);

    // 12. Listeners
    this.setupEventListeners();

    // 13. Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 14. Start Render Loop
    this.animate();
  }

  /**
   * Arranges hundreds of 3D diyas along the Rangoli and palace grounds
   */
  private populateCourtyardDiyas() {
    // A. Inner ring around Rangoli (radius = 1.9m, 12 diyas)
    const innerCount = 12;
    for (let i = 0; i < innerCount; i++) {
      const a = (i * Math.PI * 2) / innerCount;
      const diya = createDiya(false, true);
      const r = 2.1;
      diya.group.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r);
      diya.group.rotation.y = a + Math.PI;
      this.scene.add(diya.group);
      this.diyas.push(diya);
    }

    // B. Outer perimeter ring around Rangoli (radius = 3.8m, 20 diyas)
    const outerCount = 20;
    for (let i = 0; i < outerCount; i++) {
      const a = (i * Math.PI * 2) / outerCount;
      const diya = createDiya(false, true);
      const r = 3.9;
      diya.group.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r);
      diya.group.rotation.y = a;
      this.scene.add(diya.group);
      this.diyas.push(diya);
    }

    // C. Temple steps & terrace line diyas (32 diyas)
    for (let step = 1; step <= 3; step++) {
      const stepY = 0.6 - step * 0.2 + 0.2;
      const stepZ = -14 + 5 + step * 0.4;
      for (let x = -5.5; x <= 5.5; x += 1.4) {
        if (Math.abs(x) < 0.6) continue; // center aisle clear
        const diya = createDiya(false, true);
        diya.group.position.set(x, stepY, stepZ);
        this.scene.add(diya.group);
        this.diyas.push(diya);
      }
    }

    // D. Colonnade pillar base diyas
    const pillarX = [-12, -8, -4, 4, 8, 12];
    pillarX.forEach(px => {
      for (let dz = -1; dz <= 1; dz += 2) {
        const diya = createDiya(false, true);
        diya.group.position.set(px, 1.22, -11.5 + dz * 0.7);
        this.scene.add(diya.group);
        this.diyas.push(diya);
      }
    });

    // E. Courtyard outer borders
    for (let x = -9; x <= 9; x += 3.0) {
      const diya1 = createDiya(false, true);
      diya1.group.position.set(x, 0.02, 6.5);
      this.scene.add(diya1.group);
      this.diyas.push(diya1);
    }

    this.notifyDiyaState();
  }

  private notifyDiyaState() {
    if (this.onDiyaLitCountChange) {
      const lit = this.diyas.filter(d => d.isLit).length;
      this.onDiyaLitCountChange(lit, this.diyas.length);
    }
  }

  /**
   * Lights or unlights a single diya
   */
  public toggleDiya(diya: DiyaInstance, playSound = true) {
    diya.isLit = !diya.isLit;
    if (diya.isLit && playSound) {
      soundManager.playDiyaLight();
    }
    this.notifyDiyaState();
  }

  /**
   * Lights all diyas
   */
  public lightAllDiyas() {
    this.diyas.forEach(d => {
      d.isLit = true;
    });
    soundManager.playDiyaLight();
    this.notifyDiyaState();
  }

  /**
   * Extinguishes all diyas
   */
  public extinguishAllDiyas() {
    this.diyas.forEach(d => {
      d.isLit = false;
    });
    this.notifyDiyaState();
  }

  /**
   * Smooth camera flight to a preset view
   */
  public setCameraPreset(preset: CameraPreset, duration = 1.4) {
    this.cameraCurrentPreset = preset;
    const targetConfig = this.presets[preset];
    if (!targetConfig) return;

    const isPortrait = window.innerWidth < window.innerHeight;
    const targetPos = targetConfig.pos.clone();
    if (isPortrait) {
      if (preset === 'cinematic') targetPos.z = 11.5;
      if (preset === 'gift') targetPos.z = 4.0;
      if (preset === 'courtyard') targetPos.z = 16.5;
    }

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.cameraTarget);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration,
      ease: 'power2.out',
    });

    gsap.to(this.cameraTarget, {
      x: targetConfig.target.x,
      y: targetConfig.target.y,
      z: targetConfig.target.z,
      duration,
      ease: 'power2.out',
    });
  }

  /**
   * Interactive Gift Box Unwrapping Feature
   */
  public openGift(onComplete?: () => void) {
    this.setCameraPreset('gift', 1.5);
    this.giftBox.openGift(() => {
      // Fire celebration fireworks on unbox!
      this.fireworks.triggerBarrage();
      if (this.onGiftOpened) this.onGiftOpened();
      if (onComplete) onComplete();
    });
  }

  public closeGift(onComplete?: () => void) {
    this.giftBox.closeGift(onComplete);
  }

  public toggleGift() {
    if (this.giftBox.isOpen) {
      this.closeGift();
    } else {
      this.openGift();
    }
  }

  public focusGiftBox() {
    this.setCameraPreset('gift', 1.5);
  }

  /**
   * Interactive Diya Close-up feature
   */
  public focusHeroDiya() {
    this.setCameraPreset('gift', 1.5);
    if (!this.heroDiya.isLit) {
      this.toggleDiya(this.heroDiya, true);
    }
  }

  /**
   * Triggers single rocket launch or barrage
   */
  public launchFirework() {
    this.fireworks.launchRocket();
  }

  public triggerBarrage() {
    this.fireworks.triggerBarrage();
  }

  public setAutoFireworks(enabled: boolean) {
    this.fireworks.setAutoEnabled(enabled);
  }

  /**
   * Opening zoom animation
   */
  public performOpeningZoom(onComplete?: () => void) {
    // Start distant & high
    this.camera.position.set(0, 16.0, 28.0);
    this.cameraTarget.set(0, 1.0, 0);

    gsap.to(this.camera.position, {
      x: this.presets.cinematic.pos.x,
      y: this.presets.cinematic.pos.y,
      z: this.presets.cinematic.pos.z,
      duration: 3.5,
      ease: 'power3.inOut',
      onComplete,
    });

    gsap.to(this.cameraTarget, {
      x: this.presets.cinematic.target.x,
      y: this.presets.cinematic.target.y,
      z: this.presets.cinematic.target.z,
      duration: 3.5,
      ease: 'power3.inOut',
    });
  }

  /**
   * Event listeners for interaction
   */
  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize);

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('click', this.onClick);
  }

  private onWindowResize = () => {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;
    if (aspect < 0.8) {
      this.camera.fov = 68;
    } else if (aspect < 1.1) {
      this.camera.fov = 60;
    } else {
      this.camera.fov = 52;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isDragging = true;
    this.hasDragged = false;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Camera orbit on drag
    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      const totalDist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (totalDist > 8) {
        this.hasDragged = true;
      }

      const rotSpeed = 0.003;
      // Orbit around current camera target
      const offset = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
      const radius = offset.length();

      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= deltaX * rotSpeed;
      phi = Math.max(0.15, Math.min(Math.PI / 2.1, phi - deltaY * rotSpeed));

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);

      this.camera.position.copy(this.cameraTarget).add(offset);

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    // Raycast hover detection for Gift Box and Diyas (on devices with mouse cursor)
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check Gift Box hover
    if (this.giftBox) {
      const giftIntersects = this.raycaster.intersectObject(this.giftBox.clickProxy);
      if (giftIntersects.length > 0) {
        this.hoveredGift = true;
        this.hoveredDiya = null;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    this.hoveredGift = false;

    // 2. Check Diyas hover
    const clickables = this.diyas.map(d => d.clickProxy);
    const intersects = this.raycaster.intersectObjects(clickables);

    if (intersects.length > 0) {
      const proxy = intersects[0].object as unknown as { __diyaInstance?: DiyaInstance };
      if (proxy.__diyaInstance) {
        this.hoveredDiya = proxy.__diyaInstance;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    this.hoveredDiya = null;
    this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'default';
  };

  private onPointerUp = () => {
    this.isDragging = false;
    this.canvas.style.cursor = 'default';
  };

  private onClick = (e: MouseEvent) => {
    // If the user dragged to orbit the camera, ignore the subsequent click event
    if (this.hasDragged) {
      this.hasDragged = false;
      return;
    }

    // Direct raycast at exact tap/click coordinates for mobile phone & laptop precision
    const rect = this.canvas.getBoundingClientRect();
    const clickNDC = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(clickNDC, this.camera);

    // 1. Direct check: Gift Box unboxing
    if (this.giftBox) {
      const giftIntersects = this.raycaster.intersectObject(this.giftBox.clickProxy);
      if (giftIntersects.length > 0) {
        this.toggleGift();
        return;
      }
    }

    // 2. Direct check: Courtyard Diya lighting
    const clickables = this.diyas.map(d => d.clickProxy);
    const intersects = this.raycaster.intersectObjects(clickables);

    if (intersects.length > 0) {
      const proxy = intersects[0].object as unknown as { __diyaInstance?: DiyaInstance };
      if (proxy.__diyaInstance) {
        this.toggleDiya(proxy.__diyaInstance, true);
        if (proxy.__diyaInstance.isHero) {
          this.focusHeroDiya();
        }
        return;
      }
    }

    // 3. Otherwise: launch interactive firework towards tapped coordinates in the sky!
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 12);
    const hitPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, hitPoint);

    if (hitPoint && hitPoint.y > 5.0) {
      this.fireworks.launchRocket(
        hitPoint.x + (Math.random() - 0.5) * 2.5,
        hitPoint.z,
        Math.min(24, Math.max(10, hitPoint.y))
      );
    } else {
      // Default rocket launch
      this.fireworks.launchRocket();
    }
  };

  /**
   * Main Render Loop
   */
  private animate = () => {
    if (this.isDestroyed) return;
    this.reqId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // 1. Update 3D Gift Box (lid kinematics, hovering coins, sweets, spark fountain)
    if (this.giftBox) {
      this.giftBox.update(delta, elapsed);
    }

    // 2. Update Diyas (flames, light pulsing, embers)
    updateDiyas(this.diyas, delta, elapsed);

    // 3. Update Palace Environment (petals swirling, lanterns swaying)
    this.palaceEnv.updatePetals(delta, elapsed);
    this.palaceEnv.updateLanterns(elapsed);

    // 4. Update 3D Golden Typography
    this.goldTypo.update(delta, elapsed);

    // 5. Update Fireworks
    this.fireworks.update(delta);

    // 6. Camera lookAt interpolation
    this.camera.lookAt(this.cameraTarget);

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.reqId);

    window.removeEventListener('resize', this.onWindowResize);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('click', this.onClick);

    this.fireworks.dispose();
    this.renderer.dispose();
  }
}
