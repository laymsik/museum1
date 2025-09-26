class VirtualMuseum {
    // Добавь этот метод в класс
enableEditMode() {
    this.editMode = true;
    console.log('🔧 Режим редактирования включен!');
    console.log('🖱️ Кликай по панораме чтобы разместить стрелочки');
    
    const container = this.renderer.domElement;
    
    // Удаляем старый обработчик если был
    if (this.editClickListener) {
        container.removeEventListener('click', this.editClickListener);
    }
    
    this.editClickListener = (event) => {
        if (!this.editMode) return;
        
        // Получаем координаты мыши в нормализованных координатах (-1 to +1)
        const mouse = new THREE.Vector2();
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        console.log('🐭 Координаты мыши:', mouse);
        
        // Создаем рейкастер
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Вместо плоскости используем сферу большого радиуса для определения направления
        const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 100);
        const intersectionPoint = new THREE.Vector3();
        
        // Находим точку пересечения луча со сферой
        raycaster.ray.at(10, intersectionPoint); // Берем точку на расстоянии 10 единиц
        
        // Проецируем эту точку на плоскость пола (y = -5)
        const direction = intersectionPoint.clone().normalize();
        const distanceToFloor = (-5 - this.camera.position.y) / direction.y;
        const floorPoint = new THREE.Vector3()
            .copy(this.camera.position)
            .add(direction.multiplyScalar(distanceToFloor));
        
        console.log('🎯 Позиция на полу:', {
            x: Math.round(floorPoint.x * 10) / 10,
            y: Math.round(floorPoint.y * 10) / 10, 
            z: Math.round(floorPoint.z * 10) / 10
        });
        
        // // Визуальный маркер
        // this.addTempMarker(floorPoint);
        
        // Также показываем луч для отладки
        this.showDebugRay(raycaster.ray);
    };
    
    container.addEventListener('click', this.editClickListener);
}

    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentPanorama = null;
        
        this.panoramas = {};
        this.hotspots = [];
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.setupEventListeners();
        this.loadPanoramas();
        this.animate();
        
        this.showLoading('Загрузка музея...');
    }
    
    createScene() {
        this.scene = new THREE.Scene();
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 0.1);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('container').appendChild(this.renderer.domElement);
    }
    
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.3;
        this.controls.enableZoom = true;
        this.controls.zoomSpeed = 0.5;
    }
    
    setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    
    document.getElementById('fullscreen').addEventListener('click', () => {
        this.toggleFullscreen();
    });
    
    
    // ★★★★ ДОБАВЬ ЭТОТ КОД ЗДЕСЬ ★★★★
    document.addEventListener('keydown', (event) => {
        if (event.key === 'e' || event.key === 'у') { // E или русская У
            this.enableEditMode();
        }
        if (event.key === 'p' || event.key === 'з') { // P или русская З
            this.printCurrentPositions();
        }
        if (event.key === 'g' || event.key === 'п') { // G или русская П
            this.showFloorGrid();
        }
    });
    // ★★★★ КОНЕЦ ДОБАВЛЕНИЯ ★★★★
}
    
    loadPanoramas() {
        this.panoramas = {
            'hall1': {
                image: '/hall1.jpg',
                title: 'Музей КФ РГУ СоцТех',
                hotspots: [
                    { 
                        position: { x: -5, y: -3, z: -1.3 },
                        target: 'hall2', 
                        title: 'Вперед',
                        type: 'forward'
                    },
                ]
            },
            'hall2': {
                image: '/hall2.jpg',
                title: 'Музей КФ РГУ СоцТех',
                hotspots: [
                    { 
                        position: { x: -4.2, y: -5, z: -0.3 },
                        target: 'hall1', 
                        title: 'Назад',
                        type: 'forward'
                    },
                    { 
                        position: { x: 5.8, y: -5, z: 0.6 },
                        target: 'hall3', 
                        title: 'Вперед',
                        type: 'forward'
                    }
                ]
            },
            'hall3': {
                image: '/hall3.jpg',
                title: 'Музей КФ РГУ СоцТех',
                hotspots: [
                    { 
                        position: { x: -4.7, y: -5, z: -5.3 },
                        target: 'hall2', 
                        title: 'Назад',
                        type: 'forward'
                    },
                    { 
                        position: {x: 2, y: -5, z: 7.8 },
                        target: 'hall4', 
                        title: 'Вперед',
                        type: 'forward'
                    }
                ]
            },
            'hall4': {
                image: '/hall4.jpg',
                title: 'Музей КФ РГУ СоцТех',
                hotspots: [
                    { 
                        position: { x: -2.3, y: -5, z: -6.5 },
                        target: 'hall3', 
                        title: 'Назад',
                        type: 'forward'
                    },
                    { 
                        position: { x: 3.1, y: -5, z: 11.4 },
                        target: 'hall5', 
                        title: 'Вперед',
                        type: 'forward'
                    }
                ]
            },
            'hall5': {
                image: '/hall5.jpg',
                title: 'Музей КФ РГУ СоцТех',
                hotspots: [
                    { 
                        position: { x: -11.8, y: -5, z: 1.8 },
                        target: 'hall4', 
                        title: 'Назад',
                        type: 'forward'
                    },
                ]
            }
        };
        
        this.loadPanorama('hall1');
    }

    showFloorGrid() {
    // Создаем сетку пола для ориентира
    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
    gridHelper.position.y = -5;
    this.scene.add(gridHelper);
    
    // Стрелки направлений
    const directions = [
        { color: 0xff0000, position: [0, -4, -10], label: 'ВПЕРЕД' },
        { color: 0x00ff00, position: [-10, -4, 0], label: 'ЛЕВО' },
        { color: 0x0000ff, position: [10, -4, 0], label: 'ПРАВО' },
        { color: 0xffff00, position: [0, -4, 10], label: 'НАЗАД' }
    ];
    
    directions.forEach(dir => {
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(dir.position[0], 0, dir.position[2]).normalize(),
            new THREE.Vector3(dir.position[0], dir.position[1], dir.position[2]),
            3,
            dir.color
        );
        this.scene.add(arrow);
    });
}
    
loadPanorama(panoramaId) {
    const panoramaData = this.panoramas[panoramaId];
    if (!panoramaData) {
        console.error('Панорама не найдена:', panoramaId);
        return;
    }

    this.showLoading('Загрузка...');
    
    // ★★★★ УБИРАЕМ ВСЮ АНИМАЦИЮ - МГНОВЕННЫЙ ПЕРЕХОД ★★★★
    
    // Очищаем сцену
    while(this.scene.children.length > 0) { 
        this.scene.remove(this.scene.children[0]); 
    }
    
    // Удаляем старые горячие точки
    this.clearHotspots();
    
    // Создаем текстуру панорамы
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(panoramaData.image, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        // Создаем сферу для панорамы
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);
        
        this.currentPanorama = panoramaId;
        this.updateTitle(panoramaData.title);
        
        // ★★★★ СРАЗУ создаем стрелочки ★★★★
        this.createHotspots(panoramaData.hotspots);
        
        this.hideLoading();
        
    }, undefined, (error) => {
        console.error('Ошибка загрузки текстуры:', error);
        this.hideLoading();
        alert('Ошибка загрузки панорамы. Проверьте путь к файлу: ' + panoramaData.image);
    });
}
    
    createHotspots(hotspotsData) {
    // Сразу создаем все стрелочки без задержки
    hotspotsData.forEach((hotspotData, index) => {
        this.createHotspot(hotspotData);
    });
    
    // Сразу обновляем позиции
    this.updateAllHotspots();
}

updateAllHotspots() {
    if (!this.currentPanorama) return;
    
    const panoramaData = this.panoramas[this.currentPanorama];
    if (!panoramaData || !panoramaData.hotspots) return;
    
    panoramaData.hotspots.forEach((hotspotData, index) => {
        if (this.hotspots[index]) {
            this.updateHotspotPosition(this.hotspots[index], hotspotData.position);
        }
    });
}
    
    createHotspot(hotspotData) {
        const hotspot = document.createElement('div');
        hotspot.className = 'floor-hotspot';
        hotspot.dataset.target = hotspotData.target;
        
        // Добавляем класс в зависимости от типа стрелки
        if (hotspotData.type) {
            hotspot.classList.add(`turn-${hotspotData.type}`);
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'hotspot-tooltip';
        tooltip.textContent = hotspotData.title;
        hotspot.appendChild(tooltip);
        
        document.getElementById('container').appendChild(hotspot);
        
        // Сохраняем для последующего удаления
        this.hotspots.push(hotspot);
        
        // Обработчик клика
        hotspot.addEventListener('click', () => {
            this.loadPanorama(hotspotData.target);
        });
        
        // Обновляем позицию
        this.updateHotspotPosition(hotspot, hotspotData.position);
    }
    
    updateHotspotPosition(hotspot, worldPosition) {
        const vector = new THREE.Vector3(
            worldPosition.x,
            worldPosition.y,
            worldPosition.z
        );
        
        // Конвертируем мировые координаты в экранные
        vector.project(this.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        
        // Проверяем, находится ли точка перед камерой
        const isInFront = vector.z < 1;
        
        hotspot.style.left = (x - 30) + 'px';
        hotspot.style.top = (y - 30) + 'px';
        hotspot.style.display = isInFront ? 'flex' : 'none';
        
        // Прозрачность в зависимости от расстояния
        // const distance = Math.max(0, Math.min(1, 1 - vector.z));
        // hotspot.style.opacity = isInFront ? distance : '0';
    }
    
    clearHotspots() {
        this.hotspots.forEach(hotspot => {
            if (hotspot.parentNode) {
                hotspot.parentNode.removeChild(hotspot);
            }
        });
        this.hotspots = [];
    }
    
    updateHotspots() {
        if (!this.currentPanorama) return;
        
        const panoramaData = this.panoramas[this.currentPanorama];
        if (!panoramaData || !panoramaData.hotspots) return;
        
        panoramaData.hotspots.forEach((hotspotData, index) => {
            if (this.hotspots[index]) {
                this.updateHotspotPosition(this.hotspots[index], hotspotData.position);
            }
        });
    }
    
    updateTitle(title) {
        document.getElementById('title').textContent = title;
    }
    
    showLoading(message) {
        const loadingEl = document.getElementById('loading');
        loadingEl.textContent = message;
        loadingEl.style.display = 'block';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Ошибка полноэкранного режима:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Методы для анимации перехода (закомментированы для отладки)
//     fadeOut(callback, duration = 300) { // 300ms вместо 500ms
//     const overlay = document.createElement('div');
//     overlay.style.cssText = `
//         position: fixed; 
//         top: 0; 
//         left: 0; 
//         width: 100%; 
//         height: 100%; 
//         background: black; 
//         z-index: 9999;
//         opacity: 0; 
//         transition: opacity ${duration}ms ease-out; /* ease-out быстрее */
//         pointer-events: none;
//     `;
//     document.body.appendChild(overlay);
    
//     setTimeout(() => {
//         overlay.style.opacity = '1';
//         setTimeout(() => {
//             if (overlay.parentNode) {
//                 document.body.removeChild(overlay);
//             }
//             callback();
//         }, duration);
//     }, 10);
// }

// fadeIn(callback, duration = 200) { // 200ms - еще быстрее
//     const overlay = document.createElement('div');
//     overlay.style.cssText = `
//         position: fixed; 
//         top: 0; 
//         left: 0; 
//         width: 100%; 
//         height: 100%; 
//         background: black; 
//         z-index: 9999;
//         opacity: 1; 
//         transition: opacity ${duration}ms ease-in; /* ease-in быстрее */
//         pointer-events: none;
//     `;
//     document.body.appendChild(overlay);
    
//     setTimeout(() => {
//         overlay.style.opacity = '0';
//         setTimeout(() => {
//             if (overlay.parentNode) {
//                 document.body.removeChild(overlay);
//             }
//             callback();
//         }, duration);
//     }, 10);
// }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.updateHotspots();
        this.renderer.render(this.scene, this.camera);
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new VirtualMuseum();
});