// Character.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Character {
  constructor(scene, camera, ground) {
    this.scene = scene;
    this.camera = camera;
    this.ground = ground;
    this.model = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.previousAction = null;

    // 캐릭터 상태
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.position = new THREE.Vector3(0, 0, 0);

    // 이동 상태
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isRunning = false;

    // 카메라 오프셋
    this.cameraOffset = new THREE.Vector3(0, 5, 10);

    // 충돌 감지용 레이캐스터
    this.raycaster = new THREE.Raycaster();

    // 임시 모델 생성 (실제 GLB가 로드되기 전에 보여줄 간단한 모델)
    this.createTempModel();

    // 키보드 이벤트 리스너 설정
    this.setupKeyboardControls();
  }

  createTempModel() {
    // 임시 캐릭터 모델 (GLTF 로드 전까지 사용)
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x7ea8c4 });
    this.tempModel = new THREE.Mesh(geometry, material);
    this.tempModel.position.set(0, 1, 0);
    this.tempModel.castShadow = true;
    this.scene.add(this.tempModel);

    // 그림자를 위한 바닥 원형 추가
    const shadowGeometry = new THREE.CircleGeometry(0.6, 16);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });
    this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.01;
    this.scene.add(this.shadow);
  }

  loadModel(modelPath) {
    const loader = new GLTFLoader();

    loader.load(modelPath, (gltf) => {
      // 기존 임시 모델 제거
      if (this.tempModel) {
        this.scene.remove(this.tempModel);
        this.tempModel.geometry.dispose();
        this.tempModel.material.dispose();
        this.tempModel = null;
      }

      // 로드된 모델 설정
      this.model = gltf.scene;
      this.model.scale.set(1, 1, 1); // 적절한 크기로 조정
      this.model.position.set(0, 0, 0);
      this.model.castShadow = true;
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      this.scene.add(this.model);

      // 애니메이션 설정
      if (gltf.animations && gltf.animations.length) {
        this.mixer = new THREE.AnimationMixer(this.model);

        // 애니메이션 클립 분류 및 저장
        gltf.animations.forEach((clip) => {
          const name = clip.name.toLowerCase();

          if (name.includes('idle')) {
            this.animations.idle = this.mixer.clipAction(clip);
          } else if (name.includes('walk')) {
            this.animations.walk = this.mixer.clipAction(clip);
          } else if (name.includes('run')) {
            this.animations.run = this.mixer.clipAction(clip);
          }
        });

        // 기본 대기 애니메이션 재생
        if (this.animations.idle) {
          this.currentAction = this.animations.idle;
          this.currentAction.play();
        }
      }

      console.log('캐릭터 모델 로드 완료');
    },
      (xhr) => {
        console.log(`모델 로딩 중: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error('모델 로딩 오류:', error);
      });
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;

        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;

        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;

        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;

        case 'ShiftLeft':
          this.isRunning = true;
          break;

        case 'KeyE':
          // 가까운 건물과 상호작용
          this.interactWithNearbyBuilding();
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;

        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;

        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;

        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;

        case 'ShiftLeft':
          this.isRunning = false;
          break;
      }
    });
  }

  interactWithNearbyBuilding() {
    // 주변 건물 검색 로직은 나중에 구현
    console.log('주변 건물 정보 확인');
  }

  update(delta, buildings) {
    // 모델이 없을 경우 임시 모델 업데이트
    const characterModel = this.model || this.tempModel;
    if (!characterModel) return;

    // 애니메이션 믹서 업데이트
    if (this.mixer) this.mixer.update(delta);

    // 이동 속도 계산
    const speed = this.isRunning ? 8 : 4;
    const velocity = speed * delta;

    // 이동 방향 계산
    const direction = new THREE.Vector3();

    if (this.moveForward) direction.z -= 1;
    if (this.moveBackward) direction.z += 1;
    if (this.moveLeft) direction.x -= 1;
    if (this.moveRight) direction.x += 1;

    // 방향이 있을 경우만 처리
    if (direction.length() > 0) {
      direction.normalize();

      // 카메라 방향 기준으로 이동 방향 계산
      const cameraDirection = new THREE.Vector3();
      this.camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      // 카메라 방향을 기준으로 회전 행렬 계산
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.lookAt(
        new THREE.Vector3(0, 0, 0),
        cameraDirection,
        new THREE.Vector3(0, 1, 0)
      );

      // 이동 방향을 카메라 기준으로 변환
      direction.applyMatrix4(rotationMatrix);

      // 캐릭터 회전
      characterModel.lookAt(
        characterModel.position.x + direction.x,
        characterModel.position.y,
        characterModel.position.z + direction.z
      );

      // 캐릭터 이동
      characterModel.position.x += direction.x * velocity;
      characterModel.position.z += direction.z * velocity;

      // 그림자 위치 업데이트
      if (this.shadow) {
        this.shadow.position.x = characterModel.position.x;
        this.shadow.position.z = characterModel.position.z;
      }

      // 애니메이션 상태 변경
      if (this.mixer && this.animations) {
        const newAction = this.isRunning ? this.animations.run : this.animations.walk;
        this.changeAnimation(newAction);
      }
    } else {
      // 멈췄을 때 대기 애니메이션으로 변경
      if (this.mixer && this.animations && this.animations.idle) {
        this.changeAnimation(this.animations.idle);
      }
    }

    // 카메라 업데이트
    this.updateCamera();

    // 충돌 감지 및 처리
    this.handleCollisions(buildings);
  }

  changeAnimation(newAction) {
    if (!newAction || newAction === this.currentAction) return;

    // 이전 애니메이션에서 새 애니메이션으로 부드럽게 전환
    if (this.currentAction) {
      this.currentAction.fadeOut(0.2);
    }

    newAction.reset().fadeIn(0.2).play();
    this.currentAction = newAction;
  }

  updateCamera() {
    // 모델이 없을 경우 임시 모델 사용
    const target = this.model || this.tempModel;
    if (!target) return;

    // 카메라가 캐릭터 뒤를 따라가도록 설정
    const idealOffset = new THREE.Vector3(0, this.cameraOffset.y, this.cameraOffset.z);
    idealOffset.applyQuaternion(target.quaternion);
    idealOffset.add(target.position);

    const idealLookAt = new THREE.Vector3(0, 1, -10);
    idealLookAt.applyQuaternion(target.quaternion);
    idealLookAt.add(target.position);

    // 부드럽게 카메라 이동 (실제 구현에서는 lerp 사용)
    this.camera.position.copy(idealOffset);
    this.camera.lookAt(target.position);
  }

  handleCollisions(buildings) {
    // 간단한 충돌 검사 (실제 구현에서는 더 정교한 방식 사용)
    const target = this.model || this.tempModel;
    if (!target) return;

    // 건물과의 충돌 검사
    for (const building of buildings) {
      if (!building.mesh) continue;

      // 건물의 바운딩 박스 계산
      const buildingBox = new THREE.Box3().setFromObject(building.mesh);

      // 캐릭터의 바운딩 박스 계산
      const characterBox = new THREE.Box3().setFromObject(target);

      // 충돌 검사
      if (characterBox.intersectsBox(buildingBox)) {
        // 충돌 시 처리 (간단하게 이전 위치로 되돌리기)
        const pushDirection = new THREE.Vector3();
        pushDirection.subVectors(target.position, building.mesh.position).normalize();

        target.position.x += pushDirection.x * 0.1;
        target.position.z += pushDirection.z * 0.1;

        if (this.shadow) {
          this.shadow.position.x = target.position.x;
          this.shadow.position.z = target.position.z;
        }
      }
    }
  }

  dispose() {
    // 리소스 정리
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
    }

    if (this.tempModel) {
      this.scene.remove(this.tempModel);
      this.tempModel.geometry.dispose();
      this.tempModel.material.dispose();
    }

    if (this.shadow) {
      this.scene.remove(this.shadow);
      this.shadow.geometry.dispose();
      this.shadow.material.dispose();
    }

    // 참조 해제
    this.model = null;
    this.tempModel = null;
    this.shadow = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
  }
}