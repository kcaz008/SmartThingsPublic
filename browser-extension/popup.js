const baseUrlInput = document.getElementById("baseUrl");
const statusText = document.getElementById("status");

chrome.storage.sync.get(["localsignalBaseUrl"], (items) => {
  baseUrlInput.value = items.localsignalBaseUrl || "http://localhost:3000";
});

document.getElementById("saveUrl").addEventListener("click", () => {
  const value = baseUrlInput.value.replace(/\/$/, "");
  chrome.storage.sync.set({ localsignalBaseUrl: value }, () => {
    statusText.textContent = "LocalSignal URL saved.";
  });
});

document.getElementById("scan").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: "LOCALSIGNAL_SCAN" }, (response) => {
    statusText.textContent = `${response?.count || 0} visible lead-like posts highlighted.`;
  });
});

document.getElementById("guidedScan").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  statusText.textContent = "Guided scan running...";
  chrome.tabs.sendMessage(
    tab.id,
    { type: "LOCALSIGNAL_GUIDED_SCAN", screens: 5 },
    (response) => {
      statusText.textContent = `${response?.count || 0} lead-like posts found after guided scan.`;
    },
  );
});

document.getElementById("import").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(
    tab.id,
    { type: "LOCALSIGNAL_IMPORT_SELECTED" },
    (response) => {
      statusText.textContent = response?.ok
        ? `Imported ${response.count} selected post(s) for LocalSignal review.`
        : response?.message || "Nothing imported.";
    },
  );
});

document.getElementById("importAll").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(
    tab.id,
    { type: "LOCALSIGNAL_IMPORT_ALL" },
    (response) => {
      statusText.textContent = response?.ok
        ? `Imported ${response.count} detected post(s) for review.`
        : response?.message || "Nothing imported.";
    },
  );
});
