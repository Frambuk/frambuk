/* =========================================================
   FRAMBUK WEBSITE MASTER SCRIPT – FULL MERGED VERSION
   =========================================================

   Includes:
   1. Site menu (Home, Foods & Flours, Free Apps, Offers, Clear Cache & Reload)
   2. Mobile menu drawer, toasts, back-to-top, cross-tab cart sync
   3. Cart system
   4. Cart count badge
   5. Add to cart
   6. Buy now
   7. Cart page display
   8. Quantity controls
   9. Remove item
   10. WhatsApp checkout
   11. Course slider
   12. Offline app payment link
   13. Product image viewer
   14. YouTube / Google Drive video viewer
   15. YouTube Shorts vertical popup
   16. Product image tap loop
   17. Keyboard image controls
   18. ESC close
   19. Right-click deterrent
   20. Bank details modal
========================================================= */


/* =========================================================
   SITE MENU, TOASTS & SHARED PAGE FEATURES
   ---------------------------------------------------------
   Every page that loads this script gets the same menu:
   Home | Foods & Flours | Free Apps | Offers | Clear Cache & Reload
   Section links always point to the sections of index.html.
========================================================= */

const SITE_MENU_ITEMS = [
  { key: "home",   label: "Home",           href: "index.html" },
  { key: "foods",  label: "Foods &amp; Flours", href: "index.html#foods" },
  { key: "apps",   label: "Free Apps",      href: "index.html#apps" },
  { key: "offers", label: "Offers",         href: "index.html#offers" }
];

const MENU_DESKTOP_MIN = 1281; /* must match the CSS breakpoint */


/* ---------- Is this page the home page (index.html or "/")? ---------- */

function isHomePage() {
  return /(^|\/)(index\.html?)?$/i.test(window.location.pathname);
}


/* ---------- Build the menu on any page that doesn't have it yet ---------- */

function buildSiteMenu() {

  const menu = document.getElementById("menu");

  if (!menu || menu.hasAttribute("data-site-menu")) {
    return;
  }

  menu.setAttribute("data-site-menu", "");
  menu.setAttribute("aria-label", "Main menu");

  menu.innerHTML =
    SITE_MENU_ITEMS.map(function (item) {
      return '<a href="' + item.href + '" data-nav-key="' + item.key + '">' +
             item.label + "</a>";
    }).join("") +
    '<button type="button" class="nav-btn" onclick="clearCacheAndReload()" ' +
    'title="Fetch the newest version of this website">' +
    "🔄 Clear Cache &amp; Reload</button>";

}


/* ---------- Open / close the mobile menu ---------- */

function setMenuOpen(open) {

  const menu = document.getElementById("menu");
  const burger = document.querySelector(".hamburger");

  if (!menu) {
    return;
  }

  menu.classList.toggle("show", open);

  if (burger) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.textContent = open ? "✕" : "☰";
  }

}

function toggleMenu() {

  const menu = document.getElementById("menu");

  if (menu) {
    setMenuOpen(!menu.classList.contains("show"));
  }

}

function closeMenu() {
  setMenuOpen(false);
}


/* ---------- Highlight the menu item for the current page/section ---------- */

function updateActiveNav() {

  const links = document.querySelectorAll("#menu a[data-nav-key]");
  let activeKey = null;

  if (isHomePage()) {

    activeKey = "home";

    ["foods", "apps", "offers"].forEach(function (id) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= 140) {
        activeKey = id;
      }
    });

  } else if (document.body && document.body.dataset.nav) {

    activeKey = document.body.dataset.nav;

  }

  links.forEach(function (link) {
    const on = link.getAttribute("data-nav-key") === activeKey;
    link.classList.toggle("active", on);
    if (on) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

}


/* ---------- Toast messages (replace blocking alert() popups) ---------- */

function showToast(message, type, duration) {

  let box = document.getElementById("frambukToasts");

  if (!box) {
    box = document.createElement("div");
    box.id = "frambukToasts";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }

  const toast = document.createElement("div");
  toast.className = "frambuk-toast " + (type || "info");
  toast.textContent = message;
  box.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add("show");
  });

  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () { toast.remove(); }, 300);
  }, duration || 2600);

}


/* ---------- Clear Cache & Reload ----------
   Clears browser caches, service workers and session data,
   re-downloads this page's CSS / JS / images, then reloads.
   The shopping cart (localStorage) is NOT touched.
   The current #section stays in the address bar. */

async function clearCacheAndReload() {

  if (window.__frambukReloading) {
    return;
  }

  window.__frambukReloading = true;
  closeMenu();
  showToast("🔄 Clearing cache and reloading…", "info", 5000);

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }
  } catch (e) { /* ignore */ }

  try {
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(function (r) { return r.unregister(); }));
    }
  } catch (e) { /* ignore */ }

  try { sessionStorage.clear(); } catch (e) { /* ignore */ }

  /* Force the browser to re-download this page's own files */
  try {

    const urls = new Set([window.location.href.split("#")[0]]);

    document
      .querySelectorAll('link[rel="stylesheet"][href], script[src], img[src]')
      .forEach(function (el) {
        const u = el.href || el.currentSrc || el.src;
        try {
          if (u && new URL(u, location.href).origin === location.origin) {
            urls.add(new URL(u, location.href).href);
          }
        } catch (e) { /* ignore */ }
      });

    await Promise.race([
      Promise.allSettled(
        Array.from(urls).map(function (u) {
          return fetch(u, { cache: "reload", credentials: "same-origin" });
        })
      ),
      new Promise(function (resolve) { setTimeout(resolve, 5000); })
    ]);

  } catch (e) { /* ignore */ }

  const url = new URL(window.location.href);
  url.searchParams.set("_r", Date.now());
  window.location.replace(url.toString());

}


/* ---------- Back-to-top button ---------- */

function setupBackToTop() {

  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "backToTop";
  btn.setAttribute("aria-label", "Back to top");
  btn.textContent = "↑";

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.body.appendChild(btn);

}


/* ---------- One-time page setup ---------- */

document.addEventListener("DOMContentLoaded", function () {

  buildSiteMenu();

  const menu = document.getElementById("menu");
  const burger = document.querySelector(".hamburger");

  /* tapping anywhere outside the open menu closes it (no page darkening) */
  document.addEventListener("click", function (e) {
    if (
      menu && menu.classList.contains("show") &&
      !menu.contains(e.target) &&
      !(burger && burger.contains(e.target))
    ) {
      closeMenu();
    }
  });

  /* keyboard-friendly hamburger */
  if (burger) {
    burger.setAttribute("role", "button");
    burger.setAttribute("tabindex", "0");
    burger.setAttribute("aria-label", "Open menu");
    burger.setAttribute("aria-controls", "menu");
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });
  }

  /* menu link clicks: close the drawer + smooth-scroll on the home page */
  if (menu) {
    menu.addEventListener("click", function (e) {

      const link = e.target.closest("a");

      if (!link) {
        return;
      }

      closeMenu();

      if (!isHomePage()) {
        return;
      }

      const url = new URL(link.href, window.location.href);

      if (!/(^|\/)(index\.html?)?$/i.test(url.pathname)) {
        return;
      }

      e.preventDefault();

      if (url.hash && document.getElementById(url.hash.slice(1))) {
        const target = document.getElementById(url.hash.slice(1));
        const top = target.getBoundingClientRect().top + window.pageYOffset - 85;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        history.pushState(null, "", url.hash);
        setTimeout(updateActiveNav, 600);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }

    });
  }

  /* ESC closes the menu; resizing to desktop resets it */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= MENU_DESKTOP_MIN) {
      closeMenu();
    }
  });

  /* back-to-top + active menu item while scrolling */
  setupBackToTop();

  const topBtn = document.getElementById("backToTop");
  let ticking = false;

  function onScroll() {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(function () {
      topBtn.classList.toggle("show", window.scrollY > 500);
      updateActiveNav();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", updateActiveNav);
  onScroll();

  /* load images lazily (not the logo or the hero) */
  document.querySelectorAll("img").forEach(function (img) {
    if (!img.closest("header") && !img.closest(".hero") && !img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    }
  });

  /* arrived via Clear Cache & Reload: tidy the address bar + confirm */
  const params = new URLSearchParams(window.location.search);

  if (params.has("_r")) {
    params.delete("_r");
    const query = params.toString();
    history.replaceState(
      null, "",
      window.location.pathname + (query ? "?" + query : "") + window.location.hash
    );
    showToast("✅ Cache cleared. You're on the latest version.", "success", 3500);
  }

});


/* keep the cart badge / cart page in sync across open tabs */
window.addEventListener("storage", function (e) {

  if (e.key === STORAGE_KEY) {

    updateCartCount();

    if (document.getElementById("cartItems")) {
      displayCart();
    }

  }

});


/* =========================================================
   CART SYSTEM
========================================================= */

const STORAGE_KEY = "frambukCart";


/* ---------------------------------------------------------
   LOAD CART
--------------------------------------------------------- */

function loadCart() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {

      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {

        return normalizeCart(parsed);

      }

    }

  } catch (e) {

    console.error(
      "Failed to load cart:",
      e
    );

  }

  return [];

}


/* ---------------------------------------------------------
   SAVE CART
--------------------------------------------------------- */

function saveCart(cart) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalizeCart(cart)
      )
    );

  } catch (e) {

    console.error(
      "Failed to save cart:",
      e
    );

  }

}


/* ---------------------------------------------------------
   NORMALIZE CART
--------------------------------------------------------- */

function normalizeCart(cart) {

  if (!Array.isArray(cart)) {
    return [];
  }

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

        name:
          item.name.trim(),

        price:
          Math.max(
            0,
            Number(item.price) || 0
          ),

        quantity:
          Math.max(
            1,
            parseInt(
              item.quantity,
              10
            ) || 1
          )

      };

    });

}


/* ---------------------------------------------------------
   UPDATE CART COUNT
--------------------------------------------------------- */

function updateCartCount() {

  const cart =
    loadCart();

  const total =
    cart.reduce(
      function (sum, item) {

        return (
          sum +
          (item.quantity || 0)
        );

      },
      0
    );


  const counter =
    document.getElementById(
      "cartCount"
    );


  if (counter) {

    counter.textContent =
      total;

    counter.setAttribute(
      "aria-label",
      total +
      " item" +
      (
        total === 1
          ? ""
          : "s"
      ) +
      " in cart"
    );

  }


  return total;

}


/* =========================================================
   ADD TO CART
========================================================= */

function addCart(name, price) {

  if (
    !name ||
    String(name).trim() === ""
  ) {

    console.error(
      "addCart(): Product name is missing."
    );

    return;

  }


  const cleanName =
    String(name).trim();


  const cleanPrice =
    Math.max(
      0,
      Number(price) || 0
    );


  let cart =
    loadCart();


  const existing =
    cart.find(
      function (item) {

        return (
          item.name ===
          cleanName
        );

      }
    );


  if (existing) {

    existing.quantity =
      (existing.quantity || 0) +
      1;

  } else {

    cart.push({

      name:
        cleanName,

      price:
        cleanPrice,

      quantity:
        1

    });

  }


  cart =
    normalizeCart(cart);


  saveCart(cart);


  updateCartCount();


  if (
    document.getElementById(
      "cartItems"
    )
  ) {

    displayCart();

  }


  showToast(
    "🛒 " + cleanName +
    " added to cart",
    "success"
  );


  console.log(
    "Cart after add:",
    cart
  );

}


/* =========================================================
   BUY NOW
========================================================= */

function buyNow(name, price) {

  addCart(
    name,
    price
  );

  checkoutWhatsApp();

}


/* =========================================================
   OPEN CART PAGE
========================================================= */

function openCart() {

  window.location.href =
    "cart.html";

}


/* =========================================================
   WHATSAPP CHECKOUT
========================================================= */

function checkoutWhatsApp() {

  const cart =
    loadCart();


  if (cart.length === 0) {

    showToast(
      "Your cart is empty.",
      "error"
    );

    return;

  }


  let message =
    "Hello Frambuk, I want to order:\n\n";


  let total =
    0;


  cart.forEach(
    function (item) {

      const qty =
        item.quantity || 0;

      const price =
        item.price || 0;

      const subtotal =
        price * qty;


      total +=
        subtotal;


      message +=
        item.name +
        " x " +
        qty +
        " = ₦" +
        subtotal.toLocaleString() +
        "\n";

    }
  );


  message +=
    "\nTotal: ₦" +
    total.toLocaleString() +
    "\n\nThank you.";


  const whatsappNumber =
    "2349067040308";


  const url =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(
      message
    );


  window.open(
    url,
    "_blank"
  );

}


/* =========================================================
   DISPLAY CART
========================================================= */

function displayCart() {

  const box =
    document.getElementById(
      "cartItems"
    );


  if (!box) {
    return;
  }


  const cart =
    loadCart();


  box.innerHTML =
    "";


  if (cart.length === 0) {

    box.innerHTML = `
      <div class="empty-cart">

        <h3>
          Your cart is empty 🛒
        </h3>

        <p>
          You have not added any products yet.
        </p>

        <button
          type="button"
          onclick="location.href='shop.html'"
        >
          Continue Shopping
        </button>

      </div>
    `;


    const totalElement =
      document.getElementById(
        "cartTotal"
      );


    if (totalElement) {

      totalElement.textContent =
        "Total: ₦0";

    }


    updateCartCount();

    return;

  }


  let total =
    0;


  cart.forEach(
    function (item, index) {

      const price =
        item.price || 0;

      const qty =
        item.quantity || 1;

      const subtotal =
        price * qty;


      total +=
        subtotal;


      const images =
        getCartProductImages(
          item.name
        );


      const firstImage =
        images[0] || "";


      box.innerHTML += `

        <div
          class="cart-row"
          data-cart-index="${index}"
        >

          ${
            firstImage
              ? `
            <div class="cart-product-media">

              <img
                src="${firstImage}"
                alt="${item.name}"
                loading="lazy"
              >

              <button
                type="button"
                class="image-preview-btn cart-image-preview"
                onclick="openCartProductImages(${index})"
                aria-label="View images for ${item.name}"
              >
                <span aria-hidden="true">👁</span>
                View Images
              </button>

            </div>
            `
              : ""
          }


          <h3>
            ${item.name}
          </h3>


          <p>
            Unit Price:

            <strong>
              ₦${price.toLocaleString()}
            </strong>
          </p>


          <p>

            Quantity:

            <button
              type="button"
              onclick="changeQty(${index}, -1)"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <strong>
              ${qty}
            </strong>

            <button
              type="button"
              onclick="changeQty(${index}, 1)"
              aria-label="Increase quantity"
            >
              +
            </button>

          </p>


          <p>

            Subtotal:

            <strong>
              ₦${subtotal.toLocaleString()}
            </strong>

          </p>


          <button
            type="button"
            onclick="removeItem(${index})"
          >
            Remove
          </button>

        </div>

      `;

    }
  );


  const totalElement =
    document.getElementById(
      "cartTotal"
    );


  if (totalElement) {

    totalElement.textContent =
      "Total: ₦" +
      total.toLocaleString();

  }


  updateCartCount();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQty(index, delta) {

  let cart =
    loadCart();


  if (
    index < 0 ||
    index >= cart.length
  ) {

    return;

  }


  const newQty =
    (cart[index].quantity || 1) +
    delta;


  if (newQty <= 0) {

    cart.splice(
      index,
      1
    );

  } else {

    cart[index].quantity =
      newQty;

  }


  cart =
    normalizeCart(cart);


  saveCart(cart);


  displayCart();

  updateCartCount();

}


/* =========================================================
   REMOVE ITEM
========================================================= */

function removeItem(index) {

  let cart =
    loadCart();


  if (
    index < 0 ||
    index >= cart.length
  ) {

    return;

  }


  const name =
    cart[index].name;


  cart.splice(
    index,
    1
  );


  cart =
    normalizeCart(cart);


  saveCart(cart);


  displayCart();

  updateCartCount();


  console.log(
    name +
    " removed from cart."
  );

}


/* =========================================================
   CART PRODUCT IMAGES MAPPING
========================================================= */

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


/* =========================================================
   OPEN CART PRODUCT IMAGES
========================================================= */

function openCartProductImages(index) {

  const cart =
    loadCart();


  const item =
    cart[index];


  if (!item) {
    return;
  }


  const images =
    getCartProductImages(
      item.name
    );


  if (!images.length) {
    return;
  }


  ensureFrambukViewer();


  frambukImageSet =
    images.map(
      function (src, i) {

        return {

          src:
            src,

          alt:
            item.name +
            " image " +
            (i + 1)

        };

      }
    );


  frambukImageIndex =
    0;


  /* -------------------------------------------------------
     STOP ANY VIDEO
  ------------------------------------------------------- */

  if (frambukPlayer) {

    frambukPlayer.style.display =
      "none";

    frambukPlayer.src =
      "";

  }


  /* -------------------------------------------------------
     RESET VIDEO CLASSES
  ------------------------------------------------------- */

  if (frambukModal) {

    frambukModal.classList.remove(
      "vertical"
    );

    frambukModal.classList.remove(
      "video-playing"
    );

  }


  if (frambukImage) {

    frambukImage.style.display =
      "block";

  }


  if (frambukModal) {

    frambukModal.classList.add(
      "active"
    );

    frambukModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  frambukBodyOverflow =
    document.body.style.overflow;


  document.body.style.overflow =
    "hidden";


  renderImageViewer();

}


/* =========================================================
   COURSE SLIDER
========================================================= */

function slideCourses(direction) {

  const slider =
    document.getElementById(
      "courseSlider"
    );


  if (!slider) {
    return;
  }


  slider.scrollLeft +=
    Number(direction) *
    350;

}


function slideSection(id, direction) {

  const slider =
    document.getElementById(id);


  if (!slider) {
    return;
  }


  slider.scrollLeft +=
    Number(direction) *
    350;

}


/* =========================================================
   OFFLINE APP DOWNLOAD
========================================================= */

let offlineAppPaymentLink =
  "https://paystack.com/pay/REPLACE-WITH-YOUR-LINK";


function getOfflineVersion() {

  window.open(
    offlineAppPaymentLink,
    "_blank"
  );

}


/* =========================================================
   FRAMBUK VIEWER VARIABLES
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


/* =========================================================
   ENSURE FRAMBUK VIEWER
========================================================= */

function ensureFrambukViewer() {

  frambukModal =
    document.getElementById(
      "videoModal"
    );


  /* -------------------------------------------------------
     CREATE VIEWER IF IT DOES NOT EXIST
  ------------------------------------------------------- */

  if (!frambukModal) {

    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.innerHTML = `

      <div
        id="videoModal"
        class="video-modal"
        aria-hidden="true"
      >

        <div class="video-modal-content">

          <button
            type="button"
            class="modal-close"
            onclick="closeVideo()"
            aria-label="Close viewer"
          >
            ✕
          </button>


          <button
            type="button"
            class="image-nav image-nav-prev"
            id="imagePrev"
            onclick="showPreviousImage()"
            aria-label="Previous image"
          >
            ‹
          </button>


          <iframe
            id="videoPlayer"
            title="Frambuk video player"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            playsinline
          ></iframe>


          <div
            class="image-viewer-area"
          >

            <img
              id="mediaImage"
              alt="Image preview"
            >

          </div>


          <button
            type="button"
            class="image-nav image-nav-next"
            id="imageNext"
            onclick="showNextImage()"
            aria-label="Next image"
          >
            ›
          </button>


          <div
            class="image-thumbnails"
            id="imageThumbnails"
            aria-label="Related images"
          ></div>

        </div>

      </div>

    `;


    document.body.appendChild(
      wrapper.firstElementChild
    );


    frambukModal =
      document.getElementById(
        "videoModal"
      );

  }


  /* -------------------------------------------------------
     CACHE VIEWER ELEMENTS
  ------------------------------------------------------- */

  frambukPlayer =
    document.getElementById(
      "videoPlayer"
    );


  frambukImage =
    document.getElementById(
      "mediaImage"
    );


  frambukThumbs =
    document.getElementById(
      "imageThumbnails"
    );


  frambukPrev =
    document.getElementById(
      "imagePrev"
    );


  frambukNext =
    document.getElementById(
      "imageNext"
    );


  /* -------------------------------------------------------
     BACKGROUND CLICK TO CLOSE
  ------------------------------------------------------- */

  if (
    frambukModal &&
    !frambukModal.dataset.viewerReady
  ) {

    frambukModal.dataset.viewerReady =
      "true";


    frambukModal.addEventListener(
      "click",
      function (e) {

        if (
          e.target ===
          frambukModal
        ) {

          closeVideo();

        }

      }
    );

  }

}


/* =========================================================
   GET CARD IMAGES
========================================================= */

function getCardImages(card) {

  if (!card) {
    return [];
  }


  const images = [

    ...card.querySelectorAll(
      ".product-image-slider img"
    ),

    ...card.querySelectorAll(
      ".media-thumb-wrapper img"
    ),

    ...card.querySelectorAll(
      ":scope > img"
    )

  ]
    .map(
      function (img) {

        return {

          src:
            img.currentSrc ||
            img.src,

          alt:
            img.alt ||
            "Image preview"

        };

      }
    )
    .filter(
      function (item) {

        return item.src;

      }
    );


  /* -------------------------------------------------------
     REMOVE DUPLICATES
  ------------------------------------------------------- */

  return images.filter(
    function (
      item,
      index,
      array
    ) {

      return (
        array.findIndex(
          function (x) {

            return (
              x.src ===
              item.src
            );

          }
        ) === index
      );

    }
  );

}


/* =========================================================
   OPEN PRODUCT IMAGES
========================================================= */

function openProductImages(card) {

  ensureFrambukViewer();


  frambukImageSet =
    getCardImages(card);


  if (
    !frambukImageSet.length
  ) {

    return;

  }


  frambukImageIndex =
    0;


  /* -------------------------------------------------------
     STOP VIDEO COMPLETELY
  ------------------------------------------------------- */

  if (frambukPlayer) {

    frambukPlayer.style.display =
      "none";

    frambukPlayer.src =
      "";

  }


  /* -------------------------------------------------------
     RESET VIDEO-SPECIFIC CSS STATES
  ------------------------------------------------------- */

  if (frambukModal) {

    frambukModal.classList.remove(
      "vertical"
    );

    frambukModal.classList.remove(
      "video-playing"
    );

  }


  if (frambukImage) {

    frambukImage.style.display =
      "block";

  }


  if (frambukModal) {

    frambukModal.classList.add(
      "active"
    );

    frambukModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  frambukBodyOverflow =
    document.body.style.overflow;


  document.body.style.overflow =
    "hidden";


  renderImageViewer();

}


/* =========================================================
   RENDER IMAGE VIEWER
========================================================= */

function renderImageViewer() {

  if (
    !frambukImage ||
    !frambukImageSet.length
  ) {

    return;

  }


  const item =
    frambukImageSet[
      frambukImageIndex
    ];


  if (!item) {
    return;
  }


  frambukImage.src =
    item.src;


  frambukImage.alt =
    item.alt;


  /* -------------------------------------------------------
     THUMBNAILS
  ------------------------------------------------------- */

  if (frambukThumbs) {

    frambukThumbs.innerHTML =
      "";


    frambukImageSet.forEach(
      function (
        image,
        index
      ) {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "image-thumb" +
          (
            index ===
            frambukImageIndex
              ? " active"
              : ""
          );


        button.setAttribute(
          "aria-label",
          "Show image " +
          (index + 1)
        );


        const thumb =
          document.createElement(
            "img"
          );


        thumb.src =
          image.src;


        thumb.alt =
          "";


        button.appendChild(
          thumb
        );


        button.addEventListener(
          "click",
          function () {

            frambukImageIndex =
              index;

            renderImageViewer();

          }
        );


        frambukThumbs.appendChild(
          button
        );

      }
    );


    const active =
      frambukThumbs.children[
        frambukImageIndex
      ];


    if (active) {

      active.scrollIntoView({

        behavior:
          "smooth",

        block:
          "nearest",

        inline:
          "center"

      });

    }

  }


  /* -------------------------------------------------------
     IMAGE NAVIGATION
  ------------------------------------------------------- */

  const multiple =
    frambukImageSet.length >
    1;


  if (frambukPrev) {

    frambukPrev.classList.toggle(
      "hidden",
      !multiple
    );

  }


  if (frambukNext) {

    frambukNext.classList.toggle(
      "hidden",
      !multiple
    );

  }

}


/* =========================================================
   PREVIOUS IMAGE
========================================================= */

function showPreviousImage() {

  if (
    frambukImageSet.length <
    2
  ) {

    return;

  }


  frambukImageIndex =
    (
      frambukImageIndex -
      1 +
      frambukImageSet.length
    ) %
    frambukImageSet.length;


  renderImageViewer();

}


/* =========================================================
   NEXT IMAGE
========================================================= */

function showNextImage() {

  if (
    frambukImageSet.length <
    2
  ) {

    return;

  }


  frambukImageIndex =
    (
      frambukImageIndex +
      1
    ) %
    frambukImageSet.length;


  renderImageViewer();

}


/* =========================================================
   YOUTUBE / GOOGLE DRIVE VIDEO CONVERTER

   Supports:
   - YouTube watch URLs
   - YouTube Shorts
   - youtu.be URLs
   - Google Drive videos
========================================================= */

function convertToEmbed(url) {

  if (!url) {
    return "";
  }


  const autoplay =
    "?autoplay=1&rel=0&playsinline=1";


  let parsedUrl;


  try {

    parsedUrl =
      new URL(
        url,
        window.location.href
      );

  } catch (e) {

    console.error(
      "Invalid video URL:",
      url
    );

    return url;

  }


  const hostname =
    parsedUrl.hostname
      .toLowerCase()
      .replace(
        /^www\./,
        ""
      );


  /* -------------------------------------------------------
     NORMAL YOUTUBE WATCH
  ------------------------------------------------------- */

  if (
    hostname ===
      "youtube.com" ||
    hostname ===
      "m.youtube.com"
  ) {

    if (
      parsedUrl.pathname ===
      "/watch"
    ) {

      const videoID =
        parsedUrl.searchParams.get(
          "v"
        );


      if (videoID) {

        return (
          "https://www.youtube.com/embed/" +
          encodeURIComponent(
            videoID
          ) +
          autoplay
        );

      }

    }


    /* -----------------------------------------------------
       YOUTUBE SHORTS
    ----------------------------------------------------- */

    if (
      parsedUrl.pathname.startsWith(
        "/shorts/"
      )
    ) {

      const videoID =
        parsedUrl.pathname
          .split("/shorts/")[1]
          .split("/")[0];


      if (videoID) {

        return (
          "https://www.youtube.com/embed/" +
          encodeURIComponent(
            videoID
          ) +
          autoplay
        );

      }

    }

  }


  /* -------------------------------------------------------
     YOUTU.BE
  ------------------------------------------------------- */

  if (
    hostname ===
    "youtu.be"
  ) {

    const videoID =
      parsedUrl.pathname
        .replace(
          /^\/+/,
          ""
        )
        .split("/")[0];


    if (videoID) {

      return (
        "https://www.youtube.com/embed/" +
        encodeURIComponent(
          videoID
        ) +
        autoplay
      );

    }

  }


  /* -------------------------------------------------------
     GOOGLE DRIVE
  ------------------------------------------------------- */

  if (
    hostname ===
      "drive.google.com" ||
    hostname.endsWith(
      ".drive.google.com"
    )
  ) {

    const match =
      parsedUrl.pathname.match(
        /\/d\/([^/]+)/
      );


    if (match) {

      return (
        "https://drive.google.com/file/d/" +
        encodeURIComponent(
          match[1]
        ) +
        "/preview"
      );

    }

  }


  /* -------------------------------------------------------
     UNRECOGNIZED URL
  ------------------------------------------------------- */

  return url;

}


/* =========================================================
   DETECT YOUTUBE SHORT
========================================================= */

function isYouTubeShort(url) {

  if (!url) {
    return false;
  }


  try {

    const parsedUrl =
      new URL(
        url,
        window.location.href
      );


    const hostname =
      parsedUrl.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );


    return (
      (
        hostname ===
          "youtube.com" ||
        hostname ===
          "m.youtube.com"
      ) &&
      parsedUrl.pathname.startsWith(
        "/shorts/"
      )
    );

  } catch (e) {

    /*
       Fallback for unusual URLs.
    */

    return (
      url.includes(
        "youtube.com/shorts/"
      ) ||
      url.includes(
        "www.youtube.com/shorts/"
      )
    );

  }

}


/* =========================================================
   OPEN VIDEO POPUP

   Corrected WordOfLife-style behavior:
   - YouTube URL conversion
   - Autoplay
   - Related videos reduced
   - Plays inline
   - YouTube Shorts displayed vertically
   - Google Drive support
   - Image viewer hidden
   - Image navigation hidden
   - Video-playing class applied
   - Page scrolling locked
========================================================= */

function openVideo(url) {

  if (!url) {
    return;
  }


  ensureFrambukViewer();


  if (!frambukModal) {
    return;
  }


  /* -------------------------------------------------------
     MOBILE DETECTION
  ------------------------------------------------------- */

  const isMobile =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      .test(
        navigator.userAgent
      );


  /* -------------------------------------------------------
     GOOGLE DRIVE ON MOBILE

     Preserve the WordOfLife behavior.
  ------------------------------------------------------- */

  if (
    isMobile &&
    url.includes(
      "drive.google.com"
    )
  ) {

    window.open(
      url,
      "_blank"
    );

    return;

  }


  /* -------------------------------------------------------
     DETERMINE VIDEO TYPE
  ------------------------------------------------------- */

  const isShort =
    isYouTubeShort(url);


  /* -------------------------------------------------------
     CLEAR IMAGE VIEWER
  ------------------------------------------------------- */

  frambukImageSet =
    [];

  frambukImageIndex =
    0;


  if (frambukImage) {

    frambukImage.src =
      "";

    frambukImage.style.display =
      "none";

  }


  if (frambukThumbs) {

    frambukThumbs.innerHTML =
      "";

  }


  /* -------------------------------------------------------
     HIDE IMAGE NAVIGATION
  ------------------------------------------------------- */

  if (frambukPrev) {

    frambukPrev.classList.add(
      "hidden"
    );

  }


  if (frambukNext) {

    frambukNext.classList.add(
      "hidden"
    );

  }


  /* -------------------------------------------------------
     APPLY VIDEO POPUP STATES

     .video-playing
       Controls close-button positioning.

     .vertical
       Changes the popup to 9:16 for Shorts.
  ------------------------------------------------------- */

  frambukModal.classList.add(
    "video-playing"
  );


  frambukModal.classList.toggle(
    "vertical",
    isShort
  );


  /* -------------------------------------------------------
     SHOW VIDEO PLAYER
  ------------------------------------------------------- */

  if (frambukPlayer) {

    /*
       Clear the previous source first.
       This prevents an old video from remaining active
       while a new video is being loaded.
    */

    frambukPlayer.src =
      "";


    frambukPlayer.style.display =
      "block";


    /*
       Force the browser to recognize the new source
       as a fresh video load.
    */

    const embedUrl =
      convertToEmbed(url);


    setTimeout(
      function () {

        if (
          frambukPlayer &&
          frambukModal.classList.contains(
            "active"
          )
        ) {

          frambukPlayer.src =
            embedUrl;

        }

      },
      0
    );

  }


  /* -------------------------------------------------------
     OPEN MODAL
  ------------------------------------------------------- */

  frambukModal.classList.add(
    "active"
  );


  frambukModal.setAttribute(
    "aria-hidden",
    "false"
  );


  /* -------------------------------------------------------
     LOCK PAGE SCROLLING
  ------------------------------------------------------- */

  frambukBodyOverflow =
    document.body.style.overflow;


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   OPEN SINGLE IMAGE
========================================================= */

function openImage(url) {

  if (!url) {
    return;
  }


  ensureFrambukViewer();


  frambukImageSet = [

    {

      src:
        url,

      alt:
        "Gallery image"

    }

  ];


  frambukImageIndex =
    0;


  /* -------------------------------------------------------
     STOP VIDEO
  ------------------------------------------------------- */

  if (frambukPlayer) {

    frambukPlayer.src =
      "";

    frambukPlayer.style.display =
      "none";

  }


  /* -------------------------------------------------------
     REMOVE VIDEO STATES
  ------------------------------------------------------- */

  if (frambukModal) {

    frambukModal.classList.remove(
      "vertical"
    );

    frambukModal.classList.remove(
      "video-playing"
    );

  }


  /* -------------------------------------------------------
     SHOW IMAGE
  ------------------------------------------------------- */

  if (frambukImage) {

    frambukImage.style.display =
      "block";

  }


  /* -------------------------------------------------------
     OPEN MODAL
  ------------------------------------------------------- */

  frambukModal.classList.add(
    "active"
  );


  frambukModal.setAttribute(
    "aria-hidden",
    "false"
  );


  frambukBodyOverflow =
    document.body.style.overflow;


  document.body.style.overflow =
    "hidden";


  renderImageViewer();

}


/* =========================================================
   CLOSE VIDEO / IMAGE VIEWER

   IMPORTANT:
   Clearing iframe.src stops the video completely.
========================================================= */

function closeVideo() {

  if (!frambukModal) {
    return;
  }


  /* -------------------------------------------------------
     CLOSE MODAL
  ------------------------------------------------------- */

  frambukModal.classList.remove(
    "active"
  );


  /* -------------------------------------------------------
     REMOVE VIDEO-SPECIFIC STATES
  ------------------------------------------------------- */

  frambukModal.classList.remove(
    "vertical"
  );


  frambukModal.classList.remove(
    "video-playing"
  );


  frambukModal.setAttribute(
    "aria-hidden",
    "true"
  );


  /* -------------------------------------------------------
     STOP VIDEO COMPLETELY
  ------------------------------------------------------- */

  if (frambukPlayer) {

    frambukPlayer.src =
      "";

    frambukPlayer.style.display =
      "none";

  }


  /* -------------------------------------------------------
     CLEAR IMAGE
  ------------------------------------------------------- */

  if (frambukImage) {

    frambukImage.src =
      "";

    frambukImage.style.display =
      "none";

  }


  /* -------------------------------------------------------
     CLEAR THUMBNAILS
  ------------------------------------------------------- */

  if (frambukThumbs) {

    frambukThumbs.innerHTML =
      "";

  }


  /* -------------------------------------------------------
     HIDE IMAGE NAVIGATION
  ------------------------------------------------------- */

  if (frambukPrev) {

    frambukPrev.classList.add(
      "hidden"
    );

  }


  if (frambukNext) {

    frambukNext.classList.add(
      "hidden"
    );

  }


  /* -------------------------------------------------------
     RESET IMAGE COLLECTION
  ------------------------------------------------------- */

  frambukImageSet =
    [];


  frambukImageIndex =
    0;


  /* -------------------------------------------------------
     RESTORE PAGE SCROLLING
  ------------------------------------------------------- */

  document.body.style.overflow =
    frambukBodyOverflow || "";

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
  "keydown",
  function (e) {

    if (
      !frambukModal ||
      !frambukModal.classList.contains(
        "active"
      )
    ) {

      return;

    }


    /* -----------------------------------------------------
       ESC = CLOSE
    ----------------------------------------------------- */

    if (
      e.key ===
      "Escape"
    ) {

      closeVideo();

      return;

    }


    /* -----------------------------------------------------
       LEFT ARROW = PREVIOUS IMAGE
    ----------------------------------------------------- */

    if (
      e.key ===
      "ArrowLeft"
    ) {

      showPreviousImage();

    }


    /* -----------------------------------------------------
       RIGHT ARROW = NEXT IMAGE
    ----------------------------------------------------- */

    if (
      e.key ===
      "ArrowRight"
    ) {

      showNextImage();

    }

  }
);


/* =========================================================
   PRODUCT IMAGE TAP LOOP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    document
      .querySelectorAll(
        ".product-image-slider"
      )
      .forEach(
        function (slider) {

          const images =
            slider.querySelectorAll(
              "img"
            );


          if (
            images.length <
            2
          ) {

            return;

          }


          let currentImage =
            0;


          /* -------------------------------------------------
             INITIAL IMAGE POSITIONS
          ------------------------------------------------- */

          images.forEach(
            function (
              img,
              index
            ) {

              img.style.transform =
                "translateX(" +
                (
                  index *
                  100
                ) +
                "%)";

            }
          );


          /* -------------------------------------------------
             TAP/CLICK IMAGE TO NEXT IMAGE
          ------------------------------------------------- */

          slider.addEventListener(
            "click",
            function (e) {

              /*
                 Do not interfere with
                 buttons or links.
              */

              if (
                e.target.closest(
                  "button, a"
                )
              ) {

                return;

              }


              currentImage++;


              if (
                currentImage >=
                images.length
              ) {

                currentImage =
                  0;

              }


              images.forEach(
                function (
                  img,
                  index
                ) {

                  img.style.transform =
                    "translateX(" +
                    (
                      (
                        index -
                        currentImage
                      ) *
                      100
                    ) +
                    "%)";

                }
              );

            }
          );

        }
      );

  }
);


/* =========================================================
   DISABLE RIGHT CLICK (MOUSE ONLY)
   Light deterrent only.
   - Mouse right-click menu stays disabled.
   - Touch long-press is NOT blocked, so selecting text and the
     Copy / Paste handles still work on phones and tablets.
   - Selecting text, Ctrl+C, Ctrl+V, Ctrl+A and dragging to
     select all work normally.
========================================================= */

let frambukLastPointerType =
  "mouse";

document.addEventListener(
  "pointerdown",
  function (e) {

    frambukLastPointerType =
      e.pointerType || "mouse";

  },
  true
);

document.addEventListener(
  "contextmenu",
  function (e) {

    if (
      frambukLastPointerType === "touch" ||
      frambukLastPointerType === "pen"
    ) {

      return;

    }

    e.preventDefault();

  }
);


/* =========================================================
   BANK DETAILS MODAL
========================================================= */

function openBankDetails() {

  /* -------------------------------------------------------
     CALCULATE CART TOTAL
  ------------------------------------------------------- */

  const cart =
    loadCart();


  let total =
    0;


  cart.forEach(
    function (item) {

      total +=
        (item.price || 0) *
        (item.quantity || 0);

    }
  );


  /* -------------------------------------------------------
     UPDATE TOTAL
  ------------------------------------------------------- */

  const totalEl =
    document.getElementById(
      "bankTotal"
    );


  if (totalEl) {

    totalEl.textContent =
      "Total: ₦" +
      total.toLocaleString();

  }


  /* -------------------------------------------------------
     SHOW BANK MODAL
  ------------------------------------------------------- */

  const modal =
    document.getElementById(
      "bankModal"
    );


  if (modal) {

    modal.classList.add(
      "active"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";

  }

}


/* =========================================================
   CLOSE BANK DETAILS
========================================================= */

function closeBankDetails() {

  const modal =
    document.getElementById(
      "bankModal"
    );


  if (modal) {

    modal.classList.remove(
      "active"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow =
      "";

  }

}


/* =========================================================
   COPY BANK DETAIL
========================================================= */

function copyBankDetail(text) {

  if (!navigator.clipboard) {

    showToast(
      "Clipboard not supported. Please copy manually.",
      "error"
    );

    return;

  }


  navigator.clipboard
    .writeText(text)
    .then(
      function () {

        showToast(
          "✅ Copied: " +
          text,
          "success",
          3500
        );

      }
    )
    .catch(
      function () {

        showToast(
          "❌ Failed to copy. Please try again.",
          "error"
        );

      }
    );

}


/* =========================================================
   CLOSE BANK MODAL ON BACKGROUND CLICK
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const bankModal =
      document.getElementById(
        "bankModal"
      );


    if (bankModal) {

      bankModal.addEventListener(
        "click",
        function (e) {

          if (
            e.target ===
            bankModal
          ) {

            closeBankDetails();

          }

        }
      );

    }

  }
);


/* =========================================================
   INITIALIZE CART
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    updateCartCount();

    if (
      document.getElementById(
        "cartItems"
      )
    ) {

      displayCart();

    }

  }
);


/* =========================================================
   END OF FRAMBUK MASTER SCRIPT
========================================================= */
