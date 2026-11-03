// Direct photo paths & data
const GALLERY_DATA = [
  {
    src: "photos/photo1.jpg",
    caption: "All the smiles, fairy lights & happy balloons! 🎈✨"
  },
  {
    src: "photos/photo2.jpg",
    caption: "Shining bright under the city night lights. 💫"
  },
  {
    src: "photos/photo3.jpg",
    caption: "Pure elegance, grace, and timeless charm. 🖤🤍"
  },
  {
    src: "photos/photo4.jpg",
    caption: "That sweet, glowing smile that brightens any day. 🌸"
  },
  {
    src: "photos/photo5.jpg",
    caption: "Free-spirited, cheerful, and full of sunshine! 🦋✨"
  },
  {
    src: "photos/photo6.jpg",
    caption: "Effortlessly confident, scenic vibes, and simply the best. 💖"
  }
];

// Letter paragraphs for typewriter effect
const LETTER_PARAGRAPHS = [
  "You have always been more than just my sister.",
  "You are my guiding light, my best friend, and someone who makes life so much brighter just by being in it.",
  "I hope this new year of your life brings you happiness, peace, success and so many beautiful memories.",
  "Keep smiling, keep being yourself, and never forget how special you are to me.",
  "Happy Birthday once again, Anu. ❤️"
];

let currentPage = 1;
let currentPhotoIndex = 0;
let typewriterRunning = false;
let typewriterCompleted = false;
let balloonInterval = null;
let heartInterval = null;
let audioSynthActive = false;

// Audio Synthesizer for sweet soft ambient tones (Web Audio API - no external file needed)
let audioCtx = null;

document.addEventListener("DOMContentLoaded", () => {
  initStarCanvas();
  initGalleryDots();
  startAmbientFloatingHearts();
  
  // Setup music toggle
  const musicBtn = document.getElementById("musicToggle");
  if (musicBtn) {
    musicBtn.addEventListener("click", toggleAtmosphereSound);
  }

  // Heart Tree Interactive Tap
  const treeContainer = document.getElementById("heartTreeContainer");
  if (treeContainer) {
    treeContainer.addEventListener("click", () => {
      playChime(783.99, 0.25); // G5 sweet chime
      createBurstHearts(6);
      triggerTreePulse();
    });
  }

  // Pre-load gallery image
  updateGalleryDisplay();
});

/* ==========================================================
   PAGE NAVIGATION CONTROLLER
   ========================================================== */

function goToPage(pageNumber) {
  if (pageNumber === currentPage) return;

  const currentScreen = document.getElementById(`page${currentPage}`);
  const nextScreen = document.getElementById(`page${pageNumber}`);

  if (!nextScreen) return;

  // Sound feedback on click
  playChime(523.25, 0.15); // C5

  if (currentScreen) {
    currentScreen.classList.remove("active");
    currentScreen.classList.add("exit-to-top");
    setTimeout(() => {
      currentScreen.classList.remove("exit-to-top");
    }, 700);
  }

  currentPage = pageNumber;
  nextScreen.classList.add("active");

  // Page-specific trigger actions
  handlePageTriggers(pageNumber);
}

function handlePageTriggers(page) {
  // Page 3: Trigger Heart Bloom
  if (page === 3) {
    createBurstHearts(12);
    triggerTreePulse();
  }

  // Page 4: Balloon Celebration
  if (page === 4) {
    startContinuousBalloons();
  } else {
    stopContinuousBalloons();
  }

  // Page 6: Photo Gallery
  if (page === 6) {
    updateGalleryDisplay();
  }

  // Page 7: Letter Typewriter
  if (page === 7) {
    if (!typewriterCompleted) {
      startLetterTypewriter();
    }
  }

  // Page 8: Final Surprise Celebration
  if (page === 8) {
    triggerGrandCelebration();
  }
}

/* ==========================================================
   PHOTO GALLERY CONTROLLER
   ========================================================== */

function initGalleryDots() {
  const dotsContainer = document.getElementById("galleryDots");
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = "";
  GALLERY_DATA.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.className = `gallery-dot ${idx === 0 ? "active" : ""}`;
    dot.onclick = () => jumpToPhoto(idx);
    dotsContainer.appendChild(dot);
  });
}

function updateGalleryDisplay() {
  const counterEl = document.getElementById("photoCounter");
  const captionEl = document.getElementById("photoCaption");
  const imgEl = document.getElementById("activePhotoImg");
  const dots = document.querySelectorAll(".gallery-dot");

  if (counterEl) {
    counterEl.textContent = `${currentPhotoIndex + 1} / ${GALLERY_DATA.length}`;
  }

  const currentItem = GALLERY_DATA[currentPhotoIndex];

  if (imgEl) {
    const parent = imgEl.parentElement;
    if (parent) {
      const existingFallback = parent.querySelector(".photo-fallback-card");
      if (existingFallback) existingFallback.remove();
    }
    imgEl.style.display = "block";
    imgEl.classList.remove("fade-in");
    imgEl.classList.add("fade-out");

    setTimeout(() => {
      imgEl.src = currentItem.src + "?t=" + Date.now();
      imgEl.alt = `Photo ${currentPhotoIndex + 1} for Anu`;
      imgEl.onload = () => {
        imgEl.style.display = "block";
        const fallback = imgEl.parentElement ? imgEl.parentElement.querySelector(".photo-fallback-card") : null;
        if (fallback) fallback.remove();
        imgEl.classList.remove("fade-out");
        imgEl.classList.add("fade-in");
      };
      imgEl.onerror = () => {
        handleImageFallback(imgEl);
      };
      imgEl.classList.remove("fade-out");
      imgEl.classList.add("fade-in");
    }, 150);
  }

  if (captionEl) {
    captionEl.style.opacity = "0";
    setTimeout(() => {
      captionEl.textContent = currentItem.caption;
      captionEl.style.opacity = "1";
    }, 200);
  }

  // Update dots
  dots.forEach((dot, idx) => {
    if (idx === currentPhotoIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function nextPhoto() {
  currentPhotoIndex = (currentPhotoIndex + 1) % GALLERY_DATA.length;
  playChime(659.25, 0.1); // E5
  updateGalleryDisplay();
}

function prevPhoto() {
  currentPhotoIndex = (currentPhotoIndex - 1 + GALLERY_DATA.length) % GALLERY_DATA.length;
  playChime(587.33, 0.1); // D5
  updateGalleryDisplay();
}

function jumpToPhoto(index) {
  currentPhotoIndex = index;
  playChime(659.25, 0.1);
  updateGalleryDisplay();
}

// Fallback if user hasn't added photo files yet
function handleImageFallback(imgElement) {
  const parent = imgElement.parentElement;
  if (!parent) return;

  imgElement.style.display = "none";
  const existingFallback = parent.querySelector(".photo-fallback-card");
  if (existingFallback) existingFallback.remove();

  const fallback = document.createElement("div");
  fallback.className = "photo-fallback-card";
  fallback.innerHTML = `
    <div class="photo-fallback-icon">📸</div>
    <div class="photo-fallback-text">Photo ${currentPhotoIndex + 1}</div>
    <div style="font-size:0.75rem; color: #ff8da1; margin-top:6px;">Add photos/photo${currentPhotoIndex + 1}.jpg</div>
  `;
  parent.appendChild(fallback);
}

/* ==========================================================
   TYPEWRITER EFFECT FOR BIRTHDAY LETTER
   ========================================================== */

function startLetterTypewriter() {
  if (typewriterRunning) return;
  typewriterRunning = true;

  const targetEl = document.getElementById("typewriterTarget");
  const signatureEl = document.getElementById("letterSignature");
  if (!targetEl) return;

  targetEl.innerHTML = "";
  if (signatureEl) signatureEl.classList.remove("visible");

  let pIndex = 0;
  let charIndex = 0;
  let currentPElement = document.createElement("p");
  currentPElement.style.marginBottom = "14px";
  targetEl.appendChild(currentPElement);

  function typeChar() {
    if (pIndex >= LETTER_PARAGRAPHS.length) {
      typewriterRunning = false;
      typewriterCompleted = true;
      if (signatureEl) signatureEl.classList.add("visible");
      return;
    }

    const currentParagraph = LETTER_PARAGRAPHS[pIndex];

    if (charIndex < currentParagraph.length) {
      currentPElement.textContent += currentParagraph.charAt(charIndex);
      charIndex++;
      
      // Soft gentle tap sound occasionally
      if (charIndex % 5 === 0) {
        playChime(800 + Math.random() * 200, 0.03, "sine", 0.02);
      }
      setTimeout(typeChar, 32);
    } else {
      pIndex++;
      charIndex = 0;
      if (pIndex < LETTER_PARAGRAPHS.length) {
        currentPElement = document.createElement("p");
        currentPElement.style.marginBottom = "14px";
        targetEl.appendChild(currentPElement);
        setTimeout(typeChar, 350);
      } else {
        typewriterRunning = false;
        typewriterCompleted = true;
        if (signatureEl) signatureEl.classList.add("visible");
      }
    }
  }

  typeChar();
}

/* ==========================================================
   GRAND FINALE CELEBRATION (CONFETTI + HEARTS + SOUND)
   ========================================================== */

function triggerGrandCelebration() {
  playCelebrationArpeggio();

  // 1. Multi-stage confetti barrage using Canvas Confetti
  if (typeof confetti === "function") {
    const end = Date.now() + 3.5 * 1000;
    const colors = ["#ff4d79", "#ffd4de", "#9d4edd", "#fcd34d", "#ffffff"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Star explosion in center
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: colors
      });
    }, 400);
  }

  // 2. Extra burst of floating balloons & hearts
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      spawnSingleBalloon();
      spawnSingleFloatingHeart();
    }, i * 150);
  }
}

function replaySurprise() {
  playChime(440, 0.2);
  typewriterCompleted = false;
  currentPhotoIndex = 0;
  goToPage(1);
}

/* ==========================================================
   FLOATING ELEMENTS (HEARTS & BALLOONS)
   ========================================================== */

function startAmbientFloatingHearts() {
  if (heartInterval) clearInterval(heartInterval);
  heartInterval = setInterval(() => {
    if (document.hidden) return;
    spawnSingleFloatingHeart();
  }, 900);
}

function spawnSingleFloatingHeart() {
  const container = document.getElementById("floatingHeartsContainer");
  if (!container) return;

  const heart = document.createElement("div");
  heart.className = "floating-heart-particle";
  const hearts = ["❤️", "💖", "💗", "🌸", "✨", "🤍"];
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  
  const size = Math.floor(Math.random() * 20) + 16;
  const left = Math.floor(Math.random() * 95);
  const duration = (Math.random() * 3 + 5).toFixed(1);

  heart.style.setProperty("--size", `${size}px`);
  heart.style.setProperty("--left", `${left}%`);
  heart.style.setProperty("--duration", `${duration}s`);

  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, duration * 1000);
}

function createBurstHearts(count = 10) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      spawnSingleFloatingHeart();
    }, i * 80);
  }
}

function startContinuousBalloons() {
  stopContinuousBalloons();
  // Burst of balloons
  for (let i = 0; i < 12; i++) {
    setTimeout(spawnSingleBalloon, i * 250);
  }
  balloonInterval = setInterval(spawnSingleBalloon, 600);
}

function stopContinuousBalloons() {
  if (balloonInterval) {
    clearInterval(balloonInterval);
    balloonInterval = null;
  }
}

function spawnSingleBalloon() {
  const container = document.getElementById("floatingBalloonsContainer");
  if (!container) return;

  const balloon = document.createElement("div");
  balloon.className = "balloon-fly";

  const colors = [
    "linear-gradient(135deg, #ff4d79, #e0245e)",
    "linear-gradient(135deg, #9d4edd, #7b2cbf)",
    "linear-gradient(135deg, #fcd34d, #f59e0b)",
    "linear-gradient(135deg, #a78bfa, #c084fc)",
    "linear-gradient(135deg, #38bdf8, #0284c7)"
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.floor(Math.random() * 30) + 40;
  const x = Math.floor(Math.random() * 90) + 5;
  const duration = (Math.random() * 3 + 6).toFixed(1);

  balloon.style.setProperty("--color", color);
  balloon.style.setProperty("--size", `${size}px`);
  balloon.style.setProperty("--x", `${x}%`);
  balloon.style.setProperty("--duration", `${duration}s`);

  const string = document.createElement("div");
  string.className = "string";
  balloon.appendChild(string);

  container.appendChild(balloon);

  setTimeout(() => {
    balloon.remove();
  }, duration * 1000);
}

/* ==========================================================
   CANVAS STARRY PARTICLES BACKGROUND
   ========================================================== */

function initStarCanvas() {
  const canvas = document.getElementById("starCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const starCount = 130;
  const starColors = ["#ffffff", "#ffe4e6", "#fbcfe8", "#fde047", "#e9d5ff"];

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.008,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      star.alpha += star.speed;
      const currentAlpha = Math.abs(Math.sin(star.alpha));

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.min(1, currentAlpha * 0.95);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

function triggerTreePulse() {
  const treeSvg = document.querySelector(".heart-tree-svg");
  if (!treeSvg) return;
  treeSvg.style.transform = "scale(1.06)";
  setTimeout(() => {
    treeSvg.style.transform = "";
  }, 400);
}

/* ==========================================================
   SWEET WEB AUDIO ATMOSPHERE (BELL / CHIME / MUSIC)
   ========================================================== */

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playChime(freq = 523.25, duration = 0.3, type = "sine", gainLevel = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Graceful fallback if autoplay blocked
  }
}

function playCelebrationArpeggio() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playChime(freq, 0.4, "triangle", 0.12);
    }, idx * 120);
  });
}

let melodyInterval = null;
function toggleAtmosphereSound() {
  const btn = document.getElementById("musicToggle");
  const ctx = getAudioContext();
  if (!ctx) return;

  audioSynthActive = !audioSynthActive;

  if (audioSynthActive) {
    if (btn) btn.classList.add("playing");
    // Play gentle harp-like periodic notes
    const melody = [440, 523.25, 659.25, 587.33, 659.25, 783.99, 880];
    let noteIdx = 0;
    
    playChime(melody[0], 0.6, "sine", 0.09);

    melodyInterval = setInterval(() => {
      noteIdx = (noteIdx + 1) % melody.length;
      playChime(melody[noteIdx], 0.7, "sine", 0.06);
    }, 1200);
  } else {
    if (btn) btn.classList.remove("playing");
    if (melodyInterval) {
      clearInterval(melodyInterval);
      melodyInterval = null;
    }
  }
}
