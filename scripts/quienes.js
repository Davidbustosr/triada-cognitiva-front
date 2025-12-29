/* =================================================================================================
  quienes.js — Triada Cognitiva
  - Lógica solo para la página "Quiénes Somos"
  - Animación de contadores al entrar en viewport
  - Año automático en el footer
================================================================================================= */

// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Año en footer
  const y = document.getElementById("qsYear");
  if (y) y.textContent = new Date().getFullYear();

  // =========================
  // Contadores (data-count)
  // =========================
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  // Función: animateCount()
  const animateCount = (el) => {
    const targetRaw = el.getAttribute("data-count");
    if (!targetRaw) return;

    // Soporta números como "100%" -> target = 100 y luego vuelve el %
    const hasPercent = String(targetRaw).includes("%");
    const target = parseInt(String(targetRaw).replace(/\D/g, ""), 10);

    if (!Number.isFinite(target)) return;

    const duration = 900;
    const start = performance.now();
    const from = 0;

    // Función: tick()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const value = Math.floor(from + (target - from) * (p * (2 - p))); // easeOutQuad

      el.textContent = hasPercent ? `${value}%` : String(value);

      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.35 });

  counters.forEach((c) => io.observe(c));
});