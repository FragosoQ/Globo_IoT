import ThreeGlobe from 'https://esm.sh/three-globe?external=three';
import * as THREE from "https://esm.sh/three";
import { TrackballControls } from 'https://esm.sh/three/examples/jsm/controls/TrackballControls.js';

// Dados de arcos (todas as capitais a partir de Lisboa)
const arcsData = [
  // África
  { startLat: 38.7223, startLng: -9.1393, endLat: -8.8383, endLng: 13.2344, name: 'LAD', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 0.4162, endLng: 9.4673, name: 'LBV', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 32.8872, endLng: 13.5888, name: 'TIP', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 33.5731, endLng: -7.5898, name: 'CMN', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: -25.9653, endLng: 32.5832, name: 'MPM', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 0.3366, endLng: 6.7325, name: 'TMS', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 30.0444, endLng: 31.2357, name: 'CAI', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 5.3600, endLng: -4.0083, name: 'ABJ', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 14.9213, endLng: -23.5085, name: 'RAI', color: 'rgba(255,255,255,0.2)' },

  // América
  { startLat: 38.7223, startLng: -9.1393, endLat: -34.5997, endLng: -58.3819, name: 'BUE', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: -15.7939, endLng: -47.8828, name: 'BSB', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 45.4215, endLng: -75.6972, name: 'YOW', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: -33.4489, endLng: -70.6693, name: 'SCL', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 4.7110, endLng: -74.0721, name: 'BOG', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 18.4861, endLng: -69.9312, name: 'SDQ', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 13.6929, endLng: -89.2182, name: 'SAL', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 14.6349, endLng: -90.5069, name: 'GUA', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 14.0723, endLng: -87.2068, name: 'TGU', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 19.4326, endLng: -99.1332, name: 'MEX', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 8.9824, endLng: -79.5199, name: 'PTY', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: -12.0464, endLng: -77.0428, name: 'LIM', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 40.6611, endLng: -73.9450, name: 'JFK', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 34.0522, endLng: -118.2437, name: 'LAX', color: '#50B6E8' },

  // Europa
  { startLat: 38.7223, startLng: -9.1393, endLat: 48.2084, endLng: 16.3738, name: 'VIE', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 50.8471, endLng: 4.3661, name: 'BRU', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 45.8150, endLng: 15.9819, name: 'ZAG', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 35.1856, endLng: 33.3823, name: 'NIC', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 50.0755, endLng: 14.4378, name: 'PRG', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 55.6761, endLng: 12.5683, name: 'CPH', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 40.4169, endLng: -3.7034, name: 'MAD', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 59.4370, endLng: 24.7536, name: 'TLL', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 60.1695, endLng: 24.9355, name: 'HEL', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 48.8567, endLng: 2.3522, name: 'CDG', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 52.5167, endLng: 13.3833, name: 'BER', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 37.9838, endLng: 23.7275, name: 'ATH', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 47.4979, endLng: 19.0402, name: 'BUD', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 41.8933, endLng: 12.4828, name: 'FCO', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 54.6872, endLng: 25.2797, name: 'VNO', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 49.8153, endLng: 6.1296, name: 'LUX', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 52.3702, endLng: 4.8952, name: 'AMS', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 54.5973, endLng: -5.9301, name: 'BFS', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 59.9139, endLng: 10.7522, name: 'OSL', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 52.2322, endLng: 21.0122, name: 'WAW', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 41.1496, endLng: -8.6109, name: 'OPO', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 53.9045, endLng: 27.5615, name: 'MSQ', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 44.4268, endLng: 26.1025, name: 'OTP', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 55.7558, endLng: 37.6173, name: 'SVO', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 48.1486, endLng: 17.1077, name: 'BTS', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 46.0569, endLng: 14.5058, name: 'LJU', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 59.3293, endLng: 18.0686, name: 'ARN', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 47.3769, endLng: 8.5417, name: 'ZRH', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 51.5099, endLng: -0.1180, name: 'LHR', color: '#50B6E8' },

  // Ásia
  { startLat: 38.7223, startLng: -9.1393, endLat: 24.6333, endLng: 46.7167, name: 'RUH', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 39.9042, endLng: 116.4074, name: 'PEK', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: -6.2088, endLng: 106.8456, name: 'CGK', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 35.6892, endLng: 51.3890, name: 'THR', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 32.0853, endLng: 34.7818, name: 'TLV', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 31.9454, endLng: 35.9284, name: 'AMM', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 29.3786, endLng: 47.9904, name: 'KWI', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 33.8938, endLng: 35.5018, name: 'BEY', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 47.9213, endLng: 106.9186, name: 'ULN', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 14.5995, endLng: 120.9842, name: 'MNL', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 25.2854, endLng: 51.5310, name: 'DOH', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 21.4858, endLng: 39.1925, name: 'JED', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 25.0330, endLng: 121.5654, name: 'TPE', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 25.2048, endLng: 55.2708, name: 'DXB', color: '#50B6E8' },
  { startLat: 38.7223, startLng: -9.1393, endLat: 41.2995, endLng: 69.2401, name: 'TAS', color: '#50B6E8' },

  // Oceania
  { startLat: 38.7223, startLng: -9.1393, endLat: -33.8678, endLng: 151.2073, name: 'SYD', color: '#50B6E8' }
];

// Pontos adicionais (copiado do teu código original)
const pontosAdicionais = [
  // Portugal (PO)
  { lat: 38.7169, lng: -9.139, size: 0.3, color: '#0058E8' },
  { lat: 41.1496, lng: -8.611, size: 0.3, color: '#0058E8' },
  // Espanha (ES)
  { lat: 40.4168, lng: -3.7038, size: 0.3, color: '#0058E8' },
  { lat: 41.3851, lng: 2.1734, size: 0.3, color: '#0058E8' },
  { lat: 39.4699, lng: -0.3763, size: 0.3, color: '#0058E8' },
  { lat: 37.3891, lng: -5.9845, size: 0.3, color: '#0058E8' },
  { lat: 43.263, lng: -2.935, size: 0.3, color: '#0058E8' },
  // França (FR)
  { lat: 48.8566, lng: 2.3522, size: 0.3, color: '#0058E8' },
  { lat: 45.764, lng: 4.8357, size: 0.3, color: '#0058E8' },
  { lat: 43.2965, lng: 5.3698, size: 0.3, color: '#0058E8' },
  // Alemanha (AL)
  { lat: 52.52, lng: 13.405, size: 0.3, color: '#0058E8' },
  { lat: 48.1351, lng: 11.582, size: 0.3, color: '#0058E8' },
  { lat: 53.5511, lng: 9.9937, size: 0.3, color: '#0058E8' },
  { lat: 50.1109, lng: 8.6821, size: 0.3, color: '#0058E8' },
  { lat: 51.0504, lng: 13.7373, size: 0.3, color: '#0058E8' },
  // Áustria (AU)
  { lat: 48.2082, lng: 16.3738, size: 0.3, color: '#0058E8' },
  { lat: 47.8095, lng: 13.055, size: 0.3, color: '#0058E8' },
  // Bélgica (BE)
  { lat: 50.8503, lng: 4.3517, size: 0.3, color: '#0058E8' },
  { lat: 51.2194, lng: 4.4025, size: 0.3, color: '#0058E8' },
  { lat: 51.0543, lng: 3.7174, size: 0.3, color: '#0058E8' },
  // Países Baixos (PA)
  { lat: 52.3676, lng: 4.9041, size: 0.3, color: '#0058E8' },
  { lat: 51.9244, lng: 4.4777, size: 0.3, color: '#0058E8' },
  { lat: 52.0907, lng: 5.1214, size: 0.3, color: '#0058E8' },
  // Noruega (NO)
  { lat: 59.9139, lng: 10.7522, size: 0.3, color: '#0058E8' },
  { lat: 60.3913, lng: 5.3221, size: 0.3, color: '#0058E8' },
  // Suécia (SU)
  { lat: 59.3293, lng: 18.0686, size: 0.3, color: '#0058E8' },
  { lat: 57.7089, lng: 11.9746, size: 0.3, color: '#0058E8' },
  { lat: 55.605, lng: 13.0038, size: 0.3, color: '#0058E8' },
  // Dinamarca (DI)
  { lat: 55.6761, lng: 12.5683, size: 0.3, color: '#0058E8' },
  { lat: 56.1629, lng: 10.2039, size: 0.3, color: '#0058E8' },
  // Finlândia (FI)
  { lat: 60.1695, lng: 24.9355, size: 0.3, color: '#0058E8' },
  { lat: 60.4518, lng: 22.2666, size: 0.3, color: '#0058E8' },
  // Islândia (IS)
  { lat: 64.1355, lng: -21.8954, size: 0.3, color: '#0058E8' },
  // Irlanda (IR)
  { lat: 53.3331, lng: -6.2489, size: 0.3, color: '#0058E8' },
  { lat: 53.2707, lng: -9.0568, size: 0.3, color: '#0058E8' },
  // Itália (IT)
  { lat: 41.9028, lng: 12.4964, size: 0.3, color: '#0058E8' },
  { lat: 45.4642, lng: 9.19, size: 0.3, color: '#0058E8' },
  { lat: 40.8518, lng: 14.2681, size: 0.3, color: '#0058E8' },
  { lat: 43.7696, lng: 11.2558, size: 0.3, color: '#0058E8' },
  { lat: 45.4408, lng: 12.3155, size: 0.3, color: '#0058E8' },
  // Portugal (PO) - Repetições
  { lat: 38.7169, lng: -9.139, size: 0.3, color: '#0058E8' },
  { lat: 41.1496, lng: -8.611, size: 0.3, color: '#0058E8' },
  // Rep. Tcheca (RE)
  { lat: 50.0755, lng: 14.4378, size: 0.3, color: '#0058E8' },
  { lat: 49.1951, lng: 16.6068, size: 0.3, color: '#0058E8' },
  // Polónia (PO)
  { lat: 52.2297, lng: 21.0122, size: 0.3, color: '#0058E8' },
  { lat: 50.0647, lng: 19.945, size: 0.3, color: '#0058E8' },
  // Roménia (RO)
  { lat: 44.4268, lng: 26.1025, size: 0.3, color: '#0058E8' },
  // Hungria (HU)
  { lat: 47.4979, lng: 19.0402, size: 0.3, color: '#0058E8' },
  // Bulgária (BU)
  { lat: 42.6977, lng: 23.3219, size: 0.3, color: '#0058E8' },
  // Sérvia (SE)
  { lat: 44.8176, lng: 20.4569, size: 0.3, color: '#0058E8' },
  // Croácia (CR)
  { lat: 45.815, lng: 15.9785, size: 0.3, color: '#0058E8' },
  // Eslovénia (ES)
  { lat: 46.0569, lng: 14.5058, size: 0.3, color: '#0058E8' },
  // Macedónia do Norte (MA)
  { lat: 41.9981, lng: 21.4254, size: 0.3, color: '#0058E8' },
  // Albânia (AL)
  { lat: 41.3275, lng: 19.8189, size: 0.3, color: '#0058E8' },
  // Montenegro (MO)
  { lat: 42.441, lng: 19.2625, size: 0.3, color: '#0058E8' },
  // Bósnia (BO)
  { lat: 43.8563, lng: 18.4131, size: 0.3, color: '#0058E8' },
  // Kosovo (KO)
  { lat: 42.6629, lng: 21.1655, size: 0.3, color: '#0058E8' },
  // Letónia (LE)
  { lat: 56.946, lng: 24.1059, size: 0.3, color: '#0058E8' },
  // Lituânia (LI)
  { lat: 54.6872, lng: 25.2797, size: 0.3, color: '#0058E8' },
  // Estónia (ES)
  { lat: 59.437, lng: 24.7536, size: 0.3, color: '#0058E8' },
  // Luxemburgo (LU)
  { lat: 49.6116, lng: 6.1319, size: 0.3, color: '#0058E8' },
  // Malta (MA)
  { lat: 35.8997, lng: 14.5146, size: 0.3, color: '#0058E8' },
  // Andorra (AN)
  { lat: 42.5078, lng: 1.5211, size: 0.3, color: '#0058E8' },
  // Mónaco (MO)
  { lat: 43.7384, lng: 7.4246, size: 0.3, color: '#0058E8' },
  // São Marino (SA)
  { lat: 43.9336, lng: 12.4484, size: 0.3, color: '#0058E8' },
  // Islândia (IS) - Repetição
  { lat: 64.1355, lng: -21.8954, size: 0.3, color: '#0058E8' },
  // Liechtenstein (LI)
  { lat: 47.1417, lng: 9.5215, size: 0.3, color: '#0058E8' },
  // (… resto dos pontos exatamente como no teu código original …)
  // Para não te esmagar aqui com 1000 linhas, mantém no teu ficheiro script.js
  // a lista completa de `pontosAdicionais` que já tinhas — podes copiar e colar.
];

// Preparar os pontos de todos os locais
const pointsData = arcsData.map(d => ({
  lat: d.endLat,
  lng: d.endLng,
  size: d.name === 'Lisbon' ? 0.25 : 0.2,
  color: d.name === 'Lisbon' ? '#ffffff' : '#0058E8'
})).concat(pontosAdicionais);

// Labels
const labelsData = arcsData.map(d => ({
  lat: d.endLat,
  lng: d.endLng,
  text: d.name,
  size: 1.001,
  color: 'gray',
  fontFace: 'Arial',
  labelDotRadius: 0.001,
  strokeColor: '#000000',
  strokeWidth: 1.0005
}));

// Cria o globo
const Globe = new ThreeGlobe()
  .globeImageUrl('https://static.wixstatic.com/media/a6967f_cbed4d361eb14d93aff8dcb6ede40613~mv2.jpg')
  .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
  .arcsData(arcsData)
  .arcColor(d => t => {
  const base = new THREE.Color(d.color);       // cor do arco
  const bright = base.clone();
  bright.offsetHSL(0, 0, 0.25);               // clareia no fim

  const color = base.clone().lerp(bright, t);

  // opacidade aumenta ao longo do arco
  const alpha = t;  // 0 no início, 1 no fim
  return `rgba(${Math.round(color.r*255)}, ${Math.round(color.g*255)}, ${Math.round(color.b*255)}, ${alpha})`;
})
  .arcDashLength(0.4)
  .arcDashGap(4)
  .arcDashInitialGap(() => Math.random() * 5)
  .arcDashAnimateTime(1000)
.arcStroke(1)   // ← aumenta a espessura do arco
  .pointsData(pointsData)
  .pointAltitude(0)
  .pointColor('color')
  .pointRadius(0.3)
  .labelsData(labelsData)
  .labelColor('color')
  .labelAltitude(0.01)
  .labelSize('size')
  .labelDotRadius('labelDotRadius')
  .labelText('text')
  .labelResolution(3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
document.getElementById('globeViz').appendChild(renderer.domElement);

// Cena
const scene = new THREE.Scene();
function createRadialGradientTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0.5, size / 2, size / 2, size / 2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.Texture();
  texture.needsUpdate = true;
  return texture;
}
const gradientTexture = createRadialGradientTexture();
scene.background = gradientTexture;

scene.add(Globe);
scene.add(new THREE.AmbientLight(0xffffff, Math.PI));
scene.add(new THREE.DirectionalLight(0xf5f5f5, 4 * Math.PI));

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = -50;
camera.position.y = 200;
camera.position.z = 350;
camera.rotation.x = THREE.MathUtils.degToRad(20);
Globe.rotation.x = THREE.MathUtils.degToRad(-38.7223);
Globe.rotation.y = THREE.MathUtils.degToRad(9.1393);

// Controles
const tbControls = new TrackballControls(camera, renderer.domElement);
tbControls.minDistance = 101;
tbControls.rotateSpeed = 5;
tbControls.zoomSpeed = 0.8;

// Resize
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize);
onWindowResize();

const ROTATE_SPEED = -0.005;
let isRotating = true;

// Chart initialization
function initializeChart() {
  const ctx = document.getElementById('machineChart').getContext('2d');
  const data = {
    labels: ['EUROPA', 'AMÉRICA', 'ÁFRICA', 'ÁSIA', 'Oceânia'],
    datasets: [{
      data: [73.5, 17.9, 0.5, 7.1, 1.0],
      backgroundColor: [
        'rgba(128,128,128,0.8)',
        'rgba(211,211,211,0.8)',
        'rgba(255,255,255,0.8)',
        'rgba(80,80,80,0.8)',
        'rgba(49,47,49,0.8)'
      ],
      hoverBackgroundColor: [
        'rgba(153,153,153,1.0)',
        'rgba(255,255,255,1.0)',
        'rgba(204,204,204,1.0)',
        'rgba(102,102,102,1.0)'
      ],
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1
    }]
  };
  const config = {
    type: 'pie',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (c) {
              let label = c.label || '';
              if (label) label += ': ';
              if (c.parsed !== null) {
                const total = c.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((c.parsed / total) * 100).toFixed(1);
                label += percentage + '%';
              }
              return label;
            }
          },
          bodyColor: '#333',
          titleColor: '#333',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#888',
          borderWidth: 1
        }
      }
    }
  };
  new Chart(ctx, config);
}

// Loop de animação
function animate() {
  requestAnimationFrame(animate);
  if (isRotating) {
    Globe.rotation.y += ROTATE_SPEED;
  }
  tbControls.update();
  renderer.render(scene, camera);
}

// Lógica do botão Play/Pause
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('playPauseBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      isRotating = !isRotating;
      btn.innerHTML = isRotating ? 'Pausar Rotação' : 'Iniciar Rotação';
    });
  }
});

// Inicializar tudo
animate();
initializeChart();