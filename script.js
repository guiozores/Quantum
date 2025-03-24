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
  const qubitPositionSlider = document.getElementById("qubit-position");
  const pauseAnimationBtn = document.getElementById("pause-animation");
  const playAnimationBtn = document.getElementById("play-animation");

  // Configurar a animação da esfera wireframe
  const blochWireframe = document.querySelector(".bloch-wireframe");
  const qubitVector = document.querySelector(".qubit-vector");

  // Inicializar variáveis para controle da interatividade da esfera
  let isDragging = false;
  let startRotateX = 0;
  let startRotateY = 0;
  let currentRotateX = 0; // Começar alinhado (sem inclinação)
  let currentRotateY = 0;
  let autoRotationTimeout;
  let autoRotationInterval;
  let isAutoRotating = false;

  // Inicializar com esfera parada e alinhada com o plano XY
  if (blochWireframe) {
    blochWireframe.style.animation = "none";
    blochWireframe.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;

    // Iniciar rotação automática após 10 segundos
    autoRotationTimeout = setTimeout(() => {
      startAutoRotation();
    }, 10000);
  }

  if (qubitVector) {
    qubitVector.style.animation = "none"; // Sem animação para qubit vector
  }

  // Função para iniciar rotação automática
  function startAutoRotation() {
    if (isAutoRotating) return;

    isAutoRotating = true;
    let rotationSpeed = 0.2;

    autoRotationInterval = setInterval(() => {
      if (!isDragging) {
        currentRotateY += rotationSpeed;
        if (currentRotateY >= 360) currentRotateY -= 360;
        blochWireframe.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
      }
    }, 16); // ~60fps
  }

  // Função para parar rotação automática
  function stopAutoRotation() {
    if (!isAutoRotating) return;

    clearInterval(autoRotationInterval);
    isAutoRotating = false;
  }

  // Adicionar eventos de mouse para controle da esfera
  if (blochWireframe && blochWireframe.parentElement) {
    const blochContainer = blochWireframe.parentElement;

    blochContainer.addEventListener("mousedown", (e) => {
      e.preventDefault();

      // Parar qualquer rotação automática
      stopAutoRotation();
      clearTimeout(autoRotationTimeout);

      isDragging = true;
      startRotateX = e.clientY;
      startRotateY = e.clientX;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      // Calcular o quanto o mouse moveu
      const deltaY = e.clientY - startRotateX;
      const deltaX = e.clientX - startRotateY;

      // Atualizar ângulos de rotação (com limites para evitar rotação excessiva no eixo X)
      const newRotateX = Math.max(
        -80,
        Math.min(80, currentRotateX - deltaY * 0.5)
      );
      const newRotateY = currentRotateY + deltaX * 0.5;

      // Aplicar a nova rotação
      blochWireframe.style.transform = `rotateX(${newRotateX}deg) rotateY(${newRotateY}deg)`;

      // Atualizar posição inicial para o próximo movimento
      startRotateX = e.clientY;
      startRotateY = e.clientX;

      // Salvar os novos valores
      currentRotateX = newRotateX;
      currentRotateY = newRotateY;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;

        // Iniciar nova rotação automática após 5 segundos de inatividade
        autoRotationTimeout = setTimeout(() => {
          startAutoRotation();
        }, 5000);
      }
    });

    // Evento adicional para lidar com caso de mouse sair da janela
    document.addEventListener("mouseleave", () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  }

  // Estado para controle da animação do ponto qubit
  let isAnimating = false; // Começar pausado
  let animationInterval;
  let manualPosition = 0.0; // Valor inicial no topo (|0⟩)
  let manualTheta = 0; // Ângulo theta na esfera de Bloch (vertical)
  let manualPhi = 0; // Ângulo phi na esfera de Bloch (horizontal)

  // Configurar o controle de pausa/reprodução
  if (pauseAnimationBtn && playAnimationBtn) {
    // Iniciar com o botão de play visível
    pauseAnimationBtn.style.display = "none";
    playAnimationBtn.style.display = "inline-flex";

    pauseAnimationBtn.addEventListener("click", () => {
      isAnimating = false;
      pauseAnimationBtn.style.display = "none";
      playAnimationBtn.style.display = "inline-flex";
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    });

    playAnimationBtn.addEventListener("click", () => {
      isAnimating = true;
      playAnimationBtn.style.display = "none";
      pauseAnimationBtn.style.display = "inline-flex";
      startQubitAnimation();
    });
  }

  // Configurar o slider para controle manual
  if (qubitPositionSlider) {
    // Iniciar com o slider na posição zero
    qubitPositionSlider.value = manualPosition * 100;

    qubitPositionSlider.addEventListener("input", () => {
      if (isAnimating) {
        // Pausar animação ao usar o slider
        pauseAnimationBtn.click();
      }

      // Converter valor do slider (0-100) para posição do qubit (0-1)
      manualPosition = qubitPositionSlider.value / 100;
      manualTheta = manualPosition * Math.PI; // 0 = |0⟩ (topo), π = |1⟩ (base)
      updateQubitPosition(manualTheta, manualPhi);
    });
  }

  // Remover partículas existentes e adicionar um único ponto qubit
  if (superpositionParticles) {
    superpositionParticles.innerHTML = ""; // Limpar partículas existentes

    // Criar um único ponto quântico que se moverá
    const qubitPoint = document.createElement("div");
    qubitPoint.className = "single-qubit-point";
    superpositionParticles.appendChild(qubitPoint);

    // Criar o indicador de valor
    const valueIndicator = document.createElement("div");
    valueIndicator.className = "qubit-value-indicator";
    superpositionParticles.appendChild(valueIndicator);

    // Função para atualizar a posição do qubit usando coordenadas esféricas
    function updateQubitPosition(theta, phi) {
      const radius = 125;

      // Converter coordenadas esféricas para cartesianas
      // theta: ângulo vertical (0 no topo para |0⟩, π na base para |1⟩)
      // phi: ângulo horizontal (rotação em torno do eixo z)
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      // Posicionar o ponto
      qubitPoint.style.left = `${125 + x}px`;
      qubitPoint.style.top = `${125 - z}px`; // Invertido para visualização correta

      // Calcular tamanho com base na profundidade Z
      const size = 10 * (0.7 + (z + radius) / (2 * radius));
      qubitPoint.style.width = `${size}px`;
      qubitPoint.style.height = `${size}px`;

      // Exibir o valor como a probabilidade de |0⟩ (baseado no ângulo theta)
      const zeroProb = Math.cos(theta / 2) ** 2;
      const oneProb = Math.sin(theta / 2) ** 2;
      valueIndicator.innerHTML = `|0⟩: ${zeroProb.toFixed(
        4
      )}<br>|1⟩: ${oneProb.toFixed(4)}`;

      // Posicionar o indicador próximo ao ponto
      valueIndicator.style.left = `${
        parseInt(qubitPoint.style.left) + size + 5
      }px`;
      valueIndicator.style.top = `${parseInt(qubitPoint.style.top) - 25}px`;
    }

    // Função para iniciar a animação do ponto qubit
    function startQubitAnimation() {
      let animationPhase = 0;
      let phiRotation = 0;

      // Limpar qualquer intervalo existente
      if (animationInterval) {
        clearInterval(animationInterval);
      }

      // Criar novo intervalo para animação do ponto
      animationInterval = setInterval(() => {
        if (!isAnimating) return;

        // Animar theta entre 0 e π para alternar entre |0⟩ e |1⟩
        animationPhase += 0.01;
        phiRotation += 0.02; // Rotação em torno do eixo z

        // Usar funções trigonométricas para movimento fluido
        const theta = ((1 - Math.cos(animationPhase)) / 2) * Math.PI; // Varia entre 0 e π
        const phi = phiRotation; // Aumenta continuamente para girar em torno do eixo z

        // Atualizar o slider para refletir a posição atual (baseada em theta)
        if (qubitPositionSlider) {
          qubitPositionSlider.value = (theta / Math.PI) * 100;
        }

        // Atualizar posição do qubit
        updateQubitPosition(theta, phi);
      }, 50);
    }

    // Posicionar o qubit inicialmente no topo (|0⟩)
    updateQubitPosition(manualTheta, manualPhi);

    // Iniciar animação se estiver ativada
    if (isAnimating) {
      startQubitAnimation();
    }

    // Permitir que o qubit seja movido pela esfera com o mouse
    qubitPoint.style.cursor = "pointer";
    let isDraggingQubit = false;

    qubitPoint.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Impedir que o evento chegue à esfera
      isDraggingQubit = true;

      // Pausar animação automática do qubit quando começar a arrastá-lo
      if (isAnimating) {
        pauseAnimationBtn.click();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDraggingQubit) return;

      // Calcular posição do mouse relativa à esfera
      const blochRect = blochWireframe.getBoundingClientRect();
      const centerX = blochRect.left + blochRect.width / 2;
      const centerY = blochRect.top + blochRect.height / 2;

      // Coordenadas do mouse relativas ao centro da esfera
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Converter para coordenadas esféricas (aproximação simplificada)
      const radius = 125;
      const distance = Math.sqrt(mouseX ** 2 + mouseY ** 2);

      // Limitar distância ao raio da esfera
      const limitedDistance = Math.min(distance, radius);
      const ratio = limitedDistance / distance || 0;

      // Coordenadas ajustadas
      const adjustedX = mouseX * ratio;
      const adjustedY = mouseY * ratio;

      // Calcular ângulos esféricos
      const phi = Math.atan2(adjustedY, adjustedX);
      // Ajustar theta baseado na distância do centro
      const theta = (limitedDistance / radius) * Math.PI;

      manualTheta = theta;
      manualPhi = phi;

      // Atualizar slider para refletir a posição vertical
      if (qubitPositionSlider) {
        qubitPositionSlider.value = (theta / Math.PI) * 100;
      }

      // Atualizar posição do qubit
      updateQubitPosition(theta, phi);
    });

    document.addEventListener("mouseup", () => {
      isDraggingQubit = false;
    });
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
  
  .single-qubit-point {
    position: absolute;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 0 10px var(--accent-color), 0 0 20px rgba(255, 255, 255, 0.5);
    transform-style: preserve-3d;
    width: 10px;
    height: 10px;
    margin-left: -5px;
    margin-top: -5px;
    z-index: 10;
  }
  
  .qubit-value-indicator {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    color: var(--accent-color);
    font-size: 12px;
    font-weight: bold;
    padding: 3px 6px;
    border-radius: 4px;
    z-index: 20;
    white-space: nowrap;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
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
  let qubitValueBox = null;

  // Adicionar um indicador de valor ao qubit
  if (qubitState && !document.querySelector(".qubit-value-box")) {
    qubitValueBox = document.createElement("div");
    qubitValueBox.className = "qubit-value-box";
    document.getElementById("qubitSphere").appendChild(qubitValueBox);
  }

  // Remover elementos antigos e adicionar meridianos corretamente centralizados
  const qubitSphere = document.getElementById("qubitSphere");
  if (qubitSphere) {
    // Remover meridianos existentes
    qubitSphere
      .querySelectorAll(".qubit-meridian, .qubit-equator")
      .forEach((el) => el.remove());

    // Adicionar meridianos corretamente posicionados
    const meridians = `
      <div class="qubit-meridian" style="transform: translateX(-50%)"></div>
      <div class="qubit-meridian" style="transform: translateX(-50%) rotateY(45deg)"></div>
      <div class="qubit-meridian" style="transform: translateX(-50%) rotateY(90deg)"></div>
      <div class="qubit-meridian" style="transform: translateX(-50%) rotateY(135deg)"></div>
      <div class="qubit-equator"></div>
    `;
    qubitSphere.insertAdjacentHTML("beforeend", meridians);
  }

  // Animação controlada para garantir que toque em 0 e 1
  let animationPhase = 0;
  let qubitInterval = setInterval(() => {
    animationPhase += 0.03;

    // Usar função senoidal para garantir que toque em 0 e 1
    const verticalPosition = (Math.sin(animationPhase) + 1) / 2; // Normaliza de -1,1 para 0,1

    // Calcular posição 3D
    const radius = 60;
    const horizontalAngle = animationPhase * 0.5; // Gira horizontalmente

    // Converter para ângulo vertical (0 = topo/|0⟩, PI = base/|1⟩)
    const verticalAngle = verticalPosition * Math.PI;

    // Calcular posição 3D
    const x = radius * Math.sin(verticalAngle) * Math.cos(horizontalAngle);
    const y = radius * Math.sin(verticalAngle) * Math.sin(horizontalAngle);
    const z = radius * Math.cos(verticalAngle);

    // Ajustar para espaço 2D mantendo a ilusão 3D
    qubitState.style.left = 50 + x / 2 + "%";
    qubitState.style.top = 50 - z / 2 + "%";

    // Ajustar tamanho para dar percepção de profundidade
    let size = 12 * (0.8 + (0.4 * (z + radius)) / (2 * radius));
    qubitState.style.width = size + "px";
    qubitState.style.height = size + "px";

    // Atualizar o valor do qubit para mostrar ambas as probabilidades
    if (qubitValueBox) {
      // Calcular probabilidades baseadas na posição vertical
      const zeroProb = Math.cos(verticalAngle / 2) ** 2;
      const oneProb = Math.sin(verticalAngle / 2) ** 2;
      qubitValueBox.innerHTML = `|0⟩: ${zeroProb.toFixed(
        4
      )}<br>|1⟩: ${oneProb.toFixed(4)}`;
      qubitValueBox.style.left = qubitState.style.left;
      qubitValueBox.style.top = `calc(${qubitState.style.top} - 30px)`;
    }
  }, 50);

  // Inicializar a calculadora de estados
  initStateCalculator();

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

// Nova função para inicializar a calculadora de comparação de estados
function initStateCalculator() {
  const bitInput = document.getElementById("bit-count");
  const calculateBtn = document.getElementById("calculate-states");
  const bitResult = document.getElementById("bit-states");
  const qubitResult = document.getElementById("qubit-states");
  const timeClassical = document.getElementById("time-classical");
  const timeQuantum = document.getElementById("time-quantum");
  const gainResult = document.getElementById("gain-result");

  // Verificar se os elementos existem
  if (!bitInput) {
    console.error("Elemento bit-count não encontrado");
    return;
  }

  if (!calculateBtn) {
    console.error("Elemento calculate-states não encontrado");
    return;
  }

  // Verificar se os elementos de resultado existem
  if (
    !bitResult ||
    !qubitResult ||
    !timeClassical ||
    !timeQuantum ||
    !gainResult
  ) {
    console.error("Elementos de resultado não encontrados");
    return;
  }

  // Função para calcular e exibir os resultados
  function calculateStates() {
    console.log("Calculando estados...");

    const bits = parseInt(bitInput.value) || 0;

    // Validar entrada
    if (bits < 0 || bits > 100) {
      alert("Por favor, insira valores entre 0 e 100");
      return;
    }

    // Calcular estados possíveis
    const states = Math.pow(2, bits);

    // Calcular tempos estimados (baseado na tabela fornecida)
    const classicalTime = getClassicalTime(bits);
    const quantumTime = getQuantumTime(bits);

    // Calcular ganho
    const gain = getGainDescription(bits);

    // Exibir resultados com formatação de números grandes
    bitResult.textContent = formatLargeNumber(states);
    qubitResult.textContent = formatLargeNumber(states);
    timeClassical.textContent = classicalTime;
    timeQuantum.textContent = quantumTime;
    gainResult.textContent = gain;

    // Adicionar classe de ganho para estilização
    gainResult.className = "result-value " + getGainClass(bits);

    // Animar o resultado
    document.querySelectorAll(".result-value").forEach((el) => {
      el.style.animation = "none";
      setTimeout(() => {
        el.style.animation = "highlight-result 1s ease-in-out";
      }, 10);
    });
  }

  // Função auxiliar para obter a classe CSS baseada no ganho
  function getGainClass(bits) {
    if (bits <= 5) return "gain-none";
    if (bits <= 10) return "gain-minimal";
    if (bits <= 15) return "gain-low";
    if (bits <= 20) return "gain-emerging";
    if (bits <= 25) return "gain-notable";
    if (bits <= 30) return "gain-high";
    if (bits <= 35) return "gain-veryhigh";
    if (bits <= 40) return "gain-enormous";
    if (bits <= 54) return "gain-gigantic";
    if (bits <= 70) return "gain-astronomical";
    return "gain-incalculable";
  }

  // Funções auxiliares para cálculos baseados na tabela fornecida
  function getClassicalTime(bits) {
    if (bits <= 20) return "~instantâneo";
    if (bits <= 25) return "~0,03 s";
    if (bits <= 30) return "~1 s";
    if (bits <= 35) return "~34 s";
    if (bits <= 40) return "~17 min";
    if (bits <= 45) return "~10 horas";
    if (bits <= 50) return "~11 dias";
    if (bits <= 55) return "~1 ano";
    if (bits <= 60) return "~32 anos";
    if (bits <= 70) return "~32.000 anos";
    return "maior que a idade do universo";
  }

  function getQuantumTime(bits) {
    if (bits <= 44) return "instantâneo";
    if (bits <= 54) return "segundos a minutos";
    if (bits <= 60) return "minutos";
    if (bits <= 70) return "minutos a horas";
    return "horas/dias";
  }

  function getGainDescription(bits) {
    if (bits <= 5) return "Nenhum";
    if (bits <= 10) return "Mínimo";
    if (bits <= 15) return "Baixo";
    if (bits <= 20) return "Começa a surgir";
    if (bits <= 25) return "Notável";
    if (bits <= 30) return "Alto";
    if (bits <= 35) return "Muito alto";
    if (bits <= 40) return "Enorme";
    if (bits <= 54) return "Gigantesco";
    if (bits <= 70) return "Astronômico";
    return "Incalculável";
  }

  // Formatar números grandes com notação científica ou prefixos
  function formatLargeNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1e6) return `${(num / 1e3).toFixed(1)} mil`;
    if (num < 1e9) return `${(num / 1e6).toFixed(1)} milhões`;
    if (num < 1e12) return `${(num / 1e9).toFixed(1)} bilhões`;
    if (num < 1e15) return `${(num / 1e12).toFixed(1)} trilhões`;
    if (num < 1e18) return `${(num / 1e15).toFixed(1)} quadrilhões`;
    if (num < 1e21) return `${(num / 1e18).toFixed(1)} quintilhões`;
    if (num < 1e24) return `${(num / 1e21).toFixed(1)} sextilhões`;
    return `${num.toExponential(2)}`;
  }

  // Adicionar evento ao botão de calcular
  calculateBtn.addEventListener("click", calculateStates);

  // Adicionar evento para calcular ao pressionar Enter no input
  bitInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      calculateStates();
    }
  });

  // Calcular inicialmente com os valores padrão
  console.log("Inicializando calculadora com valor padrão");
  setTimeout(calculateStates, 100);
}

// Função para atualizar o layout em telas menores
function updateLayoutForSmallScreens() {
  const isMobile = window.innerWidth <= 768;
  const controlsMinimal = document.querySelector(".qubit-controls-minimal");

  if (controlsMinimal) {
    if (isMobile) {
      controlsMinimal.style.bottom = "100px";
      controlsMinimal.style.flexDirection = "column";
      controlsMinimal.style.gap = "15px";
      controlsMinimal.style.padding = "12px";
    } else {
      controlsMinimal.style.bottom = "150px";
      controlsMinimal.style.flexDirection = "row";
      controlsMinimal.style.gap = "10px";
      controlsMinimal.style.padding = "5px 10px";
    }
  }
}

// Chamar ao carregar e ao redimensionar
window.addEventListener("load", updateLayoutForSmallScreens);
window.addEventListener("resize", updateLayoutForSmallScreens);

// Inicializar a comparação de escalabilidade melhorada
function initScaleComparison() {
  const allBars = document.querySelectorAll(".scale-bar");

  setTimeout(() => {
    allBars.forEach((bar) => {
      if (bar.classList.contains("scale-tiny")) {
        bar.style.width = "60px";
      } else if (bar.classList.contains("scale-small")) {
        bar.style.width = "100px";
      } else if (bar.classList.contains("scale-medium")) {
        bar.style.width = "150px";
      } else if (bar.classList.contains("scale-large")) {
        bar.style.width = "200px";
      } else if (bar.classList.contains("scale-xlarge")) {
        bar.style.width = "250px";
      } else if (bar.classList.contains("classical-tiny")) {
        bar.style.width = "30px"; // Ainda menor para criar contraste
      } else if (bar.classList.contains("classical-dot")) {
        bar.style.width = "20px"; // Ponto pequeno para os 100 bits
        bar.style.height = "20px";
      } else if (bar.classList.contains("quantum-huge")) {
        bar.style.width = "350px";
      } else if (bar.classList.contains("quantum-massive")) {
        bar.style.width = "480px";
      } else if (bar.classList.contains("quantum-extreme")) {
        bar.style.width = "550px";
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

// Adicionar estilos para a visualização melhorada da esfera no slide 3
const qubitExtraStyle = document.createElement("style");
qubitExtraStyle.textContent = `
  .qubit-sphere {
    overflow: visible;
  }
  
  .qubit-meridian {
    position: absolute;
    top: 0;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 5px rgba(100, 255, 218, 0.2);
  }
  
  .qubit-equator {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 5px rgba(100, 255, 218, 0.3);
  }
  
  .qubit-value-box {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    color: var(--accent-color);
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 3px;
    transform: translate(-50%, -100%);
    z-index: 100;
    white-space: nowrap;
    font-weight: bold;
  }
  
  .qubit-dot {
    box-shadow: 0 0 10px var(--accent-color), 0 0 15px white;
    background: radial-gradient(circle at 30% 30%, white, var(--accent-color));
  }
`;
document.head.appendChild(qubitExtraStyle);

// Adicionar estilo para os elementos da calculadora e resultados
const calculatorStyle = document.createElement("style");
calculatorStyle.textContent = `
  .state-calculator {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
    border: 1px solid rgba(100, 255, 218, 0.2);
  }
  
  .calculator-inputs {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .input-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .input-group input {
    width: 60px;
    background-color: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--accent-color);
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    text-align: center;
    font-size: 16px;
  }
  
  .calculate-button {
    background-color: var(--accent-color);
    color: var(--primary-color);
    border: none;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
  }
  
  .calculate-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(100, 255, 218, 0.4);
  }
  
  .results-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    table-layout: fixed;
  }
  
  .results-table th, .results-table td {
    border: 1px solid rgba(100, 255, 218, 0.3);
    padding: 8px;
    text-align: center;
  }
  
  .results-table th {
    background-color: rgba(0, 0, 0, 0.4);
    color: var(--accent-color);
  }
  
  .result-value {
    font-weight: bold;
    color: var(--accent-color);
  }
  
  @keyframes highlight-result {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(100, 255, 218, 0.2); }
  }
`;
document.head.appendChild(calculatorStyle);
