# Crawler Challenge

## Demo
Website: [http://34.67.89.32:30796](http://34.67.89.32:30796)
<img src="https://i.imgur.com/bEkskhg.gif" width="900"/>


## SystemFlow
### Crawler
每兩個小時定期爬取 `blockchain.com` 網站資訊，並將資料分為 `BlockChain`, `BlockTransactions` 兩個 Collection 存入 Firestore。

<img src="https://i.imgur.com/ycg1B1l.png" width="500"/>

### Report
抓取爬蟲來的 DB 資料，根據時間軸算出各分鐘的 Transactions 平均費用，並使用 EChart 畫出折線圖。可選取全部資料或分 Chain 來看。

<img src="https://i.imgur.com/Z23rfG9.png" width="500"/>

## Data Structure
使用  GCP Firestore 作為 DB，以下為建立兩個 Collection 的 schema。
### Collection: BlockChain
`Height` 為 BlockChain 的識別值，故選用作為 Doc id。內容有將 `Mined` 做內容轉換 (ex. N minutes -> YYYY-MM-DD HH:mm)，以利未來分析使用。

- Doc: 
    ```
    Height(String): {
        Hash: String
        Height: String
        Mined: String
        Miner: String
        Size: String
        SubPages: Array[String]
        Timestamp: NUMBER
    } 
    ```
- Example:
    ```
    687809: {
        Hash: "0..b68d632ad9502365b3a3beed8e5a6c913512a031bd071"
        Height: "687809"
        Mined: "2021-06-16 02:04"
        Miner: "Unknown"
        Size: "1,521,306 bytes"
        SubPages
        0: "https://www.blockchain.com/btc/block/0000000000000000000b68d632ad9502365b3a3beed8e5a6c913512a031bd071"
        1: "https://www.blockchain.com/btc/block/0000000000000000000b68d632ad9502365b3a3beed8e5a6c913512a031bd071"
        2: "https://www.blockchain.com/btc/address/35y82tEPDa2wm6tzkEacMG8GPPW7zbMj83"
        Timestamp: 1623859475907
    }
    ```
### Collection: BlockTransactions
`Hash` 為 Transaction 的識別值，故選用作為 Doc id，內容有將 `Date`, `Fee` 做型態轉換，以利後續統計資料。因會用到 Height 來作為篩選條件，將其列為 index。

- Index: Height
- Doc: 
    ```
    Hash(STRING): {
        Amount: NUMBER
        Date: NUMBER
        Fee: NUMBER
        FeeDetails: STRING
        Hash: STRING
        Height: STRING
        Timestamp: NUMBER
    } 
    ```
- Example:
    ```
    00037927743119ab5aa41f1da0518097a2c5a5be881bf094623cd76122546719: {
        Amount: 0.21373376
        Date: 1623912960000
        Fee: 0.0004
        Height: "687901"
        Timestamp: 1623913331658
        FeeDetails: "(82.988 sat/B - 34.305 sat/WU - 482 bytes)(136.986 sat/vByte - 292 virtual bytes)"
        Hash: "00037927743119ab5aa41f1da0518097a2c5a5be881bf094623cd76122546719"
    }
    ```

## Tech Stack
- GKE
- FireStore
- Node.js / Express
- Echart.js
- Bootstrap

## Contact
**Han-Yi Lin**<br>
E-mail: hhhhhanyi@gmail.com