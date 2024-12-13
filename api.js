class PolygonAPI {
    static requestQueue = [];
    static isProcessing = false;
    static lastRequestTime = 0;
    static MIN_REQUEST_INTERVAL = 12100; // Slightly over 12 seconds for safety

    static async enqueueRequest(url) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ url, resolve, reject });
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    static async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;

        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            const { url, resolve, reject } = this.requestQueue[0];

            const now = Date.now();
            const timeToWait = Math.max(0, this.lastRequestTime + this.MIN_REQUEST_INTERVAL - now);

            if (timeToWait > 0) {
                await new Promise(r => setTimeout(r, timeToWait));
            }

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (response.status === 429) {
                    // Wait and try again
                    await new Promise(r => setTimeout(r, this.MIN_REQUEST_INTERVAL));
                    continue;
                }

                this.lastRequestTime = Date.now();
                this.requestQueue.shift(); // Remove the processed request
                resolve(data);

            } catch (error) {
                this.requestQueue.shift();
                reject(error);
            }
        }

        this.isProcessing = false;
    }

    static async fetchStockData(symbol) {
        const url = `${config.baseUrl}/v2/aggs/ticker/${symbol}/prev?apiKey=${config.apiKey}`;
        return this.enqueueRequest(url);
    }

    static async getHistoricalData(symbol, fromDate, toDate) {
        const url = `${config.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?apiKey=${config.apiKey}`;
        return this.enqueueRequest(url);
    }
}