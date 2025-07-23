// Apple Music Overlay Module
// This module connects to a local Cider instance to display Apple Music playback information.
// Initial sources were taken from https://github.com/nuttylmao/nutty.gg

;(function() {
  let visibilityDefault = 5;
  let visibilityDuration = visibilityDefault;
  let animationSpeed = 0.5;

  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-applemusic-css', moduleUrl + '/css/apple-music.css');
  loadModuleResources([
    { type:'css', url:'https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/metropolis.min.css', id:'xz-fonts' },
    { type:'js', url:'https://cdn.socket.io/4.7.5/socket.io.min.js', id:'socket-io', crossorigin:'anonymous' },
    { type:'js', url:'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenMax.min.js', id:'tweenmax' }
  ]).then(() => {
    initModule();
    let outer = document.getElementById('musicWidgetContainer');
    let maxWidth = outer.clientWidth+50;
    window.addEventListener("resize", resize);
    resize();
    connectws();    

    function initModule() {
      const container = document.getElementById('mainContainer') || document.body;

      // Crée le conteneur principal
      if (!document.getElementById('musicWidgetContainer')) {
        const widget = document.createElement('div');
        widget.id = 'musicWidgetContainer';

        // Album art box
        const artBox = document.createElement('div');
        artBox.id = 'albumArtBox';
        const albumArt = document.createElement('img');
        albumArt.id = 'albumArt';
        albumArt.src = ''; // placeholder
        const albumArtBack = document.createElement('img');
        albumArtBack.id = 'albumArtBack';
        albumArtBack.src = ''; // placeholder
        artBox.append(albumArt, albumArtBack);

        // Song info box
        const infoBox = document.createElement('div');
        infoBox.id = 'songInfoBox';

        const songInfo = document.createElement('div');
        songInfo.id = 'songInfo';
        const innerBox = document.createElement('div');
        innerBox.id = 'IAmRunningOutOfNamesForTheseBoxes';

        const songLabel = document.createElement('div');
        songLabel.id = 'songLabel';
        songLabel.innerText = '-/-';
        const artistLabel = document.createElement('div');
        artistLabel.id = 'artistLabel';
        artistLabel.innerText = '-/-';
        const albumLabel = document.createElement('div');
        albumLabel.id = 'albumLabel';
        albumLabel.innerText = '-/-';

        const times = document.createElement('div');
        times.id = 'times';
        const progressTime = document.createElement('div');
        progressTime.id = 'progressTime';
        progressTime.innerText = '0:00';
        const duration = document.createElement('div');
        duration.id = 'duration';
        duration.innerText = '0:00';
        times.append(progressTime, duration);

        const progressBg = document.createElement('div');
        progressBg.id = 'progressBg';
        const progressBar = document.createElement('div');
        progressBar.id = 'progressBar';
        progressBg.appendChild(progressBar);

        innerBox.append(songLabel, artistLabel, albumLabel, times, progressBg);
        songInfo.appendChild(innerBox);

        const backgroundArt = document.createElement('div');
        backgroundArt.id = 'backgroundArt';
        const backgroundImage = document.createElement('img');
        backgroundImage.id = 'backgroundImage';
        backgroundImage.src = '';
        const backgroundImageBack = document.createElement('img');
        backgroundImageBack.id = 'backgroundImageBack';
        backgroundImageBack.src = '';
        backgroundArt.append(backgroundImage, backgroundImageBack);

        infoBox.append(songInfo, backgroundArt);

        widget.append(artBox, infoBox);
        container.appendChild(widget);
      }
    }
    
    if (window.SBdispatcher) {
      SBdispatcher.on('musicPlaying', data => {
        visibilityDuration = data.param1 || visibilityDefault;
        showSongInfo();
      });
    }

    function connectws() {
      if ("WebSocket" in window) {
        const CiderApp = io("http://localhost:10767/", {
          transports: ['websocket']
        });

        CiderApp.on("disconnect", (event) => {
          SetConnectionStatus(false);
          setTimeout(connectws, 5000);
        });

        CiderApp.on("connect", (event) => {
          SetConnectionStatus(true);
        });

        // Set up websocket artwork/information handling
        CiderApp.on("API:Playback", ({ data, type }) => {
          switch (type) {
            // Song changes
            case ("playbackStatus.nowPlayingItemDidChange"):
              UpdateSongInfo(data);
              break;

            // Progress bar moves
            case ("playbackStatus.playbackTimeDidChange"):
              UpdateProgressBar(data);
              break;

            // Pause/unpause
            case ("playbackStatus.playbackStateDidChange"):
              UpdatePlaybackState(data);
              break;
          }
        });
      }
    }

    function showSongInfo() {
      setTimeout(() => {
        SetVisibility(true);
      }, animationSpeed * 500);

      if (visibilityDuration > 0) {
        setTimeout(() => {
          SetVisibility(false);
        }, visibilityDuration * 1000);
      }
    }

    function UpdateSongInfo(data) {
      // Set the user's info
      let albumArtUrl = data.artwork.url;
      albumArtUrl = albumArtUrl.replace("{w}", data.artwork.width);
      albumArtUrl = albumArtUrl.replace("{h}", data.artwork.height);

      UpdateAlbumArt(document.getElementById("albumArt"), albumArtUrl);
      UpdateAlbumArt(document.getElementById("backgroundImage"), albumArtUrl);

      setTimeout(() => {
        UpdateTextLabel(document.getElementById("songLabel"), data.name);
        UpdateTextLabel(document.getElementById("artistLabel"), data.artistName);
      }, animationSpeed * 500);

      setTimeout(() => {
        document.getElementById("albumArtBack").src = albumArtUrl;
        document.getElementById("backgroundImageBack").src = albumArtUrl;
      }, 2 * animationSpeed * 500);

      showSongInfo()

    }

    function UpdateTextLabel(div, text) {
      if (div.innerHTML != text) {
        div.setAttribute("class", "text-fade");
        setTimeout(() => {
          div.innerHTML = text;
          div.setAttribute("class", ".text-show");
        }, animationSpeed * 250);
      }
    }

    function UpdateAlbumArt(div, imgsrc) {
      if (div.src != imgsrc) {
        div.setAttribute("class", "text-fade");
        setTimeout(() => {
          div.src = imgsrc;
          div.setAttribute("class", "text-show");
        }, animationSpeed * 500);
      }
    }

    function UpdateProgressBar(data) {
      const progress = ((data.currentPlaybackTime / data.currentPlaybackDuration) * 100);
      const progressTime = ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(data.currentPlaybackTime);
      const duration = ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(data.currentPlaybackTimeRemaining);
      document.getElementById("progressBar").style.width = `${progress}%`;
      document.getElementById("progressTime").innerHTML = progressTime;
      document.getElementById("duration").innerHTML = `-${duration}`;
    }

    function UpdatePlaybackState(data) {
      console.log(data);
      switch (data.state) {
        case ("paused"):
        case ("stopped"):
          SetVisibility(false);
          break;
        case ("playing"):
          UpdateSongInfo(data.attributes);
          break;
      }
    }


    function ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.trunc(time - minutes * 60);

      return `${minutes}:${('0' + seconds).slice(-2)}`;
    }

    function SetVisibility(isVisible) {
      widgetVisibility = isVisible;

      const musicWidgetContainer = document.getElementById("musicWidgetContainer");

      if (isVisible) {
        var tl = new TimelineMax();
        tl
          .to(musicWidgetContainer, animationSpeed, { bottom: "50%", ease: Power1.easeInOut }, 'label')
          .to(musicWidgetContainer, animationSpeed, { opacity: 1, ease: Power1.easeInOut }, 'label')
      }
      else {
        var tl = new TimelineMax();
        tl
          .to(musicWidgetContainer, animationSpeed, { bottom: "45%", ease: Power1.easeInOut }, 'label')
          .to(musicWidgetContainer, animationSpeed, { opacity: 0, ease: Power1.easeInOut }, 'label')
      }
    }

    function SetConnectionStatus(connected) {
      if (connected) {
        console.log("Connected to Cider!");
      }
      else {
        console.log("Not connected to Cider...");
      }
    }

    function resize() {
      const scale = window.innerWidth / maxWidth;
      outer.style.transform = 'translate(0%, 0%) scale(' + scale + ')';
    }
  }).catch(err => console.error(err));

})();