const DEFAULT_PRODUCTS = [
  {
    id: "premium",
    name: "Premium Chai",
    category: "Black Tea",
    price: 135,
    size: "250 g",
    packs: [
      { size: "250 g", price: 135 },
      { size: "500 g (2 × 250 g)", price: 270 }
    ],
    desc: "A rich, aromatic premium CTC chai for everyday moments."
  },
  {
    id: "dhaba",
    name: "Dhaba Chai",
    category: "Black Tea",
    price: 110,
    size: "250 g",
    desc: "A strong, full-bodied chai made for a bold cup."
  },
  {
    id: "hibiscus",
    name: "Hibiscus Tea",
    category: "Herbal Tea",
    price: 329,
    size: "100 g",
    desc: "A vibrant floral infusion with a refreshing character."
  },
  {
    id: "butterfly",
    name: "Butterfly Pea Tea",
    category: "Specialty Tea",
    price: 379,
    size: "100 g",
    desc: "A distinctive blue herbal infusion with an elegant presentation."
  },
  {
    id: "green",
    name: "Green Tea",
    category: "Green Tea",
    price: 349,
    size: "100 g",
    desc: "A clean, delicate tea for a lighter everyday ritual."
  },
  {
    id: "chamomile",
    name: "Chamomile Tea",
    category: "Herbal Tea",
    price: 359,
    size: "100 g",
    desc: "A gentle floral infusion made for slow, quiet moments."
  }
];

const getProducts = () => {
  try {
    return JSON.parse(localStorage.getItem("sk_products") || "null") || DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

const saveProducts = p =>
  localStorage.setItem("sk_products", JSON.stringify(p));

const cart = () => {
  try {
    return JSON.parse(localStorage.getItem("sk_cart") || "[]");
  } catch {
    return [];
  }
};

const saveCart = c => {
  localStorage.setItem("sk_cart", JSON.stringify(c));
  updateCartCount();
};

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

function updateCartCount() {
  document.querySelectorAll("#cartCount").forEach(e => {
    e.textContent = cart().reduce(
      (s, i) => s + (Number(i.qty) || 0), 0
    );
  });
}

function productPack(name) {
  return `
    <div class="product-pack">
      <small>SURAJ KIRAN</small>
      <strong>${esc(name)}</strong>
      <small>TEA</small>
    </div>
  `;
}

function images(p) {
  return [...new Set([
    ...(Array.isArray(p.images) ? p.images : []),
    p.image
  ].filter(Boolean))];
}

function media(p) {
  const src = images(p)[0];

  return src
    ? `<img
         src="${esc(src)}"
         alt="${esc(p.name)}"
         loading="lazy"
         style="width:100%;height:100%;object-fit:contain"
       >`
    : productPack(p.name);
}

function card(p) {
  return `
    <article class="product-card">
      <a href="product.html?id=${encodeURIComponent(p.id)}">
        <div class="product-media">
          ${media(p)}
        </div>
      </a>

      <div class="product-body">
        <span class="product-cat">${esc(p.category)}</span>

        <h3 class="product-name">
          <a href="product.html?id=${encodeURIComponent(p.id)}">
            ${esc(p.name)}
          </a>
        </h3>

        <p class="product-desc">${esc(p.desc)}</p>

        <div class="product-meta">
          <strong class="price">
            ₹${Number(p.price).toLocaleString("en-IN")}
          </strong>

          <a class="text-link"
             href="product.html?id=${encodeURIComponent(p.id)}">
            View details
          </a>
        </div>

        <button class="quick-add"
                data-add="${esc(p.id)}"
                aria-label="Add ${esc(p.name)}">
          +
        </button>
      </div>
    </article>
  `;
}

function addToCart(id, size, price, qty = 1) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;

  size = size || p.size || "1 pack";
  price = Number(price ?? p.price);

  const c = cart();
  const item = c.find(x => x.id === id && x.size === size);

  if (item) {
    item.qty += qty;
  } else {
    c.push({ id, size, price, qty });
  }

  saveCart(c);
  alert("Added to your bag.");
}

function bindAdds() {
  document.querySelectorAll("[data-add]").forEach(b => {
    b.onclick = e => {
      e.preventDefault();
      e.stopPropagation();

      const p = getProducts().find(
        x => x.id === b.dataset.add
      );

      if (p) {
        addToCart(p.id, p.size, p.price);
      }
    };
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const feat = document.getElementById("featuredProducts");
  const products = getProducts();

  if (grid) {
    const box = document.getElementById("filters");
    const search = document.getElementById("searchInput");

    let active = "All";

    const draw = () => {
      const q = (search?.value || "").toLowerCase();

      grid.innerHTML = products
        .filter(p =>
          (active === "All" || p.category === active) &&
          (p.name + " " + p.desc).toLowerCase().includes(q)
        )
        .map(card)
        .join("");

      bindAdds();
    };

    if (box) {
      box.innerHTML = [
        "All",
        ...new Set(products.map(p => p.category))
      ].map(x => `
        <button class="filter ${x === "All" ? "active" : ""}">
          ${esc(x)}
        </button>
      `).join("");

      box.querySelectorAll(".filter").forEach(b => {
        b.onclick = () => {
          active = b.textContent;

          box.querySelectorAll(".filter").forEach(
            x => x.classList.remove("active")
          );

          b.classList.add("active");
          draw();
        };
      });
    }

    if (search) search.oninput = draw;

    draw();
  }

  if (feat) {
    feat.innerHTML = products.slice(0, 3).map(card).join("");
    bindAdds();
  }
}

function renderDetail() {
  const el = document.getElementById("productDetail");
  if (!el) return;

  const products = getProducts();

  const id = new URLSearchParams(location.search)
    .get("id") || "premium";

  const p = products.find(x => x.id === id) || products[0];

  if (!p) return;

  const packs = Array.isArray(p.packs) && p.packs.length
    ? p.packs
    : [{ size: p.size || "1 pack", price: p.price }];

  const pics = images(p);
  let current = 0;

  el.innerHTML = `
    <div class="detail-grid">

      <div>
        <div class="detail-image"
             id="galleryMain"
             style="touch-action:pan-y">
          ${media(p)}
        </div>

        ${pics.length > 1 ? `
          <div id="galleryThumbs"
               style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">

            ${pics.map((src, i) => `
              <button data-photo="${i}"
                      style="width:65px;height:65px;padding:3px;border:1px solid #ccc;background:white">
                <img src="${esc(src)}"
                     alt="Photo ${i + 1}"
                     style="width:100%;height:100%;object-fit:contain">
              </button>
            `).join("")}

          </div>

          <p class="muted" id="galleryCount">
            1 / ${pics.length} · Swipe to view
          </p>
        ` : ""}
      </div>

      <div class="detail-copy">

        <span class="eyebrow">${esc(p.category)}</span>

        <h1>${esc(p.name)}</h1>

        <strong class="price" id="detailPrice">
          ₹${Number(packs[0].price).toLocaleString("en-IN")}
        </strong>

        <div style="margin:20px 0">
          <label for="packSelect">Pack size</label>

          <select id="packSelect"
                  style="display:block;padding:12px;width:100%;margin-top:8px">

            ${packs.map((x, i) => `
              <option value="${i}">
                ${esc(x.size)} — ₹${Number(x.price).toLocaleString("en-IN")}
              </option>
            `).join("")}

          </select>
        </div>

        <div class="quantity">
          <button id="minus">−</button>

          <input id="qty"
                 type="number"
                 min="1"
                 value="1">

          <button id="plus">+</button>
        </div>

        <button class="btn btn-primary full" id="detailAdd">
          Add to Cart
        </button>

        <div style="margin-top:30px">
          <h3>Description</h3>
          <p class="muted">${esc(p.desc)}</p>
        </div>

      </div>
    </div>
  `;

  const select = document.getElementById("packSelect");
  const qty = document.getElementById("qty");

  select.onchange = () => {
    document.getElementById("detailPrice").textContent =
      "₹" + Number(
        packs[+select.value].price
      ).toLocaleString("en-IN");
  };

  document.getElementById("minus").onclick = () => {
    qty.value = Math.max(1, (parseInt(qty.value) || 1) - 1);
  };

  document.getElementById("plus").onclick = () => {
    qty.value = Math.max(1, (parseInt(qty.value) || 1) + 1);
  };

  document.getElementById("detailAdd").onclick = () => {
    const x = packs[+select.value];

    addToCart(
      p.id,
      x.size,
      x.price,
      Math.max(1, parseInt(qty.value) || 1)
    );
  };

  if (pics.length > 1) {
    const main = document.getElementById("galleryMain");

    function show(i) {
      current = (i + pics.length) % pics.length;

      main.innerHTML = `
        <img src="${esc(pics[current])}"
             alt="${esc(p.name)}"
             style="width:100%;height:100%;object-fit:contain">
      `;

      document.getElementById("galleryCount").textContent =
        `${current + 1} / ${pics.length} · Swipe to view`;
    }

    document.querySelectorAll("[data-photo]").forEach(b => {
      b.onclick = () => show(+b.dataset.photo);
    });

    let start = 0;

    main.addEventListener("touchstart", e => {
      start = e.touches[0].clientX;
    }, { passive: true });

    main.addEventListener("touchend", e => {
      const delta = e.changedTouches[0].clientX - start;

      if (Math.abs(delta) > 40) {
        show(current + (delta < 0 ? 1 : -1));
      }
    }, { passive: true });
  }
}

function renderCart() {
  const box = document.getElementById("cartItems");
  if (!box) return;

  const products = getProducts();
  const c = cart();

  let total = 0;

  if (!c.length) {
    box.innerHTML = `
      <div class="panel" style="background:#fff;padding:40px">
        <h2>Your bag is empty.</h2>
        <a class="text-link" href="products.html">
          Explore our teas →
        </a>
      </div>
    `;
  } else {
    box.innerHTML = c.map((i, n) => {
      const p = products.find(x => x.id === i.id);
      if (!p) return "";

      const price = Number(i.price ?? p.price);
      const qty = Number(i.qty) || 1;

      total += price * qty;

      return `
        <div class="cart-item">

          <div class="thumb">
            ${media(p)}
          </div>

          <div>
            <strong class="product-name" style="font-size:20px">
              ${esc(p.name)}
            </strong>

            <p class="muted small">
              ${esc(i.size || p.size)}
            </p>

            <div class="quantity" style="margin:8px 0">
              <button data-dec="${n}">−</button>
              <span>${qty}</span>
              <button data-inc="${n}">+</button>
            </div>
          </div>

          <div class="cart-price">
            <strong class="price">
              ₹${(price * qty).toLocaleString("en-IN")}
            </strong>

            <button class="text-link"
                    data-remove="${n}"
                    style="border:0;background:none;margin-top:8px">
              Remove
            </button>
          </div>

        </div>
      `;
    }).join("");
  }

  for (const id of ["subtotal", "total"]) {
    const e = document.getElementById(id);

    if (e) {
      e.textContent = "₹" + total.toLocaleString("en-IN");
    }
  }

  box.querySelectorAll("[data-inc]").forEach(b => {
    b.onclick = () => changeQty(+b.dataset.inc, 1);
  });

  box.querySelectorAll("[data-dec]").forEach(b => {
    b.onclick = () => changeQty(+b.dataset.dec, -1);
  });

  box.querySelectorAll("[data-remove]").forEach(b => {
    b.onclick = () => {
      const a = cart();
      a.splice(+b.dataset.remove, 1);

      saveCart(a);
      renderCart();
    };
  });

  const checkout = document.getElementById("checkoutBtn");

  if (checkout) {
    checkout.onclick = () =>
      alert("Checkout is ready for payment integration in the next phase.");
  }
}

function changeQty(n, d) {
  const c = cart();

  if (!c[n]) return;

  c[n].qty += d;

  if (c[n].qty <= 0) {
    c.splice(n, 1);
  }

  saveCart(c);
  renderCart();
}

function admin() {
  const list = document.getElementById("adminProducts");
  const form = document.getElementById("productForm");

  if (!list || !form) return;

  const map = {
    id: "pId",
    name: "pName",
    category: "pCategory",
    price: "pPrice",
    size: "pSize",
    desc: "pDesc",
    image: "pImage"
  };

  const render = () => {
    list.innerHTML = getProducts().map(p => `
      <div class="admin-row">

        <div class="admin-row-info">
          <div class="mini">
            ${p.image
              ? `<img src="${esc(p.image)}"
                      style="width:100%;height:100%;object-fit:cover">`
              : "🍵"
            }
          </div>

          <div>
            <strong>${esc(p.name)}</strong>

            <div class="muted small">
              ${esc(p.category)} · ₹${Number(p.price)}
            </div>
          </div>
        </div>

        <div class="admin-actions">
          <button data-edit="${esc(p.id)}">Edit</button>
          <button data-del="${esc(p.id)}">Delete</button>
        </div>

      </div>
    `).join("");

    list.querySelectorAll("[data-edit]").forEach(b => {
      b.onclick = () => {
        const p = getProducts().find(
          x => x.id === b.dataset.edit
        );

        for (const [k, v] of Object.entries(map)) {
          document.getElementById(v).value = p[k] ?? "";
        }

        location.hash = "editor";
      };
    });

    list.querySelectorAll("[data-del]").forEach(b => {
      b.onclick = () => {
        if (confirm("Delete this product?")) {
          saveProducts(
            getProducts().filter(x => x.id !== b.dataset.del)
          );

          render();
        }
      };
    });
  };

  form.onsubmit = e => {
    e.preventDefault();

    const p = {
      id: document.getElementById("pId").value ||
          crypto.randomUUID(),

      name: document.getElementById("pName").value,

      category: document.getElementById("pCategory").value,

      price: +document.getElementById("pPrice").value,

      size: document.getElementById("pSize").value,

      desc: document.getElementById("pDesc").value,

      image: document.getElementById("pImage").value
    };

    const all = getProducts();
    const idx = all.findIndex(x => x.id === p.id);

    if (idx >= 0) {
      all[idx] = { ...all[idx], ...p };
    } else {
      all.push(p);
    }

    saveProducts(all);

    form.reset();

    document.getElementById("pId").value = "";

    render();

    alert("Saved in this browser only.");
  };

  document.getElementById("newProduct").onclick = () => {
    form.reset();
    document.getElementById("pId").value = "";
  };

  document.getElementById("resetForm").onclick = () => {
    form.reset();
  };

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderProducts();
  renderDetail();
  renderCart();
  admin();

  const menu = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");

  if (menu && nav) {
    menu.onclick = () => nav.classList.toggle("open");
  }
});
