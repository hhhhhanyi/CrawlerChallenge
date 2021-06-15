const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const dbUpload = require('./util')

const getBlockChainInfo = async () => {
    axios.get('https://www.blockchain.com/btc/blocks')
        .then((response) => {
            const $ = cheerio.load(response.data)
            $('.sc-1g6z4xm-0').map(async (i, chainDiv) => {
                while (i > 9 || i < 6) {
                    return
                }

                const currentTimestamp = Date.now()
                const subPages = []
                const chainInfo = {
                    Timestamp: currentTimestamp,
                    SubPages: subPages
                }
                $(chainDiv).contents().map((j, contentDiv) => {
                    const linkHost = 'https://www.blockchain.com'
                    const link = $(contentDiv).find('a').attr('href')
                    if (link) {
                        subPages.push(linkHost + link)
                    }
                    const regex = ['(Height)(.*)', '(Hash)(.*)', '(Mined)(.*)', '(Miner)(.*)', '(Size)(.*)']
                    const infoContent = $(contentDiv).text().match(regex[j])
                    if (infoContent) {
                        chainInfo[infoContent[1]] = infoContent[2]
                    }
                })

                const transInfoList = []
                let page = 1
                while (page <= 5) {
                    try {
                        transInfoList.push(...await getTransInfo(chainInfo.SubPages[0] + `?page=${page}`))
                    } catch (error) {
                        console.log(error)
                        break
                    }
                    page++
                }
                chainInfo.TransactionInfo = transInfoList

                fs.writeFileSync(`data/${chainInfo.Height}_${currentTimestamp}.json`, JSON.stringify(chainInfo))
                await dbUpload(chainInfo.Height, chainInfo)
            })
        })
        .catch((error) => {
            console.log(error)
        })
}

const getTransInfo = async (url) => {
    const transInfoList = []
    await axios.get(url)
        .then((response) => {
            const $ = cheerio.load(response.data)

            $('.sc-1fp9csv-0').map((i, transDiv) => {
                const transInfo = {}
                $(transDiv).contents().map((j, contentDiv) => {
                    if (j === 0) {
                        const infoContent = $(contentDiv).text().match(/(Hash)(.*)(Date)(.*)/)
                        if (infoContent) {
                            transInfo[infoContent[1]] = infoContent[2]
                            transInfo[infoContent[3]] = infoContent[4]
                        }
                    } else if (j === 1) {
                        const infoContent = $(contentDiv).text().match(/(From)(.*)(To)(.*)/)
                        if (infoContent) {
                            transInfo[infoContent[1]] = infoContent[2]
                            transInfo[infoContent[3]] = infoContent[4]
                        }
                    } else if (j === 2) {
                        const infoContent = $(contentDiv).text().match(/(Fee)(.* BTC)(\(.+\))(Amount)(.*BTC)/)
                        if (infoContent) {
                            transInfo[infoContent[1]] = infoContent[2]
                            transInfo.FeeDetails = infoContent[3]
                            transInfo[infoContent[4]] = infoContent[5]
                        }
                    }
                })
                transInfoList.push(transInfo)
            })
        })
        .catch((error) => {
            if (error.response.status === 404) {
                throw new Error('Page Not Found')
            }
            console.log(error)
        })

    return transInfoList
}

getBlockChainInfo()
