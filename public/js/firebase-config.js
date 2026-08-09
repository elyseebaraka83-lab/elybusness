// ============================================================
// API BACKEND CONFIGURATION — ElyBusiness
// ============================================================
// Ce fichier remplace l'ancien SDK Firebase côté client.
// Il redirige toutes les opérations de base de données vers 
// votre propre API Node.js sécurisée.
// ============================================================

// Détection intelligente de l'URL du serveur API.
// Si vous utilisez Live Server (port 5500 ou autre), ça redirigera vers le serveur Node (port 3000).
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000' 
    ? 'http://localhost:3000' 
    : '';

/** Récupère tous les documents d'une collection en tableau d'objets */
async function fbGetAll(collectionName) {
    const res = await fetch(`${API_BASE}/api/generic/get-all/${collectionName}`);
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
    return await res.json();
}

/** Récupère un document unique par ID */
async function fbGetOne(collectionName, id) {
    const res = await fetch(`${API_BASE}/api/generic/get-one/${collectionName}/${id}`);
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
    return await res.json();
}

/** Crée ou écrase un document */
async function fbSet(collectionName, id, data) {
    const res = await fetch(`${API_BASE}/api/generic/set/${collectionName}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
}

/** Met à jour (merge partiel) un document existant */
async function fbUpdate(collectionName, id, data) {
    const res = await fetch(`${API_BASE}/api/generic/update/${collectionName}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
}

/** Supprime un document */
async function fbDelete(collectionName, id) {
    const res = await fetch(`${API_BASE}/api/generic/delete/${collectionName}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
}

/** Requête filtée: where(field == value) + tri optionnel */
async function fbQuery(collectionName, field, op, value, sortField = null, sortDir = 'asc') {
    const res = await fetch(`${API_BASE}/api/generic/query/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, op, value, sortField, sortDir })
    });
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
    return await res.json();
}

/** Récupère les settings comme objet clé→valeur */
async function fbGetSettings() {
    const res = await fetch(`${API_BASE}/api/settings`); // Utilise la route spécifique existante
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
    return await res.json();
}

/** Sauvegarde les settings depuis un objet clé→valeur */
async function fbSaveSettings(settingsObj) {
    const res = await fetch(`${API_BASE}/api/settings`, { // Utilise la route spécifique existante
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsObj)
    });
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
}

/** Vide une collection entière */
async function fbClearCollection(collectionName) {
    const res = await fetch(`${API_BASE}/api/generic/clear/${collectionName}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Erreur Firebase lors de la connexion : ${await res.text()}`);
}

/** Auth Firebase: Inscription d'un utilisateur */
async function fbRegister(name, email, password) {
    const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');
    return data;
}

/** Auth Firebase: Connexion d'un utilisateur */
async function fbLogin(email, password) {
    const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion');
    return data;
}

/** Auth Firebase: Réinitialisation du mot de passe */
async function fbResetPassword(email, newPassword) {
    const res = await fetch(`${API_BASE}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la réinitialisation');
    return data;
}

/** Auth Firebase: Modification du profil utilisateur */
async function fbUpdateProfile(email, name, password) {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');
    return data;
}

/** Auth Firebase: Connexion Administrateur */
async function fbAdminLogin(email, password) {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion Administrateur');
    return data;
}

/** Auth Firebase: Modification du mot de passe Administrateur */
async function fbChangeAdminPassword(newPassword) {
    const res = await fetch(`${API_BASE}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de mot de passe Administrateur');
    return data;
}

// Compatibilité avec les anciens imports vides si jamais ils étaient utilisés
const db = null, firebaseApp = null, collection = null, doc = null, getDocs = null, getDoc = null, setDoc = null, updateDoc = null, deleteDoc = null, query = null, where = null, orderBy = null, runTransaction = null, writeBatch = null;

export {
    db, firebaseApp,
    collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, runTransaction, writeBatch,
    fbGetAll, fbGetOne, fbSet, fbUpdate, fbDelete,
    fbQuery, fbGetSettings, fbSaveSettings, fbClearCollection,
    fbRegister, fbLogin, fbResetPassword, fbUpdateProfile,
    fbAdminLogin, fbChangeAdminPassword
};
