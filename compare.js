document.addEventListener("DOMContentLoaded", () => {
    // Inicializar a visualização de ruído quando o slide 6 estiver ativo
    const noiseSlide = document.getElementById("slide6");
    if (!noiseSlide) return;
  
    // Elementos da visualização
    const idealQubitPoint = document.getElementById("ideal-qubit-point");
    const idealQubitLine = document.getElementById("ideal-qubit-line");
    const noisyQubitPoint = document.getElementById("noisy-qubit-point");
    const noiseValueDisplay = document.getElementById("noise-value");
    const noiseSlider = document.getElementById("noise-level");
    const noiseValueText = document.getElementById("noise-value-display");
    const decoherenceBar = document.getElementById("decoherence-bar");
    const decoherenceValue = document.getElementById("decoherence-value");
    const blochSphere = document.querySelector("#slide6 .bloch-wireframe");
  
    // Verificar se todos os elementos necessários estão presentes
    if (!idealQubitPoint || !idealQubitLine || !noisyQubitPoint || !noiseSlider) {
      console.error(
        "Elementos necessários para visualização de ruído não encontrados"
      );
      return;
    }
  
    // Configuração inicial
    let idealTheta = Math.PI / 4; // Ângulo inicial (45 graus)
    let idealPhi = 0;
    let noiseLevel = parseInt(noiseSlider.value) || 30;
    let animationFrame;
    let isRotating = true;
  
    // Variáveis para controle da rotação da esfera
    let sphereRotateX = 15; // Começar com leve inclinação
    let sphereRotateY = 0;
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
  
    // Atualizar texto de nível de ruído
    noiseValueText.textContent = `${noiseLevel}%`;
  
    // Dimensões da esfera
    const sphereRadius = 125; // Raio da esfera em pixels
    const centerX = sphereRadius;
    const centerY = sphereRadius;
  
    // Evento de mudança no slider de ruído
    noiseSlider.addEventListener("input", () => {
      noiseLevel = parseInt(noiseSlider.value);
      noiseValueText.textContent = `${noiseLevel}%`;
  
      // Atualizar barra de decoerência (inversamente proporcional ao ruído)
      const decoherencePercent = Math.max(0, 100 - noiseLevel);
      decoherenceBar.style.width = `${decoherencePercent}%`;
      decoherenceValue.textContent = `${decoherencePercent}%`;
    });
  
    // Configurar interação com a esfera
    setupSphereInteraction();
  
    // Função para converter coordenadas esféricas para cartesianas
    function sphericalToCartesian(theta, phi, radius) {
      return {
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
      };
    }
  
    // Função para posicionar o qubit ideal
    function positionIdealQubit() {
      // Incrementar o ângulo phi para criar rotação contínua
      idealPhi += 0.01;
  
      // Converter coordenadas esféricas para cartesianas
      const coords = sphericalToCartesian(idealTheta, idealPhi, sphereRadius);
  
      // Posicionar o ponto
      idealQubitPoint.style.left = `${centerX + coords.x}px`;
      idealQubitPoint.style.top = `${centerY - coords.z}px`; // Invertido para visualização correta
  
      // Calcular tamanho com base na profundidade Z
      const scale = 0.7 + (coords.z + sphereRadius) / (2 * sphereRadius);
      const size = 10 * scale;
      idealQubitPoint.style.width = `${size}px`;
      idealQubitPoint.style.height = `${size}px`;
  
      // Atualizar a linha ideal - A CHAVE DA CORREÇÃO ESTÁ AQUI
      // Posicionar a linha do centro da esfera até o ponto ideal
      idealQubitLine.style.width = `${Math.sqrt(
        coords.x * coords.x + coords.z * coords.z
      )}px`;
      idealQubitLine.style.left = `${centerX}px`;
      idealQubitLine.style.top = `${centerY}px`;
  
      // Calcular o ângulo de rotação para a linha (em graus)
      let angle = Math.atan2(-coords.z, coords.x) * (180 / Math.PI);
      idealQubitLine.style.transform = `rotate(${angle}deg)`;
  
      return coords; // Retorna as coordenadas para uso no qubit com ruído
    }
  
    // Função para posicionar o qubit com ruído
    function positionNoisyQubit(idealCoords) {
      // Aplicar ruído às coordenadas ideais
      const noiseAmplitude = (noiseLevel / 100) * sphereRadius * 0.5; // 50% do raio no máximo
  
      // Gerar desvios aleatórios para cada coordenada
      const noiseX = (Math.random() * 2 - 1) * noiseAmplitude;
      const noiseY = (Math.random() * 2 - 1) * noiseAmplitude;
      const noiseZ = (Math.random() * 2 - 1) * noiseAmplitude;
  
      // Adicionar ruído às coordenadas ideais
      const noisyCoords = {
        x: idealCoords.x + noiseX,
        y: idealCoords.y + noiseY,
        z: idealCoords.z + noiseZ,
      };
  
      // Posicionar o ponto com ruído
      noisyQubitPoint.style.left = `${centerX + noisyCoords.x}px`;
      noisyQubitPoint.style.top = `${centerY - noisyCoords.z}px`; // Invertido para visualização correta
  
      // Calcular tamanho com base na profundidade Z
      const scale = 0.7 + (noisyCoords.z + sphereRadius) / (2 * sphereRadius);
      const size = 10 * scale;
      noisyQubitPoint.style.width = `${size}px`;
      noisyQubitPoint.style.height = `${size}px`;
      noisyQubitPoint.style.marginLeft = `-${size / 2}px`;
      noisyQubitPoint.style.marginTop = `-${size / 2}px`;
  
      // Mostrar o valor do qubit com ruído
      updateQubitValueDisplay(noisyCoords, idealCoords);
    }
  
    // Função para atualizar o display de valor do qubit
    function updateQubitValueDisplay(noisyCoords, idealCoords) {
      // Calcular erro relativo
      const errorDistance = Math.sqrt(
        Math.pow(noisyCoords.x - idealCoords.x, 2) +
          Math.pow(noisyCoords.y - idealCoords.y, 2) +
          Math.pow(noisyCoords.z - idealCoords.z, 2)
      );
  
      const errorPercent = Math.min(
        100,
        Math.round((errorDistance / sphereRadius) * 100)
      );
  
      // Exibir valores
      if (noiseValueDisplay) {
        noiseValueDisplay.innerHTML = `Erro: ${errorPercent}%<br>Decoerência: ${Math.max(
          0,
          100 - noiseLevel
        )}%`;
        noiseValueDisplay.style.left = `${
          parseInt(noisyQubitPoint.style.left) + 15
        }px`;
        noiseValueDisplay.style.top = `${
          parseInt(noisyQubitPoint.style.top) - 30
        }px`;
      }
    }
  
    // Função para configurar a interação com a esfera
    function setupSphereInteraction() {
      const noisySphere = document.querySelector("#slide6 .noise-sphere");
      if (!noisySphere) return;
  
      // Adicionar eventos de mouse para rotação
      noisySphere.addEventListener("mousedown", (e) => {
        isDragging = true;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        noisySphere.style.cursor = "grabbing";
        e.preventDefault();
      });
  
      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
  
        // Calcular o quanto o mouse moveu
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;
  
        // Atualizar os ângulos de rotação
        // Limitar a rotação no eixo X para evitar que a esfera fique de cabeça para baixo
        sphereRotateX = Math.max(-80, Math.min(80, sphereRotateX - deltaY * 0.5));
        sphereRotateY += deltaX * 0.5;
  
        // Normalizar o ângulo Y para manter entre 0 e 360 graus
        if (sphereRotateY >= 360) sphereRotateY -= 360;
        if (sphereRotateY < 0) sphereRotateY += 360;
  
        // Aplicar a rotação à esfera
        updateSphereRotation();
  
        // Atualizar a posição inicial do mouse para o próximo movimento
        startMouseX = e.clientX;
        startMouseY = e.clientY;
      });
  
      document.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          noisySphere.style.cursor = "grab";
        }
      });
  
      noisySphere.addEventListener("mouseleave", () => {
        if (isDragging) {
          isDragging = false;
          noisySphere.style.cursor = "grab";
        }
      });
    }
  
    // Função para atualizar a rotação da esfera
    function updateSphereRotation() {
      if (blochSphere) {
        blochSphere.style.transform = `rotateX(${sphereRotateX}deg) rotateY(${sphereRotateY}deg)`;
      }
    }
  
    // Função para animação automática da rotação
    function autoRotate() {
      if (!isDragging && isRotating) {
        sphereRotateY += 0.2;
        if (sphereRotateY >= 360) sphereRotateY -= 360;
        updateSphereRotation();
      }
    }
  
    // Iniciar animação
    function animate() {
      // Posicionar o qubit ideal e obter suas coordenadas
      const idealCoords = positionIdealQubit();
  
      // Posicionar o qubit com ruído baseado nas coordenadas ideais
      positionNoisyQubit(idealCoords);
  
      // Rotacionar a esfera automaticamente
      autoRotate();
  
      // Continuar a animação
      animationFrame = requestAnimationFrame(animate);
    }
  
    // Iniciar animação quando o slide de ruído estiver visível
    function checkSlideVisibility() {
      if (noiseSlide.classList.contains("active")) {
        // Iniciar animação se ainda não estiver rodando
        if (!animationFrame) {
          animate();
        }
      } else {
        // Parar animação quando o slide não estiver visível
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    }
  
    // Observar mudanças na visibilidade do slide
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkSlideVisibility();
        }
      });
    });
  
    observer.observe(noiseSlide, { attributes: true });
  
    // Verificar visibilidade inicial
    checkSlideVisibility();
  
    // Aplicar rotação inicial
    updateSphereRotation();
  });
  