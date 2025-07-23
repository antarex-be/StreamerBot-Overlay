;(function() {
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-bigemote-css', moduleUrl + '/css/big-emote.css');

	function initModule() {
		const container = document.getElementById('mainContainer') || document.body;
		if (!document.getElementById('bigEmoteContainer')) {
			const bigEmoteContainer = document.createElement('div');
			bigEmoteContainer.id = 'bigEmoteContainer';
			container.appendChild(bigEmoteContainer);
		}
  }
  initModule();

  if (window.SBdispatcher) {
    SBdispatcher.on('stream-alert:gigantify_an_emote', data => {
      spawnAnimatedImage(data.param1);
    });
  }

  function spawnAnimatedImage(url) {
    const img = document.createElement("img");
    img.src = url;
    img.classList.add("bigEmote", "hidden-scale");

    img.onload = () => {
      const container = document.getElementById("bigEmoteContainer");
      container.appendChild(img);

      img.classList.remove("hidden-scale");

      // Apparition de l'emote avec un zoom
      img.classList.add("appear");

      // Lancer le déplacement de l'emote après animation initiale
      setTimeout(() => {
        img.classList.remove("appear");

        // Démarrer le rebond à partir de la position actuelle
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;

        startBouncing(img, x, y, true); // flag to keep transform translate
      }, 3000);
    };
  }  

  function startBouncing(img, startX, startY) {
    const imgSize = 112;
    const halfSize = imgSize / 2;
    const margin = 50;

    const minX = margin + halfSize;
    const maxX = window.innerWidth - margin - halfSize;
    const minY = margin + halfSize;
    const maxY = window.innerHeight - margin - halfSize;

    let x = startX;
    let y = startY;

    const pageDiagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
    const totalDistance = 3 * pageDiagonal;
    const duration = 30000; // 30s
    const speed = totalDistance / duration;

    const angle = getValidAngle();
    let dx = Math.cos(angle) * speed;
    let dy = Math.sin(angle) * speed;

    let startTime = null;
    let fadeOutStarted = false;

    function getValidAngle() {
      while (true) {
        const angle = Math.random() * 2 * Math.PI;
        const deg = angle * (180 / Math.PI);
        const prohibited = [0, 90, 180, 270];
        const tooClose = prohibited.some(a => {
          const delta = Math.abs(deg - a) % 360;
          return delta < 15 || delta > 345;
        });
        if (!tooClose) return angle;
      }
    }

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const dt = timestamp - (animate.lastTime || timestamp);
      animate.lastTime = timestamp;

      x += dx * dt;
      y += dy * dt;

      if (x <= minX || x >= maxX) {
        dx = -dx;
        x = Math.max(minX, Math.min(x, maxX));
      }
      if (y <= minY || y >= maxY) {
        dy = -dy;
        y = Math.max(minY, Math.min(y, maxY));
      }

      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.transform = "translate(-50%, -50%)";

      // Déclencher le fade-out à 29s
      if (!fadeOutStarted && elapsed >= duration - 1000) {
        fadeOutStarted = true;
        img.classList.add("fade-out");
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        img.remove();
      }
    }

    requestAnimationFrame(animate);
  }

})();

