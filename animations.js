class MoneyAnimation {
    static createMoneyContainer() {
        const container = document.createElement('div');
        container.className = 'money-animation-container';
        document.body.appendChild(container);
        return container;
    }

    static createMoneyBill(container, x) {
        const money = document.createElement('div');
        money.className = 'money';
        money.textContent = '$';
        money.style.left = `${x}px`;
        container.appendChild(money);

        money.addEventListener('animationend', () => {
            money.remove();
        });
    }

    static animate() {
        const container = this.createMoneyContainer();
        const numberOfBills = 20;

        for (let i = 0; i < numberOfBills; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                this.createMoneyBill(container, x);
            }, i * 100);
        }

        setTimeout(() => {
            container.remove();
        }, 4000);
    }
}