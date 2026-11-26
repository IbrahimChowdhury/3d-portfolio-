import * as THREE from 'three';
import type { ProceduralTextureSet } from './textures';

export interface CoreAssemblyHandle {
  group: THREE.Group;
  anchorWorldPositions: THREE.Vector3[];
  update: (elapsed: number, delta: number) => void;
  updateAnchorWorldPositions: () => void;
  setAccentColor: (hex: number) => void;
  dispose: () => void;
}

const _anchorScratch = new THREE.Vector3();

function createBeveledRingGeometry(
  innerR: number,
  outerR: number,
  halfHeight: number,
  bevel: number,
  segments = 96,
): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(innerR + bevel, -halfHeight),
    new THREE.Vector2(outerR - bevel, -halfHeight),
    new THREE.Vector2(outerR, -halfHeight + bevel),
    new THREE.Vector2(outerR, halfHeight - bevel),
    new THREE.Vector2(outerR - bevel, halfHeight),
    new THREE.Vector2(innerR + bevel, halfHeight),
    new THREE.Vector2(innerR, halfHeight - bevel),
    new THREE.Vector2(innerR, -halfHeight + bevel),
    new THREE.Vector2(innerR + bevel, -halfHeight),
  ];
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

function createStabilizerFinGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.07, -0.18);
  shape.lineTo(0.28, -0.09);
  shape.lineTo(0.36, 0.0);
  shape.lineTo(0.28, 0.09);
  shape.lineTo(-0.07, 0.18);
  shape.lineTo(-0.12, 0.0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

function createSpindleGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.11, 0.05),
    new THREE.Vector2(0.13, 0.18),
    new THREE.Vector2(0.075, 0.24),
    new THREE.Vector2(0.06, 0.56),
    new THREE.Vector2(0.022, 0.78),
    new THREE.Vector2(0.001, 0.92),
  ];
  const geo = new THREE.LatheGeometry(pts, 32);
  geo.computeVertexNormals();
  return geo;
}

export function createCoreAssembly(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): CoreAssemblyHandle {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // --- Shared Calibrated PBR Materials (varied roughness >= 0.25 across adjacent parts) ---
  const innerCoreMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      map: textures.facetAlbedo,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.45,
      metalness: 0.22,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      flatShading: true,
    }),
  );

  const brushedTitaniumMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb8c5d9,
      metalness: 0.92,
      roughness: 0.22,
      bumpMap: textures.brushedBump,
      bumpScale: 0.015,
      roughnessMap: textures.brushedRoughness,
      anisotropy: 0.75,
      clearcoat: 0.25,
    }),
  );

  const matteObsidianMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e2636,
      metalness: 0.42,
      roughness: 0.58,
      bumpMap: textures.brushedBump,
      bumpScale: 0.008,
    }),
  );

  const champagneAccentMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6be8a,
      metalness: 0.95,
      roughness: 0.16,
      anisotropy: 0.65,
      clearcoat: 0.35,
    }),
  );

  const emissiveTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.2,
      metalness: 0.1,
      roughness: 0.25,
    }),
  );

  const glassShellMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      metalness: 0.04,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.74,
      ior: 1.54,
      thickness: 1.2,
      attenuationColor: new THREE.Color(0x0284c7),
      attenuationDistance: 2.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: isSoftwareGl ? 0.16 : 0.92,
      depthWrite: false,
    }),
  );

  const cageWireMat = trackMat(
    new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.72,
    }),
  );

  // --- Part 1: Inner Glowing Geometric Core ---
  const coreSpinner = new THREE.Group();
  group.add(coreSpinner);

  const innerCrystalGeo = trackGeo(new THREE.IcosahedronGeometry(0.84, 1));
  const innerCrystal = new THREE.Mesh(innerCrystalGeo, innerCoreMat);
  innerCrystal.castShadow = !isSoftwareGl;
  innerCrystal.receiveShadow = !isSoftwareGl;
  coreSpinner.add(innerCrystal);

  // --- Part 2: Faceted Geodesic Strut Cage & 12 Vertex Hubs ---
  const cageBaseGeo = trackGeo(new THREE.IcosahedronGeometry(1.12, 0));
  const cageEdgesGeo = trackGeo(new THREE.EdgesGeometry(cageBaseGeo));
  const cageLines = new THREE.LineSegments(cageEdgesGeo, cageWireMat);
  coreSpinner.add(cageLines);

  // Extract unique icosahedron vertices for 12 machined vertex hubs
  const posAttr = cageBaseGeo.getAttribute('position');
  const uniqueVerts: THREE.Vector3[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < posAttr.count; i += 1) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueVerts.push(new THREE.Vector3(x, y, z));
    }
  }

  const hubGeo = trackGeo(new THREE.OctahedronGeometry(0.085, 0));
  const hubInstanced = new THREE.InstancedMesh(hubGeo, champagneAccentMat, uniqueVerts.length);
  const dummy = new THREE.Object3D();
  uniqueVerts.forEach((v, idx) => {
    dummy.position.copy(v);
    dummy.lookAt(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    hubInstanced.setMatrixAt(idx, dummy.matrix);
  });
  hubInstanced.instanceMatrix.needsUpdate = true;
  hubInstanced.computeBoundingSphere();
  coreSpinner.add(hubInstanced);

  // --- Part 3: Outer Optical Crystal Halo Shell ---
  const haloGeo = trackGeo(new THREE.IcosahedronGeometry(1.36, 2));
  const haloShell = new THREE.Mesh(haloGeo, glassShellMat);
  haloShell.renderOrder = 5;
  coreSpinner.add(haloShell);

  // --- Part 4: Primary Equatorial Machined Gimbal Ring + Part 7: 4 Beveled Stabilizer Fins ---
  const equatorialGroup = new THREE.Group();
  group.add(equatorialGroup);

  const primaryRingGeo = trackGeo(createBeveledRingGeometry(1.72, 1.94, 0.085, 0.025, 96));
  const primaryRing = new THREE.Mesh(primaryRingGeo, brushedTitaniumMat);
  primaryRing.castShadow = !isSoftwareGl;
  primaryRing.receiveShadow = !isSoftwareGl;
  equatorialGroup.add(primaryRing);

  const innerTrimRingGeo = trackGeo(new THREE.TorusGeometry(1.70, 0.014, 12, 96));
  innerTrimRingGeo.rotateX(Math.PI / 2);
  const innerTrimRing = new THREE.Mesh(innerTrimRingGeo, emissiveTrimMat);
  equatorialGroup.add(innerTrimRing);

  // 4 Beveled Stabilizer Pylons mounted cleanly on equatorial ring
  const finGeo = trackGeo(createStabilizerFinGeometry());
  const anchorObjects: THREE.Object3D[] = [];
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const pylon = new THREE.Mesh(finGeo, matteObsidianMat);
    pylon.position.set(Math.cos(angle) * 2.02, 0, Math.sin(angle) * 2.02);
    pylon.rotation.y = -angle;
    pylon.castShadow = !isSoftwareGl;
    pylon.receiveShadow = !isSoftwareGl;
    equatorialGroup.add(pylon);

    // Subtle emissive cap at tip of each pylon + anchor target for node lines
    const tipAnchor = new THREE.Object3D();
    tipAnchor.position.set(Math.cos(angle) * 2.26, 0, Math.sin(angle) * 2.26);
    equatorialGroup.add(tipAnchor);
    anchorObjects.push(tipAnchor);
  }

  // --- Part 9: 6 Radial Optical Prism Conduits ---
  const conduitGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 8));
  conduitGeo.rotateZ(Math.PI / 2);
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const conduit = new THREE.Mesh(conduitGeo, emissiveTrimMat);
    conduit.position.set(Math.cos(angle) * 1.44, 0, Math.sin(angle) * 1.44);
    conduit.rotation.y = -angle;
    equatorialGroup.add(conduit);
  }

  // --- Part 5: Secondary Inclined Matte Obsidian Orbital Ring ---
  const secondaryRingGroup = new THREE.Group();
  secondaryRingGroup.rotation.set(0.95, 0.2, 0.35);
  group.add(secondaryRingGroup);

  const secondaryRingGeo = trackGeo(createBeveledRingGeometry(2.14, 2.30, 0.055, 0.016, 96));
  const secondaryRing = new THREE.Mesh(secondaryRingGeo, matteObsidianMat);
  secondaryRing.castShadow = !isSoftwareGl;
  secondaryRing.receiveShadow = !isSoftwareGl;
  secondaryRingGroup.add(secondaryRing);

  // 2 Polar anchor points on secondary ring
  for (let i = 0; i < 2; i += 1) {
    const angle = i * Math.PI + Math.PI / 2;
    const nodeCap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 16)),
      champagneAccentMat,
    );
    nodeCap.position.set(Math.cos(angle) * 2.22, 0, Math.sin(angle) * 2.22);
    secondaryRingGroup.add(nodeCap);
    anchorObjects.push(nodeCap);
  }

  // --- Part 6: Tertiary Champagne-Gold Meridian Ring ---
  const tertiaryRingGroup = new THREE.Group();
  tertiaryRingGroup.rotation.set(-0.74, 0.5, -0.45);
  group.add(tertiaryRingGroup);

  const tertiaryRingGeo = trackGeo(createBeveledRingGeometry(2.46, 2.53, 0.026, 0.008, 108));
  const tertiaryRing = new THREE.Mesh(tertiaryRingGeo, champagneAccentMat);
  tertiaryRingGroup.add(tertiaryRing);

  // --- Part 8: Polar Axial Spindles & Collars ---
  const spindleGeo = trackGeo(createSpindleGeometry());
  const collarGeo = trackGeo(new THREE.TorusGeometry(0.115, 0.018, 12, 32));
  collarGeo.rotateX(Math.PI / 2);

  const topSpindle = new THREE.Mesh(spindleGeo, brushedTitaniumMat);
  topSpindle.position.y = 1.38;
  group.add(topSpindle);

  const topCollar = new THREE.Mesh(collarGeo, emissiveTrimMat);
  topCollar.position.y = 1.54;
  group.add(topCollar);

  const bottomSpindle = new THREE.Mesh(spindleGeo, brushedTitaniumMat);
  bottomSpindle.rotation.x = Math.PI;
  bottomSpindle.position.y = -1.38;
  group.add(bottomSpindle);

  const bottomCollar = new THREE.Mesh(collarGeo, emissiveTrimMat);
  bottomCollar.position.y = -1.54;
  group.add(bottomCollar);

  // --- Part 10: Grounding Contact Shadow & Calibrated Orbital Reticle Plane ---
  const groundPlaneGeo = trackGeo(new THREE.PlaneGeometry(7.8, 7.8));
  groundPlaneGeo.rotateX(-Math.PI / 2);
  const groundPlaneMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.groundReticle,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  const groundPlane = new THREE.Mesh(groundPlaneGeo, groundPlaneMat);
  groundPlane.position.y = -2.65;
  group.add(groundPlane);

  const anchorWorldPositions = anchorObjects.map(() => new THREE.Vector3());

  const updateAnchorWorldPositions = () => {
    for (let i = 0; i < anchorObjects.length; i += 1) {
      anchorObjects[i].getWorldPosition(_anchorScratch);
      anchorWorldPositions[i].copy(_anchorScratch);
    }
  };

  const update = (elapsed: number, delta: number) => {
    // Inner faceted core and geodesic cage rotation
    coreSpinner.rotation.y += delta * 0.34;
    coreSpinner.rotation.x += delta * 0.16;

    // Gentle living luminous core pulse
    const pulse = 1.32 + Math.sin(elapsed * 1.9) * 0.28;
    innerCoreMat.emissiveIntensity = pulse;
    emissiveTrimMat.emissiveIntensity = 1.85 + Math.sin(elapsed * 2.4 + 0.8) * 0.45;

    // Counter-rotating precision mechanical gimbals
    equatorialGroup.rotation.y -= delta * 0.22;
    equatorialGroup.rotation.z = Math.sin(elapsed * 0.42) * 0.14;

    secondaryRingGroup.rotation.y += delta * 0.28;
    secondaryRingGroup.rotation.x = 0.95 + Math.cos(elapsed * 0.36) * 0.1;

    tertiaryRingGroup.rotation.z -= delta * 0.19;
    tertiaryRingGroup.rotation.y += delta * 0.11;

    // Subtle vertical breathing on the floating sculpture (ground reticle stays anchored)
    const bob = Math.sin(elapsed * 0.85) * 0.08;
    coreSpinner.position.y = bob;
    equatorialGroup.position.y = bob * 0.7;
    secondaryRingGroup.position.y = bob * 0.5;
    tertiaryRingGroup.position.y = bob * 0.4;
    topSpindle.position.y = 1.38 + bob;
    topCollar.position.y = 1.54 + bob;
    bottomSpindle.position.y = -1.38 + bob;
    bottomCollar.position.y = -1.54 + bob;

    // Subtle reticle slow rotation
    groundPlane.rotation.y += delta * 0.04;
  };

  const setAccentColor = (hex: number) => {
    innerCoreMat.color.setHex(hex);
    innerCoreMat.emissive.setHex(hex);
    emissiveTrimMat.emissive.setHex(hex);
    glassShellMat.color.setHex(hex);
    glassShellMat.attenuationColor.setHex(hex);
    cageWireMat.color.setHex(hex);
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return {
    group,
    anchorWorldPositions,
    update,
    updateAnchorWorldPositions,
    setAccentColor,
    dispose,
  };
}
