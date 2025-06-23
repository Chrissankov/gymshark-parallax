window.addEventListener("DOMContentLoaded", () => {
  const shark = document.getElementById("shark");
  const waves = document.getElementById("waves");
  const dropletsContainer = document.querySelector(".splash-droplets");

  let splashTriggered = false;

  const items = [
    { el: document.getElementById("dumbbell"), from: "left" },
    { el: document.getElementById("plate"), from: "right" },
    { el: document.getElementById("kettlebell"), from: "left" },
    { el: document.getElementById("tshirt"), from: "right" },
    { el: document.getElementById("short"), from: "left" },
    { el: document.getElementById("skirt"), from: "right" },
  ];

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // Move shark down
    shark.style.top = 100 + scrollY * 1.3 + "px";

    // Animate icons diagonally in
    items.forEach((item, index) => {
      const threshold = 50 + index * 100;
      if (scrollY > threshold) {
        item.el.style.opacity = "1";
        item.el.style.transform = "translate(0, 0)";
      } else {
        item.el.style.opacity = "0";
        // Diagonal fly-in
        item.el.style.transform =
          item.from === "left"
            ? "translate(-100px, -100px)"
            : "translate(100px, -100px)";
      }
    });

    // Splash detection
    // Splash detection
    const sharkRect = shark.getBoundingClientRect();
    const wavesRect = waves.getBoundingClientRect();

    if (sharkRect.bottom >= wavesRect.top + 100 && !splashTriggered) {
      splashTriggered = true;

      waves.classList.add("splash");
      createSplashDroplets();

      // Clear droplets after animation
      setTimeout(() => {
        waves.classList.remove("splash");
        dropletsContainer.innerHTML = "";
        splashTriggered = false;
      }, 800);
    }
  });

  // 💧 Create water splash droplets
  function createSplashDroplets() {
    // Clear any existing ones
    dropletsContainer.innerHTML = ""; // Clear old ones

    const count = 8; // number of droplets

    for (let i = 0; i < count; i++) {
      const drop = document.createElement("div");
      drop.classList.add("splash-droplet");

      // Random direction (left/right) and height
      const x = (Math.random() - 0.5) * 120; // -60 to +60px
      const y = -50 - Math.random() * 80; // -50 to -130px

      // Use CSS variable for animation
      drop.style.setProperty("--move", `translate(${x}px, ${y}px)`);

      dropletsContainer.appendChild(drop);
    }
  }
});
