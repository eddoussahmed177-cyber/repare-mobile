(() => {
  const KEY = "repareMobile_cart";
  const read = () => {
    try {
      const rows = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(rows) ? rows.filter((row) => row && typeof row.brand === "string" && typeof row.model === "string" && typeof row.repairType === "string" && (row.price === null || Number.isFinite(Number(row.price))) && Number(row.quantity) > 0) : [];
    } catch { return []; }
  };
  const total = (rows) => rows.reduce((sum, row) => sum + (row.price === null ? 0 : Number(row.price) * Number(row.quantity)), 0);
  const priceText = (row) => row.price === null ? "Prix à confirmer par l’atelier" : `${Number(row.price) * Number(row.quantity)} DT estimés`;
  const save = (rows) => { localStorage.setItem(KEY, JSON.stringify(rows)); updateBadge(); render(); };
  const updateBadge = () => {
    const count = read().reduce((sum, row) => sum + Number(row.quantity), 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = String(count); node.setAttribute("aria-label", `${count} article${count > 1 ? "s" : ""} dans le panier`); });
  };
  const add = (item) => {
    const rows = read();
    const current = rows.find((row) => row.brand === item.brand && row.model === item.model && row.repairType === item.repairType);
    if (current) { current.quantity = Math.min(5, Number(current.quantity) + 1); if (current.price === null && item.price !== null) current.price = item.price; }
    else rows.push({ ...item, quantity: 1 });
    save(rows);
    const note = document.querySelector("#cart-feedback");
    if (note) { note.textContent = `${item.model} · ${item.repairType} ajouté au panier.`; note.hidden = false; }
  };
  const render = () => {
    const rows = read();
    const detail = document.querySelector("#checkout-cart-summary");
    if (detail && new URLSearchParams(location.search).get("panier") === "1") {
      detail.hidden = rows.length === 0; detail.replaceChildren();
      if (rows.length) {
        const title = document.createElement("strong"); title.textContent = "Votre sélection"; detail.append(title);
        rows.forEach((row) => { const line = document.createElement("p"); line.textContent = `${row.brand} ${row.model} · ${row.repairType} × ${row.quantity} — ${priceText(row)}`; detail.append(line); });
        const note = document.createElement("small");
        note.textContent = rows.some((row) => row.price === null) ? `Estimation partielle : ${total(rows)} DT pour les services tarifés. Les autres prix seront confirmés après diagnostic.` : `Total indicatif : ${total(rows)} DT. Le prix final sera confirmé par l’atelier après diagnostic.`;
        detail.append(note);
      }
    }
    const list = document.querySelector("#cart-items");
    if (!list) return;
    list.replaceChildren();
    const empty = document.querySelector("#cart-empty"), summary = document.querySelector("#cart-summary");
    empty.hidden = rows.length > 0; summary.hidden = rows.length === 0;
    rows.forEach((row, index) => {
      const item = document.createElement("article"); item.className = "cart-item";
      const info = document.createElement("div"); info.className = "cart-item-info";
      const title = document.createElement("h2"); title.textContent = `${row.brand} ${row.model}`;
      const type = document.createElement("p"); type.textContent = row.repairType;
      const price = document.createElement("strong"); price.textContent = priceText(row);
      info.append(title, type, price);
      const controls = document.createElement("div"); controls.className = "cart-controls";
      const minus = document.createElement("button"); minus.type = "button"; minus.className = "cart-quantity"; minus.textContent = "−"; minus.setAttribute("aria-label", "Retirer une unité");
      const qty = document.createElement("span"); qty.textContent = String(row.quantity);
      const plus = document.createElement("button"); plus.type = "button"; plus.className = "cart-quantity"; plus.textContent = "+"; plus.setAttribute("aria-label", "Ajouter une unité");
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "cart-remove"; remove.textContent = "Supprimer";
      minus.addEventListener("click", () => { const next = read(); if (next[index].quantity > 1) next[index].quantity--; else next.splice(index, 1); save(next); });
      plus.addEventListener("click", () => { const next = read(); next[index].quantity = Math.min(5, Number(next[index].quantity) + 1); save(next); });
      remove.addEventListener("click", () => { const next = read(); next.splice(index, 1); save(next); });
      controls.append(minus, qty, plus, remove); item.append(info, controls); list.append(item);
    });
    const amount = document.querySelector("#cart-total"), totalLabel = document.querySelector("#cart-total-label");
    if (amount) amount.textContent = rows.every((row) => row.price === null) ? "À confirmer" : rows.some((row) => row.price === null) ? `${total(rows)} DT + prix à confirmer` : `${total(rows)} DT`;
    if (totalLabel) totalLabel.textContent = rows.some((row) => row.price === null) ? "Estimation partielle" : "Total indicatif";
  };
  document.querySelectorAll(".cart-add").forEach((button) => button.addEventListener("click", () => add({ brand: button.dataset.brand, model: button.dataset.model, repairType: button.dataset.repair, price: button.dataset.price === "" ? null : Number(button.dataset.price) })));
  document.querySelector("#add-custom-repair")?.addEventListener("click", () => {
    const brandSelect = document.querySelector("#phone-brand"), modelSelect = document.querySelector("#phone-model"), repairSelect = document.querySelector("#repair-type");
    const customBrand = document.querySelector("#custom-brand"), customModel = document.querySelector("#custom-model"), feedback = document.querySelector("#cart-feedback");
    let brand = brandSelect?.value || "";
    if (brand === "Autre marque") brand = customBrand?.value.trim() || "";
    const selectedModel = modelSelect?.value || "";
    const model = selectedModel === "Autre modèle" ? (customModel?.value.trim() || "") : selectedModel;
    const repairType = repairSelect?.value || "";
    if (!brand || !model || !repairType) {
      if (feedback) { feedback.textContent = "Choisissez une marque, un modèle et le type de réparation avant l’ajout."; feedback.hidden = false; }
      return;
    }
    add({ brand, model, repairType, price: null });
  });
  document.querySelector("#cart-clear")?.addEventListener("click", () => save([]));
  if (new URLSearchParams(location.search).get("panier") === "1") {
    const rows = read();
    if (rows.length) {
      const first = rows[0], brand = document.querySelector("#phone-brand"), model = document.querySelector("#phone-model"), repair = document.querySelector("#repair-type");
      if (brand && model) {
        const customBrand = document.querySelector("#custom-brand"), customModel = document.querySelector("#custom-model");
        const knownBrand = [...brand.options].some((option) => option.value === first.brand);
        brand.value = knownBrand ? first.brand : "Autre marque"; brand.dispatchEvent(new Event("change", { bubbles: true }));
        if (!knownBrand && customBrand) customBrand.value = first.brand;
        if ([...model.options].some((option) => option.value === first.model)) model.value = first.model;
        else { model.value = "Autre modèle"; model.dispatchEvent(new Event("change", { bubbles: true })); if (customModel) customModel.value = first.model; }
      }
      if (repair) {
        let type = first.repairType;
        if (![...repair.options].some((option) => option.value === type)) {
          const lower = type.toLocaleLowerCase("fr");
          type = lower.includes("écran") ? "Écran cassé ou tactile" : lower.includes("batterie") ? "Batterie ou autonomie" : lower.includes("charge") || lower.includes("connecteur") ? "Connecteur ou problème de charge" : lower.includes("diagnostic") ? "Je ne sais pas, besoin d’un diagnostic" : "Caméra, son ou autre panne";
        }
        repair.value = type;
      }
    }
  }
  window.RepareCart = { read, clear: () => save([]), total };
  updateBadge(); render();
})();
