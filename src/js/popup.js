document.addEventListener("DOMContentLoaded", () => {
  const inputs = {
    gridColor: document.getElementById("grid-color-input"),
    zIndex: document.getElementById("z-index-input"),
    columns: document.getElementById("columns-input"),
    maxWidth: document.getElementById("max-width-input"),
    offset: document.getElementById("offset-input"),
    gutter: document.getElementById("gutter-input"),
  };

  const rangeInputs = {
    maxWidth: document.getElementById("max-width-range-input"),
    offset: document.getElementById("offset-range-input"),
    gutter: document.getElementById("gutter-range-input"),
  };

  const maxAttributes = {
    maxWidth: Number(rangeInputs.maxWidth.getAttribute("max")),
    offset: Number(rangeInputs.offset.getAttribute("max")),
    gutter: Number(rangeInputs.gutter.getAttribute("max")),
  };

  const availabilityText = document.querySelector(".availability-text");
  const availabilityContent = document.querySelector(".availability-content");

  function initColorPicker() {
    chrome.storage.sync.get(["initialValues"], (result) => {
      const initialValues = result.initialValues || DEFAULT_SETTINGS;
  
      const pickr = Pickr.create({
        el: ".color-picker",
        theme: "monolith",
        default: initialValues.gridColor,
        swatches: [
          "rgba(129, 78, 250, 0.38)",
          "rgba(243, 186, 253, 0.44)",
          "rgba(67, 205, 128, 0.38)",
          "rgba(255, 123, 87, 0.44)",
          "rgba(43, 183, 255, 0.38)",
          "rgba(170, 145, 232, 0.44)",
          "rgba(255, 192, 203, 0.38)",
        ],
  
        components: {
          // Main components
          preview: true,
          opacity: true,
          hue: true,
  
          // Input / output Options
          interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            hsva: true,
            cmyk: true,
            input: true,
            clear: false,
            save: false,
          },
        },
      });
  
      const pickrButton = document.querySelector(".pcr-button");
      let updatingColorInput = false;
  
      pickr.on("change", (color) => {
        const hexValue = color.toHEXA().toString();
        updateColorInput(hexValue);
        updatePickrButtonColor(hexValue);
      });
  
      function updateColorInput(hexValue) {
        if (!updatingColorInput) {
          updatingColorInput = true;
  
          if (inputs.gridColor.value !== hexValue) {
            inputs.gridColor.value = hexValue;
            pickr.setColor(hexValue);
  
            const event = new Event("input");
            inputs.gridColor.dispatchEvent(event);
          }
  
          updatingColorInput = false;
        }
      }
  
      inputs.gridColor.addEventListener("input", () => {
        const hexValue = inputs.gridColor.value;
        pickr.setColor(hexValue);
      });
  
      if (pickrButton) {
        const hexValue = inputs.gridColor.value;
        pickrButton.style.setProperty("--pcr-color", hexValue);
      }
    });
  }
  
  initColorPicker();

  function updatePickrButtonColor(hexValue) {
    const pickrButton = document.querySelector(".pcr-button");
    if (pickrButton) {
      setTimeout(() => {
        pickrButton.style.setProperty("--pcr-color", hexValue);
      }, 10);
    }
  }

  function sendValuesToBackground() {
    const inputValues = {
      gridColor: inputs.gridColor.value,
      zIndex: Number(inputs.zIndex.value),
      columns: Number(inputs.columns.value),
      maxWidth: Number(inputs.maxWidth.value),
      offset: Number(inputs.offset.value),
      gutter: Number(inputs.gutter.value),
    };

    // Tem erro de conexão nesse try catch, mas é irrelevante pro funcionamento da extensão.
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      try {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            inputValues: inputValues,
          },
          function (response) {
            if (chrome.runtime.lastError) {
            } else {
            }
          }
        );
      } catch (error) {}
    });
  }

  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", sendValuesToBackground);
  });

  function saveValues() {
    const inputValues = {
      gridColor: inputs.gridColor.value,
      zIndex: inputs.zIndex.value,
      columns: inputs.columns.value,
      maxWidth: inputs.maxWidth.value,
      offset: inputs.offset.value,
      gutter: inputs.gutter.value,
    };

    chrome.storage.sync.set({ inputValues });
  }

  let timeout;

  function debounce(callback, delay) {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  }

  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => {
      debounce(() => {
        saveValues();
      }, 250);
    });
  });
  function initializeInputs() {
    chrome.storage.sync.get(["initialValues", "inputValues"], (result) => {
      const storedValues = result.inputValues || {};
      const initialValues = result.initialValues || DEFAULT_SETTINGS;
  
      inputs.gridColor.value =
        storedValues.gridColor || initialValues.gridColor;
      inputs.zIndex.value = storedValues.zIndex || initialValues.zIndex;
      inputs.columns.value = storedValues.columns || initialValues.columns;
      inputs.maxWidth.value =
        storedValues.maxWidth || initialValues.maxWidth;
      inputs.offset.value = storedValues.offset || initialValues.offset;
      inputs.gutter.value = storedValues.gutter || initialValues.gutter;
  
      updatePickrButtonColor(
        storedValues.gridColor || initialValues.gridColor
      );
  
      rangeInputs.maxWidth.value =
        storedValues.maxWidth || initialValues.maxWidth;
      rangeInputs.offset.value = storedValues.offset || initialValues.offset;
      rangeInputs.gutter.value = storedValues.gutter || initialValues.gutter;
  
      updateMaxWidthSlider(rangeInputs.maxWidth.value);
      updateOffsetSlider(rangeInputs.offset.value);
      updateGutterSlider(rangeInputs.gutter.value);
    });
  }
  
  initializeInputs();
  

  const observer = new MutationObserver(() => {
    updateMaxWidthSlider(rangeInputs.maxWidth.value);
    updateOffsetSlider(rangeInputs.offset.value);
    updateGutterSlider(rangeInputs.gutter.value);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  function updateMaxWidthSlider(value) {
    const progress = (value / rangeInputs.maxWidth.max) * 100;
    const isDarkMode = document.documentElement.classList.contains("dark");

    if (isDarkMode) {
      rangeInputs.maxWidth.style.background = `linear-gradient(to right, #814EFA ${progress}%, #18181B ${progress}%)`;
    } else {
      rangeInputs.maxWidth.style.background = `linear-gradient(to right, #814EFA ${progress}%, #E4E4E7 ${progress}%)`;
    }
    inputs.maxWidth.value = value;
  }

  function updateOffsetSlider(value) {
    const progress = (value / rangeInputs.offset.max) * 100;
    const isDarkMode = document.documentElement.classList.contains("dark");

    if (isDarkMode) {
      rangeInputs.offset.style.background = `linear-gradient(to right, #814EFA ${progress}%, #18181B ${progress}%)`;
    } else {
      rangeInputs.offset.style.background = `linear-gradient(to right, #814EFA ${progress}%, #E4E4E7 ${progress}%)`;
    }
    inputs.offset.value = value;
  }

  function updateGutterSlider(value) {
    const progress = (value / rangeInputs.gutter.max) * 100;
    const isDarkMode = document.documentElement.classList.contains("dark");

    if (isDarkMode) {
      rangeInputs.gutter.style.background = `linear-gradient(to right, #814EFA ${progress}%, #18181B ${progress}%)`;
    } else {
      rangeInputs.gutter.style.background = `linear-gradient(to right, #814EFA ${progress}%, #E4E4E7 ${progress}%)`;
    }
    inputs.gutter.value = value;
  }

  rangeInputs.maxWidth.addEventListener("input", () => {
    inputs.maxWidth.value = rangeInputs.maxWidth.value || 0;

    sendValuesToBackground();
    updateMaxWidthSlider(rangeInputs.maxWidth.value);
    debounce(() => {
      saveValues();
    }, 250);
  });

  inputs.maxWidth.addEventListener("input", () => {
    const newValue = inputs.maxWidth.value;

    rangeInputs.maxWidth.value = newValue || 0;

    updateMaxWidthSlider(newValue);
    sendValuesToBackground();
    debounce(() => {
      saveValues();
    }, 250);
  });

  rangeInputs.offset.addEventListener("input", () => {
    inputs.offset.value = rangeInputs.offset.value || 0;
    sendValuesToBackground();
    updateOffsetSlider(rangeInputs.offset.value);
    debounce(() => {
      saveValues();
    }, 250);
  });

  inputs.offset.addEventListener("input", () => {
    const newValue = inputs.offset.value;
    rangeInputs.offset.value = newValue || 0;
    updateOffsetSlider(newValue);
    sendValuesToBackground();
    debounce(() => {
      saveValues();
    }, 250);
  });

  rangeInputs.gutter.addEventListener("input", () => {
    inputs.gutter.value = rangeInputs.gutter.value || 0;

    sendValuesToBackground();
    updateGutterSlider(rangeInputs.gutter.value);
    debounce(() => {
      saveValues();
    }, 250);
  });

  inputs.gutter.addEventListener("input", () => {
    const newValue = inputs.gutter.value;

    rangeInputs.gutter.value = newValue || 0;

    updateGutterSlider(newValue);
    sendValuesToBackground();
    debounce(() => {
      saveValues();
    }, 250);
  });

  function limitValue(value, max) {
    if (value > max) {
      return max;
    }
    return value;
  }

  inputs.maxWidth.addEventListener("input", () => {
    inputs.maxWidth.value = limitValue(
      inputs.maxWidth.value,
      maxAttributes.maxWidth
    );
  });

  inputs.offset.addEventListener("input", () => {
    inputs.offset.value = limitValue(inputs.offset.value, maxAttributes.offset);
  });

  inputs.gutter.addEventListener("input", () => {
    inputs.gutter.value = limitValue(inputs.gutter.value, maxAttributes.gutter);
  });

  
  chrome.storage.sync.get(["hasPreview", "hasAction"], function (result) {
    const hasPreview = result.hasPreview;
    const hasAction = result.hasAction;

    if (hasAction) {
      availabilityText.innerText =
        "The Layout Grid functionality is available on Elementor editor page.";
      availabilityContent.classList.remove("bg-red-100", "before:bg-red-500");
      availabilityContent.classList.add(
        "bg-violet-100",
        "before:bg-violet-500"
      );
    }

    if (hasPreview) {
      availabilityText.innerText =
        "The Layout Grid functionality is available on Elementor preview page.";
      availabilityContent.classList.remove("bg-red-100", "before:bg-red-500");
      availabilityContent.classList.add(
        "bg-violet-100",
        "before:bg-violet-500"
      );
    }
  });

  function updateLayoutGridSwitch(isChecked) {
    switchLayoutGrid.checked = isChecked;
  }
  const switchLayoutGrid = document.getElementById("switch-layout-grid");

  switchLayoutGrid.addEventListener("change", () => {
    const isChecked = switchLayoutGrid.checked;

    chrome.storage.sync.set({
      isLayoutGridChecked: isChecked,
    });
  });

  chrome.storage.sync.get(["isLayoutGridChecked"], (result) => {
    const isChecked = result.isLayoutGridChecked || false;
    updateLayoutGridSwitch(isChecked);
  });

  chrome.commands.onCommand.addListener((command) => {
    if (command === "switchLayoutGrid") {
      chrome.storage.sync.get(["isLayoutGridChecked"], (result) => {
        const newValue = !result.isLayoutGridChecked;

        chrome.storage.sync.set({
          isLayoutGridChecked: newValue,
        });

        updateLayoutGridSwitch(newValue);
      });
    }
  });

});
