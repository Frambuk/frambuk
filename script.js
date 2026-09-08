/* =========================================================
   FRAMBUK WEBSITE MASTER SCRIPT – FULL MERGED VERSION
   =========================================================

   Includes:
   1. Hamburger menu
   2. Mobile menu auto-close
   3. Cart system (REWRITTEN – fixed)
   4. Cart count badge
   5. Add to cart
   6. Buy now
   7. Cart page display
   8. Quantity controls
   9. Remove item
   10. WhatsApp checkout
   11. Course slider
   12. Offline app payment link
   13. Product image viewer (modal)
   14. YouTube / Google Drive video viewer
   15. Product image tap loop
   16. Keyboard image controls
   17. ESC close
   18. Right-click deterrent
========================================================= */

/* =========================================================
   HAMBURGER MENU
========================================================= */

function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) menu.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function () {
  const menu = document.getElementById("menu");
  if (!menu) return;
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("show");
    });
  });
});

/* =========================================================
   CART SYSTEM – REWRITTEN (FIXED)
========================================================= */

const STORAGE_KEY = "frambukCart";

// Load cart from localStorage, always returns an array
function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load cart:", e);
  }
  return [];
}

// Save cart to localStorage
function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

// Normalize a cart array: clean names, ensure numbers, remove invalid entries
function normalizeCart(cart) {
  if (!Array.isArray(cart)) return [];
  return cart
    .filter(function (item) {
      return (
        item &&
        typeof item.name === "string" &&
        item.name.trim() !== ""
      );
    })
    .map(function (item) {
      return {
        name: item.name.trim(),
        price: Math.max(0, Number(item.price) || 0),
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
      };
    });
}

// Update the cart count badge
function updateCartCount() {
  const cart = loadCart();
  const total = cart.reduce(function (sum, item) {
    return sum + (item.quantity || 0);
  }, 0);

  const counter = document.getElementById("cartCount");
  if (counter) {
    counter.textContent = total;
    counter.setAttribute("aria-label", total + " item" + (total === 1 ? "" : "s") + " in cart");
  }
  return total;
}

// ADD TO CART
function addCart(name, price) {
  if (!name || String(name).trim() === "") {
    console.error("addCart(): Product name is missing.");
    return;
  }

  const cleanName = String(name).trim();
  const cleanPrice = Math.max(0, Number(price) || 0);

  // Load the current cart
  let cart = loadCart();

  // Find existing item
  const existing = cart.find(function (item) {
    return item.name === cleanName;
  });

  if (existing) {
    existing.quantity = (existing.quantity || 0) + 1;
  } else {
    cart.push({
      name: cleanName,
      price: cleanPrice,
      quantity: 1
    });
  }

  // Normalize and save
  cart = normalizeCart(cart);
  saveCart(cart);

  // Update UI
  updateCartCount();
  // Only refresh cart page if we are on cart.html
  if (document.getElementById("cartItems")) {
    displayCart();
  }

  alert(cleanName + " added to cart");
  console.log("Cart after add:", cart);
}

// BUY NOW – add and immediately go to WhatsApp
function buyNow(name, price) {
  addCart(name, price);
  checkoutWhatsApp();
}

// OPEN CART PAGE
function openCart() {
  window.location.href = "cart.html";
}

// WHATSAPP CHECKOUT
function checkoutWhatsApp() {
  const cart = loadCart();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let message = "Hello Frambuk, I want to order:\n\n";
  let total = 0;

  cart.forEach(function (item) {
    const qty = item.quantity || 0;
    const price = item.price || 0;
    const subtotal = price * qty;
    total += subtotal;
    message += item.name + " x " + qty + " = ₦" + subtotal.toLocaleString() + "\n";
  });

  message += "\nTotal: ₦" + total.toLocaleString() + "\n\nThank you.";

  const whatsappNumber = "2349067040308";
  const url = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// DISPLAY CART (for cart.html)
function displayCart() {
  const box = document.getElementById("cartItems");
  if (!box) return; // not on cart page

  const cart = loadCart();
  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty 🛒</h3>
        <p>You have not added any products yet.</p>
        <button type="button" onclick="location.href='shop.html'">Continue Shopping</button>
      </div>
    `;
    document.getElementById("cartTotal").textContent = "Total: ₦0";
    updateCartCount();
    return;
  }

  let total = 0;
  cart.forEach(function (item, index) {
    const price = item.price || 0;
    const qty = item.quantity || 1;
    const subtotal = price * qty;
    total += subtotal;

    const images = getCartProductImages(item.name);
    const firstImage = images[0] || "";

    box.innerHTML += `
      <div class="cart-row" data-cart-index="${index}">
        ${firstImage ? `
          <div class="cart-product-media">
            <img src="${firstImage}" alt="${item.name}" loading="lazy">
            <button type="button" class="image-preview-btn cart-image-preview"
                    onclick="openCartProductImages(${index})"
                    aria-label="View images for ${item.name}">
              <span aria-hidden="true">👁</span> View Images
            </button>
          </div>
        ` : ""}
        <h3>${item.name}</h3>
        <p>Unit Price: <strong>₦${price.toLocaleString()}</strong></p>
        <p>
          Quantity:
          <button type="button" onclick="changeQty(${index}, -1)" aria-label="Decrease quantity">−</button>
          <strong>${qty}</strong>
          <button type="button" onclick="changeQty(${index}, 1)" aria-label="Increase quantity">+</button>
        </p>
        <p>Subtotal: <strong>₦${subtotal.toLocaleString()}</strong></p>
        <button type="button" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").textContent = "Total: ₦" + total.toLocaleString();
  updateCartCount();
}

// CHANGE QUANTITY
function changeQty(index, delta) {
  let cart = loadCart();
  if (index < 0 || index >= cart.length) return;

  const newQty = (cart[index].quantity || 1) + delta;
  if (newQty <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newQty;
  }

  cart = normalizeCart(cart);
  saveCart(cart);
  displayCart();
  updateCartCount();
}

// REMOVE ITEM
function removeItem(index) {
  let cart = loadCart();
  if (index < 0 || index >= cart.length) return;

  const name = cart[index].name;
  cart.splice(index, 1);
  cart = normalizeCart(cart);
  saveCart(cart);
  displayCart();
  updateCartCount();
  console.log(name + " removed from cart.");
}

// CART PRODUCT IMAGES MAPPING (exactly as you had)
function getCartProductImages(name) {
  const images = {
    "Coconut Oil (Small ~ 100ml)": [
      "images/products/100ml Frambuk Coconut Oil.png",
      "images/products/100ml Frambuk Coconut Oil.png"
    ],
    "Coconut Oil (Big ~ 200ml)": [
      "images/products/200ml Frambuk Coconut Oil.png",
      "images/products/200ml Frambuk Coconut Oil.png"
    ],
    "Cocoyam Soup Thickener (Small ~ 80g)": [
      "images/products/80g Cocoyam Soup Thickener Pack 1.png",
      "images/products/80g Cocoyam Soup Thickener Pack 2.png"
    ],
    "Cocoyam Soup Thickener (Big ~ 270g)": [
      "images/products/270g Cocoyam Soup Thickener 1.png",
      "images/products/270g Cocoyam Soup Thickener 2.png"
    ],
    "250g Corn Pap": [
      "images/products/250g Corn Pap 1.png",
      "images/products/250g Corn Pap 2.png"
    ],
    "500g Corn Pap": [
      "images/products/500g Corn Pap 1.png",
      "images/products/500g Corn Pap 2.png"
    ],
    "250g Guinea Corn Pap": [
      "images/products/250g Guinea Corn Pap 1.png",
      "images/products/250g Guinea Corn Pap 2.png"
    ],
    "500g Guinea Corn Pap": [
      "images/products/500g Guinea Corn Pap 1.png",
      "images/products/500g Guinea Corn Pap 2.png"
    ],
    "Beans Flour": [
      "images/products/500g Beans Flour 1.png",
      "images/products/500g Beans Flour 2.png"
    ],
    "Okpa Flour": [
      "images/products/800g Okpa Flour Frambuk 17cm x 28cm 1.png",
      "images/products/800g Okpa Flour Frambuk 17cm x 28cm 2.png"
    ],
    "1kg Unripe Plantain Poundo Flour": [
      "images/products/1kg Unripe Plantain Poundo Flour 1.png",
      "images/products/1kg Unripe Plantain Poundo Flour 2.png"
    ],
    "1kg Sweet Potato Poundo Flour": [
      "images/products/1kg Sweet Potato Poundo Flour 1.png",
      "images/products/1kg Sweet Potato Poundo Flour 2.png"
    ]
  };
  return images[name] || [];
}

// OPEN CART PRODUCT IMAGES (now uses the viewer)
function openCartProductImages(index) {
  const cart = loadCart();
  const item = cart[index];
  if (!item) return;

  const images = getCartProductImages(item.name);
  if (!images.length) return;

  ensureFrambukViewer();
  frambukImageSet = images.map(function (src, i) {
    return { src: src, alt: item.name + " image " + (i + 1) };
  });
  frambukImageIndex = 0;

  if (frambukPlayer) {
    frambukPlayer.style.display = "none";
    frambukPlayer.src = "";
  }
  if (frambukImage) frambukImage.style.display = "block";
  if (frambukModal) {
    frambukModal.classList.add("active");
    frambukModal.setAttribute("aria-hidden", "false");
  }
  frambukBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  renderImageViewer();
}

/* =========================================================
   COURSE SLIDER & GENERIC SLIDER
========================================================= */

function slideCourses(direction) {
  const slider = document.getElementById("courseSlider");
  if (!slider) return;
  slider.scrollLeft += Number(direction) * 350;
}

function slideSection(id, direction) {
  const slider = document.getElementById(id);
  if (!slider) return;
  slider.scrollLeft += Number(direction) * 350;
}

/* =========================================================
   OFFLINE APP DOWNLOAD
========================================================= */

let offlineAppPaymentLink = "https://paystack.com/pay/REPLACE-WITH-YOUR-LINK";

function getOfflineVersion() {
  window.open(offlineAppPaymentLink, "_blank");
}

/* =========================================================
   PRODUCT / GALLERY IMAGE VIEWER – FULL ORIGINAL
========================================================= */

let frambukModal = null;
let frambukPlayer = null;
let frambukImage = null;
let frambukThumbs = null;
let frambukPrev = null;
let frambukNext = null;
let frambukImageSet = [];
let frambukImageIndex = 0;
let frambukBodyOverflow = "";

function ensureFrambukViewer() {
  frambukModal = document.getElementById("videoModal");

  if (!frambukModal) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div id="videoModal" class="video-modal" aria-hidden="true">
        <div class="video-modal-content">
          <button type="button" class="modal-close" onclick="closeVideo()" aria-label="Close viewer">✕</button>
          <button type="button" class="image-nav image-nav-prev" id="imagePrev" onclick="showPreviousImage()" aria-label="Previous image">‹</button>
          <iframe id="videoPlayer" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          <div class="image-viewer-area">
            <img id="mediaImage" alt="Image preview">
          </div>
          <button type="button" class="image-nav image-nav-next" id="imageNext" onclick="showNextImage()" aria-label="Next image">›</button>
          <div class="image-thumbnails" id="imageThumbnails" aria-label="Related images"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper.firstElementChild);
    frambukModal = document.getElementById("videoModal");
  }

  frambukPlayer = document.getElementById("videoPlayer");
  frambukImage = document.getElementById("mediaImage");
  frambukThumbs = document.getElementById("imageThumbnails");
  frambukPrev = document.getElementById("imagePrev");
  frambukNext = document.getElementById("imageNext");

  if (frambukModal && !frambukModal.dataset.viewerReady) {
    frambukModal.dataset.viewerReady = "true";
    frambukModal.addEventListener("click", function (e) {
      if (e.target === frambukModal) closeVideo();
    });
  }
}

function getCardImages(card) {
  if (!card) return [];
  const images = [
    ...card.querySelectorAll(".product-image-slider img"),
    ...card.querySelectorAll(".media-thumb-wrapper img"),
    ...card.querySelectorAll(":scope > img")
  ]
    .map(function (img) {
      return { src: img.currentSrc || img.src, alt: img.alt || "Image preview" };
    })
    .filter(function (item) {
      return item.src;
    });

  return images.filter(function (item, index, array) {
    return array.findIndex(function (x) { return x.src === item.src; }) === index;
  });
}

function openProductImages(card) {
  ensureFrambukViewer();
  frambukImageSet = getCardImages(card);
  if (!frambukImageSet.length) return;

  frambukImageIndex = 0;
  if (frambukPlayer) {
    frambukPlayer.style.display = "none";
    frambukPlayer.src = "";
  }
  if (frambukImage) frambukImage.style.display = "block";
  frambukModal.classList.add("active");
  frambukModal.setAttribute("aria-hidden", "false");
  frambukBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  renderImageViewer();
}

function renderImageViewer() {
  if (!frambukImage || !frambukImageSet.length) return;
  const item = frambukImageSet[frambukImageIndex];
  if (!item) return;

  frambukImage.src = item.src;
  frambukImage.alt = item.alt;

  if (frambukThumbs) {
    frambukThumbs.innerHTML = "";
    frambukImageSet.forEach(function (image, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "image-thumb" + (index === frambukImageIndex ? " active" : "");
      button.setAttribute("aria-label", "Show image " + (index + 1));
      const thumb = document.createElement("img");
      thumb.src = image.src;
      thumb.alt = "";
      button.appendChild(thumb);
      button.addEventListener("click", function () {
        frambukImageIndex = index;
        renderImageViewer();
      });
      frambukThumbs.appendChild(button);
    });

    const active = frambukThumbs.children[frambukImageIndex];
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  const multiple = frambukImageSet.length > 1;
  if (frambukPrev) frambukPrev.classList.toggle("hidden", !multiple);
  if (frambukNext) frambukNext.classList.toggle("hidden", !multiple);
}

function showPreviousImage() {
  if (frambukImageSet.length < 2) return;
  frambukImageIndex = (frambukImageIndex - 1 + frambukImageSet.length) % frambukImageSet.length;
  renderImageViewer();
}

function showNextImage() {
  if (frambukImageSet.length < 2) return;
  frambukImageIndex = (frambukImageIndex + 1) % frambukImageSet.length;
  renderImageViewer();
}

function convertToEmbed(url) {
  if (!url) return "";
  const autoplay = "?autoplay=1&rel=0&playsinline=1";

  if (url.includes("youtube.com/watch?v=")) {
    const videoID = url.split("v=")[1].split("&")[0];
    return "https://www.youtube.com/embed/" + videoID + autoplay;
  }
  if (url.includes("/shorts/")) {
    const videoID = url.split("/shorts/")[1].split("?")[0];
    return "https://www.youtube.com/embed/" + videoID + autoplay;
  }
  if (url.includes("youtu.be/")) {
    const videoID = url.split("youtu.be/")[1].split("?")[0];
    return "https://www.youtube.com/embed/" + videoID + autoplay;
  }
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match) {
      return "https://drive.google.com/file/d/" + match[1] + "/preview";
    }
  }
  return url;
}

function openVideo(url) {
  if (!url) return;
  ensureFrambukViewer();

  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  if (isMobile && url.includes("drive.google.com")) {
    window.open(url, "_blank");
    return;
  }

  if (frambukImage) frambukImage.style.display = "none";
  if (frambukThumbs) frambukThumbs.innerHTML = "";
  if (frambukPrev) frambukPrev.classList.add("hidden");
  if (frambukNext) frambukNext.classList.add("hidden");

  if (frambukPlayer) {
    frambukPlayer.style.display = "block";
    frambukPlayer.src = convertToEmbed(url);
  }

  frambukModal.classList.add("active");
  frambukModal.setAttribute("aria-hidden", "false");
  frambukBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
}

function openImage(url) {
  if (!url) return;
  ensureFrambukViewer();
  frambukImageSet = [{ src: url, alt: "Gallery image" }];
  frambukImageIndex = 0;

  if (frambukPlayer) {
    frambukPlayer.style.display = "none";
    frambukPlayer.src = "";
  }
  if (frambukImage) frambukImage.style.display = "block";

  frambukModal.classList.add("active");
  frambukModal.setAttribute("aria-hidden", "false");
  frambukBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  renderImageViewer();
}

function closeVideo() {
  if (!frambukModal) return;
  frambukModal.classList.remove("active");
  frambukModal.setAttribute("aria-hidden", "true");

  if (frambukPlayer) frambukPlayer.src = "";
  if (frambukImage) frambukImage.src = "";
  if (frambukThumbs) frambukThumbs.innerHTML = "";
  frambukImageSet = [];
  document.body.style.overflow = frambukBodyOverflow;
}

/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener("keydown", function (e) {
  if (!frambukModal || !frambukModal.classList.contains("active")) return;
  if (e.key === "Escape") {
    closeVideo();
    return;
  }
  if (e.key === "ArrowLeft") showPreviousImage();
  if (e.key === "ArrowRight") showNextImage();
});

/* =========================================================
   PRODUCT IMAGE TAP LOOP
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".product-image-slider").forEach(function (slider) {
    const images = slider.querySelectorAll("img");
    if (images.length < 2) return;
    let currentImage = 0;

    images.forEach(function (img, index) {
      img.style.transform = "translateX(" + (index * 100) + "%)";
    });

    slider.addEventListener("click", function (e) {
      if (e.target.closest("button, a")) return;
      currentImage++;
      if (currentImage >= images.length) currentImage = 0;
      images.forEach(function (img, index) {
        img.style.transform = "translateX(" + ((index - currentImage) * 100) + "%)";
      });
    });
  });
});

/* =========================================================
   DISABLE RIGHT CLICK (light deterrent)
========================================================= */

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

/* =========================================================
   END OF FRAMBUK MASTER SCRIPT
========================================================= */




/* =========================================================
   BANK DETAILS MODAL
========================================================= */

function openBankDetails() {
  // Load cart and compute total
  const cart = loadCart();
  let total = 0;
  cart.forEach(function (item) {
    total += (item.price || 0) * (item.quantity || 0);
  });

  // Update total display
  const totalEl = document.getElementById("bankTotal");
  if (totalEl) {
    totalEl.textContent = "Total: ₦" + total.toLocaleString();
  }

  // Show modal
  const modal = document.getElementById("bankModal");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

function closeBankDetails() {
  const modal = document.getElementById("bankModal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

function copyBankDetail(text) {
  if (!navigator.clipboard) {
    alert("Clipboard API not supported. Please copy manually.");
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    alert("✅ Copied: " + text);
  }).catch(function () {
    alert("❌ Failed to copy. Please try again.");
  });
}

// Close bank modal on background click
document.addEventListener("DOMContentLoaded", function () {
  const bankModal = document.getElementById("bankModal");
  if (bankModal) {
    bankModal.addEventListener("click", function (e) {
      if (e.target === bankModal) closeBankDetails();
    });
  }
});