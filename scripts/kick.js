function moveChat() {
	const chat = document.getElementById("channel-chatroom");
	const main = document.querySelector("main");
	const messages = document.getElementById("chatroom-messages");
	const scrollPosition = messages.scrollTop;

	// Chat is inside main on mobile layouts
	if (chat && main && !main.contains(chat)) {
		const btnExpand = main.querySelector("button");
		const btnCollapse = chat.firstChild.querySelector("div");
		const btnExpandText = btnExpand.querySelector("span");
		const btnExpandIcon = btnExpand.querySelector("svg");

		const storage =
			typeof browser === "undefined" ? chrome.storage : browser.storage;

		storage.local.get("direction").then((res) => {
			const direction = res.direction;

			if (direction === "left") {
				main.before(chat);

				if (btnExpand) {
					btnExpandIcon.style.transform = "scale(-1,1)";
					btnExpand.parentElement.classList.replace("right-7", "ml-7");
					btnExpandText.after(btnExpandIcon);
				}

				if (btnCollapse) {
					btnCollapse.classList.add("absolute", "right-0");
					btnCollapse.querySelector("svg").style.transform = "scale(-1, 1)";
				}

				storage.local.set({
					direction: "right",
				});
			} else {
				main.after(chat);

				if (btnExpand) {
					btnExpandIcon.style.transform = "scale(1, 1)";
					btnExpand.parentElement.classList.replace("ml-7", "right-7");
					btnExpandText.before(btnExpandIcon);
				}

				if (btnCollapse) {
					btnCollapse.classList.remove("absolute", "right-0");
					btnCollapse.querySelector("svg").style.transform = "scale(1,1)";
				}

				storage.local.set({
					direction: "left",
				});
			}
		});

		messages.scrollTop = scrollPosition;
	}
}

function init() {
	let currentUsername = null;
	let currentChatroomParent = null;
	let currentPlayerChildren = null;

	const observer = new MutationObserver(() => {
		const usernameElement = document.getElementById("channel-username");
		const storage =
			typeof browser === "undefined" ? chrome.storage : browser.storage;

		if (usernameElement) {
			const username = usernameElement.innerText.trim();

			if (username !== currentUsername) {
				currentUsername = username;
				moveChat();
			}
		}

		const chat = document.getElementById("channel-chatroom");

		if (chat) {
			if (chat.parentElement !== currentChatroomParent) {
				// FIXME: Button disappears when going into a submenu
				// FIXME: Logout removes it
				// FIXME: Zooming removes buttons
				// FIXME: Multiple buttons rendering
				// FIXME: Chat replay
				// FIXME: Multiple tabs breaks sometimes (check side first)

				const chatSettingsList = document
					.getElementById("chat-settings-panel")
					.querySelector("ul");
				let chatSettingsListItem;

				const runtime =
					typeof browser === "undefined" ? chrome.runtime : browser.runtime;

				if (chatSettingsList) {
					chatSettingsListItem = chatSettingsList.firstChild.cloneNode(true);

					chatSettingsList
						.appendChild(chatSettingsListItem)
						.querySelector("span").innerText = "Move The Chat";

					let itemIcon = chatSettingsList.lastChild.querySelector("svg");
					let itemSVG = document.createElement("img");
					itemSVG.src = runtime.getURL("../icons/swap.svg");
					itemSVG.width = 16;
					itemSVG.height = 16;

					chatSettingsListItem.firstChild.replaceChild(itemSVG, itemIcon);
				}

				let topBar = chat.firstChild;
				let mtc = topBar.firstChild.cloneNode(true);
				mtc.firstChild.firstChild.remove();

				let svg = document.createElement("img");
				svg.src = runtime.getURL("../icons/swap.svg");
				svg.width = 20;
				svg.height = 20;

				mtc.firstChild.appendChild(svg);
				topBar.appendChild(mtc);

				currentChatroomParent = chat.parentElement;

				if (chatSettingsList) {
					chatSettingsListItem.addEventListener("click", moveChat);
				}
				mtc.addEventListener("click", moveChat);
				moveChat();
			}
		}

		// Stream change
		const userCard = document.getElementById("user-identity");

		if (userCard) {
			const chatWidth =
				getComputedStyle(userCard).getPropertyValue("--chat-width");
			const sidebar = document.getElementById("sidebar-wrapper");
			let sidebarWidth = 0;

			if (sidebar) {
				sidebarWidth = sidebar.offsetWidth;
			}

			storage.local.get("direction").then((res) => {
				if (res.direction === "left") {
					userCard.style.left = parseInt(chatWidth) + sidebarWidth + "px";
				} else {
					userCard.style.removeProperty("left");
				}
			});
		}

		// HOTFIX: More than 2 elements?
		// Theater mode
		const video = document.getElementById("video-player");
		const player = video.parentElement;
		if (player) {
			if (player.childElementCount !== currentPlayerChildren) {
				currentPlayerChildren = player.childElementCount;

				if (currentPlayerChildren > 1) {
					storage.local.get("direction").then((result) => {
						const direction = result.direction || "right";
						const controls = player.lastChild;

						if (direction === "right") {
							controls.classList.replace("left-0", "right-0");
						} else {
							controls.classList.replace("right-0", "left-0");
						}
					});
				}
			}
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	console.info("[Move The Chat]: Initialized");
}

init();
