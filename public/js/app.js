// --- Default Database Initialization ---
// Tableau vide : les produits sont gérés exclusivement via le panneau d'administration.
const DEFAULT_PRODUCTS = [];

const DEFAULT_SETTINGS = {
    welcomeTitle: "Bienvenue sur le site ElyBusiness",
    welcomeDesc: "Votre partenaire de confiance pour tous vos besoins de recharges (crédits, méga, minutes), d'accessoires de mode, d'appareils électroniques, de vêtements et bien plus encore.",
    whatsappNumber: "+243981470106",
    emailAddress: "elyseebaraka83@gmail.com",
    physicalAddress: "Goma, DRC",
    facebookLink: "https://facebook.com/elyseebaraka",
    instagramLink: "https://instagram.com/elyseebaraka",
    ceoName: "Elysée BARAKA",
    ceoBio: "Chez ElyBusiness, notre priorité absolue est la satisfaction du client. Nous croyons que la technologie et les accessoires de qualité doivent être accessibles à tous rapidement et en toute sécurité. Nous continuons d'innover pour vous apporter des solutions adaptées à vos besoins financiers et de communication.",
    ceoPhoto: "assets/extracted_img_1.jpg",
    aboutImg: "assets/extracted_img_3.jpg",
    logoImg: "assets/logo.svg"
};

// ============================================================
// CURRENCY SYSTEM — Single Currency ($ USD Only)
// ============================================================

/**
 * Retourne la devise active (USD par défaut)
 * @returns {string}
 */
function getCurrency() {
    return localStorage.getItem('elybusiness_currency') || 'USD';
}

function setCurrency(currency) {
    localStorage.setItem('elybusiness_currency', currency);
}

/**
 * Formate un prix exclusivement en Dollar Américain ($ USD)
 * @param {number} priceUsd - Prix en USD
 * @returns {{ display: string, raw: number, currency: string }}
 */
function formatPrice(priceUsd) {
    const num = Number(priceUsd) || 0;
    const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2);
    return {
        display: '$' + formatted,
        raw: num,
        currency: 'USD'
    };
}

// Initialisation du LocalStorage
function initDatabase() {
    // Vider les anciens produits du localStorage pour éviter les données de démonstration
    localStorage.removeItem("elybusiness_products");
    
    // Initialise ou met à jour les paramètres si nécessaire
    const storedSettings = localStorage.getItem("elybusiness_settings");
    if (!storedSettings) {
        localStorage.setItem("elybusiness_settings", JSON.stringify(DEFAULT_SETTINGS));
    } else {
        const parsed = JSON.parse(storedSettings);
        if (parsed.logoImg === "assets/extracted_img_2.jpg") {
            parsed.logoImg = DEFAULT_SETTINGS.logoImg;
            localStorage.setItem("elybusiness_settings", JSON.stringify(parsed));
        }
    }
    
    if (!localStorage.getItem("elybusiness_users")) {
        localStorage.setItem("elybusiness_users", JSON.stringify([]));
    }

    if (!localStorage.getItem("elybusiness_cart")) {
        localStorage.setItem("elybusiness_cart", JSON.stringify([]));
    }

    if (!localStorage.getItem("elybusiness_orders")) {
        localStorage.setItem("elybusiness_orders", JSON.stringify([]));
    }
}

const DEFAULT_TESTIMONIALS = [
    {
        id: "testi-1",
        name: "Patrick M.",
        role: "Client depuis 2025",
        stars: 5,
        text: "Service incroyable ! J'ai reçu ma recharge en moins de 5 minutes. ElyBusiness est devenu mon fournisseur de confiance pour tous mes besoins téléphoniques."
    },
    {
        id: "testi-2",
        name: "Gracia K.",
        role: "Cliente satisfaite",
        stars: 5,
        text: "La casquette que j'ai commandée est de très belle qualité. Le service client via WhatsApp est réactif et très professionnel. Je recommande !"
    },
    {
        id: "testi-3",
        name: "David N.",
        role: "Client régulier",
        stars: 4.5,
        text: "J'ai acheté un smartphone via ElyBusiness, livraison rapide et prix compétitif. L'équipe est sérieuse et digne de confiance. Merci !"
    }
];

// --- Firebase SDK (importé depuis firebase-config.js via le HTML) ---
// Les helpers fbGetAll, fbGetSettings, etc. sont injectés globalement par firebase-config.js
let productsCache = [];
let settingsCache = {};
let testimonialsCache = [];

// Récupération des données depuis Firebase Firestore
async function loadDataFromServer() {
    try {
        productsCache = await window.fbGetAll('products');
        settingsCache = await window.fbGetSettings();
        testimonialsCache = await window.fbGetAll('testimonials');
        testimonialsCache.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    } catch (err) {
        console.error("Erreur Firebase. Basculement sur localStorage.", err);
        // Fallback local si Firebase non configuré
        productsCache = JSON.parse(localStorage.getItem("elybusiness_products")) || DEFAULT_PRODUCTS;
        settingsCache = JSON.parse(localStorage.getItem("elybusiness_settings")) || DEFAULT_SETTINGS;
        testimonialsCache = JSON.parse(localStorage.getItem("elybusiness_testimonials")) || DEFAULT_TESTIMONIALS;
    }

    if (!testimonialsCache || testimonialsCache.length === 0) {
        testimonialsCache = JSON.parse(localStorage.getItem("elybusiness_testimonials")) || DEFAULT_TESTIMONIALS;
    }
}

// Récupération des données
function getProducts() {
    return productsCache.length > 0 ? productsCache : DEFAULT_PRODUCTS;
}

function getSettings() {
    return Object.keys(settingsCache).length > 0 ? settingsCache : DEFAULT_SETTINGS;
}

// --- Client UI logic ---
document.addEventListener("DOMContentLoaded", async () => {
    // Initialiser les données si vides
    initDatabase();
    
    // Récupérer les données depuis la base de données MySQL
    await loadDataFromServer();
    
    // Splash screen logic
    initSplashScreen();
    
    // Gérer l'authentification client
    initClientAuth();
    
    // Charger et appliquer les configurations
    applySettings();
    
    // Rendre les produits
    renderProducts("tout");

    // Rendre les témoignages clients
    renderTestimonials();
    initTestimonialForm();
    
    // Setup Navigation & Interactions
    initNavbar();
    initFilters();
    initSearch();
    initCart();
    initClientOrders();
    initClientProfile();
    initContactForm();
    initAdminModal();

    // Premium UI Enhancements
    initScrollReveal();
    initCounterAnimations();
    initScrollToTop();
    initTypingEffect();
});

// Appliquer les paramètres dynamiques sur le site
function applySettings() {
    const settings = getSettings();
    
    // Titres & Descriptions Accueil
    const welcomeTitleEl = document.getElementById("hero-welcome-title");
    const welcomeDescEl = document.getElementById("hero-welcome-desc");
    if (welcomeTitleEl && welcomeDescEl) {
        welcomeTitleEl.innerHTML = settings.welcomeTitle.replace("ElyBusiness", "<span>ElyBusiness</span>");
        welcomeDescEl.textContent = settings.welcomeDesc;
    }
    
    // Section À Propos
    const ceoNameEl = document.getElementById("ceo-name");
    const ceoBioEl = document.getElementById("ceo-bio-text");
    const ceoPhotoEl = document.getElementById("ceo-photo-img");
    const aboutImgEl = document.getElementById("about-visual-img");
    
    if (ceoNameEl) ceoNameEl.textContent = settings.ceoName;
    if (ceoBioEl) ceoBioEl.textContent = settings.ceoBio;
    if (ceoPhotoEl && settings.ceoPhoto) ceoPhotoEl.src = settings.ceoPhoto;
    if (aboutImgEl && settings.aboutImg) aboutImgEl.src = settings.aboutImg;
    
    // Contacts & Liens
    const waLink = document.getElementById("contact-whatsapp-link");
    const mailLink = document.getElementById("contact-email-link");
    const addressText = document.getElementById("contact-address-text");
    
    const cleanWaNum = settings.whatsappNumber.replace(/\s+/g, '');
    const waHref = `https://wa.me/${cleanWaNum.replace('+', '')}`;
    
    if (waLink) {
        waLink.href = waHref;
        waLink.textContent = settings.whatsappNumber;
    }
    if (mailLink) {
        mailLink.href = `mailto:${settings.emailAddress}`;
        mailLink.textContent = settings.emailAddress;
    }
    if (addressText) addressText.textContent = settings.physicalAddress;
    
    // Réseaux sociaux — Liés au compte @Elysée BARAKA par défaut
    const fbSocial = document.getElementById("social-facebook");
    const igSocial = document.getElementById("social-instagram");
    const waSocial = document.getElementById("social-whatsapp");
    
    const fbLink = (settings.facebookLink && settings.facebookLink.trim() !== "") ? settings.facebookLink : "https://facebook.com/elyseebaraka";
    const igLink = (settings.instagramLink && settings.instagramLink.trim() !== "") ? settings.instagramLink : "https://instagram.com/elyseebaraka";
    
    if (fbSocial) {
        fbSocial.href = fbLink;
        fbSocial.style.display = "flex";
    }
    if (igSocial) {
        igSocial.href = igLink;
        igSocial.style.display = "flex";
    }
    if (waSocial) waSocial.href = waHref;
    
    // Logo
    const logoPlaceholder = document.getElementById("logo-placeholder");
    if (settings.logoImg) {
        // Create an img element if settings have a logo
        if (logoPlaceholder) {
            logoPlaceholder.outerHTML = `<img src="${settings.logoImg}" id="logo-img" alt="EB" onerror="this.outerHTML='<div class=\'logo-fallback\' id=\'logo-placeholder\'>EB</div>'">`;
        } else {
            const currentImg = document.getElementById("logo-img");
            if (currentImg) currentImg.src = settings.logoImg;
        }
    }
    
    // Logo portail d'authentification client
    const authLogoPlaceholder = document.getElementById("auth-logo-placeholder");
    if (settings.logoImg) {
        if (authLogoPlaceholder) {
            authLogoPlaceholder.outerHTML = `<img src="${settings.logoImg}" id="auth-logo-img" alt="EB" style="margin: 0 auto 0.8rem auto; height: 44px; display: block; object-fit: contain;" onerror="this.outerHTML='<div class=\'logo-fallback\' id=\'auth-logo-placeholder\'>EB</div>'">`;
        } else {
            const currentAuthImg = document.getElementById("auth-logo-img");
            if (currentAuthImg) currentAuthImg.src = settings.logoImg;
        }
    }
}

// Rendu du catalogue de produits (avec filtre de catégorie et recherche)
function renderProducts(categoryFilter = "tout", searchQuery = "") {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    // Mémoriser le filtre actif
    productsGrid.dataset.activeFilter = categoryFilter;
    
    const products = getProducts();
    const settings = getSettings();
    const cleanWaNum = settings.whatsappNumber.replace(/\s+/g, '').replace('+', '');
    
    // Vider la grille
    productsGrid.innerHTML = "";
    
    // Filtrer les produits par catégorie ET par terme de recherche
    let filteredProducts = categoryFilter === "tout" 
        ? products 
        : products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());

    if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }
        
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary); display: block;"></i>
                <p>Aucun produit ne correspond à votre recherche.</p>
            </div>
        `;
        return;
    }

    // Créer les cartes produits avec animation staggered
    filteredProducts.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "product-card product-card-enter";
        card.setAttribute("data-id", product.id);
        card.style.animationDelay = `${index * 0.08}s`;

        // Formatage du prix
        const priceFormatted = formatPrice(product.price);
        
        // Image de secours si non spécifiée
        const imgSrc = product.image || 'assets/extracted_img_0.jpg';

        // Badge de stock
        const stockCount = product.stock !== undefined ? product.stock : 15;
        let stockBadgeHtml = '';
        let isOutOfStock = stockCount <= 0;

        if (isOutOfStock) {
            stockBadgeHtml = `<span class="stock-badge stock-out"><i class="fas fa-times-circle"></i> Rupture</span>`;
        } else if (stockCount <= 5) {
            stockBadgeHtml = `<span class="stock-badge stock-low"><i class="fas fa-exclamation-circle"></i> ${stockCount} restants</span>`;
        } else {
            stockBadgeHtml = `<span class="stock-badge stock-ok"><i class="fas fa-check-circle"></i> En stock</span>`;
        }

        card.innerHTML = `
            <div class="product-img-wrapper">
                <span class="product-category-badge">${product.category}</span>
                <img src="${imgSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='assets/extracted_img_0.jpg';">
            </div>
            <div class="product-info">
                <div class="product-header-row">
                    <h3 class="product-title">${product.name}</h3>
                    ${stockBadgeHtml}
                </div>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price-block">
                        <span class="product-price">${priceFormatted.display}</span>
                    </div>
                    <div class="product-actions">
                        <button
                            onclick="addToCart('${product.id}')"
                            class="btn-buy btn-cart"
                            title="Ajouter au panier"
                            ${isOutOfStock ? 'disabled' : ''}
                        >
                            <i class="fas fa-cart-plus"></i> Panier
                        </button>
                        <button
                            onclick="openOrderModal('${product.id}')"
                            class="btn-buy btn-order"
                            ${isOutOfStock ? 'disabled' : ''}
                        >
                            <i class="fas fa-bolt"></i> Acheter
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(card);
    });
}

// Logique de la navbar (scroll et menu mobile)
function initNavbar() {
    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const links = document.querySelectorAll(".nav-link");
    
    // Effet scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        // Mettre à jour le lien actif au défilement
        let current = "";
        const sections = document.querySelectorAll("section");
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });
        
        links.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });
    
    // Menu mobile
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            navLinks.classList.toggle("active");
        });
        
        // Fermer le menu au clic sur un lien
        links.forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                navLinks.classList.remove("active");
            });
        });
    }
}

// ============================================================
// CURRENCY SWITCHER — Navbar logic
// ============================================================
function initCurrencySwitcher() {
    const switcher  = document.getElementById('currency-switcher');
    const btnCdf = document.getElementById('btn-cdf');
    const btnUsd = document.getElementById('btn-usd');
    if (!switcher || !btnCdf || !btnUsd) return;

    // Tooltip with live rate info
    switcher.setAttribute('data-rate', `1 USD = ${USD_RATE.toLocaleString('fr-FR')} FC`);

    // Sync UI state from stored preference
    const updateUI = (currency) => {
        if (currency === 'USD') {
            btnUsd.classList.add('active');
            btnCdf.classList.remove('active');
        } else {
            btnCdf.classList.add('active');
            btnUsd.classList.remove('active');
        }
    };

    // Apply on load
    updateUI(getCurrency());

    // Click handlers
    const onSwitch = (currency) => {
        if (getCurrency() === currency) return; // no change
        setCurrency(currency);
        updateUI(currency);

        // Re-render products with the current category filter
        const productsGrid = document.getElementById('products-grid');
        const activeFilter = productsGrid ? (productsGrid.dataset.activeFilter || 'tout') : 'tout';
        renderProducts(activeFilter);

        // Toast feedback
        const label = currency === 'USD' ? 'Dollars américains ($)' : 'Francs Congolais (FC)';
        showToast(`Devise : ${label}`, 'success');
    };

    btnCdf.addEventListener('click', () => onSwitch('CDF'));
    btnUsd.addEventListener('click', () => onSwitch('USD'));
}

// Filtrage du catalogue
function initFilters() {
    const filtersContainer = document.getElementById("catalog-filters");
    if (!filtersContainer) return;
    
    const filterBtns = filtersContainer.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Activer le bouton cliqué
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Re-filtrer
            const category = btn.getAttribute("data-category");
            renderProducts(category);
        });
    });
}

// Formulaire de contact (mailto)
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const settings = getSettings();
        const name = document.getElementById("contact-name").value;
        const email = document.getElementById("contact-email").value;
        const subject = document.getElementById("contact-subject").value;
        const message = document.getElementById("contact-message").value;
        
        const emailBody = `Nom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}`;
        const mailtoUrl = `mailto:${settings.emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Ouvrir le client mail
        window.location.href = mailtoUrl;
        
        showToast("Ouverture de votre client e-mail pour l'envoi...", "success");
        form.reset();
    });
}

// Easter Egg et Modal Admin
function initAdminModal() {
    const triggerText = document.getElementById("trigger-admin-login");
    const logoLink = document.getElementById("site-logo-link");
    const modal = document.getElementById("admin-login-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const loginForm = document.getElementById("admin-login-form");
    
    if (!modal) return;
    
    const openModal = (e) => {
        e.preventDefault();
        modal.classList.add("active");
        document.getElementById("admin-email").focus();
    };
    
    const closeModal = () => {
        modal.classList.remove("active");
        loginForm.reset();
    };
    
    // Déclencheur : Double clic sur le copyright
    if (triggerText) {
        triggerText.addEventListener("dblclick", openModal);
        // Ajout d'un support pour mobiles (clics répétés rapides)
        let clickCount = 0;
        triggerText.addEventListener("click", () => {
            clickCount++;
            if (clickCount >= 3) {
                openModal(new Event("trigger"));
                clickCount = 0;
            }
            setTimeout(() => { clickCount = 0; }, 1000);
        });
    }
    
    // Déclencheur alternatif : Ctrl + Shift + A
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            openModal(e);
        }
    });
    
    // Fermeture de la modal
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Connexion Admin via Firebase
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("admin-email").value.trim();
            const password = document.getElementById("admin-password").value;
            
            try {
                // Connexion vérifiée directement dans Firebase Firestore
                await window.fbAdminLogin(email, password);
                showToast("Connexion réussie ! Redirection...", "success");
                
                sessionStorage.setItem("elybusiness_admin_session", "authenticated_" + Date.now());
                
                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 1000);
            } catch (err) {
                showToast("Identifiants Administrateur incorrects !", "error");
            }
        });
    }
}

// Fonction Toast Notification
function showToast(message, type = "success") {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = message;
    toast.className = `toast active toast-${type}`;
    
    // Changer l'icône selon le type
    const icon = toast.querySelector("i");
    if (icon) {
        if (type === "success") {
            icon.className = "fas fa-check-circle";
        } else if (type === "error") {
            icon.className = "fas fa-exclamation-circle";
        } else {
            icon.className = "fas fa-info-circle";
        }
    }
    
    setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}

// --- Client Account Auth Portal ---
function initClientAuth() {
    const authOverlay = document.getElementById("client-auth-overlay");
    const loginForm = document.getElementById("client-login-form");
    const registerForm = document.getElementById("client-register-form");
    
    const tabLoginBtn = document.getElementById("tab-login-btn");
    const tabRegisterBtn = document.getElementById("tab-register-btn");
    
    const userNavItem = document.getElementById("user-nav-item");
    const userGreeting = document.getElementById("user-greeting");
    const userLogoutBtn = document.getElementById("btn-user-logout");
    
    const adminNavLink = document.getElementById("admin-nav-link");
    const footerAdminLink = document.getElementById("footer-admin-link");
    const authAdminLink = document.getElementById("auth-admin-link");
    const adminLoginModal = document.getElementById("admin-login-modal");
    
    if (!authOverlay) return;

    // Check active session
    const checkSession = () => {
        const sessionUser = sessionStorage.getItem("elybusiness_user_session");
        if (sessionUser) {
            const user = JSON.parse(sessionUser);
            authOverlay.classList.remove("active");
            document.body.style.overflow = ""; // restore scrolling
            
            if (userNavItem && userGreeting) {
                userGreeting.textContent = `Bonjour, ${user.name}`;
                userNavItem.style.display = "block";
            }
        } else {
            authOverlay.classList.add("active");
            document.body.style.overflow = "hidden"; // lock scrolling until logged in
            if (userNavItem) {
                userNavItem.style.display = "none";
            }
        }
    };

    // Initial check
    checkSession();

    // Tab switching controls
    if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
        tabLoginBtn.addEventListener("click", () => {
            tabLoginBtn.classList.add("active");
            tabRegisterBtn.classList.remove("active");
            loginForm.classList.add("active");
            registerForm.classList.remove("active");
        });

        tabRegisterBtn.addEventListener("click", () => {
            tabRegisterBtn.classList.add("active");
            tabLoginBtn.classList.remove("active");
            registerForm.classList.add("active");
            loginForm.classList.remove("active");
        });
    }

    // Register Submission Handler
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim().toLowerCase();
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("register-confirm-password").value;
            
            if (password !== confirmPassword) {
                showToast("Les mots de passe ne correspondent pas.", "error");
                return;
            }

            try {
                // Inscription directement enregistrée dans Firebase Firestore (avec mot de passe)
                const result = await window.fbRegister(name, email, password);

                // Connexion automatique dans la session client
                sessionStorage.setItem("elybusiness_user_session", JSON.stringify({ name: result.user.name, email: result.user.email }));
                showToast(`Bienvenue, ${result.user.name} ! Compte créé et enregistré dans Firebase.`, "success");
                
                registerForm.reset();
                checkSession();
            } catch (err) {
                showToast("Erreur Firebase lors de l'inscription : " + err.message, "error");
            }
        });
    }

    // Login Submission Handler
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const password = document.getElementById("login-password").value;
            
            const validAdminPass = localStorage.getItem("elybusiness_admin_password") || "admin2026";
            
            // Détection des identifiants administrateur
            if (email === "admin@elybusiness.com" && password === validAdminPass) {
                showToast("Connexion réussie ! Redirection...", "success");
                sessionStorage.setItem("elybusiness_admin_session", "authenticated_" + Date.now());
                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 1000);
                return;
            }
            
            try {
                // Vérification exacte des identifiants dans Firebase Firestore
                const result = await window.fbLogin(email, password);
                const user = { name: result.user.name, email: result.user.email };
                sessionStorage.setItem("elybusiness_user_session", JSON.stringify(user));
                showToast(`Ravi de vous revoir, ${user.name} !`, "success");
                loginForm.reset();
                checkSession();
            } catch (err) {
                showToast("Erreur Firebase lors de la connexion : " + err.message, "error");
            }
        });
    }

    // Client Forgot Password Logic
    const userForgotLink = document.getElementById("link-user-forgot-pass");
    const backToLoginLink = document.getElementById("link-back-to-login");
    const userForgotForm = document.getElementById("client-forgot-form");

    if (userForgotLink && userForgotForm && loginForm) {
        userForgotLink.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.style.display = "none";
            userForgotForm.style.display = "flex";
            userForgotForm.classList.add("active");
        });

        if (backToLoginLink) {
            backToLoginLink.addEventListener("click", (e) => {
                e.preventDefault();
                userForgotForm.style.display = "none";
                userForgotForm.classList.remove("active");
                loginForm.style.display = "flex";
            });
        }

        userForgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("forgot-user-email").value.trim().toLowerCase();
            const newPass = document.getElementById("forgot-user-new-password").value;
            const confirmPass = document.getElementById("forgot-user-confirm-password").value;

            if (newPass !== confirmPass) {
                showToast("Les mots de passe ne correspondent pas.", "error");
                return;
            }

            try {
                // Réinitialiser le mot de passe dans Firebase Firestore
                await window.fbResetPassword(email, newPass);
                showToast("Mot de passe réinitialisé avec succès dans Firebase !", "success");
                userForgotForm.reset();
                userForgotForm.style.display = "none";
                loginForm.style.display = "flex";
            } catch (err) {
                showToast("Erreur Firebase lors de la réinitialisation : " + err.message, "error");
            }
        });
    }

    // Admin Forgot Password Logic (in admin modal)
    const adminForgotLink = document.getElementById("link-admin-forgot-pass");
    const adminBackLoginLink = document.getElementById("link-admin-back-login");
    const adminLoginForm = document.getElementById("admin-login-form");
    const adminForgotForm = document.getElementById("admin-forgot-form");

    if (adminForgotLink && adminForgotForm && adminLoginForm) {
        adminForgotLink.addEventListener("click", (e) => {
            e.preventDefault();
            adminLoginForm.style.display = "none";
            adminForgotForm.style.display = "block";
        });

        if (adminBackLoginLink) {
            adminBackLoginLink.addEventListener("click", (e) => {
                e.preventDefault();
                adminForgotForm.style.display = "none";
                adminLoginForm.style.display = "block";
            });
        }

        adminForgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("admin-forgot-email").value.trim();
            const newPass = document.getElementById("admin-forgot-new-pass").value;
            const confirmPass = document.getElementById("admin-forgot-confirm-pass").value;

            const settings = getSettings();
            const validAdminEmail = settings.emailAddress || "admin@elybusiness.com";

            if (email.toLowerCase() !== "admin@elybusiness.com" && email.toLowerCase() !== validAdminEmail.toLowerCase()) {
                showToast("Adresse e-mail administrateur non reconnue.", "error");
                return;
            }

            if (newPass !== confirmPass) {
                showToast("Les mots de passe ne correspondent pas.", "error");
                return;
            }

            try {
                // Enregistrer le mot de passe Admin directement dans Firebase Firestore
                await window.fbChangeAdminPassword(newPass);
                showToast("Mot de passe Admin mis à jour dans Firebase avec succès !", "success");

                adminForgotForm.reset();
                adminForgotForm.style.display = "none";
                adminLoginForm.style.display = "block";
            } catch (err) {
                showToast("Erreur Firebase : " + err.message, "error");
            }
        });
    }

    // Logout Handler
    if (userLogoutBtn) {
        userLogoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("elybusiness_user_session");
            showToast("Déconnexion réussie.", "success");
            checkSession();
        });
    }

    // Admin links handlers
    const openAdminLogin = (e) => {
        e.preventDefault();
        if (adminLoginModal) {
            adminLoginModal.classList.add("active");
            document.getElementById("admin-email").focus();
        }
    };

    if (adminNavLink) adminNavLink.addEventListener("click", openAdminLogin);
    if (footerAdminLink) footerAdminLink.addEventListener("click", openAdminLogin);
    if (authAdminLink) authAdminLink.addEventListener("click", openAdminLogin);
}

// --- Order Selector Modal ---
window.openOrderModal = function(productId) {
    // Check client session first
    const sessionUser = sessionStorage.getItem("elybusiness_user_session");
    if (!sessionUser) {
        showToast("Veuillez d'abord vous connecter.", "error");
        const authOverlay = document.getElementById("client-auth-overlay");
        if (authOverlay) authOverlay.classList.add("active");
        return;
    }

    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("order-modal");
    const descEl = document.getElementById("order-modal-desc");
    const channelsList = document.getElementById("order-channels-list");
    if (!modal || !channelsList || !descEl) return;

    descEl.innerHTML = `Sélectionnez le réseau social de votre choix pour commander cet article : <br><strong style="color: var(--secondary);">${product.name}</strong> ($${product.price} USD).`;

    const settings = getSettings();
    const cleanWaNum = settings.whatsappNumber.replace(/\s+/g, '').replace('+', '');
    
    // Prefilled messages in USD
    const waMessage = `Bonjour ElyBusiness, je souhaite acheter le produit suivant :\n- *Nom* : ${product.name}\n- *Catégorie* : ${product.category}\n- *Prix* : $${product.price} USD\n\nMerci de me confirmer la disponibilité.`;
    const waUrl = `https://wa.me/${cleanWaNum}?text=${encodeURIComponent(waMessage)}`;

    const emailSubject = `Commande ElyBusiness : ${product.name}`;
    const emailBody = `Bonjour ElyBusiness,\n\nJe souhaite passer commande pour le produit suivant :\n- Nom : ${product.name}\n- Catégorie : ${product.category}\n- Prix : $${product.price} USD\n\nMerci de me recontacter pour finaliser la transaction.\n\nCordialement.`;
    const emailUrl = `mailto:${settings.emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    channelsList.innerHTML = "";

    // WhatsApp option
    if (settings.whatsappNumber) {
        channelsList.innerHTML += `
            <a href="${waUrl}" target="_blank" class="order-channel-btn whatsapp">
                <i class="fab fa-whatsapp"></i> WhatsApp (${settings.whatsappNumber})
            </a>
        `;
    }

    // Email option
    if (settings.emailAddress) {
        channelsList.innerHTML += `
            <a href="${emailUrl}" class="order-channel-btn email">
                <i class="fas fa-envelope"></i> E-mail (${settings.emailAddress})
            </a>
        `;
    }

    // Facebook option
    if (settings.facebookLink && settings.facebookLink.trim() !== "") {
        channelsList.innerHTML += `
            <a href="${settings.facebookLink}" target="_blank" class="order-channel-btn facebook">
                <i class="fab fa-facebook-f"></i> Facebook Messenger
            </a>
        `;
    }

    // Instagram option
    if (settings.instagramLink && settings.instagramLink.trim() !== "") {
        channelsList.innerHTML += `
            <a href="${settings.instagramLink}" target="_blank" class="order-channel-btn instagram">
                <i class="fab fa-instagram"></i> Instagram Direct
            </a>
        `;
    }

    // Close handler
    const closeBtn = document.getElementById("order-modal-close-btn");
    const closeModal = () => {
        modal.classList.remove("active");
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Show modal
    modal.classList.add("active");
};

// ============================================================
// SCROLL REVEAL — Intersection Observer
// ============================================================
function initScrollReveal() {
    const targets = document.querySelectorAll(".fade-up, .fade-in, .reveal");

    if (!targets.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger delay if multiple elements visible at once
                    setTimeout(() => {
                        entry.target.classList.add("visible");
                    }, i * 60);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(el => observer.observe(el));
}

// ============================================================
// ANIMATED STAT COUNTERS — Hero Section
// ============================================================
function initCounterAnimations() {
    const counters = document.querySelectorAll(".stat-number[data-count]");
    if (!counters.length) return;

    const countUp = (el) => {
        const target = parseInt(el.getAttribute("data-count"), 10);
        const suffix = el.getAttribute("data-suffix") || "+";
        const duration = 1800; // ms
        const step = target / (duration / 16); // ~60fps
        let current = 0;

        const tick = () => {
            current += step;
            if (current >= target) {
                el.textContent = target + suffix;
                return;
            }
            el.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(tick);
        };

        tick();
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
}

// ============================================================
// SPLASH SCREEN
// ============================================================
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    // window.load est souvent déjà passé quand cette fonction est appelée depuis DOMContentLoaded.
    // On utilise donc un setTimeout direct pour garantir la fermeture du splash.
    const hideSplash = () => {
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.style.display = 'none';
            }, 600);
        }, 1200);
    };

    if (document.readyState === 'complete') {
        // La page est déjà chargée entièrement
        hideSplash();
    } else {
        // On attend le chargement complet
        window.addEventListener('load', hideSplash, { once: true });
    }
}

// ============================================================
// SCROLL TO TOP BUTTON
// ============================================================
function initScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================================
// TYPING EFFECT — Hero Title
// ============================================================
function initTypingEffect() {
    const titleEl = document.querySelector('.hero-title .line-2');
    if (!titleEl) return;

    const text = titleEl.textContent.trim();
    titleEl.textContent = '';
    titleEl.classList.add('typing-cursor');

    let i = 0;
    const typeSpeed = 80;

    const typeChar = () => {
        if (i < text.length) {
            titleEl.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, typeSpeed);
        } else {
            // Remove cursor after typing completes
            setTimeout(() => {
                titleEl.classList.remove('typing-cursor');
            }, 1500);
        }
    };

    // Start after a short delay so splash can finish
    setTimeout(typeChar, 1800);
}

// ============================================================
// SEARCH FILTERING LOGIC
// ============================================================
function initSearch() {
    const searchInput = document.getElementById("product-search-input");
    const clearBtn = document.getElementById("btn-clear-search");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value;
        if (clearBtn) {
            clearBtn.style.display = query.length > 0 ? "block" : "none";
        }
        const activeCategory = document.getElementById("products-grid")?.dataset.activeFilter || "tout";
        renderProducts(activeCategory, query);
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearBtn.style.display = "none";
            const activeCategory = document.getElementById("products-grid")?.dataset.activeFilter || "tout";
            renderProducts(activeCategory, "");
            searchInput.focus();
        });
    }
}

// ============================================================
// CART MANAGEMENT SYSTEM
// ============================================================
function getCart() {
    return JSON.parse(localStorage.getItem("elybusiness_cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("elybusiness_cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById("cart-badge-count");
    if (!badge) return;
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
}

window.addToCart = function(productId) {
    // Check client session
    const sessionUser = sessionStorage.getItem("elybusiness_user_session");
    if (!sessionUser) {
        showToast("Veuillez d'abord vous connecter.", "error");
        const authOverlay = document.getElementById("client-auth-overlay");
        if (authOverlay) authOverlay.classList.add("active");
        return;
    }

    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const stock = product.stock !== undefined ? product.stock : 15;
    if (stock <= 0) {
        showToast("Désolé, cet article est en rupture de stock.", "error");
        return;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.productId === productId);

    if (existingIndex !== -1) {
        if (cart[existingIndex].quantity + 1 > stock) {
            showToast(`Quantité maximale en stock atteinte (${stock} max).`, "warning");
            return;
        }
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    showToast(`"${product.name}" ajouté au panier !`, "success");
};

function renderCart() {
    const container = document.getElementById("cart-items-container");
    const totalPriceEl = document.getElementById("cart-total-price");
    if (!container || !totalPriceEl) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <i class="fas fa-shopping-basket"></i>
                <p>Votre panier est vide.</p>
            </div>
        `;
        totalPriceEl.textContent = "$0";
        return;
    }

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const imgSrc = item.image || 'assets/extracted_img_0.jpg';

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${imgSrc}" class="cart-item-img" alt="${item.name}" onerror="this.src='assets/extracted_img_0.jpg'">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <span class="cart-item-price">$${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}</span>
            </div>
            <div class="cart-qty-controls">
                <button class="cart-qty-btn" onclick="updateCartQty('${item.productId}', -1)"><i class="fas fa-minus"></i></button>
                <span class="cart-qty-num">${item.quantity}</span>
                <button class="cart-qty-btn" onclick="updateCartQty('${item.productId}', 1)"><i class="fas fa-plus"></i></button>
            </div>
            <button class="cart-btn-remove" onclick="removeFromCart('${item.productId}')" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
        `;
        container.appendChild(div);
    });

    totalPriceEl.textContent = `$${total % 1 === 0 ? total : total.toFixed(2)}`;
}

window.updateCartQty = function(productId, delta) {
    const cart = getCart();
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) return;

    const products = getProducts();
    const product = products.find(p => p.id === productId);
    const maxStock = product ? (product.stock !== undefined ? product.stock : 15) : 99;

    const newQty = cart[index].quantity + delta;
    if (newQty <= 0) {
        cart.splice(index, 1);
    } else if (newQty > maxStock) {
        showToast(`Stock disponible limité à ${maxStock} unités.`, "warning");
        return;
    } else {
        cart[index].quantity = newQty;
    }

    saveCart(cart);
    renderCart();
};

window.removeFromCart = function(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    renderCart();
    showToast("Article retiré du panier.", "info");
};

function initCart() {
    updateCartBadge();

    const openBtn = document.getElementById("btn-open-cart");
    const modal = document.getElementById("cart-modal");
    const closeBtn = document.getElementById("cart-modal-close-btn");
    const clearBtn = document.getElementById("btn-clear-cart");
    const checkoutBtn = document.getElementById("btn-checkout-cart");

    if (!modal) return;

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            renderCart();
            modal.classList.add("active");
        });
    }

    const closeModal = () => modal.classList.remove("active");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (getCart().length === 0) return;
            saveCart([]);
            renderCart();
            showToast("Panier vidé.", "info");
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async () => {
            const cart = getCart();
            if (cart.length === 0) {
                showToast("Votre panier est vide.", "error");
                return;
            }

            const sessionUserStr = sessionStorage.getItem("elybusiness_user_session");
            if (!sessionUserStr) {
                showToast("Veuillez d'abord vous connecter.", "error");
                closeModal();
                const authOverlay = document.getElementById("client-auth-overlay");
                if (authOverlay) authOverlay.classList.add("active");
                return;
            }

            const user = JSON.parse(sessionUserStr);
            const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

            // Créer l'objet commande
            const newOrder = {
                id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
                userEmail: user.email,
                userName: user.name,
                date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                items: cart,
                total: totalAmount
            };

            try {
                // Enregistrer la commande dans Firestore
                await window.fbSet('orders', newOrder.id, {
                    id: newOrder.id,
                    user_email: newOrder.userEmail,
                    user_name: newOrder.userName,
                    order_date: newOrder.date,
                    total: newOrder.total,
                    status: 'En attente',
                    items: newOrder.items
                });

                // Décrémenter le stock de chaque produit
                for (const item of newOrder.items) {
                    const prod = await window.fbGetOne('products', item.productId);
                    if (prod) {
                        const newStock = Math.max(0, (parseInt(prod.stock) || 0) - item.quantity);
                        await window.fbUpdate('products', item.productId, { stock: newStock });
                    }
                }

                // Vider le panier local
                saveCart([]);
                closeModal();
                
                // Recharger les produits (le stock a changé)
                await loadDataFromServer();
                renderProducts(document.getElementById("products-grid")?.dataset.activeFilter || "tout");

                showToast("Commande validée avec succès ! Retrouvez-la dans 'Mes Commandes'.", "success");

                // Proposer d'envoyer le récapitulatif via WhatsApp
                setTimeout(() => {
                    const settings = getSettings();
                    const cleanWaNum = settings.whatsappNumber.replace(/\s+/g, '').replace('+', '');
                    let waText = `Bonjour ElyBusiness,\nJe viens de valider la commande *${newOrder.id}* sur le site :\n`;
                    cart.forEach(i => { waText += `- ${i.name} (x${i.quantity}) : $${i.price * i.quantity}\n`; });
                    waText += `\n*Total : $${totalAmount} USD*\nMerci de me confirmer la livraison.`;

                    const waUrl = `https://wa.me/${cleanWaNum}?text=${encodeURIComponent(waText)}`;
                    window.open(waUrl, '_blank');
                }, 1000);
            } catch (err) {
                showToast("Erreur Firebase lors de la validation de la commande : " + err.message, "error");
            }
        });
    }
}

// ============================================================
// CLIENT ORDERS HISTORIC LOGIC
// ============================================================
function initClientOrders() {
    const ordersBtn = document.getElementById("btn-user-orders");
    const modal = document.getElementById("client-orders-modal");
    const closeBtn = document.getElementById("client-orders-close-btn");

    if (!modal) return;

    if (ordersBtn) {
        ordersBtn.addEventListener("click", () => {
            renderClientOrders();
            modal.classList.add("active");
        });
    }

    const closeModal = () => modal.classList.remove("active");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
}

async function renderClientOrders() {
    const container = document.getElementById("client-orders-list");
    if (!container) return;

    const sessionUserStr = sessionStorage.getItem("elybusiness_user_session");
    if (!sessionUserStr) return;
    const user = JSON.parse(sessionUserStr);

    try {
        const clientOrders = await window.fbQuery('orders', 'user_email', '==', user.email);
        // Trier par date décroissante
        clientOrders.sort((a, b) => (b.order_date || '').localeCompare(a.order_date || ''));

        if (clientOrders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-receipt" style="font-size: 3rem; color: var(--secondary); margin-bottom: 1rem; display: block;"></i>
                    <p>Vous n'avez pas encore passé de commande.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        clientOrders.forEach(order => {
            let statusClass = "status-en-attente";
            if (order.status === "En cours") statusClass = "status-en-cours";
            else if (order.status === "Livrée") statusClass = "status-livree";
            else if (order.status === "Annulée") statusClass = "status-anulee";

            const itemsSummary = (order.items || []).map(i => `${i.name} (x${i.quantity})`).join(", ");

            const card = document.createElement("div");
            card.className = "client-order-card";
            card.innerHTML = `
                <div class="client-order-header">
                    <div>
                        <span class="client-order-id">${order.id}</span>
                        <span class="client-order-date"> — ${order.order_date || order.date}</span>
                    </div>
                    <span class="order-status-badge ${statusClass}">
                        <i class="fas fa-circle" style="font-size:0.5rem;"></i> ${order.status}
                    </span>
                </div>
                <div class="client-order-items">
                    <strong>Articles :</strong> ${itemsSummary}
                </div>
                <div class="client-order-footer">
                    <span>Total :</span>
                    <span style="color: var(--secondary); font-size: 1.1rem;">$${order.total} USD</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = `<p style="text-align:center; color:var(--danger);">Erreur Firebase lors de la récupération des commandes.</p>`;
    }
}

// ============================================================
// CLIENT PROFILE MANAGEMENT LOGIC
// ============================================================
function initClientProfile() {
    const profileBtn = document.getElementById("btn-user-profile");
    const modal = document.getElementById("client-profile-modal");
    const closeBtn = document.getElementById("client-profile-close-btn");
    const form = document.getElementById("client-profile-form");

    if (!modal) return;

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            const sessionUserStr = sessionStorage.getItem("elybusiness_user_session");
            if (!sessionUserStr) return;
            const user = JSON.parse(sessionUserStr);

            document.getElementById("profile-name").value = user.name;
            document.getElementById("profile-email").value = user.email;
            document.getElementById("profile-password").value = "";

            modal.classList.add("active");
        });
    }

    const closeModal = () => modal.classList.remove("active");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newName = document.getElementById("profile-name").value.trim();
            const newPass = document.getElementById("profile-password").value;

            const sessionUserStr = sessionStorage.getItem("elybusiness_user_session");
            if (!sessionUserStr) return;
            const currentUser = JSON.parse(sessionUserStr);

            try {
                const result = await window.fbUpdateProfile(currentUser.email, newName, newPass);

                // Mettre à jour la session
                currentUser.name = result.user.name;
                sessionStorage.setItem("elybusiness_user_session", JSON.stringify(currentUser));

                // Mettre à jour l'affichage
                const userGreeting = document.getElementById("user-greeting");
                if (userGreeting) userGreeting.textContent = `Bonjour, ${result.user.name}`;

                showToast("Profil mis à jour avec succès dans Firebase !", "success");
                closeModal();
            } catch (err) {
                showToast("Erreur Firebase lors de la mise à jour du profil : " + err.message, "error");
            }
        });
    }
}

// --- Fonctions de gestion des Témoignages ---

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderStars(rating) {
    const numeric = parseFloat(rating) || 5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (numeric >= i) {
            html += '<i class="fas fa-star"></i>';
        } else if (numeric >= i - 0.5) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

function renderTestimonials() {
    const grid = document.getElementById("testimonials-grid");
    if (!grid) return;

    if (!testimonialsCache || testimonialsCache.length === 0) {
        testimonialsCache = DEFAULT_TESTIMONIALS;
    }

    grid.innerHTML = testimonialsCache.map((t, index) => {
        const starsHtml = renderStars(t.stars);
        const delay = (index * 0.1).toFixed(1);
        const roleText = t.role || "Client satisfait";
        return `
            <div class="testimonial-card fade-up" style="transition-delay:${delay}s">
                <div class="testimonial-stars">
                    ${starsHtml}
                </div>
                <p class="testimonial-text">"${escapeHtml(t.text)}"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h4>${escapeHtml(t.name)}</h4>
                        <span>${escapeHtml(roleText)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function initTestimonialForm() {
    const picker = document.getElementById("star-rating-picker");
    const ratingInput = document.getElementById("testimonial-rating");
    const statusText = document.getElementById("rating-status-text");
    const form = document.getElementById("testimonial-form");
    const nameInput = document.getElementById("testimonial-name");

    if (!picker || !form) return;

    // Pré-remplir le nom si le client est connecté
    const sessionUserStr = sessionStorage.getItem("elybusiness_user_session");
    if (sessionUserStr && nameInput) {
        try {
            const currentUser = JSON.parse(sessionUserStr);
            if (currentUser && currentUser.name) {
                nameInput.value = currentUser.name;
            }
        } catch (e) {}
    }

    const ratingDescriptions = {
        1: { num: "1.0 / 5", desc: "Insatisfait" },
        2: { num: "2.0 / 5", desc: "Moyennement satisfait" },
        3: { num: "3.0 / 5", desc: "Satisfait" },
        4: { num: "4.0 / 5", desc: "Très satisfait" },
        5: { num: "5.0 / 5", desc: "Excellent !" }
    };

    const starBtns = picker.querySelectorAll(".star-btn");

    function updateStarUI(val) {
        const ratingVal = parseInt(val) || 5;
        starBtns.forEach(btn => {
            const btnVal = parseInt(btn.getAttribute("data-value"));
            if (btnVal <= ratingVal) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (statusText && ratingDescriptions[ratingVal]) {
            statusText.innerHTML = `<span class="rating-num">${ratingDescriptions[ratingVal].num}</span> — <span class="rating-desc">${ratingDescriptions[ratingVal].desc}</span>`;
        }
    }

    starBtns.forEach(btn => {
        btn.addEventListener("mouseover", () => {
            const hoverVal = parseInt(btn.getAttribute("data-value"));
            starBtns.forEach(b => {
                const bVal = parseInt(b.getAttribute("data-value"));
                if (bVal <= hoverVal) {
                    b.classList.add("hover");
                } else {
                    b.classList.remove("hover");
                }
            });
        });

        btn.addEventListener("mouseout", () => {
            starBtns.forEach(b => b.classList.remove("hover"));
        });

        btn.addEventListener("click", () => {
            const clickVal = btn.getAttribute("data-value");
            ratingInput.value = clickVal;
            updateStarUI(clickVal);
        });
    });

    // Gestion de la soumission du témoignage
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("testimonial-name").value.trim();
        const role = document.getElementById("testimonial-role").value.trim() || "Client satisfait";
        const stars = parseFloat(ratingInput.value) || 5.0;
        const text = document.getElementById("testimonial-text").value.trim();

        if (!name || !text) {
            showToast("Veuillez saisir votre nom et votre témoignage.", "error");
            return;
        }

        const newTestimonial = {
            id: 'testi-' + Date.now(),
            name: name,
            role: role,
            stars: stars,
            text: text,
            created_at: new Date().toISOString()
        };

        // Enregistrement dans Firebase Firestore
        try {
            await window.fbSet('testimonials', newTestimonial.id, newTestimonial);
        } catch (err) {
            console.warn("Firebase indisponible. Enregistrement local du témoignage.", err);
        }

        // Ajouter au début de la liste et sauvegarder en local
        testimonialsCache.unshift(newTestimonial);
        localStorage.setItem("elybusiness_testimonials", JSON.stringify(testimonialsCache));

        // Actualiser l'affichage
        renderTestimonials();

        // Réinitialiser le champ texte et la note
        document.getElementById("testimonial-text").value = "";
        ratingInput.value = "5";
        updateStarUI(5);

        // Faire défiler doucement vers le haut de la section pour voir son témoignage publié
        const gridEl = document.getElementById("testimonials-grid");
        if (gridEl) {
            gridEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        showToast("Merci ! Votre témoignage a été publié avec succès ⭐", "success");
    });
}

