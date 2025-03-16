// Portfolio.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Building } from './Building.js';
import { InfoPanel } from './InfoPanel.js';

export class Portfolio {
  constructor(containerId) {
    // DOM container
    this.container = document.getElementById(containerId);

    // Info panel
    this.infoPanel = new InfoPanel();

    // Initialize scene, camera, renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xf0f5f9); // Scandinavian light background
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Set up lights
    this.setupLights();

    // Set camera position
    this.camera.position.set(30, 30, 30);
    this.camera.lookAt(0, 0, 0);

    // Add controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

    // Building collections
    this.buildings = [];

    // Raycaster for mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Create city
    this.createCity();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Handle mouse click
    window.addEventListener('click', this.onMouseClick.bind(this));

    // Animation clock
    this.clock = new THREE.Clock();

    // Start animation loop
    this.animate();
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;

    this.scene.add(directionalLight);

    // Additional fill light
    const fillLight = new THREE.DirectionalLight(0xc9e6ff, 0.3);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);

    // 분위기를 위한 스팟라이트 추가
    const spotLight = new THREE.SpotLight(0xffeedd, 0.8, 100, Math.PI / 6, 0.5, 1);
    spotLight.position.set(0, 30, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
  }

  createCity() {
    // Create ground
    this.createGround();

    // Scandinavian color palette
    const colors = [
      0xf5b971, // Orange beige
      0xd6a2ad, // Rose pink
      // Portfolio.js (계속)
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
        width: 8,        // 크기 증가
        height: 16,      // 높이 증가
        depth: 8,        // 깊이 증가
        color: 0x7ea8c4,
        info: {
          title: "KSJ - Cloud Solutions Architect",
          description: "I'm a Cloud Solutions Architect specializing in multi-cloud environments and containerization technologies. Explore the city to learn more about my expertise in different cloud technologies."
        }
      },
      {
        type: 'kubernetes',
        posX: -16,        // 위치 조정
        posZ: -16,
        width: 6,        // 크기 증가
        height: 12,      // 높이 증가
        depth: 6,        // 깊이 증가
        color: colors[2],
        logoTexture: './assets/logos/kubernetes-logo.png',
        info: {
          title: "Kubernetes Expertise",
          description: "Extensive experience with Kubernetes orchestration, including cluster deployment, pod management, service configuration, and CI/CD integration. Proficient in handling complex microservices architectures with high availability and scalability requirements."
        }
      },
      {
        type: 'aws',
        posX: 16,        // 위치 조정
        posZ: -16,
        width: 6,        // 크기 증가
        height: 14,      // 높이 증가
        depth: 6,        // 깊이 증가
        color: colors[0],
        logoTexture: './assets/logos/aws-logo.png',
        info: {
          title: "AWS Cloud Solutions",
          description: "Specialized in AWS infrastructure design and implementation. Proficient with EC2, S3, Lambda, RDS, EKS, and other AWS services. Experienced in designing cost-effective, secure, and scalable cloud architectures for various business needs."
        }
      },
      {
        type: 'naver',
        posX: 16,        // 위치 조정
        posZ: 16,
        width: 6,        // 크기 증가
        height: 10,      // 높이 증가
        depth: 6,        // 깊이 증가
        color: colors[3],
        logoTexture: './assets/logos/naver-cloud-logo.png',
        info: {
          title: "NAVER Cloud Platform",
          description: "Expert in NAVER Cloud Platform services and architecture, providing localized solutions for businesses operating in the Korean market. Experience with NAVER Cloud's compute, storage, networking, and database services."
        }
      },
      {
        type: 'kt',
        posX: -16,        // 위치 조정
        posZ: 16,
        width: 6,        // 크기 증가
        height: 11,      // 높이 증가
        depth: 6,        // 깊이 증가
        color: colors[1],
        logoTexture: './assets/logos/kt-cloud-logo.png',
        info: {
          title: "KT Cloud Solutions",
          description: "Skilled in implementing and managing KT Cloud infrastructure. Experience with enterprise-level deployments, cloud migration strategies, and hybrid cloud setups using KT Cloud's comprehensive service offering."
        }
      },
      {
        type: 'nhn',
        posX: 0,
        posZ: -24,        // 위치 조정
        width: 6,        // 크기 증가
        height: 12,      // 높이 증가
        depth: 6,        // 깊이 증가
        color: colors[4],
        logoTexture: './assets/logos/nhn-cloud-logo.png',
        info: {
          title: "NHN Cloud Infrastructure",
          description: "Proficient in NHN Cloud services and architecture. Experience in designing and implementing solutions using NHN's compute, storage, and platform services for businesses requiring reliable cloud infrastructure."
        }
      }
    ];

    // Create main portfolio buildings
    portfolioBuildings.forEach(buildingData => {
      this.addBuilding(buildingData);
    });

    // Add residential buildings
    this.addResidentialDistrict();

    // Add roads
    this.addRoads();

    // 추가 환경 요소 (나무, 조경) 추가
    this.addEnvironmentalElements();
  }

  createGround() {
    // 바닥면 개선 - 질감 추가
    const groundSize = 200;
    const groundSegments = 100;

    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, groundSegments, groundSegments);

    // 약간의 기복 추가
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      // z 값 (높이)에 약간의 변화 추가
      if (
        Math.abs(vertices[i]) > 30 || // x
        Math.abs(vertices[i + 1]) > 30 // y
      ) {
        // 중앙 영역 외부만 약간의 기복 추가
        vertices[i + 2] = Math.sin(vertices[i] / 10) * Math.cos(vertices[i + 1] / 10) * 0.5;
      }
    }

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe9ecef, // Scandinavian light gray
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 추가 바닥 장식 - 중앙 광장
    const plazaGeometry = new THREE.CircleGeometry(25, 32);
    const plazaMaterial = new THREE.MeshStandardMaterial({
      color: 0xdadfe3,
      roughness: 0.6,
      metalness: 0.2
    });
    const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.05;  // 약간 위로 올려서 z-fighting 방지
    plaza.receiveShadow = true;
    this.scene.add(plaza);
  }

  addRoads() {
    // 도로 너비 증가
    const roadWidth = 6;
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0
    });

    // East-West main road
    const eastWestRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(60, roadWidth),
      roadMaterial
    );
    eastWestRoad.rotation.x = Math.PI / 2;
    eastWestRoad.position.y = 0.01; // Slightly above ground to prevent z-fighting
    this.scene.add(eastWestRoad);

    // North-South main road
    const northSouthRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, 60),
      roadMaterial
    );
    northSouthRoad.rotation.x = Math.PI / 2;
    northSouthRoad.position.y = 0.01;
    this.scene.add(northSouthRoad);

    // 추가 도로 - 대각선 도로
    const diagonalRoad1 = new THREE.Mesh(
      new THREE.PlaneGeometry(50, roadWidth),
      roadMaterial
    );
    diagonalRoad1.rotation.x = Math.PI / 2;
    diagonalRoad1.rotation.z = Math.PI / 4;
    diagonalRoad1.position.y = 0.01;
    this.scene.add(diagonalRoad1);

    const diagonalRoad2 = new THREE.Mesh(
      new THREE.PlaneGeometry(50, roadWidth),
      roadMaterial
    );
    diagonalRoad2.rotation.x = Math.PI / 2;
    diagonalRoad2.rotation.z = -Math.PI / 4;
    diagonalRoad2.position.y = 0.01;
    this.scene.add(diagonalRoad2);

    // Road markings
    const markingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    // East-West markings
    for (let i = -26; i <= 26; i += 4) {
      const marking = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.3),
        markingMaterial
      );
      marking.rotation.x = Math.PI / 2;
      marking.position.set(i, 0.02, 0);
      this.scene.add(marking);
    }

    // North-South markings
    for (let i = -26; i <= 26; i += 4) {
      const marking = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 1),
        markingMaterial
      );
      marking.rotation.x = Math.PI / 2;
      marking.position.set(0, 0.02, i);
      this.scene.add(marking);
    }

    // 대각선 도로 마킹
    for (let i = -20; i <= 20; i += 4) {
      // 첫 번째 대각선 도로
      const d1X = i * Math.cos(Math.PI / 4);
      const d1Z = i * Math.sin(Math.PI / 4);

      const marking1 = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.3),
        markingMaterial
      );
      marking1.rotation.x = Math.PI / 2;
      marking1.rotation.z = Math.PI / 4;
      marking1.position.set(d1X, 0.02, d1Z);
      this.scene.add(marking1);

      // 두 번째 대각선 도로
      const d2X = i * Math.cos(-Math.PI / 4);
      const d2Z = i * Math.sin(-Math.PI / 4);

      const marking2 = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.3),
        markingMaterial
      );
      marking2.rotation.x = Math.PI / 2;
      marking2.rotation.z = -Math.PI / 4;
      marking2.position.set(d2X, 0.02, d2Z);
      this.scene.add(marking2);
    }
  }

  addEnvironmentalElements() {
    // 나무 추가
    this.addTrees();

    // 가로등 추가
    this.addStreetlights();

    // 벤치 추가
    this.addBenches();

    // 분수대 추가
    this.addFountain();
  }

  addTrees() {
    // 간단한 나무 모델 (원뿔 모양 + 기둥)
    const createTree = (x, z) => {
      const tree = new THREE.Group();

      // 나무 기둥
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1;
      trunk.castShadow = true;
      tree.add(trunk);

      // 나무 잎
      const leavesGeometry = new THREE.ConeGeometry(1.5, 4, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x2E8B57,
        roughness: 0.8,
        metalness: 0.1
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 4;
      leaves.castShadow = true;
      tree.add(leaves);

      // 나무 위치 설정
      tree.position.set(x, 0, z);

      this.scene.add(tree);
    };

    // 나무 배치
    const treePositions = [
      { x: 10, z: 10 }, { x: -10, z: 10 }, { x: 10, z: -10 }, { x: -10, z: -10 },
      { x: 20, z: 0 }, { x: -20, z: 0 }, { x: 0, z: 20 }, { x: 0, z: -20 },
      { x: 25, z: 25 }, { x: -25, z: 25 }, { x: 25, z: -25 }, { x: -25, z: -25 }
    ];

    treePositions.forEach(pos => {
      createTree(pos.x, pos.z);
    });

    // 추가 랜덤 나무
    for (let i = 0; i < 30; i++) {
      let x, z;
      let isValid = false;

      // 기존 건물이나 도로와 충돌하지 않는 위치 찾기
      while (!isValid) {
        x = (Math.random() - 0.5) * 100;
        z = (Math.random() - 0.5) * 100;

        // 중앙 영역과 주요 도로 피하기
        if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
        if (Math.abs(x) < 5 || Math.abs(z) < 5) continue;

        isValid = true;
      }

      createTree(x, z);
    }
  }

  addStreetlights() {
    // 가로등 생성 함수
    const createStreetlight = (x, z) => {
      const streetlight = new THREE.Group();

      // 기둥
      const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.7,
        metalness: 0.5
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 2.5;
      streetlight.add(pole);

      // 램프 헤드
      const headGeometry = new THREE.BoxGeometry(0.6, 0.2, 1);
      const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.7
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 5;
      streetlight.add(head);

      // 빛
      const light = new THREE.PointLight(0xffffcc, 1, 15);
      light.position.y = 4.9;
      streetlight.add(light);

      // 가로등 위치 설정
      streetlight.position.set(x, 0, z);

      this.scene.add(streetlight);
    };

    // 주요 도로를 따라 가로등 배치
    for (let i = -20; i <= 20; i += 5) {
      if (i !== 0) { // 교차로 피하기
        createStreetlight(i, 3.5);  // 도로 북쪽
        createStreetlight(i, -3.5); // 도로 남쪽
        createStreetlight(3.5, i);  // 도로 동쪽
        createStreetlight(-3.5, i); // 도로 서쪽
      }
    }
  }

  addBenches() {
    // 벤치 생성 함수
    const createBench = (x, z, rotation = 0) => {
      const bench = new THREE.Group();

      // 의자 좌석
      const seatGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
      const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
      });
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.y = 0.5;
      bench.add(seat);

      // 의자 등받이
      const backGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
      const back = new THREE.Mesh(backGeometry, seatMaterial);
      back.position.set(0, 0.8, -0.25);
      bench.add(back);

      // 의자 다리
      const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.6);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.5
      });

      const leg1 = new THREE.Mesh(legGeometry, legMaterial);
      leg1.position.set(0.8, 0.25, 0);
      bench.add(leg1);

      const leg2 = new THREE.Mesh(legGeometry, legMaterial);
      leg2.position.set(-0.8, 0.25, 0);
      bench.add(leg2);

      // 벤치 위치 및 회전 설정
      bench.position.set(x, 0, z);
      bench.rotation.y = rotation;

      this.scene.add(bench);
    };

    // 벤치 배치
    createBench(5, 5, Math.PI / 4);
    createBench(-5, 5, -Math.PI / 4);
    createBench(5, -5, -Math.PI / 4);
    createBench(-5, -5, Math.PI / 4);
    createBench(15, 0, Math.PI / 2);
    createBench(-15, 0, -Math.PI / 2);
  }

  addFountain() {
    // 중앙 분수대
    const fountain = new THREE.Group();

    // 분수대 베이스
    const baseGeometry = new THREE.CylinderGeometry(4, 4.5, 0.5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    fountain.add(base);

    // 물 부분
    const waterGeometry = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 32);
    const waterMaterial = new THREE.MeshStandardMaterial({
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
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 16);
    const pillar = new THREE.Mesh(pillarGeometry, baseMaterial);
    pillar.position.y = 1.25;
    fountain.add(pillar);

    // 위쪽 작은 베이스
    const topBaseGeometry = new THREE.CylinderGeometry(1, 1.2, 0.3, 16);
    const topBase = new THREE.Mesh(topBaseGeometry, baseMaterial);
    topBase.position.y = 2.15;
    fountain.add(topBase);

    // 작은 분수 효과
    const createWaterSpray = (angle) => {
      const sprayGeometry = new THREE.CylinderGeometry(0.05, 0.02, 1, 8);
      const spray = new THREE.Mesh(sprayGeometry, waterMaterial);

      spray.position.y = 2.5;
      spray.position.x = Math.sin(angle) * 0.5;
      spray.position.z = Math.cos(angle) * 0.5;

      spray.rotation.x = Math.PI / 3;
      spray.rotation.z = angle;

      return spray;
    };

    // 분수 효과 추가
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      fountain.add(createWaterSpray(angle));
    }

    fountain.position.set(0, 0, 0);
    this.scene.add(fountain);

    // 분수 애니메이션
    this.fountain = fountain;
  }

  addResidentialDistrict() {
    // Scandinavian colors for residential buildings
    const buildingColors = [
      0xf5b971, // Orange beige
      0xd6a2ad, // Rose pink
      0x7ea8c4, // Pastel blue
      0x8fb9aa, // Sage green
      0xefd9ca  // Light peach
    ];

    // Add random buildings to fill the city
    for (let i = 0; i < 30; i++) {
      // Avoid placing buildings in the center or at major portfolio buildings
      let posX, posZ;
      let validPosition = false;

      while (!validPosition) {
        posX = (Math.random() - 0.5) * 120;
        posZ = (Math.random() - 0.5) * 120;

        // Keep clear of main roads and portfolio buildings
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

        validPosition = true;
      }

      // Randomize building properties - 크기 증가
      const height = 2 + Math.random() * 8;
      const width = 2 + Math.random() * 4;
      const depth = 2 + Math.random() * 4;
      const colorIndex = Math.floor(Math.random() * buildingColors.length);

      // Create residential building
      this.addBuilding({
        posX: posX,
        posZ: posZ,
        width: width,
        height: height,
        depth: depth,
        color: buildingColors[colorIndex],
        type: 'standard',
        info: {
          title: "Residential Building",
          description: "A modern residential building in the city skyline."
        }
      });

      // Maybe add a roof (70% chance)
      if (Math.random() > 0.3) {
        this.buildings[this.buildings.length - 1].addRoof();
      }
    }
  }

  addBuilding(options) {
    const building = new Building(options);
    this.scene.add(building.mesh);
    this.buildings.push(building);
    return building;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // Update buildings
    this.buildings.forEach(building => {
      building.update && building.update(time, this.camera);
    });

    // 분수대 애니메이션
    if (this.fountain) {
      this.fountain.children.forEach((child, index) => {
        if (index > 5) { // 분수 효과만 애니메이션
          child.position.y = 2.5 + Math.sin(time * 2 + index * 0.3) * 0.1;
          child.scale.y = 1 + Math.sin(time * 3 + index * 0.2) * 0.2;
        }
      });
    }

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}