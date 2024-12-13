// config.js
const config = {
    apiKey: 'wLWFrAyfhxxsT2gy1Aqxz4hlxS8Ao0GS',
    baseUrl: 'https://api.polygon.io'
};

class PolygonAPI {
    static async getStockData(symbol) {
        try {
            // Get today's date
            const today = new Date().toISOString().split('T')[0];

            // First, try getting the latest trade
            const tradeUrl = `${config.baseUrl}/v2/last/trade/${symbol}?apiKey=${config.apiKey}`;
            const tradeResponse = await fetch(tradeUrl);
            const tradeData = await tradeResponse.json();

            if (!tradeResponse.ok) {
                throw new Error(`API Error: ${tradeData.error || 'Unknown error'}`);
            }

            if (tradeData.status === 'ERROR') {
                throw new Error(tradeData.error || 'API Error');
            }

            return tradeData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getDailyData(symbol) {
        try {
            const url = `${config.baseUrl}/v2/aggs/ticker/${symbol}/prev?apiKey=${config.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API Error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getHistoricalData(symbol, from, to) {
        try {
            const url = `${config.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?apiKey=${config.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API Error: ${data.error || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Updated app.js search function
async function searchStock() {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase();
    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }

    StockDashboard.showLoading();

    try {
        // Get current stock data
        const stockData = await PolygonAPI.getStockData(symbol);

        if (stockData.results) {
            const price = stockData.results.p;
            document.getElementById('currentPrice').textContent = `$${price.toFixed(2)}`;
            document.getElementById('volume').textContent = stockData.results.s.toLocaleString();

            // Get daily data for change calculation
            const dailyData = await PolygonAPI.getDailyData(symbol);
            if (dailyData.results && dailyData.results.length > 0) {
                const dayResult = dailyData.results[0];
                const change = dayResult.c - dayResult.o;
                const percentChange = (change / dayResult.o) * 100;

                const dayChangeElement = document.getElementById('dayChange');
                dayChangeElement.textContent = `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
                dayChangeElement.style.color = change >= 0 ? '#22c55e' : '#ef4444';
            }

            // Show the stock info section
            document.getElementById('stockInfo').classList.remove('hidden');

            // Get and display historical data
            const toDate = new Date().toISOString().split('T')[0];
            const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const historicalData = await PolygonAPI.getHistoricalData(symbol, fromDate, toDate);

            if (historicalData.results) {
                StockChart.createChart(symbol, historicalData.results);
                document.getElementById('chartContainer').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        alert(`Error: Could not fetch data for ${symbol}. ${error.message}`);
    } finally {
        StockDashboard.hideLoading();
    }
}