const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// INITIALISATION FIREBASE ADMIN SDK
// ============================================================
let serviceAccount;
try {
    // Option 1 : fichier serviceAccountKey.json (recommandé en local)
    serviceAccount = require('./serviceAccountKey.json');
    initializeApp({
        credential: cert(serviceAccount)
    });
} catch (e) {
    console.error('Erreur Firebase detail:', e);
    // Option 2 : variables d'environnement (pour déploiement serveur)
    if (process.env.FIREBASE_PROJECT_ID) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY
                    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                    : undefined
            })
        });
    } else {
        console.error('❌ Aucune configuration Firebase trouvée !');
        console.error('   → Ajoutez le fichier serviceAccountKey.json dans le dossier du projet.');
        console.error('   → OU définissez les variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY dans le .env');
        process.exit(1);
    }
}

const db = getFirestore();
console.log('✅ Firebase Admin SDK initialisé avec succès !');


// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// ============================================================
// UTILITAIRES
// ============================================================

/** Convertit un DocumentSnapshot Firestore en objet JS simple */
function docToObj(doc) {
    return { id: doc.id, ...doc.data() };
}

/** Initialise les données par défaut si les collections sont vides */
async function initDefaultData() {
    try {
        // --- Témoignages ---
        const testimonialsSnap = await db.collection('testimonials').limit(1).get();
        if (testimonialsSnap.empty) {
            const batch = db.batch();
            const defaults = [
                { id: 'testi-1', name: 'Patrick M.', role: 'Client depuis 2025', stars: 5.0, text: "Service incroyable ! J'ai reçu ma recharge en moins de 5 minutes. ElyBusiness est devenu mon fournisseur de confiance pour tous mes besoins téléphoniques.", created_at: new Date().toISOString() },
                { id: 'testi-2', name: 'Gracia K.', role: 'Cliente satisfaite', stars: 5.0, text: "La casquette que j'ai commandée est de très belle qualité. Le service client via WhatsApp est réactif et très professionnel. Je recommande !", created_at: new Date().toISOString() },
                { id: 'testi-3', name: 'David N.', role: 'Client régulier', stars: 4.5, text: "J'ai acheté un smartphone via ElyBusiness, livraison rapide et prix compétitif. L'équipe est sérieuse et digne de confiance. Merci !", created_at: new Date().toISOString() }
            ];
            defaults.forEach(t => batch.set(db.collection('testimonials').doc(t.id), t));
            await batch.commit();
            console.log('✅ Témoignages par défaut insérés dans Firestore.');
        }

        // --- Paramètres ---
        const settingsSnap = await db.collection('settings').limit(1).get();
        if (settingsSnap.empty) {
            const settingsDefaults = {
                welcomeTitle: 'Bienvenue sur le site ElyBusiness',
                welcomeDesc: "Votre partenaire de confiance pour tous vos besoins de recharges (crédits, méga, minutes), d'accessoires de mode, d'appareils électroniques, de vêtements et bien plus encore.",
                whatsappNumber: '+243981470106',
                emailAddress: 'elyseebaraka83@gmail.com',
                physicalAddress: 'Goma, DRC',
                facebookLink: 'https://facebook.com/elyseebaraka',
                instagramLink: 'https://instagram.com/elyseebaraka',
                ceoName: 'Elysée BARAKA',
                ceoBio: "Chez ElyBusiness, notre priorité absolue est la satisfaction du client. Nous croyons que la technologie et les accessoires de qualité doivent être accessibles à tous rapidement et en toute sécurité. Nous continuons d'innover pour vous apporter des solutions adaptées à vos besoins financiers et de communication.",
                ceoPhoto: 'assets/extracted_img_1.jpg',
                aboutImg: 'assets/extracted_img_3.jpg',
                logoImg: 'assets/logo.svg',
                adminPassword: 'R1234ad@'
            };
            const batch = db.batch();
            for (const [key, val] of Object.entries(settingsDefaults)) {
                batch.set(db.collection('settings').doc(key), { value: val });
            }
            await batch.commit();
            console.log('✅ Paramètres par défaut insérés dans Firestore.');
        } else {
            // S'assurer que adminPassword existe dans Firestore
            const adminPassDoc = await db.collection('settings').doc('adminPassword').get();
            if (!adminPassDoc.exists) {
                await db.collection('settings').doc('adminPassword').set({ value: 'R1234ad@' });
            }
        }

        // --- Produits ---
        const productsSnap = await db.collection('products').limit(1).get();
        if (productsSnap.empty) {
            const products = [
                { id: 'prod-1', name: 'Recharge Crédit Unités', category: 'crédits', price: 1.00, stock: 50, description: "Recharge de crédit d'appel immédiate toutes directions. Valable pour tous les réseaux.", image: 'assets/extracted_img_0.jpg' },
                { id: 'prod-2', name: 'Forfait Internet Méga', category: 'crédits', price: 0.50, stock: 100, description: 'Forfait internet ultra-rapide (Méga octets) pour rester connecté sur vos réseaux préférés.', image: 'assets/extracted_img_0.jpg' },
                { id: 'prod-3', name: "Forfait Minutes d'Appel", category: 'crédits', price: 2.00, stock: 40, description: "Minutes d'appel longue durée à des tarifs préférentiels. Idéal pour vos besoins professionnels.", image: 'assets/extracted_img_0.jpg' },
                { id: 'prod-4', name: 'Casquette Premium ElyBusiness', category: 'accessoires', price: 5.00, stock: 15, description: 'Casquette stylée avec logo EB brodé. Coton de haute qualité et taille ajustable.', image: 'assets/extracted_img_2.jpg' },
                { id: 'prod-5', name: 'Pochette de Protection Smartphone', category: 'accessoires', price: 3.00, stock: 25, description: 'Pochette antichoc élégante, disponible pour tous modèles de smartphones.', image: 'assets/extracted_img_2.jpg' },
                { id: 'prod-6', name: 'Radio Portable Transistor', category: 'accessoires', price: 12.00, stock: 8, description: 'Radio portable haute sensibilité avec port USB, lecteur carte SD et lampe torche intégrée.', image: 'assets/extracted_img_2.jpg' },
                { id: 'prod-7', name: 'Ordinateur Portable Pro', category: 'électronique', price: 250.00, stock: 3, description: 'Ordinateur portable performant Core i5, 8 Go RAM, 256 Go SSD. Parfait pour les études et le travail.', image: 'assets/extracted_img_3.jpg' },
                { id: 'prod-8', name: 'Smartphone NextGen', category: 'électronique', price: 85.00, stock: 6, description: 'Smartphone avec grand écran 6.5 pouces, batterie longue durée 5000mAh et double caméra photo.', image: 'assets/extracted_img_3.jpg' },
                { id: 'prod-9', name: 'T-shirt Branding EB', category: 'habits', price: 7.50, stock: 20, description: 'T-shirt 100% coton arborant fièrement le logo EB. Disponible en plusieurs tailles.', image: 'assets/extracted_img_0.jpg' },
                { id: 'prod-10', name: 'Blazer Cérémonie Rouge', category: 'habits', price: 35.00, stock: 4, description: 'Veste blazer de coupe slim moderne. Tissu haut de gamme de couleur rouge éclatante.', image: 'assets/extracted_img_1.jpg' }
            ];
            const batch = db.batch();
            products.forEach(p => batch.set(db.collection('products').doc(p.id), p));
            await batch.commit();
            console.log('✅ Produits par défaut insérés dans Firestore.');
        }

    } catch (err) {
        console.error('⚠️  Erreur lors de l\'initialisation des données par défaut :', err.message);
    }
}

initDefaultData();


// ============================================================
// ROUTES TÉMOIGNAGES (TESTIMONIALS)
// ============================================================

// Obtenir tous les témoignages
app.get('/api/testimonials', async (req, res) => {
    try {
        const snap = await db.collection('testimonials').orderBy('created_at', 'desc').get();
        res.json(snap.docs.map(docToObj));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter un témoignage
app.post('/api/testimonials', async (req, res) => {
    try {
        const { name, role, stars, text } = req.body;
        if (!name || !text) {
            return res.status(400).json({ error: 'Le nom et le texte du témoignage sont obligatoires.' });
        }
        const id = 'testi-' + Date.now();
        const authorRole = role && role.trim() !== '' ? role.trim() : 'Client satisfait';
        const ratingStars = parseFloat(stars) || 5.0;
        const created_at = new Date().toISOString();

        const data = { id, name: name.trim(), role: authorRole, stars: ratingStars, text: text.trim(), created_at };
        await db.collection('testimonials').doc(id).set(data);

        res.status(201).json({ ...data, message: 'Témoignage ajouté avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un témoignage (Admin)
app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        await db.collection('testimonials').doc(req.params.id).delete();
        res.json({ message: 'Témoignage supprimé avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTES PARAMÈTRES (SETTINGS)
// ============================================================

// Lire tous les paramètres
app.get('/api/settings', async (req, res) => {
    try {
        const snap = await db.collection('settings').get();
        const settings = {};
        snap.docs.forEach(doc => {
            settings[doc.id] = doc.data().value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mettre à jour les paramètres
app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        const batch = db.batch();
        for (const [key, val] of Object.entries(settings)) {
            batch.set(db.collection('settings').doc(key), { value: val }, { merge: true });
        }
        await batch.commit();
        res.json({ message: 'Paramètres enregistrés avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connexion Admin via Firebase Firestore
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const settingsSnap = await db.collection('settings').doc('adminPassword').get();
        const storedPass = settingsSnap.exists ? settingsSnap.data().value : 'R1234ad@';
        
        const emailSnap = await db.collection('settings').doc('emailAddress').get();
        const adminEmail = emailSnap.exists ? emailSnap.data().value : 'elybusness83@gmail.com';

        const inputEmail = (email || '').toLowerCase().trim();
        const configuredEmail = adminEmail.toLowerCase().trim();

        if ((inputEmail === 'elybusness83@gmail.com' || inputEmail === configuredEmail) && password === storedPass) {
            return res.json({ success: true, message: 'Connexion Administrateur réussie !' });
        } else {
            return res.status(401).json({ error: 'Adresse e-mail ou mot de passe Administrateur incorrect.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modification du mot de passe Admin dans Firebase Firestore
app.post('/api/admin/change-password', async (req, res) => {
    const { newPassword } = req.body;
    try {
        if (!newPassword || newPassword.trim().length < 6) {
            return res.status(400).json({ error: 'Le mot de passe Administrateur doit contenir au moins 6 caractères.' });
        }
        await db.collection('settings').doc('adminPassword').set({ value: newPassword.trim() });
        res.json({ success: true, message: 'Mot de passe Administrateur mis à jour dans Firebase avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTES PRODUITS (PRODUCTS)
// ============================================================

// Lire tous les produits
app.get('/api/products', async (req, res) => {
    try {
        const snap = await db.collection('products').get();
        res.json(snap.docs.map(docToObj));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lire un produit par ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Produit non trouvé' });
        res.json(docToObj(doc));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter un produit
app.post('/api/products', async (req, res) => {
    const { id, name, category, price, stock, description, image } = req.body;
    try {
        const data = { id, name, category, price: parseFloat(price), stock: parseInt(stock) || 15, description, image: image || '' };
        await db.collection('products').doc(id).set(data);
        res.status(201).json({ message: 'Produit ajouté avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier un produit
app.put('/api/products/:id', async (req, res) => {
    const { name, category, price, stock, description, image } = req.body;
    try {
        await db.collection('products').doc(req.params.id).update({
            name, category,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            image: image || ''
        });
        res.json({ message: 'Produit modifié avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.collection('products').doc(req.params.id).delete();
        res.json({ message: 'Produit supprimé avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTES UTILISATEURS (USERS / AUTH)
// ============================================================

// Lire tous les utilisateurs (Admin)
app.get('/api/users', async (req, res) => {
    try {
        const snap = await db.collection('users').get();
        const users = snap.docs.map(doc => {
            const d = doc.data();
            return { name: d.name, email: d.email, password: d.password, created_at: d.created_at || null };
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inscription
app.post('/api/users/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Le nom, l\'adresse e-mail et le mot de passe sont obligatoires.' });
        }
        const userEmail = email.trim().toLowerCase();
        const docRef = db.collection('users').doc(userEmail);
        const existing = await docRef.get();
        if (existing.exists) {
            return res.status(400).json({ error: 'Cette adresse e-mail est déjà enregistrée.' });
        }
        const created_at = new Date().toISOString();
        const userData = { name: name.trim(), email: userEmail, password, created_at };
        await docRef.set(userData);
        res.status(201).json({ message: 'Inscription réussie !', user: { name: userData.name, email: userData.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connexion
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const doc = await db.collection('users').doc(email).get();
        if (!doc.exists || doc.data().password !== password) {
            return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
        }
        const user = doc.data();
        res.json({ message: 'Connexion réussie !', user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mettre à jour le profil
app.put('/api/users/profile', async (req, res) => {
    const { email, name, password } = req.body;
    try {
        const updateData = { name };
        if (password && password.trim() !== '') {
            updateData.password = password;
        }
        await db.collection('users').doc(email).update(updateData);
        res.json({ message: 'Profil mis à jour !', user: { name, email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Réinitialisation du mot de passe
app.post('/api/users/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const docRef = db.collection('users').doc(email);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Aucun compte associé à cette adresse e-mail.' });
        }
        await docRef.update({ password: newPassword });
        res.json({ message: 'Votre mot de passe a été réinitialisé avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un utilisateur (Admin)
app.delete('/api/users/:email', async (req, res) => {
    try {
        await db.collection('users').doc(req.params.email).delete();
        res.json({ message: 'Utilisateur supprimé.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTES COMMANDES (ORDERS)
// ============================================================

// Créer une commande (avec transaction Firestore pour le stock)
app.post('/api/orders', async (req, res) => {
    const { id, userEmail, userName, date, total, items } = req.body;
    try {
        await db.runTransaction(async (transaction) => {
            // 1. Vérifier et pré-lire les documents produits
            const productRefs = items.map(item => db.collection('products').doc(item.productId));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

            // 2. Créer le document de commande
            const orderRef = db.collection('orders').doc(id);
            transaction.set(orderRef, {
                id,
                user_email: userEmail,
                user_name: userName,
                order_date: date,
                total: parseFloat(total),
                status: 'En attente',
                items: items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: parseInt(item.quantity)
                }))
            });

            // 3. Décrémenter le stock de chaque produit
            productDocs.forEach((prodDoc, index) => {
                if (prodDoc.exists) {
                    const currentStock = prodDoc.data().stock || 0;
                    const newStock = Math.max(0, currentStock - items[index].quantity);
                    transaction.update(productRefs[index], { stock: newStock });
                }
            });
        });

        res.status(201).json({ message: 'Commande créée avec succès !', orderId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer toutes les commandes (Admin)
app.get('/api/orders', async (req, res) => {
    try {
        const snap = await db.collection('orders').orderBy('order_date', 'desc').get();
        res.json(snap.docs.map(docToObj));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer les commandes d'un client par email
app.get('/api/orders/user/:email', async (req, res) => {
    try {
        const snap = await db.collection('orders')
            .where('user_email', '==', req.params.email)
            .orderBy('order_date', 'desc')
            .get();
        res.json(snap.docs.map(docToObj));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier le statut d'une commande (Admin)
app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.collection('orders').doc(req.params.id).update({ status });
        res.json({ message: 'Statut de la commande mis à jour !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer une commande (Admin)
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await db.collection('orders').doc(req.params.id).delete();
        res.json({ message: 'Commande supprimée avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTE STATISTIQUES (STATS ADMIN)
// ============================================================
app.get('/api/stats', async (req, res) => {
    try {
        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
            db.collection('orders').get(),
            db.collection('products').get(),
            db.collection('users').get()
        ]);

        const orders = ordersSnap.docs.map(d => d.data());
        const products = productsSnap.docs.map(d => d.data());

        // Chiffre d'affaires (commandes non annulées)
        const totalRevenue = orders
            .filter(o => o.status !== 'Annulée')
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalClients = usersSnap.size;

        // Produits à faible stock (<= 5)
        const lowStockProducts = products.filter(p => (parseInt(p.stock) || 0) <= 5);

        res.json({ totalRevenue, totalOrders, totalProducts, totalClients, lowStockProducts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTE IMPORTATION / RESTAURATION BDD
// ============================================================
app.post('/api/db/import', async (req, res) => {
    const { products, settings, users, orders, testimonials } = req.body;
    try {
        // Vider toutes les collections existantes puis ré-importer
        const deleteCollection = async (collectionName) => {
            const snap = await db.collection(collectionName).get();
            const batch = db.batch();
            snap.docs.forEach(doc => batch.delete(doc.ref));
            if (snap.size > 0) await batch.commit();
        };

        await Promise.all([
            deleteCollection('settings'),
            deleteCollection('products'),
            deleteCollection('users'),
            deleteCollection('orders'),
            deleteCollection('testimonials')
        ]);

        // Ré-insérer par batch
        const batchWrite = async (collectionName, items, transform) => {
            if (!items || !items.length) return;
            const batch = db.batch();
            items.forEach(item => {
                const { id, docId, ...data } = transform(item);
                batch.set(db.collection(collectionName).doc(docId || id), data);
            });
            await batch.commit();
        };

        if (settings) {
            const batch = db.batch();
            for (const [key, val] of Object.entries(settings)) {
                batch.set(db.collection('settings').doc(key), { value: val });
            }
            await batch.commit();
        }

        if (products && products.length > 0) {
            const batch = db.batch();
            products.forEach(p => batch.set(db.collection('products').doc(p.id), p));
            await batch.commit();
        }

        if (users && users.length > 0) {
            const batch = db.batch();
            users.forEach(u => batch.set(db.collection('users').doc(u.email), u));
            await batch.commit();
        }

        if (testimonials && Array.isArray(testimonials) && testimonials.length > 0) {
            const batch = db.batch();
            testimonials.forEach(t => {
                const id = t.id || 'testi-' + Date.now() + Math.random();
                batch.set(db.collection('testimonials').doc(id), {
                    ...t,
                    id,
                    stars: parseFloat(t.stars) || 5.0,
                    role: t.role || 'Client satisfait',
                    created_at: t.created_at || new Date().toISOString()
                });
            });
            await batch.commit();
        }

        if (orders && orders.length > 0) {
            const batch = db.batch();
            orders.forEach(o => {
                const orderId = o.id;
                batch.set(db.collection('orders').doc(orderId), {
                    id: orderId,
                    user_email: o.user_email || o.userEmail,
                    user_name: o.user_name || o.userName,
                    order_date: o.order_date || o.date,
                    total: parseFloat(o.total),
                    status: o.status || 'En attente',
                    items: o.items || []
                });
            });
            await batch.commit();
        }

        res.json({ message: 'Base de données Firebase importée et écrasée avec succès !' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================================
// ROUTES GENÉRIQUES (POUR COMPATIBILITÉ AVEC FIREBASE-CONFIG.JS)
// ============================================================

app.post('/api/generic/query/:collection', async (req, res) => {
    try {
        const { field, op, value, sortField, sortDir } = req.body;
        let q = db.collection(req.params.collection).where(field, op, value);
        if (sortField) {
            q = q.orderBy(sortField, sortDir || 'asc');
        }
        const snap = await q.get();
        res.json(snap.docs.map(docToObj));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/generic/get-all/:collection', async (req, res) => {
    try {
        const snap = await db.collection(req.params.collection).get();
        res.json(snap.docs.map(docToObj));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/generic/get-one/:collection/:id', async (req, res) => {
    try {
        const doc = await db.collection(req.params.collection).doc(req.params.id).get();
        if (!doc.exists) return res.json(null);
        res.json(docToObj(doc));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/generic/set/:collection/:id', async (req, res) => {
    try {
        await db.collection(req.params.collection).doc(req.params.id).set(req.body);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/generic/update/:collection/:id', async (req, res) => {
    try {
        await db.collection(req.params.collection).doc(req.params.id).update(req.body);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/generic/delete/:collection/:id', async (req, res) => {
    try {
        await db.collection(req.params.collection).doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/generic/clear/:collection', async (req, res) => {
    try {
        const snap = await db.collection(req.params.collection).get();
        if (!snap.empty) {
            const batch = db.batch();
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ============================================================
// LANCEMENT DU SERVEUR
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Serveur API ElyBusiness (Firebase) démarré sur : http://localhost:${PORT}`);
});
