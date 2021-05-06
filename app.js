import { inToPost, evaluateOutputArr} from './Stack.js'
import { Stock, addProduct } from './helper.js'
import express from 'express'

const app = express()

app.set('port', process.env.PORT || 80)
app.set('host', process.env.HOST || '127.0.0.1')

// '/' access check
app.get('/', (req, res) => {
    res.send('AMAZON\n').end()
})

// '/secret' access check
app.get('/secret', (req, res) => {
    const serverType = res.getHeaders()['x-powered-by']
    const authFailedMessage = `
    <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
    <html><head>
    <title>401 Authorization Required</title>
    </head><body>
    <h1>Authorization Required</h1>
    <p>This server could not verify that you
    are authorized to access the document
    requested.  Either you supplied the wrong
    credentials (e.g., bad password), or your
    browser doesn't understand how to supply
    the credentials required.</p>
    <hr>
    <address>${serverType} (Amazon) Server at ${app.settings.host} Port ${app.settings.port}</address>
    </body></html>`
    
    const auth = { login: 'amazon', password: 'candidate' }
    // parse login & password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    // verify login & password 
    login && password && login === auth.login && password === auth.password 
        ? res.send('SUCCESS\n').end() 
        : res.status(401).send(authFailedMessage).end()
})

// '/calc' access check
app.get('/calc', (req, res) => {
    // console.log(Object.keys(req.query))
    // URI構成要素へ変換
    const encodedQuery = encodeURIComponent(Object.keys(req.query))
    // console.log(encodedQuery)
    // '%20'を'+'へ変換
    const decodedQuery = decodeURIComponent(encodedQuery.replace(/\%20/g, '+'))
    // console.log(decodedQuery)

    // '0~9,+,-,*,/,()'を含めない正規表現
    const regex = new RegExp('[^-0-9()+*/]')
    //
    const regexNeg = new RegExp('^(-[0-9]+)')
    const regexNegMatch = decodedQuery.match(regexNeg)

    const regexNegFormatter = (arr) => {
        const negInt = arr[0]
        return decodedQuery.replace(regexNeg, `(0${negInt})`)
    }

    // 分離演算符と数字
    const spaceSeparator = (string) => { 
        return string.split(/([-()+*/])/g) 
    } 

    if (regex.test(decodedQuery)) {
        res.send('ERROR\n').end()
    } else {
        let spaceSeparatedInfix = spaceSeparator((regexNegMatch) ? regexNegFormatter(regexNegMatch) : decodedQuery)
        let parsedInfix = spaceSeparatedInfix.filter(i => i)
        console.log(parsedInfix)
        let outputArr = inToPost(parsedInfix)
        // console.log(outputArr)
        let result = evaluateOutputArr(outputArr)
        res.send(`${result}\n`).end()
    }
})

// '/stocker' access check
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
        } else if (parameter.name.length > 8 ) {
            res.send('ERROR\n').end()
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
        } else if (parameter.name.length > 8 ) {
            res.send('ERROR\n').end()
        } else if (parameter.price <= 0) {
            res.send('ERROR\n').end()
        } else if (parameter.amount) {
            if (!(parameter.amount > stockTable.names[parameter.name].amount)) {
                stockTable.addSales(!parameter.price ? 0 : parameter.price, parameter.amount)
                stockTable.names[parameter.name].amount -= Number(parameter.amount)
            } else {
                res.send('ERROR\n').end()
            }
        } else {
            stockTable.addSales(!parameter.price ? 0 : parameter.price, 1)
            stockTable.names[parameter.name].amount -= 1
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