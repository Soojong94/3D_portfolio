// Building.js
import * as THREE from 'three';
import { TextureLoader } from 'three';

export class Building {
  constructor(options = {}) {
    const {
      width = 4,           // 기본 너비 증가
      height = 8,          // 기본 높이 증가
      depth = 4,           // 기본 깊이 증가
      posX = 0,
      posY = 0,
      posZ = 0,
      color = 0xf5b971,
      type = 'standard',
      logoTexture = null,
      info = null
    } = options;

    // Building mesh group
    this.mesh = new THREE.Group();

    // Store building properties
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;
    this.type = type;
    this.info = info || {
      title: "Cloud Building",
      description: "A modern cloud infrastructure building."
    };

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
    // Main building body - 밑부분 첨가
    const baseGeometry = new THREE.BoxGeometry(this.width * 1.1, this.height * 0.1, this.depth * 1.1);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: this.adjustColor(this.color, -0.2),
      roughness: 0.8,
      metalness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -this.height * 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    this.mesh.add(base);

    // 메인 건물 몸체
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.7,
      metalness: 0.1
    });
    const building = new THREE.Mesh(geometry, material);
    building.castShadow = true;
    building.receiveShadow = true;
    this.mesh.add(building);

    // 위쪽 장식부분 추가
    const topGeometry = new THREE.BoxGeometry(this.width * 0.9, this.height * 0.05, this.depth * 0.9);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: this.adjustColor(this.color, 0.1),
      roughness: 0.5,
      metalness: 0.3
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height * 0.5 + this.height * 0.025;
    top.castShadow = true;
    this.mesh.add(top);

    // Add windows
    this.addWindows(building);
  }

  createAwsBuilding() {
    // AWS-themed building (taller, orange accent)
    this.createStandardBuilding();

    // Add top decorative element
    const topGeometry = new THREE.BoxGeometry(this.width * 0.7, this.height * 0.1, this.depth * 0.7);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xff9900, // AWS orange
      roughness: 0.5,
      metalness: 0.3
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.05;
    top.castShadow = true;
    this.mesh.add(top);

    // 추가 디테일 - AWS 상징적 디자인
    const awsDetail = new THREE.Mesh(
      new THREE.BoxGeometry(this.width * 0.2, this.height * 0.3, this.depth * 0.2),
      new THREE.MeshStandardMaterial({
        color: 0xff9900,
        roughness: 0.4,
        metalness: 0.5
      })
    );
    awsDetail.position.y = this.height * 0.2;
    awsDetail.position.z = this.depth * 0.4;
    this.mesh.add(awsDetail);
  }

  createKubernetesBuilding() {
    // 기본 구조 생성
    this.createStandardBuilding();

    // Kubernetes 디자인 - 컨테이너 스택 모양
    const colors = [0x326ce5, 0x435caa, 0x3550c2];

    for (let i = 0; i < 3; i++) {
      const containerGeometry = new THREE.BoxGeometry(
        this.width * (1 - i * 0.1),
        this.height * 0.15,
        this.depth * (1 - i * 0.1)
      );
      const containerMaterial = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.6,
        metalness: 0.3
      });
      const container = new THREE.Mesh(containerGeometry, containerMaterial);
      container.position.y = -this.height * 0.4 + i * this.height * 0.25;
      container.castShadow = true;
      this.mesh.add(container);
    }

    // 추가 스티어링휠 모양 장식 (쿠버네티스 로고)
    const wheelGeometry = new THREE.TorusGeometry(this.width * 0.3, this.width * 0.05, 16, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x326ce5,
      roughness: 0.4,
      metalness: 0.5
    });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = this.height * 0.4;
    wheel.castShadow = true;
    this.mesh.add(wheel);
  }

  createNaverBuilding() {
    // NAVER Cloud themed building (green accent)
    this.createStandardBuilding();

    // Add distinctive top
    const topGeometry = new THREE.CylinderGeometry(this.width * 0.4, this.width * 0.6, this.height * 0.3, 6);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x1ec800, // NAVER green
      roughness: 0.5,
      metalness: 0.2
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.15;
    top.castShadow = true;
    this.mesh.add(top);

    // 네이버 로고 모양 추가
    const logoGeometry = new THREE.BoxGeometry(this.width * 0.1, this.height * 0.6, this.depth * 0.1);
    const logoMaterial = new THREE.MeshStandardMaterial({
      color: 0x1ec800,
      roughness: 0.4,
      metalness: 0.3
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(this.width * 0.35, 0, this.depth * 0.35);
    this.mesh.add(logo);
  }

  createKtBuilding() {
    // KT Cloud themed building (red accent)
    this.createStandardBuilding();

    // Add distinctive top
    const topGeometry = new THREE.BoxGeometry(this.width, this.height * 0.15, this.depth);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xff1c1c, // KT red
      roughness: 0.5,
      metalness: 0.3
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.075;
    top.castShadow = true;
    this.mesh.add(top);

    // KT 로고 모양 추가 (간소화된 버전)
    const ktLogoGeometry = new THREE.BoxGeometry(this.width * 0.1, this.height * 0.4, this.depth * 0.1);
    const ktLogoMaterial = new THREE.MeshStandardMaterial({
      color: 0xff1c1c,
      roughness: 0.4,
      metalness: 0.5
    });

    const verticalBar = new THREE.Mesh(ktLogoGeometry, ktLogoMaterial);
    verticalBar.position.set(-this.width * 0.25, 0, this.depth * 0.45);
    this.mesh.add(verticalBar);

    const horizontalBar = new THREE.Mesh(
      new THREE.BoxGeometry(this.width * 0.3, this.height * 0.1, this.depth * 0.1),
      ktLogoMaterial
    );
    horizontalBar.position.set(-this.width * 0.15, 0, this.depth * 0.45);
    this.mesh.add(horizontalBar);
  }

  createNhnBuilding() {
    // NHN Cloud themed building (unique shape)
    this.createStandardBuilding();

    // Add stepped top
    for (let i = 0; i < 3; i++) {
      const size = 1 - (i * 0.2);
      const topGeometry = new THREE.BoxGeometry(
        this.width * size,
        this.height * 0.15,
        this.depth * size
      );
      const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x00b843, // NHN green
        roughness: 0.6,
        metalness: 0.3
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = this.height / 2 + (i * this.height * 0.15) + this.height * 0.075;
      top.castShadow = true;
      this.mesh.add(top);
    }

    // NHN 특유의 사선 모양 추가
    const slantGeometry = new THREE.BoxGeometry(this.width * 0.1, this.height * 0.6, this.width * 0.1);
    slantGeometry.translate(0, 0, 0);
    const slantMaterial = new THREE.MeshStandardMaterial({
      color: 0x00b843,
      roughness: 0.5,
      metalness: 0.4
    });
    const slant1 = new THREE.Mesh(slantGeometry, slantMaterial);
    slant1.position.set(this.width * 0.4, 0, this.depth * 0.4);
    slant1.rotation.z = Math.PI * 0.1;
    this.mesh.add(slant1);

    const slant2 = slant1.clone();
    slant2.position.set(-this.width * 0.4, 0, this.depth * 0.4);
    slant2.rotation.z = -Math.PI * 0.1;
    this.mesh.add(slant2);
  }

  createMainBuilding() {
    // Main showcase building (taller and more detailed)
    // Base
    const baseGeometry = new THREE.BoxGeometry(this.width * 1.2, this.height * 0.1, this.depth * 1.2);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d738b,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -this.height * 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    this.mesh.add(base);

    // 보조 기둥들 추가
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const pillarGeometry = new THREE.BoxGeometry(this.width * 0.15, this.height, this.depth * 0.15);
        const pillarMaterial = new THREE.MeshStandardMaterial({
          color: 0x7ea8c4,
          roughness: 0.4,
          metalness: 0.6
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(
          x * (this.width * 0.45),
          0,
          z * (this.depth * 0.45)
        );
        pillar.castShadow = true;
        this.mesh.add(pillar);
      }
    }

    // 메인 건물 코어
    const geometry = new THREE.BoxGeometry(this.width * 0.9, this.height, this.depth * 0.9);
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.5,
      metalness: 0.2
    });
    const building = new THREE.Mesh(geometry, material);
    building.castShadow = true;
    building.receiveShadow = true;
    this.mesh.add(building);

    // Add windows
    this.addWindows(building);

    // Add modern top
    const topGeometry = new THREE.CylinderGeometry(
      this.width * 0.4,
      this.width * 0.6,
      this.height * 0.25,
      8
    );
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x7ea8c4, // Scandinavian blue
      roughness: 0.4,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = this.height / 2 + this.height * 0.125;
    top.castShadow = true;
    this.mesh.add(top);

    // 글로우 효과를 위한 상단 링
    const ringGeometry = new THREE.TorusGeometry(this.width * 0.5, this.width * 0.03, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x7ea8c4,
      emissive: 0x7ea8c4,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = this.height * 0.45;
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    // Add entrance
    const entranceGeometry = new THREE.BoxGeometry(this.width * 0.4, this.height * 0.2, this.depth * 0.1);
    const entranceMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8e6f5,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, -this.height / 2 + this.height * 0.1, this.depth / 2 + this.depth * 0.05);
    this.mesh.add(entrance);

    // 보조 엔트런스 계단
    const stairsGeometry = new THREE.BoxGeometry(this.width * 0.5, this.height * 0.05, this.depth * 0.3);
    const stairsMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d738b,
      roughness: 0.7,
      metalness: 0.2
    });
    const stairs = new THREE.Mesh(stairsGeometry, stairsMaterial);
    stairs.position.set(0, -this.height * 0.47, this.depth * 0.6);
    this.mesh.add(stairs);
  }

  adjustColor(color, amount) {
    // 색상 조정 유틸리티 함수
    const hexColor = color.toString(16).padStart(6, '0');
    let r = parseInt(hexColor.substr(0, 2), 16);
    let g = parseInt(hexColor.substr(2, 2), 16);
    let b = parseInt(hexColor.substr(4, 2), 16);

    r = Math.max(0, Math.min(255, r + r * amount));
    g = Math.max(0, Math.min(255, g + g * amount));
    b = Math.max(0, Math.min(255, b + b * amount));

    return (r << 16) + (g << 8) + b;
  }

  addWindows(building) {
    // Window counts - 더 많은 창문 추가
    const windowsHorizontal = Math.floor(this.width * 2.5);
    const windowsVertical = Math.floor(this.height * 2);

    // Window size and depth
    const windowSize = Math.min(0.2, this.width / 12);
    const windowDepth = 0.05;

    // Window material - light blue with glow
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8e6f5,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xc8e6f5,
      emissiveIntensity: 0.2
    });

    // Front windows
    for (let i = 0; i < windowsHorizontal; i++) {
      for (let j = 0; j < windowsVertical; j++) {
        // Skip some windows randomly for variety
        if (Math.random() > 0.85) continue;

        const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, windowDepth);
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

        // Calculate window position
        const offsetX = (this.width / windowsHorizontal) * (i - (windowsHorizontal - 1) / 2);
        const offsetY = (this.height / windowsVertical) * (j - (windowsVertical - 1) / 2);

        windowMesh.position.set(offsetX, offsetY, this.depth / 2 + windowDepth / 2);
        building.add(windowMesh);

        // Add back windows
        const backWindowMesh = windowMesh.clone();
        backWindowMesh.position.z = -this.depth / 2 - windowDepth / 2;
        building.add(backWindowMesh);
      }
    }

    // Side windows (if building is wide enough)
    if (this.width > 1.5) {
      const sideWindowsHorizontal = Math.floor(this.depth * 2.5);

      for (let i = 0; i < sideWindowsHorizontal; i++) {
        for (let j = 0; j < windowsVertical; j++) {
          // Skip some windows randomly
          if (Math.random() > 0.85) continue;

          const windowGeometry = new THREE.BoxGeometry(windowDepth, windowSize, windowSize);
          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

          const offsetZ = (this.depth / sideWindowsHorizontal) * (i - (sideWindowsHorizontal - 1) / 2);
          const offsetY = (this.height / windowsVertical) * (j - (windowsVertical - 1) / 2);

          windowMesh.position.set(this.width / 2 + windowDepth / 2, offsetY, offsetZ);
          building.add(windowMesh);

          const leftWindowMesh = windowMesh.clone();
          leftWindowMesh.position.x = -this.width / 2 - windowDepth / 2;
          building.add(leftWindowMesh);
        }
      }
    }
  }

  addLogo(logoTexture) {
    const loader = new TextureLoader();

    loader.load(logoTexture, (texture) => {
      // 로고 크기를 건물의 너비에 맞게 조정
      const logoSize = this.width * 1.1; // 크기 증가
      const logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize);
      const logoMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });

      // 건물 위에 떠 있는 로고 생성
      const floatingLogo = new THREE.Mesh(logoGeometry, logoMaterial);
      floatingLogo.position.y = this.height * 1.1; // 높이 증가
      floatingLogo.rotation.x = -Math.PI / 4; // 약간 기울여서 보기 쉽게

      // 반드시 로고 요소임을 표시
      floatingLogo.userData.isLogo = true;

      // 반대편에서도 볼 수 있도록 양면에 로고 배치
      const backLogo = floatingLogo.clone();
      backLogo.rotation.y = Math.PI;
      backLogo.userData.isLogo = true;

      this.mesh.add(floatingLogo);
      this.mesh.add(backLogo);

      // 로고를 회전시키는 애니메이션 효과 추가
      this.logoElements = [floatingLogo, backLogo];
    });
  }

  // update 메서드 수정으로 로고가 항상 카메라를 향하게 함
  update(time, camera) {
    // 기존 애니메이션 코드
    if (this.type === 'main') {
      const scale = 1 + Math.sin(time * 0.5) * 0.01;
      this.mesh.scale.set(1, scale, 1);
    }

    // 로고가 천천히 회전하도록 애니메이션 추가
    if (this.logoElements) {
      for (const logo of this.logoElements) {
        logo.rotation.y += 0.005; // 천천히 회전
      }
    }
  }

  addRoof() {
    const roofGeometry = new THREE.ConeGeometry(this.width * 0.7, this.height * 0.4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8fb9aa, // Sage green
      roughness: 0.8,
      metalness: 0.2
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = this.height / 2 + this.height * 0.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    this.mesh.add(roof);
    return this;
  }

  // Highlight building when selected
  highlight() {
    this.mesh.children.forEach(child => {
      // 로고 요소는 건드리지 않음
      if (child.userData.isLogo) return;

      if (child.material && !child.userData.originalColor) {
        child.userData.originalColor = child.material.color.getHex();
        child.material.emissive = new THREE.Color(0xffffff);
        child.material.emissiveIntensity = 0.2;
      }
    });
  }

  // Remove highlight
  unhighlight() {
    this.mesh.children.forEach(child => {
      // 로고 요소는 건드리지 않음
      if (child.userData.isLogo) return;

      if (child.material && child.userData.originalColor) {
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
        delete child.userData.originalColor;
      }
    });
  }

  // Animation update
  update(time) {
    // Optional: Add subtle animations for buildings
    if (this.type === 'main') {
      // Make the main building slightly breathe
      const scale = 1 + Math.sin(time * 0.5) * 0.01;
      this.mesh.scale.set(1, scale, 1);
    }
  }
}