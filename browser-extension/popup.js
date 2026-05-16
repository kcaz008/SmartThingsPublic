const DEFAULT_API_BASE = "http://localhost:3000";
const scanButton = document.getElementById("scanButton");
const apiBaseInput = document.getElementById("apiBase");
const statusEl = document.getElementById("status");
const cardsEl = document.getElementById("cards");

let cards = [];

chrome.storage.sync.get(["localsignalApiBase"], (stored) => {
  apiBaseInput.value = stored.localsignalApiBase || DEFAULT_API_BASE;
});

apiBaseInput.addEventListener("change", () => {
  chrome.storage.sync.set({
    localsignalApiBase: apiBaseInput.value.trim() || DEFAULT_API_BASE,
  });
});

scanButton.addEventListener("click", async () => {
  setStatus("Scanning visible posts on the current page...");
  cardsEl.innerHTML = "";
  scanButton.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id || !isFacebookPage(tab.url)) {
      throw new Error("Open a Facebook group page before scanning.");
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractVisibleFacebookPosts,
    });

    if (!result.posts.length) {
      throw new Error("No visible post text was found on this page.");
    }

    const response = await fetch(
      `${normalizeApiBase(apiBaseInput.value)}/api/extension/scan`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_name: result.source_name,
          source_type: "facebook_group",
          page_url: tab.url,
          posts: result.posts,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("LocalSignal could not analyze this page.");
    }

    const payload = await response.json();
    cards = payload.cards || [];
    renderCards();
    await logAuditEvent("scan_completed", "Visible page scan completed", {
      page_url: tab.url,
      scanned_post_count: payload.scanned_post_count,
      opportunity_count: payload.opportunity_count,
      source_name: payload.source_name,
      visible_page_only: true,
      automatic_posting: false,
    });
    setStatus(
      `Scanned ${payload.scanned_post_count} visible posts. Found ${payload.opportunity_count} HVAC opportunities. No posting was performed.`,
    );
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to scan page.");
  } finally {
    scanButton.disabled = false;
  }
});

cardsEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const cardId = button.dataset.cardId;
  const action = button.dataset.action;
  const card = cards.find((candidate) => candidate.id === cardId);

  if (!card) {
    return;
  }

  if (action === "copy") {
    await navigator.clipboard.writeText(card.suggested_reply);
    await logAuditEvent("reply_copied", "Suggested reply copied manually", {
      card_id: card.id,
      source_name: card.group_source_name,
      service_type: card.service_type,
      automatic_posting: false,
    });
    setStatus("Reply copied. Paste it manually if you choose to respond.");
    return;
  }

  card.status = action;
  await logAuditEvent(`marked_${action}`, `Opportunity marked ${action}`, {
    card_id: card.id,
    source_name: card.group_source_name,
    service_type: card.service_type,
    automatic_posting: false,
  });

  if (action === "booked" || action === "won") {
    await createCrmFollowup(card, action);
  }

  renderCards();
  setStatus(`Marked opportunity as ${action}. No Facebook action was taken.`);
});

function renderCards() {
  if (!cards.length) {
    cardsEl.innerHTML =
      '<div class="empty">No relevant HVAC opportunities found in the visible posts.</div>';
    return;
  }

  cardsEl.innerHTML = cards.map(renderCard).join("");
}

function renderCard(card) {
  return `
    <article class="card">
      <div class="card-header">
        <div>
          <h2>${escapeHtml(card.service_type)}</h2>
          <p class="meta">${escapeHtml(card.group_source_name)} · ${escapeHtml(card.town)} · ${escapeHtml(card.urgency)} urgency</p>
        </div>
        <span class="badge">${card.lead_score}</span>
      </div>
      <p class="post">${escapeHtml(card.original_post_text)}</p>
      <p class="reply">${escapeHtml(card.suggested_reply)}</p>
      <p class="meta">Status: ${escapeHtml(card.status)}</p>
      <div class="actions">
        <button type="button" data-action="copy" data-card-id="${card.id}">Copy Reply</button>
        <button type="button" data-action="ignored" data-card-id="${card.id}">Mark Ignored</button>
        <button type="button" data-action="replied" data-card-id="${card.id}">Mark Replied</button>
        <button type="button" data-action="booked" data-card-id="${card.id}">Mark Booked</button>
        <button type="button" data-action="won" data-card-id="${card.id}">Mark Won</button>
      </div>
    </article>
  `;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function normalizeApiBase(value) {
  return (value || DEFAULT_API_BASE).replace(/\/+$/, "");
}

async function logAuditEvent(eventType, eventSummary, metadata) {
  await fetch(`${normalizeApiBase(apiBaseInput.value)}/api/audit-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      event_summary: eventSummary,
      metadata,
    }),
  }).catch(() => undefined);
}

async function createCrmFollowup(card, outcome) {
  await fetch(`${normalizeApiBase(apiBaseInput.value)}/api/crm/followups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: "crm",
      summary: `Follow up on ${outcome} LocalSignal lead from ${card.group_source_name}: ${card.service_type} in ${card.town}.`,
      completed: false,
    }),
  }).catch(() => undefined);
}

function isFacebookPage(url) {
  return /^https:\/\/(www\.)?facebook\.com\//.test(url || "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extractVisibleFacebookPosts() {
  const articleCandidates = Array.from(
    document.querySelectorAll('[role="article"], article, div[data-pagelet*="FeedUnit"]'),
  );
  const fallbackCandidates = articleCandidates.length
    ? articleCandidates
    : Array.from(document.querySelectorAll('[data-ad-comet-preview="message"]'));
  const posts = [];
  const seen = new Set();

  for (const element of fallbackCandidates) {
    if (!isVisibleInViewport(element)) {
      continue;
    }

    const text = normalizeVisibleText(element.innerText || element.textContent || "");

    if (text.length < 40 || seen.has(text)) {
      continue;
    }

    seen.add(text);
    posts.push({
      original_text: text,
      post_url: findPostUrl(element),
      author_name: findAuthorName(element),
    });
  }

  return {
    source_name: inferSourceName(),
    page_url: window.location.href,
    posts: posts.slice(0, 25),
  };

  function isVisibleInViewport(element) {
    const rect = element.getBoundingClientRect();

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight
    );
  }

  function normalizeVisibleText(value) {
    return value
      .replace(/\b(Like|Comment|Share|Send|View more comments|See more)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function inferSourceName() {
    const heading = document.querySelector("h1");
    const title = heading?.innerText || document.title || "Current Facebook group";

    return title.replace(/\s*\|?\s*Facebook\s*$/i, "").trim();
  }

  function findPostUrl(element) {
    const links = Array.from(element.querySelectorAll("a[href]"));
    const permalink = links.find((link) =>
      /\/posts\/|story_fbid|permalink/.test(link.getAttribute("href") || ""),
    );
    const href = permalink?.getAttribute("href");

    if (!href) {
      return undefined;
    }

    return new URL(href, window.location.origin).href;
  }

  function findAuthorName(element) {
    const strong = element.querySelector("strong");
    const label = strong?.innerText || strong?.textContent;

    return label?.trim() || undefined;
  }
}
