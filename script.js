// Wait for the entire HTML DOM to be fully loaded before executing the function
window.addEventListener("DOMContentLoaded", () => {
  // SELECT IMPORTANT ELEMENTS FROM THE DOM
  const shark = document.getElementById("shark"); // Get the shark element
  const waves = document.getElementById("waves"); // Get the waves element at the bottom
  const dropletsContainer = document.querySelector(".splash-droplets"); // Container where splash/blood droplets appear

  // Get competitor logos the shark can interact with
  const competitors = [
    document.getElementById("nike"),
    document.getElementById("alo"),
    document.getElementById("under-armour"),
    document.getElementById("adidas"),
  ];

  let wasInBeachZone = false; // Flag to check if the shark entered the beach (waves) zone before
  let eaten = new Set(); // Set to store which logos have been eaten (to prevent double eating)

  // Array of items (icons like dumbbell, shirt...) with their appearing direction
  const items = [
    { el: document.getElementById("dumbbell"), from: "left" },
    { el: document.getElementById("tshirt"), from: "right" },
    { el: document.getElementById("kettlebell"), from: "left" },
    { el: document.getElementById("short"), from: "right" },
    { el: document.getElementById("plate"), from: "left" },
    { el: document.getElementById("skirt"), from: "right" },
  ];

  // === ADD SCROLL EVENT LISTENER ===
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY; // Get the vertical scroll position in pixels

    // === SHARK MOVEMENT: ZIG-ZAG LOGIC ===

    const stages = competitors.map((c) => getElementCenterY(c)); // Get vertical center (Y) of each logo
    const waveY = getElementCenterY(waves); // Get vertical center of waves

    const stageCount = stages.length + 1; // Number of stages = logos + wave area
    const totalHeight = document.body.scrollHeight - window.innerHeight; // Total scrollable height of the page
    const stageHeight = totalHeight / stageCount; // Height for each stage

    let sharkTop = 100; // Default top position of the shark in pixels
    let sharkLeft = "40%"; // Default horizontal position (centered)

    // Check which stage the scroll is in, and move shark accordingly
    for (let i = 0; i < stages.length; i++) {
      if (scrollY < stageHeight * (i + 1)) {
        const prevY = i === 0 ? 100 : stages[i - 1]; // Use 100 if first stage, else previous logo Y
        // Smooth transition from prevY to current stage
        sharkTop = lerp(
          prevY,
          stages[i],
          (scrollY - stageHeight * i) / stageHeight
        );
        sharkLeft = i % 2 === 0 ? "18%" : "62%"; // Zig-zag horizontally: left if even, right if odd
        break; // Found the stage, exit loop
      }
    }

    // If scroll is past the last stage, move shark toward the waves area
    if (scrollY >= stageHeight * stages.length) {
      sharkTop = lerp(
        stages[stages.length - 1], // Start from last logo
        waveY, // Go to waves
        (scrollY - stageHeight * stages.length) / stageHeight // Smooth transition
      );
      sharkLeft = "40%"; // Return to center
    }

    // Apply the calculated position to the shark element
    shark.style.top = sharkTop + "px"; // Vertical position
    shark.style.left = sharkLeft; // Horizontal position

    // === ICON ANIMATIONS ===
    items.forEach(({ el, from }, i) => {
      const threshold = 50 + i * 100; // Each icon appears at a different scrollY threshold
      if (scrollY > threshold) {
        el.style.opacity = "1"; // Make it visible
        el.style.transform = "translate(0, 0)"; // Move to its original position
      } else {
        const x = from === "left" ? -100 : 100; // Offset from left or right
        el.style.opacity = "0"; // Make invisible
        el.style.transform = `translate(${x}px, -100px)`; // Slide off-screen with upward position
      }
    });

    // === SPLASH ANIMATION TRIGGER ===
    const sharkRect = shark.getBoundingClientRect(); // Get shark’s position on screen
    const wavesRect = waves.getBoundingClientRect(); // Get waves’ position on screen

    // Check if shark’s bottom is overlapping the waves area
    const isInBeachZone = sharkRect.bottom >= wavesRect.top + 100;

    // If status changed (entered or left), trigger splash
    if (isInBeachZone !== wasInBeachZone) {
      triggerSplash(); // Show splash
      wasInBeachZone = isInBeachZone; // Update the state
    }

    // === SHARK EATS COMPETITOR LOGOS ===
    competitors.forEach((logo) => {
      const logoRect = logo.getBoundingClientRect(); // Get logo position

      // Check if shark and logo overlap (collision detection)
      const overlap = !(
        sharkRect.right < logoRect.left ||
        sharkRect.left > logoRect.right ||
        sharkRect.bottom < logoRect.top ||
        sharkRect.top > logoRect.bottom
      );

      // If overlapping and not already eaten
      if (overlap && !eaten.has(logo)) {
        eaten.add(logo); // Mark as eaten
        logo.style.opacity = "0"; // Hide logo
        logo.style.pointerEvents = "none"; // Disable click
        triggerBloodSplash(
          logoRect.left + logoRect.width / 2, // X center
          logoRect.top + logoRect.height / 2 // Y center
        ); // Show blood splash at logo center
      }

      // Respawn if user scrolls back up above the logo
      if (!overlap && scrollY + 200 < logoRect.top) {
        if (eaten.has(logo)) {
          eaten.delete(logo);
          logo.style.opacity = "1";
          logo.style.pointerEvents = "auto";
        }
      }
    });
  });

  // === SPLASH EFFECT (BLACK DROPLETS IN WAVES AREA) ===
  function triggerSplash() {
    waves.classList.add("splash"); // Add a CSS class to show splash animation
    createSplashDroplets("black"); // Create animated black water droplets
    setTimeout(() => {
      waves.classList.remove("splash"); // Remove the splash class after 2 seconds
      dropletsContainer.innerHTML = ""; // Clear droplets from DOM
    }, 2000);
  }

  // === BLOOD SPLASH EFFECT WHEN SHARK EATS A LOGO ===
  function triggerBloodSplash(x, y) {
    for (let i = 0; i < 10; i++) {
      const drop = document.createElement("div"); // Create a red droplet
      drop.classList.add("splash-droplet");
      drop.style.background = "red";

      const containerRect = dropletsContainer.getBoundingClientRect();
      // Set drop position relative to container
      drop.style.left = `${x - containerRect.left}px`;
      drop.style.top = `${y - containerRect.top}px`;

      const moveX = (Math.random() - 0.5) * 100; // Random left/right splash
      const moveY = -Math.random() * 80; // Random upward splash
      drop.style.setProperty("--move", `translate(${moveX}px, ${moveY}px)`);

      dropletsContainer.appendChild(drop); // Add to the container

      // Remove drop after animation ends
      drop.addEventListener("animationend", () => drop.remove());
    }
  }

  // === CREATE DROPLETS FOR SPLASH ===
  function createSplashDroplets(color = "black") {
    dropletsContainer.innerHTML = ""; // Clear any old droplets
    for (let i = 0; i < 8; i++) {
      const drop = document.createElement("div");
      drop.classList.add("splash-droplet");
      drop.style.background = color;

      const x = (Math.random() - 0.5) * 300; // Random horizontal direction
      const y = -50 - Math.random() * 200; // Random upward splash height
      drop.style.setProperty("--move", `translate(${x}px, ${y}px)`);

      dropletsContainer.appendChild(drop);
    }
  }

  // === UTILITY: Get vertical center Y of an element relative to page ===
  function getElementCenterY(el) {
    const rect = el.getBoundingClientRect(); // Get element position on screen
    return rect.top + window.scrollY + rect.height / 2 - 100; // Convert to page Y + center offset
  }

  // === UTILITY: Linearly interpolate between start and end based on t ===
  function lerp(start, end, t) {
    return start + (end - start) * Math.min(Math.max(t, 0), 1); // Clamp t to 0-1 and interpolate
  }
});
