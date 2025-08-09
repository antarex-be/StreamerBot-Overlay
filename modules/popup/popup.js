;(function() {
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-popup-css', moduleUrl + '/css/popup.css');

  const FADE_OUT_MS = 500;

	function initModule() {
		const container = document.getElementById('mainContainer') || document.body;
		if (!document.getElementById('popupContainer')) {
			const popupContainer = document.createElement('div');
			popupContainer.id = 'popupContainer';
			container.appendChild(popupContainer);
		}    
  }
  initModule();  

  // Tableau global des popups actifs pour éviter le chevauchement
  window._activePopups = window._activePopups || [];

  // ===== Helpers =====
  function randomPercent(min = 0, max = 100) {
    const minClamped = Math.ceil(min);
    const maxClamped = Math.floor(max);
    return Math.floor(Math.random() * (maxClamped - minClamped + 1)) + minClamped;
  }

  function isOverlapping(r1, r2) {
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  }

  function findPopupByRef(ref) {
    if (!ref) return null;
    return window._activePopups.find(el => el.dataset && el.dataset.ref === String(ref)) || null;
  }

  function removePopupElement(popupEl) {
    if (!popupEl || !popupEl.isConnected) return;
    if (popupEl._timeoutId) {
      clearTimeout(popupEl._timeoutId);
      popupEl._timeoutId = null;
    }
    popupEl.classList.add('fade-out');
    setTimeout(() => {
      if (popupEl && popupEl.remove) popupEl.remove();
      const idx = window._activePopups.indexOf(popupEl);
      if (idx !== -1) window._activePopups.splice(idx, 1);
    }, FADE_OUT_MS);
  }

  // ===== API =====
  /**
   * Supprime manuellement un popup par sa référence.
   * @param {string} reference
   * @returns {boolean} true si supprimé, false sinon
   */
  function deletePopup(reference) {
    const active = window._activePopups || [];
    const isEmpty =
      reference == null || (typeof reference === 'string' && reference.trim() === '');

    if (isEmpty) {
      const toRemove = active.slice();
      toRemove.forEach(removePopupElement);
      return toRemove.length > 0;
    }

    const target = findPopupByRef(String(reference));
    if (target) {
      removePopupElement(target);
      return true;
    }
    return false; 
  } 
  window.deletePopup = deletePopup;

  /**
   * Affiche un popup dans #mainContainer (ou body si absent).
   * @param {string} title        Titre du popup
   * @param {string} message      Contenu HTML du message
   * @param {number} delaySeconds Durée d'affichage en secondes. -1 = ne pas auto-supprimer
   * @param {number|null} posX    Position horizontale en %, -1 ou null = aléatoire
   * @param {number|null} posY    Position verticale en %, -1 ou null = aléatoire
   * @param {string|null} reference Identifiant unique pour ce popup (permet deletePopup)
   * @param {string|null} image     URL d'une image à afficher dans le popup
   */
  function showPopup(title, message, delaySeconds, posX = -1, posY = -1, reference = null, image = null) {
    const container = document.getElementById('popupContainer') || document.body;
    const activePopups = window._activePopups;
    const maxAttempts = 10;

    // Remplacer un popup existant de même référence
    if (reference) {
      const existing = findPopupByRef(reference);
      if (existing) removePopupElement(existing);
    }

    let attempt = 0;
    let popup, rect;

    do {
      if (popup) popup.remove();

      const x = (posX == null || posX < 0) ? randomPercent(10, 90) : posX;
      const y = (posY == null || posY < 0) ? randomPercent(10, 90) : posY;

      popup = document.createElement('div');
      popup.classList.add('overlay-popup');
      popup.style.position = 'absolute';
      popup.style.left = `${x}%`;
      popup.style.top  = `${y}%`;

      if (reference) popup.dataset.ref = String(reference);

      const header = document.createElement('h3');
      header.innerText = title;

      const body = document.createElement('div');
      body.innerHTML = message;

      popup.append(header, body);

      if (image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = title || 'image';
        img.classList.add('overlay-popup-image');
        popup.append(img);
      }

      container.appendChild(popup);
      rect = popup.getBoundingClientRect();
      attempt++;
    } while (
      attempt < maxAttempts &&
      activePopups.some(other => isOverlapping(rect, other.getBoundingClientRect()))
    );

    activePopups.push(popup);

    if (delaySeconds !== -1) {
      popup._timeoutId = setTimeout(() => removePopupElement(popup), delaySeconds * 1000);
    }
  }

  // ===== Events =====
  if (window.SBdispatcher) {
    SBdispatcher.on('stream-popup', data => {
      showPopup(
        data.param1,                                      // title
        data.param2,                                      // message (HTML)
        parseFloat(data.param3) || 3,                     // delaySeconds
        data.param4 != null ? parseFloat(data.param4) : -1, // posX
        data.param5 != null ? parseFloat(data.param5) : -1, // posY
        data.param6 != null ? String(data.param6) : null, // reference
        data.param7 != null ? String(data.param7) : null  // image URL
      );
    });

    // >>> Nouveau : suppression par event
    SBdispatcher.on('stream-popup-delete', data => {
      deletePopup(data?.param1);
    });
  }
})();
