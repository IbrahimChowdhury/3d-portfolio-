import * as THREE from 'three';

export interface ProceduralTextureSet {
  brushedBump: THREE.CanvasTexture;
  brushedRoughness: THREE.CanvasTexture;
  facetAlbedo: THREE.CanvasTexture;
  particleGlow: THREE.CanvasTexture;
  groundReticle: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 16));

  // 1. Anisotropic brushed metal bump & roughness maps (linear space)
  const brushedCanvas = document.createElement('canvas');
  brushedCanvas.width = 512;
  brushedCanvas.height = 512;
  const bCtx = brushedCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 1) {
    const shade = 112 + Math.floor(Math.sin(y * 0.45) * 14 + (Math.random() - 0.5) * 24);
    bCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
    bCtx.fillRect(0, y, 512, 1);
  }
  for (let i = 0; i < 420; i += 1) {
    const y = Math.floor(Math.random() * 512);
    const x = Math.floor(Math.random() * 512);
    const len = 40 + Math.floor(Math.random() * 180);
    const val = Math.random() > 0.5 ? 165 : 90;
    bCtx.fillStyle = `rgba(${val},${val},${val},0.28)`;
    bCtx.fillRect(x, y, len, 1);
  }

  const brushedBump = new THREE.CanvasTexture(brushedCanvas);
  brushedBump.wrapS = THREE.RepeatWrapping;
  brushedBump.wrapT = THREE.RepeatWrapping;
  brushedBump.repeat.set(3, 2);
  brushedBump.anisotropy = anisotropy;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#4a4a4a';
  rCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    const v = 58 + Math.floor(Math.random() * 36);
    rCtx.fillStyle = `rgb(${v},${v},${v})`;
    rCtx.fillRect(0, y, 256, 2);
  }
  const brushedRoughness = new THREE.CanvasTexture(roughCanvas);
  brushedRoughness.wrapS = THREE.RepeatWrapping;
  brushedRoughness.wrapT = THREE.RepeatWrapping;
  brushedRoughness.repeat.set(4, 2);
  brushedRoughness.anisotropy = anisotropy;

  // 2. Micro-faceted crystalline albedo texture (sRGB)
  const facetCanvas = document.createElement('canvas');
  facetCanvas.width = 512;
  facetCanvas.height = 512;
  const fCtx = facetCanvas.getContext('2d')!;
  const fGrad = fCtx.createLinearGradient(0, 0, 512, 512);
  fGrad.addColorStop(0, '#0f2540');
  fGrad.addColorStop(0.5, '#194575');
  fGrad.addColorStop(1, '#0b192c');
  fCtx.fillStyle = fGrad;
  fCtx.fillRect(0, 0, 512, 512);

  fCtx.strokeStyle = 'rgba(125, 211, 252, 0.24)';
  fCtx.lineWidth = 1.25;
  const step = 64;
  for (let x = 0; x <= 512; x += step) {
    fCtx.beginPath();
    fCtx.moveTo(x, 0);
    fCtx.lineTo(x, 512);
    fCtx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    fCtx.beginPath();
    fCtx.moveTo(0, y);
    fCtx.lineTo(512, y);
    fCtx.stroke();
  }
  fCtx.strokeStyle = 'rgba(186, 230, 253, 0.16)';
  for (let i = -512; i <= 512; i += step) {
    fCtx.beginPath();
    fCtx.moveTo(i, 0);
    fCtx.lineTo(i + 512, 512);
    fCtx.stroke();
  }

  const facetAlbedo = new THREE.CanvasTexture(facetCanvas);
  facetAlbedo.colorSpace = THREE.SRGBColorSpace;
  facetAlbedo.wrapS = THREE.RepeatWrapping;
  facetAlbedo.wrapT = THREE.RepeatWrapping;
  facetAlbedo.anisotropy = anisotropy;

  // 3. Soft radial glow sprite for interactive particles (sRGB)
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 128;
  glowCanvas.height = 128;
  const gCtx = glowCanvas.getContext('2d')!;
  const gGrad = gCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gGrad.addColorStop(0.24, 'rgba(224, 242, 254, 0.85)');
  gGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.26)');
  gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  gCtx.fillStyle = gGrad;
  gCtx.fillRect(0, 0, 128, 128);

  const particleGlow = new THREE.CanvasTexture(glowCanvas);
  particleGlow.colorSpace = THREE.SRGBColorSpace;

  // 4. Soft grounding shadow + subtle precision architectural reticle (sRGB)
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 1024;
  groundCanvas.height = 1024;
  const grCtx = groundCanvas.getContext('2d')!;
  grCtx.clearRect(0, 0, 1024, 1024);

  // Soft dark radial contact shadow
  const shadowGrad = grCtx.createRadialGradient(512, 512, 24, 512, 512, 420);
  shadowGrad.addColorStop(0, 'rgba(2, 4, 9, 0.72)');
  shadowGrad.addColorStop(0.42, 'rgba(5, 9, 18, 0.34)');
  shadowGrad.addColorStop(1, 'rgba(7, 9, 13, 0)');
  grCtx.fillStyle = shadowGrad;
  grCtx.fillRect(0, 0, 1024, 1024);

  // Precision radial calibration rings
  const ringRadii = [190, 295, 410];
  ringRadii.forEach((r, idx) => {
    grCtx.beginPath();
    grCtx.arc(512, 512, r, 0, Math.PI * 2);
    grCtx.strokeStyle =
      idx === 1 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(148, 163, 184, 0.14)';
    grCtx.lineWidth = idx === 1 ? 1.8 : 1.1;
    grCtx.stroke();
  });

  // Radial degree ticks around outer scale ring
  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const r0 = isMajor ? 392 : 401;
    const r1 = 410;
    grCtx.beginPath();
    grCtx.moveTo(512 + Math.cos(angle) * r0, 512 + Math.sin(angle) * r0);
    grCtx.lineTo(512 + Math.cos(angle) * r1, 512 + Math.sin(angle) * r1);
    grCtx.strokeStyle = isMajor
      ? 'rgba(186, 230, 253, 0.28)'
      : 'rgba(148, 163, 184, 0.12)';
    grCtx.lineWidth = isMajor ? 1.8 : 1;
    grCtx.stroke();
  }

  const groundReticle = new THREE.CanvasTexture(groundCanvas);
  groundReticle.colorSpace = THREE.SRGBColorSpace;
  groundReticle.anisotropy = anisotropy;

  return {
    brushedBump,
    brushedRoughness,
    facetAlbedo,
    particleGlow,
    groundReticle,
    dispose: () => {
      brushedBump.dispose();
      brushedRoughness.dispose();
      facetAlbedo.dispose();
      particleGlow.dispose();
      groundReticle.dispose();
    },
  };
}
