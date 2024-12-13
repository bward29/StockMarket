class StockTicker {
    constructor() {
        // Reduced number of stocks to avoid overwhelming the API
        this.stocks = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL'];
        this.tickerContent = document.getElementById('ticker-content');
        this.cache = new Map();
        this.isUpdating = false;
    }

    formatTickerItem(symbol, price, change, percentChange) {
        const displayName = {
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

    async updateTickerData() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            for (const symbol of this.stocks) {
                try {
                    // Use cached data while fetching new data
                    if (this.cache.has(symbol)) {
                        this.updateDisplay();
                    }

                    const data = await PolygonAPI.fetchStockData(symbol);

                    if (data?.results?.[0]) {
                        const result = data.results[0];
                        const price = result.c;
                        const change = result.c - result.o;
                        const percentChange = (change / result.o) * 100;

                        this.cache.set(symbol, this.formatTickerItem(symbol, price, change, percentChange));
                        this.updateDisplay();
                    }
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                }
            }
        } finally {
            this.isUpdating = false;
        }
    }

    updateDisplay() {
        if (this.tickerContent && this.cache.size > 0) {
            const tickerHTML = Array.from(this.cache.values()).join('');
            this.tickerContent.innerHTML = tickerHTML.repeat(3);
        }
    }

    async initialize() {
        await this.updateTickerData();
        // Update every 5 minutes
        setInterval(() => this.updateTickerData(), 300000);
    }
}

// Initialize ticker when page loads
document.addEventListener('DOMContentLoaded', () => {
    const ticker = new StockTicker();
    ticker.initialize();
});