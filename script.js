import ThreeGlobe from 'https://esm.sh/three-globe?external=three';
import * as THREE from "https://esm.sh/three";
import { TrackballControls } from 'https://esm.sh/three/examples/jsm/controls/TrackballControls.js';

// --- CONFIGURAÇÕES ---
const DATA_URL = 'https://script.google.com/macros/s/AKfycbzr1NKomn0Uo3wY-6kXQPaNv6DokUc4esIYBKzW4_SwNDV43wweAOulnraFfGtAh6ww/exec';
const ROTATE_SPEED = -0.005;
const IS_MOBILE = window.innerWidth < 768; // Detectar mobile simples

// --- VARIÁVEIS GLOBAIS ---
let isRotating = true;
let Globe;
let tbControls;

// Otimização: Desligar antialias em mobile para ganhar FPS
const renderer = new THREE.WebGLRenderer({ 
    antialias: !IS_MOBILE, 
    powerPreference: "high-performance",
    alpha: false // Se tiver fundo opaco, false ajuda
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// --- INICIALIZAÇÃO IMEDIATA (Renderiza antes dos dados) ---
function init() {
    // 1. Configurar o Globo Vazio (Visual Instantâneo)
    createGlobeBase();
    
    // 2. Configurar Cena e Renderização
    setupScene();
    
    // 3. Iniciar Loop de Animação
    animate();

    // 4. Carregar Dados em Segundo Plano (Não bloqueia a tela)
    loadData();

    // 5. Inicializar Gráfico (Se não depender dos dados do geojson)
    initializeChart();
}

function createGlobeBase() {
    Globe = new ThreeGlobe()
        .globeImageUrl('https://static.wixstatic.com/media/a6967f_41ed68ec835e4ed8a883f6977a948234~mv2.webp')
        .bumpImageUrl('https://static.wixstatic.com/media/a6967f_6fb6649008654e25b3ec9fac0260931b~mv2.webp')
        .showAtmosphere(true) // Atmosfera é leve e bonita
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.15);

    // Material Otimizado
    const globeMaterial = Globe.globeMaterial();
    // Transparência é custosa. Se puder evitar, melhor. 
    // Se precisar manter, use depthWrite false para ajudar no sorting.
    globeMaterial.transparent = true; 
    globeMaterial.opacity = 0.3;
    globeMaterial.color = new THREE.Color(0x000000);
    
    scene.add(Globe);
}

function setupScene() {
    // Otimização: Pixel Ratio travado em 2 no máximo, 1 em mobile
    renderer.setPixelRatio(Math.min(IS_MOBILE ? 1 : 2, window.devicePixelRatio));
    const container = document.getElementById('globeViz');
    
    if(container) {
        container.appendChild(renderer.domElement);
    } else {
        console.warn("Elemento #globeViz não encontrado");
    }

    // Fundo (Gradient Texture é leve, ok manter)
    scene.background = createRadialGradientTexture();
    
    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, Math.PI));
    scene.add(new THREE.DirectionalLight(0xf5f5f5, 4 * Math.PI));

    // Câmera
    camera.position.set(-50, 200, 350);
    camera.rotation.x = THREE.MathUtils.degToRad(20);
    
    // Globo Posição Inicial
    if (Globe) {
        Globe.rotation.x = THREE.MathUtils.degToRad(-5.667);
        Globe.rotation.y = THREE.MathUtils.degToRad(-20.0);
    }

    // Controls
    tbControls = new TrackballControls(camera, renderer.domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 5;
    tbControls.zoomSpeed = 0.8;
    
    // Resize
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
}

// --- CARREGAMENTO DE DADOS ---
async function loadData() {
    try {
        // Tentar pegar do Cache primeiro
        const cachedData = localStorage.getItem('globeData');
        if (cachedData) {
            console.log("Carregando do cache...");
            processData(JSON.parse(cachedData));
        }

        // Buscar dados novos
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Erro na API');
        
        const data = await response.json();
        
        // Se os dados mudaram ou não tinha cache, atualiza e salva
        if (JSON.stringify(data) !== cachedData) {
            console.log("Dados atualizados da API.");
            localStorage.setItem('globeData', JSON.stringify(data));
            processData(data);
        }

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Se falhar e não tiver cache, mostra erro na UI
    }
}

function processData(todosOsArcos) {
    if (!Globe) return;

    // Prepara dados (Mesma lógica sua, apenas movida para cá)
    const pointsData = todosOsArcos.map(d => ({
        lat: d.endLat,
        lng: d.endLng,
        size: ['LIS', 'OPO', 'Lisbon', 'Porto'].includes(d.name) ? 0.25 : 0.2, 
        color: ['LIS', 'Lisbon'].includes(d.name) ? '#ffffff' : '#0058E8'
    }));

   /* const labelsData = todosOsArcos.map(d => ({
        lat: d.endLat,
        lng: d.endLng,
        text: d.name,
        size: 0.001,
        color: 'gray',
        fontFace: 'Arial' // Fontes padrão carregam mais rápido que custom
    }));*/

    // Atualiza o Globo EXISTENTE
    Globe
        .arcsData(todosOsArcos)
        .arcColor(d => {
            // Otimização: Evitar criar novos objetos THREE.Color a cada frame se possível
            // A string interpolation é rápida, mas a lógica aqui é pesada para muitos arcos.
            // Simplifiquei para reduzir custo de CPU na renderização.
            return ['rgba(0,88,232,0.8)', 'rgba(255,255,255,0.8)']; 
        })
        .arcDashLength(0.4)
        .arcDashGap(4)
        .arcDashInitialGap(() => Math.random() * 5)
        .arcDashAnimateTime(2000) // Aumentar tempo reduz carga de atualização visual
        .pointsData(pointsData)
        .pointColor('color')
        .pointRadius(0.3)
  
  // 👇 ADICIONE ESTA LINHA AQUI 👇
        .pointAltitude(0) 
        // 👆 0.05 é a altura (ajuste conforme necessário) 👆
  
        .labelsData(labelsData)
        .labelColor('blue')
        .labelSize('size')
        .labelText('text')
        .labelResolution(0); // OTIMIZAÇÃO: Reduzido de 3 para 1.5 (menos memória)
}


// --- AUXILIARES E ANIMAÇÃO ---

function createRadialGradientTexture() {
    // (Manteve-se igual, é leve o suficiente)
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0.5, size / 2, size / 2, size / 2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.Texture(canvas); // Passar canvas direto no construtor
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

function animate() {
    requestAnimationFrame(animate);
    
    if (Globe) { 
        if (isRotating) {
            Globe.rotation.y += ROTATE_SPEED;
        }
    }
    
    if (tbControls) tbControls.update();
    renderer.render(scene, camera);
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

// DOM Events
document.addEventListener('DOMContentLoaded', () => {
    const btnPlayPause = document.getElementById('playPauseBtn');
    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            isRotating = !isRotating;
            btnPlayPause.innerHTML = isRotating ? 'Pausar Rotação' : 'Iniciar Rotação';
        });
    }
    // Inicia app
    init();
});
