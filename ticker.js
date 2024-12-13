// ticker.js
class StockTicker {
    constructor() {
        this.stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM'];
        this.tickerContent = document.getElementById('tickerContent');
        this.apiKey = 'wLWFrAyfhxxsT2gy1Aqxz4hlxS8Ao0GS';
    }

    async fetchStockData(symbol) {
        try {
            // Get previous day's data
            const response = await fetch(
                `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    symbol,
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

    async updateTicker() {
        try {
            // Fetch data for all stocks in parallel
            const stockDataPromises = this.stocks.map(symbol => this.fetchStockData(symbol));
            const stocksData = await Promise.all(stockDataPromises);

            // Filter out any null results from failed API calls
            const validStocksData = stocksData.filter(data => data !== null);

            if (validStocksData.length === 0) {
                console.error('No valid stock data received');
                return;
            }

            let html = '';
            validStocksData.forEach(stock => {
                const isPositive = stock.change >= 0;
                html += `
                    <div class="ticker-item">
                        <span class="ticker-symbol">${stock.symbol}</span>
                        <span class="ticker-price">$${stock.price.toFixed(2)}</span>
                        <span class="ticker-change ${isPositive ? 'price-up' : 'price-down'}">
                            ${isPositive ? '+' : ''}${stock.change.toFixed(2)} 
                            (${stock.percentChange.toFixed(2)}%)
                        </span>
                    </div>
                `;
            });

            // Duplicate content for continuous scrolling
            if (this.tickerContent) {
                this.tickerContent.innerHTML = html + html + html;
            }

        } catch (error) {
            console.error('Error updating ticker:', error);
        }
    }

    async initialize() {
        // Initial update
        await this.updateTicker();

        // Update every 60 seconds (Polygon.io free tier rate limit consideration)
        setInterval(() => this.updateTicker(), 60000);
    }

    addStock(symbol) {
        if (!this.stocks.includes(symbol)) {
            this.stocks.push(symbol);
            this.updateTicker();
        }
    }

    removeStock(symbol) {
        const index = this.stocks.indexOf(symbol);
        if (index > -1) {
            this.stocks.splice(index, 1);
            this.updateTicker();
        }
    }
}

// Initialize ticker when page loads
document.addEventListener('DOMContentLoaded', () => {
    const ticker = new StockTicker();
    ticker.initialize();
});