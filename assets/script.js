// add to cart item functionality
const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');

addToCartForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    // Prevent normal submission
    event.preventDefault();

    // Submit form with ajax
    await fetch("/cart/add", {
      method: "post",
      body: new FormData(form),
    });

    // Get new cart object
    const res = await fetch("/cart.json");
    const cart = await res.json();

    // Update cart count
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = cart.item_count;
    });

    // Display message
    const message = document.createElement("p");
    message.classList.add("added-to-cart");
    message.textContent = "Added to cart!";
    form.appendChild(message);
  });
});

///// CART DRAWER FUNCTIONALITY //////////

// adds extra class for showing the cart when opened 
function openCartDrawer() {
    document.querySelector(".cart-drawer").classList.add('cart-drawer-active');
}

// removes the extra class that shows the cart drawer
function closeCartDrawer() {
    document.querySelector(".cart-drawer").classList.remove("cart-drawer-active"); 
}

//function for updating the items count in the cart drawer
function updateCartItemCounts(count) {
    document.querySelectorAll(".cart-count").forEach((el) =>{
        el.textContent = count;
    });
}

// async function that wait on the promise of updating the cart when new item added or when qty changed
async function updateCartDrawer() {
    const res = await fetch("/?section_id=cart-popup"); //fetch new cart with updated items, fecthes entire section
    const text = await res.text(); // returns text from ajax call (not necessary unless for debugging)
    const html = document.createElement("div");
    html.innerHTML = text;

    const newBox = html.querySelector(".cart-drawer").innerHTML; // create new box with updated items
    document.querySelector(".cart-drawer").innerHTML = newBox;

    addCartDrawerListeners();
}

function addCartDrawerListeners() {
    //update quantities
    document.querySelectorAll(".cart-drawer-qty-selector button").forEach((button) => {
        button.addEventListener("click", async () => {
            //get line by key from Ajax cart API
            const rootItem = button.parentElement.parentElement.parentElement.parentElement
            .parentElement;

            const key = rootItem.getAttribute("data-line-item-key");

            // Get new quantity
            const currentQty = Number(button.parentElement.querySelector("input").value);

            const isUp = button.classList.contains("qty-selector-plus");

            const newQty = isUp ? currentQty + 1 : currentQty - 1; //if isUp is called add one to qty else -1

            // Ajax Update
            const res = await fetch("/cart/update.js", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({ updates: { [key]: newQty } }),
            });

            const cart = await res.json();

            updateCartItemCounts(cart.item_count);

            //update cart
            updateCartDrawer();
        });
    });

    document.querySelector(".cart-drawer-box").addEventListener("click", (e) => {
        e.stopPropagation(); // only allows outside the box and icon-close to close cart drawer
    });

    // functionality to allow icon-close to close cart drawer on click
    document.querySelectorAll(".cart-drawer-close", ".cart-drawer").forEach((el) => {
        el.addEventListener("click", () => {
            console.log("closing drawer"); // for debugging
            closeCartDrawer();
        });
    });
}

addCartDrawerListeners();

//adding each item to the cart drawer and opens the cart drawer when item added to cart
addToCartForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // submit for with Ajax 
        await fetch("/cart/add", {
            method: "post", 
            body: new FormData(form),
        });

        // Get Cart Count
        const res = await fetch("/cart.js");
        const cart = await res.json();
        updateCartItemCounts(cart.item_count);

        //update cart
        await updateCartDrawer();

        //open cart drawer 
        openCartDrawer();
    });
});

document.querySelectorAll('a[href="/cart"]').forEach((a) => {
    a.addEventListener("click", (e) => {
        e.preventDefault();
        openCartDrawer();
    });
});
