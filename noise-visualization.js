document.addEventListener("DOMContentLoaded", () => {
  // Inicializar a visualização de ruído quando o slide 6 estiver ativo
  setupNoiseVisualization();
});

function setupNoiseVisualization() {
  // Verificar se estamos no slide correto ou configurar observadores para quando o slide ficar ativo
  document.querySelectorAll(".slide").forEach((slide) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "class" &&
          slide.classList.contains("active") &&
          slide.id === "slide6"
        ) {
          initNoiseVisualization();
        }
      });
    });

    observer.observe(slide, { attributes: true });

    // Inicializar imediatamente se o slide 6 já estiver ativo
    if (slide.id === "slide6" && slide.classList.contains("active")) {
      initNoiseVisualization();
    }
  });
}

function initNoiseVisualization() {
  console.log("Inicializando visualização de ruído no slide 6");

  const noisySphere = document.querySelector("#slide6 .noise-sphere");
  const blochWireframe = noisySphere.querySelector(".bloch-wireframe");
  const noiseSlider = document.getElementById("noise-level");
  const noiseValueDisplay = document.getElementById("noise-value-display");
  const noiseValue = document.getElementById("noise-value");
  const noisyQubitPoint = document.getElementById("noisy-qubit-point");
  const idealQubitPoint = document.getElementById("ideal-qubit-point");
  const idealQubitLine = document.getElementById("ideal-qubit-line");
  const decoherenceBar = document.getElementById("decoherence-bar");
  const decoherenceValue = document.getElementById("decoherence-value");

  // Variáveis para controle da esfera
  let isDragging = false;
  let startRotateX = 0;
  let startRotateY = 0;
  let currentRotateX = 15; // Começar com leve inclinação
  let currentRotateY = 0;
  let isAutoRotating = false;
  let autoRotationInterval;

  // Configurações de ruído
  let noiseLevel = parseInt(noiseSlider.value);
  let idealTheta = 0; // Posição vertical do ponto ideal
  let idealPhi = 0; // Posição horizontal do ponto ideal
  let noiseAnimation;
  let decoherenceTimer;
  let decoherenceTime = 100; // Valor inicial do tempo de decoerência (%)

  // Configurar rotação inicial da esfera
  updateSphereRotation();

  // Iniciar rotação automática
  startAutoRotation();

  // Configurar interatividade da esfera
  setupSphereInteraction();

  // Iniciar simulação de ruído
  startNoiseSimulation();

  // Configurar o slider de ruído
  setupNoiseSlider();

  // Função para atualizar a rotação da esfera
  function updateSphereRotation() {
    if (blochWireframe) {
      blochWireframe.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
    }
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
        updateSphereRotation();
      }
    }, 16); // ~60fps
  }

  // Função para parar rotação automática
  function stopAutoRotation() {
    if (!isAutoRotating) return;

    clearInterval(autoRotationInterval);
    isAutoRotating = false;
  }

  // Configurar interatividade da esfera
  function setupSphereInteraction() {
    if (!noisySphere) return;

    noisySphere.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      stopAutoRotation();
      startRotateX = e.clientY;
      startRotateY = e.clientX;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      // Calcular o quanto o mouse moveu
      const deltaY = e.clientY - startRotateX;
      const deltaX = e.clientX - startRotateY;

      // Atualizar ângulos de rotação (com limites para X)
      const newRotateX = Math.max(
        -80,
        Math.min(80, currentRotateX - deltaY * 0.5)
      );
      const newRotateY = currentRotateY + deltaX * 0.5;

      // Aplicar a nova rotação
      currentRotateX = newRotateX;
      currentRotateY = newRotateY;
      updateSphereRotation();

      // Atualizar posição inicial para o próximo movimento
      startRotateX = e.clientY;
      startRotateY = e.clientX;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;

        // Reiniciar rotação automática após 3 segundos
        setTimeout(() => {
          startAutoRotation();
        }, 3000);
      }
    });

    // Adicionar manipulador para caso o mouse saia da janela
    document.addEventListener("mouseleave", () => {
      isDragging = false;
    });
  }

  // Iniciar simulação de ruído
  function startNoiseSimulation() {
    // Limpar animações anteriores
    if (noiseAnimation) cancelAnimationFrame(noiseAnimation);

    // Inicializar o medidor de decoerência
    updateDecoherence();

    // Iniciar o timer de decoerência
    startDecoherenceTimer();

    // Função de animação principal
    function animate() {
      // Calcular posição ideal (trajetória circular)
      idealTheta += 0.01;
      idealPhi += 0.005;

      const radius = 125; // Raio da esfera

      // Converter coordenadas esféricas para cartesianas para o ponto ideal
      const idealX = radius * Math.sin(idealTheta) * Math.cos(idealPhi);
      const idealY = radius * Math.sin(idealTheta) * Math.sin(idealPhi);
      const idealZ = radius * Math.cos(idealTheta);

      // Posicionar o ponto ideal
      updateQubitPosition(idealQubitPoint, idealX, idealY, idealZ);

      // Atualizar a linha do ponto ideal
      if (idealQubitLine) {
        idealQubitLine.style.width = `${Math.sqrt(
          idealX * idealX + idealY * idealY
        )}px`;
        idealQubitLine.style.height = "2px";
        idealQubitLine.style.left = "50%";
        idealQubitLine.style.top = "50%";
        const angle = Math.atan2(idealY, idealX) * (180 / Math.PI);
        idealQubitLine.style.transform = `rotate(${angle}deg)`;
      }

      // Calcular ruído (deslocamento aleatório baseado no nível de ruído)
      const noiseScale = (noiseLevel / 100) * 50; // Escala máxima de 50px para o ruído

      // Adicionar ruído aleatório à posição ideal
      const noiseX = idealX + (Math.random() - 0.5) * noiseScale;
      const noiseY = idealY + (Math.random() - 0.5) * noiseScale;
      const noiseZ = idealZ + (Math.random() - 0.5) * noiseScale;

      // Posicionar o ponto com ruído
      updateQubitPosition(noisyQubitPoint, noiseX, noiseY, noiseZ);

      // Calcular e exibir a diferença (erro)
      const error =
        Math.sqrt(
          Math.pow(noiseX - idealX, 2) +
            Math.pow(noiseY - idealY, 2) +
            Math.pow(noiseZ - idealZ, 2)
        ) / radius;

      const errorPercentage = Math.min(100, error * 100).toFixed(1);

      // Calcular probabilidades para |0⟩ e |1⟩
      const zeroProb = Math.cos(idealTheta / 2) ** 2;
      const oneProb = Math.sin(idealTheta / 2) ** 2;

      // Atualizar o indicador de valor do ruído - agora mostrando |0⟩ e |1⟩
      if (noiseValue) {
        noiseValue.innerHTML = `Erro: ${errorPercentage}%<br>|0⟩: ${zeroProb.toFixed(
          2
        )}<sup>2</sup><br>|1⟩: ${oneProb.toFixed(2)}<sup>2</sup>`;

        // Posicionar o indicador de valor próximo ao ponto com ruído
        const left = parseFloat(noisyQubitPoint.style.left || "0");
        const top = parseFloat(noisyQubitPoint.style.top || "0");

        noiseValue.style.left = `${left + 15}px`;
        noiseValue.style.top = `${top - 25}px`; // Ajustado para cima devido à linha adicional
      }

      // Continuar a animação
      noiseAnimation = requestAnimationFrame(animate);
    }

    // Iniciar a animação
    animate();
  }

  // Função para posicionar o ponto na esfera
  function updateQubitPosition(pointElement, x, y, z) {
    if (!pointElement) return;

    const centerX = 125; // Centro da esfera X
    const centerY = 125; // Centro da esfera Y

    // Ajustar coordenadas para o centro da esfera e inverter Z para visualização correta
    pointElement.style.left = `${centerX + x}px`;
    pointElement.style.top = `${centerY - z}px`;

    // Ajustar o tamanho do ponto com base na profundidade (Z)
    const radius = 125;
    const size = 8 * (0.7 + (z + radius) / (2 * radius));
    pointElement.style.width = `${size}px`;
    pointElement.style.height = `${size}px`;
    pointElement.style.marginLeft = `-${size / 2}px`;
    pointElement.style.marginTop = `-${size / 2}px`;

    // Ajustar opacidade com base na profundidade (Z)
    const opacity = 0.7 + ((z + radius) / (2 * radius)) * 0.3;
    pointElement.style.opacity = opacity;
  }

  // Configurar o slider de nível de ruído
  function setupNoiseSlider() {
    if (!noiseSlider || !noiseValueDisplay) return;

    noiseSlider.addEventListener("input", () => {
      noiseLevel = parseInt(noiseSlider.value);
      noiseValueDisplay.textContent = `${noiseLevel}%`;

      // Atualizar o tempo de decoerência baseado no nível de ruído
      decoherenceTime = Math.max(5, 100 - noiseLevel);
      updateDecoherence();
    });
  }

  // Iniciar timer de decoerência
  function startDecoherenceTimer() {
    // Limpar timer anterior
    if (decoherenceTimer) clearInterval(decoherenceTimer);

    // Timer para reduzir gradualmente o tempo de decoerência
    decoherenceTimer = setInterval(() => {
      // Reduzir a decoerência com base no nível de ruído
      const reductionRate = noiseLevel / 1000;
      decoherenceTime = Math.max(0, decoherenceTime - reductionRate);

      updateDecoherence();

      // Se a decoerência chegar a zero, reiniciar
      if (decoherenceTime <= 0) {
        decoherenceTime = Math.max(5, 100 - noiseLevel);
      }
    }, 50);
  }

  // Atualizar a visualização da decoerência
  function updateDecoherence() {
    if (!decoherenceBar || !decoherenceValue) return;

    const percentage = decoherenceTime.toFixed(1);
    decoherenceBar.style.width = `${percentage}%`;
    decoherenceValue.textContent = `${percentage}%`;

    // Mudar cor baseado no nível de decoerência
    if (decoherenceTime > 70) {
      decoherenceBar.style.backgroundColor = "#64ffda";
    } else if (decoherenceTime > 30) {
      decoherenceBar.style.backgroundColor = "#ffda64";
    } else {
      decoherenceBar.style.backgroundColor = "#ff6464";
    }
  }
}
