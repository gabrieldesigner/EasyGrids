window.addEventListener("load", function () {
  let isPreview = false;
  let isEditor = false;
  let isLayoutGridChecked = false;
  let inputValues = {};

  function verifyUrlParams() {
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    isPreview = urlParams.has("preview") && urlParams.get("preview") === "true";

    isEditor =
      urlParams.has("action") && urlParams.get("action") === "elementor";

  }
  verifyUrlParams();

  function updatePreviewGrid() {
    if (isPreview && isLayoutGridChecked) {
      addPreviewGrid(inputValues);
    } else {
      removePreviewGrid();
    }
  }

  function updateEditorGrid() {
    if (isEditor && isLayoutGridChecked) {
      addEditorGrid(inputValues);
    } else {
      removeEditorGrid();
    }
  }

  function addPreviewGrid(inputValues) {
    const { gridColor, zIndex, columns, maxWidth, offset, gutter } =
      inputValues;
    const htmlElement = document.documentElement;

    if (htmlElement && isPreview) {
      htmlElement.style.position = "relative";

      let styleElement = document.querySelector(".grid-style");

      if (styleElement) {
        styleElement.textContent = `
          html::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin-right: auto;
            margin-left: auto;
            pointer-events: none;
            z-index: ${zIndex};
            min-height: 100vh;
            width: calc(100% - (2 * ${offset}px));
            max-width: ${maxWidth}px;
            background-size: calc(100% + ${gutter}px) 100%;
            background-image: repeating-linear-gradient(
              to right,
              ${gridColor},
              ${gridColor} calc((100% / ${columns}) - ${gutter}px),
              transparent calc((100% / ${columns}) - ${gutter}px),
              transparent calc(100% / ${columns})
            );
          }
        `;
      } else {
        styleElement = document.createElement("style");
        styleElement.classList.add("grid-style");
        styleElement.textContent = `
          html::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin-right: auto;
            margin-left: auto;
            pointer-events: none;
            z-index: ${zIndex};
            min-height: 100vh;
            width: calc(100% - (2 * ${offset}px));
            max-width: ${maxWidth}px;
            background-size: calc(100% + ${gutter}px) 100%;
            background-image: repeating-linear-gradient(
              to right,
              ${gridColor},
              ${gridColor} calc((100% / ${columns}) - ${gutter}px),
              transparent calc((100% / ${columns}) - ${gutter}px),
              transparent calc(100% / ${columns})
            );
          }
        `;

        document.head.appendChild(styleElement);
      }
    }
  }

  function addEditorGrid(inputValues) {
    const { gridColor, zIndex, columns, maxWidth, offset, gutter } =
      inputValues;
    const iframe = document.getElementById("elementor-preview-iframe");

    if (iframe && isEditor) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      if (doc) {
        doc.documentElement.style.position = "relative";
        let styleElement = doc.querySelector(".grid-style");

        if (styleElement) {
          styleElement.textContent = `
            html::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              margin-right: auto;
              margin-left: auto;
              pointer-events: none;
              z-index: ${zIndex};
              min-height: 100vh;
              width: calc(100% - (2 * ${offset}px));
              max-width: ${maxWidth}px;
              background-size: calc(100% + ${gutter}px) 100%;
              background-image: repeating-linear-gradient(
                to right,
                ${gridColor},
                ${gridColor} calc((100% / ${columns}) - ${gutter}px),
                transparent calc((100% / ${columns}) - ${gutter}px),
                transparent calc(100% / ${columns})
              );
            }
          `;
        } else {
          styleElement = doc.createElement("style");
          styleElement.classList.add("grid-style");
          styleElement.textContent = `
            html::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              margin-right: auto;
              margin-left: auto;
              pointer-events: none;
              z-index: ${zIndex};
              min-height: 100vh;
              width: calc(100% - (2 * ${offset}px));
              max-width: ${maxWidth}px;
              background-size: calc(100% + ${gutter}px) 100%;
              background-image: repeating-linear-gradient(
                to right,
                ${gridColor},
                ${gridColor} calc((100% / ${columns}) - ${gutter}px),
                transparent calc((100% / ${columns}) - ${gutter}px),
                transparent calc(100% / ${columns})
              );
            }
          `;

          doc.head.appendChild(styleElement);
        }
      }
    }
  }

  function removePreviewGrid() {
    const htmlElement = document.documentElement;

    if (htmlElement && isPreview) {
      htmlElement.style.position = "";

      const styleElements = document.querySelectorAll(".grid-style");
      styleElements.forEach((styleElement) => {
        styleElement.parentNode.removeChild(styleElement);
      });
    }
  }

  function removeEditorGrid() {
    const iframe = document.getElementById("elementor-preview-iframe");

    if (iframe && isEditor) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      if (doc) {
        doc.documentElement.style.position = "";

        const styleElements = doc.querySelectorAll(".grid-style");
        styleElements.forEach((styleElement) => {
          styleElement.parentNode.removeChild(styleElement);
        });
      }
    }
  }

  function handleStorage() {
    chrome.storage.sync.get(
      ["isLayoutGridChecked", "inputValues", "initialValues"],
      (result) => {
        isLayoutGridChecked = result.isLayoutGridChecked || false;
        inputValues = result.inputValues || result.initialValues || {};

        updatePreviewGrid();
        updateEditorGrid();
      }
    );
  }
  handleStorage();

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if ("isLayoutGridChecked" in changes) {
      isLayoutGridChecked = changes.isLayoutGridChecked.newValue || false;

      updatePreviewGrid();
      updateEditorGrid();
    }

    if ("inputValues" in changes) {
      inputValues = changes.inputValues.newValue || {};

      updatePreviewGrid();
      updateEditorGrid();
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (isLayoutGridChecked && request.inputValues) {
      addPreviewGrid(request.inputValues);
      addEditorGrid(request.inputValues);

      sendResponse({ success: true });
    }
  });

  function initWhenBodyAvailable() {
    const targetNode = document.body;

    if (targetNode && (isPreview || isEditor)) {
      const observer = new MutationObserver(callback);

      observer.observe(targetNode, { childList: true });
    } else {
      setTimeout(initWhenBodyAvailable, 100);
    }
  }

  initWhenBodyAvailable();

  function callback(mutationsList, observer) {
    observer.disconnect();

    updatePreviewGrid();
    updateEditorGrid();
  }
});
