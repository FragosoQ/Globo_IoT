import ThreeGlobe from 'https://esm.sh/three-globe?external=three';
import * as THREE from "https://esm.sh/three";
import { TrackballControls } from 'https://esm.sh/three/examples/jsm/controls/TrackballControls.js';


// **IMPORTAÇÃO DOS DADOS DO NOVO FICHEIRO**
// Certifique-se que o caminho ('./globe-países.js') está correto
import { arcsData, pontosAdicionais } from './globe-países.js';



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
