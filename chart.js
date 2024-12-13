// chart.js
class StockChart {
    static chart = null;

    static createChart(symbol, data) {
        const chartData = {
            labels: data.map(item => new Date(item.t).toLocaleDateString()),
            datasets: [{
                label: `${symbol} Price`,
                data: data.map(item => item.c),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = document.getElementById('priceChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: `${symbol} 30-Day Price History`
                    }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }
}