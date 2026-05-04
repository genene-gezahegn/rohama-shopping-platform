// Array to keep track of added items
let cartItems = [];

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Theme Mode Controller
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Add to Cart Button Logic
    const cartBtns = document.querySelectorAll('.btn-cart');
    cartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = btn.closest('.product-card');
            const name = productCard.querySelector('h3').innerText;
            const priceText = productCard.querySelector('.price').innerText;
            const price = parseFloat(priceText.replace('$', '').replace(',', ''));

            cartItems.push({ name, price });
            updateCartUI();

            btn.innerText = "Added!";
            btn.style.background = "#10b981";
            btn.style.color = "white";
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                btn.style.background = "";
                btn.style.color = "";
            }, 1000);
        });
    });

    // Buy Now Button Logic
    const buyBtns = document.querySelectorAll('.btn-buy');
    buyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = btn.closest('.product-card');
            const name = productCard.querySelector('h3').innerText;
            const priceText = productCard.querySelector('.price').innerText;

            alert(`Proceeding to checkout for ${name} (${priceText})!`);
        });
    });

    // Initialize Auth Link
    updateAuthLink();
});

// Navigation Controller for Views
function showView(viewName) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'none';

    if (viewName === 'home') {
        document.getElementById('home-view').style.display = 'block';
    } else if (viewName === 'login') {
        document.getElementById('login-view').style.display = 'flex';
    } else if (viewName === 'register') {
        document.getElementById('register-view').style.display = 'flex';
    } else if (viewName === 'dashboard') {
        document.getElementById('dashboard-view').style.display = 'flex';
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            document.getElementById('user-name').innerText = loggedInUser.name;
        }
    }
    updateAuthLink();
    window.scrollTo(0, 0);
}

// Interactivity Functions
function scrollToProducts() {
    showView('home');
    setTimeout(() => {
        const productsSec = document.getElementById('products');
        if (productsSec) {
            productsSec.scrollIntoView({ behavior: 'smooth' });
        }
    }, 50);
}

function handleAuthClick() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        showView('dashboard');
    } else {
        showView('login');
    }
}

function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        authLink.innerText = 'Dashboard';
    } else {
        authLink.innerText = 'Login';
    }
}

// Authentication Forms Logic
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            alert('Login successful! Redirecting to Dashboard...');
            showView('dashboard');
        } else {
            alert('Invalid email or password. Redirecting to Registration if you do not have an account.');
            showView('register');
        }
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(u => u.email === email)) {
            alert('User with this email already exists! Please log in.');
            showView('login');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));

        alert('Registration successful! Redirecting to Dashboard...');
        showView('dashboard');
    });
}

function logout() {
    localStorage.removeItem('loggedInUser');
    alert('You have logged out successfully.');
    showView('home');
}

// Cart Drawer Controller
function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('open');
    updateCartUI();
}

function updateCartUI() {
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-drawer-items');
    const totalAmountElement = document.getElementById('cart-total-amount');

    if (cartCountElement) {
        cartCountElement.innerText = cartItems.length;
    }

    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-text">Your cart is empty.</p>';
        totalAmountElement.innerText = "0.00";
        return;
    }

    let total = 0;
    cartItems.forEach((item, index) => {
        total += item.price;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
            </div>
            <button class="btn-cart" onclick="removeItemFromCart(${index})" style="padding:5px 10px; background:#ef4444; color:white; border:none; border-radius:5px;"><i class="fas fa-trash"></i></button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    totalAmountElement.innerText = total.toFixed(2);
}

function removeItemFromCart(index) {
    cartItems.splice(index, 1);
    updateCartUI();
}

function proceedToCheckout() {
    if (cartItems.length === 0) {
        alert("Your cart is empty. Add items before checking out!");
        return;
    }
    
    alert(`Proceeding to checkout for all items! Total: $${document.getElementById('cart-total-amount').innerText}`);
    cartItems = [];
    updateCartUI();
    toggleCartDrawer();
}