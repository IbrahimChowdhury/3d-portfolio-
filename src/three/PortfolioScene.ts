import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createCoreAssembly, type CoreAssemblyHandle } from './coreAssembly';
import { createFloatingNodes, type FloatingNodesHandle } from './floatingNodes';
import { createParticleField, type ParticleFieldHandle } from './particleField';
import { createProceduralTextures, type ProceduralTextureSet } from './textures';
import type { AccentTheme, SceneSettings } from '../data/portfolioData';

const ACCENT_HEX: Record<AccentTheme, number> = {
  sapphire: 0x38bdf8,
  emerald: 0x10b981,
  amber: 0xf59e0b,
};

export interface PortfolioSceneCallbacks {
  onWebGLUnavailable?: () => void;
}

interface CameraKeyframe {
  scroll: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  coreOffsetX: number;
  coreOffsetY: number;
}

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

// Pre-allocated scratch vectors for zero-GC camera interpolation
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0, 0);

const DESKTOP_KEYFRAMES: CameraKeyframe[] = [
  // 0.00 — Hero: core sculpted on the right side so left typography breathes cleanly
  {
    scroll: 0.0,
    position: new THREE.Vector3(-1.35, 0.45, 7.6),
    lookAt: new THREE.Vector3(-1.15, 0.0, 0.0),
    coreOffsetX: 1.55,
    coreOffsetY: 0.05,
  },
  // 0.34 — About & Tech Stack: elevated orbital vantage shifting core gracefully left
  {
    scroll: 0.34,
    position: new THREE.Vector3(2.85, 1.55, 7.2),
    lookAt: new THREE.Vector3(0.45, -0.15, 0.0),
    coreOffsetX: -1.35,
    coreOffsetY: 0.15,
  },
  // 0.68 — Projects: wide architectural pullback showcasing constellation & particles
  {
    scroll: 0.68,
    position: new THREE.Vector3(-0.35, 2.35, 9.6),
    lookAt: new THREE.Vector3(0.0, -0.1, 0.0),
    coreOffsetX: 0.0,
    coreOffsetY: 0.2,
  },
  // 1.00 — Contact: intimate low-angle close-up framing the luminous core
  {
    scroll: 1.0,
    position: new THREE.Vector3(2.1, -0.55, 6.2),
    lookAt: new THREE.Vector3(0.25, 0.1, 0.0),
    coreOffsetX: -0.95,
    coreOffsetY: 0.1,
  },
];

const MOBILE_KEYFRAMES: CameraKeyframe[] = [
  {
    scroll: 0.0,
    position: new THREE.Vector3(0.0, 0.6, 8.8),
    lookAt: new THREE.Vector3(0.0, -0.2, 0.0),
    coreOffsetX: 0.0,
    coreOffsetY: 0.55,
  },
  {
    scroll: 0.34,
    position: new THREE.Vector3(1.6, 1.4, 8.5),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    coreOffsetX: 0.0,
    coreOffsetY: 0.2,
  },
  {
    scroll: 0.68,
    position: new THREE.Vector3(-0.6, 2.2, 10.6),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    coreOffsetX: 0.0,
    coreOffsetY: 0.1,
  },
  {
    scroll: 1.0,
    position: new THREE.Vector3(1.2, -0.4, 7.6),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    coreOffsetX: 0.0,
    coreOffsetY: 0.15,
  },
];

export class PortfolioScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private textures!: ProceduralTextureSet;
  private core!: CoreAssemblyHandle;
  private nodes!: FloatingNodesHandle;
  private particles!: ParticleFieldHandle;
  private coreLight!: THREE.PointLight;
  private rimLight!: THREE.DirectionalLight;
  private stageGroup!: THREE.Group;

  private isSoftwareGl = false;
  private isPaused = false;
  private isDisposed = false;
  private isContextLost = false;
  private frameId = 0;

  private lastTimestamp = 0;
  private simElapsed = 0;
  private speedMultiplier = 1.0;

  // Interactive smoothed states
  private targetPointerX = 0;
  private targetPointerY = 0;
  private pointerX = 0;
  private pointerY = 0;

  private targetScroll = 0;
  private currentScroll = 0;
  private manualOrbitYaw = 0;
  private targetOrbitYaw = 0;
  private cameraResetActive = false;

  // Coalesced single-frame render state (used when paused)
  private pausedRenderScheduled = false;

  constructor(container: HTMLElement, initialPaused: boolean, callbacks?: PortfolioSceneCallbacks) {
    this.container = container;
    this.isPaused = initialPaused;

    const testCanvas = document.createElement('canvas');
    const hasWebGL = Boolean(
      testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'),
    );
    if (!hasWebGL) {
      callbacks?.onWebGLUnavailable?.();
      this.isDisposed = true;
      return;
    }

    this.isSoftwareGl = detectSoftwareWebGL();
    this.initScene();
    this.bindEvents();

    // Render initial frame immediately and start loop if unpaused
    this.updateScrollFromWindow();
    this.currentScroll = this.targetScroll;
    this.applyCameraAndStage(1.0);
    this.core.update(0, 0);
    this.core.group.updateMatrixWorld(true);
    this.core.updateAnchorWorldPositions();
    this.nodes.update(0, 0, 0, this.core.anchorWorldPositions);
    this.particles.update(0, 0, 0);
    this.renderer.render(this.scene, this.camera);

    if (!this.isPaused) {
      this.startLoop();
    }
  }

  private initScene(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090d);
    this.scene.fog = new THREE.FogExp2(0x07090d, 0.036);

    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120);
    this.camera.position.set(-1.35, 0.45, 7.6);

    // Mandatory studio environment map via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    pmremGenerator.dispose();

    // Balanced 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x7cb3ff, 0x0b101b, 0.85);
    this.scene.add(hemiLight);

    // Warm key directional light with tight orthographic shadow frustum
    const keyLight = new THREE.DirectionalLight(0xffe6c7, 2.25);
    keyLight.position.set(6.5, 8.2, 6.0);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 26;
      keyLight.shadow.camera.left = -5.5;
      keyLight.shadow.camera.right = 5.5;
      keyLight.shadow.camera.top = 5.5;
      keyLight.shadow.camera.bottom = -5.5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Electric sapphire rim light separating metallic bevels from obsidian sky
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
    this.rimLight.position.set(-7.0, 3.5, -5.5);
    this.scene.add(this.rimLight);

    // Optional studio softbox for crisp elongated reflections on hardware GPUs
    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xdbeafe, 2.6, 5.5, 2.2);
      softbox.position.set(-3.2, 4.4, 4.5);
      softbox.lookAt(0, 0, 0);
      this.scene.add(softbox);
    }

    // Procedural Textures & Composite 3D Assemblies
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);

    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);

    this.core = createCoreAssembly(this.textures, this.isSoftwareGl);
    this.stageGroup.add(this.core.group);

    this.coreLight = new THREE.PointLight(0x38bdf8, 2.8, 14, 2);
    this.coreLight.position.set(0, 0, 0);
    this.core.group.add(this.coreLight);

    this.nodes = createFloatingNodes();
    this.stageGroup.add(this.nodes.group);

    this.particles = createParticleField(this.textures.particleGlow);
    this.scene.add(this.particles.points);

    // Pre-warm shaders on hardware GPUs
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private onPointerMove = (e: PointerEvent): void => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -((e.clientY / window.innerHeight) * 2 - 1);
    this.targetPointerX = THREE.MathUtils.clamp(nx, -1, 1);
    this.targetPointerY = THREE.MathUtils.clamp(ny, -1, 1);
  };

  private onScroll = (): void => {
    this.updateScrollFromWindow();
    if (this.isPaused) {
      this.requestPausedRender();
    }
  };

  private onResize = (): void => {
    if (this.isDisposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    if (this.isPaused) {
      this.requestPausedRender();
    }
  };

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.isContextLost = true;
    this.stopLoop();
  };

  private onContextRestored = (): void => {
    this.isContextLost = false;
    if (!this.isPaused && !this.isDisposed) {
      this.startLoop();
    } else {
      this.requestPausedRender();
    }
  };

  private bindEvents(): void {
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener(
      'webglcontextrestored',
      this.onContextRestored,
    );
  }

  private updateScrollFromWindow(): void {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    this.targetScroll = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
  }

  private sampleKeyframes(progress: number): {
    pos: THREE.Vector3;
    lookAt: THREE.Vector3;
    coreX: number;
    coreY: number;
  } {
    const frames = window.innerWidth < 1024 ? MOBILE_KEYFRAMES : DESKTOP_KEYFRAMES;
    const p = THREE.MathUtils.clamp(progress, 0, 1);

    let a = frames[0];
    let b = frames[frames.length - 1];
    for (let i = 0; i < frames.length - 1; i += 1) {
      if (p >= frames[i].scroll && p <= frames[i + 1].scroll) {
        a = frames[i];
        b = frames[i + 1];
        break;
      }
    }

    const span = Math.max(0.0001, b.scroll - a.scroll);
    const rawT = THREE.MathUtils.clamp((p - a.scroll) / span, 0, 1);
    // Smoothstep easing for graceful camera arcs
    const t = rawT * rawT * (3 - 2 * rawT);

    _targetCamPos.lerpVectors(a.position, b.position, t);
    _targetLookAt.lerpVectors(a.lookAt, b.lookAt, t);

    return {
      pos: _targetCamPos,
      lookAt: _targetLookAt,
      coreX: THREE.MathUtils.lerp(a.coreOffsetX, b.coreOffsetX, t),
      coreY: THREE.MathUtils.lerp(a.coreOffsetY, b.coreOffsetY, t),
    };
  }

  private applyCameraAndStage(dampAlpha: number): void {
    const sample = this.sampleKeyframes(this.currentScroll);

    // Subtle pointer parallax applied to camera orbit
    const parallaxX = this.pointerX * 0.65;
    const parallaxY = this.pointerY * 0.42;

    const desiredX = sample.pos.x + parallaxX;
    const desiredY = sample.pos.y + parallaxY;
    const desiredZ = sample.pos.z;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, desiredX, dampAlpha);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, desiredY, dampAlpha);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, desiredZ, dampAlpha);

    _currentLookAt.lerp(sample.lookAt, dampAlpha);
    this.camera.lookAt(_currentLookAt);

    // Position the core & orbital node stage cleanly relative to viewport layout
    this.stageGroup.position.x = THREE.MathUtils.lerp(
      this.stageGroup.position.x,
      sample.coreX,
      dampAlpha,
    );
    this.stageGroup.position.y = THREE.MathUtils.lerp(
      this.stageGroup.position.y,
      sample.coreY,
      dampAlpha,
    );

    // Subtle stage tilt in response to mouse + optional manual yaw pulse
    this.manualOrbitYaw = THREE.MathUtils.lerp(
      this.manualOrbitYaw,
      this.targetOrbitYaw,
      dampAlpha,
    );
    this.stageGroup.rotation.y = this.manualOrbitYaw + this.pointerX * 0.14;
    this.stageGroup.rotation.x = -this.pointerY * 0.08;

    if (this.cameraResetActive && Math.abs(this.manualOrbitYaw - this.targetOrbitYaw) < 0.005) {
      this.cameraResetActive = false;
    }
  }

  private afterDraw(cb: () => void): void {
    if (this.isDisposed || this.isContextLost) return;
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed || this.isContextLost) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (now: number): void => {
    if (this.isDisposed || this.isPaused || this.isContextLost) return;

    const rawDelta = this.lastTimestamp ? (now - this.lastTimestamp) / 1000 : 1 / 60;
    const delta = Math.min(rawDelta, 0.05);
    const scaledDelta = delta * this.speedMultiplier;
    this.lastTimestamp = now;
    this.simElapsed += scaledDelta;

    // Frame-rate independent exponential damping
    const dampFast = 1 - Math.exp(-6.5 * delta);
    const dampSmooth = 1 - Math.exp(-4.2 * delta);

    this.pointerX = THREE.MathUtils.lerp(this.pointerX, this.targetPointerX, dampFast);
    this.pointerY = THREE.MathUtils.lerp(this.pointerY, this.targetPointerY, dampFast);
    this.currentScroll = THREE.MathUtils.lerp(
      this.currentScroll,
      this.targetScroll,
      dampSmooth,
    );

    this.applyCameraAndStage(dampSmooth);

    // Update procedural 3D subsystems
    this.core.update(this.simElapsed, scaledDelta);
    this.coreLight.intensity = 2.6 + Math.sin(this.simElapsed * 1.9) * 0.55;
    this.stageGroup.updateMatrixWorld(true);
    this.core.updateAnchorWorldPositions();

    this.nodes.update(
      this.simElapsed,
      this.pointerX,
      this.pointerY,
      this.core.anchorWorldPositions,
    );
    this.particles.update(this.simElapsed, this.pointerX, this.pointerY);

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(() => {
        if (!this.isDisposed && !this.isPaused && !this.isContextLost) {
          this.tick(performance.now());
        }
      });
    } else {
      this.frameId = window.requestAnimationFrame(this.tick);
    }
  };

  private requestPausedRender(): void {
    if (this.isDisposed || this.isContextLost || this.pausedRenderScheduled) return;
    this.pausedRenderScheduled = true;
    this.frameId = window.requestAnimationFrame(() => {
      this.pausedRenderScheduled = false;
      if (this.isDisposed || this.isContextLost) return;
      this.currentScroll = this.targetScroll;
      this.applyCameraAndStage(1.0);
      this.renderer.render(this.scene, this.camera);
    });
  }

  private startLoop(): void {
    this.stopLoop();
    this.lastTimestamp = performance.now();
    this.frameId = window.requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    window.cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);
    this.frameId = 0;
  }

  public setPaused(paused: boolean): void {
    if (this.isDisposed) return;
    if (this.isPaused === paused) return;
    this.isPaused = paused;
    if (paused) {
      this.stopLoop();
      this.requestPausedRender();
    } else if (!this.isContextLost) {
      this.startLoop();
    }
  }

  public applySceneSettings(settings: SceneSettings): void {
    if (this.isDisposed) return;
    this.speedMultiplier = THREE.MathUtils.clamp(settings.coreSpeed, 0, 2.5);
    const hex = ACCENT_HEX[settings.accentTheme] ?? ACCENT_HEX.sapphire;
    this.core.setAccentColor(hex);
    this.nodes.setAccentColor(hex);
    this.coreLight.color.setHex(hex);
    this.rimLight.color.setHex(hex);
    this.particles.points.visible = settings.showParticles;
    if (this.isPaused) {
      this.requestPausedRender();
    }
  }

  public nudgeOrbit(): void {
    if (this.isDisposed) return;
    this.targetOrbitYaw += Math.PI / 3;
    this.cameraResetActive = true;
    if (this.isPaused) {
      this.manualOrbitYaw = this.targetOrbitYaw;
      this.requestPausedRender();
    }
  }

  public resetView(): void {
    if (this.isDisposed) return;
    this.targetOrbitYaw = 0;
    this.targetPointerX = 0;
    this.targetPointerY = 0;
    this.cameraResetActive = true;
    if (this.isPaused) {
      this.manualOrbitYaw = 0;
      this.pointerX = 0;
      this.pointerY = 0;
      this.requestPausedRender();
    }
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.stopLoop();

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);

    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
      this.renderer.domElement.removeEventListener(
        'webglcontextrestored',
        this.onContextRestored,
      );
      if (this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    this.core?.dispose();
    this.nodes?.dispose();
    this.particles?.dispose();
    this.textures?.dispose();
    this.envRT?.dispose();
    this.renderer?.dispose();
  }
}
