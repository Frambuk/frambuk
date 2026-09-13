/* =========================================================
   FRAMBUK WEBSITE MASTER SCRIPT – FULL MERGED VERSION
   =========================================================

   Includes:
   1. Hamburger menu
   2. Mobile menu auto-close
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
   HAMBURGER MENU
========================================================= */

function toggleMenu() {
  const menu = document.getElementById("menu");

  if (menu) {
    menu.classList.toggle("show");
  }
}


document.addEventListener("DOMContentLoaded", function () {

  const menu = document.getElementById("menu");

  if (!menu) {
    return;
  }

  menu.querySelectorAll("a").forEach(function (link) {

    link.addEventListener("click", function () {

      menu.classList.remove("show");

    });

  });

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


  alert(
    cleanName +
    " added to cart"
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

    alert(
      "Your cart is empty."
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
   DISABLE RIGHT CLICK
   Light deterrent only.
========================================================= */

document.addEventListener(
  "contextmenu",
  function (e) {

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

    alert(
      "Clipboard API not supported. Please copy manually."
    );

    return;

  }


  navigator.clipboard
    .writeText(text)
    .then(
      function () {

        alert(
          "✅ Copied: " +
          text
        );

      }
    )
    .catch(
      function () {

        alert(
          "❌ Failed to copy. Please try again."
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
