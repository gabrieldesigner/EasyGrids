const openMenuButton = document.getElementById("open-menu-button");
const closeMenuButton = document.getElementById("close-menu-button");
const menuContainer = document.getElementById("menu-container");
const menuOpacity = document.getElementById("menu-opacity");
const menuSettings = document.getElementById("menu-settings");

const switchThemeColor = document.getElementById("switch-theme-color");
const switchAdminBar = document.getElementById("switch-wpadmin-bar");

openMenuButton.addEventListener("click", () => {
  menuContainer.classList.remove("hidden");
  menuSettings.classList.add("fade-in");
});

closeMenuButton.addEventListener("click", () => {
  menuSettings.classList.add("fade-out");
  setTimeout(() => {
    menuContainer.classList.add("hidden");
    menuSettings.classList.remove("fade-in", "fade-out");
  }, 500);
});

menuOpacity.addEventListener("click", () => {
  menuSettings.classList.add("fade-out");
  setTimeout(() => {
    menuContainer.classList.add("hidden");
    menuSettings.classList.remove("fade-in", "fade-out");
  }, 500);
});

switchThemeColor.addEventListener("change", () => {
  const darkModeEnabled = switchThemeColor.checked;
  const isChecked = switchThemeColor.checked;

  document.documentElement.classList.toggle("dark", darkModeEnabled);

  chrome.storage.sync.set({
    darkMode: darkModeEnabled,
    isThemeChecked: isChecked,
  });
});

chrome.storage.sync.get(
  ["darkMode", "isThemeChecked"],
  (result) => {
    if (result.darkMode) {
      document.documentElement.classList.add("dark");
    }

    if (result.isThemeChecked) {
      switchThemeColor.checked = true;
    }
  }
);
