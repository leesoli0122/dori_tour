let currentPage = 0;
const pages = document.querySelectorAll('.page');
const buttons = document.querySelectorAll('.next-btn');

// 타이핑 효과 함수
function typeWriter(element, text, speed = 50) {
  element.innerHTML = '';
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

// 페이지 전환 함수
function showPage(pageIndex) {
  pages.forEach((page, index) => {
    if (index === pageIndex) {
      page.classList.add('active');
      page.classList.remove('exit');
      
      // 타이핑 효과가 있는 요소 찾기
      const typewriterElement = page.querySelector('.typewriter-text');
      if (typewriterElement) {
        const originalText = typewriterElement.textContent;
        setTimeout(() => {
          typeWriter(typewriterElement, originalText, 30);
        }, 500);
      }
    } else if (index < pageIndex) {
      page.classList.remove('active');
      page.classList.add('exit');
    } else {
      page.classList.remove('active', 'exit');
    }
  });
}

// 버튼 이벤트 리스너
buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (currentPage < pages.length - 1) {
      currentPage++;
      showPage(currentPage);
    }
  });
});

// 키보드 이벤트 (스페이스바로 다음 페이지)
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentPage < pages.length - 1) {
    e.preventDefault();
    currentPage++;
    showPage(currentPage);
  }
});

// 페이지 로드 시 첫 번째 페이지 표시 - 이 부분이 핵심!
document.addEventListener('DOMContentLoaded', () => {
  // 첫 번째 페이지를 활성화
  showPage(0);
  
  // 첫 번째 페이지의 타이핑 효과
  const firstTypewriter = document.querySelector('.section1 .typewriter');
  if (firstTypewriter) {
    firstTypewriter.style.animation = 'typing 3s steps(40, end), blink-caret 0.75s step-end infinite';
  }
});