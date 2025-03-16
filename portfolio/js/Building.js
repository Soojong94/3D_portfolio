// Building.js
import * as THREE from 'three';
import { TextureLoader } from 'three';

export class Building {
  // 공유할 텍스처 로더
  static textureLoader = new TextureLoader();

  constructor(options = {}) {
    const {
      width = 4,
      height = 8,
      depth = 4,
      posX = 0,
      posY = 0,
      posZ = 0,
      color = 0xf5b971,
      type = 'standard',
      logoTexture = null,
      info = null,
      castShadow = false,
      geometryCache = null, // 공유 지오메트리 캐시
      materialCache = null  // 공유 재질 캐시
    } = options;

    // Building mesh group
    this.mesh = new THREE.Group();

    // Store building properties
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;
    this.type = type;
    this.castShadow = castShadow;
    this.info = info || {
      title: "Cloud Building",
      description: "A modern cloud infrastructure building."
    };

    // 공유 캐시 저장
    this.geometryCache = geometryCache;
    this.materialCache = materialCache;

    // Create main building structure
    this.createMainStructure();

    // Add logo if provided
    if (logoTexture) {
      this.addLogo(logoTexture);
    }

    // Set position
    this.mesh.position.set(posX, posY + height / 2, posZ);

    // Add click detection
    this.mesh.userData.building = this;
  }

  // 지오메트리 가져오기 (캐시 또는 새로 생성)
  getGeometry(type, ...params) {
    if (this.geometryCache) {
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
        }
      }
      return this.geometryCache[key];
    } else {
      // 캐시가 없으면 새로 생성
      switch (type) {
        case 'box':
          return new THREE.BoxGeometry(...params);
        case 'plane':
          return new THREE.PlaneGeometry(...params);
        case 'cylinder':
          return new THREE.CylinderGeometry(...params);
        case 'cone':
          return new THREE.ConeGeometry(...params);
        case 'torus':
          return new THREE.TorusGeometry(...params);
      }
    }
  }

  // 재질 가져오기 (캐시 또는 새로 생성)
  getMaterial(type, params) {
    if (this.materialCache) {
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
        }
      }
      return this.materialCache[key];
    } else {
      // 캐시가 없으면 새로 생성
      switch (type) {
        case 'standard':
          return new THREE.MeshStandardMaterial(params);
        case 'basic':
          return new THREE.MeshBasicMaterial(params);
        case 'phong':
          return new THREE.MeshPhongMaterial(params);
      }
    }
  }

  createMainStructure() {
    // Building types
    switch (this.type) {
      case 'aws':
        this.createAwsBuilding();
        break;
      case 'kubernetes':
        this.createKubernetesBuilding();
        break;
      case 'naver':
        this.createNaverBuilding();
        break;
      case 'kt':
        this.createKtBuilding();
        break;
      case 'nhn':
        this.createNhnBuilding();
        break;
      case 'main':
        this.createMainBuilding();
        break;
      default:
        this.createStandardBuilding();
    }
  }

  createStandardBuilding() {
    // 공유 지오메트리 사용
    const baseGeometry = this.getGeometry('box', this.width * 1.1, this.height * 0.1, this.depth * 1.1);
    const buildingGeometry = this.getGeometry('box', this.width, this.height, this.depth);
    const topGeometry = this.getGeometry('box', this.width * 0.9, this.height * 0.05, this.depth * 0.9);

    // 공유 재질 사용
    const baseMaterial = this.getMaterial('standard', {
      color: this.adjustColor(this.color, -0.2),
      roughness: 0.8,
      metalness: 0.2
    });

    const buildingMaterial = this.getMaterial('standard', {
      color: this.color,
      roughness: 0.7,
      metalness: 0.1
    });

    const topMaterial = this.getMaterial('standard', {
      color: this.adjustColor(this.color, 0.1),
      roughness: 0.5,
      metalness: 0.3
    });

    // Main building body - 밑부분
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -this.height * 0.45;
    base.castShadow = this.castShadow;
    base.receiveShadow = true;
    this.mesh.add(base);

    // 메인 건물 몸체
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.castShadow = this.castShadow;
    building.receiveShadow = true;
    this.mesh.add(building);

    // 위쪽 장식부분
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height * 0.5 + this.height * 0.025;
    top.castShadow = this.castShadow;
    this.mesh.add(top);

    // Add windows - 인스턴스 메시로 최적화
    this.addWindows(building);
  }

  // 다른 특수 건물 생성 메서드들도 동일한 방식으로 최적화
  // 여기서는 중요한 최적화 영역인 창문 생성에 중점을 둡니다

  addWindows(building) {
    // Window counts - 개수 줄임
    const windowsHorizontal = Math.floor(this.width * 2);
    const windowsVertical = Math.floor(this.height * 1.5);

    // Window size and depth
    const windowSize = Math.min(0.2, this.width / 12);
    const windowDepth = 0.05;

    // 창문용 공유 지오메트리
    const windowGeometry = this.getGeometry('box', windowSize, windowSize, windowDepth);

    // Window material - light blue with glow
    const windowMaterial = this.getMaterial('standard', {
      color: 0xc8e6f5,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xc8e6f5,
      emissiveIntensity: 0.2
    });

    // 창문 수 계산
    const totalWindows = windowsHorizontal * windowsVertical * 4; // 앞,뒤,양옆

    // 인스턴스 메시 생성
    const windowInstancedMesh = new THREE.InstancedMesh(
      windowGeometry,
      windowMaterial,
      totalWindows
    );
    windowInstancedMesh.castShadow = false; // 창문은 그림자 생성 안함
    building.add(windowInstancedMesh);

    // 창문 배치를 위한 행렬
    const matrix = new THREE.Matrix4();
    let instanceIndex = 0;

    // Front windows
    for (let i = 0; i < windowsHorizontal; i++) {
      for (let j = 0; j < windowsVertical; j++) {
        // Skip some windows randomly for variety (20% 확률로 스킵)
        if (Math.random() > 0.8) continue;

        // Calculate window position
        const offsetX = (this.width / windowsHorizontal) * (i - (windowsHorizontal - 1) / 2);
        const offsetY = (this.height / windowsVertical) * (j - (windowsVertical - 1) / 2);

        // 앞면 창문
        matrix.makeTranslation(offsetX, offsetY, this.depth / 2 + windowDepth / 2);
        windowInstancedMesh.setMatrixAt(instanceIndex++, matrix);

        // 뒷면 창문
        matrix.makeTranslation(offsetX, offsetY, -this.depth / 2 - windowDepth / 2);
        windowInstancedMesh.setMatrixAt(instanceIndex++, matrix);
      }
    }

    // Side windows (if building is wide enough)
    if (this.width > 1.5) {
      const sideWindowsHorizontal = Math.floor(this.depth * 2);

      for (let i = 0; i < sideWindowsHorizontal; i++) {
        for (let j = 0; j < windowsVertical; j++) {
          // Skip some windows randomly
          if (Math.random() > 0.8) continue;

          const offsetZ = (this.depth / sideWindowsHorizontal) * (i - (sideWindowsHorizontal - 1) / 2);
          const offsetY = (this.height / windowsVertical) * (j - (windowsVertical - 1) / 2);

          // 오른쪽 창문
          matrix.makeTranslation(this.width / 2 + windowDepth / 2, offsetY, offsetZ);
          matrix.makeRotationY(Math.PI / 2); // 옆면을 향하도록 회전
          windowInstancedMesh.setMatrixAt(instanceIndex++, matrix);

          // 왼쪽 창문
          matrix.makeTranslation(-this.width / 2 - windowDepth / 2, offsetY, offsetZ);
          matrix.makeRotationY(-Math.PI / 2); // 반대 방향으로 회전
          windowInstancedMesh.setMatrixAt(instanceIndex++, matrix);
        }
      }
    }

    // 인스턴스 업데이트
    windowInstancedMesh.instanceMatrix.needsUpdate = true;

    // 실제 사용된 창문 수로 인스턴스 크기 조정
    windowInstancedMesh.count = instanceIndex;
  }

  addLogo(logoTexture) {
    // 로고 텍스처 로드 - 공유 로더 사용
    Building.textureLoader.load(logoTexture, (texture) => {
      // 텍스처 압축 및 밉맵 최적화
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.anisotropy = 4;

      // Logo size relative to building width
      const logoSize = this.width * 1.1;

      // 로고용 공유 지오메트리
      const logoGeometry = this.getGeometry('plane', logoSize, logoSize);

      const logoMaterial = this.getMaterial('basic', {
        map: texture,
        transparent: true,
        side: THREE.FrontSide
      });

      // 로고 메시 생성
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.position.y = this.height * 1.1;
      logo.userData.isLogo = true;

      // Add to the mesh
      this.mesh.add(logo);

      // Store reference for the update method
      this.logo = logo;
    });
  }

  addRoof() {
    const roofGeometry = this.getGeometry('cone', this.width * 0.7, this.height * 0.4, 4);
    const roofMaterial = this.getMaterial('standard', {
      color: 0x8fb9aa,
      roughness: 0.8,
      metalness: 0.2
    });

    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = this.height / 2 + this.height * 0.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = this.castShadow;
    this.mesh.add(roof);
    return this;
  }

  // Highlight building when selected
  highlight() {
    this.mesh.traverse(child => {
      // 로고 요소는 건드리지 않음
      if (child.userData.isLogo) return;

      if (child.isMesh) {
        // InstancedMesh는 특별 처리
        if (child.isInstancedMesh) {
          child.material.emissive = new THREE.Color(0xffffff);
          child.material.emissiveIntensity = 0.2;
        }
        // 일반 메시
        else if (child.material) {
          if (!child.userData.originalColor) {
            child.userData.originalColor = child.material.color.getHex();
            child.material.emissive = new THREE.Color(0xffffff);
            child.material.emissiveIntensity = 0.2;
          }
        }
      }
    });
  }

  // Remove highlight
  unhighlight() {
    this.mesh.traverse(child => {
      // 로고 요소는 건드리지 않음
      if (child.userData.isLogo) return;

      if (child.isMesh) {
        // InstancedMesh는 특별 처리
        if (child.isInstancedMesh) {
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
        }
        // 일반 메시
        else if (child.material && child.userData.originalColor) {
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
          delete child.userData.originalColor;
        }
      }
    });
  }

  createMainBuilding() {
    // Main showcase building (taller and more detailed)
    // 공유 지오메트리 사용
    const baseGeometry = this.getGeometry('box', this.width * 1.2, this.height * 0.1, this.depth * 1.2);
    const coreGeometry = this.getGeometry('box', this.width * 0.9, this.height, this.depth * 0.9);
    const pillarGeometry = this.getGeometry('box', this.width * 0.15, this.height, this.depth * 0.15);
    const topGeometry = this.getGeometry('cylinder', this.width * 0.4, this.width * 0.6, this.height * 0.25, 8);
    const ringGeometry = this.getGeometry('torus', this.width * 0.5, this.width * 0.03, 16, 32);
    const entranceGeometry = this.getGeometry('box', this.width * 0.4, this.height * 0.2, this.depth * 0.1);
    const stairsGeometry = this.getGeometry('box', this.width * 0.5, this.height * 0.05, this.depth * 0.3);

    // 공유 재질 사용
    const baseMaterial = this.getMaterial('standard', {
      color: 0x5d738b,
      roughness: 0.7,
      metalness: 0.3
    });

    const coreMaterial = this.getMaterial('standard', {
      color: this.color,
      roughness: 0.5,
      metalness: 0.2
    });

    const pillarMaterial = this.getMaterial('standard', {
      color: 0x7ea8c4,
      roughness: 0.4,
      metalness: 0.6
    });

    const topMaterial = this.getMaterial('standard', {
      color: 0x7ea8c4,
      roughness: 0.4,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9
    });

    const ringMaterial = this.getMaterial('standard', {
      color: 0x7ea8c4,
      emissive: 0x7ea8c4,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7
    });

    const entranceMaterial = this.getMaterial('standard', {
      color: 0xc8e6f5,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9
    });

    const stairsMaterial = this.getMaterial('standard', {
      color: 0x5d738b,
      roughness: 0.7,
      metalness: 0.2
    });

    // Base
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -this.height * 0.45;
    base.castShadow = this.castShadow;
    base.receiveShadow = true;
    this.mesh.add(base);

    // 보조 기둥들 추가
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(
          x * (this.width * 0.45),
          0,
          z * (this.depth * 0.45)
        );
        pillar.castShadow = this.castShadow;
        this.mesh.add(pillar);
      }
    }

    // 메인 건물 코어
    const building = new THREE.Mesh(coreGeometry, coreMaterial);
    building.castShadow = this.castShadow;
    building.receiveShadow = true;
    this.mesh.add(building);

    // Add windows
    this.addWindows(building);

    // Add modern top
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.125;
    top.castShadow = this.castShadow;
    this.mesh.add(top);

    // 글로우 효과를 위한 상단 링
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = this.height * 0.45;
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    // Add entrance
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, -this.height / 2 + this.height * 0.1, this.depth / 2 + this.depth * 0.05);
    this.mesh.add(entrance);

    // 보조 엔트런스 계단
    const stairs = new THREE.Mesh(stairsGeometry, stairsMaterial);
    stairs.position.set(0, -this.height * 0.47, this.depth * 0.6);
    this.mesh.add(stairs);
  }
  createKubernetesBuilding() {
    // 기본 구조 생성
    this.createStandardBuilding();

    // Kubernetes 디자인 - 컨테이너 스택 모양 최적화
    const colors = [0x326ce5, 0x435caa, 0x3550c2];

    // 컨테이너 스택을 위한 공통 지오메트리
    for (let i = 0; i < 3; i++) {
      const containerGeometry = this.getGeometry(
        'box',
        this.width * (1 - i * 0.1),
        this.height * 0.15,
        this.depth * (1 - i * 0.1)
      );

      const containerMaterial = this.getMaterial('standard', {
        color: colors[i % colors.length],
        roughness: 0.6,
        metalness: 0.3
      });

      const container = new THREE.Mesh(containerGeometry, containerMaterial);
      container.position.y = -this.height * 0.4 + i * this.height * 0.25;
      container.castShadow = this.castShadow;
      this.mesh.add(container);
    }

    // 스티어링휠 모양 장식 (쿠버네티스 로고)
    const wheelGeometry = this.getGeometry('torus', this.width * 0.3, this.width * 0.05, 16, 24);
    const wheelMaterial = this.getMaterial('standard', {
      color: 0x326ce5,
      roughness: 0.4,
      metalness: 0.5
    });

    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = this.height * 0.4;
    wheel.castShadow = this.castShadow;
    this.mesh.add(wheel);
  }

  createAwsBuilding() {
    // AWS-themed building
    this.createStandardBuilding();

    // Add top decorative element
    const topGeometry = this.getGeometry('box', this.width * 0.7, this.height * 0.1, this.depth * 0.7);
    const topMaterial = this.getMaterial('standard', {
      color: 0xff9900, // AWS orange
      roughness: 0.5,
      metalness: 0.3
    });

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.05;
    top.castShadow = this.castShadow;
    this.mesh.add(top);

    // AWS 상징적 디자인
    const awsDetailGeometry = this.getGeometry('box', this.width * 0.2, this.height * 0.3, this.depth * 0.2);
    const awsDetailMaterial = this.getMaterial('standard', {
      color: 0xff9900,
      roughness: 0.4,
      metalness: 0.5
    });

    const awsDetail = new THREE.Mesh(awsDetailGeometry, awsDetailMaterial);
    awsDetail.position.y = this.height * 0.2;
    awsDetail.position.z = this.depth * 0.4;
    awsDetail.castShadow = this.castShadow;
    this.mesh.add(awsDetail);
  }

  createNaverBuilding() {
    // NAVER Cloud themed building
    this.createStandardBuilding();

    // Add distinctive top
    const topGeometry = this.getGeometry('cylinder', this.width * 0.4, this.width * 0.6, this.height * 0.3, 6);
    const topMaterial = this.getMaterial('standard', {
      color: 0x1ec800, // NAVER green
      roughness: 0.5,
      metalness: 0.2
    });

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.15;
    top.castShadow = this.castShadow;
    this.mesh.add(top);

    // 네이버 로고 모양 추가
    const logoGeometry = this.getGeometry('box', this.width * 0.1, this.height * 0.6, this.depth * 0.1);
    const logoMaterial = this.getMaterial('standard', {
      color: 0x1ec800,
      roughness: 0.4,
      metalness: 0.3
    });

    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(this.width * 0.35, 0, this.depth * 0.35);
    logo.castShadow = this.castShadow;
    this.mesh.add(logo);
  }

  createKtBuilding() {
    // KT Cloud themed building
    this.createStandardBuilding();

    // Add distinctive top
    const topGeometry = this.getGeometry('box', this.width, this.height * 0.15, this.depth);
    const topMaterial = this.getMaterial('standard', {
      color: 0xff1c1c, // KT red
      roughness: 0.5,
      metalness: 0.3
    });

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.075;
    top.castShadow = this.castShadow;
    this.mesh.add(top);

    // KT 로고 모양 추가 (간소화된 버전)
    const ktLogoGeometry = this.getGeometry('box', this.width * 0.1, this.height * 0.4, this.depth * 0.1);
    const ktLogoMaterial = this.getMaterial('standard', {
      color: 0xff1c1c,
      roughness: 0.4,
      metalness: 0.5
    });

    const verticalBar = new THREE.Mesh(ktLogoGeometry, ktLogoMaterial);
    verticalBar.position.set(-this.width * 0.25, 0, this.depth * 0.45);
    verticalBar.castShadow = this.castShadow;
    this.mesh.add(verticalBar);

    const horizontalBarGeometry = this.getGeometry('box', this.width * 0.3, this.height * 0.1, this.depth * 0.1);
    const horizontalBar = new THREE.Mesh(horizontalBarGeometry, ktLogoMaterial);
    horizontalBar.position.set(-this.width * 0.15, 0, this.depth * 0.45);
    horizontalBar.castShadow = this.castShadow;
    this.mesh.add(horizontalBar);
  }

  createNhnBuilding() {
    // NHN Cloud themed building
    this.createStandardBuilding();

    // Add stepped top
    for (let i = 0; i < 3; i++) {
      const size = 1 - (i * 0.2);
      const topGeometry = this.getGeometry(
        'box',
        this.width * size,
        this.height * 0.15,
        this.depth * size
      );

      const topMaterial = this.getMaterial('standard', {
        color: 0x00b843, // NHN green
        roughness: 0.6,
        metalness: 0.3
      });

      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = this.height / 2 + (i * this.height * 0.15) + this.height * 0.075;
      top.castShadow = this.castShadow;
      this.mesh.add(top);
    }

    // NHN 특유의 사선 모양 추가
    const slantGeometry = this.getGeometry('box', this.width * 0.1, this.height * 0.6, this.width * 0.1);
    const slantMaterial = this.getMaterial('standard', {
      color: 0x00b843,
      roughness: 0.5,
      metalness: 0.4
    });

    const slant1 = new THREE.Mesh(slantGeometry, slantMaterial);
    slant1.position.set(this.width * 0.4, 0, this.depth * 0.4);
    slant1.rotation.z = Math.PI * 0.1;
    slant1.castShadow = this.castShadow;
    this.mesh.add(slant1);

    const slant2 = slant1.clone();
    slant2.position.set(-this.width * 0.4, 0, this.depth * 0.4);
    slant2.rotation.z = -Math.PI * 0.1;
    this.mesh.add(slant2);
  }

  // Animation update
  update(time, camera) {
    // Optional: Add subtle animations for buildings
    if (this.type === 'main') {
      // Make the main building slightly breathe
      const scale = 1 + Math.sin(time * 0.5) * 0.01;
      this.mesh.scale.set(1, scale, 1);
    }

    // Make logo always face the camera
    if (this.logo && camera) {
      this.logo.lookAt(camera.position);
    }
  }

  // 색상 조정 유틸리티 함수
  adjustColor(color, amount) {
    const hexColor = color.toString(16).padStart(6, '0');
    let r = parseInt(hexColor.substr(0, 2), 16);
    let g = parseInt(hexColor.substr(2, 2), 16);
    let b = parseInt(hexColor.substr(4, 2), 16);

    r = Math.max(0, Math.min(255, r + r * amount));
    g = Math.max(0, Math.min(255, g + g * amount));
    b = Math.max(0, Math.min(255, b + b * amount));

    return (r << 16) + (g << 8) + b;
  }

  // 리소스 정리 메서드
  dispose() {
    // 로고 텍스처 정리
    if (this.logo && this.logo.material && this.logo.material.map) {
      this.logo.material.map.dispose();
    }

    // 정리가 필요한 객체만 선택적으로 처리
    this.mesh.traverse(child => {
      // 공유 지오메트리/머티리얼을 사용하지 않는 요소만 정리
      if (child.isMesh && !this.geometryCache && !this.materialCache) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
    });
  }
}