chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ startedUp: true });
});

const DEFAULT_SETTINGS = {
  gridColor: "#814EFA60",
  zIndex: 9999,
  columns: "12",
  maxWidth: "1280",
  offset: "0",
  gutter: "20",
};

chrome.storage.sync.set({ initialValues: DEFAULT_SETTINGS });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.inputValues) {

    sendResponse({ success: true });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command == "switchLayoutGrid") {

    chrome.storage.sync.get(["isLayoutGridChecked"], (result) => {

      const newValue = !result.isLayoutGridChecked;


      chrome.storage.sync.set({isLayoutGridChecked: newValue});
    });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if ("isLayoutGridChecked" in changes) {
    const isLayoutGridChecked = changes.isLayoutGridChecked.newValue || false;

    if (isLayoutGridChecked) {
      chrome.action.setIcon({ path: "../icons/icon16_enabled.png" });
    } else {
      chrome.action.setIcon({ path: "../icons/icon16_disabled.png" });
    }
  }
});

function checkURLParameters(url) {
  try {
    const urlObj = new URL(url);
    const previewParam = urlObj.searchParams.get("preview");
    const actionParam = urlObj.searchParams.get("action");

    const hasPreview = previewParam === "true";
    const hasAction = actionParam === "elementor";

    return {
      hasPreview,
      hasAction,
    };
  } catch (err) {
    //tem erro aqui, mas funciona e vida que segue
    return {
      hasPreview: false,
      hasAction: false,
    };
  }
}

chrome.tabs.onActivated.addListener(handleTabChange);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    handleTabChange();
  }
});

chrome.tabs.onCreated.addListener(handleTabChange);

function handleTabChange() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    if (currentTab) {
      const { hasPreview, hasAction } = checkURLParameters(currentTab.url);

      chrome.storage.sync.set(
        {
          hasPreview: hasPreview,
          hasAction: hasAction,
        },
      );
    }
  });
}
