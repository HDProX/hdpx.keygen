function createRipple(e) {
  const btn    = e.currentTarget;
  const circle = document.createElement("span");
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  circle.classList.add("ripple");
  circle.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${e.clientX - rect.left - size / 2}px;
    top: ${e.clientY - rect.top - size / 2}px;
  `;
  btn.appendChild(circle);
  circle.addEventListener("animationend", () => circle.remove());
}

function attachRipples(selector = ".btn-ripple") {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener("click", createRipple);
  });
}

window.createRipple   = createRipple;
window.attachRipples  = attachRipples;