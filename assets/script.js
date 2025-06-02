
document.addEventListener("DOMContentLoaded", function () {
  const text = "🎉 탑승자 임수인, 환영합니다! 🎉";
  const target = document.getElementById("typewriter");
  let index = 0;

  function type() {
    if (index < text.length) {
      target.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, 100);
    }
  }
  type();
});

function highlightClicked(element) {
  element.innerHTML += " 🌟";
  element.style.color = "#e74c3c";
  element.style.fontWeight = "bold";
}
