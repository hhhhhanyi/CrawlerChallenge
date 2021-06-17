const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment')
const { dbUpload, transTransInfo, transChainsInfo, parseTimeElement } = require('./util')

const currentTimestamp = Date.now()

const getBlockChainInfo = async () => {
    axios.get('https://www.blockchain.com/btc/blocks')
        .then((response) => {
            const $ = cheerio.load(response.data)
            const page = $('.sc-1g6z4xm-0').map((index, content) => { return content })

            // the first 10 chained blocks
            const chainContent = Object.values(page).slice(0, 10)

            chainContent.forEach(async (content) => {
                const chainInfo = {
                    Timestamp: currentTimestamp,
                    SubPages: []
                }

                $(content).contents().map((index, content) => {
                    const link = $(content).find('a').attr('href')
                    transChainsInfo(chainInfo, $(content).text(), link, index)
                })
                chainInfo.Mined = parseTimeElement(currentTimestamp, chainInfo.Mined)
                await dbUpload('BlockChain', chainInfo.Height, chainInfo)

                // the first 5 pages of each chained block
                let pageCnt = 1
                while (pageCnt <= 5) {
                    const ifPageExist = await getTransInfo(`${chainInfo.SubPages[0]}?page=${pageCnt}`, chainInfo.Height)
                    if (!ifPageExist) {
                        break
                    }
                    pageCnt++
                }
            })
        })
        .catch((error) => {
            console.log(error)
        })
}

const getTransInfo = async (url, height) => {
    axios.get(url)
        .then((response) => {
            const $ = cheerio.load(response.data)
            $('.sc-1fp9csv-0').map((index, transDiv) => {
                let transInfo = {
                    Height: height,
                    Timestamp: currentTimestamp
                }
                $(transDiv).contents().map(async (index, contentDiv) => {
                    await transTransInfo(transInfo, index, $(contentDiv).text())
                })
                await dbUpload('BlockTransactions', transInfo.Hash, transInfo)
                return true
            })
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                return false
            }
            console.log(error)
        })
}

getBlockChainInfo()
