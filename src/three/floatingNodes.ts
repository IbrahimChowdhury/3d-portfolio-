import * as THREE from 'three';

export interface FloatingNodesHandle {
  group: THREE.Group;
  update: (
    elapsed: number,
    pointerX: number,
    pointerY: number,
    coreAnchors: THREE.Vector3[],
  ) => void;
  dispose: () => void;
}

interface NodeOrbitState {
  radius: number;
  baseAngle: number;
  orbitSpeed: number;
  inclination: number;
  verticalAmp: number;
  verticalPhase: number;
  scale: number;
  rotSpeedX: number;
  rotSpeedY: number;
  worldPos: THREE.Vector3;
}

const NODE_COUNT = 32;
const MAX_LINE_SEGMENTS = 140;

// Pre-allocated scratch math helpers (zero per-frame GC)
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat = new THREE.Matrix4();
const _color = new THREE.Color();

export function createFloatingNodes(): FloatingNodesHandle {
  const group = new THREE.Group();

  // Shared faceted geometries for instanced floating nodes
  const shellGeo = new THREE.OctahedronGeometry(0.115, 0);
  const coreGeo = new THREE.IcosahedronGeometry(0.056, 0);

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.24,
    clearcoat: 0.45,
  });

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.9,
    metalness: 0.1,
    roughness: 0.2,
  });

  const shellMesh = new THREE.InstancedMesh(shellGeo, shellMat, NODE_COUNT);
  const coreMesh = new THREE.InstancedMesh(coreGeo, coreMat, NODE_COUNT);
  shellMesh.frustumCulled = false;
  coreMesh.frustumCulled = false;

  const nodes: NodeOrbitState[] = [];
  const paletteShell = [0x94a3b8, 0xb8c5d9, 0x64748b, 0xd6bfa2];
  const paletteCore = [0x38bdf8, 0x60a5fa, 0x7dd3fc, 0xf5c989];

  // Deterministic seeded distribution so every render is balanced and art-directed
  for (let i = 0; i < NODE_COUNT; i += 1) {
    const t = i / NODE_COUNT;
    const layer = i % 3;
    const radius = 3.1 + layer * 1.15 + Math.sin(i * 2.13) * 0.45;
    const baseAngle = t * Math.PI * 2 + layer * 0.72;
    const orbitSpeed = (0.11 + (2 - layer) * 0.045) * (i % 2 === 0 ? 1 : -0.78);
    const inclination = ((i % 7) - 3) * 0.26;
    const verticalAmp = 0.45 + (i % 4) * 0.28;
    const verticalPhase = i * 0.91;
    // Per-instance scale variation ±15%
    const scale = 0.85 + ((i * 37) % 30) * 0.01;

    nodes.push({
      radius,
      baseAngle,
      orbitSpeed,
      inclination,
      verticalAmp,
      verticalPhase,
      scale,
      rotSpeedX: 0.45 + (i % 5) * 0.14,
      rotSpeedY: 0.62 + (i % 3) * 0.19,
      worldPos: new THREE.Vector3(),
    });

    _color.setHex(paletteShell[i % paletteShell.length]);
    shellMesh.setColorAt(i, _color);

    _color.setHex(paletteCore[i % paletteCore.length]);
    coreMesh.setColorAt(i, _color);
  }

  if (shellMesh.instanceColor) shellMesh.instanceColor.needsUpdate = true;
  if (coreMesh.instanceColor) coreMesh.instanceColor.needsUpdate = true;

  group.add(shellMesh);
  group.add(coreMesh);

  // Dynamic synapse connections (pre-allocated buffer)
  const linePositions = new Float32Array(MAX_LINE_SEGMENTS * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });

  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  lineSegments.frustumCulled = false;
  group.add(lineSegments);

  const update = (
    elapsed: number,
    pointerX: number,
    pointerY: number,
    coreAnchors: THREE.Vector3[],
  ) => {
    const parallaxX = pointerX * 0.45;
    const parallaxY = pointerY * 0.35;

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const n = nodes[i];
      const angle = n.baseAngle + elapsed * n.orbitSpeed;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const x = cosA * n.radius + parallaxX * (0.4 + (i % 3) * 0.25);
      const z = sinA * n.radius;
      const y =
        Math.sin(angle + n.inclination) * n.radius * 0.34 +
        Math.sin(elapsed * 0.9 + n.verticalPhase) * n.verticalAmp +
        parallaxY * (0.35 + (i % 3) * 0.2);

      n.worldPos.set(x, y, z);

      _euler.set(elapsed * n.rotSpeedX + i, elapsed * n.rotSpeedY, i * 0.5);
      _quat.setFromEuler(_euler);

      _scale.setScalar(n.scale);
      _mat.compose(n.worldPos, _quat, _scale);
      shellMesh.setMatrixAt(i, _mat);

      const innerPulse = n.scale * (0.94 + Math.sin(elapsed * 2.4 + n.verticalPhase) * 0.14);
      _scale.setScalar(innerPulse);
      _mat.compose(n.worldPos, _quat, _scale);
      coreMesh.setMatrixAt(i, _mat);
    }

    shellMesh.instanceMatrix.needsUpdate = true;
    coreMesh.instanceMatrix.needsUpdate = true;

    // Update synapse links in-place without allocations
    let segCount = 0;
    const maxDistSq = 2.45 * 2.45;

    // Connect nearest inner nodes to core anchors
    for (let a = 0; a < coreAnchors.length && segCount < MAX_LINE_SEGMENTS; a += 1) {
      const anchor = coreAnchors[a];
      let bestIdx = -1;
      let bestDistSq = 3.2 * 3.2;

      for (let i = 0; i < NODE_COUNT; i += 1) {
        const dSq = anchor.distanceToSquared(nodes[i].worldPos);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = i;
        }
      }

      if (bestIdx !== -1) {
        const offset = segCount * 6;
        linePositions[offset] = anchor.x;
        linePositions[offset + 1] = anchor.y;
        linePositions[offset + 2] = anchor.z;
        linePositions[offset + 3] = nodes[bestIdx].worldPos.x;
        linePositions[offset + 4] = nodes[bestIdx].worldPos.y;
        linePositions[offset + 5] = nodes[bestIdx].worldPos.z;
        segCount += 1;
      }
    }

    // Connect nearby floating nodes
    for (let i = 0; i < NODE_COUNT && segCount < MAX_LINE_SEGMENTS; i += 1) {
      const pi = nodes[i].worldPos;
      for (let j = i + 1; j < NODE_COUNT && segCount < MAX_LINE_SEGMENTS; j += 1) {
        const pj = nodes[j].worldPos;
        if (pi.distanceToSquared(pj) < maxDistSq) {
          const offset = segCount * 6;
          linePositions[offset] = pi.x;
          linePositions[offset + 1] = pi.y;
          linePositions[offset + 2] = pi.z;
          linePositions[offset + 3] = pj.x;
          linePositions[offset + 4] = pj.y;
          linePositions[offset + 5] = pj.z;
          segCount += 1;
        }
      }
    }

    lineGeo.setDrawRange(0, segCount * 2);
    (lineGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

    // Silence unused _pos lint
    _pos.set(0, 0, 0);
  };

  // Run initial placement & compute bounding spheres
  update(0, 0, 0, []);
  shellMesh.computeBoundingSphere();
  coreMesh.computeBoundingSphere();

  const dispose = () => {
    shellGeo.dispose();
    coreGeo.dispose();
    shellMat.dispose();
    coreMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
  };

  return { group, update, dispose };
}
