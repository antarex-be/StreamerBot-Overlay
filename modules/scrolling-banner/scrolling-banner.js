;(function() {
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-scrollingbanner-css', moduleUrl + '/css/scrolling-banner.css');

	function initModule() {
		const container = document.getElementById('mainContainer') || document.body;
		if (!document.getElementById('scrollingBannerContainer')) {
			const scrollingBannerContainer = document.createElement('div');
			scrollingBannerContainer.id = 'scrollingBannerContainer';

			const scrollingBannerMessage = document.createElement('div');
			scrollingBannerMessage.id = 'scrollingBannerMessage';
      scrollingBannerMessage.innerText = 'Bienvenue sur le stream !'

      scrollingBannerContainer.appendChild(scrollingBannerMessage);
			container.appendChild(scrollingBannerContainer);
		}
  }
  initModule();

  if (window.SBdispatcher) {
    SBdispatcher.on('stream-scrollingbanner', data => {
      showAnnounce(data.message);
    });
    SBdispatcher.on('stream-scrollingbanner-hide', () => {
      hideAnnounce();
    });
  }

  function showAnnounce(message = "") {
    const container = document.getElementById('scrollingBannerContainer');
    const announceText = document.getElementById('scrollingBannerMessage');

    if (message.length > 0) {
      announceText.innerText = message;
    }
    container._positionDivHandler = () => positionDiv(container);
    container.addEventListener('animationend', container._positionDivHandler);
    container.style.animation = "slide-in-left 2s ease forwards";
  }

  function hideAnnounce() {
    const container = document.getElementById('scrollingBannerContainer');
    container._positionDivHandler = () => positionDiv(container);
    container.addEventListener('animationend', container._positionDivHandler);
    container.style.animation = "slide-out-left 2s ease forwards";
  }  

})();

