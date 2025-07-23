;(function() {
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-popup-css', moduleUrl + '/css/popup.css');

	function initModule() {
		const container = document.getElementById('mainContainer') || document.body;
		if (!document.getElementById('popupContainer')) {
			const popupContainer = document.createElement('div');
			popupContainer.id = 'popupContainer';
			container.appendChild(popupContainer);
		}    
  }
  initModule();  

  if (window.SBdispatcher) {
    SBdispatcher.on('stream-popup', data => {
      showPopup(
        data.param1,
        data.param2,
        parseFloat(data.param3) || 3,
        data.param4 != null ? parseFloat(data.param4) : -1,
        data.param5 != null ? parseFloat(data.param5) : -1
      );
    });
  }

  function randomPercent(min = 0, max = 100) {
    const minClamped = Math.ceil(min);
    const maxClamped = Math.floor(max);
    return Math.floor(Math.random() * (maxClamped - minClamped + 1)) + minClamped;
  }

  function isOverlapping(r1, r2) {
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  }

  // Tableau global des popups actifs pour éviter le chevauchement
  window._activePopups = window._activePopups || [];

  /**
   * Affiche un popup dans #mainContainer (ou body si absent).
   * @param {string} title        Titre du popup
   * @param {string} message      Contenu HTML du message
   * @param {number} delaySeconds Durée d'affichage en secondes
   * @param {number|null} posX    Position horizontale en %, -1 ou null = aléatoire
   * @param {number|null} posY    Position verticale en %, -1 ou null = aléatoire
   */
  function showPopup(title, message, delaySeconds, posX = -1, posY = -1) {
    const container = document.getElementById('popupContainer') || document.body;
    const activePopups = window._activePopups;
    const maxAttempts = 10;
    let attempt = 0;
    let popup, rect;

    do {
      if (popup) {
        popup.remove();
      }
      // Calcul position (entre 10% et 90% si aléatoire)
      const x = (posX == null || posX < 0) ? randomPercent(10, 90) : posX;
      const y = (posY == null || posY < 0) ? randomPercent(10, 90) : posY;

      // Création de l'élément popup
      popup = document.createElement('div');
      popup.classList.add('overlay-popup');
      popup.style.position = 'absolute';
      popup.style.left = `${x}%`;
      popup.style.top  = `${y}%`;

      // Contenu
      const header = document.createElement('h3');
      header.innerText = title;
      const body = document.createElement('div');
      body.innerHTML = message;
      popup.append(header, body);

      container.appendChild(popup);
      rect = popup.getBoundingClientRect();
      attempt++;
    } while (
      attempt < maxAttempts &&
      activePopups.some(other => isOverlapping(rect, other.getBoundingClientRect()))
    );

    // Conserve ce popup dans la liste des actifs
    activePopups.push(popup);

    // Suppression après délai et retrait de la liste
    setTimeout(() => {
      popup.classList.add('fade-out');
      setTimeout(() => {
        popup.remove();
        const idx = activePopups.indexOf(popup);
        if (idx !== -1) activePopups.splice(idx, 1);
      }, 500);
    }, delaySeconds * 1000);
  }
})();
