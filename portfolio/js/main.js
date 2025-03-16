import { Portfolio } from './Portfolio.js';

// 페이지 로드 시 포트폴리오 초기화
window.addEventListener('DOMContentLoaded', () => {
  const portfolio = new Portfolio('canvas-container');

  // 포트폴리오에 대한 추가 정보를 표시하는 UI 요소를 나중에 추가할 수 있음
  console.log('포트폴리오가 성공적으로 초기화되었습니다!');
});