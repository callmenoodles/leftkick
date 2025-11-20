function moveChat() {
	const chatroom = document.getElementById("channel-chatroom");
	const main = document.querySelector("main");
	const messages = document.getElementById("chatroom-messages");
	const scrollPosition = messages.scrollTop;

	// Chat is inside main on mobile layouts
	if (chatroom && main && !main.contains(chatroom)) {
		const btnExpand = main.querySelector("button");
		const btnExpandText = btnExpand.querySelector("span");
		const btnExpandIcon = btnExpand.querySelector("svg");
		const btnCollapse = chatroom.firstChild.querySelector("div");

		const storage =
			typeof browser === "undefined" ? chrome.storage : browser.storage;

		storage.local.get("hasMoved").then((res) => {
			if (res.hasMoved) {
				main.before(chatroom);

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
					hasMoved: false,
				});
			} else {
				main.after(chatroom);

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
					hasMoved: true,
				});
			}
		});

		messages.scrollTop = scrollPosition;
	}
}

function moveUserCard() {
	const userCard = document.getElementById("user-identity");

	if (userCard) {
		const chatWidth =
			getComputedStyle(userCard).getPropertyValue("--chat-width");
		const sidebar = document.getElementById("sidebar-wrapper");
		let sidebarWidth = 0;

		if (sidebar) {
			sidebarWidth = sidebar.offsetWidth;
		}

		const storage =
			typeof browser === "undefined" ? chrome.storage : browser.storage;

		storage.local.get("hasMoved").then((res) => {
			if (!res.hasMoved) {
				userCard.style.left = parseInt(chatWidth) + sidebarWidth + "px";
			} else {
				userCard.style.removeProperty("left");
			}
		});
	}
}

let currentUsername;

function moveOnStreamChange() {
	const usernameElement = document.getElementById("channel-username");

	if (usernameElement) {
		const username = usernameElement.innerText.trim();

		if (username !== currentUsername) {
			currentUsername = username;
			moveChat();
		}
	}
}

let currentPlayerChildren;

// HOTFIX: More than 2 elements?
// Theater mode
function moveVideoPlayer() {
	const video = document.getElementById("video-player");
	const player = video.parentElement;
	if (player) {
		if (player.childElementCount !== currentPlayerChildren) {
			currentPlayerChildren = player.childElementCount;
			const storage =
				typeof browser === "undefined" ? chrome.storage : browser.storage;

			if (currentPlayerChildren > 1) {
				storage.local.get("hasMoved").then((result) => {
					const hasMoved = result.hasMoved ?? false;
					const controls = player.lastChild;

					if (!hasMoved) {
						controls.classList.replace("left-0", "right-0");
					} else {
						controls.classList.replace("right-0", "left-0");
					}
				});
			}
		}
	}
}

let currentChatroomParent;

// FIXME: Button disappears when going into a submenu
// FIXME: Logout removes it
// FIXME: Zooming removes buttons
// FIXME: Multiple buttons rendering
// FIXME: Chat replay
// FIXME: Multiple tabs breaks sometimes (check )
// FIXME: Settings not vailable error in console
// FIXME: Chat moves every refresh but should stay oin one side
function injectButton() {
	const chat = document.getElementById("channel-chatroom");

	if (chat) {
		if (chat.parentElement !== currentChatroomParent) {
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
}

function init() {
	const observer = new MutationObserver(() => {
		injectButton();
		moveOnStreamChange(); // useless?
		moveUserCard();
		moveVideoPlayer();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	console.info("[Move The Chat]: Initialized");
}

init();
