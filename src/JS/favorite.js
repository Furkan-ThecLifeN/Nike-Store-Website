document.addEventListener("DOMContentLoaded", function () {
  // Filtreleme formu
  const filterForm = document.getElementById("filterForm");
  const favoritesSection = document.getElementById("favorites-section");
  const showMoreBtn = document.getElementById("show-more-btn");

  let displayedProducts = 0;
  const productsPerPage = 12;
  let allFavoriteProducts = [];

  // Filtreleme formu gönderildiğinde
  filterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    applyFilters();
  });

  // Filtreleri uygula
  function applyFilters() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const selectedBrand = document.getElementById("brandSelect").value;
    const selectedModel = document.getElementById("modelSelect").value;
    const selectedCategory = document.getElementById("categorySelect").value;
    const selectedPrice = document.getElementById("priceSelect").value;

    // LocalStorage'den favori ürünleri al
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    allFavoriteProducts = favorites;

    // Filtreleme işlemi
    let filteredProducts = favorites.filter((product) => {
      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm) ||
        false ||
        product.description?.toLowerCase().includes(searchTerm) ||
        false;
      const matchesBrand =
        selectedBrand === "Brand" || product.brand === selectedBrand;
      const matchesModel =
        selectedModel === "Model" || product.model === selectedModel;
      const matchesCategory =
        selectedCategory === "Category" ||
        product.category === selectedCategory;

      let matchesPrice = true;
      if (selectedPrice !== "Price") {
        const price = product.price;
        if (selectedPrice === "under500") matchesPrice = price < 500;
        else if (selectedPrice === "500-1000")
          matchesPrice = price >= 500 && price <= 1000;
        else if (selectedPrice === "over1000") matchesPrice = price > 1000;
      }

      return (
        matchesSearch &&
        matchesBrand &&
        matchesModel &&
        matchesCategory &&
        matchesPrice
      );
    });

    // Filtrelenmiş ürünleri göster
    displayProducts(filteredProducts);
  }

  // Ürünleri ekranda göster
  function displayProducts(products) {
    favoritesSection.innerHTML = "";
    displayedProducts = Math.min(products.length, productsPerPage);

    if (products.length === 0) {
      favoritesSection.innerHTML =
        '<p class="no-products">Favori ürün bulunamadı.</p>';
      showMoreBtn.style.display = "none";
      return;
    }

    for (let i = 0; i < displayedProducts; i++) {
      createProductCard(products[i]);
    }

    // Daha fazla ürün varsa "Daha Fazla Göster" butonunu göster
    if (displayedProducts < products.length) {
      showMoreBtn.style.display = "block";
    } else {
      showMoreBtn.style.display = "none";
    }
  }

  // Ürün kartı oluştur
  function createProductCard(product) {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.model}</h3>
      <p class="price">$${product.price}</p>
      <p class="brand">${product.brand}</p>
      <button class="remove-favorite" data-id="${product.id}">Favorilerden Kaldır</button>
    `;

    productCard.addEventListener("click", function (e) {
      if (!e.target.classList.contains("remove-favorite")) {
        openModal(product);
      }
    });

    favoritesSection.appendChild(productCard);

    // Favorilerden kaldır butonu
    const removeBtn = productCard.querySelector(".remove-favorite");
    removeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      removeFromFavorites(product.id);
    });
  }

  // Daha fazla ürün göster
  showMoreBtn.addEventListener("click", function () {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const remainingProducts = allFavoriteProducts.slice(
      displayedProducts,
      displayedProducts + productsPerPage
    );

    remainingProducts.forEach((product) => {
      createProductCard(product);
    });

    displayedProducts += remainingProducts.length;

    if (displayedProducts >= allFavoriteProducts.length) {
      showMoreBtn.style.display = "none";
    }
  });

  // Favorilerden kaldır
  function removeFromFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter((product) => product.id !== productId);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    applyFilters(); // Filtreleri yeniden uygula
  }

  // Modal işlevleri
  const modal = document.getElementById("product-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const favoriteBtn = document.getElementById("favorite-btn");
  const closeBtn = document.querySelector(".close-btn");

  function openModal(product) {
    modalTitle.textContent = product.model;
    modalDescription.textContent = product.description;

    // Favori durumuna göre buton metnini ayarla
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorite = favorites.some((fav) => fav.id === product.id);

    favoriteBtn.textContent = isFavorite
      ? "Favorilerden Kaldır"
      : "Favorilere Ekle";
    favoriteBtn.className = isFavorite ? "remove-from-fav" : "add-to-fav";

    favoriteBtn.onclick = function () {
      if (isFavorite) {
        removeFromFavorites(product.id);
      } else {
        addToFavorites(product);
      }
      modal.classList.add("hidden");
    };

    modal.classList.remove("hidden");
  }

  function addToFavorites(product) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.push(product);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    applyFilters(); // Filtreleri yeniden uygula
  }

  closeBtn.addEventListener("click", function () {
    modal.classList.add("hidden");
  });

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Sayfa yüklendiğinde favori ürünleri göster
  applyFilters();
});
