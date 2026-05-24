(function () {
  const topics = window.SENIOR2026_TOPICS || [];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\+/g, " plus ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchesTopic(topic, query) {
    if (!query) return true;
    const haystack = normalize([
      topic.title,
      topic.category,
      topic.originalFileName,
      topic.finalFileName,
      topic.videoTitle,
      topic.tags.join(" "),
      topic.searchText,
    ].join(" "));
    return normalize(query)
      .split(" ")
      .filter(Boolean)
      .every((token) => haystack.includes(token));
  }

  function renderQuickResults(input, output) {
    const query = input.value.trim();
    output.innerHTML = "";
    if (!query) return;

    const results = topics.filter((topic) => matchesTopic(topic, query)).slice(0, 6);
    if (!results.length) {
      output.innerHTML = '<div class="quick-result" aria-live="polite">No matching topic yet<span>Try another keyword</span></div>';
      return;
    }

    output.innerHTML = results.map((topic) => `
      <a class="quick-result" href="${topic.wrapperPath}">
        ${topic.number}. ${topic.title}
        <span>${topic.category}</span>
      </a>
    `).join("");
  }

  function setupHomeSearch() {
    const input = document.querySelector("[data-home-search]");
    const output = document.querySelector("[data-quick-results]");
    if (!input || !output) return;
    input.addEventListener("input", () => renderQuickResults(input, output));
  }

  function setupTopicBrowser() {
    const input = document.querySelector("[data-topic-search]");
    const cards = Array.from(document.querySelectorAll("[data-topic-card]"));
    const empty = document.querySelector("[data-empty-state]");
    const count = document.querySelector("[data-result-count]");
    let activeCategory = "All";
    let activeSequence = "All";

    function applyFilters() {
      const query = input ? input.value : "";
      let visible = 0;

      cards.forEach((card) => {
        const categoryOk = activeCategory === "All" || card.dataset.category === activeCategory;
        const sequenceOk = activeSequence === "All" || card.dataset.sequence === activeSequence;
        const queryOk = normalize(card.dataset.search).includes(normalize(query)) ||
          topics.some((topic) => topic.id === card.dataset.topicId && matchesTopic(topic, query));
        const shouldShow = categoryOk && sequenceOk && queryOk;
        card.hidden = !shouldShow;
        if (shouldShow) visible += 1;
      });

      if (count) count.textContent = `${visible} topic${visible === 1 ? "" : "s"}`;
      if (empty) empty.classList.toggle("show", visible === 0);
    }

    document.querySelectorAll("[data-category-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.categoryFilter;
        document.querySelectorAll("[data-category-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });

    document.querySelectorAll("[data-sequence-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeSequence = button.dataset.sequenceFilter;
        document.querySelectorAll("[data-sequence-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });

    if (input) input.addEventListener("input", applyFilters);
    applyFilters();
  }

  function setupVideoBrowser() {
    const input = document.querySelector("[data-video-search]");
    const rows = Array.from(document.querySelectorAll("[data-video-row]"));
    const empty = document.querySelector("[data-empty-state]");
    const count = document.querySelector("[data-result-count]");

    function applyFilters() {
      const query = normalize(input ? input.value : "");
      let visible = 0;
      rows.forEach((row) => {
        const shouldShow = !query || normalize(row.dataset.search).includes(query);
        row.hidden = !shouldShow;
        if (shouldShow) visible += 1;
      });
      if (count) count.textContent = `${visible} video slot${visible === 1 ? "" : "s"}`;
      if (empty) empty.classList.toggle("show", visible === 0);
    }

    if (input) input.addEventListener("input", applyFilters);
    applyFilters();
  }

  setupHomeSearch();
  setupTopicBrowser();
  setupVideoBrowser();
})();
