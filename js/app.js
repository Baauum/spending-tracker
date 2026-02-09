// Spending Tracker - Main App
class SpendingTracker {
    constructor() {
        this.transactions = [];
        this.vaults = [];
        this.parser = new StatementParser();
        this.draggedElement = null;
        this.draggedTx = null;
        
        this.loadFromStorage();
        this.initEventListeners();
        this.render();
    }

    loadFromStorage() {
        const savedVaults = localStorage.getItem('spending_vaults');
        const savedTx = localStorage.getItem('spending_transactions');
        
        if (savedVaults) {
            this.vaults = JSON.parse(savedVaults);
        } else {
            // Default vaults
            this.vaults = [
                { id: 'housing', name: 'Housing', emoji: '🏠', budget: 1500 },
                { id: 'groceries', name: 'Groceries', emoji: '🛒', budget: 400 },
                { id: 'dining', name: 'Dining Out', emoji: '🍽️', budget: 300 },
                { id: 'transport', name: 'Transport', emoji: '🚗', budget: 400 },
                { id: 'shopping', name: 'Shopping', emoji: '🛍️', budget: 200 },
                { id: 'subscriptions', name: 'Subscriptions', emoji: '📱', budget: 100 },
                { id: 'insurance', name: 'Insurance', emoji: '🛡️', budget: 300 },
                { id: 'entertainment', name: 'Entertainment', emoji: '🎉', budget: 150 },
                { id: 'travel', name: 'Travel', emoji: '✈️', budget: 500 },
                { id: 'health', name: 'Health', emoji: '💊', budget: 100 },
            ];
        }
        
        if (savedTx) {
            this.transactions = JSON.parse(savedTx);
        }
    }

    saveToStorage() {
        localStorage.setItem('spending_vaults', JSON.stringify(this.vaults));
        localStorage.setItem('spending_transactions', JSON.stringify(this.transactions));
    }

    initEventListeners() {
        // File upload
        document.getElementById('pdfUpload').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Add vault button
        document.getElementById('addVaultBtn').addEventListener('click', () => this.showVaultModal());
        document.getElementById('cancelVault').addEventListener('click', () => this.hideVaultModal());
        document.getElementById('saveVault').addEventListener('click', () => this.createVault());
        
        // Modal close on backdrop click
        document.getElementById('vaultModal').addEventListener('click', (e) => {
            if (e.target.id === 'vaultModal') this.hideVaultModal();
        });
        
        // Export and clear
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Keyboard shortcut to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideVaultModal();
        });
    }

    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;
        
        for (const file of files) {
            if (file.type !== 'application/pdf') continue;
            
            try {
                const newTx = await this.parser.parsePDF(file);
                
                // Add transactions, avoiding duplicates
                for (const tx of newTx) {
                    const exists = this.transactions.find(t => 
                        t.date === tx.date && 
                        t.amount === tx.amount && 
                        t.description === tx.description
                    );
                    if (!exists) {
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
        event.target.value = ''; // Reset input
    }

    render() {
        this.renderVaults();
        this.renderUncategorized();
        this.updateSummary();
        this.attachDragListeners();
    }

    renderVaults() {
        const grid = document.getElementById('vaultsGrid');
        grid.innerHTML = '';
        
        for (const vault of this.vaults) {
            const vaultTx = this.transactions.filter(t => t.vault === vault.id && t.type === 'debit');
            const total = vaultTx.reduce((sum, t) => sum + t.amount, 0);
            const pct = vault.budget ? Math.min((total / vault.budget) * 100, 100) : 0;
            const overBudget = vault.budget && total > vault.budget;
            const color = overBudget ? '#ef4444' : '#22c55e';
            
            const vaultEl = document.createElement('div');
            vaultEl.className = 'vault';
            vaultEl.innerHTML = `
                <div class="vault-header">
                    <div class="vault-title">
                        <span class="vault-emoji">${vault.emoji}</span>
                        <span class="vault-name">${vault.name}</span>
                    </div>
                    <div class="vault-total" style="color: ${color}">$${total.toFixed(2)}</div>
                </div>
                ${vault.budget ? `
                    <div class="vault-budget">
                        Budget: $${vault.budget} 
                        ${overBudget ? `(⚠️ $${(total - vault.budget).toFixed(2)} over)` : `($${(vault.budget - total).toFixed(2)} left)`}
                    </div>
                    <div class="vault-progress">
                        <div class="vault-progress-fill" style="width: ${pct}%; background: ${color}"></div>
                    </div>
                ` : ''}
                <div class="vault-bubbles" data-vault="${vault.id}">
                    ${vaultTx.map(tx => this.renderBubble(tx)).join('')}
                </div>
                <div class="vault-actions">
                    <button class="vault-action-btn" onclick="app.editVault('${vault.id}')">✏️ Edit</button>
                    <button class="vault-action-btn" onclick="app.deleteVault('${vault.id}')">🗑️ Delete</button>
                </div>
            `;
            grid.appendChild(vaultEl);
        }
    }

    renderUncategorized() {
        const container = document.getElementById('uncategorized');
        const uncategorized = this.transactions.filter(t => !t.vault);
        
        container.innerHTML = uncategorized.map(tx => this.renderBubble(tx)).join('');
        document.getElementById('uncategorizedCount').textContent = uncategorized.length;
    }

    renderBubble(tx) {
        const isCredit = tx.type === 'credit';
        return `
            <div class="bubble" draggable="true" data-tx-id="${tx.id}">
                <span class="source-badge ${tx.source}">${tx.source === 'bank' ? 'Bank' : tx.source === 'amex' ? 'Amex' : 'Other'}</span>
                <span class="desc" title="${tx.description}">${tx.description}</span>
                <span class="amount ${isCredit ? 'credit' : ''}">${isCredit ? '+' : '-'}$${tx.amount.toFixed(2)}</span>
            </div>
        `;
    }

    attachDragListeners() {
        // Bubbles
        document.querySelectorAll('.bubble').forEach(bubble => {
            bubble.addEventListener('dragstart', (e) => this.handleDragStart(e));
            bubble.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
        
        // Drop zones (vault-bubbles containers and uncategorized)
        document.querySelectorAll('.vault-bubbles, #uncategorized').forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    handleDragStart(e) {
        const txId = e.target.dataset.txId;
        this.draggedTx = this.transactions.find(t => t.id === txId);
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', txId);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        this.draggedElement = null;
        this.draggedTx = null;
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
        e.currentTarget.classList.remove('drag-over');
        
        const txId = e.dataTransfer.getData('text/plain');
        const tx = this.transactions.find(t => t.id === txId);
        if (!tx) return;
        
        const vaultId = e.currentTarget.dataset.vault;
        tx.vault = vaultId === 'uncategorized' ? null : vaultId;
        
        this.saveToStorage();
        this.render();
    }

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

    deleteVault(vaultId) {
        if (!confirm('Delete this vault? Transactions will become uncategorized.')) return;
        
        // Move transactions back to uncategorized
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
}

// Initialize app
const app = new SpendingTracker();
