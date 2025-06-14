import { shoesAPI } from "./API.js";

const sneakerList = document.getElementById("sneaker-list");
const modal = document.getElementById("sneaker-modal");
const modalImg = document.getElementById("sneaker-modal-img");
const modalTitle = document.getElementById("sneaker-modal-title");
const modalDesc = document.getElementById("sneaker-modal-desc");
const modalPrice = document.getElementById("sneaker-modal-price");
const closeBtn = document.getElementById("sneaker-close");
const favoriteButton = document.querySelector(".favorite-button");

let currentModalSneaker = null;

// Tutarlılık için localStorage anahtarını favoriler sayfasıyla aynı yapıyoruz
const STORAGE_KEY = "favorites";

function getRandomSneakers(array, count = 4) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// LocalStorage'dan favorileri al
function getFavorites() {
  const favorites = localStorage.getItem(STORAGE_KEY);
  return favorites ? JSON.parse(favorites) : [];
}

// Favori kontrolü
function isFavorite(id) {
  const favorites = getFavorites();
  return favorites.some((item) => item.id === id);
}

// Favori ekle - Favoriler sayfasıyla uyumlu veri yapısı
function addToFavorites(sneaker) {
  const favorites = getFavorites();
  if (!isFavorite(sneaker.id)) {
    const productToAdd = {
      id: sneaker.id,
      model: sneaker.model,
      brand: sneaker.brand,
      description: sneaker.description,
      price: sneaker.price,
      image: sneaker.image,
      // Favoriler sayfasının ihtiyaç duyduğu ek alanlar
      title: sneaker.model, // Favoriler sayfası 'title' bekliyor
      category: "sneakers", // Varsayılan kategori
    };

    favorites.push(productToAdd);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    updateFavoriteButton(sneaker.id);
    alert(`${sneaker.model} favorilere eklendi!`);

    // Favoriler sayfasındaki güncellemeleri tetiklemek için event gönderiyoruz
    window.dispatchEvent(new Event("favoritesUpdated"));
  }
}

// Favoriden çıkar
function removeFromFavorites(id) {
  let favorites = getFavorites();
  const product = favorites.find((item) => item.id === id);
  favorites = favorites.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  updateFavoriteButton(id);
  if (product) {
    alert(`${product.model} favorilerden çıkarıldı!`);

    // Favoriler sayfasındaki güncellemeleri tetiklemek için event gönderiyoruz
    window.dispatchEvent(new Event("favoritesUpdated"));
  }
}

// Favori butonunu güncelle
function updateFavoriteButton(id) {
  if (isFavorite(id)) {
    favoriteButton.textContent = "Favorilerden Çıkar";
    favoriteButton.style.backgroundColor = "#ff3c00";
  } else {
    favoriteButton.textContent = "Favorilere Ekle";
    favoriteButton.style.backgroundColor = "#000000e7";
  }
}

// Favori butonuna tıklama işlemi
favoriteButton.addEventListener("click", () => {
  if (!currentModalSneaker) return;

  if (isFavorite(currentModalSneaker.id)) {
    removeFromFavorites(currentModalSneaker.id);
  } else {
    addToFavorites(currentModalSneaker);
  }
});

const randomSneakers = getRandomSneakers(shoesAPI, 4);

randomSneakers.forEach((sneaker) => {
  const item = document.createElement("div");
  item.classList.add("sneaker-card");
  item.innerHTML = `
    <img src="${sneaker.image}" alt="${sneaker.brand}" />
    <h5>${sneaker.model}</h5>
    <p>${sneaker.description}</p>
    <span>${sneaker.price}₺</span>
    <button class="sneaker-view" data-id="${sneaker.id}">Göz At</button>
  `;
  sneakerList.appendChild(item);
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("sneaker-view")) {
    const id = +e.target.getAttribute("data-id");
    const selected = shoesAPI.find((s) => s.id === id);
    if (selected) {
      currentModalSneaker = selected;
      modalImg.src = selected.image;
      modalTitle.textContent = selected.model;
      modalDesc.textContent = selected.description;
      modalPrice.textContent = `${selected.price}₺`;
      updateFavoriteButton(selected.id);
      modal.style.display = "flex";
    }
  }
});

// Modal kapatma
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  currentModalSneaker = null;
});

// Arka plana tıklanınca da modal kapansın
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    currentModalSneaker = null;
  }
});
