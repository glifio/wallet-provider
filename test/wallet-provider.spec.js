/* eslint-env mocha */
const { expect } = require('chai')
const { Filecoin, LocalNodeProvider } = require('../')

// TODO: add tests for valid and invalid message construction

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
