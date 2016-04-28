import xmlparser from 'xml2json'
import fs from 'fs'
import got from 'got'

const dbFileName = 'jsondb.json'

const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms))

export default {
  async read(feedLink) {
    const res = await got(feedLink)
    const feedJsonStr = xmlparser.toJson(res.body)
    const feedJson = JSON.parse(feedJsonStr)
    const result = feedJson.rss.channel.item.map(i => i.link)
    return result
  },

  saveDb(links) {
    fs.writeFileSync(dbFileName, JSON.stringify(links, null, ' '))
  },

  loadFromDb() {
    if (!fs.existsSync(dbFileName)) {
      return []
    }
    const str = fs.readFileSync(dbFileName, 'utf8')
    return JSON.parse(str)
  },

  async publish(feedLink, pageId, accessToken) {
    try {
      const links = await this.read(feedLink)
      console.log(`got ${links.length} post in feed`)
      const linksInDB = this.loadFromDb()
      console.log(`in db, there are ${linksInDB.length} links`)

      for (const link of links.reverse()) {
        await (async (l) => {
          if (linksInDB.indexOf(l) === -1) {
            console.log(`${l} is not published yet`)
            // publish
            const postUrl = `https://graph.facebook.com/v2.5/${pageId}/feed?message=&link=${l}&access_token=${accessToken}`
            await got.post(postUrl)
            console.log(`published ${l} to fb`)
            // publish to page 2
            const postUrl2 = `https://graph.facebook.com/v2.5/${pageId2}/feed?message=&link=${l}&access_token=${accessToken}`
            await got.post(postUrl2)
            console.log(`published ${l} to fb alt page`)
            // add to db
            linksInDB.push(l)
            this.saveDb(linksInDB)
          } else {
            console.log(`link: ${l} already published, it is in db`)
          }
        })(link)
      }
    } catch (err) {
      console.error(`error occurred: ${err.stack}`)
    }
  },

  async testpost() {
    // concurrent loop
    const asyncFunc = async (i) => {
      console.log(i)
      await sleep(1000)
      console.log(`end of ${i}`)
      return i * 2
    }
    const res = await Promise.all([1, 2].map(i => asyncFunc(i)))
    console.log(res)
    // sequential loop
    for (const j of [3, 4]) {
      await (async (i) => {
        console.log(i)
        await sleep(1000)
        console.log(`end of ${i}`)
      })(j)
    }
    console.log('end of all')
  },
}
