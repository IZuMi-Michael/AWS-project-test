export class Stock {
    constructor() {
        this.names = {}
        this.sales = 0
    }
    
    addSales(price, amount = 1) {
        this.sales += price * amount
    } 
}

export const addProduct = (name, amount = 1) => ({
    [name] : {
        amount : Number(amount)
    }
})