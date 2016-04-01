import xmlparser from 'xml2json'
import fs from 'fs'
import got from 'got'

const dbFileName = 'jsondb.json'

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

      links.forEach(l => {
        if (linksInDB.indexOf(l) === -1) {
          console.log(`${l} is not published yet`)
          // publish
          const postUrl = `https://graph.facebook.com/v2.5/${pageId}/feed?message=&link=${l}&access_token=${accessToken}`
          console.log(postUrl)
          got.post(postUrl)
          console.log(`published ${l} to fb`)
          // add to db
          linksInDB.push(l)
          this.saveDb(linksInDB)
        } else {
          console.log(`link: ${l} already published, it is in db`)
        }
      })
    } catch (err) {
      console.error(`error occurred: ${err.stack}`)
    }
  },
}
