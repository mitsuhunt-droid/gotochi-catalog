
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
          makeElement("span", "item-image-placeholder", "Image unavailable")
        );
      });

      imageContainer.appendChild(image);
    } else {
      imageContainer.appendChild(
        makeElement("span", "item-image-placeholder", "Image coming soon")
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

  // CREATE ITEM DETAIL

  function openItem(item) {
    dialogContent.replaceChildren();

    const image = document.createElement("img");
    image.className = "dialog-image";
    image.alt = item.title || "Rilakkuma Gotochi charm";

    if (item.image) {
      image.src = item.image;
      dialogContent.appendChild(image);
    }

    const title = makeElement("h2", "dialog-title", item.title);

    const location = makeElement(
      "p",
      "dialog-location",
      `${prefectureNames[item.prefecture] || capitalize(item.prefecture)}, Japan`
    );

    dialogContent.append(title, location);

    // DESCRIPTION

    const description = makeElement("div", "dialog-description");

    if (Array.isArray(item.description)) {
      item.description.forEach(paragraph => {
        description.appendChild(
          makeElement("p", "", paragraph)
        );
      });
    } else if (item.description) {
      description.appendChild(
        makeElement("p", "", item.description)
      );
    }

    dialogContent.appendChild(description);

    // CLASSIFICATION

    const classification = makeElement("div", "dialog-classification");

    const region = getRegion(item.prefecture);

    const tags = [
      prefectureNames[item.prefecture] || capitalize(item.prefecture),
      regionNames[region] || "",
      capitalize(item.item),
      ...(Array.isArray(item.type) ? item.type.map(capitalize) : [])
    ].filter(Boolean);

    tags.forEach(tag => {
      classification.appendChild(
        makeElement("span", "dialog-tag", tag)
      );
    });

    dialogContent.appendChild(classification);

    // IMAGE CREDIT

    if (item.image_credit || item.image_source) {
      const credit = makeElement("div", "dialog-credit");

      if (item.image_credit) {
        credit.textContent = `Image credit: ${item.image_credit}`;
      }

      if (item.image_source) {
        const link = document.createElement("a");
        link.href = item.image_source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = " View original source";

        credit.appendChild(link);
      }

      dialogContent.appendChild(credit);
    }

    dialog.showModal();
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
      ].join(" "));

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

  dialogClose.addEventListener("click", () => {
    dialog.close();
  });

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

      allItems = Array.isArray(data.items) ? data.items : [];

      populatePrefectures(
        Array.isArray(data.prefectures) ? data.prefectures : Object.keys(prefectureNames)
      );

      applyFilters();

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
