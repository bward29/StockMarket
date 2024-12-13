class StockDashboard {
    static showLoading() {
        document.getElementById('loadingIndicator')?.classList.remove('hidden');
        document.getElementById('stockInfo')?.classList.add('hidden');
        document.getElementById('chartContainer')?.classList.add('hidden');
    }

    static hideLoading() {
        document.getElementById('loadingIndicator')?.classList.add('hidden');
    }

    static formatPrice(price) {
        return `$${parseFloat(price).toFixed(2)}`;
    }

    static updatePriceDisplay(result) {
        const currentPrice = document.getElementById('currentPrice');
        const dayChange = document.getElementById('dayChange');
        const volume = document.getElementById('volume');

        const change = result.c - result.o;
        const percentChange = (change / result.o) * 100;

        currentPrice.textContent = this.formatPrice(result.c);
        dayChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
        dayChange.style.color = change >= 0 ? '#22c55e' : '#ef4444';
        volume.textContent = result.v.toLocaleString();
    }
}

async function searchStock() {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase();
    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }

    StockDashboard.showLoading();

    try {
        const data = await PolygonAPI.fetchStockData(symbol);

        if (data.results && data.results.length > 0) {
            StockDashboard.updatePriceDisplay(data.results[0]);
            document.getElementById('stockInfo').classList.remove('hidden');

            // Get historical data
            const toDate = new Date().toISOString().split('T')[0];
            const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const historyData = await PolygonAPI.getHistoricalData(symbol, fromDate, toDate);

            if (historyData.results) {
                StockChart.createChart(symbol, historyData.results);
                document.getElementById('chartContainer').classList.remove('hidden');
            }

            MoneyAnimation.animate();
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: Could not fetch data for ${symbol}. Please verify the symbol is correct and try again.`);
    } finally {
        StockDashboard.hideLoading();
    }
}

// Add Enter key support
document.getElementById('stockSymbol').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        searchStock();
    }
});