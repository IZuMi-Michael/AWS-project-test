import { inToPost, evaluateOutputArr } from './StackTest.js'
import express from 'express'

const app = express()

app.set('port', process.env.PORT || 80)
app.set('host', process.env.HOST || '127.0.0.1')

app.get('/calc', (req, res) => {
    // console.log(Object.keys(req.query))
    // URI構成要素へ変換
    const encodedQuery = encodeURIComponent(Object.keys(req.query))
    // console.log(encodedQuery)
    // '%20'を'+'へ変換
    const decodedQuery = decodeURIComponent(encodedQuery.replace(/\%20/g, '+'))
    // console.log(decodedQuery)
　　 
    // '0~9,+,-,*,/,()'を含めない正規表現
    const regexNeg = new RegExp('[^-0-9()+*/]')

    // 分離演算符と数字
    const operatorSeparator = (string) => { 
        return string.split(/([-()+*/])/g) 
    }

    if (regexNeg.test(decodedQuery)) {
        res.send('ERROR\n').end()
    } else {
        let parsedInfix = operatorSeparator(decodedQuery).filter(i => i)
        console.log(parsedInfix)
        let outputArr = inToPost(parsedInfix)
        // console.log(outputArr)
        let result = evaluateOutputArr(outputArr)
        res.send(`${result}\n`).end()
    }
})

// listen port
app.listen(app.get('port'), () => {
    console.log(`listening to ${app.settings.host} at port ${app.settings.port}...`)
})