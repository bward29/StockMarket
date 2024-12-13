// app.js
class StockDashboard {
    static async updatePriceInfo(symbol) {
        try {
            // Fetch latest trade data
            const response = await fetch(
                `${config.baseUrl}/v2/aggs/ticker/${symbol}/prev?apiKey=${config.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];

                // Update current price
                const currentPriceElement = document.getElementById('currentPrice');
                currentPriceElement.textContent = `$${result.c.toFixed(2)}`;

                // Calculate and update day change
                const dayChangeElement = document.getElementById('dayChange');
                const change = result.c - result.o;
                const percentChange = (change / result.o) * 100;
                const changeText = `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
                dayChangeElement.textContent = changeText;
                dayChangeElement.style.color = change >= 0 ? '#22c55e' : '#ef4444';

                // Update volume
                const volumeElement = document.getElementById('volume');
                volumeElement.textContent = result.v.toLocaleString();

                // Make container visible
                document.getElementById('stockInfo').classList.remove('hidden');
            } else {
                throw new Error('No data available for this symbol');
            }
        } catch (error) {
            console.error('Error fetching price data:', error);
            throw error;
        }
    }

    static showLoading() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
        document.getElementById('stockInfo').classList.add('hidden');
        document.getElementById('chartContainer').classList.add('hidden');
        document.getElementById('companyDetails').classList.add('hidden');
    }

    static hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }

    static showError(message) {
        alert(message);
    }
}

async function searchStock() {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase();
    if (!symbol) {
        StockDashboard.showError('Please enter a stock symbol');
        return;
    }

    StockDashboard.showLoading();

    try {
        // Test API connection first
        const testResponse = await fetch(`${config.baseUrl}/v2/aggs/ticker/${symbol}/prev?apiKey=${config.apiKey}`);
        const testData = await testResponse.json();

        if (testData.status === 'ERROR') {
            throw new Error(testData.error || 'API Error');
        }

        // If test is successful, proceed with full data fetch
        await StockDashboard.updatePriceInfo(symbol);

        // Get historical data for chart
        const toDate = new Date().toISOString().split('T')[0];
        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const historicalResponse = await fetch(
            `${config.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?apiKey=${config.apiKey}`
        );
        const historicalData = await historicalResponse.json();

        if (historicalData.results) {
            StockChart.createChart(symbol, historicalData.results);
            document.getElementById('chartContainer').classList.remove('hidden');
        }

    } catch (error) {
        console.error('API Error:', error);
        StockDashboard.showError(`Error: Could not fetch data for ${symbol}. Please verify the symbol is correct and try again.`);
    } finally {
        StockDashboard.hideLoading();
    }
}

// Add event listener for Enter key
document.getElementById('stockSymbol').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        searchStock();
    }
});