# 💰 Spending Tracker

A visual, drag-and-drop spending categorization tool. Upload bank statements and organize transactions into budget vaults.

![Screenshot](screenshot.png)

## Features

- 📄 **PDF Upload** - Supports CommBank and Amex statements
- 🫧 **Bubble Transactions** - Each transaction is a draggable bubble
- 🏦 **Budget Vaults** - Create custom categories with monthly budgets
- 📊 **Visual Progress** - Track spending against budgets
- 💾 **Auto-Save** - Categories saved to browser storage
- 📋 **CSV Export** - Export categorized transactions

## Usage

1. Open `index.html` in your browser
2. Click "Upload Statement" and select PDF(s)
3. Drag transaction bubbles into vault categories
4. Track your spending against budgets

## Supported Statements

- Commonwealth Bank (Smart Access, etc.)
- American Express (Qantas, etc.)
- Generic statements (basic parsing)

## Tech Stack

- Vanilla JavaScript (no frameworks)
- PDF.js for PDF parsing
- LocalStorage for persistence
- CSS Grid + Flexbox

## Development

Just open `index.html` - no build step required.

To add new statement formats, edit `js/parser.js`.

## License

MIT
