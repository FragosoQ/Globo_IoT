import ThreeGlobe from 'https://esm.sh/three-globe?external=three';
import * as THREE from "https://esm.sh/three";
import { TrackballControls } from 'https://esm.sh/three/examples/jsm/controls/TrackballControls.js';

// URL do Google Script que retorna o JSON
const DATA_URL = 'https://script.google.com/macros/s/AKfycbzr1NKomn0Uo3wY-6kXQPaNv6DokUc4esIYBKzW4_SwNDV43wweAOulnraFfGtAh6ww/exec';

// Variável para controlar a rotação e a velocidade
const ROTATE_SPEED = -0.005;
let isRotating = true;

// Definições da Posição Inicial
// --- CÂMARA ---
const INITIAL_CAMERA_POS_X = -50;
const INITIAL_CAMERA_POS_Y = 200;
const INITIAL_CAMERA_POS_Z = 350;
const INITIAL_CAMERA_ROT_X = THREE.MathUtils.degToRad(20);

// --- GLOBO (FOCO NA REPÚBLICA CENTRO-AFRICANA) ---
const INITIAL_GLOBE_ROTATION_X = THREE.MathUtils.degToRad(-5.667); // Negativo para N
const INITIAL_GLOBE_ROTATION_Y = THREE.MathUtils.degToRad(-20.0); // Negativo para E

// Renderer, Scene e Camera são definidos no escopo global
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let Globe; // Inicializado dentro da função assíncrona
let tbControls; // Inicializado dentro da função assíncrona


// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
async function init() {
    try {
        // 1. CARREGAR DADOS DO URL (ASYNC)
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const todosOsArcos = await response.json(); 
        
        console.log("Dados carregados com sucesso:", todosOsArcos.length, "registos.");

        // 2. PREPARAÇÃO DOS DADOS
        
        // 2.1 Preparar os PONTOS (Mantemos os dados originais para as bolhas ficarem no destino correto)
        const pointsData = todosOsArcos.map(d => ({
            lat: d.endLat,
            lng: d.endLng,
            size: d.name === 'LIS' || d.name === 'OPO' || d.name === 'Lisbon' || d.name === 'Porto' ? 0.25 : 0.2, 
            color: d.name === 'LIS' || d.name === 'Lisbon' ? '#ffffff' : '#0058E8'
        }));

        // 2.2 Preparar as LABELS (Mantemos os dados originais)
        const labelsData = todosOsArcos.map(d => ({
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

        /*// 2.3 Preparar os ARCOS ALEATÓRIOS (MIX DE DIREÇÕES)
        const arcosAleatorios = todosOsArcos.map(d => {
            // Gera um número entre 0 e 1. Se for > 0.5, inverte o sentido.
            if (Math.random() > 0.7) {
                return {
                    ...d, 
                    startLat: d.endLat, // Inverte: Fim vira Início
                    startLng: d.endLng,
                    endLat: d.startLat, // Inverte: Início vira Fim
                    endLng: d.startLng
                };
            } else {
                // Mantém o sentido original
                return d;
            }
        });*/

        // 3. CRIAÇÃO DO GLOBO
        Globe = new ThreeGlobe()
           //.globeImageUrl('https://static.wixstatic.com/media/a6967f_c8009fd3be5a499782d5b778a2f7483e~mv2.png')
            .globeImageUrl('https://static.wixstatic.com/media/a6967f_c8009fd3be5a499782d5b778a2f7483e~mv2.png')
            .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
            // AQUI USAMOS OS DADOS MISTURADOS/ALEATÓRIOS
            .arcsData(arcosAleatorios) 
            .arcColor(d => t => {
                const base = new THREE.Color(d.color);       
                const bright = base.clone();
                bright.offsetHSL(0, 0, 0.25);                
                const color = base.clone().lerp(bright, t);
                const alpha = t;  
                return `rgba(${Math.round(color.r*255)}, ${Math.round(color.g*255)}, ${Math.round(color.b*255)}, ${alpha})`;
            })
            .arcDashLength(0.4)
            .arcDashGap(4)
            .arcDashInitialGap(() => Math.random() * 5)
            .arcDashAnimateTime(1000)
            .arcStroke(1)   
            // AQUI USAMOS OS DADOS ORIGINAIS (Pontos fixos)
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

        // 4. CONFIGURAÇÃO DA CENA E CÂMERA
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        document.getElementById('globeViz').appendChild(renderer.domElement);
        
        // Fundo
        const gradientTexture = createRadialGradientTexture();
        scene.background = gradientTexture;
        
        scene.add(Globe);
        scene.add(new THREE.AmbientLight(0xffffff, Math.PI));
        scene.add(new THREE.DirectionalLight(0xf5f5f5, 4 * Math.PI));

        // Posição inicial da Câmera e Globo
        camera.position.set(INITIAL_CAMERA_POS_X, INITIAL_CAMERA_POS_Y, INITIAL_CAMERA_POS_Z);
        camera.rotation.x = INITIAL_CAMERA_ROT_X;
        
        Globe.rotation.x = INITIAL_GLOBE_ROTATION_X;
        Globe.rotation.y = INITIAL_GLOBE_ROTATION_Y;

        // Controles
        tbControls = new TrackballControls(camera, renderer.domElement);
        tbControls.minDistance = 101;
        tbControls.rotateSpeed = 5;
        tbControls.zoomSpeed = 0.8;

        // Inicia
        onWindowResize();
        animate();
        initializeChart();

    } catch (error) {
        console.error("Erro ao carregar ou processar os dados:", error);
        document.getElementById('globeViz').innerHTML = "Falha ao carregar os dados do mapa.";
    }
}


// --- FUNÇÕES AUXILIARES ---

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

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize);

function animate() {
    requestAnimationFrame(animate);
    if (Globe && tbControls) { 
        if (isRotating) {
            Globe.rotation.y += ROTATE_SPEED;
        }
        tbControls.update();
        renderer.render(scene, camera);
    }
}

function initializeChart() {
    const ctx = document.getElementById('machineChart').getContext('2d');
    const data = {
        labels: ['EUROPA', 'AMÉRICA', 'ÁFRICA', 'ÁSIA', 'Oceânia'],
        datasets: [{
            data: [73.5, 17.9, 0.5, 7.1, 1.0],
            backgroundColor: ['rgba(128,128,128,0.8)', 'rgba(211,211,211,0.8)', 'rgba(255,255,255,0.8)', 'rgba(80,80,80,0.8)', 'rgba(49,47,49,0.8)'],
            hoverBackgroundColor: ['rgba(153,153,153,1.0)', 'rgba(255,255,255,1.0)', 'rgba(204,204,204,1.0)', 'rgba(102,102,102,1.0)'],
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


// --- LÓGICA DE INTERAÇÃO DO DOM (TECLADO, RATO, BOTÕES) ---
document.addEventListener('DOMContentLoaded', () => {

    // 3. LÓGICA DO BOTÃO PLAY/PAUSE
    const btnPlayPause = document.getElementById('playPauseBtn');
    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            isRotating = !isRotating;
            
            if (isRotating && Globe && tbControls) {
                // Repor rotações e posições
                Globe.rotation.x = INITIAL_GLOBE_ROTATION_X;
                Globe.rotation.y = INITIAL_GLOBE_ROTATION_Y;
                camera.position.set(INITIAL_CAMERA_POS_X, INITIAL_CAMERA_POS_Y, INITIAL_CAMERA_POS_Z);
                camera.rotation.x = INITIAL_CAMERA_ROT_X;
                tbControls.reset(); 
            }
            
            btnPlayPause.innerHTML = isRotating ? 'Pausar Rotação' : 'Iniciar Rotação';
        });
    }
});

// --- INÍCIO DA APLICAÇÃO ---
init();
