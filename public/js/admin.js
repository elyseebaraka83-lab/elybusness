// --- Security Protection ---
(function checkAuth() {
    const session = sessionStorage.getItem("elybusiness_admin_session");
    if (!session || !session.startsWith("authenticated_")) {
        window.location.replace("index.html");
    }
})();

// --- Site Defaults (to handle Reset) ---
const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        name: "Recharge Crédit Unités",
        category: "crédits",
        price: 1,
        stock: 50,
        description: "Recharge de crédit d'appel immédiate toutes directions. Valable pour tous les réseaux.",
        image: "assets/extracted_img_0.jpg"
    },
    {
        id: "prod-2",
        name: "Forfait Internet Méga",
        category: "crédits",
        price: 0.5,
        stock: 100,
        description: "Forfait internet ultra-rapide (Méga octets) pour rester connecté sur vos réseaux préférés.",
        image: "assets/extracted_img_0.jpg"
    },
    {
        id: "prod-3",
        name: "Forfait Minutes d'Appel",
        category: "crédits",
        price: 2,
        stock: 40,
        description: "Minutes d'appel longue durée à des tarifs préférentiels. Idéal pour vos besoins professionnels.",
        image: "assets/extracted_img_0.jpg"
    },
    {
        id: "prod-4",
        name: "Casquette Premium ElyBusiness",
        category: "accessoires",
        price: 5,
        stock: 15,
        description: "Casquette stylée avec logo EB brodé. Coton de haute qualité et taille ajustable.",
        image: "assets/extracted_img_2.jpg"
    },
    {
        id: "prod-5",
        name: "Pochette de Protection Smartphone",
        category: "accessoires",
        price: 3,
        stock: 25,
        description: "Pochette antichoc élégante, disponible pour tous modèles de smartphones.",
        image: "assets/extracted_img_2.jpg"
    },
    {
        id: "prod-6",
        name: "Radio Portable Transistor",
        category: "accessoires",
        price: 12,
        stock: 8,
        description: "Radio portable haute sensibilité avec port USB, lecteur carte SD et lampe torche intégrée.",
        image: "assets/extracted_img_2.jpg"
    },
    {
        id: "prod-7",
        name: "Ordinateur Portable Pro",
        category: "électronique",
        price: 250,
        stock: 3,
        description: "Ordinateur portable performant Core i5, 8 Go RAM, 256 Go SSD. Parfait pour les études et le travail.",
        image: "assets/extracted_img_3.jpg"
    },
    {
        id: "prod-8",
        name: "Smartphone NextGen",
        category: "électronique",
        price: 85,
        stock: 6,
        description: "Smartphone avec grand écran 6.5 pouces, batterie longue durée 5000mAh et double caméra photo.",
        image: "assets/extracted_img_3.jpg"
    },
    {
        id: "prod-9",
        name: "T-shirt Branding EB",
        category: "habits",
        price: 7.5,
        stock: 20,
        description: "T-shirt 100% coton arborant fièrement le logo EB. Disponible en plusieurs tailles.",
        image: "assets/extracted_img_0.jpg"
    },
    {
        id: "prod-10",
        name: "Blazer Cérémonie Rouge",
        category: "habits",
        price: 35,
        stock: 4,
        description: "Veste blazer de coupe slim moderne. Tissu haut de gamme de couleur rouge éclatante.",
        image: "assets/extracted_img_1.jpg"
    }
];

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

// State variables for dynamic Base64 images
let uploadedProductImageBase64 = "";
let uploadedCEOImageBase64 = "";
let uploadedLogoImageBase64 = "";
let uploadedAboutImageBase64 = "";

// --- Firebase SDK (injecté via firebase-config.js dans le HTML) ---
// Les helpers fbGetAll, fbGetSettings, etc. sont exposés sur window
let productsCache = [];
let settingsCache = {};

// Récupération des données depuis Firebase Firestore
async function loadDataFromServer() {
    try {
        productsCache = await window.fbGetAll('products');
        settingsCache = await window.fbGetSettings();
    } catch (err) {
        console.error("Erreur Firebase", err);
        productsCache = JSON.parse(localStorage.getItem("elybusiness_products")) || DEFAULT_PRODUCTS;
        settingsCache = JSON.parse(localStorage.getItem("elybusiness_settings")) || DEFAULT_SETTINGS;
    }
}

// Database Helpers
function getProducts() {
    return productsCache.length > 0 ? productsCache : DEFAULT_PRODUCTS;
}

function getSettings() {
    return Object.keys(settingsCache).length > 0 ? settingsCache : DEFAULT_SETTINGS;
}

// --- Application Logic Entrypoint ---
document.addEventListener("DOMContentLoaded", async () => {
    // Hide security blocker
    const blocker = document.getElementById("security-blocker");
    if (blocker) blocker.style.display = "none";

    // Setup Tab Controls
    initTabs();
    
    // Charger d'abord les données de la base MySQL
    await loadDataFromServer();

    // Load and render products
    loadProductsTable();

    // Load and populate settings
    loadSettingsForm();

    // Load and render users
    await loadUsersTable();

    // Load and render orders & stats
    await loadOrdersTable();
    await loadStats();
    await loadTestimonialsTable();

    // Init actions handlers
    initActionHandlers();
});

// Sidebar navigation
function initTabs() {
    const tabBtns = document.querySelectorAll(".admin-sidebar-btn");
    const tabSections = document.querySelectorAll(".admin-section");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const targetTab = btn.getAttribute("data-tab");
            tabSections.forEach(sec => {
                if (sec.getAttribute("id") === targetTab) {
                    sec.classList.add("active");
                } else {
                    sec.classList.remove("active");
                }
            });
        });
    });
}

// --- Product Management Logic ---
function loadProductsTable() {
    const tbody = document.getElementById("admin-products-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const products = getProducts();

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Aucun article dans la base de données.
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const tr = document.createElement("tr");
        const defaultImg = "assets/extracted_img_0.jpg";
        const imgSrc = product.image || defaultImg;
        const stockCount = product.stock !== undefined ? product.stock : 15;

        let stockBadgeHtml = `<span class="stock-badge stock-ok">${stockCount}</span>`;
        if (stockCount <= 0) {
            stockBadgeHtml = `<span class="stock-badge stock-out">Rupture (0)</span>`;
        } else if (stockCount <= 5) {
            stockBadgeHtml = `<span class="stock-badge stock-low">${stockCount} (Faible)</span>`;
        }

        tr.innerHTML = `
            <td>
                <img src="${imgSrc}" class="admin-table-img" alt="${product.name}" onerror="this.onerror=null;this.src='${defaultImg}';">
            </td>
            <td style="font-weight: 600;">${product.name}</td>
            <td><span class="product-category-badge" style="position: static; display: inline-block;">${product.category}</span></td>
            <td class="admin-table-price">$${product.price}</td>
            <td>${stockBadgeHtml}</td>
            <td style="text-align: right;">
                <div style="display: inline-flex; gap: 0.5rem;">
                    <button class="btn-admin-action btn-admin-edit" onclick="editProduct('${product.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-admin-action btn-admin-delete" onclick="deleteProduct('${product.id}')" title="Supprimer">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Global functions for inline click events in table
window.editProduct = function(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Open product modal in edit mode
    document.getElementById("product-modal-title").textContent = "Modifier l'article";
    document.getElementById("product-modal-desc").textContent = "Mettez à jour les caractéristiques de cet article.";
    document.getElementById("product-form-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-category").value = product.category.toLowerCase();
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-stock").value = product.stock !== undefined ? product.stock : 15;
    document.getElementById("product-description").value = product.description;

    // Reset base64 cache and set preview
    uploadedProductImageBase64 = product.image || "";
    const preview = document.getElementById("product-photo-preview");
    const status = document.getElementById("product-photo-status");
    if (product.image) {
        preview.src = product.image;
        preview.style.display = "block";
        status.style.display = "none";
    } else {
        preview.style.display = "none";
        status.style.display = "block";
    }

    document.getElementById("product-modal").classList.add("active");
};

window.deleteProduct = async function(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Voulez-vous vraiment retirer l'article "${product.name}" ?`)) {
        try {
            await window.fbDelete('products', id);
            showToast("Article retiré avec succès", "success");
            await loadDataFromServer();
            loadProductsTable();
            await loadStats();
        } catch (err) {
            showToast("Erreur Firebase : " + err.message, "error");
        }
    }
};

// --- General Settings Logic ---
function loadSettingsForm() {
    const settings = getSettings();

    document.getElementById("setting-welcome-title").value = settings.welcomeTitle;
    document.getElementById("setting-whatsapp").value = settings.whatsappNumber;
    document.getElementById("setting-welcome-desc").value = settings.welcomeDesc;
    document.getElementById("setting-email").value = settings.emailAddress;
    document.getElementById("setting-address").value = settings.physicalAddress;
    document.getElementById("setting-facebook").value = settings.facebookLink || "";
    document.getElementById("setting-instagram").value = settings.instagramLink || "";
    document.getElementById("setting-ceo-name").value = settings.ceoName;
    document.getElementById("setting-ceo-bio").value = settings.ceoBio;

    // Setup previews
    setupImagePreview("ceo-photo-preview", "ceo-photo-status", settings.ceoPhoto);
    uploadedCEOImageBase64 = settings.ceoPhoto || "";
    
    setupImagePreview("logo-photo-preview", "logo-photo-status", settings.logoImg);
    uploadedLogoImageBase64 = settings.logoImg || "";
    
    setupImagePreview("about-photo-preview", "about-photo-status", settings.aboutImg);
    uploadedAboutImageBase64 = settings.aboutImg || "";
}

function setupImagePreview(imgId, statusId, value) {
    const img = document.getElementById(imgId);
    const status = document.getElementById(statusId);
    if (value) {
        img.src = value;
        img.style.display = "block";
        status.style.display = "none";
    } else {
        img.style.display = "none";
        status.style.display = "block";
    }
}

// Setup Event Handlers
function initActionHandlers() {
    const logoutBtn = document.getElementById("admin-logout-btn");
    const addProductBtn = document.getElementById("btn-add-product");
    const productModal = document.getElementById("product-modal");
    const productCloseBtn = document.getElementById("product-modal-close-btn");
    const productCancelBtn = document.getElementById("btn-cancel-product");
    const productForm = document.getElementById("product-form");
    const settingsForm = document.getElementById("admin-settings-form");
    
    // Backup & Reset Buttons
    const exportBtn = document.getElementById("btn-export-db");
    const importBtn = document.getElementById("btn-import-db");
    const importFile = document.getElementById("import-db-file");
    const resetBtn = document.getElementById("btn-reset-db");

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("elybusiness_admin_session");
            showToast("Déconnexion en cours...", "success");
            setTimeout(() => {
                window.location.replace("index.html");
            }, 1000);
        });
    }

    // Modal product open/close
    if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
            // Reset form for addition
            productForm.reset();
            document.getElementById("product-form-id").value = "";
            document.getElementById("product-stock").value = "15";
            document.getElementById("product-modal-title").textContent = "Ajouter un produit";
            document.getElementById("product-modal-desc").textContent = "Saisissez les informations de votre nouveau produit.";
            
            // Reset image uploaded cache
            uploadedProductImageBase64 = "";
            document.getElementById("product-photo-preview").style.display = "none";
            document.getElementById("product-photo-status").style.display = "block";

            productModal.classList.add("active");
        });
    }

    const closeProductModal = () => {
        productModal.classList.remove("active");
    };

    if (productCloseBtn) productCloseBtn.addEventListener("click", closeProductModal);
    if (productCancelBtn) productCancelBtn.addEventListener("click", closeProductModal);
    
    // Close modal on click outside
    productModal.addEventListener("click", (e) => {
        if (e.target === productModal) closeProductModal();
    });

    // Handle Base64 file loading for modals & settings inputs
    setupFileInputBase64("product-photo-upload", "product-photo-file", "product-photo-preview", "product-photo-status", (b64) => {
        uploadedProductImageBase64 = b64;
    });

    setupFileInputBase64("ceo-photo-upload", "ceo-photo-file", "ceo-photo-preview", "ceo-photo-status", (b64) => {
        uploadedCEOImageBase64 = b64;
    });

    setupFileInputBase64("logo-photo-upload", "logo-photo-file", "logo-photo-preview", "logo-photo-status", (b64) => {
        uploadedLogoImageBase64 = b64;
    });

    setupFileInputBase64("about-photo-upload", "about-photo-file", "about-photo-preview", "about-photo-status", (b64) => {
        uploadedAboutImageBase64 = b64;
    });

    // Submit product form (Add or Edit)
    if (productForm) {
        productForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const id = document.getElementById("product-form-id").value;
            const name = document.getElementById("product-name").value.trim();
            const category = document.getElementById("product-category").value;
            const price = parseFloat(document.getElementById("product-price").value);
            const stock = parseInt(document.getElementById("product-stock").value, 10) || 0;
            const description = document.getElementById("product-description").value.trim();
            
            const payload = {
                id: id || "prod-" + Date.now(),
                name,
                category,
                price,
                stock,
                description,
                image: uploadedProductImageBase64
            };

            try {
                const finalPayload = { ...payload };
                if (id) {
                    // Si modification d'image vide, conserver l'existante
                    const existingProduct = productsCache.find(p => p.id === id);
                    if (!finalPayload.image && existingProduct) {
                        finalPayload.image = existingProduct.image;
                    }
                    await window.fbUpdate('products', id, finalPayload);
                } else {
                    finalPayload.image = finalPayload.image || "assets/extracted_img_0.jpg";
                    await window.fbSet('products', finalPayload.id, finalPayload);
                }

                showToast(id ? "Article mis à jour avec succès" : "Nouvel article ajouté", "success");
                closeProductModal();
                await loadDataFromServer();
                loadProductsTable();
                await loadStats();
            } catch (err) {
                showToast("Erreur Firebase lors de la sauvegarde : " + err.message, "error");
            }
        });
    }

    // Submit general settings form
    if (settingsForm) {
        settingsForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const existingSettings = getSettings();
            const updated = {
                welcomeTitle: document.getElementById("setting-welcome-title").value.trim(),
                whatsappNumber: document.getElementById("setting-whatsapp").value.trim(),
                welcomeDesc: document.getElementById("setting-welcome-desc").value.trim(),
                emailAddress: document.getElementById("setting-email").value.trim(),
                physicalAddress: document.getElementById("setting-address").value.trim(),
                facebookLink: document.getElementById("setting-facebook").value.trim(),
                instagramLink: document.getElementById("setting-instagram").value.trim(),
                ceoName: document.getElementById("setting-ceo-name").value.trim(),
                ceoBio: document.getElementById("setting-ceo-bio").value.trim(),
                ceoPhoto: uploadedCEOImageBase64 || existingSettings.ceoPhoto,
                aboutImg: uploadedAboutImageBase64 || existingSettings.aboutImg,
                logoImg: uploadedLogoImageBase64 || existingSettings.logoImg
            };

            try {
                await window.fbSaveSettings(updated);

                // Handle Admin password update if supplied
                const newAdminPass = document.getElementById("setting-admin-new-pass")?.value;
                const confirmAdminPass = document.getElementById("setting-admin-confirm-pass")?.value;

                if (newAdminPass || confirmAdminPass) {
                    if (newAdminPass !== confirmAdminPass) {
                        showToast("Les mots de passe administrateur ne correspondent pas.", "error");
                        return;
                    }
                    if (newAdminPass.length < 6) {
                        showToast("Le mot de passe administrateur doit contenir au moins 6 caractères.", "error");
                        return;
                    }
                    await window.fbChangeAdminPassword(newAdminPass);
                    document.getElementById("setting-admin-new-pass").value = "";
                    document.getElementById("setting-admin-confirm-pass").value = "";
                    showToast("Paramètres du site & mot de passe Admin enregistrés dans Firebase !", "success");
                } else {
                    showToast("Paramètres du site enregistrés !", "success");
                }
                
                await loadDataFromServer();
            } catch (err) {
                showToast("Erreur de connexion Firebase.", "error");
            }
        });
    }

    // 1. Exporter les données (Exporter en JSON)
    if (exportBtn) {
        exportBtn.addEventListener("click", async () => {
            try {
                let users = [];
                let orders = [];
                let testimonials = [];

                // Récupération depuis Firebase
                try {
                    const fbUsers = await window.fbGetAll('users');
                    if (fbUsers.length > 0) users = fbUsers.map(u => ({ name: u.name, email: u.email }));

                    const fbOrders = await window.fbGetAll('orders');
                    if (fbOrders.length > 0) orders = fbOrders;

                    const fbTesti = await window.fbGetAll('testimonials');
                    if (fbTesti.length > 0) testimonials = fbTesti;
                } catch (e) {
                    console.warn("Firebase non joignable pour l'exportation, lecture du stockage local", e);
                }

                // Fallback localStorage
                if (users.length === 0) users = JSON.parse(localStorage.getItem("elybusiness_users")) || [];
                if (orders.length === 0) orders = JSON.parse(localStorage.getItem("elybusiness_orders")) || [];
                if (testimonials.length === 0) testimonials = JSON.parse(localStorage.getItem("elybusiness_testimonials")) || DEFAULT_TESTIMONIALS;

                const backup = {
                    version: "1.0",
                    exportDate: new Date().toISOString(),
                    products: getProducts(),
                    settings: getSettings(),
                    users: users,
                    orders: orders,
                    testimonials: testimonials
                };

                const jsonString = JSON.stringify(backup, null, 2);
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                
                const downloadAnchor = document.createElement('a');
                downloadAnchor.href = url;
                const filenameDate = new Date().toISOString().slice(0, 10);
                downloadAnchor.download = `elybusiness_sauvegarde_${filenameDate}.json`;
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                
                setTimeout(() => {
                    document.body.removeChild(downloadAnchor);
                    URL.revokeObjectURL(url);
                }, 100);

                showToast("Fichier de sauvegarde JSON téléchargé avec succès !", "success");
            } catch (err) {
                console.error("Erreur d'exportation", err);
                showToast("Erreur lors de la création du fichier de sauvegarde.", "error");
            }
        });
    }

    // 2. Importer les données (Importer un fichier)
    if (importBtn && importFile) {
        importBtn.addEventListener("click", () => {
            importFile.value = "";
            importFile.click();
        });

        importFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    const parsed = JSON.parse(event.target.result);

                    if (!parsed || (typeof parsed !== 'object')) {
                        showToast("Le fichier sélectionné n'est pas un JSON valide.", "error");
                        return;
                    }

                    // 1. Mise à jour de localStorage (mode hors ligne / miroir)
                    if (parsed.products && Array.isArray(parsed.products)) {
                        localStorage.setItem("elybusiness_products", JSON.stringify(parsed.products));
                    }
                    if (parsed.settings && typeof parsed.settings === 'object') {
                        localStorage.setItem("elybusiness_settings", JSON.stringify(parsed.settings));
                    }
                    if (parsed.users && Array.isArray(parsed.users)) {
                        localStorage.setItem("elybusiness_users", JSON.stringify(parsed.users));
                    }
                    if (parsed.orders && Array.isArray(parsed.orders)) {
                        localStorage.setItem("elybusiness_orders", JSON.stringify(parsed.orders));
                    }
                    if (parsed.testimonials && Array.isArray(parsed.testimonials)) {
                        localStorage.setItem("elybusiness_testimonials", JSON.stringify(parsed.testimonials));
                    }

                    // Synchronisation Firebase Firestore
                    try {
                        // Effacer et ré-injecter dans Firestore
                        const colls = ['products', 'settings', 'users', 'orders', 'testimonials'];
                        for (const c of colls) await window.fbClearCollection(c);

                        if (parsed.settings) await window.fbSaveSettings(parsed.settings);

                        if (parsed.products?.length) {
                            for (const p of parsed.products) await window.fbSet('products', p.id, p);
                        }
                        if (parsed.users?.length) {
                            for (const u of parsed.users) await window.fbSet('users', u.email, u);
                        }
                        if (parsed.testimonials?.length) {
                            for (const t of parsed.testimonials) await window.fbSet('testimonials', t.id, t);
                        }
                        if (parsed.orders?.length) {
                            for (const o of parsed.orders) await window.fbSet('orders', o.id, o);
                        }
                    } catch (apiErr) {
                        console.warn("Synchronisation Firebase impossible lors de l'import.", apiErr);
                    }

                    showToast("Données importées avec succès ! Rechargement...", "success");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                } catch (err) {
                    console.error("Erreur d'importation JSON:", err);
                    showToast("Fichier JSON invalide ou corrompu.", "error");
                }
            };
            reader.readAsText(file);
        });
    }

    // 3. Réinitialiser l'application (Réinitialiser les données)
    if (resetBtn) {
        resetBtn.addEventListener("click", async () => {
            const confirmation = confirm("Attention ! Cela va réinitialiser l'ensemble des produits, paramètres, commandes, témoignages et utilisateurs aux valeurs par défaut. Continuer ?");
            if (!confirmation) return;

            try {
                // 1. Mettre à jour le stockage local
                localStorage.setItem("elybusiness_products", JSON.stringify(DEFAULT_PRODUCTS));
                localStorage.setItem("elybusiness_settings", JSON.stringify(DEFAULT_SETTINGS));
                localStorage.setItem("elybusiness_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
                localStorage.removeItem("elybusiness_users");
                localStorage.removeItem("elybusiness_orders");

                // Réinitialisation Firebase
                try {
                    const colls = ['products', 'settings', 'users', 'orders', 'testimonials'];
                    for (const c of colls) await window.fbClearCollection(c);

                    await window.fbSaveSettings(DEFAULT_SETTINGS);
                    for (const p of DEFAULT_PRODUCTS) await window.fbSet('products', p.id, p);
                    for (const t of DEFAULT_TESTIMONIALS) await window.fbSet('testimonials', t.id, { ...t, created_at: new Date().toISOString() });
                } catch (apiErr) {
                    console.warn("Firebase non disponible pour réinitialisation.", apiErr);
                }

                showToast("Application réinitialisée aux valeurs par défaut ! Rechargement...", "success");
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            } catch (err) {
                console.error("Erreur de réinitialisation:", err);
                showToast("Erreur lors de la réinitialisation.", "error");
            }
        });
    }
}

// Utility function to bind base64 file reader triggers to dropzones/file-selectors
function setupFileInputBase64(containerId, inputId, previewImgId, statusTextId, callback) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewImgId);
    const status = document.getElementById(statusTextId);

    if (!container || !input || !preview || !status) return;

    // Clic trigger
    container.addEventListener("click", () => {
        input.click();
    });

    // File change trigger
    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            const base64 = evt.target.result;
            preview.src = base64;
            preview.style.display = "block";
            status.style.display = "none";
            
            // Propagate base64 back
            callback(base64);
        };
        reader.readAsDataURL(file);
    });

    // Drag and drop support
    container.addEventListener("dragover", (e) => {
        e.preventDefault();
        container.style.borderColor = "var(--primary)";
    });

    container.addEventListener("dragleave", () => {
        container.style.borderColor = "rgba(255, 255, 255, 0.1)";
    });

    container.addEventListener("drop", (e) => {
        e.preventDefault();
        container.style.borderColor = "rgba(255, 255, 255, 0.1)";
        
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            const base64 = evt.target.result;
            preview.src = base64;
            preview.style.display = "block";
            status.style.display = "none";
            
            callback(base64);
        };
        reader.readAsDataURL(file);
    });
}

// Toast notification helper
function showToast(message, type = "success") {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = message;
    toast.className = `toast active toast-${type}`;
    
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

// --- Users Management Tab Logic ---
async function loadUsersTable() {
    const tbody = document.getElementById("admin-users-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    try {
        const users = await window.fbGetAll('users');

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2.5rem;">
                        <i class="fas fa-users-slash" style="font-size: 2rem; margin-bottom: 0.8rem; color: var(--primary); display: block;"></i>
                        Aucun client enregistré dans Firebase Firestore.
                    </td>
                </tr>
            `;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement("tr");
            const maskedPass = user.password || '••••••••';
            tr.innerHTML = `
                <td style="font-weight: 600; padding: 1.2rem 1rem;">${user.name || 'Client'}</td>
                <td style="padding: 1.2rem 1rem; color: var(--secondary);">${user.email}</td>
                <td style="padding: 1.2rem 1rem; font-family: monospace; color: var(--primary-light);">
                    <span title="Mot de passe stocké dans Firebase">${maskedPass}</span>
                </td>
                <td style="text-align: right; padding: 1.2rem 1rem;">
                    <button class="btn-admin-action btn-admin-delete" onclick="deleteUser('${user.email}')" title="Supprimer le compte client de Firebase">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--danger)">Erreur Firebase lors du chargement des utilisateurs.</td></tr>`;
    }
}

window.deleteUser = async function(email) {
    if (confirm(`Voulez-vous vraiment supprimer le compte de l'utilisateur ${email} ?`)) {
        try {
            await window.fbDelete('users', email);
            showToast("Compte utilisateur supprimé avec succès", "success");
            await loadUsersTable();
            await loadStats();
        } catch (err) {
            showToast("Erreur Firebase : " + err.message, "error");
        }
    }
};

// --- Orders Management & Filtering ---
async function loadOrdersTable(statusFilter = "tout") {
    const tbody = document.getElementById("admin-orders-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    // Attach filter buttons listeners if present
    const filterBtns = document.querySelectorAll(".order-filter-btn");
    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadOrdersTable(btn.getAttribute("data-status"));
        };
    });

    try {
        const orders = await window.fbGetAll('orders');
        orders.sort((a, b) => (b.order_date || '').localeCompare(a.order_date || ''));

        let filteredOrders = statusFilter === "tout" 
            ? orders 
            : orders.filter(o => o.status === statusFilter);

        if (filteredOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2.5rem;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.8rem; color: var(--secondary); display: block;"></i>
                        Aucune commande trouvée.
                    </td>
                </tr>
            `;
            return;
        }

        // Display newest first (server already sorts order_date DESC but client date format sorting fallback)
        filteredOrders.forEach(order => {
            const tr = document.createElement("tr");
            const itemsSummary = order.items.map(i => `${i.name} (x${i.quantity})`).join(", ");

            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--primary-light);">${order.id}</td>
                <td style="font-size: 0.85rem; color: var(--text-muted);">${order.order_date || order.date}</td>
                <td>
                    <div style="font-weight: 600;">${order.user_name || order.userName}</div>
                    <div style="font-size: 0.78rem; color: var(--secondary);">${order.user_email || order.userEmail}</div>
                </td>
                <td style="font-size: 0.88rem; max-width: 250px;">${itemsSummary}</td>
                <td style="font-weight: 800; color: var(--secondary);">$${order.total}</td>
                <td>
                    <select class="form-control" style="padding: 0.35rem 0.6rem; font-size: 0.82rem; background: #17132a;" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="En attente" ${order.status === "En attente" ? "selected" : ""}>En attente</option>
                        <option value="En cours" ${order.status === "En cours" ? "selected" : ""}>En cours</option>
                        <option value="Livrée" ${order.status === "Livrée" ? "selected" : ""}>Livrée</option>
                        <option value="Annulée" ${order.status === "Annulée" ? "selected" : ""}>Annulée</option>
                    </select>
                </td>
                <td style="text-align: right;">
                    <button class="btn-admin-action btn-admin-delete" onclick="deleteOrder('${order.id}')" title="Supprimer la commande">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger)">Erreur Firebase.</td></tr>`;
    }
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        await window.fbUpdate('orders', orderId, { status: newStatus });
        showToast(`Commande ${orderId} marquée comme '${newStatus}'`, "success");
        await loadStats();
    } catch (err) {
        showToast("Erreur Firebase : " + err.message, "error");
    }
};

window.deleteOrder = async function(orderId) {
    if (confirm(`Voulez-vous vraiment supprimer la commande "${orderId}" ?`)) {
        try {
            await window.fbDelete('orders', orderId);
            showToast("Commande supprimée avec succès", "success");
            await loadOrdersTable();
            await loadStats();
        } catch (err) {
            showToast("Erreur Firebase : " + err.message, "error");
        }
    }
};

async function loadStats() {
    const revenueEl = document.getElementById("kpi-total-revenue");
    const ordersEl = document.getElementById("kpi-total-orders");
    const prodsEl = document.getElementById("kpi-total-products");
    const clientsEl = document.getElementById("kpi-total-clients");
    const lowStockTbody = document.getElementById("admin-low-stock-tbody");

    if (!revenueEl || !ordersEl || !prodsEl || !clientsEl) return;

    try {
        const [orders, products, users] = await Promise.all([
            window.fbGetAll('orders'),
            window.fbGetAll('products'),
            window.fbGetAll('users')
        ]);

        const totalRevenue = orders
            .filter(o => o.status !== 'Annulée')
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

        const rev = Number(totalRevenue) || 0;
        revenueEl.textContent = `$${rev % 1 === 0 ? rev : rev.toFixed(2)}`;
        ordersEl.textContent = orders.length;
        prodsEl.textContent = products.length;
        clientsEl.textContent = users.length;

        // Produits à faible stock
        if (lowStockTbody) {
            lowStockTbody.innerHTML = "";
            const lowStockProducts = products.filter(p => (parseInt(p.stock) || 0) <= 5);

            if (lowStockProducts.length === 0) {
                lowStockTbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--success); padding: 1.5rem;">
                            <i class="fas fa-check-circle"></i> Aucun produit en alerte de stock faible.
                        </td>
                    </tr>
                `;
                return;
            }

            lowStockProducts.forEach(product => {
                const stockCount = product.stock !== undefined ? product.stock : 15;
                let statusHtml = `<span class="stock-badge stock-low">Faible</span>`;
                if (stockCount <= 0) statusHtml = `<span class="stock-badge stock-out">Rupture</span>`;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-weight: 600;">${product.name}</td>
                    <td><span class="product-category-badge" style="position: static; display: inline-block;">${product.category}</span></td>
                    <td class="admin-table-price">$${product.price}</td>
                    <td style="font-weight: 800; color: var(--warning);">${stockCount}</td>
                    <td>${statusHtml}</td>
                `;
                lowStockTbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Erreur Firebase stats", err);
    }
}

async function loadTestimonialsTable() {
    const tbody = document.getElementById("admin-testimonials-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    let testimonials = [];

    try {
        testimonials = await window.fbGetAll('testimonials');
        testimonials.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    } catch (err) {
        console.warn("Firebase: impossible de charger les témoignages", err);
        testimonials = JSON.parse(localStorage.getItem("elybusiness_testimonials")) || [];
    }

    if (testimonials.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Aucun témoignage enregistré.
                </td>
            </tr>
        `;
        return;
    }

    testimonials.forEach(t => {
        const tr = document.createElement("tr");
        const starsNum = parseFloat(t.stars) || 5;
        tr.innerHTML = `
            <td style="font-weight: 600;">${t.name}</td>
            <td><span class="product-category-badge" style="position: static; display: inline-block;">${t.role || 'Client'}</span></td>
            <td style="color: var(--gold); font-weight: 700;">${starsNum} ⭐</td>
            <td style="max-width: 300px; white-space: normal; font-size: 0.85rem;">"${t.text}"</td>
            <td style="text-align: right;">
                <button class="btn btn-secondary btn-sm" onclick="deleteTestimonial('${t.id}')" style="color: var(--danger);" title="Supprimer">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteTestimonial = async function(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce témoignage ?")) return;

    try {
        await window.fbDelete('testimonials', id);
        showToast("Témoignage supprimé avec succès.", "success");
        loadTestimonialsTable();
    } catch (err) {
        showToast("Erreur Firebase : " + err.message, "error");
    }
};

