import { Stock, addProduct } from './helper.js'
import express from 'express'

const app = express()

app.set('port', process.env.PORT || 80)
app.set('host', process.env.HOST || '127.0.0.1')

// create data object
let stockTable = new Stock()

app.get('/stocker', (req, res) => {
    // parse req querys
    const parameter = {}
    for (let [key, value] of Object.entries(req.query)) { parameter[key] = value }
    
    // deleteAll
    if (parameter.function === 'deleteall') {
        stockTable = new Stock()
        // console.log(stockTable)
        res.send('SUCCESS\n').end()

    // addStock
    } else if (parameter.function === 'addstock') {
        if (!parameter.name || (parameter.amount && (parameter.amount <= 0 || !(Number.isInteger(+parameter.amount))))) {
            res.send('ERROR\n')
        } else {
            if (!(parameter.name in stockTable.names)) {
                stockTable.names = Object.assign(addProduct(parameter.name, parameter.amount), stockTable.names)
            } else {
                !parameter.amount
                    ? stockTable.names[parameter.name].amount += 1
                    : stockTable.names[parameter.name].amount += Number(parameter.amount)
            }
        }
        console.log(stockTable)
        res.send('SUCCESS\n').end()

    // checkStock
    } else if (parameter.function === 'checkstock') {
        if (!parameter.name) {
            // send all product list sorted by alpha
            Object.keys(stockTable.names).sort().forEach(key => {
                if (stockTable.names[key].amount != 0) {
                    res.write(`${key}: ${stockTable.names[key].amount}\n`)
                }
            })
        } else {
            // send specific product
            !(parameter.name in stockTable.names) 
                ? res.send(`${parameter.name}: 0\n`) 
                : res.send(`${parameter.name}: ${stockTable.names[parameter.name].amount}\n`)
        }
        res.end()
    
    // sell
    } else if (parameter.function === 'sell') {
        if (!parameter.name || (parameter.amount && (parameter.amount <= 0 || !(Number.isInteger(+parameter.amount))))) {
            res.send('ERROR\n').end()
        } else if (parameter.price) {
            if (parameter.price <= 0) {
                res.send('ERROR\n').end()
            } else {
                if (parameter.amount) {
                    if (!(parameter.amount > stockTable.names[parameter.name].amount)) {
                        stockTable.addSales(parameter.price, parameter.amount)
                        stockTable.names[parameter.name].amount -= Number(parameter.amount)
                    } else {
                        res.send('ERROR\n').end()
                    }
                } else {
                    stockTable.addSales(parameter.price, 1)
                    stockTable.names[parameter.name].amount -= 1
                }
            }
        }
        console.log(stockTable)
        res.send('SUCCESS\n').end()

    // checksales
    } else if (parameter.function === 'checksales') {
        if (!(Number.isInteger(stockTable.sales))) {
            res.send(`sales: ${stockTable.sales.toFixed(2)}\n`).end()
        } else {
            res.send(`sales: ${stockTable.sales}\n`).end()
        }

    // ERROR
    } else {
        res.send('ERROR\n').end()
    }
})

// listen port
app.listen(app.get('port'), () => {
    console.log(`listening to ${app.settings.host} at port ${app.settings.port}...`)
})