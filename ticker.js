// ticker.js
class StockTicker {
    constructor() {
        this.stocks = ['DIA', 'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
        this.tickerContent = document.getElementById('tickerContent');
        this.cache = new Map();
        this.isUpdating = false;
    }

    formatStockData(symbol, price, change, percentChange) {
        const displayName = {
            'DIA': 'DOW',
            'SPY': 'S&P 500',
            'QQQ': 'NASDAQ'
        }[symbol] || symbol;

        const isPositive = change >= 0;
        return `
            <div class="ticker-item">
                <span class="ticker-symbol">${displayName}</span>
                <span class="ticker-price">$${price.toFixed(2)}</span>
                <span class="ticker-change ${isPositive ? 'price-up' : 'price-down'}">
                    ${isPositive ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)
                </span>
            </div>
        `;
    }

    async fetchWithDelay(symbol) {
        // Add a 13-second delay between requests
        await new Promise(resolve => setTimeout(resolve, 13000));

        try {
            const response = await fetch(
                `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${config.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
        }
    }

    async updateTickerData() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            let tickerHTML = '';

            // Update one stock at a time with delay
            for (const symbol of this.stocks) {
                // Use cached data if available
                if (this.cache.has(symbol)) {
                    tickerHTML += this.cache.get(symbol);
                }

                const data = await this.fetchWithDelay(symbol);
                if (data?.results?.[0]) {
                    const result = data.results[0];
                    const price = result.c;
                    const change = result.c - result.o;
                    const percentChange = (change / result.o) * 100;

                    const stockHtml = this.formatStockData(symbol, price, change, percentChange);
                    this.cache.set(symbol, stockHtml);

                    // Update ticker with all available data
                    tickerHTML = Array.from(this.cache.values()).join('');
                    this.tickerContent.innerHTML = tickerHTML.repeat(3);
                }
            }
        } catch (error) {
            console.error('Error updating ticker:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    async initialize() {
        // Initial update
        await this.updateTickerData();

        // Update every 5 minutes to stay within rate limits
        setInterval(() => this.updateTickerData(), 300000);
    }
}

// Initialize ticker when page loads
document.addEventListener('DOMContentLoaded', () => {
    const ticker = new StockTicker();
    ticker.initialize();
});