// Încarcă limba din cookie sau folosește limba implicită (română)
let currentLanguage = getCookie("selectedLanguage") || "ro";
let sortAscending = true;
let items = JSON.parse(localStorage.getItem("shoppingList")) || [];

// Funcție pentru a schimba limba
function changeLanguage(lang) {
  currentLanguage = lang;
  setCookie("selectedLanguage", lang, 365); // Salvează limba în cookie timp de 1 an
  updateUI();
  setActiveLanguageButton(); // Actualizează butonul activ
}

// Funcție pentru a marca butonul limbii active
function setActiveLanguageButton() {
  document.querySelectorAll(".language-selector button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.textContent.includes(currentLanguage.toUpperCase())) {
      btn.classList.add("active");
    }
  });
}

// Funcție pentru a actualiza interfața în funcție de limbă
function updateUI() {
  const t = translations[currentLanguage];

  document.getElementById("appTitle").textContent = t.appTitle;
  document.getElementById("itemInput").placeholder = t.itemPlaceholder;
  document.getElementById("addButton").textContent = t.addButton;
  document.getElementById("sortOrderButton").textContent = t.sortOrder;

  document.getElementById("categoryFood").textContent = t.categories.food;
  document.getElementById("categoryDrinks").textContent = t.categories.drinks;
  document.getElementById("categoryCleaning").textContent =
    t.categories.cleaning;
  document.getElementById("categoryOther").textContent = t.categories.other;

  document.getElementById("sortName").textContent = t.sortOptions.name;
  document.getElementById("sortDate").textContent = t.sortOptions.date;
  document.getElementById("sortCategory").textContent = t.sortOptions.category;
}

// Funcție pentru a adăuga un articol nou
function addItem() {
  const name = document.getElementById("itemInput").value.trim();
  const category = document.getElementById("categorySelect").value;
  const quantity = parseInt(document.getElementById("quantityInput").value);

  if (!name) {
    alert("Te rog introdu un nume valid pentru produs.");
    return;
  }

  if (isNaN(quantity) || quantity < 1) {
    alert("Cantitatea trebuie să fie un număr pozitiv.");
    return;
  }

  items.push({
    id: Date.now(),
    name,
    category,
    quantity,
    purchased: false,
    date: new Date().toISOString(),
  });

  saveAndRender();
  document.getElementById("itemInput").value = "";
}

// Funcție pentru a crea un element de listă
function createListItem(item) {
  const li = document.createElement("li");
  li.className = "list-item";
  li.innerHTML = `
        <div class="item-content">
            <span class="category">${item.category}</span>
            <span class="name ${item.purchased ? "purchased" : ""}">${
    item.name
  }</span>
            <input type="number" class="quantity" value="${item.quantity}" 
                   onchange="updateQuantity(${item.id}, this.value)">
        </div>
        <button class="delete-btn" onclick="confirmDelete(${
          item.id
        })">Șterge</button>
    `;

  li.querySelector(".name").addEventListener("dblclick", function (e) {
    const span = e.target;
    const input = document.createElement("input");
    input.className = "edit-input";
    input.value = span.textContent;

    input.addEventListener("blur", function () {
      span.textContent = this.value;
      updateItem(item.id, "name", this.value);
    });

    span.replaceWith(input);
    input.focus();
  });

  li.querySelector(".name").addEventListener("click", function () {
    this.classList.toggle("purchased");
    updateItem(item.id, "purchased", !item.purchased);
  });

  return li;
}

// Funcție pentru a actualiza un articol
function updateItem(id, field, value) {
  const item = items.find((i) => i.id === id);
  if (item) {
    item[field] = value;
    saveAndRender();
  }
}

// Funcție pentru a actualiza cantitatea
function updateQuantity(id, value) {
  updateItem(id, "quantity", parseInt(value));
}

// Funcție pentru a confirma ștergerea
function confirmDelete(id) {
  const t = translations[currentLanguage];
  if (confirm(t.deleteConfirm)) {
    items = items.filter((item) => item.id !== id);
    saveAndRender();
  }
}

// Funcție pentru a sorta articolele
function sortItems() {
  const sortBy = document.getElementById("sortSelect").value;

  items.sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "date":
        valueA = a.date;
        valueB = b.date;
        break;
      case "category":
        valueA = a.category;
        valueB = b.category;
        break;
    }

    return sortAscending
      ? valueA > valueB
        ? 1
        : -1
      : valueA < valueB
      ? 1
      : -1;
  });

  renderList();
}

// Funcție pentru a comuta ordinea de sortare
function toggleSortOrder() {
  sortAscending = !sortAscending;
  sortItems();
}

// Funcție pentru a salva și reîncărca lista
function saveAndRender() {
  localStorage.setItem("shoppingList", JSON.stringify(items));
  renderList();
}

// Funcție pentru a afișa lista
function renderList() {
  const list = document.getElementById("shoppingList");
  list.innerHTML = "";
  items.forEach((item) => {
    list.appendChild(createListItem(item));
  });
}

// Inițializare la încărcarea paginii
updateUI();
renderList();
setActiveLanguageButton();

// Adăugare cu Enter
document.getElementById("itemInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addItem();
});
