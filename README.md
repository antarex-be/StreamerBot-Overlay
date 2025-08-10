# Modular HTML / CSS / JS / WebSocket Stream Overlay

A **modular streaming overlay** built with **HTML**, **CSS**, **JavaScript**, and **WebSocket**, designed to be **controlled by [Streamer.bot](https://streamer.bot/)**.  
Each module can be used independently or combined to create a fully customized stream experience.

## ✨ Features
- ⚡ Real-time updates via WebSocket
- 🧩 Modular design — load only what you need
- 🎯 Perfect for OBS or any browser source
- 🔌 Seamless integration with Streamer.bot actions

## 📦 Included Modules

### `scrolling-banner`
Displays a scrolling banner with custom alert text.

### `alert-video`
Plays video alerts triggered by stream events such as subscriptions, follows, or raids.

### `chat`
Displays the stream's live chat directly on screen.

### `popup`
Shows popup messages on the stream for quick announcements or alerts.

### `big-emote`
Displays a large emote that moves randomly across the screen.  
Typically used with the "giant emote" power-up.

### `apple-music`
Connects to the [Cider](https://cider.sh/) app to display the currently playing track from Apple Music.

---

## 🛠 Setting Up Modules

The `overlay.html` file defines which modules are loaded in your overlay.  
To **add or remove** modules, edit `overlay.html` and include/exclude `<script>` tags like this:

```html
<!-- Required core script -->
<script type="text/javascript" src="modules/overlay-core/overlay-core.js"></script>

<!-- Example: enable popup module -->
<script type="text/javascript" src="modules/popup/popup.js"></script>

<!-- Example: enable scrolling banner -->
<script type="text/javascript" src="modules/scrolling-banner/scrolling-banner.js"></script>
```

**Important:**
- `overlay-core.js` is **required** for the overlay to function.
- Each module has its **own CSS file** located in its module folder (e.g., `modules/popup/css/popup.css`) that you can edit to customize the style.

---

## 🎥 Adding to OBS

1. In OBS, create a new **Browser Source**.
2. Point it to the `overlay.html` file (local path or hosted URL).
3. Set it to **match your full stream resolution**.
4. Optionally, you can pass connection parameters in the URL:

```
?address=127.0.0.1&port=8080&password=StreamerBotWSPassword
```

**Parameters:**
| Parameter  | Description |
|------------|-------------|
| `address`  | IP address of the machine running Streamer.bot (default: `127.0.0.1`) |
| `port`     | WebSocket port configured in Streamer.bot |
| `password` | WebSocket password set in Streamer.bot |

Example full URL:
```
overlay.html?address=127.0.0.1&port=8080&password=MySecretPassword
```

---

## 🎮 Controlling Modules from Streamer.bot

1. In **Streamer.bot**, locate the included **"WebSocket"** action (provided in the repository or your import file).
2. Call this action from other actions or events with the following parameters:

| Parameter    | Description |
|--------------|-------------|
| `wsAction`   | The module or action to trigger (e.g., `scrolling-banner`, `popup`, `big-emote`) |
| `wsParam1`   | First parameter for the module (depends on module) |
| `wsParam2`   | Second parameter (optional) |
| `wsParam3`   | Third parameter (optional) |
| ...          | Additional parameters as needed by the module |

---

### 📌 Example: Showing a Popup (modules/popup/popup.js module)

**Action:** `wsAction = stream-popup`  
**Parameters:**

| Parameter  | Description |
|------------|-------------|
| `wsParam1` | **Popup title** |
| `wsParam2` | **Popup message** |
| `wsParam3` | **Display duration in seconds** (`-1` for unlimited) |
| `wsParam4` | **X position** (`-1` for random, default) |
| `wsParam5` | **Y position** (`-1` for random, default) |
| `wsParam6` | **Reference** (optional, useful for manual deletion) |
| `wsParam7` | **Image URL** (e.g., user profile picture) |

**Example usage:**
```
wsAction = stream-popup
wsParam1 = New Subscriber!
wsParam2 = Thanks for subscribing, JohnDoe!
wsParam3 = 10
wsParam4 = -1
wsParam5 = -1
wsParam6 = subAlert123
wsParam7 = https://static-cdn.jtvnw.net/jtv_user_pictures/463d3058-d3aa-4abd-af1d-6a28fccc1dd7-profile_image-300x300.png
```

---

### 🗑 Example: Deleting a Popup (modules/popup/popup.js module)

**Action:** `wsAction = stream-popup-delete`  
**Parameters:**

| Parameter  | Description |
|------------|-------------|
| `wsParam1` | Reference of the popup to delete (optional, deletes all if not provided) |

**Example usage:**
```
wsAction = stream-popup-delete
wsParam1 = subAlert123
```

---

## 🚀 Installation
1. Clone the repository:
2. Edit `overlay.html` to include the modules you want.
3. Add the `overlay.html` file to OBS as a Browser Source.
4. Configure your **Streamer.bot** WebSocket output to send events to the overlay.

---

## 🔌 Requirements
- [Streamer.bot](https://streamer.bot/) installed and configured
- WebSocket enabled in Streamer.bot
- OBS Studio (or compatible browser source streaming software)

---
