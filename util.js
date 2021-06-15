const { Firestore } = require('@google-cloud/firestore')

const projectId = process.env.PROJECT_ID
const collectionName = 'blockChain'
const firestore = new Firestore({
    projectId,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})
const db = firestore.collection(collectionName)

const dbUpload = async (doc, data) => {
    db.doc(doc).set(data, { merge: true }).then(() => {
        console.log('upload success!')
    }).catch(error => {
        console.log(error)
    })
}

module.exports = dbUpload
