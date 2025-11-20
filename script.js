import ThreeGlobe from 'https://esm.sh/three-globe?external=three';
import * as THREE from "https://esm.sh/three";
import { TrackballControls } from 'https://esm.sh/three/examples/jsm/controls/TrackballControls.js';

// --- 1. IMPORTAR FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 2. CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDJMjPLeP2IwgmoL25Y5Sj93OonucFsJRE",
  authDomain: "bdcountries.firebaseapp.com",
  projectId: "bdcountries",
  storageBucket: "bdcountries.firebasestorage.app",
  messagingSenderId: "6903838880",
  appId: "1:6903838880:web:57170ac8594ceeac19b1c5",
  measurementId: "G-LW8DN02YNP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROTATE_SPEED = -0.005;
const IS_MOBILE = window.innerWidth < 768;

// --- VARIÁVEIS GLOBAIS ---
let isRotating = true;
let Globe;
let tbControls;

const renderer = new THREE.WebGLRenderer({ 
    antialias: !IS_MOBILE, 
    powerPreference: "high-performance",
    alpha: false 
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// --- INICIALIZAÇÃO ---
function init() {
    createGlobeBase();
    setupScene();
    animate();

    // 1. Carrega o Globo (Coleção 'paises')
    loadData();

    // 2. Carrega o Gráfico (Coleção 'continentes')
    loadChartData();
}

function createGlobeBase() {
    Globe = new ThreeGlobe()
        .globeImageUrl('https://static.wixstatic.com/media/a6967f_41ed68ec835e4ed8a883f6977a948234~mv2.webp')
        .bumpImageUrl('https://static.wixstatic.com/media/a6967f_6fb6649008654e25b3ec9fac0260931b~mv2.webp')
        .showAtmosphere(true)
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.15);

    const globeMaterial = Globe.globeMaterial();
    globeMaterial.transparent = true; 
    globeMaterial.opacity = 1;
    globeMaterial.color = new THREE.Color(0x000000);
    
    scene.add(Globe);
}

function setupScene() {
    renderer.setPixelRatio(Math.min(IS_MOBILE ? 1 : 2, window.devicePixelRatio));
    const container = document.getElementById('globeViz');
    
    if(container) {
        container.appendChild(renderer.domElement);
    } else {
        console.warn("Elemento #globeViz não encontrado");
    }

    scene.background = createRadialGradientTexture();
    
    scene.add(new THREE.AmbientLight(0xffffff, Math.PI));
    scene.add(new THREE.DirectionalLight(0xf5f5f5, 4 * Math.PI));

    camera.position.set(-50, 200, 350);
    camera.rotation.x = THREE.MathUtils.degToRad(20);
    
    if (Globe) {
        Globe.rotation.x = THREE.MathUtils.degToRad(-5.667);
        Globe.rotation.y = THREE.MathUtils.degToRad(-20.0);
    }

    tbControls = new TrackballControls(camera, renderer.domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 5;
    tbControls.zoomSpeed = 0.8;
    
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
}

// --- CARREGAMENTO DO GLOBO (Paises) ---
async function loadData() {
    try {
        const cachedData = localStorage.getItem('globeDataFirebase');
        if (cachedData) {
            console.log("⚡ Globo: Carregando do cache...");
            processData(JSON.parse(cachedData));
            
            // Atualiza contador com dados do cache (opcional, mas bom para UX)
            const cachedArr = JSON.parse(cachedData);
            const counterEl = document.getElementById('total-machines');
            if(counterEl) counterEl.innerText = cachedArr.length;
        }

        console.log("📡 Globo: Conectando ao Firebase...");
        const querySnapshot = await getDocs(collection(db, "paises"));
        
        const firebaseData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            firebaseData.push({
                name: doc.id,
                startLat: data.startLat,
                startLng: data.startLng,
                endLat: data.endLat,
                endLng: data.endLng,
                color: data.color
            });
        });

        // --- NOVO: Atualiza o número total no HTML ---
        const counterElement = document.getElementById('total-machines');
        if (counterElement) {
            counterElement.innerText = firebaseData.length;
        }
        // ---------------------------------------------

        if (firebaseData.length > 0) {
            if (JSON.stringify(firebaseData) !== cachedData) {
                console.log("✅ Globo: Dados atualizados!");
                localStorage.setItem('globeDataFirebase', JSON.stringify(firebaseData));
                processData(firebaseData);
            }
        } else {
            console.log("⚠️ Globo: Nenhum dado encontrado.");
        }

    } catch (error) {
        console.error("❌ Globo: Erro ao carregar:", error);
    }
}

// --- CARREGAMENTO DO GRÁFICO (Continentes) ---
async function loadChartData() {
    try {
        console.log("📡 Gráfico: A ler coleção 'continentes'...");
        const querySnapshot = await getDocs(collection(db, "continentes"));

        const labels = [];
        const values = [];
        const colors = [];

        querySnapshot.forEach((doc) => {
            const d = doc.data();
            labels.push(doc.id); 
            values.push(d.value);
            colors.push(d.color || '#cccccc'); 
        });

        if (labels.length > 0) {
            console.log("✅ Gráfico: Dados recebidos:", labels);
            initializeChart(labels, values, colors);
        } else {
            console.warn("⚠️ Gráfico: Coleção vazia.");
        }

    } catch (error) {
        console.error("❌ Gráfico: Erro ao carregar:", error);
    }
}


function processData(todosOsArcos) {
    if (!Globe) return;

    const pointsData = todosOsArcos.map(d => ({
        lat: d.endLat,
        lng: d.endLng,
        size: ['LIS', 'OPO', 'Lisbon', 'Porto', 'PORTUGAL', 'DUBAI', 'LISBOA'].includes(d.name) ? 0.25 : 0.2, 
        color: ['LIS', 'Lisbon', 'PORTUGAL', 'DUBAI', 'LISBOA'].includes(d.name) ? '#ffffff' : '#0058E8'
    }));

    Globe
        .arcsData(todosOsArcos)
        .arcColor(d => {
            return ['rgba(0,88,232,0.8)', 'rgba(255,255,255,0.8)']; 
        })
        .arcDashLength(0.4)
        .arcDashGap(4)
        .arcDashInitialGap(() => Math.random() * 5)
        .arcDashAnimateTime(2000)
        .pointsData(pointsData)
        .pointColor('color')
        .pointRadius(0.3)
        .pointAltitude(0.000001);
}

// --- AUXILIARES ---
function createRadialGradientTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0.5, size / 2, size / 2, size / 2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.Texture(canvas); 
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
    if (Globe && isRotating) Globe.rotation.y += ROTATE_SPEED;
    if (tbControls) tbControls.update();
    renderer.render(scene, camera);
}

// --- GRÁFICO DINÂMICO E LEGENDA HTML ---
function initializeChart(labelsFromDB, valuesFromDB, colorsFromDB) {
    const chartElement = document.getElementById('machineChart');
    const listElement = document.getElementById('chart-details'); // ID da lista UL no HTML
    
    if (!chartElement) return;

    const ctx = chartElement.getContext('2d');
    
    const data = {
        labels: labelsFromDB, 
        datasets: [{
            data: valuesFromDB, 
            backgroundColor: colorsFromDB, 
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
                legend: { display: false }, // Esconde a legenda do próprio Canvas
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

    // Destrói gráfico antigo se existir para evitar sobreposição
    if (window.myPieChart) {
        window.myPieChart.destroy();
    }
    window.myPieChart = new Chart(ctx, config);

    // --- GERAÇÃO DA LISTA HTML (LEGENDA) ---
    if (listElement) {
        listElement.innerHTML = ''; // Limpa lista antiga
        
        // Calcula total para as percentagens
        const total = valuesFromDB.reduce((a, b) => a + b, 0);

        labelsFromDB.forEach((label, index) => {
            const value = valuesFromDB[index];
            const color = colorsFromDB[index];
            const percentage = ((value / total) * 100).toFixed(1) + '%';

            // Cria o elemento LI
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="color-swatch" style="background-color: ${color};"></span>
                <span class="label-text">${label}</span>
                <span class="chart-percentage">${percentage}</span>
            `;
            listElement.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnPlayPause = document.getElementById('playPauseBtn');
    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            isRotating = !isRotating;
            btnPlayPause.innerHTML = isRotating ? 'Pausar Rotação' : 'Iniciar Rotação';
        });
    }
    init();
});
