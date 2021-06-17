const { Firestore } = require('@google-cloud/firestore')
const moment = require('moment')

const projectId = process.env.PROJECT_ID
const firestore = new Firestore({
    projectId,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})

const dbUpload = async (collectionName, docName, data) => {
    const db = firestore.collection(collectionName)
    db.doc(docName).set(data, { merge: true }).then(() => {
        console.log(`${collectionName}_${docName} upload success!`)
    }).catch(error => {
        throw Error({
            type: 'firestore error',
            error
        })
    })
}

const transTransInfo = (transInfo, index, content) => {
    if (index === 0) {
        const infoContent = content.match(/(Hash)(.*)(Date)(.*)/)
        if (infoContent) {
            transInfo[infoContent[1]] = infoContent[2]
            transInfo[infoContent[3]] = Date.parse(infoContent[4])
        }
    } else if (index === 2) {
        const infoContent = content.match(/(Fee)(.* BTC)(\(.+\))(Amount)(.*BTC)/)
        if (infoContent) {
            transInfo[`${infoContent[1]}`] = parseStringElement(infoContent[2], / BTC$/, 'float')
            transInfo.FeeDetails = infoContent[3]
            transInfo[`${infoContent[4]}`] = parseStringElement(infoContent[5], / BTC$/, 'float')
        }
    }

    return transInfo
}


const transChainsInfo = (chainInfo, content, link, index) => {
    const regex = ['(Height)(.*)', '(Hash)(.*)', '(Mined)(.*)', '(Miner)(.*)', '(Size)(.*)']
    const infoContent = content.match(regex[index])
    if (infoContent) {
        chainInfo[infoContent[1]] = infoContent[2]
    }

    if (link) {
        chainInfo.SubPages.push('https://www.blockchain.com' + link)
    }
    return chainInfo
}

const parseStringElement = (element, regex, type) => {
    try {
        if (type === 'float') {
            return parseFloat(element.replace(regex, ''))
        } else {
            return element.replace(regex, '')
        }
    } catch (e) {
        return element
    }
}

const parseTimeElement = (current, element) => {
    try {
        if (!element.match(/[0-9]{4}-{0-9}{2}-{0-9}{2} {0-9}{2}:{0-9}{2}/)) {
            const DateTime = element.split(' ')
            element = moment(current).subtract(parseInt(DateTime[0]), DateTime[1]).format("YYYY-MM-DD hh:mm")
        }
        return element
    } catch (e) {
        return element
    }
}

module.exports = { dbUpload, transTransInfo, transChainsInfo, parseTimeElement }
