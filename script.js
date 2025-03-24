document.addEventListener("DOMContentLoaded", () => {
  initSlides();
  initBlochSphere();

  // Inicializar a animação do qubit no segundo slide
  animateQubitArrow();

  // Inicializar bits e qubits se o slide atual for o slide 3
  if (currentSlide === 3) {
    initBitsQubits();
    initScaleComparison();
  }

  // Adicionar efeitos para a tabela comparativa
  const tableRows = document.querySelectorAll(".bit-qubit-table tbody tr");
  tableRows.forEach((row, index) => {
    row.style.opacity = "0";
    row.style.transform = "translateY(20px)";

    setTimeout(() => {
      row.style.transition = "all 0.5s ease";
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, index * 200 + 1000);
  });
});

// Inicializar a Esfera de Bloch 3D Wireframe
function initBlochSphere() {
  const superpositionParticles = document.querySelector(
    ".superposition-particles"
  );
  const quantumState = document.querySelector(".quantum-state");

  // Diminuir a velocidade da animação definindo uma duração maior
  const blochWireframe = document.querySelector(".bloch-wireframe");
  const qubitVector = document.querySelector(".qubit-vector");

  if (blochWireframe) {
    blochWireframe.style.animation = "rotateSphere 40s infinite linear"; // 2x mais lento (era 20s)
  }

  if (qubitVector) {
    qubitVector.style.animation = "qubitSuperposition 16s infinite ease-in-out"; // 2x mais lento (era 8s)
  }

  if (superpositionParticles) {
    // Criar partículas para efeitos visuais
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "bloch-particle";
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.opacity = Math.random() * 0.5 + 0.3;

      // Posicionar partículas aleatoriamente na esfera
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 125;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particle.style.left = `${125 + x}px`;
      particle.style.top = `${125 + y}px`;

      // Adicionar animação aleatória para cada partícula - mais lenta
      const duration = Math.random() * 16 + 14; // 2x mais lento (era 8 + 7)
      particle.style.animation = `particleFloat ${duration}s infinite ease-in-out`;
      particle.style.animationDelay = `${Math.random() * 5}s`;

      superpositionParticles.appendChild(particle);
    }
  }

  if (quantumState) {
    // Atualizar o estado quântico mostrado - mais lento
    const states = ["|0⟩", "|1⟩", "|+⟩", "|−⟩", "|ψ⟩"];
    let currentStateIndex = 0;

    setInterval(() => {
      quantumState.textContent = states[currentStateIndex];
      currentStateIndex = (currentStateIndex + 1) % states.length;
    }, 3200); // 2x mais lento (era 1600)
  }
}

// Adicionar CSS para as partículas da esfera de Bloch
const style = document.createElement("style");
style.textContent = `
  .bloch-particle {
    position: absolute;
    border-radius: 50%;
    background-color: var(--accent-color);
    box-shadow: 0 0 5px var(--accent-color);
    transform-style: preserve-3d;
    pointer-events: none;
  }
  
  @keyframes particleFloat {
    0%, 100% {
      transform: translateZ(0) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translateZ(20px) scale(1.5);
      opacity: 0.8;
    }
  }
`;
document.head.appendChild(style);

let currentSlide = 1;
const totalSlides = 10; // Atualizado para 10 slides devido ao novo slide de tabela

function initSlides() {
  // Atualizar barra de progresso
  updateProgressBar();

  // Adicionar eventos de teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "Space") {
      nextSlide();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
    }
  });

  // Inicializar interatividade para dispositivos touch
  initSwipeDetection();
}

function updateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = `${(currentSlide / totalSlides) * 100}%`;
}

function nextSlide() {
  if (currentSlide < totalSlides) {
    changeSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 1) {
    changeSlide(currentSlide - 1);
  }
}

function changeSlide(newSlide) {
  // Ocultar slide atual
  document.getElementById(`slide${currentSlide}`).classList.remove("active");

  // Mostrar novo slide
  currentSlide = newSlide;
  document.getElementById(`slide${currentSlide}`).classList.add("active");

  // Atualizar barra de progresso
  updateProgressBar();
}

function initSwipeDetection() {
  const container = document.querySelector(".presentation-container");
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  container.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;

    if (touchEndX < touchStartX - swipeThreshold) {
      // Deslize para a esquerda - próximo slide
      nextSlide();
    }

    if (touchEndX > touchStartX + swipeThreshold) {
      // Deslize para a direita - slide anterior
      prevSlide();
    }
  }
}

// Adicionar eventos para elementos específicos quando cada slide se torna ativo
document.querySelectorAll(".slide").forEach((slide) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.attributeName === "class" &&
        slide.classList.contains("active")
      ) {
        const slideId = slide.id;

        // Animações específicas para cada slide
        if (slideId === "slide2") {
          animateQubitArrow();
        } else if (slideId === "slide3") {
          initBitsQubits();
          initScaleComparison();

          // Animar a tabela
          const tableRows = document.querySelectorAll(
            ".bit-qubit-table tbody tr"
          );
          tableRows.forEach((row, index) => {
            row.style.opacity = "0";
            row.style.transform = "translateY(20px)";

            setTimeout(() => {
              row.style.transition = "all 0.5s ease";
              row.style.opacity = "1";
              row.style.transform = "translateY(0)";
            }, index * 200 + 1000);
          });
        } else if (slideId === "slide4") {
          // Reiniciar animações do gráfico
          const bars = document.querySelectorAll(".bar");
          bars.forEach((bar) => {
            bar.style.animation = "none";
            setTimeout(() => {
              if (bar.classList.contains("classic")) {
                bar.style.animation = "fillBar 1.5s forwards";
              } else if (bar.classList.contains("quantum")) {
                bar.style.animation = "fillBarQuantum 1.5s forwards";
              }
            }, 10);
          });
        }
      }
    });
  });

  observer.observe(slide, {
    attributes: true,
  });
});

// Adicionar funcionalidade para os bits e qubits
function initBitsQubits() {
  // Animação dos bits clássicos
  const bits = document.querySelectorAll(".bit");
  let bitInterval = setInterval(() => {
    bits.forEach((bit) => {
      // 50% de chance de mudar o estado
      if (Math.random() > 0.5) {
        if (bit.textContent === "0") {
          bit.textContent = "1";
          bit.classList.add("active");
        } else {
          bit.textContent = "0";
          bit.classList.remove("active");
        }
      }
    });
  }, 1000);

  // Animação do qubit na esfera de Bloch
  let qubitState = document.getElementById("qubitState");
  let angleX = 0;
  let angleY = 0;
  let angleZ = 0;
  let radius = 60; // Raio da esfera

  let qubitInterval = setInterval(() => {
    // Calcular nova posição na esfera
    angleX += (Math.random() - 0.5) * 0.5;
    angleY += (Math.random() - 0.5) * 0.5;
    angleZ += (Math.random() - 0.5) * 0.5;

    // Calcular posição 3D em coordenadas cartesianas
    let x = radius * Math.sin(angleX) * Math.cos(angleY);
    let y = radius * Math.sin(angleX) * Math.sin(angleY);
    let z = radius * Math.cos(angleX);

    // Ajustar para espaço 2D mantendo a ilusão 3D
    qubitState.style.left = 50 + x / 2 + "%";
    qubitState.style.top = 50 - z / 2 + "%";

    // Ajustar tamanho para dar percepção de profundidade
    let size = 12 * (0.8 + (0.4 * (z + radius)) / (2 * radius));
    qubitState.style.width = size + "px";
    qubitState.style.height = size + "px";
  }, 100);

  // Limpar intervalos quando mudar de slide
  document.querySelectorAll(".slide").forEach((slide) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          if (!slide.classList.contains("active") && slide.id === "slide3") {
            clearInterval(bitInterval);
            clearInterval(qubitInterval);
          } else if (
            slide.classList.contains("active") &&
            slide.id === "slide3"
          ) {
            initBitsQubits();
            initScaleComparison();
          }
        }
      });
    });

    observer.observe(slide, {
      attributes: true,
    });
  });
}

// Inicializar a comparação de escalabilidade melhorada
function initScaleComparison() {
  const classicalBars = document.querySelectorAll(".scale-bar.classical");
  const quantumBars = document.querySelectorAll(".scale-bar.quantum");

  setTimeout(() => {
    classicalBars.forEach((bar, index) => {
      if (bar.classList.contains("classical-tiny")) {
        bar.style.width = "80px"; // Aumentado
      } else {
        switch (index) {
          case 0:
            bar.style.width = "150px";
            break;
          case 1:
            bar.style.width = "180px";
            break;
          case 2:
            bar.style.width = "220px";
            break;
          default:
            bar.style.width = "150px";
        }
      }
    });

    quantumBars.forEach((bar, index) => {
      if (bar.classList.contains("quantum-massive")) {
        bar.style.width = "550px"; // Aumentado
      } else if (bar.classList.contains("quantum-huge")) {
        bar.style.width = "350px"; // Aumentado
      } else {
        switch (index) {
          case 0:
            bar.style.width = "150px";
            break;
          case 1:
            bar.style.width = "180px";
            break;
          default:
            bar.style.width = "150px";
        }
      }
    });
  }, 500);
}

// Melhorar a animação do qubit no segundo slide
function animateQubitArrow() {
  const qubitArrow = document.getElementById("qubitArrow");
  if (!qubitArrow) return;

  let currentAngle = 45;
  let targetAngle = 45;

  setInterval(() => {
    // Randomizar um novo ângulo alvo a cada 3 segundos
    targetAngle = Math.random() * 360;
  }, 3000);

  // Função para animar suavemente o movimento do vetor
  function updateArrow() {
    // Interpolar suavemente entre o ângulo atual e o alvo
    currentAngle += (targetAngle - currentAngle) * 0.05;

    // Converter ângulo para radianos
    const angleRad = (currentAngle * Math.PI) / 180;

    // Rotacionar o vetor
    qubitArrow.style.transform = `rotate(${currentAngle}deg)`;

    requestAnimationFrame(updateArrow);
  }

  updateArrow();
}

// Adicionar observador para blocos de aplicações diárias
document.querySelectorAll(".application-item").forEach((item, index) => {
  item.style.opacity = "0";
  item.style.transform = "translateY(20px)";

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, index * 200);
        observer.unobserve(item);
      }
    });
  });

  observer.observe(item);
});

// Adicionar animação para as aplicações do Majorana
document
  .querySelectorAll(".majorana-applications li")
  .forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateX(-20px)";

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateX(0)";
          }, index * 200 + 500);
          observer.unobserve(item);
        }
      });
    });

    observer.observe(item);
  });
