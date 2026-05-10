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

// Reset .navigate-link::after saat tab kembali aktif
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  document.querySelectorAll('.navigate-link').forEach(el => {
    el.style.setProperty('animation', 'none', 'important');
    void el.offsetHeight;
    el.style.removeProperty('animation');
  });
});

// Juga reset saat touchend (lepas jari)
document.addEventListener('touchend', () => {
  document.querySelectorAll('.navigate-link').forEach(el => {
    void el.offsetHeight;
  });
}, { passive: true });

document.addEventListener('click', e => {
  const link = e.target.closest('.navigate-link');
  if (!link) return;
  link.classList.add('tapped');
  setTimeout(() => link.classList.remove('tapped'), 500);
});

window.createRipple   = createRipple;
window.attachRipples  = attachRipples;