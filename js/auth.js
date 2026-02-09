// Firebase Authentication & Firestore
class AuthManager {
    constructor(firebaseConfig) {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.user = null;
        this.onAuthChange = null;
        
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            this.user = user;
            if (this.onAuthChange) {
                this.onAuthChange(user);
            }
        });
    }

    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await this.auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    isLoggedIn() {
        return !!this.user;
    }

    getUserId() {
        return this.user?.uid;
    }

    getUserEmail() {
        return this.user?.email;
    }

    getUserName() {
        return this.user?.displayName;
    }

    getUserPhoto() {
        return this.user?.photoURL;
    }

    // Firestore operations
    async saveData(collection, data) {
        if (!this.user) throw new Error('Not authenticated');
        
        const docRef = this.db.collection('users').doc(this.user.uid).collection(collection).doc('data');
        await docRef.set(data, { merge: true });
    }

    async loadData(collection) {
        if (!this.user) throw new Error('Not authenticated');
        
        const docRef = this.db.collection('users').doc(this.user.uid).collection(collection).doc('data');
        const doc = await docRef.get();
        
        if (doc.exists) {
            return doc.data();
        }
        return null;
    }

    async saveTransactions(transactions) {
        await this.saveData('spending', { transactions });
    }

    async loadTransactions() {
        const data = await this.loadData('spending');
        return data?.transactions || [];
    }

    async saveVaults(vaults) {
        await this.saveData('spending', { vaults });
    }

    async loadVaults() {
        const data = await this.loadData('spending');
        return data?.vaults || null;
    }

    async saveRules(rules) {
        await this.saveData('spending', { rules });
    }

    async loadRules() {
        const data = await this.loadData('spending');
        return data?.rules || [];
    }

    async saveAll(transactions, vaults, rules) {
        await this.saveData('spending', { transactions, vaults, rules, lastUpdated: new Date().toISOString() });
    }

    async loadAll() {
        return await this.loadData('spending');
    }
}

window.AuthManager = AuthManager;
