//////////////////
// CHAT OVERLAY //
//////////////////

;(function() {
	let sbShowChat = true;
  const moduleUrl = window.getModuleUrl(); 
  loadCSSModule('overlay-chat-css', moduleUrl + '/css/chat.css');

	function initModule() {
		const container = document.body;
		
		if (!document.getElementById('chat-container')) {
			const chatContainer = document.createElement('div');
			chatContainer.className = 'chat-container';
			chatContainer.id = 'chat-container';

			const sticky = document.createElement('div');
			sticky.id = 'stickyContainer';
			const announceList = document.createElement('ul');
			announceList.id = 'announcementList';
			sticky.appendChild(announceList);

			const messages = document.createElement('div');
			messages.id = 'messagesContainer';
			const messageList = document.createElement('ul');
			messageList.id = 'messageList';
			messages.appendChild(messageList);

			chatContainer.append(sticky, messages);
			container.appendChild(chatContainer);
		}

		function injectTemplate(id, html) {
			if (!document.getElementById(id)) {
				const tpl = document.createElement('template');
				tpl.id = id;
				tpl.innerHTML = html.trim();
				document.body.appendChild(tpl);
			}
		}

		injectTemplate('messageTemplate', `
			<div class="chat-message" id="messageContainer">
				<span class="label username" id="username"></span>
				<span class="label bottom-timestamp" id="timestamp"></span>
				<span class="label badges" id="badges"></span>
				<img class="avatar" id="avatar" alt="Avatar" />
				<span class="role-icon" id="role"></span>
				<div class="message-content" id="messageContent"></div>
			</div>
		`);

		injectTemplate('announcementTemplate', `
			<div class="announcement-message" id="messageContainer">
				<div class="message-content" id="messageContent"></div>
			</div>
		`);
	}

	initModule();

	StreamerBot.on('Twitch.ChatMessage', (data) => {
		if (sbDebugMode) 
			console.log(data.data);
		TwitchChatMessage(data.data);
	})

	StreamerBot.on('Twitch.Announcement', (data) => {
		if (sbDebugMode) 
			console.log(data.data);
		TwitchAnnouncement(data.data);
	})

	StreamerBot.on('Twitch.ChatMessageDeleted', (data) => {
		if (sbDebugMode) 
			console.log(data.data);
		TwitchChatMessageDeleted(data.data);
	})

	StreamerBot.on('Twitch.UserBanned', (data) => {
		if (sbDebugMode) 
			console.log(data.data);
		TwitchUserBanned(data.data);
	})

	StreamerBot.on('Twitch.UserTimedOut', (data) => {
		if (sbDebugMode) 
			console.log(data.data);
		TwitchUserBanned(data.data);
	})

	StreamerBot.on('Twitch.ChatCleared', (data) => {
		if (sbDebugMode) 
			console.log(data.data);
		TwitchChatCleared(data.data);
	})

	if (window.SBdispatcher) {
		SBdispatcher.on('chat-show', () => {
			divShow("chat-container");
		});
		SBdispatcher.on('chat-hide', () => {
			divHide("chat-container");
		});
		SBdispatcher.on('chat-toggle', () => {
			divToggle("chat-container");
		});
		SBdispatcher.on('chat-left', () => {
			divAnimate("chat-container", "chat-container-left");
		});
		SBdispatcher.on('chat-right', () => {
			divAnimate("chat-container", "chat-container-right");
		});
	}


	//////////////////
	// CHAT OPTIONS //
	//////////////////

	const showPlatform = getBooleanParam("showPlatform", true);
	const showAvatar = getBooleanParam("showAvatar", true);
	const showTimestamps = getBooleanParam("showTimestamps", true);
	const showBadges = getBooleanParam("showBadges", true);
	const showPronouns = getBooleanParam("showPronouns", true);
	const showUsername = getBooleanParam("showUsername", true);
	const hideAfter = getIntParam("hideAfter", 900);
	const hideAnnounceAfter = getIntParam("hideAfter", 180);

	const ignoreChatters = urlParams.get("ignoreChatters") || "botarex";
	const ignoreUserList = ignoreChatters.split(',').map(item => item.trim().toLowerCase()) || [];

	const chatContainer = document.getElementById('chat-container');

	if (!sbShowChat) {
		chatContainer.style.opacity = 0;
	}

	///////////////
	// CHAT CODE //
	///////////////

	function twitchChatDisplay() {
		setTimeout(function () {
			chatContainer.style.transition = "all 1s ease";
			chatContainer.style.opacity = 1;
		}, 1000);
	}

	function twitchChatHide() {
		setTimeout(function () {
			chatContainer.style.transition = "all 1s ease";
			chatContainer.style.opacity = 0;
		}, 1000);
	}

	async function TwitchChatMessage(data) {
		// Don't post messages starting with "!"
		if (data.message.message.startsWith("!") && excludeCommands)
			return;

		// Don't post messages from users from the ignore list
		if (ignoreUserList.includes(data.message.username.toLowerCase()))
			return;

		// Get a reference to the template
		const template = document.getElementById('messageTemplate');

		// Create a new instance of the template
		const chatMessage = template.content.cloneNode(true);

		// Get divs
		const messageContainer = chatMessage.querySelector("#messageContainer");
		const messageDiv = chatMessage.querySelector("#messageContent");
		const usernameDiv = chatMessage.querySelector("#username");
		const timestampDiv = chatMessage.querySelector("#timestamp");
		const badgeListDiv = chatMessage.querySelector("#badges");
		const avatarImg = chatMessage.querySelector("#avatar");
		const roleIconDiv = chatMessage.querySelector("#role");

		// Set timestamp
		if (showTimestamps) {
			timestampDiv.innerText = GetCurrentTimeFormatted();
		}

		// Set the username info
		if (showUsername) {
			usernameDiv.innerText = data.message.displayName;
			usernameDiv.style.color = data.message.color;
		}

		// Set the message data
		let message = data.message.message;
		const messageColor = data.message.color;
		messageDiv.innerText = message;

		// Set the "action" color
		if (data.message.isMe)
			messageDiv.style.color = messageColor;

		// Render badges
		if (showBadges) {
			badgeListDiv.innerHTML = "";
			for (i in data.message.badges) {
				const badge = new Image();
				badge.src = data.message.badges[i].imageUrl;
				badge.classList.add("badge");
				badgeListDiv.appendChild(badge);
			}
		}

		// Render emotes
		for (i in data.emotes) {
			const emoteElement = `<img src="${data.emotes[i].imageUrl}" class="emote"/>`;
			const emoteName = EscapeRegExp(data.emotes[i].name);

			let regexPattern = emoteName;

			// Check if the emote name consists only of word characters (alphanumeric and underscore)
			if (/^\w+$/.test(emoteName)) {
				regexPattern = `\\b${emoteName}\\b`;
			}
			else {
				// For non-word emotes, ensure they are surrounded by non-word characters or boundaries
				regexPattern = `(?:^|[^\\w])${emoteName}(?:$|[^\\w])`;
			}

			const regex = new RegExp(regexPattern, 'g');
			messageDiv.innerHTML = messageDiv.innerHTML.replace(regex, emoteElement);
		}

		// Render cheermotes
		for (i in data.cheerEmotes) {
			const bits = data.cheerEmotes[i].bits;
			const imageUrl = data.cheerEmotes[i].imageUrl;
			const name = data.cheerEmotes[i].name;
			const cheerEmoteElement = `<img src="${imageUrl}" class="emote"/>`;
			const bitsElements = `<span class="bits">${bits}</span>`
			messageDiv.innerHTML = messageDiv.innerHTML.replace(new RegExp(`\\b${name}${bits}\\b`, 'i'), cheerEmoteElement + bitsElements);
		}

		// Render avatars
		if (showAvatar) {
			const username = data.message.username;
			const avatarURL = await GetAvatar(username);
			avatarImg.src = avatarURL;
		}

		// Add User Role Style
		switch (data.user.role) {
			case 2:
				// User VIP
				messageContainer.classList.add("vip");
				const roleVip = new Image();
				roleVip.src = moduleUrl + "/assets/role-vip.png";
				roleIconDiv.appendChild(roleVip);
				break;
			case 3:
				// User Moderator
				messageContainer.classList.add("mod");
				const roleMod = new Image();
				roleMod.src = moduleUrl + "/assets/role-moderator.png";
				roleIconDiv.appendChild(roleMod);
				break;
			case 4:
				// User Broadcaster
				messageContainer.classList.add("streamer");
				const roleStreamer = new Image();
				roleStreamer.src = moduleUrl + "/assets/role-broadcaster.png";
				roleIconDiv.appendChild(roleStreamer);
				break;
			default:
				messageContainer.classList.add("user");
		}

		addMessage(chatMessage,data.message.msgId, data.user.id);
	}

	function TwitchChatMessageDeleted(data) {
		const messageList = document.getElementById("messageList");

		// Maintain a list of chat messages to delete
		const messagesToRemove = [];

		// ID of the message to remove
		const messageId = data.messageId;

		// Find the items to remove
		for (let i = 0; i < messageList.children.length; i++) {
			if (messageList.children[i].id === messageId) {
				messagesToRemove.push(messageList.children[i]);
			}
		}

		// Remove the items
		messagesToRemove.forEach(item => {
			item.style.opacity = 0;
			item.style.height = 0;
			setTimeout(function () {
				messageList.removeChild(item);
			}, 500);
		});
	}

	function TwitchUserBanned(data) {
		const messageList = document.getElementById("messageList");

		// Maintain a list of chat messages to delete
		const messagesToRemove = [];

		// ID of the message to remove
		const userId = data.user_id;

		// Find the items to remove
		for (let i = 0; i < messageList.children.length; i++) {
			if (messageList.children[i].dataset.userId === userId) {
				messagesToRemove.push(messageList.children[i]);
			}
		}

		// Remove the items
		messagesToRemove.forEach(item => {
			messageList.removeChild(item);
		});
	}

	function TwitchChatCleared(data) {
		const messageList = document.getElementById("messageList");

		while (messageList.firstChild) {
			messageList.removeChild(messageList.firstChild);
		}
	}

	async function TwitchAnnouncement(data) {
		// Get a reference to the template
		const template = document.getElementById('announcementTemplate');

		// Create a new instance of the template
		const stickyMessage = template.content.cloneNode(true);
		const messageDiv = stickyMessage.querySelector("#messageContent");

		// Set the message data
		let message = data.text;
		messageDiv.innerText = message;

		for (i in data.parts) {
			if (data.parts[i].type == `emote`) {
				const emoteElement = `<img src="${data.parts[i].imageUrl}" class="emote"/>`;
				const emoteName = EscapeRegExp(data.parts[i].text);
		
				let regexPattern = emoteName;
		
				// Check if the emote name consists only of word characters (alphanumeric and underscore)
				if (/^\w+$/.test(emoteName)) {
					regexPattern = `\\b${emoteName}\\b`;
				}
				else {
					// For non-word emotes, ensure they are surrounded by non-word characters or boundaries
					regexPattern = `(?:^|[^\\w])${emoteName}(?:$|[^\\w])`;
				}
		
				const regex = new RegExp(regexPattern, 'g');
				messageDiv.innerHTML = messageDiv.innerHTML.replace(regex, emoteElement);
			}
		}
		

		addAnnounce(stickyMessage, data.messageId, data.user.id);
		
	} 

	function addMessage(messageElement,elementId,userId) {
		const chatMessages = document.getElementById("messageList");
		var lineItem = document.createElement('li');
		lineItem.id = elementId;
		lineItem.dataset.userId = userId;
		lineItem.appendChild(messageElement);

		chatMessages.appendChild(lineItem);
		chatMessages.scrollTop = chatMessages.scrollHeight;

		if (hideAfter > 0) {
			setTimeout(function () {
				lineItem.style.opacity = 0;
				setTimeout(function () {
					chatMessages.removeChild(lineItem);
				}, 500);
			}, hideAfter * 1000);
		}
		
	}

	function addAnnounce(messageElement,elementId,userId) {
		const chatMessages = document.getElementById("announcementList");
		// Clear the previous announcements
		while (chatMessages.firstChild) { 
			chatMessages.removeChild(chatMessages.firstChild);
		}

		var lineItem = document.createElement('li');
		lineItem.id = elementId;
		lineItem.dataset.userId = userId;
		lineItem.appendChild(messageElement);

		chatMessages.appendChild(lineItem);
		chatMessages.scrollTop = chatMessages.scrollHeight;

		if (hideAnnounceAfter > 0) {
			setTimeout(function () {
				lineItem.style.opacity = 0;
				setTimeout(function () {
					chatMessages.removeChild(lineItem);
				}, 500);
			}, hideAnnounceAfter * 1000);
		}
		
	}

	function GetCurrentTimeFormatted() {
		const now = new Date();
		let hours = now.getHours();
		const minutes = String(now.getMinutes()).padStart(2, '0');
		
		const formattedTime = `${hours}:${minutes}`;
		return formattedTime;

		// const ampm = hours >= 12 ? 'PM' : 'AM';

		// hours = hours % 12;
		// hours = hours ? hours : 12; // the hour '0' should be '12'

		// const formattedTime = `${hours}:${minutes} ${ampm}`;
		// return formattedTime;
	}

	async function GetAvatar(username) {
		if (avatarMap.has(username)) {
			console.debug(`Avatar found for ${username}. Retrieving from hash map.`)
			return avatarMap.get(username);
		}
		else {
			console.debug(`No avatar found for ${username}. Retrieving from Decapi.`)
			let response = await fetch('https://decapi.me/twitch/avatar/' + username);
			let data = await response.text()
			avatarMap.set(username, data);
			return data;
		}
	}

	function EscapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
})();
