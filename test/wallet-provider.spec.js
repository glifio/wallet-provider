/* eslint-env mocha */
const { expect } = require('chai')
const Filecoin = require('../').default
const LocalNodeProvider = require('../dist/providers/LocalNodeProvider').default
const { download, validateWord } = require('../dist/utils/bip39/wordlists')

describe('provider', () => {
  describe('constructor', () => {
    it('should create Filecoin object', async () => {
      const filecoin = new Filecoin(
        new LocalNodeProvider({
          apiAddress: 'http://127.0.0.1:1234/rpc/v0',
          token: process.env.LOTUS_JWT_TOKEN,
        }),
        { token: process.env.LOTUS_JWT_TOKEN },
      )
      expect(filecoin).to.be.instanceOf(Filecoin)
    })
  })
})

describe('bip39', () => {
  describe('word validator', async () => {
    let wordLists
    before(async () => {
      wordLists = await download()
    })

    it('should validate a valid english word', () => {
      const valid = validateWord('work', wordLists)
      expect(valid).to.equal(true)
    })

    it('should validate a valid chinese word', () => {
      const valid = validateWord('殼', wordLists)
      expect(valid).to.equal(true)
    })

    it('should invalidate an invalid word', () => {
      const valid = validateWord('invalid', wordLists)
      expect(valid).to.equal(false)
    })
  })
})
