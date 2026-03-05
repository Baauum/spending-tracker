// Enhanced 65+ Category System for Spending Tracker
// Drop-in replacement for getDefaultVaults()

function getDefaultVaultsEnhanced() {
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

// Auto-categorization rules for Australian merchants
function getEnhancedAutoCategorization() {
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
        'myer': 'shopping',
        'david jones': 'shopping',
        
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

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getDefaultVaultsEnhanced, getEnhancedAutoCategorization };
}
