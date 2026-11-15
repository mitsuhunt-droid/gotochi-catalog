
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("collection-grid");
  const search = document.getElementById("search");
  const prefectureFilter = document.getElementById("prefecture-filter");
  const itemFilter = document.getElementById("item-filter");
  const typeFilter = document.getElementById("type-filter");
  const clearButton = document.getElementById("clear-filters");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");
  const dialog = document.getElementById("item-dialog");
  const dialogContent = document.getElementById("dialog-content");
  const dialogClose = document.getElementById("dialog-close");

  let allItems = [];

  // PREFECTURE AND REGION INFORMATION

  const regions = {
    hokkaido: ["hokkaido"],
    tohoku: ["aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"],
    kanto: ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"],
    chubu: ["niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano", "gifu", "shizuoka", "aichi"],
    kansai: ["mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"],
    chugoku: ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi"],
    shikoku: ["tokushima", "kagawa", "ehime", "kochi"],
    kyushu: ["fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa"]
  };

  const prefectureNames = {
    hokkaido: "Hokkaidō",
    aomori: "Aomori",
    iwate: "Iwate",
    miyagi: "Miyagi",
    akita: "Akita",
    yamagata: "Yamagata",
    fukushima: "Fukushima",
    ibaraki: "Ibaraki",
    tochigi: "Tochigi",
    gunma: "Gunma",
    saitama: "Saitama",
    chiba: "Chiba",
    tokyo: "Tokyo",
    kanagawa: "Kanagawa",
    niigata: "Niigata",
    toyama: "Toyama",
    ishikawa: "Ishikawa",
    fukui: "Fukui",
    yamanashi: "Yamanashi",
    nagano: "Nagano",
    gifu: "Gifu",
    shizuoka: "Shizuoka",
    aichi: "Aichi",
    mie: "Mie",
    shiga: "Shiga",
    kyoto: "Kyoto",
    osaka: "Ōsaka",
    hyogo: "Hyōgo",
    nara: "Nara",
    wakayama: "Wakayama",
    tottori: "Tottori",
    shimane: "Shimane",
    okayama: "Okayama",
    hiroshima: "Hiroshima",
    yamaguchi: "Yamaguchi",
    tokushima: "Tokushima",
    kagawa: "Kagawa",
    ehime: "Ehime",
    kochi: "Kōchi",
    fukuoka: "Fukuoka",
    saga: "Saga",
    nagasaki: "Nagasaki",
    kumamoto: "Kumamoto",
    oita: "Ōita",
    miyazaki: "Miyazaki",
    kagoshima: "Kagoshima",
    okinawa: "Okinawa"
  };

  const regionNames = {
    hokkaido: "Hokkaidō",
    tohoku: "Tōhoku",
    kanto: "Kantō",
    chubu: "Chūbu",
    kansai: "Kansai",
    chugoku: "Chūgoku",
    shikoku: "Shikoku",
    kyushu: "Kyūshū & Okinawa"
  };

  function getRegion(prefecture) {
    for (const [region, prefectures] of Object.entries(regions)) {
      if (prefectures.includes(prefecture)) {
        return region;
      }
    }
    return "";
  }

  function capitalize(value) {
    return String(value || "")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  // POPULATE PREFECTURE FILTER

  function populatePrefectures(prefectures) {
    prefectureFilter.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "All prefectures";
    prefectureFilter.appendChild(defaultOption);

    const sorted = [...prefectures].sort((a, b) =>
      (prefectureNames[a] || a).localeCompare(prefectureNames[b] || b)
    );

    sorted.forEach(prefecture => {
      const option = document.createElement("option");
      option.value = prefecture;
      option.textContent = prefectureNames[prefecture] || capitalize(prefecture);
      prefectureFilter.appendChild(option);
    });
  }

  function placeholder(text) {
    const wrap = makeElement("span", "item-image-placeholder");
    const bear = document.createElement("img");
    bear.src = "images/rilakkuma.png";
    bear.alt = "";
    wrap.appendChild(bear);
    wrap.appendChild(makeElement("em", "", text));
    return wrap;
  }

  // CREATE ITEM CARD

  function createCard(item) {
    const button = makeElement("button", "item-card");
    button.type = "button";
    button.setAttribute("aria-label", `View ${item.title}`);

    const imageContainer = makeElement("div", "item-image");

    if (item.image) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.title || "Rilakkuma Gotochi charm";
      image.loading = "lazy";

      image.addEventListener("error", () => {
        image.remove();
        imageContainer.appendChild(
          placeholder("Image unavailable")
        );
      });

      imageContainer.appendChild(image);
    } else {
      imageContainer.appendChild(
        placeholder("Image coming soon")
      );
    }

    const info = makeElement("div", "item-info");

    const location = makeElement(
      "p",
      "item-location",
      prefectureNames[item.prefecture] || capitalize(item.prefecture)
    );

    const title = makeElement("h3", "item-title", item.title);

    const category = makeElement(
      "p",
      "item-category",
      capitalize(item.item)
    );

    info.append(location, title, category);
    button.append(imageContainer, info);

    button.addEventListener("click", () => openItem(item));

    return button;
  }

  // **bold** support for descriptions (built with DOM nodes, never innerHTML)
  function richText(text) {
    const frag = document.createDocumentFragment();
    String(text).split(/\*\*(.+?)\*\*/g).forEach((part, i) => {
      if (!part) return;
      frag.appendChild(i % 2 ? makeElement("strong", "", part) : document.createTextNode(part));
    });
    return frag;
  }

  // CREATE ITEM DETAIL (Pawpedia-style modal)

  function infoCard(label, bodyNodes, status) {
    const card = makeElement("div", "info-card");
    if (label) card.appendChild(makeElement("p", "info-label", label));
    if (status) card.appendChild(makeElement("p", "info-status", status));
    bodyNodes.forEach(n => card.appendChild(n));
    return card;
  }

  function openItem(item) {
    dialogContent.replaceChildren();
    const region = getRegion(item.prefecture);
    const prefName = prefectureNames[item.prefecture] || capitalize(item.prefecture);

    // framed image
    const frame = makeElement("div", "dialog-frame");
    if (item.image) {
      const image = document.createElement("img");
      image.className = "dialog-image";
      image.src = item.image;
      image.alt = item.title || "Rilakkuma Gotochi charm";
      image.addEventListener("error", () => { image.replaceWith(placeholder("Image unavailable")); });
      frame.appendChild(image);
    } else {
      frame.appendChild(placeholder("Image coming soon"));
    }
    dialogContent.appendChild(frame);

    dialogContent.appendChild(makeElement("h2", "dialog-title", item.title));
    dialogContent.appendChild(makeElement("p", "dialog-location", `📍 ${prefName}, Japan`));
    if (item.price) dialogContent.appendChild(makeElement("p", "dialog-price", item.price));

    // pills
    const pills = makeElement("div", "dialog-classification");
    const packTypes = ["blister pack", "carded strap"];
    const tagList = [
      [regionNames[region], "tag-region"],
      [capitalize(item.item), "tag-item"],
      ...(Array.isArray(item.type) ? item.type : []).map(t => [capitalize(t), packTypes.includes(t) ? "tag-pack" : "tag-other"])
    ];
    tagList.filter(t => t[0]).forEach(([label, cls]) =>
      pills.appendChild(makeElement("span", "dialog-tag " + cls, label)));
    dialogContent.appendChild(pills);

    // about
    const paragraphs = Array.isArray(item.description) ? item.description : (item.description ? [item.description] : []);
    if (paragraphs.length) {
      dialogContent.appendChild(makeElement("h3", "dialog-section", "About this piece"));
      dialogContent.appendChild(infoCard("", paragraphs.map(p => { const el = makeElement("p", "info-text"); el.appendChild(richText(p)); return el; })));
    }

    // where to find it (optional field: where: [{label, status, text, link?}])
    if (Array.isArray(item.where) && item.where.length) {
      dialogContent.appendChild(makeElement("h3", "dialog-section", "Where to find it"));
      item.where.forEach(w => {
        const body = [];
        if (w.text) body.push(makeElement("p", "info-text", w.text));
        if (w.link) {
          const a = document.createElement("a");
          a.href = w.link; a.target = "_blank"; a.rel = "noopener noreferrer";
          a.textContent = w.link_label || "More info";
          body.push(a);
        }
        dialogContent.appendChild(infoCard(w.label, body, w.status));
      });
    }

    // details
    dialogContent.appendChild(makeElement("h3", "dialog-section", "Details"));
    const grid = makeElement("dl", "detail-grid");
    [["Prefecture", prefName], ["Region", regionNames[region]], ["Item", capitalize(item.item)],
     ["Type", (item.type || []).map(capitalize).join(", ")]].filter(r => r[1]).forEach(([k, v]) => {
      const box = makeElement("div", "detail-cell");
      box.append(makeElement("dt", "", k), makeElement("dd", "", v));
      grid.appendChild(box);
    });
    dialogContent.appendChild(grid);

    // credit
    if (item.image_credit || item.image_source) {
      const credit = makeElement("div", "dialog-credit");
      if (item.image_credit) credit.textContent = `Image credit: ${item.image_credit}`;
      if (item.image_source) {
        const link = document.createElement("a");
        link.href = item.image_source; link.target = "_blank"; link.rel = "noopener noreferrer";
        link.textContent = " View original source";
        credit.appendChild(link);
      }
      dialogContent.appendChild(credit);
    }

    dialog.scrollTop = 0;
    dialog.showModal();
    history.replaceState(null, "", "#" + encodeURIComponent(item.title));
  }

  // FILTER AND SEARCH

  function applyFilters() {
    const query = normalize(search.value);
    const selectedPrefecture = prefectureFilter.value;
    const selectedItem = itemFilter.value;
    const selectedType = typeFilter.value;

    const filtered = allItems.filter(item => {
      const searchableContent = normalize([
        item.title,
        item.prefecture,
        item.region,
        item.item,
        ...(item.type || []),
        ...(Array.isArray(item.description) ? item.description : [item.description || ""])
      ].join(" ").replace(/\*\*/g, ""));

      const matchesSearch = !query || searchableContent.includes(query);
      const matchesPrefecture = !selectedPrefecture || item.prefecture === selectedPrefecture;
      const matchesItem = !selectedItem || item.item === selectedItem;
      const matchesType = !selectedType || (item.type || []).includes(selectedType);

      return matchesSearch &&
        matchesPrefecture &&
        matchesItem &&
        matchesType;
    });

    renderItems(filtered);
  }

  // DISPLAY ITEMS

  function renderItems(items) {
    grid.replaceChildren();

    resultCount.textContent =
      `${items.length} ${items.length === 1 ? "gotochi" : "gotochi"} found`;

    emptyState.hidden = items.length !== 0;

    items.forEach(item => {
      grid.appendChild(createCard(item));
    });
  }

  // CLEAR FILTERS

  function clearFilters() {
    search.value = "";
    prefectureFilter.value = "";
    itemFilter.value = "";
    typeFilter.value = "";

    applyFilters();
  }

  search.addEventListener("input", applyFilters);
  prefectureFilter.addEventListener("change", applyFilters);
  itemFilter.addEventListener("change", applyFilters);
  typeFilter.addEventListener("change", applyFilters);
  clearButton.addEventListener("click", clearFilters);

  dialogClose.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => history.replaceState(null, "", location.pathname));

  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  // LOAD DATABASE

  async function loadCollection() {
    try {
      const response = await fetch("items.json");

      if (!response.ok) {
        throw new Error("Could not load items.json");
      }

      const data = await response.json();

      // newest first: the last item in items.json is shown at the top
      allItems = Array.isArray(data.items) ? [...data.items].reverse() : [];

      populatePrefectures(
        Array.isArray(data.prefectures) ? data.prefectures : Object.keys(prefectureNames)
      );

      applyFilters();

      const hash = decodeURIComponent(location.hash.slice(1));
      const linked = allItems.find(i => i.title === hash);
      if (linked) openItem(linked);

    } catch (error) {
      console.error(error);

      grid.replaceChildren(
        makeElement(
          "p",
          "loading-message",
          "The collection could not be loaded. Please check the catalogue data."
        )
      );

      resultCount.textContent = "Unable to load collection";
    }
  }

  loadCollection();
});
