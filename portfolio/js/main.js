// main.js
import { Portfolio } from './Portfolio.js';


// 로딩 인디케이터 추가
function createLoadingIndicator() {
  const loading = document.createElement('div');
  loading.classList.add('loading');
  loading.innerHTML = `
    <div class="loading-spinner"></div>
    <h2>Loading your portfolio city...</h2>
  `;
  document.body.appendChild(loading);
  return loading;
}

// 전역 포트폴리오 인스턴스 선언
let portfolio = null;

// 윈도우 리사이즈 핸들러
function handleResize() {
  if (portfolio) portfolio.onWindowResize();
}

// 디바운스된 리사이즈 핸들러
let resizeTimeout;
function debouncedResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 100);
}

// 리소스 정리 함수
function cleanup() {
  if (portfolio) {
    window.removeEventListener('resize', debouncedResize);
    portfolio.dispose();
    portfolio = null;
  }
}

// 페이지 로드 시 포트폴리오 초기화
window.addEventListener('DOMContentLoaded', () => {
  const loading = createLoadingIndicator();

  // 리소스 로딩 시간을 주기 위해 약간의 지연 설정
  setTimeout(() => {
    try {
      // 포트폴리오 생성
      portfolio = new Portfolio('canvas-container');
      console.log('포트폴리오가 성공적으로 초기화되었습니다!');

      // 캐릭터 모드 초기화
      portfolio.initCharacterMode();

      // 리사이즈 이벤트 등록
      window.addEventListener('resize', debouncedResize);

      // 페이지 언로드 시 정리
      window.addEventListener('beforeunload', cleanup);
    } catch (error) {
      console.error('포트폴리오 초기화 중 오류:', error);
    }

    // 로딩 인디케이터 제거
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.remove();
    }, 500);
  }, 1500);
});