(function () {
  const pin = document.querySelector("[data-scroll-pin]");
  const world = document.querySelector("[data-world]");
  const rail = document.querySelector("[data-rail]");
  const caption = document.querySelector("[data-caption]");
  const layers = document.querySelectorAll("[data-layer]");
  const cards = document.querySelectorAll("[data-entity]");

  function progressFor(el) {
    const rect = el.getBoundingClientRect();
    const total = el.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / Math.max(1, total)));
  }

  function frame() {
    if (pin && world) {
      const p = progressFor(pin);
      if (rail) rail.style.height = `${p * 100}%`;
      const z = -180 + p * 220;
      const ry = -10 + p * 16;
      world.style.transform = `translateZ(${z}px) rotateY(${ry}deg)`;
      layers.forEach((layer, i) => {
        const depth = (i + 1) * 40;
        layer.style.transform = `translateZ(${-depth + p * depth}px) scale(${1.08 + p * 0.06})`;
        layer.style.opacity = String(0.55 + p * 0.45);
      });
      const scenes = [
        { at: 0, text: "EASTC Technocentric Varsity · Kempton Park" },
        { at: 0.28, text: "01  EASTC Foundation NPC" },
        { at: 0.54, text: "02  EASTECH Institute" },
        { at: 0.78, text: "03  The Food Court" }
      ];
      let label = scenes[0].text;
      scenes.forEach((s) => { if (p >= s.at) label = s.text; });
      if (caption) caption.textContent = label;
      cards.forEach((card) => {
        const enter = parseFloat(card.dataset.enter || "0");
        const vis = Math.min(1, Math.max(0, (p - enter) / 0.16));
        card.style.opacity = String(vis);
        card.style.transform = `translateZ(${40 + vis * 50}px) translateY(${(1 - vis) * 36}px)`;
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal-3d").forEach((el) => io.observe(el));

  const hero = document.querySelector("[data-hero-slides]");
  if (hero) {
    const slides = hero.dataset.heroSlides.split(",").map((s) => s.trim()).filter(Boolean);
    let i = 0;
    if (slides.length > 1) {
      setInterval(() => {
        i = (i + 1) % slides.length;
        hero.style.backgroundImage = `url('${slides[i]}')`;
      }, 5200);
    }
  }
})();
