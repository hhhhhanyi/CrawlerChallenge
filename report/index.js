const express = require('express')
const app = express()
const { Firestore } = require('@google-cloud/firestore')
const moment = require('moment')
const _ = require('lodash')
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

const projectId = process.env.PROJECT_ID
const firestore = new Firestore({
    projectId,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})

app.post('/chart', async (req, res) => {
    const result = await getTransFee(req.body.height)
    res.send(result)
})

app.get('/heightList', async (req, res) => {
    const result = await gatHeightList()
    res.send(result)
})

const getTransFee = async (height) => {
    let db = firestore.collection('BlockTransactions')
    if (height !== 'All') {
        db = db.where('Height', '=', height)
    }
    const result = await db.get().then(querySnapshot => {
        return querySnapshot.docs.map(doc => {
            return {
                Hash: doc.data().Hash,
                Fee: doc.data().Fee,
                Date: doc.data().Date
            }
        })
    })

    const groupedResults = await _.chain(result)
        .groupBy((result) => moment(result.Date).format('YYYY-MM-DD HH:mm'))
        .map((entries, day) => [day, _.meanBy(entries, entry => entry.Fee)])
        .fromPairs()
        .value()

    return groupedResults
}

const gatHeightList = async () => {
    const db = firestore.collection('BlockChain')
    const result = await db.get().then(querySnapshot => {
        return querySnapshot.docs.map(doc => { return doc.id })
    })
    return result
}

app.use('/', express.static('public'))
app.listen(3000)
