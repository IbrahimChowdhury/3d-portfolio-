import * as THREE from 'three';

export interface ParticleFieldHandle {
  points: THREE.Points;
  update: (elapsed: number, pointerX: number, pointerY: number) => void;
  dispose: () => void;
}

const PARTICLE_COUNT = 1350;

export function createParticleField(glowTexture: THREE.Texture): ParticleFieldHandle {
  const basePositions = new Float32Array(PARTICLE_COUNT * 3);
  const livePositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const phases = new Float32Array(PARTICLE_COUNT);

  const cCool = new THREE.Color(0x94a3b8);
  const cSapphire = new THREE.Color(0x38bdf8);
  const cIce = new THREE.Color(0xe0f2fe);
  const cChampagne = new THREE.Color(0xf3c98b);
  const tempColor = new THREE.Color();

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    // 65% orbital architectural disc shell, 35% deep ambient starfield volume
    const isOrbital = i < PARTICLE_COUNT * 0.65;
    let x: number;
    let y: number;
    let z: number;

    if (isOrbital) {
      const r = 3.2 + Math.pow(Math.random(), 0.72) * 11.5;
      const theta = Math.random() * Math.PI * 2;
      const spreadY = (Math.random() - 0.5) * (1.8 + r * 0.24);
      x = Math.cos(theta) * r;
      y = spreadY;
      z = Math.sin(theta) * r;
    } else {
      const r = 7.5 + Math.random() * 14.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.cos(phi) * 0.65;
      z = r * Math.sin(phi) * Math.sin(theta);
    }

    const i3 = i * 3;
    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    livePositions[i3] = x;
    livePositions[i3 + 1] = y;
    livePositions[i3 + 2] = z;

    phases[i] = Math.random() * Math.PI * 2;

    const pick = Math.random();
    if (pick < 0.45) {
      tempColor.copy(cCool);
    } else if (pick < 0.78) {
      tempColor.copy(cSapphire);
    } else if (pick < 0.92) {
      tempColor.copy(cIce);
    } else {
      tempColor.copy(cChampagne);
    }
    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(livePositions, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.14,
    map: glowTexture,
    transparent: true,
    opacity: 0.78,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const update = (elapsed: number, pointerX: number, pointerY: number) => {
    // Slow unified orbital rotation
    points.rotation.y = elapsed * 0.032 + pointerX * 0.16;
    points.rotation.x = pointerY * 0.11;

    // Subtle magnetic field ripple responding to pointer coordinates (zero allocations)
    const targetX = pointerX * 5.2;
    const targetY = pointerY * 3.4;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];
      const phase = phases[i];

      const dx = bx - targetX;
      const dy = by - targetY;
      const distSq = dx * dx + dy * dy + bz * bz * 0.15;
      const influence = distSq < 18 ? (1 - distSq / 18) * 0.55 : 0;

      livePositions[i3] = bx + dx * influence * 0.14 + Math.cos(elapsed * 0.55 + phase) * 0.07;
      livePositions[i3 + 1] =
        by + dy * influence * 0.14 + Math.sin(elapsed * 0.68 + phase) * 0.09;
      livePositions[i3 + 2] = bz + Math.sin(elapsed * 0.45 + phase) * 0.07;
    }

    posAttr.needsUpdate = true;
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
  };

  return { points, update, dispose };
}
