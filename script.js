// Wait for the entire HTML DOM to be fully loaded before executing the function
window.addEventListener("DOMContentLoaded", () => {
  // SELECT IMPORTANT ELEMENTS FROM THE DOM
  const shark = document.getElementById("shark"); // Get the shark element
  const waves = document.getElementById("waves"); // Get the waves element at the bottom
  const dropletsContainer = document.querySelector(".splash-droplets"); // Container where splash/blood droplets appear

  const screenWidth = window.innerWidth;

  let leftEven;
  let leftOdd;

  if (screenWidth < 477) {
    // Small
    leftEven = "14%";
    leftOdd = "40%";
  } else if (screenWidth >= 477 && screenWidth < 768) {
    // Medium
    leftEven = "16%";
    leftOdd = "49%";
  } else if (screenWidth >= 768 && screenWidth < 1024) {
    // Large
    leftEven = "16%";
    leftOdd = "56%";
  } else if (screenWidth >= 1025 && screenWidth < 1699) {
    // Extra Large
    leftEven = "19%";
  } else {
    // Huge
    leftEven = "18%";
    leftOdd = "67%";
  }

  // Calculate mid position
  const evenNum = parseFloat(leftEven);
  const oddNum = parseFloat(leftOdd);
  const midPos = (evenNum + oddNum) / 2 + "%";

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

  // ADD SCROLL EVENT LISTENER
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY; // Get the vertical scroll position in pixels

    const stages = competitors.map((c) => getElementCenterY(c)); // Get vertical center (Y) of each logo
    const waveY = getElementCenterY(waves); // Get vertical center of waves

    //    Number of stages = logos + wave area
    const stageCount = stages.length + 1;
    //    Total Scrollable Height = The total height of the entire webpage (including the part you have to scroll to see) - The height of the visible viewport
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const stageHeight = totalHeight / stageCount; // Height for each stage
    let sharkTop = 100; // Default top position of the shark in pixels
    let sharkLeft = midPos; // Default horizontal position (centered)

    console.log("🔵 scrollY:", scrollY);
    console.log("🌊 waveY (center of waves):", waveY);
    console.log("📏 stageHeight:", stageHeight);
    stages.forEach((stageY, index) => {
      console.log(`🏁 Stage ${index + 1} center Y:`, stageY);
    });

    // Check which stage the scroll is in, and move shark accordingly
    for (let i = 0; i < stages.length; i++) {
      if (scrollY < stageHeight * (i + 1)) {
        //                   If the first stage use default 100. Otherwise, use the center Y of the previous logo stage.
        const prevY = i === 0 ? 100 : stages[i - 1]; // The shark’s starting vertical position for this interpolation.
        // Smooth transition from prevY to current stage
        sharkTop = lerp(
          prevY, // shark’s vertical position at the start of the stage
          stages[i], // shark’s vertical position at the end of the stage
          (scrollY - stageHeight * i) / stageHeight // how far (in percentage) the scroll is inside this stage
        );
        sharkLeft = i % 2 === 0 ? leftEven : leftOdd; // Zig-zag horizontally: left if even, right if odd
        console.log(
          `➡️ Entering Stage ${i + 1}, Interpolating between Y ${prevY} → ${
            stages[i]
          }`
        );

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
      sharkLeft = midPos; // Return to center
    }

    // Apply the calculated position to the shark element
    shark.style.top = sharkTop + "px"; // Vertical position
    shark.style.left = sharkLeft; // Horizontal position

    console.log("🦈 Shark Position -> Top:", sharkTop, "| Left:", sharkLeft);

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

    // SPLASH ANIMATION TRIGGER
    const sharkRect = shark.getBoundingClientRect(); // Get shark’s position on screen
    const wavesRect = waves.getBoundingClientRect(); // Get waves’ position on screen

    // Check if shark’s bottom is overlapping the waves area
    const isInBeachZone = sharkRect.bottom >= wavesRect.top;

    // If status changed (entered or left), trigger splash
    if (isInBeachZone !== wasInBeachZone) {
      console.log("🏖️ Shark is moving to waves!");
      triggerSplash(); // Show splash
      wasInBeachZone = isInBeachZone; // Update the state
    }

    // SHARK EATS COMPETITOR LOGOS
    competitors.forEach((logo) => {
      const logoRect = logo.getBoundingClientRect(); // Get logo position

      // Check if shark and logo overlap (collision detection)
      // This is a standard rectangle collision formula. If any one of these is true, the two rectangles are not overlapping
      const overlap = !(
        (
          sharkRect.right < logoRect.left || // The shark is completely to the left of the logo
          sharkRect.left > logoRect.right || // The shark is completely to the right of the logo
          sharkRect.bottom < logoRect.top || // The shark is above the logo
          sharkRect.top > logoRect.bottom
        ) // The shark is below the logo
      );

      // If overlapping and not already eaten
      if (overlap && !eaten.has(logo)) {
        console.log("😈 Shark ate logo:", logo.id);
        eaten.add(logo); // Mark as eaten
        logo.style.opacity = "0"; // Hide logo
        triggerBloodSplash(
          logoRect.left + logoRect.width / 2, // X center
          logoRect.top + logoRect.height / 2 // Y center
        ); // Show blood splash at logo center
      }

      // Respawn if user scrolls back up above the logo
      if (!overlap && scrollY + 100 < logoRect.top) {
        if (eaten.has(logo)) {
          console.log("♻️ Respawning logo:", logo.id);
          triggerBloodSplash(
            logoRect.left + logoRect.width / 2, // X center
            logoRect.top + logoRect.height / 2 // Y center
          ); // Show blood splash at logo center
          eaten.delete(logo);
          logo.style.opacity = "1";
        }
      }
    });
  });

  // SPLASH EFFECT (BLACK DROPLETS IN WAVES AREA)
  function triggerSplash() {
    waves.classList.add("splash"); // Add a CSS class to show splash animation
    createSplashDroplets("black"); // Generate black water droplets
    setTimeout(() => {
      waves.classList.remove("splash"); // Remove the splash class after 1 second
    }, 1000);
  }

  // BLOOD SPLASH EFFECT WHEN SHARK EATS A LOGO
  function triggerBloodSplash(x, y) {
    for (let i = 0; i < 10; i++) {
      const drop = document.createElement("div"); // Create a div element named drop
      drop.classList.add("splash-droplet"); // Add for this div a class named splash-droplet
      drop.style.background = "red"; // Colored it as Red

      const containerRect = dropletsContainer.getBoundingClientRect(); //  Gets the position and size of the .splash-droplets container relative to the viewpor

      drop.style.left = `${x - containerRect.left}px`; // X position where the splash starts
      drop.style.top = `${y - containerRect.top}px`; // Y position where the splash starts

      const moveX = (Math.random() - 0.5) * 100; // Random left/right splash
      const moveY = -Math.random() * 80; // Random upward splash
      drop.style.setProperty("--move", `translate(${moveX}px, ${moveY}px)`); // Animate to the values x & y

      dropletsContainer.appendChild(drop); // Add to the container

      // Remove drop after animation ends
      drop.addEventListener("animationend", () => drop.remove());
    }
  }

  // CREATE DROPLETS FOR SPLASH
  function createSplashDroplets() {
    dropletsContainer.innerHTML = ""; // Clear any old droplets
    for (let i = 0; i < 10; i++) {
      const drop = document.createElement("div"); // Create a div element named drop
      drop.classList.add("splash-droplet"); // Add for this div a class named splash-droplet
      drop.style.background = "black"; // Colored it as Black

      const x = (Math.random() - 0.5) * 300; // Random horizontal direction
      const y = -50 - Math.random() * 200; // Random upward splash height
      drop.style.setProperty("--move", `translate(${x}px, ${y}px)`); // Animate to the values x & y

      dropletsContainer.appendChild(drop); // Add these drops divs to the dropletsContainer
    }
  }

  // UTILITY: Get vertical center Y of an element relative to page
  function getElementCenterY(el) {
    const rect = el.getBoundingClientRect(); // Get position and size of the element relative to the viewport (not the whole page)
    //     Distance from the top of the visible screen + Window.scrollY (to convert it from screen position) + Vertical center of the element - Manual offset (likely to adjust the target point slightly above the true center)
    //     Returns -> the approximate center Y (vertical) position of an element relative to the whole page
    return rect.top + window.scrollY + rect.height / 2 - 100; // Convert to page Y + center offset
  }

  // UTILITY: Linear interpolation between start and end based on t: It's a way to find a point between two values — start and end — based on a percentage t that goes from 0 to 1.
  function lerp(start, end, t) {
    // Returns a value between start and end based on t =  Moves from the start value by the calculated distance + How much to move from the start towards the end * Clamp t to 0-1 and interpolate
    return start + (end - start) * Math.min(Math.max(t, 0), 1);
    // It's like glide in scratch. Better than change y by ... for example.
  }
});
