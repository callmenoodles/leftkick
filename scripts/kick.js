(() => {
	const storage =
		typeof browser === "undefined" ? chrome.storage : browser.storage;
	const runtime =
		typeof browser === "undefined" ? chrome.runtime : browser.runtime;

	var hasMovedLeft;

	function moveChat(toLeft) {
		const chatroom = document.getElementById("channel-chatroom");
		const main = document.getElementsByTagName("main")[0];

		// Chat is inside main on mobile layouts
		if (chatroom && main && !main.contains(chatroom)) {
			const btnExpand = main.querySelector("button");
			const btnExpandText = btnExpand.querySelector("span");
			const btnExpandIcon = btnExpand.querySelector("svg");
			const btnCollapse = chatroom.firstChild.querySelector("div");

			if (!toLeft) {
				main.before(chatroom);

				if (btnExpand && btnExpandIcon && btnExpandText) {
					btnExpandIcon.style.transform = "scale(-1,1)";
					btnExpand.parentElement.classList.replace("right-7", "ml-7");
					btnExpandText.after(btnExpandIcon);
				}

				if (btnCollapse) {
					btnCollapse.classList.add("absolute", "right-0");
					btnCollapse.querySelector("svg").style.transform = "scale(-1, 1)";
				}

				hasMovedLeft = false;

				moveVideoPlayer();
				moveIdentity();

				storage.local.set({
					hasMovedLeft: false,
				});
			} else {
				main.after(chatroom);

				if (btnExpand && btnExpandIcon && btnExpandText) {
					btnExpandIcon.style.transform = "scale(1, 1)";
					btnExpand.parentElement.classList.replace("ml-7", "right-7");
					btnExpandText.before(btnExpandIcon);
				}

				if (btnCollapse) {
					btnCollapse.classList.remove("absolute", "right-0");
					btnCollapse.querySelector("svg").style.transform = "scale(1,1)";
				}

				hasMovedLeft = true;

				moveVideoPlayer();
				moveIdentity();

				storage.local.set({
					hasMovedLeft: true,
				});
			}

			const messages = document.getElementById("chatroom-messages");

			if (messages) {
				messages.scrollTop = messages.scrollHeight;
			}
		}
	}

	function injectSettingsButton() {
		const chatSettingsPanel = document.getElementById("chat-settings-panel");
		const chatSettingsList = chatSettingsPanel.querySelector("ul");
		let chatSettingsListItem;

		if (chatSettingsList) {
			if (chatSettingsList) {
				chatSettingsListItem = chatSettingsList.firstChild.cloneNode(true);
				chatSettingsListItem.setAttribute("id", "mtc-btn-settings");
				chatSettingsList
					.appendChild(chatSettingsListItem)
					.querySelector("span").innerText = "Left Kick";

				let itemIcon = chatSettingsList.lastChild.querySelector("svg");
				let itemSVG = document.createElement("img");

				itemSVG.src = runtime.getURL("../icons/swap.svg");
				itemSVG.width = 16;
				itemSVG.height = 16;

				chatSettingsListItem.firstChild.replaceChild(itemSVG, itemIcon);
			}

			chatSettingsListItem.addEventListener("click", () => {
				moveChat(!hasMovedLeft);
			});
		}
	}

	// #chat-settings-panel doesn't seem to load at init
	function initSettingsButtonObserver() {
		const chatroomFooter = document.getElementById("chatroom-footer");

		const settingsObserver = new MutationObserver(() => {
			const chatSettingsPanel = document.getElementById("chat-settings-panel");
			const mtcSettingsButton = document.getElementById("mtc-btn-settings");

			if (chatSettingsPanel && !mtcSettingsButton) {
				injectSettingsButton();
			}
		});

		if (chatroomFooter) {
			settingsObserver.observe(chatroomFooter, {
				subtree: true,
				childList: true,
			});
		}
	}

	function injectTopBarButton() {
		const chatroom = document.getElementById("channel-chatroom");
		const mtcTopBarButton = document.getElementById("mtc-btn-topbar");

		if (!mtcTopBarButton) {
			let topBar = chatroom.firstChild;
			let btnMove = topBar.firstChild.cloneNode(true);
			btnMove.setAttribute("id", "mtc-btn-topbar");
			btnMove.firstChild.firstChild.remove();

			let btnSVG = document.createElement("img");
			btnSVG.src = runtime.getURL("../icons/swap.svg");
			btnSVG.width = 20;
			btnSVG.height = 20;

			btnMove.firstChild.appendChild(btnSVG);
			btnMove.addEventListener("click", () => {
				moveChat(!hasMovedLeft);
			});
			topBar.appendChild(btnMove);
		}
	}

	function initTopBarObserver() {
		const chatroom = document.getElementById("channel-chatroom");
		const chatroomTopBar = chatroom.firstChild;
		injectTopBarButton();

		const topBarObserver = new MutationObserver((entries) => {
			const mtcTopBarButton = document.getElementById("mtc-btn-topbar");

			if (!mtcTopBarButton) {
				injectTopBarButton();
			}
		});

		topBarObserver.observe(chatroomTopBar, {
			subtree: true,
			childList: true,
		});

		const groupMain =
			document.getElementsByClassName("group/main")[0].firstChild;

		const responsiveObserver = new MutationObserver(() => {
			injectTopBarButton();
		});

		responsiveObserver.observe(groupMain, {
			attributes: true,
			attributeFilter: ["data-viewport-state"],
			subtree: false,
		});
	}

	function moveVideoPlayer() {
		const player = document.getElementById("video-player");

		if (player && player.parentElement) {
			const controls =
				player.parentElement.getElementsByClassName("z-controls")[0];

			if (controls) {
				if (!hasMovedLeft) {
					controls.classList.replace("left-0", "right-0");
				} else {
					controls.classList.replace("right-0", "left-0");
				}
			}
		}
	}

	function initVideoPlayerObserver() {
		const videoPlayerObserver = new MutationObserver(moveVideoPlayer);
		const videoPlayerContainer = document.getElementById("video-player");

		if (videoPlayerContainer && videoPlayerContainer.parentElement) {
			videoPlayerObserver.observe(videoPlayerContainer.parentElement, {
				childList: true,
				subtree: false,
			});
		}
	}

	function moveIdentity() {
		const userIdentity = document.getElementById("user-identity");

		if (userIdentity) {
			const chatWidth =
				getComputedStyle(userIdentity).getPropertyValue("--chat-width");
			const sidebar = document.getElementById("sidebar-wrapper");
			let sidebarWidth = 0;

			if (sidebar) {
				sidebarWidth = sidebar.offsetWidth;
			}

			if (hasMovedLeft) {
				userIdentity.style.removeProperty("left");
			} else {
				userIdentity.style.left = parseInt(chatWidth) + sidebarWidth + "px";
			}
		}
	}

	function initIdentityObserver() {
		const streamContainer =
			document.getElementsByTagName("main")[0].parentElement;

		const userIdentityObserver = new MutationObserver(moveIdentity);

		if (streamContainer) {
			userIdentityObserver.observe(streamContainer, {
				childList: true,
				subtree: false,
			});
		}
	}

	var channelName;

	const streamObserver = new MutationObserver(() => {
		const channelElement = document.getElementById("channel-username");

		if (channelElement) {
			const newChannelName = channelElement.innerText;

			if (newChannelName !== channelName) {
				channelName = newChannelName;

				storage.local.get("hasMovedLeft").then((res) => {
					hasMovedLeft = res.hasMovedLeft ?? true;
					moveChat(res.hasMovedLeft);
				});

				initTopBarObserver();
				initSettingsButtonObserver();
				initVideoPlayerObserver();
				initIdentityObserver();

				console.info("[Left Kick]: Initialized");
			}
		}
	});

	streamObserver.observe(document.body, {
		subtree: true,
		characterData: true,
	});
})();
