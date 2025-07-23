;(function() {
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-alertbanner-css', moduleUrl + '/css/alert-banner.css');

	function initModule() {
		const container = document.getElementById('mainContainer') || document.body;
		if (!document.getElementById('alertBannerContainer')) {
			const alertBannerContainer = document.createElement('div');
			alertBannerContainer.id = 'alertBannerContainer';

			const alertBannerTitle = document.createElement('div');
			alertBannerTitle.id = 'alertBannerTitle';
      alertBannerTitle.innerHTML = '<p></p>';

      const alertBannerMessage = document.createElement('div');
			alertBannerMessage.id = 'alertBannerMessage';
      alertBannerMessage.innerHTML = '<p></p>';

      alertBannerContainer.appendChild(alertBannerTitle);
      alertBannerContainer.appendChild(alertBannerMessage);
			container.appendChild(alertBannerContainer);
		}
  }
  initModule();

  if (window.SBdispatcher) {
    SBdispatcher.on('stream-alertbanner', data => {
      showAlert(data.param1,data.param2);
    });
    SBdispatcher.on('stream-alertbanner-hide', () => {
      hideAlert();
    });
  }

  function showAlert(title = "" , message = "") {
    const container = document.getElementById('alertBannerContainer');
    const alertTitle = document.getElementById('alertBannerTitle').querySelector('p');
    const alertText = document.getElementById('alertBannerMessage').querySelector('p');

    if (title.length > 0) {
      alertTitle.innerText = title;
    }
    if (message.length > 0) {
      alertText.innerText = message;
    }
      
    container._positionDivHandler = () => positionDiv(container);
    container.addEventListener('animationend', container._positionDivHandler);
    container.style.animation = "slide-in-right 2s ease forwards";
      
  }

  function hideAlert() {
    const container = document.getElementById('alertBannerContainer');
    container._positionDivHandler = () => positionDiv(container);
    container.addEventListener('animationend', container._positionDivHandler);
    container.style.animation = "slide-out-right 2s ease forwards";
  }

})();

