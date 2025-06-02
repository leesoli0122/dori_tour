
document.addEventListener("DOMContentLoaded", function () {
  const line1 = "🎉 탑승자 이솔, 동천투어 탑승을 환영합니다. 🎉";
  const target = document.getElementById("typewriter");
  let index = 0;

  function type() {
    if (index < line1.length) {
      target.innerHTML += line1.charAt(index);
      index++;
      setTimeout(type, 100);
    } else {
      // 다음 문장들 순차적으로 등장
      setTimeout(() => {
        document.getElementById("message1").classList.remove("hidden");
      }, 1000);
      setTimeout(() => {
        document.getElementById("message2").classList.remove("hidden");
        document.getElementById("plane").classList.remove("hidden");
      }, 3000);
    }
  }
  type();
});

function highlightClicked(element) {
  element.innerHTML += " 🌟";
  element.style.color = "#e74c3c";
  element.style.fontWeight = "bold";
}
