// Spending Tracker - Main App with Auth, Charts, Rules, Search & Mobile Support
class SpendingTracker {
    constructor() {
        this.transactions = [];
        this.vaults = [];
        this.rules = [];
        this.parser = new StatementParser();
        this.draggedElement = null;
        this.draggedTx = null;
        this.charts = {};
        this.filters = {
            search: '',
            source: 'all',
            status: 'all'
        };
        this.selectedMonth = null; // null = current month, 'all' = all months
        this.auth = null;
        this.saveTimeout = null;
        this.averageLinesVisible = true; // Default: show average lines
        
        this.initAuth();
    }

    initAuth() {
        // Check if Firebase config is set
        if (typeof firebaseConfig === 'undefined' || firebaseConfig.apiKey === 'YOUR_API_KEY') {
            // No Firebase config - use localStorage mode
            console.log('Running in local mode (no Firebase config)');
            this.loadFromLocalStorage();
            this.showApp();
            this.initEventListeners();
            this.render();
            return;
        }

        // Initialize Firebase Auth
        this.auth = new AuthManager(firebaseConfig);
        
        // Handle auth state changes
        this.auth.onAuthChange = async (user) => {
            if (user) {
                this.showLoading();
                await this.loadFromFirebase();
                this.hideLoading();
                this.showApp();
                this.updateUserUI();
                this.initEventListeners();
                this.render();
            } else {
                this.showLogin();
            }
        };

        // Google sign in button
        document.getElementById('googleSignIn').addEventListener('click', async () => {
            try {
                await this.auth.signInWithGoogle();
            } catch (error) {
                alert('Sign in failed: ' + error.message);
            }
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await this.auth.signOut();
        });
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    updateUserUI() {
        if (!this.auth) return;
        
        document.getElementById('userAvatar').src = this.auth.getUserPhoto() || '';
        document.getElementById('userName').textContent = this.auth.getUserName() || this.auth.getUserEmail();
    }

    async loadFromFirebase() {
        try {
            const data = await this.auth.loadAll();
            if (data) {
                this.transactions = data.transactions || [];
                this.vaults = data.vaults || this.getDefaultVaults();
                this.rules = data.rules || [];
            } else {
                this.vaults = this.getDefaultVaults();
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            this.vaults = this.getDefaultVaults();
        }
    }

    loadFromLocalStorage() {
        const savedVaults = localStorage.getItem('spending_vaults');
        const savedTx = localStorage.getItem('spending_transactions');
        const savedRules = localStorage.getItem('spending_rules');
        
        this.vaults = savedVaults ? JSON.parse(savedVaults) : this.getDefaultVaults();
        this.transactions = savedTx ? JSON.parse(savedTx) : [];
        this.rules = savedRules ? JSON.parse(savedRules) : [];
    }

    getDefaultVaults() {
        return [
            // 🏠 Housing & Home (5 categories)
            { id: 'rent', name: 'Rent/Mortgage', emoji: '🏠', budget: 1500 },
            { id: 'utilities', name: 'Utilities', emoji: '⚡', budget: 150 },
            { id: 'internet_phone', name: 'Internet & Phone', emoji: '📶', budget: 100 },
            { id: 'home_maintenance', name: 'Home Maintenance', emoji: '🔧', budget: 100 },
            { id: 'council_rates', name: 'Council Rates', emoji: '🏛️', budget: 100 },
            
            // 🛒 Groceries & Food (6 categories)
            { id: 'groceries', name: 'Groceries', emoji: '🛒', budget: 400 },
            { id: 'dining_out', name: 'Dining Out', emoji: '🍽️', budget: 200 },
            { id: 'coffee', name: 'Coffee & Cafes', emoji: '☕', budget: 80 },
            { id: 'takeaway', name: 'Takeaway & Delivery', emoji: '🍕', budget: 150 },
            { id: 'alcohol', name: 'Alcohol & Drinks', emoji: '🍷', budget: 100 },
            { id: 'snacks', name: 'Snacks & Treats', emoji: '🍫', budget: 50 },
            
            // 🚗 Transport (5 categories)
            { id: 'fuel', name: 'Fuel', emoji: '⛽', budget: 200 },
            { id: 'car_rego', name: 'Car Rego', emoji: '🚗', budget: 50 },
            { id: 'car_maintenance', name: 'Car Maintenance', emoji: '🔧', budget: 100 },
            { id: 'public_transport', name: 'Public Transport', emoji: '🚇', budget: 80 },
            { id: 'rideshare', name: 'Rideshare & Taxis', emoji: '🚕', budget: 60 },
            
            // 🛍️ Shopping (7 categories)
            { id: 'clothing', name: 'Clothing', emoji: '👕', budget: 150 },
            { id: 'electronics', name: 'Electronics', emoji: '💻', budget: 100 },
            { id: 'home_goods', name: 'Home Goods', emoji: '🏺', budget: 80 },
            { id: 'gifts', name: 'Gifts', emoji: '🎁', budget: 100 },
            { id: 'books', name: 'Books', emoji: '📚', budget: 40 },
            { id: 'hobbies', name: 'Hobbies', emoji: '🎨', budget: 80 },
            { id: 'beauty', name: 'Beauty & Personal Care', emoji: '💄', budget: 60 },
            
            // 💊 Health & Fitness (5 categories)
            { id: 'medical', name: 'Medical', emoji: '🏥', budget: 80 },
            { id: 'pharmacy', name: 'Pharmacy', emoji: '💊', budget: 50 },
            { id: 'gym', name: 'Gym & Fitness', emoji: '💪', budget: 80 },
            { id: 'medicare', name: 'Medicare', emoji: '🏥', budget: 50 },
            { id: 'dental', name: 'Dental', emoji: '🦷', budget: 50 },
            
            // 🎉 Entertainment (6 categories)
            { id: 'entertainment', name: 'Entertainment', emoji: '🎉', budget: 150 },
            { id: 'streaming', name: 'Streaming', emoji: '📺', budget: 50 },
            { id: 'music', name: 'Music', emoji: '🎵', budget: 30 },
            { id: 'movies', name: 'Movies & Cinema', emoji: '🎬', budget: 50 },
            { id: 'events', name: 'Events & Concerts', emoji: '🎫', budget: 100 },
            { id: 'gaming', name: 'Gaming', emoji: '🎮', budget: 60 },
            
            // 📱 Subscriptions & Services (5 categories)
            { id: 'subscriptions', name: 'Subscriptions', emoji: '📱', budget: 100 },
            { id: 'software', name: 'Software & Apps', emoji: '💾', budget: 50 },
            { id: 'cloud_storage', name: 'Cloud Storage', emoji: '☁️', budget: 20 },
            { id: 'memberships', name: 'Memberships', emoji: '🎫', budget: 50 },
            { id: 'professional_services', name: 'Professional Services', emoji: '👔', budget: 100 },
            
            // 🛡️ Insurance (4 categories)
            { id: 'health_insurance', name: 'Health Insurance', emoji: '🛡️', budget: 200 },
            { id: 'car_insurance', name: 'Car Insurance', emoji: '🚗', budget: 100 },
            { id: 'home_insurance', name: 'Home Insurance', emoji: '🏠', budget: 80 },
            { id: 'life_insurance', name: 'Life Insurance', emoji: '❤️', budget: 80 },
            
            // 📈 Investment & Savings (5 categories)
            { id: 'savings', name: 'Savings', emoji: '🏦', budget: 500 },
            { id: 'investments', name: 'Investments', emoji: '📈', budget: 400 },
            { id: 'crypto', name: 'Crypto', emoji: '₿', budget: 200 },
            { id: 'stocks_etf', name: 'Stocks & ETF', emoji: '📊', budget: 300 },
            { id: 'super', name: 'Superannuation', emoji: '💰', budget: 200 },
            
            // ✈️ Travel (4 categories)
            { id: 'flights', name: 'Flights', emoji: '✈️', budget: 300 },
            { id: 'accommodation', name: 'Accommodation', emoji: '🏨', budget: 200 },
            { id: 'travel_other', name: 'Travel Other', emoji: '🧳', budget: 150 },
            { id: 'activities', name: 'Activities & Tours', emoji: '🎯', budget: 100 },
            
            // 🎓 Education (3 categories)
            { id: 'education', name: 'Education', emoji: '🎓', budget: 150 },
            { id: 'courses', name: 'Courses & Training', emoji: '📖', budget: 100 },
            { id: 'books_learning', name: 'Books & Learning', emoji: '📚', budget: 50 },
            
            // 🐾 Pets (3 categories)
            { id: 'pet_food', name: 'Pet Food', emoji: '🐾', budget: 80 },
            { id: 'vet', name: 'Vet', emoji: '🏥', budget: 50 },
            { id: 'pet_supplies', name: 'Pet Supplies', emoji: '🐕', budget: 40 },
            
            // 💼 Business (3 categories)
            { id: 'business_expenses', name: 'Business Expenses', emoji: '💼', budget: 200 },
            { id: 'tax', name: 'Tax', emoji: '🧾', budget: 150 },
            { id: 'accounting', name: 'Accounting', emoji: '📊', budget: 100 },
            
            // 🎯 Other (3 categories)
            { id: 'charity', name: 'Charity & Donations', emoji: '🙏', budget: 50 },
            { id: 'fees', name: 'Fees & Charges', emoji: '💳', budget: 50 },
            { id: 'other', name: 'Other', emoji: '📦', budget: 100 },
        ];
    }

    saveToStorage() {
        // Debounce saves to avoid too many writes
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        
        this.saveTimeout = setTimeout(async () => {
            if (this.auth && this.auth.isLoggedIn()) {
                try {
                    await this.auth.saveAll(this.transactions, this.vaults, this.rules);
                    console.log('Saved to cloud');
                } catch (error) {
                    console.error('Error saving to Firebase:', error);
                    // Fallback to localStorage
                    this.saveToLocalStorage();
                }
            } else {
                this.saveToLocalStorage();
            }
        }, 1000);
    }

    saveToLocalStorage() {
        localStorage.setItem('spending_vaults', JSON.stringify(this.vaults));
        localStorage.setItem('spending_transactions', JSON.stringify(this.transactions));
        localStorage.setItem('spending_rules', JSON.stringify(this.rules));
    }

    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // File upload
        document.getElementById('pdfUpload').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Expand/collapse uncategorized
        document.getElementById('expandBtn').addEventListener('click', () => this.toggleExpand());
        
        // Context menu
        this.initContextMenu();
        
        // Transaction detail modal
        this.initTxDetailModal();
        
        // Add transaction modal
        this.initAddTxModal();
        
        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        document.getElementById('filterSource').addEventListener('change', (e) => {
            this.filters.source = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterStatus').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
        
        // Vault modal
        document.getElementById('addVaultBtn').addEventListener('click', () => this.showVaultModal());
        document.getElementById('cancelVault').addEventListener('click', () => this.hideVaultModal());
        document.getElementById('saveVault').addEventListener('click', () => this.createVault());
        document.getElementById('vaultModal').addEventListener('click', (e) => {
            if (e.target.id === 'vaultModal') this.hideVaultModal();
        });
        
        // Rule modal
        document.getElementById('addRuleBtn').addEventListener('click', () => this.showRuleModal());
        document.getElementById('cancelRule').addEventListener('click', () => this.hideRuleModal());
        document.getElementById('saveRule').addEventListener('click', () => this.createRule());
        document.getElementById('ruleModal').addEventListener('click', (e) => {
            if (e.target.id === 'ruleModal') this.hideRuleModal();
        });
        
        // Rule actions
        document.getElementById('applyRulesBtn').addEventListener('click', () => this.applyAllRules());
        document.getElementById('learnRulesBtn').addEventListener('click', () => this.learnFromCategorized());
        
        // Export and clear
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Chart year selector
        document.getElementById('chartYear').addEventListener('change', () => this.updateCharts());
        
        // Category trend chart controls
        document.getElementById('selectAllCategories').addEventListener('click', () => this.toggleAllCategories(true));
        document.getElementById('unselectAllCategories').addEventListener('click', () => this.toggleAllCategories(false));
        document.getElementById('toggleAverageLines').addEventListener('click', () => {
            // Toggle between showing and hiding average lines
            if (!this.averageLinesVisible) {
                this.toggleAverageLines(true);
                this.averageLinesVisible = true;
            } else {
                this.toggleAverageLines(false);
                this.averageLinesVisible = false;
            }
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideVaultModal();
                this.hideRuleModal();
            }
        });
        
        // Touch support for mobile drag
        this.initTouchDrag();
    }

    toggleExpand() {
        const section = document.getElementById('uncategorizedSection');
        const btn = document.getElementById('expandBtn');
        section.classList.toggle('expanded');
        btn.textContent = section.classList.contains('expanded') ? '⬆️ Collapse' : '⬇️ Expand';
    }

    initContextMenu() {
        const menu = document.getElementById('contextMenu');
        this.contextTx = null;
        
        // Right-click on bubbles
        document.addEventListener('contextmenu', (e) => {
            const bubble = e.target.closest('.bubble');
            if (bubble) {
                e.preventDefault();
                const txId = bubble.dataset.txId;
                this.contextTx = this.transactions.find(t => t.id === txId);
                
                // Update menu option based on transaction type
                const moveItem = document.getElementById('ctxMove');
                if (this.contextTx.vault === 'income') {
                    moveItem.textContent = '📥 Move to Uncategorized';
                } else if (this.contextTx.type === 'credit') {
                    moveItem.textContent = '💰 Move to Income';
                } else {
                    moveItem.style.display = 'none';
                }
                
                menu.style.left = e.pageX + 'px';
                menu.style.top = e.pageY + 'px';
                menu.classList.add('active');
            }
        });
        
        // Long-press for mobile
        let pressTimer;
        document.addEventListener('touchstart', (e) => {
            const bubble = e.target.closest('.bubble');
            if (bubble) {
                pressTimer = setTimeout(() => {
                    const txId = bubble.dataset.txId;
                    this.contextTx = this.transactions.find(t => t.id === txId);
                    
                    const moveItem = document.getElementById('ctxMove');
                    if (this.contextTx.vault === 'income') {
                        moveItem.textContent = '📥 Move to Uncategorized';
                        moveItem.style.display = 'block';
                    } else if (this.contextTx.type === 'credit') {
                        moveItem.textContent = '💰 Move to Income';
                        moveItem.style.display = 'block';
                    } else {
                        moveItem.style.display = 'none';
                    }
                    
                    const touch = e.touches[0];
                    menu.style.left = touch.pageX + 'px';
                    menu.style.top = touch.pageY + 'px';
                    menu.classList.add('active');
                }, 500);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => clearTimeout(pressTimer));
        document.addEventListener('touchmove', () => clearTimeout(pressTimer));
        
        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
        
        // Menu actions
        document.getElementById('ctxEdit').addEventListener('click', () => {
            this.editTransaction();
            menu.classList.remove('active');
        });
        
        document.getElementById('ctxMove').addEventListener('click', () => {
            this.moveToIncome();
            menu.classList.remove('active');
        });
        
        document.getElementById('ctxDelete').addEventListener('click', () => {
            this.deleteTransaction();
            menu.classList.remove('active');
        });
    }

    editTransaction() {
        if (!this.contextTx) return;
        const newName = prompt('Edit transaction name:', this.contextTx.description);
        if (newName !== null && newName.trim()) {
            // Preserve original description
            if (!this.contextTx.originalDesc) {
                this.contextTx.originalDesc = this.contextTx.description;
            }
            this.contextTx.description = newName.trim();
            this.saveToStorage();
            this.render();
        }
    }

    initTxDetailModal() {
        const modal = document.getElementById('txDetailModal');
        
        document.getElementById('closeTxDetail').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        document.getElementById('saveTxDetail').addEventListener('click', () => {
            this.saveTxNotes();
        });
        
        document.getElementById('deleteTxDetail').addEventListener('click', () => {
            this.deleteFromDetail();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
        
        // Double-click on bubbles
        document.addEventListener('dblclick', (e) => {
            const bubble = e.target.closest('.bubble');
            if (bubble) {
                const txId = bubble.dataset.txId;
                const tx = this.transactions.find(t => t.id === txId);
                if (tx) {
                    this.showTxDetail(tx);
                }
            }
        });
    }

    deleteFromDetail() {
        if (!this.detailTx) return;
        if (confirm(`Delete "${this.detailTx.description}"?`)) {
            this.transactions = this.transactions.filter(t => t.id !== this.detailTx.id);
            this.saveToStorage();
            document.getElementById('txDetailModal').classList.remove('active');
            this.render();
        }
    }

    showTxDetail(tx) {
        this.detailTx = tx;
        
        // Format date with day of week
        const date = new Date(tx.date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedDate = `${dayNames[date.getDay()]}, ${date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        
        document.getElementById('txDetailDate').textContent = formattedDate;
        
        const amountEl = document.getElementById('txDetailAmount');
        amountEl.textContent = `${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}`;
        amountEl.className = `tx-detail-value ${tx.type}`;
        
        document.getElementById('txDetailType').textContent = tx.type === 'credit' ? '💰 Credit' : '💸 Debit';
        document.getElementById('txDetailSource').textContent = tx.source === 'bank' ? '🏦 Bank' : '💳 Amex';
        
        // Vault/category
        const vault = this.vaults.find(v => v.id === tx.vault);
        document.getElementById('txDetailVault').textContent = vault ? `${vault.emoji} ${vault.name}` : (tx.vault === 'income' ? '💰 Income' : '📥 Uncategorized');
        
        document.getElementById('txDetailDesc').textContent = tx.description;
        
        // Original description (if edited)
        const originalRow = document.getElementById('txOriginalRow');
        if (tx.originalDesc && tx.originalDesc !== tx.description) {
            document.getElementById('txDetailOriginal').textContent = tx.originalDesc;
            originalRow.style.display = 'flex';
        } else {
            originalRow.style.display = 'none';
        }
        
        // Notes
        document.getElementById('txDetailNotes').value = tx.notes || '';
        
        document.getElementById('txDetailModal').classList.add('active');
    }

    saveTxNotes() {
        if (!this.detailTx) return;
        
        const notes = document.getElementById('txDetailNotes').value.trim();
        this.detailTx.notes = notes || null;
        
        this.saveToStorage();
        document.getElementById('txDetailModal').classList.remove('active');
    }

    initAddTxModal() {
        const modal = document.getElementById('addTxModal');
        this.addTxTarget = null; // 'income' or 'uncategorized'
        
        // Add Income button
        document.getElementById('addIncomeBtn').addEventListener('click', () => {
            this.addTxTarget = 'income';
            document.getElementById('addTxTitle').textContent = '💰 Add Income';
            document.getElementById('addTxType').value = 'credit';
            this.showAddTxModal();
        });
        
        // Add Expense button
        document.getElementById('addExpenseBtn').addEventListener('click', () => {
            this.addTxTarget = 'uncategorized';
            document.getElementById('addTxTitle').textContent = '💸 Add Expense';
            document.getElementById('addTxType').value = 'debit';
            this.showAddTxModal();
        });
        
        // Cancel button
        document.getElementById('cancelAddTx').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        // Save button
        document.getElementById('saveAddTx').addEventListener('click', () => {
            this.saveNewTransaction();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    showAddTxModal() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('addTxDate').value = today;
        document.getElementById('addTxDesc').value = '';
        document.getElementById('addTxAmount').value = '';
        document.getElementById('addTxSource').value = 'manual';
        
        document.getElementById('addTxModal').classList.add('active');
        document.getElementById('addTxDesc').focus();
    }

    saveNewTransaction() {
        const desc = document.getElementById('addTxDesc').value.trim();
        const amount = parseFloat(document.getElementById('addTxAmount').value);
        const date = document.getElementById('addTxDate').value;
        const type = document.getElementById('addTxType').value;
        const source = document.getElementById('addTxSource').value;
        
        if (!desc) {
            alert('Please enter a description');
            return;
        }
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (!date) {
            alert('Please select a date');
            return;
        }
        
        const tx = {
            id: 'manual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            date: date,
            description: desc,
            amount: amount,
            type: type,
            source: source,
            vault: this.addTxTarget === 'income' ? 'income' : null
        };
        
        this.transactions.push(tx);
        this.saveToStorage();
        this.render();
        
        document.getElementById('addTxModal').classList.remove('active');
    }

    moveToIncome() {
        if (!this.contextTx) return;
        if (this.contextTx.vault === 'income') {
            this.contextTx.vault = null;
        } else {
            this.contextTx.vault = 'income';
        }
        this.saveToStorage();
        this.render();
    }

    deleteTransaction() {
        if (!this.contextTx) return;
        if (confirm(`Delete "${this.contextTx.description}"?`)) {
            this.transactions = this.transactions.filter(t => t.id !== this.contextTx.id);
            this.saveToStorage();
            this.render();
        }
    }

    initTouchDrag() {
        let touchStartX, touchStartY, touchedBubble, clone;
        
        document.addEventListener('touchstart', (e) => {
            const bubble = e.target.closest('.bubble');
            if (!bubble) return;
            
            touchedBubble = bubble;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            
            const txId = bubble.dataset.txId;
            this.draggedTx = this.transactions.find(t => t.id === txId);
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!touchedBubble || !this.draggedTx) return;
            
            const touch = e.touches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                e.preventDefault();
                
                if (!clone) {
                    clone = touchedBubble.cloneNode(true);
                    clone.style.position = 'fixed';
                    clone.style.zIndex = '9999';
                    clone.style.opacity = '0.8';
                    clone.style.pointerEvents = 'none';
                    document.body.appendChild(clone);
                    touchedBubble.style.opacity = '0.3';
                }
                
                const rect = touchedBubble.getBoundingClientRect();
                clone.style.left = (touch.clientX - rect.width / 2) + 'px';
                clone.style.top = (touch.clientY - rect.height / 2) + 'px';
                
                // Auto-scroll on touch near edges
                const edgeZone = 80;
                const viewportHeight = window.innerHeight;
                if (touch.clientY < edgeZone) {
                    window.scrollBy(0, -10);
                } else if (touch.clientY > viewportHeight - edgeZone) {
                    window.scrollBy(0, 10);
                }
                
                // Highlight drop zone
                document.querySelectorAll('.vault-bubbles, #uncategorized, #incomeContainer').forEach(zone => {
                    const zoneRect = zone.getBoundingClientRect();
                    if (touch.clientX >= zoneRect.left && touch.clientX <= zoneRect.right &&
                        touch.clientY >= zoneRect.top && touch.clientY <= zoneRect.bottom) {
                        zone.classList.add('drag-over');
                    } else {
                        zone.classList.remove('drag-over');
                    }
                });
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (!touchedBubble || !this.draggedTx) return;
            
            if (clone) {
                const touch = e.changedTouches[0];
                document.querySelectorAll('.vault-bubbles, #uncategorized, #incomeContainer').forEach(zone => {
                    const rect = zone.getBoundingClientRect();
                    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        const vaultId = zone.dataset.vault;
                        this.draggedTx.vault = vaultId === 'uncategorized' ? null : vaultId;
                        this.saveToStorage();
                        this.render();
                    }
                    zone.classList.remove('drag-over');
                });
                
                clone.remove();
                clone = null;
                touchedBubble.style.opacity = '1';
            }
            
            touchedBubble = null;
            this.draggedTx = null;
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
        
        if (tabId === 'charts') {
            this.updateCharts();
        } else if (tabId === 'rules') {
            this.renderRules();
        } else if (tabId === 'subscriptions') {
            this.renderSubscriptions();
        }
    }

    renderSubscriptions() {
        const list = document.getElementById('subscriptionsList');
        if (!list) return;
        
        // Detect recurring transactions
        const subscriptions = this.detectSubscriptions();
        
        if (subscriptions.length === 0) {
            list.innerHTML = '<div class="no-data"><div class="no-data-icon">🔍</div>No recurring subscriptions detected yet.<br>Add more months of transactions to detect patterns.</div>';
            document.getElementById('subscriptionsTotal').textContent = '$0';
            return;
        }
        
        // Calculate monthly total
        const monthlyTotal = subscriptions.reduce((sum, s) => {
            if (s.frequency === 'monthly') return sum + s.amount;
            if (s.frequency === 'yearly') return sum + (s.amount / 12);
            if (s.frequency === 'weekly') return sum + (s.amount * 4.33);
            return sum + s.amount;
        }, 0);
        
        document.getElementById('subscriptionsTotal').textContent = `$${monthlyTotal.toFixed(2)}/mo`;
        
        list.innerHTML = subscriptions.map(sub => {
            const yearly = sub.frequency === 'monthly' ? sub.amount * 12 : 
                          sub.frequency === 'yearly' ? sub.amount : sub.amount * 52;
            const icon = this.getSubscriptionIcon(sub.name);
            
            return `
                <div class="subscription-item">
                    <div class="subscription-info">
                        <span class="subscription-icon">${icon}</span>
                        <div class="subscription-details">
                            <span class="subscription-name">${sub.name}</span>
                            <span class="subscription-frequency">${sub.frequency} • ${sub.count} charges</span>
                        </div>
                    </div>
                    <div>
                        <div class="subscription-amount">$${sub.amount.toFixed(2)}</div>
                        <div class="subscription-yearly">$${yearly.toFixed(0)}/yr</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    detectSubscriptions() {
        // Group transactions by similar description and amount
        const candidates = {};
        
        this.transactions.filter(t => t.type === 'debit').forEach(tx => {
            // Clean and normalize description
            const cleanDesc = this.cleanMerchantName(tx.description);
            const key = `${cleanDesc}_${tx.amount.toFixed(2)}`;
            
            if (!candidates[key]) {
                candidates[key] = {
                    name: cleanDesc,
                    amount: tx.amount,
                    dates: [],
                    count: 0
                };
            }
            candidates[key].dates.push(new Date(tx.date));
            candidates[key].count++;
        });
        
        // Filter to only recurring (2+ occurrences with consistent timing)
        const subscriptions = [];
        
        Object.values(candidates).forEach(c => {
            if (c.count >= 2) {
                // Sort dates
                c.dates.sort((a, b) => a - b);
                
                // Calculate average days between charges
                let totalDays = 0;
                for (let i = 1; i < c.dates.length; i++) {
                    totalDays += (c.dates[i] - c.dates[i-1]) / (1000 * 60 * 60 * 24);
                }
                const avgDays = totalDays / (c.dates.length - 1);
                
                // Determine frequency
                let frequency;
                if (avgDays >= 350 && avgDays <= 380) frequency = 'yearly';
                else if (avgDays >= 25 && avgDays <= 35) frequency = 'monthly';
                else if (avgDays >= 6 && avgDays <= 8) frequency = 'weekly';
                else if (avgDays >= 13 && avgDays <= 16) frequency = 'bi-weekly';
                else return; // Not a clear pattern
                
                subscriptions.push({
                    name: c.name,
                    amount: c.amount,
                    frequency: frequency,
                    count: c.count,
                    lastCharge: c.dates[c.dates.length - 1]
                });
            }
        });
        
        // Sort by amount descending
        return subscriptions.sort((a, b) => b.amount - a.amount);
    }

    cleanMerchantName(desc) {
        // Remove common bank junk from descriptions
        let clean = desc
            .replace(/\d{4,}/g, '') // Remove long numbers
            .replace(/\b(SYDNEY|MELBOURNE|BRISBANE|PERTH|NSW|VIC|QLD|WA|SA|TAS|NT|ACT|AU|AUS)\b/gi, '')
            .replace(/\b(VISA|MASTERCARD|EFTPOS|DIRECT DEBIT|PURCHASE|CARD)\b/gi, '')
            .replace(/\b(PTY|LTD|LIMITED|INC|CORP)\b/gi, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/[*#]+/g, '')
            .trim();
        
        // Capitalize properly
        clean = clean.split(' ')
            .filter(w => w.length > 0)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        
        return clean || desc;
    }

    getSubscriptionIcon(name) {
        const n = name.toLowerCase();
        if (n.includes('netflix')) return '🎬';
        if (n.includes('spotify')) return '🎵';
        if (n.includes('youtube')) return '📺';
        if (n.includes('disney')) return '🏰';
        if (n.includes('amazon') || n.includes('prime')) return '📦';
        if (n.includes('apple')) return '🍎';
        if (n.includes('google')) return '🔍';
        if (n.includes('microsoft') || n.includes('xbox')) return '💻';
        if (n.includes('gym') || n.includes('fitness')) return '💪';
        if (n.includes('insurance')) return '🛡️';
        if (n.includes('phone') || n.includes('mobile') || n.includes('telstra') || n.includes('optus')) return '📱';
        if (n.includes('internet') || n.includes('nbn')) return '🌐';
        if (n.includes('electricity') || n.includes('energy')) return '⚡';
        if (n.includes('water')) return '💧';
        if (n.includes('rent') || n.includes('property')) return '🏠';
        if (n.includes('uber')) return '🚗';
        if (n.includes('doordash') || n.includes('menulog') || n.includes('deliveroo')) return '🍔';
        return '🔄';
    }

    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;
        
        for (const file of files) {
            if (file.type !== 'application/pdf') continue;
            
            try {
                const newTx = await this.parser.parsePDF(file);
                
                for (const tx of newTx) {
                    const exists = this.transactions.find(t => 
                        t.date === tx.date && 
                        t.amount === tx.amount && 
                        t.description === tx.description
                    );
                    if (!exists) {
                        // Apply auto-rules
                        tx.vault = this.matchRule(tx.description);
                        this.transactions.push(tx);
                    }
                }
                
                console.log(`Parsed ${newTx.length} transactions from ${file.name}`);
            } catch (error) {
                console.error(`Error parsing ${file.name}:`, error);
                alert(`Error parsing ${file.name}. Please check if it's a valid bank statement.`);
            }
        }
        
        this.saveToStorage();
        this.render();
        event.target.value = '';
    }

    matchRule(description) {
        // First check user-defined rules
        for (const rule of this.rules) {
            const keyword = rule.caseSensitive ? rule.keyword : rule.keyword.toLowerCase();
            const desc = rule.caseSensitive ? description : description.toLowerCase();
            if (desc.includes(keyword)) {
                return rule.vaultId;
            }
        }
        
        // Then check auto-categorization rules
        const autoRules = this.getAutoCategorization();
        const descLower = description.toLowerCase();
        
        for (const [keyword, vaultId] of Object.entries(autoRules)) {
            if (descLower.includes(keyword)) {
                return vaultId;
            }
        }
        
        return null;
    }
    
    getAutoCategorization() {
        return {
            // Groceries
            'woolworths': 'groceries',
            'coles': 'groceries',
            'aldi': 'groceries',
            'iga': 'groceries',
            'foodland': 'groceries',
            'harris farm': 'groceries',
            
            // Dining & Cafes
            'restaurant': 'dining_out',
            'cafe': 'coffee',
            'mcdonald': 'takeaway',
            'kfc': 'takeaway',
            'hungry jack': 'takeaway',
            'subway': 'takeaway',
            'domino': 'takeaway',
            'pizza hut': 'takeaway',
            'uber eats': 'takeaway',
            'doordash': 'takeaway',
            'menulog': 'takeaway',
            'deliveroo': 'takeaway',
            'starbucks': 'coffee',
            'gloria jean': 'coffee',
            'coffee': 'coffee',
            
            // Transport
            'shell': 'fuel',
            'caltex': 'fuel',
            'bp ': 'fuel',
            'ampol': 'fuel',
            'seven eleven': 'fuel',
            '7-eleven': 'fuel',
            'united petrol': 'fuel',
            'uber': 'rideshare',
            'ola': 'rideshare',
            'didi': 'rideshare',
            'opal': 'public_transport',
            'myki': 'public_transport',
            
            // Utilities & Services
            'telstra': 'internet_phone',
            'optus': 'internet_phone',
            'vodafone': 'internet_phone',
            'tpg': 'internet_phone',
            'aussie broadband': 'internet_phone',
            'origin energy': 'utilities',
            'agl': 'utilities',
            'energy australia': 'utilities',
            'synergy': 'utilities',
            'alinta': 'utilities',
            'sydney water': 'utilities',
            'yarra valley water': 'utilities',
            
            // Shopping
            'kmart': 'home_goods',
            'target': 'home_goods',
            'big w': 'home_goods',
            'bunnings': 'home_maintenance',
            'ikea': 'home_goods',
            'jb hi-fi': 'electronics',
            'harvey norman': 'electronics',
            'the good guys': 'electronics',
            'officeworks': 'electronics',
            'cotton on': 'clothing',
            'uniqlo': 'clothing',
            'zara': 'clothing',
            'h&m': 'clothing',
            'myer': 'clothing',
            'david jones': 'clothing',
            
            // Subscriptions
            'netflix': 'streaming',
            'spotify': 'music',
            'apple.com/bill': 'subscriptions',
            'amazon prime': 'streaming',
            'disney plus': 'streaming',
            'youtube premium': 'streaming',
            'stan': 'streaming',
            'binge': 'streaming',
            'kayo': 'streaming',
            'adobe': 'software',
            'microsoft 365': 'software',
            'dropbox': 'cloud_storage',
            'google storage': 'cloud_storage',
            
            // Health & Fitness
            'chemist warehouse': 'pharmacy',
            'priceline': 'pharmacy',
            'terry white': 'pharmacy',
            'amcal': 'pharmacy',
            'gym': 'gym',
            'fitness': 'gym',
            'anytime fitness': 'gym',
            'snap fitness': 'gym',
            'f45': 'gym',
            'medibank': 'health_insurance',
            'bupa': 'health_insurance',
            'hcf': 'health_insurance',
            'nib': 'health_insurance',
            
            // Entertainment
            'hoyts': 'movies',
            'event cinemas': 'movies',
            'village cinemas': 'movies',
            'reading cinemas': 'movies',
            'steam': 'gaming',
            'playstation': 'gaming',
            'xbox': 'gaming',
            'nintendo': 'gaming',
            
            // Alcohol
            'dan murphy': 'alcohol',
            'bws': 'alcohol',
            'liquorland': 'alcohol',
            'vintage cellars': 'alcohol',
            'first choice': 'alcohol',
            'bottle shop': 'alcohol',
            
            // Pet
            'petbarn': 'pet_supplies',
            'pet stock': 'pet_supplies',
            'vet': 'vet',
            'greencross': 'vet',
            
            // Insurance
            'nrma': 'car_insurance',
            'racv': 'car_insurance',
            'aami': 'car_insurance',
            'suncorp': 'car_insurance',
            'allianz': 'car_insurance',
            'budget direct': 'car_insurance',
            
            // Government
            'vicroads': 'car_rego',
            'rms': 'car_rego',
            'transport nsw': 'car_rego',
            'qld transport': 'car_rego',
            'service nsw': 'fees',
            'australia post': 'fees',
            
            // Books & Education
            'booktopia': 'books',
            'dymocks': 'books',
            'qbd': 'books',
            'readings': 'books',
            'udemy': 'courses',
            'coursera': 'courses',
            'skillshare': 'courses',
        };
    }

    applyFilters() {
        document.querySelectorAll('.bubble').forEach(bubble => {
            const txId = bubble.dataset.txId;
            const tx = this.transactions.find(t => t.id === txId);
            if (!tx) return;
            
            let visible = true;
            
            if (this.filters.search && !tx.description.toLowerCase().includes(this.filters.search)) {
                visible = false;
            }
            
            if (this.filters.source !== 'all' && tx.source !== this.filters.source) {
                visible = false;
            }
            
            if (this.filters.status === 'uncategorized' && tx.vault) {
                visible = false;
            }
            if (this.filters.status === 'categorized' && !tx.vault) {
                visible = false;
            }
            
            bubble.classList.toggle('hidden', !visible);
        });
        
        // Update count
        const visibleUncategorized = document.querySelectorAll('#uncategorized .bubble:not(.hidden)').length;
        document.getElementById('uncategorizedCount').textContent = visibleUncategorized;
    }

    render() {
        this.renderMonthTabs();
        this.renderSpendingProgress();
        this.renderIncome();
        this.renderVaults();
        this.renderUncategorized();
        this.updateSummary();
        this.attachDragListeners();
    }

    renderSpendingProgress() {
        const filtered = this.getFilteredTransactions();
        
        // Calculate NET spending (debits - credits in vaults)
        const vaultTx = filtered.filter(t => t.vault && t.vault !== 'income');
        const debits = vaultTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        const credits = vaultTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const netSpent = debits - credits;
        
        // Calculate total budget from all vaults
        const totalBudget = this.vaults.reduce((sum, v) => sum + (v.budget || 0), 0);
        
        // Calculate days left in month
        const now = new Date();
        let daysLeft, totalDays;
        if (this.selectedMonth && this.selectedMonth !== 'all') {
            const [year, month] = this.selectedMonth.split('-').map(Number);
            const lastDay = new Date(year, month, 0).getDate();
            const currentDay = (year === now.getFullYear() && month === now.getMonth() + 1) 
                ? now.getDate() : lastDay;
            daysLeft = Math.max(0, lastDay - currentDay);
            totalDays = lastDay;
        } else {
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            daysLeft = lastDay - now.getDate();
            totalDays = lastDay;
        }
        
        const remaining = totalBudget - netSpent;
        const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;
        const percentage = totalBudget > 0 ? Math.min((netSpent / totalBudget) * 100, 100) : 0;
        
        // Update DOM
        document.getElementById('spendingAmount').textContent = `$${netSpent.toFixed(0)}`;
        document.getElementById('spendingBudget').textContent = `$${totalBudget.toFixed(0)}`;
        
        const remainingEl = document.getElementById('spendingRemaining');
        if (remaining >= 0) {
            remainingEl.textContent = `$${remaining.toFixed(0)} left`;
            remainingEl.classList.remove('over');
        } else {
            remainingEl.textContent = `$${Math.abs(remaining).toFixed(0)} over`;
            remainingEl.classList.add('over');
        }
        
        document.getElementById('spendingDaysLeft').textContent = `${daysLeft} days left in month`;
        document.getElementById('spendingDailyBudget').textContent = remaining > 0 
            ? `$${dailyBudget.toFixed(0)}/day remaining` 
            : 'Over budget!';
        
        const progressFill = document.getElementById('spendingProgressFill');
        progressFill.style.width = `${percentage}%`;
        progressFill.classList.remove('warning', 'over');
        if (percentage > 100) {
            progressFill.classList.add('over');
        } else if (percentage > 80) {
            progressFill.classList.add('warning');
        }
    }

    getFilteredTransactions() {
        // Filter by selected month
        if (!this.selectedMonth || this.selectedMonth === 'all') {
            return this.transactions;
        }
        return this.transactions.filter(t => t.date && t.date.startsWith(this.selectedMonth));
    }

    renderMonthTabs() {
        const container = document.getElementById('monthTabs');
        if (!container) return;
        
        // Get unique months from transactions
        const months = new Set();
        this.transactions.forEach(tx => {
            if (tx.date) {
                const month = tx.date.substring(0, 7);
                months.add(month);
            }
        });
        
        // Sort months descending (newest first)
        const sortedMonths = Array.from(months).sort().reverse();
        
        // Default to current month if not set
        if (!this.selectedMonth && sortedMonths.length > 0) {
            const currentMonth = new Date().toISOString().substring(0, 7);
            this.selectedMonth = sortedMonths.includes(currentMonth) ? currentMonth : sortedMonths[0];
        }
        
        // Build tabs
        let html = `<button class="month-tab ${this.selectedMonth === 'all' ? 'active' : ''}" data-month="all">
            <span class="month-tab-name">All</span>
            <span class="month-tab-total">${this.transactions.length} tx</span>
        </button>`;
        
        sortedMonths.forEach(month => {
            const [year, m] = month.split('-');
            const monthName = new Date(year, parseInt(m) - 1).toLocaleString('default', { month: 'short' });
            const monthTx = this.transactions.filter(t => t.date && t.date.startsWith(month));
            const monthTotal = monthTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
            const isActive = this.selectedMonth === month;
            
            html += `<button class="month-tab ${isActive ? 'active' : ''}" data-month="${month}">
                <span class="month-tab-name">${monthName} ${year.slice(2)}</span>
                <span class="month-tab-total">$${monthTotal.toFixed(0)}</span>
            </button>`;
        });
        
        container.innerHTML = html;
        
        // Attach click handlers
        container.querySelectorAll('.month-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.selectedMonth = tab.dataset.month;
                this.render();
            });
        });
    }

    renderIncome() {
        const container = document.getElementById('incomeContainer');
        const filtered = this.getFilteredTransactions();
        
        // Only show items explicitly in income vault
        const incomeInVault = filtered.filter(t => t.vault === 'income');
        container.innerHTML = incomeInVault.map(tx => this.renderBubble(tx)).join('');
        document.getElementById('incomeCount').textContent = incomeInVault.length;
        
        const total = incomeInVault.reduce((sum, t) => sum + t.amount, 0);
        const header = container.closest('.income-section').querySelector('h2');
        header.innerHTML = `💰 Income <span style="font-size: 14px; color: #22c55e; margin-left: 10px;">+$${total.toFixed(2)}</span>`;
    }

    renderVaults() {
        const grid = document.getElementById('vaultsGrid');
        grid.innerHTML = '';
        const filtered = this.getFilteredTransactions();
        
        // Calculate total spending across all vaults (for selected month)
        const allVaultTx = filtered.filter(t => t.vault && t.vault !== 'income');
        const totalSpent = allVaultTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        const totalReceived = allVaultTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const totalNet = totalSpent - totalReceived;
        
        // Update vaults header with total (net only)
        const header = document.getElementById('vaultsHeader');
        if (header) {
            const netColor = totalNet >= 0 ? '#ef4444' : '#22c55e';
            const netPrefix = totalNet >= 0 ? '-' : '+';
            header.innerHTML = `🏦 Vaults <span style="font-size: 16px; color: ${netColor}; margin-left: 10px;">${netPrefix}$${Math.abs(totalNet).toFixed(2)}</span>`;
        }
        
        for (const vault of this.vaults) {
            const vaultTx = filtered.filter(t => t.vault === vault.id);
            const debits = vaultTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
            const credits = vaultTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
            const total = debits - credits; // Net amount
            const pct = vault.budget ? Math.min((total / vault.budget) * 100, 100) : 0;
            const overBudget = vault.budget && total > vault.budget;
            const color = overBudget ? '#ef4444' : '#22c55e';
            
            const vaultEl = document.createElement('div');
            vaultEl.className = 'vault draggable';
            vaultEl.draggable = true;
            vaultEl.dataset.vaultId = vault.id;
            
            // NET display with breakdown
            const netColor = total >= 0 ? '#ef4444' : '#22c55e';
            const netPrefix = total >= 0 ? '-' : '+';
            const netValue = Math.abs(total);
            
            // Show breakdown if there are credits
            const breakdownHTML = credits > 0 ? 
                `<div class="vault-breakdown" style="font-size: 11px; color: #64748b; margin-top: 4px;">
                    Out: $${debits.toFixed(2)} | In: <span style="color: #22c55e;">+$${credits.toFixed(2)}</span>
                </div>` : '';
            
            vaultEl.innerHTML = `
                <div class="vault-header">
                    <div class="vault-title">
                        <span class="vault-emoji">${vault.emoji}</span>
                        <span class="vault-name">${vault.name}</span>
                    </div>
                    <div>
                        <div class="vault-total" style="color: ${netColor}; font-weight: bold;">${netPrefix}$${netValue.toFixed(2)} <span style="font-size: 10px; font-weight: normal; color: #94a3b8;">NET</span></div>
                        ${breakdownHTML}
                    </div>
                </div>
                ${vault.budget ? `
                    <div class="vault-budget" onclick="app.editBudget('${vault.id}')" style="cursor: pointer;" title="Click to edit budget">
                        📊 Budget: $${vault.budget} 
                        ${overBudget ? `(⚠️ $${(total - vault.budget).toFixed(2)} over)` : `($${(vault.budget - total).toFixed(2)} left)`}
                    </div>
                    <div class="vault-progress">
                        <div class="vault-progress-fill" style="width: ${pct}%; background: ${color}"></div>
                    </div>
                ` : `<div class="vault-budget set-budget" onclick="app.editBudget('${vault.id}')" style="cursor: pointer;">+ Set Budget</div>`}
                <div class="vault-bubbles" data-vault="${vault.id}">
                    ${vaultTx.map(tx => this.renderBubble(tx)).join('')}
                </div>
                <div class="vault-actions">
                    <button class="vault-action-btn" onclick="app.editVault('${vault.id}')">✏️ Edit</button>
                    <button class="vault-action-btn" onclick="app.deleteVault('${vault.id}')">🗑️</button>
                </div>
                <div class="vault-drag-handle" title="Drag to reorder">⋮⋮</div>
            `;
            grid.appendChild(vaultEl);
        }
    }

    renderUncategorized() {
        const container = document.getElementById('uncategorized');
        const filtered = this.getFilteredTransactions();
        
        // Show all uncategorized items (both debits and credits) for selected month
        const uncategorized = filtered.filter(t => !t.vault);
        
        container.innerHTML = uncategorized.map(tx => this.renderBubble(tx)).join('');
        document.getElementById('uncategorizedCount').textContent = uncategorized.length;
    }

    renderBubble(tx) {
        const isCredit = tx.type === 'credit';
        return `
            <div class="bubble" draggable="true" data-tx-id="${tx.id}">
                <span class="source-badge ${tx.source}">${tx.source === 'bank' ? 'Bank' : tx.source === 'amex' ? 'Amex' : '?'}</span>
                <span class="desc" title="${tx.description}">${tx.description}</span>
                <span class="amount ${isCredit ? 'credit' : ''}">${isCredit ? '+' : '-'}$${tx.amount.toFixed(2)}</span>
            </div>
        `;
    }

    attachDragListeners() {
        document.querySelectorAll('.bubble').forEach(bubble => {
            bubble.addEventListener('dragstart', (e) => this.handleDragStart(e));
            bubble.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
        
        document.querySelectorAll('.vault-bubbles, #uncategorized, #incomeContainer').forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
        
        // Vault reordering drag
        this.attachVaultDragListeners();
    }

    attachVaultDragListeners() {
        const vaults = document.querySelectorAll('.vault.draggable');
        
        vaults.forEach(vault => {
            vault.addEventListener('dragstart', (e) => {
                // Only allow drag from the handle or vault header
                if (!e.target.closest('.vault-drag-handle') && !e.target.closest('.vault-header')) {
                    // Check if dragging a bubble inside the vault
                    if (e.target.closest('.bubble')) return;
                }
                
                e.stopPropagation();
                this.draggingVault = vault.dataset.vaultId;
                vault.classList.add('dragging-vault');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('vault-id', vault.dataset.vaultId);
            });
            
            vault.addEventListener('dragend', () => {
                vault.classList.remove('dragging-vault');
                document.querySelectorAll('.vault').forEach(v => v.classList.remove('drop-target'));
                this.draggingVault = null;
            });
            
            vault.addEventListener('dragover', (e) => {
                if (!this.draggingVault) return;
                e.preventDefault();
                e.stopPropagation();
                
                // Don't show drop target on self
                if (vault.dataset.vaultId === this.draggingVault) return;
                
                vault.classList.add('drop-target');
            });
            
            vault.addEventListener('dragleave', (e) => {
                vault.classList.remove('drop-target');
            });
            
            vault.addEventListener('drop', (e) => {
                // Only handle vault reordering if we're dragging a vault
                if (!this.draggingVault) {
                    // Not dragging a vault - let the event bubble to vault-bubbles
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                
                const fromId = this.draggingVault;
                const toId = vault.dataset.vaultId;
                
                if (fromId !== toId) {
                    this.reorderVaults(fromId, toId);
                }
                
                vault.classList.remove('drop-target');
            });
        });
    }

    reorderVaults(fromId, toId) {
        const fromIndex = this.vaults.findIndex(v => v.id === fromId);
        const toIndex = this.vaults.findIndex(v => v.id === toId);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        // Remove the vault from its current position
        const [movedVault] = this.vaults.splice(fromIndex, 1);
        
        // Insert it at the new position
        this.vaults.splice(toIndex, 0, movedVault);
        
        this.saveToStorage();
        this.render();
    }

    handleDragStart(e) {
        const bubble = e.target.closest('.bubble');
        if (!bubble) return;
        
        const txId = bubble.dataset.txId;
        if (!txId) return;
        
        this.draggedTx = this.transactions.find(t => t.id === txId);
        this.draggedElement = bubble;
        bubble.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', txId);
        
        console.log('Drag start:', txId, this.draggedTx?.description);
        
        // Start auto-scroll listener
        this.startAutoScroll();
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        
        // Stop auto-scroll
        this.stopAutoScroll();
    }

    startAutoScroll() {
        const scrollSpeed = 8;
        const edgeZone = 80; // pixels from edge to trigger scroll
        
        this.autoScrollHandler = (e) => {
            const y = e.clientY;
            const viewportHeight = window.innerHeight;
            
            if (y < edgeZone) {
                // Near top - scroll up
                window.scrollBy(0, -scrollSpeed);
            } else if (y > viewportHeight - edgeZone) {
                // Near bottom - scroll down
                window.scrollBy(0, scrollSpeed);
            }
        };
        
        document.addEventListener('dragover', this.autoScrollHandler);
    }

    stopAutoScroll() {
        if (this.autoScrollHandler) {
            document.removeEventListener('dragover', this.autoScrollHandler);
            this.autoScrollHandler = null;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
        
        // Skip if we're dragging a vault (vault reorder)
        if (this.draggingVault) return;
        
        const txId = e.dataTransfer.getData('text/plain');
        if (!txId) return;
        
        const tx = this.transactions.find(t => t.id === txId);
        if (!tx) {
            console.error('Transaction not found:', txId);
            return;
        }
        
        const vaultId = e.currentTarget.dataset.vault;
        console.log('Dropping tx', txId, 'into vault', vaultId);
        
        tx.vault = vaultId === 'uncategorized' ? null : vaultId;
        
        this.saveToStorage();
        this.render();
    }

    // Charts
    updateCharts() {
        const year = document.getElementById('chartYear').value;
        this.renderMonthlyChart(year);
        this.renderCategoryChart();
        this.renderTrendChart(year);
        this.renderTopCategories();
    }

    renderMonthlyChart(year) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Calculate NET spending per month (debits - credits, excluding income vault)
        const monthlyData = {};
        const incomeData = {};
        
        months.forEach((m, i) => {
            const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = { debits: 0, credits: 0, net: 0 };
            incomeData[monthKey] = 0;
        });
        
        this.transactions.filter(t => t.date.startsWith(year)).forEach(tx => {
            const monthKey = tx.date.substring(0, 7);
            if (!monthlyData[monthKey]) return;
            
            if (tx.vault === 'income') {
                incomeData[monthKey] += tx.amount;
            } else {
                if (tx.type === 'debit') {
                    monthlyData[monthKey].debits += tx.amount;
                } else {
                    monthlyData[monthKey].credits += tx.amount;
                }
            }
        });
        
        // Calculate NET for each month
        Object.keys(monthlyData).forEach(key => {
            monthlyData[key].net = monthlyData[key].debits - monthlyData[key].credits;
        });
        
        if (this.charts.monthly) this.charts.monthly.destroy();
        
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: Object.values(incomeData),
                        backgroundColor: '#22c55e',
                        borderRadius: 6
                    },
                    {
                        label: 'NET Spending',
                        data: Object.values(monthlyData).map(d => d.net),
                        backgroundColor: '#ef4444',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { labels: { color: '#94a3b8' } },
                    tooltip: {
                        callbacks: {
                            footer: function(items) {
                                const monthIdx = items[0].dataIndex;
                                const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
                                const data = monthlyData[monthKey];
                                return `Out: $${data.debits.toFixed(2)}\nIn: +$${data.credits.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: '#334155' }, 
                        ticks: { color: '#94a3b8', callback: v => '$' + v }
                    },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        // Calculate NET spending per category (debits - credits)
        const categoryData = {};
        this.transactions.filter(t => t.vault && t.vault !== 'income').forEach(tx => {
            const vault = this.vaults.find(v => v.id === tx.vault);
            if (vault) {
                if (!categoryData[vault.name]) {
                    categoryData[vault.name] = { debits: 0, credits: 0, net: 0 };
                }
                if (tx.type === 'debit') {
                    categoryData[vault.name].debits += tx.amount;
                } else {
                    categoryData[vault.name].credits += tx.amount;
                }
                categoryData[vault.name].net = categoryData[vault.name].debits - categoryData[vault.name].credits;
            }
        });
        
        // Only show categories with positive NET spending
        const sorted = Object.entries(categoryData)
            .filter(([_, data]) => data.net > 0)
            .sort((a, b) => b[1].net - a[1].net);
        
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'];
        
        if (this.charts.category) this.charts.category.destroy();
        
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sorted.map(c => c[0]),
                datasets: [{
                    data: sorted.map(c => c[1].net),
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right', labels: { color: '#94a3b8', padding: 8, font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const cat = sorted[context.dataIndex];
                                const data = cat[1];
                                return [
                                    `${cat[0]}: $${data.net.toFixed(2)} NET`,
                                    `Out: $${data.debits.toFixed(2)}`,
                                    `In: +$${data.credits.toFixed(2)}`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    renderTrendChart(year) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        
        // Get last 12 months dynamically
        const now = new Date();
        const last12Months = [];
        const last12MonthKeys = [];
        
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + String(d.getFullYear()).slice(2);
            last12Months.push(monthLabel);
            last12MonthKeys.push(monthKey);
        }
        
        // Calculate total NET spending per vault across all 12 months
        const vaultTotals = this.vaults.map(vault => {
            const total = last12MonthKeys.reduce((sum, monthKey) => {
                const debits = this.transactions
                    .filter(t => t.vault === vault.id && t.type === 'debit' && t.date && t.date.startsWith(monthKey))
                    .reduce((s, t) => s + t.amount, 0);
                const credits = this.transactions
                    .filter(t => t.vault === vault.id && t.type === 'credit' && t.date && t.date.startsWith(monthKey))
                    .reduce((s, t) => s + t.amount, 0);
                return sum + (debits - credits);
            }, 0);
            return { vault, total };
        });
        
        // Get top 8 vaults by NET spending (or all if less than 8)
        const topVaults = vaultTotals
            .filter(v => v.total > 0) // Only show vaults with actual spending
            .sort((a, b) => b.total - a.total)
            .slice(0, 8)
            .map(v => v.vault);
        
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
        
        const datasets = [];
        
        topVaults.forEach((vault, idx) => {
            const data = last12MonthKeys.map(monthKey => {
                const debits = this.transactions
                    .filter(t => t.vault === vault.id && t.type === 'debit' && t.date && t.date.startsWith(monthKey))
                    .reduce((sum, t) => sum + t.amount, 0);
                const credits = this.transactions
                    .filter(t => t.vault === vault.id && t.type === 'credit' && t.date && t.date.startsWith(monthKey))
                    .reduce((sum, t) => sum + t.amount, 0);
                return debits - credits; // NET spending
            });
            
            // Calculate average
            const average = data.reduce((sum, val) => sum + val, 0) / data.length;
            const averageData = new Array(12).fill(average);
            
            // Actual spending line (solid, filled)
            datasets.push({
                label: vault.emoji + ' ' + vault.name,
                data,
                borderColor: colors[idx % colors.length],
                backgroundColor: colors[idx % colors.length] + '20',
                tension: 0.3,
                fill: true,
                borderWidth: 2
            });
            
            // Average line (dashed, no fill)
            datasets.push({
                label: vault.emoji + ' ' + vault.name + ' (avg)',
                data: averageData,
                borderColor: colors[idx % colors.length],
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        });
        
        if (this.charts.trend) this.charts.trend.destroy();
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: { labels: last12Months, datasets },
            options: {
                responsive: true,
                plugins: { 
                    legend: { 
                        labels: { color: '#94a3b8', font: { size: 9 } },
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(items) {
                                return items[0].label + ' - NET Spending';
                            },
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                            },
                            footer: function() {
                                return 'NET = Money Out - Money In';
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: '#334155' }, 
                        ticks: { 
                            color: '#94a3b8',
                            callback: v => '$' + v
                        }
                    },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 9 } } }
                }
            }
        });
    }

    renderTopCategories() {
        const container = document.getElementById('topCategories');
        if (!container) return;
        
        // Calculate NET spending per category
        const categoryData = {};
        this.transactions.filter(t => t.vault && t.vault !== 'income').forEach(tx => {
            const vault = this.vaults.find(v => v.id === tx.vault);
            if (vault) {
                if (!categoryData[vault.id]) {
                    categoryData[vault.id] = { name: vault.name, emoji: vault.emoji, debits: 0, credits: 0, net: 0 };
                }
                if (tx.type === 'debit') {
                    categoryData[vault.id].debits += tx.amount;
                } else {
                    categoryData[vault.id].credits += tx.amount;
                }
                categoryData[vault.id].net = categoryData[vault.id].debits - categoryData[vault.id].credits;
            }
        });
        
        // Sort by NET spending and take top 5
        const sorted = Object.values(categoryData)
            .filter(cat => cat.net > 0)
            .sort((a, b) => b.net - a.net)
            .slice(0, 5);
        const max = sorted[0]?.net || 1;
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
        
        container.innerHTML = sorted.map((cat, i) => {
            const pct = (cat.net / max) * 100;
            const tooltip = cat.credits > 0 ? `Out: $${cat.debits.toFixed(0)} | In: +$${cat.credits.toFixed(0)}` : '';
            return `
                <div class="top-category-item" title="${tooltip}">
                    <span style="font-size: 20px">${cat.emoji}</span>
                    <div class="top-category-bar">
                        <div class="top-category-fill" style="width: ${pct}%; background: ${colors[i]}">${cat.name}</div>
                    </div>
                    <span class="top-category-amount">$${cat.net.toFixed(0)} <span style="font-size: 9px; color: #94a3b8;">NET</span></span>
                </div>
            `;
        }).join('');
    }

    // Auto-Rules
    renderRules() {
        const list = document.getElementById('rulesList');
        const vaultSelect = document.getElementById('ruleVault');
        
        // Update vault select
        vaultSelect.innerHTML = '<option value="">Select vault...</option>';
        this.vaults.forEach(v => {
            vaultSelect.innerHTML += `<option value="${v.id}">${v.emoji} ${v.name}</option>`;
        });
        
        if (this.rules.length === 0) {
            list.innerHTML = '<div class="no-data"><div class="no-data-icon">🤖</div>No rules yet. Add rules or learn from categorized transactions.</div>';
            return;
        }
        
        list.innerHTML = this.rules.map((rule, idx) => {
            const vault = this.vaults.find(v => v.id === rule.vaultId);
            return `
                <div class="rule-item">
                    <span class="rule-keyword">"${rule.keyword}"</span>
                    <span class="rule-arrow">→</span>
                    <span class="rule-vault">${vault ? vault.emoji + ' ' + vault.name : 'Unknown'}</span>
                    <button class="rule-delete" onclick="app.deleteRule(${idx})">✕</button>
                </div>
            `;
        }).join('');
    }

    showRuleModal() {
        document.getElementById('ruleModal').classList.add('active');
        document.getElementById('ruleKeyword').focus();
    }

    hideRuleModal() {
        document.getElementById('ruleModal').classList.remove('active');
        document.getElementById('ruleKeyword').value = '';
        document.getElementById('ruleVault').value = '';
        document.getElementById('ruleCaseSensitive').checked = false;
    }

    createRule() {
        const keyword = document.getElementById('ruleKeyword').value.trim();
        const vaultId = document.getElementById('ruleVault').value;
        const caseSensitive = document.getElementById('ruleCaseSensitive').checked;
        
        if (!keyword || !vaultId) {
            alert('Please enter a keyword and select a vault');
            return;
        }
        
        this.rules.push({ keyword, vaultId, caseSensitive });
        this.saveToStorage();
        this.hideRuleModal();
        this.renderRules();
    }

    deleteRule(idx) {
        this.rules.splice(idx, 1);
        this.saveToStorage();
        this.renderRules();
    }

    applyAllRules() {
        let count = 0;
        this.transactions.forEach(tx => {
            if (!tx.vault) {
                const match = this.matchRule(tx.description);
                if (match) {
                    tx.vault = match;
                    count++;
                }
            }
        });
        
        this.saveToStorage();
        this.render();
        alert(`Applied rules to ${count} transactions`);
    }

    learnFromCategorized() {
        const merchantCounts = {};
        const wordCounts = {};
        
        // Count by cleaned merchant name AND by words
        this.transactions.filter(t => t.vault && t.vault !== 'income').forEach(tx => {
            // Learn full merchant names
            const merchant = this.cleanMerchantName(tx.description);
            const merchantKey = merchant.toLowerCase();
            if (!merchantCounts[merchantKey]) {
                merchantCounts[merchantKey] = { name: merchant, vaults: {} };
            }
            merchantCounts[merchantKey].vaults[tx.vault] = (merchantCounts[merchantKey].vaults[tx.vault] || 0) + 1;
            
            // Also learn individual words (for partial matches)
            const words = tx.description.split(/\s+/).filter(w => w.length > 3);
            words.forEach(word => {
                const key = word.toLowerCase();
                if (!wordCounts[key]) {
                    wordCounts[key] = {};
                }
                wordCounts[key][tx.vault] = (wordCounts[key][tx.vault] || 0) + 1;
            });
        });
        
        let newRules = 0;
        
        // Learn from merchant names (higher priority - need only 1 occurrence)
        Object.entries(merchantCounts).forEach(([key, data]) => {
            const total = Object.values(data.vaults).reduce((a, b) => a + b, 0);
            const entries = Object.entries(data.vaults).sort((a, b) => b[1] - a[1]);
            if (entries.length === 0) return;
            
            const [topVault, topCount] = entries[0];
            
            // If consistent categorization (100% to one vault, or 80%+ with 2+ occurrences)
            if ((total === 1) || (topCount >= 2 && topCount / total >= 0.8)) {
                const exists = this.rules.find(r => r.keyword.toLowerCase() === key);
                if (!exists && data.name.length > 2) {
                    this.rules.push({ 
                        keyword: data.name, 
                        vaultId: topVault, 
                        caseSensitive: false,
                        learned: true
                    });
                    newRules++;
                }
            }
        });
        
        // Learn from words (need stronger signal)
        Object.entries(wordCounts).forEach(([word, vaultCounts]) => {
            const total = Object.values(vaultCounts).reduce((a, b) => a + b, 0);
            const [topVault, topCount] = Object.entries(vaultCounts).sort((a, b) => b[1] - a[1])[0];
            
            // Need 80%+ and at least 3 occurrences for word-based rules
            if (topCount >= 3 && topCount / total >= 0.8) {
                const exists = this.rules.find(r => r.keyword.toLowerCase() === word);
                if (!exists) {
                    this.rules.push({ keyword: word, vaultId: topVault, caseSensitive: false, learned: true });
                    newRules++;
                }
            }
        });
        
        if (newRules > 0) {
            this.saveToStorage();
            this.renderRules();
            alert(`🧠 Learned ${newRules} new rules from your categorizations!`);
        } else {
            alert('No new patterns found. Categorize more transactions first.');
        }
    }

    // Vault modals
    showVaultModal() {
        document.getElementById('vaultModal').classList.add('active');
        document.getElementById('vaultName').focus();
    }

    hideVaultModal() {
        document.getElementById('vaultModal').classList.remove('active');
        document.getElementById('vaultName').value = '';
        document.getElementById('vaultEmoji').value = '';
        document.getElementById('vaultBudget').value = '';
    }

    createVault() {
        const name = document.getElementById('vaultName').value.trim();
        const emoji = document.getElementById('vaultEmoji').value.trim() || '📁';
        const budget = parseFloat(document.getElementById('vaultBudget').value) || null;
        
        if (!name) {
            alert('Please enter a vault name');
            return;
        }
        
        const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        this.vaults.push({ id, name, emoji, budget });
        
        this.saveToStorage();
        this.hideVaultModal();
        this.render();
    }

    editVault(vaultId) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault) return;
        
        const newName = prompt('Vault name:', vault.name);
        if (newName === null) return;
        
        const newBudget = prompt('Monthly budget:', vault.budget || '');
        
        vault.name = newName || vault.name;
        vault.budget = newBudget ? parseFloat(newBudget) : null;
        
        this.saveToStorage();
        this.render();
    }

    editBudget(vaultId) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault) return;
        
        const newBudget = prompt(`Set monthly budget for ${vault.name}:`, vault.budget || '');
        if (newBudget === null) return;
        
        vault.budget = newBudget ? parseFloat(newBudget) : null;
        
        this.saveToStorage();
        this.render();
    }

    deleteVault(vaultId) {
        if (!confirm('Delete this vault? Transactions will become uncategorized.')) return;
        
        this.transactions.forEach(tx => {
            if (tx.vault === vaultId) tx.vault = null;
        });
        
        this.vaults = this.vaults.filter(v => v.id !== vaultId);
        this.saveToStorage();
        this.render();
    }

    updateSummary() {
        const total = this.transactions.length;
        const categorized = this.transactions.filter(t => t.vault).length;
        const totalSpending = this.transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('totalTx').textContent = total;
        document.getElementById('categorizedTx').textContent = `${categorized}/${total}`;
        document.getElementById('totalSpending').textContent = `$${totalSpending.toFixed(2)}`;
    }

    exportCSV() {
        const headers = ['Date', 'Description', 'Amount', 'Type', 'Source', 'Vault'];
        const rows = this.transactions.map(tx => {
            const vault = this.vaults.find(v => v.id === tx.vault);
            return [
                tx.date,
                `"${tx.description.replace(/"/g, '""')}"`,
                tx.amount.toFixed(2),
                tx.type,
                tx.source,
                vault ? vault.name : 'Uncategorized'
            ].join(',');
        });
        
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `spending_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    clearAll() {
        if (!confirm('Clear all transactions? This cannot be undone.')) return;
        this.transactions = [];
        this.saveToStorage();
        this.render();
    }
    
    toggleAllCategories(show) {
        if (!this.charts.trend) return;
        
        const chart = this.charts.trend;
        chart.data.datasets.forEach((dataset, index) => {
            const meta = chart.getDatasetMeta(index);
            meta.hidden = !show;
        });
        chart.update();
    }
    
    toggleAverageLines(show) {
        if (!this.charts.trend) return;
        
        const chart = this.charts.trend;
        chart.data.datasets.forEach((dataset, index) => {
            // Only toggle average lines (those with "(avg)" in label)
            if (dataset.label.includes('(avg)')) {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = !show;
            }
        });
        chart.update();
    }
}

// Initialize
const app = new SpendingTracker();
