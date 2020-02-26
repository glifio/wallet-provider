const bent = require('bent')

const get = bent('GET', 'string')

const WORDLISTS = [
  'english',
  'chinese_simplified',
  'chinese_traditional',
  'spanish',
  'japanese',
  'korean',
  'french',
  'italian',
]

const toJSON = content => {
  return content
    .trim()
    .split('\n')
    .map(word => {
      return word.trim()
    })
}

const download = async () => {
  const wordlists = {}

  const promises = WORDLISTS.map(async name => {
    const raw = await get(
      `https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/${name}.txt`,
    )

    wordlists[name] = toJSON(raw)
  })

  await Promise.all(promises)

  return wordlists
}

const validateWord = (word, wordlists) => {
  let match

  Object.keys(wordlists).forEach(key => {
    if (match) return

    match = wordlists[key].find(item => {
      return item === word
    })
  })

  return !!match
}

module.exports = { download, validateWord }
