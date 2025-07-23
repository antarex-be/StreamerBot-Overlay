////////////////
// PARAMETERS //
////////////////
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbDebugMode = urlParams.get("debug") || false;
const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";
const sbServerPassword = urlParams.get("password") || "VerySecretPassword";

const avatarMap = new Map();

/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

const StreamerBot = new StreamerbotClient({
	host: sbServerAddress,
	port: sbServerPort,
	password: sbServerPassword,

	onConnect: (data) => {
		console.log(`Streamer.bot successfully connected to ${sbServerAddress}:${sbServerPort}`)
    if (sbDebugMode) 
            console.debug(data);
		SetConnectionStatus(true);
	},

	onDisconnect: () => {
		console.error(`Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`)
		SetConnectionStatus(false);
	}

});

/////////////////////////
// STREAMER.BOT STATUS //
/////////////////////////

function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Connected!";
		statusContainer.style.opacity = 1;
		setTimeout(() => {
			statusContainer.style.transition = "all 2s ease";
			statusContainer.style.opacity = 0;
		}, 10);
	}
	else {
		statusContainer.style.background = "#D12025";
		statusContainer.innerText = "Connecting...";
		statusContainer.style.transition = "";
		statusContainer.style.opacity = 1;
	}
}

/////////////////////////////
// STREAMER.BOT DISPATCHER //
/////////////////////////////
const SBdispatcher = {
  _handlers: {},
  on(eventName, handler) {
    if (!this._handlers[eventName]) this._handlers[eventName] = []
    this._handlers[eventName].push(handler)
  },
  emit(eventName, data) {
    (this._handlers[eventName] || []).forEach(h => {
      try { h(data) }
      catch(e) { console.error(`Error in handler for ${eventName}:`, e) }
    })
  }
}

window.SBdispatcher = SBdispatcher

///////////////////////////////
// STREAMER.BOT SUBSCRIPTION //
///////////////////////////////
StreamerBot.on('General.Custom', (data) => {
	const d = data.data
	if (sbDebugMode) console.log(d)
	if (d.origin !== "antarex-overlay") return
	SBdispatcher.emit(d.action, d)
  if (d.type) {
    SBdispatcher.emit(`${d.action}:${d.type}`, d)
  }	
});  

///////////////////////
// OVERLAY FUNCTIONS //
///////////////////////
function loadCSSModule(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function getModuleUrl() {
  const thisScript = document.currentScript;
  if (!thisScript) {
    console.warn('getModuleUrl: document.currentScript non disponible');
    return '';
  }
  const url = thisScript.src;
  return url.substring(0, url.lastIndexOf('/'));
}

function loadModuleResources(resources) {
  const promises = resources.map(res => {
    const key = res.id || res.url;
    if (document.getElementById(key)) {
      return Promise.resolve();
    }
    if (res.type === 'css') {
      loadCSSModule(key, res.url);
      return Promise.resolve();
    }
    if (res.type === 'js') {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = key;
        script.src = res.url;
        if (res.integrity) script.integrity = res.integrity;
        if (res.crossorigin) script.crossOrigin = res.crossorigin;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Échec chargement script ${res.url}`));
        document.head.appendChild(script);
      });
    }
    return Promise.resolve();
  });
  return Promise.all(promises).then(() => {});
}


function getBooleanParam(paramName, defaultValue) {
	const urlParams = new URLSearchParams(window.location.search);
	const paramValue = urlParams.get(paramName);

	if (paramValue === null) {
		return defaultValue; // Parameter not found
	}

	const lowercaseValue = paramValue.toLowerCase(); // Handle case-insensitivity

	if (lowercaseValue === 'true') {
		return true;
	} else if (lowercaseValue === 'false') {
		return false;
	} else {
		return paramValue; // Return original string if not 'true' or 'false'
	}
}

function getIntParam(paramName, defaultValue) {
	const urlParams = new URLSearchParams(window.location.search);
	const paramValue = urlParams.get(paramName);

	if (paramValue === null) {
		return defaultValue; // or undefined, or a default value, depending on your needs
	}

	console.log(paramValue);

	const intValue = parseInt(paramValue, 10); // Parse as base 10 integer

	if (isNaN(intValue)) {
		return null; // or handle the error in another way, e.g., throw an error
	}

	return intValue;
}

function divShow(divId) {
	const div = document.getElementById(divId);
	if (div) {
		div.style.transition = "all 1s ease";
		div.style.opacity = 1;
	} else {
		console.error(`Element with ID ${divId} not found.`);
	}
}

function divHide(divId) {
	const div = document.getElementById(divId);	
	if (div) {
		div.style.transition = "all 1s ease";
		div.style.opacity = 0;
	} else {
		console.error(`Element with ID ${divId} not found.`);
	}
}

function divToggle(divId) {
	const div = document.getElementById(divId);
	if (div) {
		div.style.transition = "all 1s ease";

		const currentOpacity = window.getComputedStyle(div).opacity;

		if (parseFloat(currentOpacity) === 0) {
			div.style.opacity = 1;
		} else {
			div.style.opacity = 0;
		}
	} else {
		console.error(`Element with ID ${divId} not found.`);
	}
}

function divAnimate(divId, animationName) {
	const div = document.getElementById(divId);
	if (div) {
		function positionDiv() {
			finalizeTransformPosition(div);
			div.removeEventListener('animationend', positionDiv);
		}	
		div.addEventListener('animationend', positionDiv);
		div.style.animation = `${animationName} 2s ease forwards`;
	} else {
		console.error(`Element with ID ${divId} not found.`);
	}
}

function finalizePosition(frame) {
  const rect = frame.getBoundingClientRect();
  const parentRect = frame.offsetParent
    ? frame.offsetParent.getBoundingClientRect()
    : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };

	const fromLeft = rect.left - parentRect.left;
	const fromRight = parentRect.right - rect.right;		
	const fromTop = rect.top - parentRect.top;
	const fromBottom = parentRect.bottom - rect.bottom;

	if (fromRight <= fromLeft) {
		// Closer to right edge → use right
		frame.style.right = `${fromRight}px`;
		frame.style.left = '';
	} else {
		frame.style.left = `${fromLeft}px`;
		frame.style.right = '';
	}	

	if (fromBottom <= fromTop) {
		frame.style.bottom = `${fromBottom}px`;
		frame.style.top = '';
	} else {
		frame.style.top = `${fromTop}px`;
		frame.style.bottom = '';
	}

  frame.style.animation = "";
}

function finalizeTransformPosition(div) {
  const computedStyle = window.getComputedStyle(div);
  const transform = computedStyle.transform;
  div.style.transform = transform;
  div.style.animation = "";
}

function positionDiv(container) {
	finalizePosition(container);
	container.removeEventListener('animationend', container._positionDivHandler);
}

window.loadCSSModule 		= loadCSSModule;
window.getModuleUrl   	= getModuleUrl;
window.loadModuleResources = loadModuleResources;
