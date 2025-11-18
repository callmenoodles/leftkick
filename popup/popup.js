const storage =
  typeof browser === "undefined" ? chrome.storage : browser.storage;

storage.local.get("direction").then((res) => {
  const direction = res.direction || "right";
  const radioButton = document.getElementById(direction);
  radioButton.checked = true;
});

document.querySelectorAll('input[name="direction"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    if (radio.checked) {
      const value = radio.value;

      storage.local.set({
        direction: value,
      });

      const tabs =
        typeof browser === "undefined" ? chrome.tabs : browser.tabs;

      tabs
        .query({
          active: true,
          currentWindow: true,
        })
        .then((resTabs) => {
          tabs
            .sendMessage(resTabs[0].id, {
              action: "changeDirection",
              position: value,
            })
            .catch((error) => {
              console.error(
                "[Move The Chat]: Error sending data to tab:",
                error,
              );
            });
        });
    }
  });
});