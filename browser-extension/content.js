const HVAC_PATTERNS = [
  /no\s+(ac|a\/c|heat)/i,
  /not\s+(cooling|heating)/i,
  /ac\s+(stopped|quit|broken|freezing|leaking|blowing warm)/i,
  /furnace|boiler|heat pump|mini split|thermostat|hvac/i,
  /second opinion|replacement quote|repair quote/i
];

const COMPETITOR_PATTERNS = [
  /cool breeze/i,
  /four seasons/i,
  /petro/i,
  /universe/i,
  /apple air/i,
  /gold star/i
];

const AVOID_PATTERNS = [
  /no more company comments/i,
  /no spam/i,
  /don't spam/i,
  /not going to spam/i,
  /admin delete/i,
  /no businesses/i
];

const state = {
  detected: [],
  baseUrl: "http://localhost:3000"
};

chrome.storage.sync.get(["localsignalBaseUrl"], (items) => {
  if (items.localsignalBaseUrl) {
    state.baseUrl = items.localsignalBaseUrl.replace(/\/$/, "");
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "LOCALSIGNAL_SCAN") {
    scanVisiblePosts();
    sendResponse({ count: state.detected.length });
  }

  if (message.type === "LOCALSIGNAL_IMPORT_SELECTED") {
    importSelectedPosts().then(sendResponse);
    return true;
  }

  if (message.type === "LOCALSIGNAL_GET_STATUS") {
    sendResponse({ count: state.detected.length, baseUrl: state.baseUrl });
  }

  return false;
});

function scanVisiblePosts() {
  clearExistingBadges();
  const candidates = getPostCandidates();
  state.detected = [];

  candidates.forEach((node, index) => {
    const text = normalizeText(node.innerText || "");
    const classification = classifyPost(text);

    if (!classification) {
      return;
    }

    const id = `localsignal-${Date.now()}-${index}`;
    node.dataset.localsignalId = id;
    node.classList.add("localsignal-post-wrap");
    state.detected.push({ id, node, text, classification });
    addBadge(node, classification);
  });

  renderToolbar();
}

function getPostCandidates() {
  const articleNodes = [...document.querySelectorAll('[role="article"]')];
  const feedNodes = [...document.querySelectorAll('[data-ad-preview="message"]')];
  return [...new Set([...articleNodes, ...feedNodes])]
    .filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && (node.innerText || "").length > 40;
    })
    .slice(0, 25);
}

function classifyPost(text) {
  const isLead = HVAC_PATTERNS.some((pattern) => pattern.test(text));
  const competitor = COMPETITOR_PATTERNS.some((pattern) => pattern.test(text));
  const avoid = AVOID_PATTERNS.some((pattern) => pattern.test(text));

  if (!isLead && !competitor && !avoid) {
    return null;
  }

  if (avoid) {
    return {
      label: "🚫 Avoid — promo-sensitive",
      className: "localsignal-badge-avoid",
      selected: false
    };
  }

  if (competitor) {
    return {
      label: "⚠️ Competitor mentioned",
      className: "localsignal-badge-warm",
      selected: true
    };
  }

  if (/today|tonight|asap|emergency|no ac|no heat|not cooling|not heating/i.test(text)) {
    return {
      label: "🔥 Hot HVAC lead",
      className: "localsignal-badge-hot",
      selected: true
    };
  }

  return {
    label: "💬 Reply recommended",
    className: "localsignal-badge-dm",
    selected: true
  };
}

function addBadge(node, classification) {
  const wrapper = document.createElement("div");
  wrapper.className = `localsignal-badge ${classification.className}`;
  wrapper.dataset.localsignalBadge = "true";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = classification.selected;
  checkbox.className = "localsignal-checkbox";
  checkbox.addEventListener("change", () => {
    const detected = state.detected.find((item) => item.node === node);
    if (detected) {
      detected.classification.selected = checkbox.checked;
    }
  });

  const label = document.createElement("span");
  label.textContent = classification.label;
  wrapper.append(checkbox, label);
  node.prepend(wrapper);
}

function renderToolbar() {
  document.querySelector("[data-localsignal-toolbar]")?.remove();

  if (!state.detected.length) {
    return;
  }

  const toolbar = document.createElement("div");
  toolbar.className = "localsignal-toolbar";
  toolbar.dataset.localsignalToolbar = "true";

  const count = document.createElement("span");
  count.textContent = `${state.detected.length} detected`;

  const review = document.createElement("button");
  review.textContent = `Review detected posts`;
  review.addEventListener("click", () => {
    importSelectedPosts();
  });

  const clear = document.createElement("button");
  clear.textContent = "Clear";
  clear.className = "secondary";
  clear.addEventListener("click", clearExistingBadges);

  toolbar.append(count, review, clear);
  document.body.append(toolbar);
}

async function importSelectedPosts() {
  const selected = state.detected.filter((item) => item.classification.selected);

  if (!selected.length) {
    return { ok: false, message: "No selected LocalSignal posts." };
  }

  const results = [];

  for (const item of selected) {
    const payload = {
      source: "facebook_browser_assist",
      groupName: getGroupName(),
      groupUrl: location.href,
      postUrl: findPostUrl(item.node) || location.href,
      posterName: findPosterName(item.node),
      postText: item.text,
      visibleComments: findVisibleComments(item.node),
      importedByTeamMemberId: null,
      clientId: null
    };

    const response = await fetch(`${state.baseUrl}/api/browser-import/facebook`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    results.push({ status: response.status, body: await response.json().catch(() => null) });
  }

  window.open(`${state.baseUrl}/browser-assist`, "_blank", "noopener,noreferrer");
  return { ok: true, count: results.length, results };
}

function clearExistingBadges() {
  document.querySelectorAll("[data-localsignal-badge]").forEach((node) => node.remove());
  document.querySelector("[data-localsignal-toolbar]")?.remove();
  document.querySelectorAll(".localsignal-post-wrap").forEach((node) => {
    node.classList.remove("localsignal-post-wrap");
    delete node.dataset.localsignalId;
  });
  state.detected = [];
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getGroupName() {
  const title = document.querySelector("h1")?.innerText;
  return normalizeText(title || document.title || "Facebook group");
}

function findPostUrl(node) {
  const link = [...node.querySelectorAll("a")]
    .map((anchor) => anchor.href)
    .find((href) => /\/posts\/|story_fbid|permalink/.test(href));
  return link || null;
}

function findPosterName(node) {
  const strong = node.querySelector("strong")?.innerText;
  return strong ? normalizeText(strong) : null;
}

function findVisibleComments(node) {
  return [...node.querySelectorAll('[role="article"], [dir="auto"]')]
    .map((comment) => normalizeText(comment.innerText || ""))
    .filter((text) => text.length > 20 && text.length < 600)
    .slice(0, 8);
}
