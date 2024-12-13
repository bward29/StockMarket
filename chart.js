class StockChart {
    static chart = null;

    static createChart(symbol, data) {
        const ctx = document.getElementById('priceChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.t).toLocaleDateString()),
                datasets: [{
                    label: `${symbol} Price`,
                    data: data.map(item => item.c),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `${symbol} 30-Day Price History`
                    }
                }
            }
        });
    }
}