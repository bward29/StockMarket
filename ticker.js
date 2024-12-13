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
                <span class="ticker-price">$${Number(price).toFixed(2)}</span>
                <span class="ticker-change ${isPositive ? 'price-up' : 'price-down'}">
                    ${isPositive ? '+' : ''}${Number(change).toFixed(2)} (${Number(percentChange).toFixed(2)}%)
                </span>
            </div>
        `;
    }

    async fetchStockData(symbol) {
        try {
            const response = await fetch(
                `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${config.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    price: result.c,
                    change: result.c - result.o,
                    percentChange: ((result.c - result.o) / result.o) * 100
                };
            }
            throw new Error('No data available');
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
        }
    }

    async updateTickerData() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            for (const symbol of this.stocks) {
                const data = await this.fetchStockData(symbol);
                await new Promise(resolve => setTimeout(resolve, 12000)); // Rate limit delay

                if (data) {
                    const html = this.formatStockData(symbol, data.price, data.change, data.percentChange);
                    this.cache.set(symbol, html);

                    // Update display with all available data
                    const tickerHTML = Array.from(this.cache.values()).join('');
                    if (this.tickerContent) {
                        this.tickerContent.innerHTML = tickerHTML.repeat(3);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating ticker:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    async initialize() {
        await this.updateTickerData();
        // Update every 5 minutes
        setInterval(() => this.updateTickerData(), 300000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ticker = new StockTicker();
    ticker.initialize();
});