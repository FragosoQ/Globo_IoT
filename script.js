import ThreeGlobe from 'https://esm.sh/three-globe?external=three';
import * as THREE from "https://esm.sh/three";
import { TrackballControls } from 'https://esm.sh/three/examples/jsm/controls/TrackballControls.js';

// URL do Google Script que retorna o JSON
const DATA_URL = 'https://script.google.com/macros/s/AKfycbzr1NKomn0Uo3wY-6kXQPaNv6DokUc4esIYBKzW4_SwNDV43wweAOulnraFfGtAh6ww/exec';

// Variável para controlar a rotação
const ROTATE_SPEED = -0.005;
let isRotating = true;

// Renderer, Scene e Camera são definidos no escopo global para serem acessíveis em onWindowResize e animate
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let Globe; // Será inicializado dentro da função assíncrona
let tbControls; // Será inicializado dentro da função assíncrona


// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
async function init() {
    try {
        // 1. CARREGAR DADOS DO URL (ASYNC)
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        // O JSON retornado do seu link conterá TODOS os arcos (incluindo Lisboa e Porto como end points)
        const todosOsArcos = await response.json(); 
        
        console.log("Dados carregados com sucesso:", todosOsArcos.length, "registos.");

        // 2. PREPARAÇÃO DOS DADOS (IDÊNTICO À LÓGICA ANTERIOR)

        // Preparar os pontos de todos os locais (extraindo de TODOS os arcos)
        const pointsData = todosOsArcos.map(d => ({
            lat: d.endLat,
            lng: d.endLng,
            // Destaca Lisboa (LIS) e Porto (OPO) - Assumindo que o nome é o código IATA ou o nome da cidade
            size: d.name === 'LIS' || d.name === 'OPO' || d.name === 'Lisbon' || d.name === 'Porto' ? 0.25 : 0.2, 
            color: d.name === 'LIS' || d.name === 'Lisbon' ? '#ffffff' : '#0058E8' // Cor para Lisboa
        }));

        // Labels (extraindo de TODOS os arcos)
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

        // 3. CRIAÇÃO DO GLOBO
        Globe = new ThreeGlobe()
            .globeImageUrl('https://static.wixstatic.com/media/a6967f_cbed4d361eb14d93aff8dcb6ede40613~mv2.jpg')
            .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
            .arcsData(todosOsArcos) // <--- Dados carregados dinamicamente
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
        
        // Fundo (continua o mesmo)
        const gradientTexture = createRadialGradientTexture();
        scene.background = gradientTexture;
        
        scene.add(Globe);
        scene.add(new THREE.AmbientLight(0xffffff, Math.PI));
        scene.add(new THREE.DirectionalLight(0xf5f5f5, 4 * Math.PI));

        // Posição da Câmera
        camera.position.x = -50;
        camera.position.y = 200;
        camera.position.z = 350;
        camera.rotation.x = THREE.MathUtils.degToRad(20);
        
        // Posição inicial do Globo (rotacionado para a área de interesse)
        Globe.rotation.x = THREE.MathUtils.degToRad(-38.7223);
        Globe.rotation.y = THREE.MathUtils.degToRad(9.1393);

        // Controles
        tbControls = new TrackballControls(camera, renderer.domElement);
        tbControls.minDistance = 101;
        tbControls.rotateSpeed = 5;
        tbControls.zoomSpeed = 0.8;

        // Inicia o loop de animação e o gráfico
        onWindowResize();
        animate();
        initializeChart();

    } catch (error) {
        console.error("Erro ao carregar ou processar os dados:", error);
        // Opcional: Adicionar uma mensagem de erro ao DOM para o utilizador
        document.getElementById('globeViz').innerHTML = "Falha ao carregar os dados do mapa. Verifique a consola para detalhes.";
    }
}


// --- FUNÇÕES DE SETUP E ANIMAÇÃO (mantidas) ---

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

// Resize
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize);


// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    // Verificar se o Globe e tbControls já foram inicializados
    if (Globe && tbControls) { 
        if (isRotating) {
            Globe.rotation.y += ROTATE_SPEED;
        }
        tbControls.update();
        renderer.render(scene, camera);
    }
}


// Chart initialization (mantido, mas agora chamado após o carregamento do globo)
function initializeChart() {
    // ... (Seu código do Chart.js aqui) ...
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


// Lógica do botão Play/Pause (mantida)
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            isRotating = !isRotating;
            btn.innerHTML = isRotating ? 'Pausar Rotação' : 'Iniciar Rotação';
        });
    }
});


// --- INÍCIO DA APLICAÇÃO ---
init();
