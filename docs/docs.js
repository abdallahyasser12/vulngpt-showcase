(() => {
  const search = document.querySelector("#doc-search");
  const chips = [...document.querySelectorAll(".filter-chip")];
  const cards = [...document.querySelectorAll(".doc-card")];
  const count = document.querySelector("#result-count");
  const clear = document.querySelector("#clear-search");
  const empty = document.querySelector("#empty-state");
  const emptyReset = document.querySelector("#empty-reset");
  if (!search || !chips.length || !cards.length || !count || !clear || !empty) return;

  let activeFilter = "all";
  const normalize = (value) => value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();

  function applyFilters() {
    const query = normalize(search.value);
    let visible = 0;
    for (const card of cards) {
      const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
      const haystack = normalize([card.textContent, card.dataset.search || ""].join(" "));
      const show = categoryMatches && (!query || haystack.includes(query));
      card.hidden = !show;
      if (show) visible += 1;
    }
    count.textContent = "Showing " + visible + " of " + cards.length + " documents";
    clear.hidden = !query && activeFilter === "all";
    empty.hidden = visible !== 0;
  }

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter || "all";
      for (const other of chips) {
        const selected = other === chip;
        other.classList.toggle("is-active", selected);
        other.setAttribute("aria-pressed", String(selected));
      }
      applyFilters();
    });
  }

  search.addEventListener("input", applyFilters);
  clear.addEventListener("click", () => {
    search.value = "";
    activeFilter = "all";
    chips.forEach((chip) => {
      const selected = chip.dataset.filter === "all";
      chip.classList.toggle("is-active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    applyFilters();
    search.focus();
  });
  emptyReset?.addEventListener("click", () => clear.click());
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === "Escape" && document.activeElement === search) {
      search.value = "";
      applyFilters();
      search.blur();
    }
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  count.textContent = "Showing all " + cards.length + " documents";
})();
