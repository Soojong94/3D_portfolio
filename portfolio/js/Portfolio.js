// Portfolio.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Building } from './Building.js';
import { InfoPanel } from './InfoPanel.js';
import { Character } from './Character.js';

export class Portfolio {
  constructor(containerId) {
    // DOM container
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id '${containerId}' not found.`);
    }

    // Bind event methods
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
    this.animate = this.animate.bind(this);

    // Info panel
    this.infoPanel = new InfoPanel();

    // Cache for geometries and materials
    this.geometryCache = {};
    this.materialCache = {};

    // Initialize scene, camera, renderer
    this.initScene();
    this.initCamera();
    this.initRenderer();

    // Set up lights
    this.setupLights();

    // Building collections
    this.buildings = [];
    this.visibleBuildings = new Set();

    // Raycaster for mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Create city
    this.createCity();

    // Handle mouse click
    window.addEventListener('click', this.onMouseClick);

    // Animation clock
    this.clock = new THREE.Clock();

    // Frustum for culling
    this.frustum = new THREE.Frustum();
    this.projScreenMatrix = new THREE.Matrix4();

    // Start animation loop
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    // Optional: Add fog for better LOD transitions
    this.scene.fog = new THREE.Fog(0xf0f5f9, 70, 150);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 10, 20); // 시작 카메라 위치 조정
    this.camera.lookAt(0, 0, 0);
  }

  initRenderer() {
    // Use powerPreference for better performance
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2, // 고해상도 기기에서는 안티앨리어싱 끄기
      powerPreference: "high-performance",
      canvas: this.canvas
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xf0f5f9);

    // 그림자 최적화
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false; // 정적 장면에서는 수동으로 업데이트

    // 렌더러 픽셀 비율 최적화
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);

    this.container.appendChild(this.renderer.domElement);

    // OrbitControls 설정 수정
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // 캐릭터 모드일 때는 OrbitControls 비활성화
    this.controls.enabled = false; // 캐릭터 모드 기본값
  }

  // 추가: 캐릭터 모드 초기화
  initCharacterMode() {
    // 지면 메시 찾기
    let ground = null;
    this.scene.traverse((child) => {
      if (child.name === 'ground') {
        ground = child;
      }
    });

    // 캐릭터 생성
    this.character = new Character(this.scene, this.camera, ground);

    // GLB 모델 경로 (실제 모델로 교체 필요)
    const modelPath = './assets/character.glb'; // 실제 파일로 교체 필요

    // 모델 로드 시도 (실패해도 임시 모델로 계속 진행)
    try {
      this.character.loadModel(modelPath);
    } catch (error) {
      console.warn('캐릭터 모델 로드 실패, 임시 모델 사용:', error);
    }

    // 미니맵 생성
    this.createMinimap();

    // 모드 설정
    this.characterMode = true;
  }

  createMinimap() {
    // 미니맵 컨테이너 생성
    const minimapContainer = document.createElement('div');
    minimapContainer.className = 'minimap';
    document.body.appendChild(minimapContainer);

    // 캐릭터 마커 생성
    const playerMarker = document.createElement('div');
    playerMarker.className = 'player-marker';
    minimapContainer.appendChild(playerMarker);

    // 미니맵 참조 저장
    this.minimap = {
      container: minimapContainer,
      playerMarker: playerMarker
    };
  }


  // 미니맵 업데이트
  updateMinimap() {
    if (!this.minimap || !this.character) return;

    const target = this.character.model || this.character.tempModel;
    if (!target) return;

    // 마을 크기에 맞춰 미니맵 스케일 조정
    const mapScale = 1.5; // 미니맵 스케일 (필요에 따라 조정)
    const centerX = this.minimap.container.offsetWidth / 2;
    const centerY = this.minimap.container.offsetHeight / 2;

    // 캐릭터 위치를 미니맵 좌표로 변환
    const x = centerX + (target.position.x / mapScale);
    const y = centerY + (target.position.z / mapScale);

    // 마커 위치 업데이트
    this.minimap.playerMarker.style.left = `${x}px`;
    this.minimap.playerMarker.style.top = `${y}px`;
  }


  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    directionalLight.position.set(10, 20, 15);

    // 그림자 최적화
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // 4096에서 줄임
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;

    // 그림자 경계 최적화
    const shadowSize = 50;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;

    // 그림자 품질과 성능 균형
    directionalLight.shadow.bias = -0.0005;

    this.scene.add(directionalLight);
    this.mainLight = directionalLight;

    // Additional fill light
    const fillLight = new THREE.DirectionalLight(0xc9e6ff, 0.3);
    fillLight.position.set(-10, 10, -10);
    fillLight.castShadow = false; // 보조 라이트는 그림자 비활성화
    this.scene.add(fillLight);

    // Spot light - 성능을 위해 그림자 비활성화
    const spotLight = new THREE.SpotLight(0xffeedd, 0.8, 100, Math.PI / 6, 0.5, 1);
    spotLight.position.set(0, 30, 0);
    spotLight.castShadow = false;
    this.scene.add(spotLight);
  }

  // 공유 지오메트리 캐시 생성
  getGeometry(type, ...params) {
    const key = `${type}_${params.join('_')}`;
    if (!this.geometryCache[key]) {
      switch (type) {
        case 'box':
          this.geometryCache[key] = new THREE.BoxGeometry(...params);
          break;
        case 'plane':
          this.geometryCache[key] = new THREE.PlaneGeometry(...params);
          break;
        case 'cylinder':
          this.geometryCache[key] = new THREE.CylinderGeometry(...params);
          break;
        case 'cone':
          this.geometryCache[key] = new THREE.ConeGeometry(...params);
          break;
        case 'torus':
          this.geometryCache[key] = new THREE.TorusGeometry(...params);
          break;
        case 'circle':
          this.geometryCache[key] = new THREE.CircleGeometry(...params);
          break;
        default:
          throw new Error(`Unknown geometry type: ${type}`);
      }
    }
    return this.geometryCache[key];
  }

  // 공유 재질 캐시 생성
  getMaterial(type, params) {
    const key = `${type}_${JSON.stringify(params)}`;
    if (!this.materialCache[key]) {
      switch (type) {
        case 'standard':
          this.materialCache[key] = new THREE.MeshStandardMaterial(params);
          break;
        case 'basic':
          this.materialCache[key] = new THREE.MeshBasicMaterial(params);
          break;
        case 'phong':
          this.materialCache[key] = new THREE.MeshPhongMaterial(params);
          break;
        default:
          throw new Error(`Unknown material type: ${type}`);
      }
    }
    return this.materialCache[key];
  }

  createCity() {
    // Create ground
    this.createGround();

    // Scandinavian color palette
    const colors = [
      0xf5b971, // Orange beige
      0xd6a2ad, // Rose pink
      0x7ea8c4, // Pastel blue
      0x8fb9aa, // Sage green
      0xefd9ca  // Light peach
    ];

    // Portfolio building information
    const portfolioBuildings = [
      {
        type: 'main',
        posX: 0,
        posZ: 0,
        width: 8,
        height: 16,
        depth: 8,
        color: 0x7ea8c4,
        castShadow: true, // 중요 건물만 그림자 활성화
        info: {
          title: "KSJ - Cloud Solutions Architect",
          description: "I'm a Cloud Solutions Architect specializing in multi-cloud environments and containerization technologies. Explore the city to learn more about my expertise in different cloud technologies."
        }
      },
      // 중요한 건물들에만 그림자 활성화
      {
        type: 'kubernetes',
        posX: -16,
        posZ: -16,
        width: 6,
        height: 12,
        depth: 6,
        color: colors[2],
        castShadow: true,
        logoTexture: './assets/logos/kubernetes-logo.png',
        info: {
          title: "Kubernetes Expertise",
          description: "Extensive experience with Kubernetes orchestration, including cluster deployment, pod management, service configuration, and CI/CD integration. Proficient in handling complex microservices architectures with high availability and scalability requirements."
        }
      },
      // 나머지 건물 정보 동일하게 유지하고 castShadow 속성 추가
      {
        type: 'aws',
        posX: 16,
        posZ: -16,
        width: 6,
        height: 14,
        depth: 6,
        color: colors[0],
        castShadow: true,
        logoTexture: './assets/logos/aws-logo.png',
        info: {
          title: "AWS Cloud Solutions",
          description: "Specialized in AWS infrastructure design and implementation. Proficient with EC2, S3, Lambda, RDS, EKS, and other AWS services. Experienced in designing cost-effective, secure, and scalable cloud architectures for various business needs."
        }
      },
      {
        type: 'naver',
        posX: 16,
        posZ: 16,
        width: 6,
        height: 10,
        depth: 6,
        color: colors[3],
        castShadow: false,
        logoTexture: './assets/logos/naver-cloud-logo.png',
        info: {
          title: "NAVER Cloud Platform",
          description: "Expert in NAVER Cloud Platform services and architecture, providing localized solutions for businesses operating in the Korean market. Experience with NAVER Cloud's compute, storage, networking, and database services."
        }
      },
      {
        type: 'kt',
        posX: -16,
        posZ: 16,
        width: 6,
        height: 11,
        depth: 6,
        color: colors[1],
        castShadow: false,
        logoTexture: './assets/logos/kt-cloud-logo.png',
        info: {
          title: "KT Cloud Solutions",
          description: "Skilled in implementing and managing KT Cloud infrastructure. Experience with enterprise-level deployments, cloud migration strategies, and hybrid cloud setups using KT Cloud's comprehensive service offering."
        }
      },
      {
        type: 'nhn',
        posX: 0,
        posZ: -24,
        width: 6,
        height: 12,
        depth: 6,
        color: colors[4],
        castShadow: false,
        logoTexture: './assets/logos/nhn-cloud-logo.png',
        info: {
          title: "NHN Cloud Infrastructure",
          description: "Proficient in NHN Cloud services and architecture. Experience in designing and implementing solutions using NHN's compute, storage, and platform services for businesses requiring reliable cloud infrastructure."
        }
      }
    ];

    // Create main portfolio buildings
    portfolioBuildings.forEach(buildingData => {
      const building = this.addBuilding(buildingData);
      // 중요 건물은 항상 업데이트
      this.visibleBuildings.add(building);
    });

    // Add residential buildings - 개수 줄임
    this.addResidentialDistrict(20); // 30에서 20으로 줄임

    // Add roads
    this.addRoads();

    // 추가 환경 요소 (나무, 조경) - 개수 줄임
    this.addEnvironmentalElements(20); // 나무 개수 줄임

    // 한 번만 그림자 업데이트 (정적 장면)
    this.renderer.shadowMap.needsUpdate = true;
  }

  createGround() {
    // 바닥면 최적화 - 세그먼트 수 줄임
    const groundSize = 200;
    const groundSegments = 50; // 100에서 줄임

    // 공유 지오메트리 사용
    const groundGeometry = this.getGeometry('plane', groundSize, groundSize, groundSegments, groundSegments);

    // 약간의 기복 추가 - 매 버텍스마다가 아니라 특정 간격으로
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 9) { // 더 적은 버텍스만 수정
      if (Math.abs(vertices[i]) > 30 || Math.abs(vertices[i + 1]) > 30) {
        vertices[i + 2] = Math.sin(vertices[i] / 10) * Math.cos(vertices[i + 1] / 10) * 0.5;
      }
    }

    // 버텍스 업데이트 필요 표시
    groundGeometry.attributes.position.needsUpdate = true;

    // 공유 재질 사용
    const groundMaterial = this.getMaterial('standard', {
      color: 0xe9ecef,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    this.scene.add(ground);

    // 중앙 광장 - 적은 세그먼트 사용
    const plazaGeometry = this.getGeometry('circle', 25, 16); // 세그먼트 줄임
    const plazaMaterial = this.getMaterial('standard', {
      color: 0xdadfe3,
      roughness: 0.6,
      metalness: 0.2
    });

    const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.05;
    plaza.receiveShadow = true;
    plaza.name = 'plaza';
    this.scene.add(plaza);
  }

  addRoads() {
    // 공유 재질 사용
    const roadMaterial = this.getMaterial('standard', {
      color: 0x333333,
      roughness: 0.9,
      metalness: 0
    });

    const markingMaterial = this.getMaterial('basic', {
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    // East-West main road
    const roadWidth = 6;
    const eastWestRoad = new THREE.Mesh(
      this.getGeometry('plane', 60, roadWidth),
      roadMaterial
    );
    eastWestRoad.rotation.x = Math.PI / 2;
    eastWestRoad.position.y = 0.01;
    eastWestRoad.name = 'road-ew';
    this.scene.add(eastWestRoad);

    // North-South main road
    const northSouthRoad = new THREE.Mesh(
      this.getGeometry('plane', roadWidth, 60),
      roadMaterial
    );
    northSouthRoad.rotation.x = Math.PI / 2;
    northSouthRoad.position.y = 0.01;
    northSouthRoad.name = 'road-ns';
    this.scene.add(northSouthRoad);

    // 도로 마킹을 위한 인스턴스 메시 사용
    const markingGeometry = this.getGeometry('plane', 1, 0.3);
    const markingCount = Math.ceil(60 / 4) * 2; // EW + NS 마킹
    const markingInstancedMesh = new THREE.InstancedMesh(
      markingGeometry,
      markingMaterial,
      markingCount
    );
    markingInstancedMesh.name = 'road-markings';
    this.scene.add(markingInstancedMesh);

    // 마킹 설정
    const matrix = new THREE.Matrix4();
    let instanceIndex = 0;

    // East-West markings
    for (let i = -26; i <= 26; i += 4) {
      matrix.makeRotationX(Math.PI / 2);
      matrix.setPosition(i, 0.02, 0);
      markingInstancedMesh.setMatrixAt(instanceIndex++, matrix);
    }

    // North-South markings
    for (let i = -26; i <= 26; i += 4) {
      matrix.makeRotationX(Math.PI / 2);
      matrix.setPosition(0, 0.02, i);
      markingInstancedMesh.setMatrixAt(instanceIndex++, matrix);
    }

    markingInstancedMesh.instanceMatrix.needsUpdate = true;

    // 대각선 도로는 별도로 생성 (더 적은 수의 마킹)
    // ... 나머지 도로 코드 ...
  }

  addEnvironmentalElements(treeCount = 20) {
    // 나무 추가 - 최적화된 버전
    this.addTrees(treeCount);

    // 가로등 추가 - 개수 줄임
    this.addStreetlights(8); // 12개에서 8개로 줄임

    // 벤치 추가
    this.addBenches();

    // 분수대 추가
    this.addFountain();
  }

  addTrees(count) {
    // 공유 지오메트리 및 재질 사용
    const trunkGeometry = this.getGeometry('cylinder', 0.3, 0.4, 2, 8);
    const trunkMaterial = this.getMaterial('standard', {
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });

    const leavesGeometry = this.getGeometry('cone', 1.5, 4, 8);
    const leavesMaterial = this.getMaterial('standard', {
      color: 0x2E8B57,
      roughness: 0.8,
      metalness: 0.1
    });

    // 나무 인스턴스 메시 생성
    const trunkInstancedMesh = new THREE.InstancedMesh(
      trunkGeometry,
      trunkMaterial,
      count
    );
    trunkInstancedMesh.name = 'tree-trunks';
    trunkInstancedMesh.castShadow = true;

    const leavesInstancedMesh = new THREE.InstancedMesh(
      leavesGeometry,
      leavesMaterial,
      count
    );
    leavesInstancedMesh.name = 'tree-leaves';
    leavesInstancedMesh.castShadow = true;

    // 나무 배치
    const treePositions = [
      { x: 10, z: 10 }, { x: -10, z: 10 }, { x: 10, z: -10 }, { x: -10, z: -10 },
      { x: 20, z: 0 }, { x: -20, z: 0 }, { x: 0, z: 20 }, { x: 0, z: -20 },
      { x: 25, z: 25 }, { x: -25, z: 25 }, { x: 25, z: -25 }, { x: -25, z: -25 }
    ];

    const trunkMatrix = new THREE.Matrix4();
    const leavesMatrix = new THREE.Matrix4();

    // 고정 위치 나무 설정
    for (let i = 0; i < Math.min(treePositions.length, count); i++) {
      const pos = treePositions[i];

      // 트렁크 설정
      trunkMatrix.makeTranslation(pos.x, 1, pos.z);
      trunkInstancedMesh.setMatrixAt(i, trunkMatrix);

      // 나뭇잎 설정
      leavesMatrix.makeTranslation(pos.x, 4, pos.z);
      leavesInstancedMesh.setMatrixAt(i, leavesMatrix);
    }

    // 무작위 위치 나무 설정
    for (let i = treePositions.length; i < count; i++) {
      let x, z;
      let isValid = false;

      while (!isValid) {
        x = (Math.random() - 0.5) * 100;
        z = (Math.random() - 0.5) * 100;

        if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
        if (Math.abs(x) < 5 || Math.abs(z) < 5) continue;

        isValid = true;
      }

      // 트렁크 설정
      trunkMatrix.makeTranslation(x, 1, z);
      trunkInstancedMesh.setMatrixAt(i, trunkMatrix);

      // 나뭇잎 설정
      leavesMatrix.makeTranslation(x, 4, z);
      leavesInstancedMesh.setMatrixAt(i, leavesMatrix);
    }

    trunkInstancedMesh.instanceMatrix.needsUpdate = true;
    leavesInstancedMesh.instanceMatrix.needsUpdate = true;

    this.scene.add(trunkInstancedMesh);
    this.scene.add(leavesInstancedMesh);
  }

  addStreetlights(count) {
    // 공유 지오메트리 및 재질 사용
    const poleGeometry = this.getGeometry('cylinder', 0.2, 0.2, 5, 8);
    const poleMaterial = this.getMaterial('standard', {
      color: 0x666666,
      roughness: 0.7,
      metalness: 0.5
    });

    const headGeometry = this.getGeometry('box', 0.6, 0.2, 1);
    const headMaterial = this.getMaterial('standard', {
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.7
    });

    // 인스턴스 메시 대신 그룹 사용 (빛이 포함되어 있어서)
    const streetlights = [];

    // 주요 도로를 따라 가로등 배치 - 더 적은 개수
    const spacing = 40 / count;
    for (let i = -20; i <= 20; i += spacing) {
      if (i !== 0 && streetlights.length < count) {
        streetlights.push(this.createStreetlight(i, 3.5));
        if (streetlights.length < count) {
          streetlights.push(this.createStreetlight(i, -3.5));
        }
        if (streetlights.length < count) {
          streetlights.push(this.createStreetlight(3.5, i));
        }
        if (streetlights.length < count) {
          streetlights.push(this.createStreetlight(-3.5, i));
        }
      }
    }

    // 생성된 가로등을 씬에 추가
    streetlights.forEach(light => this.scene.add(light));
  }

  createStreetlight(x, z) {
    const streetlight = new THREE.Group();
    streetlight.name = `streetlight-${x}-${z}`;

    // 기둥
    const poleGeometry = this.getGeometry('cylinder', 0.2, 0.2, 5, 8);
    const poleMaterial = this.getMaterial('standard', {
      color: 0x666666,
      roughness: 0.7,
      metalness: 0.5
    });

    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2.5;
    streetlight.add(pole);

    // 램프 헤드
    const headGeometry = this.getGeometry('box', 0.6, 0.2, 1);
    const headMaterial = this.getMaterial('standard', {
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.7
    });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 5;
    streetlight.add(head);

    // 빛 - 거리를 줄여 성능 향상
    const light = new THREE.PointLight(0xffffcc, 1, 12);
    light.position.y = 4.9;
    streetlight.add(light);

    // 가로등 위치
    streetlight.position.set(x, 0, z);

    return streetlight;
  }
  addBenches() {
    // 공유 지오메트리 및 재질 사용
    const seatGeometry = this.getGeometry('box', 2, 0.1, 0.6);
    const backGeometry = this.getGeometry('box', 2, 0.6, 0.1);
    const legGeometry = this.getGeometry('box', 0.1, 0.5, 0.6);

    const seatMaterial = this.getMaterial('standard', {
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.2
    });

    const legMaterial = this.getMaterial('standard', {
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.5
    });

    // 벤치 위치 정의
    const benchPositions = [
      { x: 5, z: 5, rotation: Math.PI / 4 },
      { x: -5, z: 5, rotation: -Math.PI / 4 },
      { x: 5, z: -5, rotation: -Math.PI / 4 },
      { x: -5, z: -5, rotation: Math.PI / 4 },
      { x: 15, z: 0, rotation: Math.PI / 2 },
      { x: -15, z: 0, rotation: -Math.PI / 2 }
    ];

    benchPositions.forEach(pos => {
      const bench = this.createBench(seatGeometry, backGeometry, legGeometry, seatMaterial, legMaterial, pos.x, pos.z, pos.rotation);
      this.scene.add(bench);
    });
  }

  createBench(seatGeometry, backGeometry, legGeometry, seatMaterial, legMaterial, x, z, rotation) {
    const bench = new THREE.Group();
    bench.name = `bench-${x}-${z}`;

    // 의자 좌석
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.5;
    seat.castShadow = true;
    bench.add(seat);

    // 의자 등받이
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 0.8, -0.25);
    back.castShadow = true;
    bench.add(back);

    // 의자 다리
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(0.8, 0.25, 0);
    bench.add(leg1);

    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(-0.8, 0.25, 0);
    bench.add(leg2);

    // 벤치 위치 및 회전 설정
    bench.position.set(x, 0, z);
    bench.rotation.y = rotation;

    return bench;
  }

  addFountain() {
    // 중앙 분수대 - 공유 지오메트리 및 재질 사용
    const fountain = new THREE.Group();
    fountain.name = 'central-fountain';

    // 분수대 베이스
    const baseGeometry = this.getGeometry('cylinder', 4, 4.5, 0.5, 24); // 세그먼트 줄임
    const baseMaterial = this.getMaterial('standard', {
      color: 0xaaaaaa,
      roughness: 0.7,
      metalness: 0.3
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    base.castShadow = true;
    fountain.add(base);

    // 물 부분
    const waterGeometry = this.getGeometry('cylinder', 3.5, 3.5, 0.2, 24);
    const waterMaterial = this.getMaterial('standard', {
      color: 0x7ea8c4,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 0.5;
    fountain.add(water);

    // 중앙 기둥
    const pillarGeometry = this.getGeometry('cylinder', 0.5, 0.7, 1.5, 12);
    const pillar = new THREE.Mesh(pillarGeometry, baseMaterial);
    pillar.position.y = 1.25;
    pillar.castShadow = true;
    fountain.add(pillar);

    // 위쪽 작은 베이스
    const topBaseGeometry = this.getGeometry('cylinder', 1, 1.2, 0.3, 12);
    const topBase = new THREE.Mesh(topBaseGeometry, baseMaterial);
    topBase.position.y = 2.15;
    topBase.castShadow = true;
    fountain.add(topBase);

    // 작은 분수 효과 - 개수 줄임
    const sprayCount = 8; // 16에서 8로 줄임
    const sprayGeometry = this.getGeometry('cylinder', 0.05, 0.02, 1, 4); // 세그먼트 줄임

    for (let i = 0; i < sprayCount; i++) {
      const angle = (i / sprayCount) * Math.PI * 2;
      const spray = new THREE.Mesh(sprayGeometry, waterMaterial);

      spray.position.y = 2.5;
      spray.position.x = Math.sin(angle) * 0.5;
      spray.position.z = Math.cos(angle) * 0.5;

      spray.rotation.x = Math.PI / 3;
      spray.rotation.z = angle;

      fountain.add(spray);
    }

    fountain.position.set(0, 0, 0);
    this.scene.add(fountain);

    // 분수 애니메이션
    this.fountain = fountain;
  }

  addResidentialDistrict(buildingCount = 20) {
    // Scandinavian colors for residential buildings
    const buildingColors = [
      0xf5b971, // Orange beige
      0xd6a2ad, // Rose pink
      0x7ea8c4, // Pastel blue
      0x8fb9aa, // Sage green
      0xefd9ca  // Light peach
    ];

    // 건물 배치를 위한 복합적인 법칙 - 성능을 위해 한 번에 결정
    const positions = [];
    const gridSize = 10;
    const gridCells = 12;

    // 미리 그리드 생성
    for (let x = -gridCells / 2; x < gridCells / 2; x++) {
      for (let z = -gridCells / 2; z < gridCells / 2; z++) {
        const posX = x * gridSize + (Math.random() - 0.5) * 5;
        const posZ = z * gridSize + (Math.random() - 0.5) * 5;

        // 메인 도로 및 중요 건물 주변 제외
        if ((Math.abs(posX) < 10 && Math.abs(posZ) < 20) ||
          (Math.abs(posZ) < 10 && Math.abs(posX) < 20) ||
          (Math.abs(posX) < 12 && Math.abs(posZ) < 12) ||
          (Math.abs(posX - 16) < 8 && Math.abs(posZ - 16) < 8) ||
          (Math.abs(posX + 16) < 8 && Math.abs(posZ - 16) < 8) ||
          (Math.abs(posX - 16) < 8 && Math.abs(posZ + 16) < 8) ||
          (Math.abs(posX + 16) < 8 && Math.abs(posZ + 16) < 8) ||
          (Math.abs(posX) < 8 && Math.abs(posZ + 24) < 8)) {
          continue;
        }

        positions.push({ x: posX, z: posZ });
      }
    }

    // 무작위로 건물 위치 선택
    const selectedPositions = [];
    while (selectedPositions.length < buildingCount && positions.length > 0) {
      const index = Math.floor(Math.random() * positions.length);
      selectedPositions.push(positions[index]);
      positions.splice(index, 1);
    }

    // 건물 생성
    selectedPositions.forEach(pos => {
      // Randomize building properties - 사이즈는 유사하게 유지
      const height = 2 + Math.random() * 8;
      const width = 2 + Math.random() * 4;
      const depth = 2 + Math.random() * 4;
      const colorIndex = Math.floor(Math.random() * buildingColors.length);

      // Create residential building
      const building = this.addBuilding({
        posX: pos.x,
        posZ: pos.z,
        width: width,
        height: height,
        depth: depth,
        color: buildingColors[colorIndex],
        type: 'standard',
        castShadow: false, // 주변 건물은 그림자 비활성화
        info: {
          title: "Residential Building",
          description: "A modern residential building in the city skyline."
        }
      });

      // Maybe add a roof (70% chance)
      if (Math.random() > 0.3) {
        building.addRoof();
      }
    });
  }

  addBuilding(options) {
    // Building 인스턴스에 공유 지오메트리/머티리얼 캐시 전달
    options.geometryCache = this.geometryCache;
    options.materialCache = this.materialCache;

    const building = new Building(options);
    this.scene.add(building.mesh);
    this.buildings.push(building);
    return building;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 픽셀 비율 최적화
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
  }

  onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Set raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Find intersections with buildings
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let buildingClicked = false;

    for (let i = 0; i < intersects.length; i++) {
      // Traverse up to find a mesh with userData.building
      let object = intersects[i].object;
      while (object && !object.userData.building) {
        object = object.parent;
      }

      if (object && object.userData.building) {
        // Show building information
        this.infoPanel.showBuildingInfo(object.userData.building);
        buildingClicked = true;
        break;
      }
    }

    // If no building was clicked, hide the info panel
    if (!buildingClicked) {
      this.infoPanel.hideBuildingInfo();
    }
  }

  // 뷰 프러스텀 계산 (카메라에 보이는 객체 판단)
  updateFrustum() {
    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }


  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime(); // 이 줄 추가

    // 프러스텀 업데이트
    this.updateFrustum();

    // 캐릭터 모드일 때 캐릭터 업데이트
    if (this.characterMode && this.character) {
      this.character.update(delta, this.buildings);
      this.updateMinimap();
    } else {
      // 기존 카메라 컨트롤 업데이트
      this.controls.update();
    }

    // 가시성 기반 객체 업데이트 - 안전하게 처리
    this.buildings.forEach(building => {
      if (!building || !building.mesh) return;

      // 중요 건물이거나 화면에 보이는 경우에만 업데이트
      try {
        // 컴퓨팅 비용이 높은 작업 전에 간단한 검사 먼저 수행
        const distance = building.mesh.position.distanceTo(this.camera.position);

        // 너무 멀리 있으면 건너뛰기
        if (distance > 150) return;

        // 중요 건물이거나 가시 범위 내에 있는 경우에만 업데이트
        if (this.visibleBuildings.has(building) ||
          this.isInViewFrustum(building.mesh)) {
          building.update && building.update(time, this.camera);
        }
      } catch (e) {
        console.warn("Building update error:", e);
      }
    });

    // 분수대 애니메이션 - 간소화 및 안전 확인
    if (this.fountain && this.fountain.children) {
      for (let i = 6; i < this.fountain.children.length; i += 2) {
        if (i < this.fountain.children.length) {
          const child = this.fountain.children[i];
          child.position.y = 2.5 + Math.sin(time * 2 + i * 0.3) * 0.1;
          child.scale.y = 1 + Math.sin(time * 3 + i * 0.2) * 0.2;
        }
      }
    }

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  // 프러스텀 컬링을 위한 안전한 헬퍼 메서드
  isInViewFrustum(object) {
    if (!object || !object.geometry) return false;

    // 경계 구가 없으면 계산 시도
    if (!object.geometry.boundingSphere) {
      try {
        object.geometry.computeBoundingSphere();
      } catch (e) {
        return true; // 오류가 발생하면 그냥 표시
      }
    }

    // 경계 구가 여전히 없으면 그냥 표시
    if (!object.geometry.boundingSphere) {
      return true;
    }

    // 실제 프러스텀 계산
    return this.frustum.intersectsObject(object);
  }

  // 리소스 정리
  dispose() {
    // 이벤트 리스너 제거
    window.removeEventListener('click', this.onMouseClick);

    // 객체 정리
    this.buildings.forEach(building => {
      building.dispose && building.dispose();
    });
    if (this.character) {
      this.character.dispose();
      this.character = null;
    }

    // 미니맵 제거
    if (this.minimap) {
      if (this.minimap.container && this.minimap.container.parentNode) {
        this.minimap.container.parentNode.removeChild(this.minimap.container);
      }
      this.minimap = null;
    }

    // 캐시된 지오메트리 정리
    Object.values(this.geometryCache).forEach(geometry => {
      geometry.dispose();
    });

    // 캐시된 재질 정리
    Object.values(this.materialCache).forEach(material => {
      if (material.map) material.map.dispose();
      material.dispose();
    });

    // 렌더러 정리
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }

    // 참조 해제
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.buildings = null;
    this.geometryCache = null;
    this.materialCache = null;
  }
}