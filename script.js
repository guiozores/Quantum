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

// Mover as funções auxiliares para cálculos baseados na tabela fornecida para o escopo global
// (apenas se ainda não estiverem no escopo global)
function getClassicalTime(bits) {
  // Tempo em microssegundos: 2^N x 1μs
  const timeInMicroseconds = Math.pow(2, bits);
  
  // Converter para uma string legível
  return formatTimeFromMicroseconds(timeInMicroseconds);
}

function getQuantumTime(bits) {
  // Tempo em microssegundos: 2^(N/2) x 0,1μs
  const timeInMicroseconds = Math.pow(2, bits/2) * 0.1;
  
  // Converter para uma string legível
  return formatTimeFromMicroseconds(timeInMicroseconds);
}

// Nova função auxiliar para formatar o tempo baseado em microssegundos
function formatTimeFromMicroseconds(microseconds) {
  if (microseconds < 1000) {
    return `${microseconds.toFixed(2)} μs`;
  } else if (microseconds < 1000000) {
    return `${(microseconds / 1000).toFixed(2)} ms`;
  } else if (microseconds < 60000000) {
    // Menos de 1 minuto em microssegundos
    return `${(microseconds / 1000000).toFixed(2)} seg`;
  } else if (microseconds < 3600000000) {
    // Menos de 1 hora
    const minutes = Math.floor(microseconds / 60000000);
    const seconds = ((microseconds % 60000000) / 1000000).toFixed(0);
    return `${minutes} min e ${seconds} seg`;
  } else if (microseconds < 86400000000) {
    // Menos de 1 dia
    const hours = Math.floor(microseconds / 3600000000);
    const minutes = Math.floor((microseconds % 3600000000) / 60000000);
    return `${hours} hora${hours !== 1 ? 's' : ''}, ${minutes} min`;
  } else if (microseconds < 31536000000000) {
    // Menos de 1 ano
    const days = Math.floor(microseconds / 86400000000);
    return `${days} dia${days !== 1 ? 's' : ''}`;
  } else if (microseconds < 31536000000000 * 1000) {
    // Menos de 1000 anos
    const years = Math.floor(microseconds / 31536000000000);
    return `${years} ano${years !== 1 ? 's' : ''}`;
  } else if (microseconds < 31536000000000 * 1000000) {
    // Menos de 1 milhão de anos
    const years = Math.floor(microseconds / 31536000000000);
    return `${(years / 1000).toFixed(0)} mil anos`;
  } else if (microseconds < 31536000000000 * 1000000000) {
    const years = Math.floor(microseconds / 31536000000000);
    return `${(years / 1000000).toFixed(0)} milhões de anos`;
  } else if (microseconds < 31536000000000 * 1000000000000) {
    const years = Math.floor(microseconds / 31536000000000);
    return `${(years / 1000000000).toFixed(0)} bilhões de anos`;
  } else {
    return "maior que a idade do universo";
  }
}

// Adicionar a função formatLargeNumber no escopo global, antes de qualquer outra função
// Mova esse código para o início do arquivo, logo após as declarações iniciais
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

// Função para obter a descrição da equivalência
function getEquivalenceDescription(bits) {
  if (bits <= 2) return "Sem vantagem significativa";
  if (bits <= 5)
    return `${bits} qubits = 2<sup>${bits}</sup> bits processados simultaneamente`;
  if (bits <= 10)
    return `${bits} qubits processam ${formatLargeNumber(
      Math.pow(2, bits)
    )} estados simultaneamente`;
  if (bits <= 20)
    return `${bits} qubits ≈ ${formatLargeNumber(
      Math.pow(2, bits)
    )} bits (1 milhão de estados)`;
  if (bits <= 30)
    return `${bits} qubits ≈ ${formatLargeNumber(
      Math.pow(2, bits)
    )} bits (1 bilhão de estados)`;
  if (bits <= 40) return `${bits} qubits ≈ 1 trilhão de estados simultâneos`;
  if (bits <= 50)
    return `${bits} qubits ≈ 1 quadrilhão de estados (impossível em bits)`;
  if (bits <= 100)
    return `${bits} qubits ≈ 10<sup>30</sup> estados (mais que estrelas no universo)`;
  return `${bits} qubits = poder de processamento <strong>incompreensível</strong> com bits`;
}

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
  let isAnimating = true; // Alterado de false para true - começar com animação
  let animationInterval;
  let manualPosition = 0.0; // Valor inicial no topo (|0⟩)
  let manualTheta = 0; // Ângulo theta na esfera de Bloch (vertical)
  let manualPhi = 0; // Ângulo phi na esfera de Bloch (horizontal)

  // Configurar o controle de pausa/reprodução
  if (pauseAnimationBtn && playAnimationBtn) {
    // Iniciar com o botão de pausa visível (ativo)
    pauseAnimationBtn.style.display = "inline-flex";
    playAnimationBtn.style.display = "none";

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

    // Iniciar animação já que agora isAnimating começa como true
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
const totalSlides = 11; // Atualizado para 10 slides devido ao novo slide de tabela

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
  console.log(`Tentando mudar para o slide ${newSlide}`);

  // Tentar encontrar o slide atual e remover a classe active
  const currentSlideElement = document.getElementById(`slide${currentSlide}`);
  if (!currentSlideElement) {
    console.error(`Slide atual (${currentSlide}) não encontrado no DOM.`);
  } else {
    currentSlideElement.classList.remove("active");
  }

  // Atualizar slide atual
  currentSlide = newSlide;

  // Tentar encontrar o novo slide
  const nextSlideElement = document.getElementById(`slide${currentSlide}`);
  if (!nextSlideElement) {
    console.error(`Novo slide (${currentSlide}) não encontrado no DOM.`);
    // Tentar recuperar para o primeiro slide
    currentSlide = 1;
    const firstSlide = document.getElementById("slide1");
    if (firstSlide) firstSlide.classList.add("active");
  } else {
    nextSlideElement.classList.add("active");
  }

  // Atualizar a barra de progresso
  updateProgressBar();

  // Se for slide 4, reiniciar as animações das barras com velocidade reduzida
  if (newSlide === 4) {
    // Selecionamos as barras e removemos qualquer animação anterior
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => {
      bar.style.animation = "none";
      // Forçar reflow para reiniciar a animação
      void bar.offsetWidth;

      // Aplicar animações mais lentas
      setTimeout(() => {
        if (bar.classList.contains("classic")) {
          bar.style.animation = "fillBar 3s forwards ease-in-out"; // 3s em vez de 1.5s
        } else if (bar.classList.contains("quantum")) {
          bar.style.animation = "fillBarQuantum 3s forwards ease-in-out"; // 3s em vez de 1.5s
        }
      }, 10);
    });
  }
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
        } else if (slideId === "slide5") {
          initComparisonGraphs();
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

  // Animação do qubit na esfera de Bloch - com rotação e interatividade
  let qubitState = document.getElementById("qubitState");
  let qubitValueBox = null;
  let qubitSphere = document.getElementById("qubitSphere");

  // Inicializar variáveis para controle de interatividade
  let isDraggingSphere = false;
  let rotationPaused = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let rotateX = 15;
  let rotateY = -15;
  let rotationInterval;

  // Adicionar um indicador de valor ao qubit
  if (qubitState && !document.querySelector(".qubit-value-box")) {
    qubitValueBox = document.createElement("div");
    qubitValueBox.className = "qubit-value-box";
    qubitSphere.appendChild(qubitValueBox);
  }

  // Remover elementos antigos e adicionar meridianos corretamente centralizados
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

    // Iniciar a rotação automática
    startSphereRotation();

    // Adicionar eventos para interatividade
    qubitSphere.addEventListener("mousedown", (e) => {
      isDraggingSphere = true;
      rotationPaused = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      clearInterval(rotationInterval);
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDraggingSphere) return;

      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      rotateX += deltaY * 0.5;
      rotateY += deltaX * 0.5;

      // Limitar a rotação no eixo X
      rotateX = Math.min(80, Math.max(-80, rotateX));

      qubitSphere.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    document.addEventListener("mouseup", () => {
      if (isDraggingSphere) {
        isDraggingSphere = false;

        // Reiniciar rotação automática após 3 segundos se não estiver em pausa
        setTimeout(() => {
          if (!rotationPaused) {
            startSphereRotation();
          }
        }, 3000);
      }
    });

    // Função para iniciar a rotação da esfera
    function startSphereRotation() {
      clearInterval(rotationInterval);

      rotationInterval = setInterval(() => {
        rotateY += 0.2;
        if (rotateY >= 360) rotateY -= 360;
        qubitSphere.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }, 30);
    }

    // Botão para pausar/retomar a rotação (opcional)
    const pauseButton = document.createElement("button");
    pauseButton.className = "qubit-control-btn";
    pauseButton.innerHTML = "⏸";
    pauseButton.title = "Pausar/Retomar rotação";
    pauseButton.style.position = "absolute";
    pauseButton.style.top = "0";
    pauseButton.style.right = "0";
    pauseButton.style.zIndex = "10";
    pauseButton.style.background = "rgba(0,0,0,0.5)";
    pauseButton.style.border = "none";
    pauseButton.style.color = "white";
    pauseButton.style.padding = "3px 5px";
    pauseButton.style.cursor = "pointer";

    pauseButton.addEventListener("click", () => {
      rotationPaused = !rotationPaused;
      pauseButton.innerHTML = rotationPaused ? "▶" : "⏸";

      if (rotationPaused) {
        clearInterval(rotationInterval);
      } else {
        startSphereRotation();
      }
    });

    qubitSphere.appendChild(pauseButton);

    // Chamar a função para corrigir os eixos
    fixQubitAxes();
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
            clearInterval(rotationInterval);
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
  const equivalenceResult = document.getElementById("qubit-equivalence");

  // Verificar se os elementos existem
  if (!bitInput) {
    console.error("Elemento bit-count não encontrado");
    return;
  }

  if (!calculateBtn) {
    console.error("Elemento calculate-states não encontrado");
    return;
  }

  // Função para calcular e exibir os resultados - adicionar formatação de cores
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

    // Calcular tempos estimados
    const classicalTime = getClassicalTime(bits);
    const quantumTime = getQuantumTime(bits);

    // Calcular ganho e equivalência
    const gain = getGainDescription(bits);
    const equivalence = getEquivalenceDescription(bits);

    // Exibir resultados com formatação de números grandes
    bitResult.textContent = formatLargeNumber(states);
    qubitResult.textContent = formatLargeNumber(states);

    // Adicionar informação sobre o tipo de processamento (sem formatação especial para sequencial)
    const bitStatesInfo = document.getElementById("bit-states-info");
    const qubitStatesInfo = document.getElementById("qubit-states-info");

    if (bitStatesInfo) bitStatesInfo.innerHTML = "processamento sequencial";
    if (qubitStatesInfo) qubitStatesInfo.innerHTML = "processamento <span class='simultaneous-processing'>simultâneo</span>";

    timeClassical.textContent = classicalTime;
    timeQuantum.textContent = quantumTime;
    gainResult.textContent = gain;

    // Para elementos que aceitam HTML, usar innerHTML
    if (equivalenceResult) {
      equivalenceResult.innerHTML = equivalence;
    }

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
    if (bits <= 20) return "começa a surgir";
    if (bits <= 25) return "notável";
    if (bits <= 30) return "alto";
    if (bits <= 35) return "muito alto";
    if (bits <= 40) return "enorme";
    if (bits <= 54) return "gigantesco";
    if (bits <= 70) return "astronômico";
    return "incalculável";
  }

  // Funções auxiliares para cálculos baseados na tabela fornecida
  function getClassicalTime(bits) {
    // Tempo em microssegundos: 2^N x 1μs
    const timeInMicroseconds = Math.pow(2, bits);
    
    // Converter para uma string legível
    return formatTimeFromMicroseconds(timeInMicroseconds);
  }

  function getQuantumTime(bits) {
    // Tempo em microssegundos: 2^(N/2) x 0,1μs
    const timeInMicroseconds = Math.pow(2, bits/2) * 0.1;
    
    // Converter para uma string legível
    return formatTimeFromMicroseconds(timeInMicroseconds);
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

// Inicializar os gráficos comparativos no novo slide
function initComparisonGraphs() {
  const classicalGraph = document.getElementById("classicalGraph");
  const quantumGraph = document.getElementById("quantumGraph");

  if (!classicalGraph || !quantumGraph) {
    console.error("Gráficos não encontrados");
    return;
  }

  // Gerar pontos para o gráfico clássico (crescimento linear)
  const classicalPath = generateClassicalPath();
  classicalGraph.setAttribute("d", classicalPath.path);

  // Gerar pontos para o gráfico quântico (crescimento exponencial)
  const quantumPath = generateQuantumPath();
  quantumGraph.setAttribute("d", quantumPath.path);

  // Adicionar área de superposição no gráfico quântico
  const quantumArea = document.getElementById("quantumArea");
  if (quantumArea) {
    quantumArea.setAttribute("d", quantumPath.area);
  }

  // Adicionar indicadores interativos para os gráficos
  const classicalContainer = document.getElementById("classicalGraphContainer");
  const quantumContainer = document.getElementById("quantumGraphContainer");

  if (classicalContainer && quantumContainer) {
    console.log(
      "Containers dos gráficos encontrados, inicializando interatividade"
    );

    // Remover pontos e tooltips existentes se houver
    classicalContainer
      .querySelectorAll(".graph-point, .graph-tooltip")
      .forEach((el) => el.remove());
    quantumContainer
      .querySelectorAll(".graph-point, .graph-tooltip")
      .forEach((el) => el.remove());

    // Criar elementos para mostrar pontos nos gráficos
    const classicalPoint = document.createElement("div");
    classicalPoint.className = "graph-point classical-point";
    classicalContainer.appendChild(classicalPoint);

    const quantumPoint = document.createElement("div");
    quantumPoint.className = "graph-point quantum-point";
    quantumContainer.appendChild(quantumPoint);

    // Criar tooltips para mostrar valores
    const classicalTooltip = document.createElement("div");
    classicalTooltip.className = "graph-tooltip classical-tooltip";
    classicalContainer.appendChild(classicalTooltip);

    const quantumTooltip = document.createElement("div");
    quantumTooltip.className = "graph-tooltip quantum-tooltip";
    quantumContainer.appendChild(quantumTooltip);

    // Interatividade ao passar o mouse sobre os containers
    [classicalContainer, quantumContainer].forEach((container, index) => {
      const isClassical = index === 0;
      const point = isClassical ? classicalPoint : quantumPoint;
      const tooltip = isClassical ? classicalTooltip : quantumTooltip;
      const otherPoint = isClassical ? quantumPoint : classicalPoint;
      const otherTooltip = isClassical ? quantumTooltip : classicalTooltip;

      container.addEventListener("mousemove", (e) => {
        // Coordenadas do mouse relativas ao container
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Calcular a posição relativa (0-1)
        const relativeX = Math.max(0, Math.min(1, x / width));

        // Obter valores para este ponto
        const bits = Math.floor(1 + relativeX * 70); // 1-70 bits/qubits
        const classicalValue = getClassicalValue(relativeX);
        const quantumValue = getQuantumValue(relativeX);

        // Posicionar o ponto e o outro ponto correspondente
        updatePoint(
          point,
          relativeX,
          isClassical ? classicalValue : quantumValue,
          container
        );
        updatePoint(
          otherPoint,
          relativeX,
          isClassical ? quantumValue : classicalValue,
          isClassical ? quantumContainer : classicalContainer
        );

        // Atualizar tooltip
        updateTooltip(
          tooltip,
          bits,
          isClassical ? classicalValue : quantumValue,
          isClassical
        );
        updateTooltip(
          otherTooltip,
          bits,
          isClassical ? quantumValue : classicalValue,
          !isClassical
        );

        // Mostrar os pontos e tooltips - forçar display block e opacity 1
        point.style.display = "block";
        point.style.opacity = "1";
        tooltip.style.display = "block";
        tooltip.style.opacity = "1";
        otherPoint.style.display = "block";
        otherPoint.style.opacity = "1";
        otherTooltip.style.display = "block";
        otherTooltip.style.opacity = "1";
      });

      container.addEventListener("mouseleave", () => {
        point.style.opacity = "0";
        tooltip.style.opacity = "0";
        otherPoint.style.opacity = "0";
        otherTooltip.style.opacity = "0";

        // Ocultar completamente após a transição
        setTimeout(() => {
          point.style.display = "none";
          tooltip.style.display = "none";
          otherPoint.style.display = "none";
          otherTooltip.style.display = "none";
        }, 200);
      });
    });
  } else {
    console.error("Containers dos gráficos não encontrados");
  }
}

function generateClassicalPath() {
  const width = 100;
  const height = 220;
  const points = 20; // Aumentar o número de pontos para linha mais suave

  let path = `M 0,${height}`;

  // Crescimento linear
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const y = height - (i / points) * height * 0.8; // 80% da altura total
    path += ` L ${x},${y}`;
  }

  return { path };
}

// Modificar a função generateQuantumPath para ter crescimento mais rápido e evidente
function generateQuantumPath() {
  const width = 100;
  const height = 220;
  const points = 30; // Mais pontos para curva mais suave

  let path = `M 0,${height}`;
  let area = `M 0,${height}`;

  // Crescimento exponencial mais acentuado desde o início
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;

    // Usar uma função exponencial mais agressiva que cresce desde o início
    // A base 2.5 faz crescer mais rapidamente que a original
    const factor = Math.pow(2.5, (i / points) * 6) - 1;
    const maxFactor = Math.pow(2.5, 6) - 1;

    const normalizedFactor = Math.min(factor / maxFactor, 1); // Garantir que não ultrapasse 1
    const y = height - normalizedFactor * height;

    path += ` L ${x},${y}`;
    area += ` L ${x},${y}`;
  }

  // Completar a área
  area += ` L ${width},${height} L 0,${height}`;

  return { path, area };
}

function getClassicalValue(relativeX) {
  // Crescimento linear: 0 a 0.8 (80% da altura)
  return relativeX * 0.8;
}

// Modificar a função getQuantumValue para usar a mesma fórmula atualizada
function getQuantumValue(relativeX) {
  // Usar a mesma função exponencial da geração do gráfico
  const factor = Math.pow(2.5, relativeX * 6) - 1;
  const maxFactor = Math.pow(2.5, 6) - 1;
  return Math.min(1, factor / maxFactor);
}

function updatePoint(point, relativeX, relativeY, container) {
  if (!point || !container) return;

  const rect = container.getBoundingClientRect();
  const x = relativeX * rect.width;
  const y = (1 - relativeY) * rect.height;

  point.style.left = `${x}px`;
  point.style.top = `${y}px`;
}

// Modificar a função updateTooltip para garantir que não ocorra erro quando point for null
function updateTooltip(tooltip, bits, value, isClassical) {
  if (!tooltip) return;

  // Calcular estados possíveis
  const statesCount = Math.pow(2, bits);
  const formattedStates = formatLargeNumber(statesCount);

  // Determinar o tempo estimado para processamento
  const time = isClassical ? getClassicalTime(bits) : getQuantumTime(bits);

  // Mudar o texto conforme seja clássico ou quântico
  let tooltipText;
  if (isClassical) {
    tooltipText = `<strong>${bits} bits:</strong><br>${formattedStates} estados<br>${time}`;
  } else {
    tooltipText = `<strong>${bits} qubits:</strong><br>${formattedStates} estados<br>${time}`;
  }

  tooltip.innerHTML = tooltipText;

  // Posicionar tooltip próximo ao ponto - CORREÇÃO PARA EVITAR ERRO
  const point = tooltip.parentElement?.querySelector(".graph-point");
  if (!point) return;

  // Usar valores padrão se não houver left/top definidos
  const left = parseFloat(point.style.left || "0");
  const top = parseFloat(point.style.top || "0");

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top - 30}px`;
}

// Melhorar o posicionamento dos meridianos e eixos do qubit
function fixQubitAxes() {
  const qubitSphere = document.getElementById("qubitSphere");
  if (!qubitSphere) return;

  // Remover eixos antigos se existirem
  qubitSphere.querySelectorAll(".qubit-axis").forEach((axis) => axis.remove());

  // Adicionar eixos corretamente posicionados
  const axes = `
      <div class="qubit-axis x-axis"></div>
      <div class="qubit-axis y-axis"></div>
      <div class="qubit-axis z-axis"></div>
    `;

  qubitSphere.insertAdjacentHTML("beforeend", axes);

  // Posicionar os eixos corretamente
  const width = qubitSphere.offsetWidth;
  const height = qubitSphere.offsetHeight;

  // Obter os eixos
  const xAxis = qubitSphere.querySelector(".x-axis");
  const yAxis = qubitSphere.querySelector(".y-axis");
  const zAxis = qubitSphere.querySelector(".z-axis");

  // Ajustar os eixos
  if (xAxis && yAxis && zAxis) {
    // Eixo X - horizontal
    xAxis.style.width = `${width}px`;
    xAxis.style.height = "2px";
    xAxis.style.top = `${height / 2}px`;
    xAxis.style.left = "0";
    xAxis.style.transform = "none";
    xAxis.style.backgroundColor = "rgba(255, 100, 100, 0.7)"; // Eixo X em vermelho
    xAxis.insertAdjacentHTML("beforeend", '<span class="axis-label">X</span>');

    // Eixo Y - vertical (conectando 0 e 1)
    yAxis.style.width = "2px";
    yAxis.style.height = `${height}px`;
    yAxis.style.top = "0";
    yAxis.style.left = `${width / 2}px`;
    yAxis.style.transform = "none";
    yAxis.style.backgroundColor = "rgba(100, 255, 100, 0.7)"; // Eixo Y em verde
    yAxis.insertAdjacentHTML("beforeend", '<span class="axis-label">Y</span>');

    // Eixo Z - saindo da tela a partir do centro (não da base)
    zAxis.style.width = "2px";
    zAxis.style.height = `${width}px`;
    zAxis.style.top = `${height / 2 - width / 2}px`; // Centralizado na esfera
    zAxis.style.left = `${width / 2}px`;
    zAxis.style.transform = "rotateX(90deg)";
    zAxis.style.backgroundColor = "rgba(100, 100, 255, 0.7)"; // Eixo Z em azul
    zAxis.insertAdjacentHTML("beforeend", '<span class="axis-label">Z</span>');
}

// Função para verificar todos os slides disponíveis
function checkAllSlides() {
  console.log("Verificando slides disponíveis:");
  const slides = document.querySelectorAll(".slide");
  console.log(`Total de slides encontrados: ${slides.length}`);
  
  slides.forEach(slide => {
    console.log(`ID: ${slide.id}, Visível: ${slide.classList.contains("active")}`);
  });
  
  // Verificar especificamente o slide de referências
  const lastSlide = document.getElementById(`slide${totalSlides}`);
  if (lastSlide) {
    console.log(`O último slide (slide${totalSlides}) existe no DOM.`);
  } else {
    console.error(`O último slide (slide${totalSlides}) NÃO existe no DOM!`);
    console.log(`Verificando outros possíveis slides numerados...`);
    // Verificar slides com números próximos
    for (let i = totalSlides - 2; i <= totalSlides + 2; i++) {
      const testSlide = document.getElementById(`slide${i}`);
      if (testSlide) {
        console.log(`Slide${i} encontrado.`);
      }
    }
  }
}

// Verificar slides quando a página carregar
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

  // Adicionar verificação de slides
  checkAllSlides();
  
  // Adicionar classes de estilo para o processamento no slide 3
  const bitStatesInfo = document.getElementById("bit-states-info");
  const qubitStatesInfo = document.getElementById("qubit-states-info");
  
  if (bitStatesInfo) {
    bitStatesInfo.innerHTML = "processamento <span class='sequential-processing'>sequencial</span>";
  }
  
  if (qubitStatesInfo) {
    qubitStatesInfo.innerHTML = "processamento <span class='simultaneous-processing'>simultâneo</span>";
  }
});

// Melhorar a função changeSlide para ser mais robusta
function changeSlide(newSlide) {
  console.log(`Tentando mudar para o slide ${newSlide}`);

  // Tentar encontrar o slide atual e remover a classe active
  const currentSlideElement = document.getElementById(`slide${currentSlide}`);
  if (!currentSlideElement) {
    console.error(`Slide atual (${currentSlide}) não encontrado no DOM.`);
  } else {
    currentSlideElement.classList.remove("active");
  }

  // Atualizar slide atual
  currentSlide = newSlide;

  // Tentar encontrar o novo slide
  const nextSlideElement = document.getElementById(`slide${currentSlide}`);
  if (!nextSlideElement) {
    console.error(`Novo slide (${currentSlide}) não encontrado no DOM.`);
    // Tentar recuperar para o primeiro slide
    currentSlide = 1;
    const firstSlide = document.getElementById("slide1");
    if (firstSlide) firstSlide.classList.add("active");
  } else {
    nextSlideElement.classList.add("active");
  }

  // Atualizar a barra de progresso
  updateProgressBar();

  // Se for slide 4, reiniciar as animações das barras com velocidade reduzida
  if (newSlide === 4) {
    // Selecionamos as barras e removemos qualquer animação anterior
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => {
      bar.style.animation = "none";
      // Forçar reflow para reiniciar a animação
      void bar.offsetWidth;

      // Aplicar animações mais lentas
      setTimeout(() => {
        if (bar.classList.contains("classic")) {
          bar.style.animation = "fillBar 3s forwards ease-in-out"; // 3s em vez de 1.5s
        } else if (bar.classList.contains("quantum")) {
          bar.style.animation = "fillBarQuantum 3s forwards ease-in-out"; // 3s em vez de 1.5s
        }
      }, 10);
    });
  }

  console.log(`Navegou para o slide ${currentSlide}`);
}

// Adicionar CSS específico para destacar processamento sequencial e paralelo
const processingStyles = document.createElement("style");
processingStyles.textContent = `
  .sequential-processing {
    color: #ff7675;
    font-weight: bold;
  }
  
  .simultaneous-processing {
    color: var(--accent-color);
    font-weight: bold;
  }
`;
document.head.appendChild(processingStyles);

// Função para inicializar a nova visualização de tempo de processamento no slide 4
function initTimeVisualization() {
  const complexitySlider = document.getElementById('complexity-slider');
  const bitsValue = document.getElementById('bits-value');
  const classicalTime = document.getElementById('classical-time');
  const quantumTime = document.getElementById('quantum-time');
  const scaleFactor = document.getElementById('scale-factor');
  
  // Anéis para visualização do tempo de processamento
  const classicalRings = document.querySelectorAll('.classical-rings .ring');
  const quantumRings = document.querySelectorAll('.quantum-rings .ring');
  
  if (!complexitySlider || !classicalTime || !quantumTime) {
    console.error('Elementos da visualização de tempo não encontrados');
    return;
  }

  // Função para atualizar a visualização baseada na complexidade
  function updateVisualization() {
    const bits = parseInt(complexitySlider.value);
    bitsValue.textContent = bits;
    
    // Calcular tempos usando as fórmulas padronizadas
    // Clássico: 2^N × 1μs
    const classicalTimeInMicroseconds = Math.pow(2, bits);
    // Quântico: 2^(N/2) × 0,1μs
    const quantumTimeInMicroseconds = Math.pow(2, bits/2) * 0.1;
    
    // Calcular o fator de aceleração
    const speedupFactor = classicalTimeInMicroseconds / Math.max(0.1, quantumTimeInMicroseconds);
    
    // Adicionar classe de atualização para animar a mudança
    classicalTime.classList.add('updating');
    quantumTime.classList.add('updating');
    scaleFactor.classList.add('updating');
    
    // Atualizar os valores exibidos usando a função padronizada de formatação
    classicalTime.textContent = formatTimeFromMicroseconds(classicalTimeInMicroseconds);
    quantumTime.textContent = formatTimeFromMicroseconds(quantumTimeInMicroseconds);
    
    // Formatar o fator de aceleração
    let speedupText;
    if (speedupFactor < 1000) speedupText = `${speedupFactor.toFixed(0)}`;
    else if (speedupFactor < 1000000) speedupText = `${(speedupFactor / 1000).toFixed(1)} mil`;
    else if (speedupFactor < 1000000000) speedupText = `${(speedupFactor / 1000000).toFixed(1)} milhões`;
    else if (speedupFactor < 1000000000000) speedupText = `${(speedupFactor / 1000000000).toFixed(1)} bilhões`;
    else if (speedupFactor < 1000000000000000) speedupText = `${(speedupFactor / 1000000000000).toFixed(1)} trilhões`;
    else speedupText = "inimaginável";
    
    scaleFactor.textContent = `x${speedupText}`;
    
    // Remover classe de atualização após a animação
    setTimeout(() => {
      classicalTime.classList.remove('updating');
      quantumTime.classList.remove('updating');
      scaleFactor.classList.remove('updating');
    }, 500);
    
    // Atualizar os anéis visíveis baseados na complexidade
    updateRings(classicalRings, bits, 10);
    updateRings(quantumRings, bits, 20);
  }
  
  // Função para atualizar os anéis de tempo
  function updateRings(rings, bits, threshold) {
    const isClassical = rings[0].closest('.classical-rings') !== null;
    
    // Lógica diferente para cada tipo de visualização
    if (isClassical) {
      // Para computação clássica, os anéis crescem rapidamente com a complexidade
      rings.forEach((ring, index) => {
        // Determinar se o anel deve estar ativo baseado na complexidade
        const shouldBeActive = bits >= threshold + (index * 7);
        
        // Escalonar o anel baseado na complexidade (efeito visual)
        const scale = shouldBeActive ? 1 + ((bits - threshold) / 50) * (index / rings.length) : 1;
        
        // Aplicar as alterações
        ring.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ring.style.opacity = shouldBeActive ? 1 : 0;
        
        // Adicionar/remover classe de animação
        if (shouldBeActive) ring.classList.add('active');
        else ring.classList.remove('active');
      });
    } else {
      // Para computação quântica, os anéis crescem muito mais lentamente
      rings.forEach((ring, index) => {
        // Determinar se o anel deve estar ativo baseado na complexidade
        const shouldBeActive = bits >= threshold + (index * 20);
        
        // Escalonar o anel baseado na complexidade (efeito visual)
        const scale = shouldBeActive ? 1 + ((bits - threshold) / 100) * (index / rings.length) : 1;
        
        // Aplicar as alterações
        ring.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ring.style.opacity = shouldBeActive ? 1 : 0;
        
        // Adicionar/remover classe de animação
        if (shouldBeActive) ring.classList.add('active');
        else ring.classList.remove('active');
      });
    }
  }

  // Adicionar evento ao slider
  complexitySlider.addEventListener('input', updateVisualization);
  
  // Inicializar visualização
  updateVisualization();
  
  // Adicionar animação inicial para chamar a atenção
  setTimeout(() => {
    // Simular movimento do slider para demonstração
    const animate = (value, duration) => {
      const start = parseInt(complexitySlider.value);
      const diff = value - start;
      const startTime = performance.now();
      
      function step(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          const progress = elapsedTime / duration;
                   const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease in-out
          complexitySlider.value = start + diff * easeProgress;
          updateVisualization();
          requestAnimationFrame(step);
        } else {
          complexitySlider.value = value;
          updateVisualization();
        }
      }
      
      requestAnimationFrame(step);
    };
    
    // Animação sequencial para demonstrar o efeito
    animate(20, 1000); // Começar pequeno
    setTimeout(() => animate(45, 2000), 1500); // Crescer bastante
    setTimeout(() => animate(70, 1500), 4000); // Crescer mais
    setTimeout(() => animate(100, 2000), 6000); // Mostrar caso extremo
    setTimeout(() => animate(30, 2000), 9000); // Voltar ao valor inicial
  }, 1000);
}

// Adicionar inicialização da visualização de tempo quando o slide 4 é ativado
document.querySelectorAll(".slide").forEach((slide) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class" && slide.classList.contains("active")) {
        if (slide.id === "slide4") {
          console.log("Slide 4 ativado, inicializando visualização de tempo");
          initTimeVisualization();
        }
      }
    });
  });

  observer.observe(slide, { attributes: true });
}); }