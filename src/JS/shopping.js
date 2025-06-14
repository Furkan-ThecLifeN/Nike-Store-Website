import { shoesAPI } from "./API";

const productsContainer = document.querySelector(".products-section .row");
const filterForm = document.getElementById("filterForm");

const PRODUCTS_PER_PAGE = 12;
let filteredProducts = [...shoesAPI];
let currentPage = 1;

function renderProducts(productsToRender, page = 1) {
  productsContainer.innerHTML = "";

  const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const productsPage = productsToRender.slice(startIndex, endIndex);

  productsPage.forEach((product) => {
    const productCol = document.createElement("div");
    productCol.className = "col-md-4";

    productCol.innerHTML = `
      <div class="product-card p-3 text-center">
        <img src="${product.image}" class="img-fluid mb-3" alt="${product.name}" />
        <h5>${product.brand}</h5>
        <p>${product.model}</p>
        <p>${product.category}</p>
        <p>${product.price} ₺</p>
        <button class="btn btn-outline-primary" data-id="${product.id}">Göz At</button>
      </div>
    `;

    productsContainer.appendChild(productCol);
  });

  renderPagination(productsToRender.length, page);
  attachModalListeners();
}

function renderPagination(totalItems, currentPage) {
  const paginationWrapper = document.querySelector(
    ".pagination-wrapper ul.pagination"
  );
  paginationWrapper.innerHTML = "";

  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
  prevLi.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderProducts(filteredProducts, currentPage);
    }
  });
  paginationWrapper.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageLi.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderProducts(filteredProducts, currentPage);
    });
    paginationWrapper.appendChild(pageLi);
  }

  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
  nextLi.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(filteredProducts, currentPage);
    }
  });
  paginationWrapper.appendChild(nextLi);
}

function applyFilters(e) {
  e.preventDefault();

  const searchTerm = filterForm
    .querySelector('input[type="text"]')
    .value.trim()
    .toLowerCase();
  const brand = filterForm.querySelectorAll("select")[0].value;
  const model = filterForm.querySelectorAll("select")[1].value;
  const category = filterForm.querySelectorAll("select")[2].value;
  const price = filterForm.querySelectorAll("select")[3].value;

  filteredProducts = shoesAPI.filter((product) => {
    let matches = true;

    if (searchTerm) {
      const searchableStr = (
        product.name +
        product.brand +
        product.model
      ).toLowerCase();
      if (!searchableStr.includes(searchTerm)) matches = false;
    }

    if (brand !== "Brand" && product.brand !== brand) matches = false;
    if (model !== "Model" && product.model !== model) matches = false;
    if (category !== "Category" && product.category !== category)
      matches = false;

    if (price !== "Price") {
      if (price === "Under $500" && product.price >= 500) matches = false;
      else if (
        price === "$500 - $1000" &&
        (product.price < 500 || product.price > 1000)
      )
        matches = false;
      else if (price === "Over $1000" && product.price <= 1000) matches = false;
    }

    return matches;
  });

  currentPage = 1;
  renderProducts(filteredProducts, currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(shoesAPI, 1);
});

filterForm.addEventListener("submit", applyFilters);

// MODAL
const modal = document.createElement("div");
modal.className = "sneaker-modal";
modal.style.display = "none";
modal.innerHTML = `
  <div class="sneaker-modal-box">
    <span class="sneaker-close" id="sneaker-close"><i class="fa-solid fa-xmark"></i></span>
    <img id="sneaker-modal-img" src="" alt="Sneaker Image" />
    <div class="sneaker-modal-info">
      <h2 id="sneaker-modal-title"></h2>
      <p id="sneaker-modal-desc"></p>
      <span id="sneaker-modal-price" class="price-text"></span>
    </div>
    <button class="favorite-button">Favorilere Ekle</button>
  </div>
`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("#sneaker-modal-img");
const modalTitle = modal.querySelector("#sneaker-modal-title");
const modalDesc = modal.querySelector("#sneaker-modal-desc");
const modalPrice = modal.querySelector("#sneaker-modal-price");
const modalClose = modal.querySelector("#sneaker-close");
const favoriteButton = modal.querySelector(".favorite-button");

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

function attachModalListeners() {
  const buttons = document.querySelectorAll(".btn-outline-primary");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const product = shoesAPI.find((p) => p.id == id);
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if (product) {
        modalImg.src = product.image;
        modalTitle.textContent =
          product.name || product.brand + " " + product.model;
        modalDesc.textContent =
          product.description || "Ürün açıklaması mevcut değil.";
        modalPrice.textContent = `${product.price} ₺`;
        favoriteButton.setAttribute("data-id", product.id);

        const isFavorited = favorites.some((p) => p.id == product.id);
        favoriteButton.textContent = isFavorited
          ? "Favorilerden Çıkar"
          : "Favorilere Ekle";

        modal.style.display = "flex";
      }
    });
  });
}

favoriteButton.addEventListener("click", () => {
  const productId = favoriteButton.getAttribute("data-id");
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const index = favorites.findIndex((p) => p.id == productId);

  if (index === -1) {
    const product = shoesAPI.find((p) => p.id == productId);
    if (product) {
      favorites.push(product);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      favoriteButton.textContent = "Favorilerden Çıkar";
      alert("Favorilere eklendi!");
    }
  } else {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    favoriteButton.textContent = "Favorilere Ekle";
    alert("Favorilerden çıkarıldı!");
  }
});

console.log("Gelen görsel:", product.image);
