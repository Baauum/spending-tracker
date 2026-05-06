// PDF Statement Parser for CommBank and Amex
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class StatementParser {
    constructor() {
        this.transactions = [];
    }

    async parsePDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        // Detect statement type
        if (fullText.includes('Commonwealth Bank') || fullText.includes('CommBank')) {
            return this.parseCommBank(fullText);
        } else if (fullText.includes('American Express') || fullText.includes('Qantas')) {
            return this.parseAmex(fullText);
        } else {
            // Try generic parsing
            return this.parseGeneric(fullText);
        }
    }

    parseCommBank(text) {
        const transactions = [];
        // Match patterns like: 01 Jan 2026 DESCRIPTION -$123.45 $567.89
        // or: 01 Jan 2026 DESCRIPTION $123.45 $567.89 (for credits)
        
        const lines = text.split(/\s+/);
        let i = 0;
        
        // Look for date patterns followed by transaction details
        const datePattern = /^(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})?/i;
        const amountPattern = /-?\$[\d,]+\.\d{2}/g;
        
        // Split text into potential transaction chunks
        const chunks = text.split(/(?=\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/gi);
        
        for (const chunk of chunks) {
            const dateMatch = chunk.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})?/i);
            if (!dateMatch) continue;
            
            const amounts = chunk.match(amountPattern);
            if (!amounts || amounts.length === 0) continue;
            
            const day = dateMatch[1].padStart(2, '0');
            const month = this.monthToNum(dateMatch[2]);
            
            // FIX: Use current year as default, not hardcoded 2026
            let year = dateMatch[3];
            if (!year) {
                const currentYear = new Date().getFullYear();
                year = String(currentYear);
            }
            const date = `${year}-${month}-${day}`;
            
            // Get description (text between date and first amount)
            const firstAmountIdx = chunk.indexOf(amounts[0]);
            let desc = chunk.substring(dateMatch[0].length, firstAmountIdx).trim();
            desc = desc.replace(/\s+/g, ' ').substring(0, 50);
            
            if (!desc || desc.length < 3) continue;
            
            // First amount is the transaction amount
            const amountStr = amounts[0].replace(/[$,]/g, '');
            const amount = Math.abs(parseFloat(amountStr));
            const isCredit = !amounts[0].startsWith('-') && 
                (desc.toLowerCase().includes('transfer from') || 
                 desc.toLowerCase().includes('salary') ||
                 desc.toLowerCase().includes('return') ||
                 desc.toLowerCase().includes('refund'));
            
            if (amount > 0 && amount < 100000) { // Sanity check
                transactions.push({
                    id: this.generateId(),
                    date,
                    description: desc,
                    amount,
                    type: isCredit ? 'credit' : 'debit',
                    source: 'bank',
                    vault: null
                });
            }
        }
        
        return this.deduplicateTransactions(transactions);
    }

    parseAmex(text) {
        const transactions = [];
        
        // Amex format: December 30 FirstParking... 21.00
        // or: January 1 DESCRIPTION 35.70
        const chunks = text.split(/(?=(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2})/gi);
        
        for (const chunk of chunks) {
            const dateMatch = chunk.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/i);
            if (!dateMatch) continue;
            
            const amountMatch = chunk.match(/(\d{1,3}(?:,\d{3})*\.\d{2})\s*(?:CR)?$/);
            if (!amountMatch) continue;
            
            const month = this.monthToNum(dateMatch[1]);
            const day = dateMatch[2].padStart(2, '0');
            
            // FIX: Determine year more intelligently
            // Use current year as base, but if month is December and we're before December,
            // it's likely last year's December. If month is January-November and we're after that month,
            // it could be current or last year depending on context.
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const txMonth = parseInt(month);
            
            let year = currentYear;
            // If the transaction month is December and we're in Jan-Nov, it's likely last year's December
            if (txMonth === 12 && currentMonth < 12) {
                year = currentYear - 1;
            }
            // If the transaction month is in the future relative to current month, it's likely last year
            else if (txMonth > currentMonth) {
                year = currentYear - 1;
            }
            
            const date = `${year}-${month}-${day}`;
            
            // Get description
            const dateEnd = chunk.indexOf(dateMatch[2]) + dateMatch[2].length;
            const amountStart = chunk.lastIndexOf(amountMatch[1]);
            let desc = chunk.substring(dateEnd, amountStart).trim();
            desc = desc.replace(/\s+/g, ' ').substring(0, 50);
            
            if (!desc || desc.length < 3) continue;
            
            const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
            const isCredit = chunk.includes(' CR') || desc.toLowerCase().includes('payment received');
            
            if (amount > 0 && amount < 100000) {
                transactions.push({
                    id: this.generateId(),
                    date,
                    description: desc,
                    amount,
                    type: isCredit ? 'credit' : 'debit',
                    source: 'amex',
                    vault: null
                });
            }
        }
        
        return this.deduplicateTransactions(transactions);
    }

    parseGeneric(text) {
        // Fallback parser for unknown formats
        const transactions = [];
        const amountPattern = /-?\$?([\d,]+\.\d{2})/g;
        const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g;
        
        // Very basic: look for lines with dates and amounts
        const lines = text.split('\n');
        for (const line of lines) {
            const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
            const amountMatch = line.match(/-?\$?([\d,]+\.\d{2})/);
            
            if (dateMatch && amountMatch) {
                const year = dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3];
                const date = `${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
                const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
                
                // Extract description (everything except date and amount)
                let desc = line
                    .replace(dateMatch[0], '')
                    .replace(amountMatch[0], '')
                    .trim()
                    .substring(0, 50);
                
                if (desc && amount > 0 && amount < 100000) {
                    transactions.push({
                        id: this.generateId(),
                        date,
                        description: desc,
                        amount,
                        type: 'debit',
                        source: 'other',
                        vault: null
                    });
                }
            }
        }
        
        return transactions;
    }

    monthToNum(month) {
        const months = {
            'jan': '01', 'january': '01',
            'feb': '02', 'february': '02',
            'mar': '03', 'march': '03',
            'apr': '04', 'april': '04',
            'may': '05',
            'jun': '06', 'june': '06',
            'jul': '07', 'july': '07',
            'aug': '08', 'august': '08',
            'sep': '09', 'september': '09',
            'oct': '10', 'october': '10',
            'nov': '11', 'november': '11',
            'dec': '12', 'december': '12'
        };
        return months[month.toLowerCase()] || '01';
    }

    generateId() {
        return 'tx_' + Math.random().toString(36).substr(2, 9);
    }

    deduplicateTransactions(transactions) {
        const seen = new Set();
        return transactions.filter(tx => {
            const key = `${tx.date}_${tx.amount}_${tx.description.substring(0, 20)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}

window.StatementParser = StatementParser;
