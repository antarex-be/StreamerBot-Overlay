;(function() {
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-alertvideo-css', moduleUrl + '/css/alert-video.css');

	function initModule() {
		const container = document.getElementById('mainContainer') || document.body;
		if (!document.getElementById('alertVideoContainer')) {
			const alertVideoContainer = document.createElement('div');
			alertVideoContainer.id = 'alertVideoContainer';
			container.appendChild(alertVideoContainer);
		}
  }
  initModule();

  if (window.SBdispatcher) {
    SBdispatcher.on('stream-alert:Follow', data => {
      showAlert({ 
        userName: data.user, 
        videoUrl: moduleUrl + '/files/ALERT_follow.webm',
        delay: 12
      });
    });
    SBdispatcher.on('stream-alert:Sub', data => {
      showAlert({ 
        userName: data.user, 
        videoUrl: moduleUrl + '/files/ALERT_sub.webm',
        delay: 12
      });
    });
    SBdispatcher.on('stream-alert:SubGift', data => {
      showAlert({ 
        userName: data.user, 
        videoUrl: moduleUrl + '/files/ALERT_gift.webm', 
        delay: 12,
        topLine: 'Abonnement offert &agrave; <span class="alert_text-accent alert_variable-username">' + data.param1 + '</span>', 
        // bottomLine: 'Il a déjà offert <span class="alert_text-accent alert_variable-username">' + data.param2 +'</span> abonnements à la communauté !' 
      });    });
  }

  function showAlert({ userName, videoUrl, delay = 12, topLine = null, bottomLine = null }) {
    const container = document.createElement('div');
    container.classList.add('alert_outer-container', 'playing');

    const widget = document.createElement('div');
    widget.classList.add('alert_widget-container');

    const textContainer = document.createElement('div');
    textContainer.classList.add('alert_text-container');

    // Zone nom d’utilisateur (au centre de la vidéo)
    const centerTextWrapper = document.createElement('div');
    const usernameText = document.createElement('p');
    usernameText.classList.add('alert_text');

    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('alert_text-accent', 'alert_variable-username');
    usernameSpan.textContent = userName;

    usernameText.appendChild(usernameSpan);
    centerTextWrapper.appendChild(usernameText);

    // Vidéo
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('alertVideoContainer');

    const video = document.createElement('video');
    video.classList.add('alertVideo');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/webm';
    video.appendChild(source);
    videoContainer.appendChild(video);

    // Optionnel : ligne de texte en haut
    if (topLine) {
      const topTextContainer = document.createElement('div');
      topTextContainer.classList.add('alert_top-text-container');
      const topText = document.createElement('p');
      topText.classList.add('alert_top-text');
      topText.innerHTML = topLine;
      topTextContainer.appendChild(topText);
      container.appendChild(topTextContainer);
    }

    // Optionnel : ligne de texte en bas
    if (bottomLine) {
      const bottomTextContainer = document.createElement('div');
      bottomTextContainer.classList.add('alert_bottom-text-container');
      const bottomText = document.createElement('p');
      bottomText.classList.add('alert_bottom-text');
      bottomText.innerHTML = bottomLine;
      bottomTextContainer.appendChild(bottomText);
      container.appendChild(bottomTextContainer);
    }

    // Assemble tout
    textContainer.appendChild(centerTextWrapper);
    textContainer.appendChild(videoContainer);
    widget.appendChild(textContainer);
    container.appendChild(widget);
    document.getElementById('alertVideoContainer').appendChild(container);

    setTimeout(() => {
      container.remove();
    }, delay*1000);
  }


})();

