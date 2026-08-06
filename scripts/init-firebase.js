/**
 * init-firebase.js
 * ─────────────────────────────────────────────────────────────
 * Script d'initialisation unique : injecte toutes les données
 * par défaut (produits, paramètres, témoignages) dans Firestore.
 *
 * USAGE (une seule fois) :
 *   node init-firebase.js
 * ─────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
// Charger les credentials Firebase
let serviceAccount;
try {
    serviceAccount = require('../serviceAccountKey.json');
    initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
    if (process.env.FIREBASE_PROJECT_ID) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    } else {
        console.error('❌ Aucun fichier serviceAccountKey.json trouvé et aucune variable FIREBASE_* définie.');
        process.exit(1);
    }
}

const db = getFirestore();

// ─── DONNÉES PAR DÉFAUT ────────────────────────────────────────

const SETTINGS = {
    welcomeTitle: 'Bienvenue sur le site ElyBusiness',
    welcomeDesc: "Votre partenaire de confiance pour tous vos besoins de recharges (crédits, méga, minutes), d'accessoires de mode, d'appareils électroniques, de vêtements et bien plus encore.",
    whatsappNumber: '+243981470106',
    emailAddress: 'elyseebaraka83@gmail.com',
    physicalAddress: 'Goma, DRC',
    facebookLink: 'https://facebook.com/elyseebaraka',
    instagramLink: 'https://instagram.com/elyseebaraka',
    ceoName: 'Elysée BARAKA',
    ceoBio: "Chez ElyBusiness, notre priorité absolue est la satisfaction du client.",
    ceoPhoto: 'assets/extracted_img_1.jpg',
    aboutImg: 'assets/extracted_img_3.jpg',
    logoImg: 'assets/logo.svg'
};

const TESTIMONIALS = [
    { id: 'testi-1', name: 'Patrick M.', role: 'Client depuis 2025', stars: 5.0, text: "Service incroyable ! J'ai reçu ma recharge en moins de 5 minutes.", created_at: new Date().toISOString() },
    { id: 'testi-2', name: 'Gracia K.', role: 'Cliente satisfaite', stars: 5.0, text: "La casquette que j'ai commandée est de très belle qualité.", created_at: new Date().toISOString() },
    { id: 'testi-3', name: 'David N.', role: 'Client régulier', stars: 4.5, text: "J'ai acheté un smartphone via ElyBusiness, livraison rapide et prix compétitif.", created_at: new Date().toISOString() }
];

const PRODUCTS = [
    { id: 'prod-1', name: 'Recharge Crédit Unités', category: 'crédits', price: 1.00, stock: 50, description: "Recharge de crédit d'appel immédiate toutes directions.", image: 'assets/extracted_img_0.jpg' },
    { id: 'prod-2', name: 'Forfait Internet Méga', category: 'crédits', price: 0.50, stock: 100, description: 'Forfait internet ultra-rapide.', image: 'assets/extracted_img_0.jpg' },
    { id: 'prod-3', name: "Forfait Minutes d'Appel", category: 'crédits', price: 2.00, stock: 40, description: "Minutes d'appel longue durée.", image: 'assets/extracted_img_0.jpg' },
    { id: 'prod-4', name: 'Casquette Premium ElyBusiness', category: 'accessoires', price: 5.00, stock: 15, description: 'Casquette stylée avec logo EB brodé.', image: 'assets/extracted_img_2.jpg' },
    { id: 'prod-5', name: 'Pochette de Protection Smartphone', category: 'accessoires', price: 3.00, stock: 25, description: 'Pochette antichoc élégante.', image: 'assets/extracted_img_2.jpg' },
    { id: 'prod-6', name: 'Radio Portable Transistor', category: 'accessoires', price: 12.00, stock: 8, description: 'Radio portable haute sensibilité.', image: 'assets/extracted_img_2.jpg' },
    { id: 'prod-7', name: 'Ordinateur Portable Pro', category: 'électronique', price: 250.00, stock: 3, description: 'Core i5, 8 Go RAM, 256 Go SSD.', image: 'assets/extracted_img_3.jpg' },
    { id: 'prod-8', name: 'Smartphone NextGen', category: 'électronique', price: 85.00, stock: 6, description: 'Grand écran 6.5 pouces, 5000mAh.', image: 'assets/extracted_img_3.jpg' },
    { id: 'prod-9', name: 'T-shirt Branding EB', category: 'habits', price: 7.50, stock: 20, description: 'T-shirt 100% coton, logo EB.', image: 'assets/extracted_img_0.jpg' },
    { id: 'prod-10', name: 'Blazer Cérémonie Rouge', category: 'habits', price: 35.00, stock: 4, description: 'Veste blazer de coupe slim moderne.', image: 'assets/extracted_img_1.jpg' }
];

// ─── SCRIPT PRINCIPAL ──────────────────────────────────────────

async function initAll() {
    console.log('🔥 Initialisation des données dans Firestore...\n');

    // Settings
    const settingsBatch = db.batch();
    for (const [key, val] of Object.entries(SETTINGS)) {
        settingsBatch.set(db.collection('settings').doc(key), { value: val });
    }
    await settingsBatch.commit();
    console.log(`✅ ${Object.keys(SETTINGS).length} paramètres insérés.`);

    // Testimonials
    const testiBatch = db.batch();
    TESTIMONIALS.forEach(t => testiBatch.set(db.collection('testimonials').doc(t.id), t));
    await testiBatch.commit();
    console.log(`✅ ${TESTIMONIALS.length} témoignages insérés.`);

    // Products
    const productBatch = db.batch();
    PRODUCTS.forEach(p => productBatch.set(db.collection('products').doc(p.id), p));
    await productBatch.commit();
    console.log(`✅ ${PRODUCTS.length} produits insérés.`);

    console.log('\n🎉 Initialisation complète ! Votre base Firestore est prête.');
    process.exit(0);
}

initAll().catch(err => {
    console.error('❌ Erreur lors de l\'initialisation :', err);
    process.exit(1);
});
