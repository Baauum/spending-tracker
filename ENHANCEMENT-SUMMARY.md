# 🎯 Spending Tracker Enhancement - March 2026

## What Changed

### From: 10 Basic Categories
```
Housing, Groceries, Dining Out, Transport, Shopping, 
Subscriptions, Insurance, Entertainment, Travel, Health
```

### To: 65+ Comprehensive Categories

## 📊 New Category System

### 🏠 Housing & Home (5 categories)
- Rent/Mortgage
- Utilities
- Internet & Phone
- Home Maintenance
- Council Rates

### 🛒 Groceries & Food (6 categories)
- Groceries
- Dining Out
- Coffee & Cafes
- Takeaway & Delivery
- Alcohol & Drinks
- Snacks & Treats

### 🚗 Transport (5 categories)
- Fuel
- Car Rego
- Car Maintenance
- Public Transport
- Rideshare & Taxis

### 🛍️ Shopping (7 categories)
- Clothing
- Electronics
- Home Goods
- Gifts
- Books
- Hobbies
- Beauty & Personal Care

### 💊 Health & Fitness (5 categories)
- Medical
- Pharmacy
- Gym & Fitness
- Medicare
- Dental

### 🎉 Entertainment (6 categories)
- Entertainment
- Streaming
- Music
- Movies & Cinema
- Events & Concerts
- Gaming

### 📱 Subscriptions & Services (5 categories)
- Subscriptions
- Software & Apps
- Cloud Storage
- Memberships
- Professional Services

### 🛡️ Insurance (4 categories)
- Health Insurance
- Car Insurance
- Home Insurance
- Life Insurance

### 📈 Investment & Savings (5 categories)
- Savings
- Investments
- Crypto
- Stocks & ETF
- Superannuation

### ✈️ Travel (4 categories)
- Flights
- Accommodation
- Travel Other
- Activities & Tours

### 🎓 Education (3 categories)
- Education
- Courses & Training
- Books & Learning

### 🐾 Pets (3 categories)
- Pet Food
- Vet
- Pet Supplies

### 💼 Business (3 categories)
- Business Expenses
- Tax
- Accounting

### 🎯 Other (3 categories)
- Charity & Donations
- Fees & Charges
- Other

## 🤖 Auto-Categorization

Now automatically categorizes transactions based on merchant names:

### Groceries
Woolworths, Coles, Aldi, IGA, Foodland, Harris Farm

### Dining & Cafes
McDonald's, KFC, Hungry Jack's, Domino's, Uber Eats, DoorDash, Menulog, Deliveroo, Starbucks, Gloria Jean's

### Transport
Shell, Caltex, BP, Ampol, 7-Eleven, Uber, Ola, DiDi, Opal, Myki

### Utilities & Services
Telstra, Optus, Vodafone, TPG, Aussie Broadband, Origin Energy, AGL, Energy Australia, Sydney Water

### Shopping
Kmart, Target, Big W, Bunnings, IKEA, JB Hi-Fi, Harvey Norman, The Good Guys, Officeworks, Cotton On, Uniqlo, Zara, H&M, Myer, David Jones

### Subscriptions
Netflix, Spotify, Apple, Amazon Prime, Disney+, YouTube Premium, Stan, Binge, Kayo, Adobe, Microsoft 365, Dropbox

### Health & Fitness
Chemist Warehouse, Priceline, Terry White, Amcal, Anytime Fitness, Snap Fitness, F45, Medibank, Bupa, HCF, NIB

### Entertainment
Hoyts, Event Cinemas, Village Cinemas, Steam, PlayStation, Xbox, Nintendo

### Alcohol
Dan Murphy's, BWS, Liquorland, Vintage Cellars, First Choice

### Insurance & Government
NRMA, RACV, AAMI, Suncorp, Allianz, VicRoads, Service NSW, Australia Post

### Books & Education
Booktopia, Dymocks, QBD, Udemy, Coursera, Skillshare

**Total: 100+ merchant patterns for Australian banks**

## Benefits

✅ **Complete Financial Picture** - Every dollar tracked with purpose  
✅ **Australian Context** - Built for AU banking & merchants  
✅ **Auto-Categorization** - No more manual sorting  
✅ **Investment Tracking** - Monitor wealth building separately  
✅ **Trend Analysis** - Identify spending patterns across granular categories  
✅ **Better Budgeting** - Set specific budgets for coffee, fuel, subscriptions, etc.  

## What Stays the Same

- Same drag-and-drop interface
- Same file upload process
- Same charts and visualizations
- Same cloud sync with Firebase
- All your existing data is preserved

## Next Steps

1. **Upload new bank statements** - Auto-categorization will kick in
2. **Set budgets** - Click any category to set monthly budgets
3. **Review categories** - Adjust default budgets to match your lifestyle
4. **Train the system** - Use "Learn from categorized" to create custom rules

## Technical Details

- Updated `getDefaultVaults()` with 65 categories
- Added `getAutoCategorization()` with 100+ merchant patterns
- Enhanced `matchRule()` to check auto-rules after user rules
- Backward compatible - old data works perfectly
- No breaking changes to existing functionality

---

**Version:** 2.0  
**Date:** March 5, 2026  
**Deployed:** https://baauum.github.io/spending-tracker/
