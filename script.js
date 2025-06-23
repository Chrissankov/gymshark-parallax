window.addEventListener("DOMContentLoaded", () => {
  const shark = document.getElementById("shark");
  const waves = document.getElementById("waves");
  const dropletsContainer = document.querySelector(".splash-droplets");
  const competitors = document.querySelectorAll(".competitor-logo");

  let wasInBeachZone = false;
  let eaten = new Set();

  const items = [
    { el: document.getElementById("dumbbell"), from: "left" },
    { el: document.getElementById("tshirt"), from: "right" },
    { el: document.getElementById("kettlebell"), from: "left" },
    { el: document.getElementById("short"), from: "right" },
    { el: document.getElementById("plate"), from: "left" },
    { el: document.getElementById("skirt"), from: "right" },
  ];

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // Move shark down with scroll
    shark.style.top = 100 + scrollY * 1.3 + "px";

    // Animate items
    items.forEach(({ el, from }, i) => {
      const threshold = 50 + i * 100;
      if (scrollY > threshold) {
        el.style.opacity = "1";
        el.style.transform = "translate(0, 0)";
      } else {
        const x = from === "left" ? -100 : 100;
        el.style.opacity = "0";
        el.style.transform = `translate(${x}px, -100px)`;
      }
    });

    // Splash logic
    const sharkRect = shark.getBoundingClientRect();
    const wavesRect = waves.getBoundingClientRect();
    const isInBeachZone = sharkRect.bottom >= wavesRect.top + 100;

    if (isInBeachZone !== wasInBeachZone) {
      triggerSplash();
      wasInBeachZone = isInBeachZone;
    }

    // Collision & respawn logic
    competitors.forEach((logo) => {
      const logoRect = logo.getBoundingClientRect();
      const sharkRect = shark.getBoundingClientRect();

      // Collision check
      const overlap = !(
        sharkRect.right < logoRect.left ||
        sharkRect.left > logoRect.right ||
        sharkRect.bottom < logoRect.top ||
        sharkRect.top > logoRect.bottom
      );

      const logoTop = logo.getBoundingClientRect().top + window.scrollY;

      // 🧠 Check if logo is below shark
      if (scrollY * 1.3 + 100 > logoTop - window.innerHeight / 2) {
        if (overlap && !eaten.has(logo)) {
          eaten.add(logo);
          logo.style.opacity = "0";
          logo.style.pointerEvents = "none";
          triggerBloodSplash(
            logoRect.left + logoRect.width / 2,
            logoRect.top + logoRect.height / 2
          );
        }
      }

      // 🔄 Respawn if user scrolls back up above the logo
      if (scrollY * 1.3 + 100 < logoTop - 150) {
        if (eaten.has(logo)) {
          eaten.delete(logo);
          logo.style.opacity = "1";
          logo.style.pointerEvents = "auto";
        }
      }
    });
  });

  function triggerSplash() {
    waves.classList.add("splash");
    createSplashDroplets("black");

    setTimeout(() => {
      waves.classList.remove("splash");
      dropletsContainer.innerHTML = "";
    }, 2000);
  }

  function triggerBloodSplash(x, y) {
    for (let i = 0; i < 10; i++) {
      const drop = document.createElement("div");
      drop.classList.add("splash-droplet");
      drop.style.background = "red";

      const containerRect = dropletsContainer.getBoundingClientRect();
      drop.style.left = `${x - containerRect.left}px`;
      drop.style.top = `${y - containerRect.top}px`;

      const moveX = (Math.random() - 0.5) * 100;
      const moveY = -Math.random() * 80;
      drop.style.setProperty("--move", `translate(${moveX}px, ${moveY}px)`);

      dropletsContainer.appendChild(drop);

      drop.addEventListener("animationend", () => {
        drop.remove();
      });
    }
  }

  function createSplashDroplets(color = "black") {
    dropletsContainer.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const drop = document.createElement("div");
      drop.classList.add("splash-droplet");
      drop.style.background = color;
      const x = (Math.random() - 0.5) * 300;
      const y = -50 - Math.random() * 200;
      drop.style.setProperty("--move", `translate(${x}px, ${y}px)`);
      dropletsContainer.appendChild(drop);
    }
  }
});
