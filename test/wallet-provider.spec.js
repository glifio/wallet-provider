const Filecoin = require('..').default
const { BigNumber } = require('@openworklabs/filecoin-number')
const FilecoinNumber = require('@openworklabs/filecoin-number')
const Message = require('@openworklabs/filecoin-message')

const testSubProviderInstance = {
  getAccounts: jest.fn().mockImplementation(() => {}),
  sign: jest.fn().mockImplementation(() => {}),
}

const message = new Message({
  to: 't01',
  from: 't02',
  value: new BigNumber('1'),
  method: 0,
  gasPrice: new BigNumber('1000'),
  gasLimit: 100,
  nonce: 1,
})

describe('provider', () => {
  let filecoin
  beforeAll(() => {
    filecoin = new Filecoin(testSubProviderInstance)
  })

  describe('constructor', () => {
    it('should create Filecoin object', async () => {
      expect(filecoin).toBeInstanceOf(Filecoin)
      expect(filecoin.wallet).toBeTruthy()
      expect(filecoin.wallet.getAccounts).toBeTruthy()
      expect(filecoin.jsonRpcEngine).toBeTruthy()
      expect(filecoin.jsonRpcEngine.request).toBeTruthy()
    })

    it('should throw when not passed a provider', async () => {
      expect(() => {
        new Filecoin()
      }).toThrow()
    })
  })

  describe('getBalance', () => {
    it('should call WalletBalance with address', async () => {
      const balance = await filecoin.getBalance('t0112')
      expect(filecoin.jsonRpcEngine.request).toHaveBeenCalled()
      expect(filecoin.jsonRpcEngine.request).toHaveBeenCalledWith(
        'WalletBalance',
        't0112',
      )
      expect(balance.isGreaterThanOrEqualTo(0)).toBeTruthy()
    })

    it('should return an instance of filecoin number', async () => {
      const balance = await filecoin.getBalance('t0112')
      expect(balance instanceof FilecoinNumber).toBeTruthy()
    })

    it('should throw when a bad address is passed', async () => {
      await expect(filecoin.getBalance('r011')).rejects.toThrow()
    })

    it('should throw when an object is passed as an address', async () => {
      expect(filecoin.getBalance({ key: 'val' })).rejects.toThrow()
    })

    it('should throw when null is passed as an address', async () => {
      expect(filecoin.getBalance(null)).rejects.toThrow()
    })
  })

  describe('sendMessage', () => {
    it('should throw with the wrong number of params', async () => {
      await expect(filecoin.sendMessage()).rejects.toThrow()
      await expect(filecoin.sendMessage(message)).rejects.toThrow()
    })

    it('should return the tx', async () => {
      await expect(filecoin.sendMessage(message, '123')).resolves.toBeTruthy()
      expect(filecoin.jsonRpcEngine.request).toHaveBeenCalledWith('MpoolPush', {
        Message: message,
        Signature: {
          Type: 1,
          Data: '123',
        },
      })
    })

    it('should call request with MpoolPush and a signed message', async () => {
      expect(filecoin.jsonRpcEngine.request).toHaveBeenCalledWith('MpoolPush', {
        Message: message,
        Signature: {
          Type: 1,
          Data: '123',
        },
      })
    })
  })

  describe('getNonce', () => {
    it('should throw if an invalid address is provided', async () => {
      await expect(filecoin.getNonce('e01')).rejects.toThrow()
      await expect(filecoin.getNonce()).rejects.toThrow()
    })

    it('should call request with getNonce and an address', async () => {
      await expect(filecoin.getNonce('t012'))
      expect(filecoin.jsonRpcEngine.request).toHaveBeenCalledWith(
        'MpoolGetNonce',
        't012',
      )
    })

    it('should return a number', async () => {
      const nonce = await filecoin.getNonce('t0123')
      expect(typeof nonce === 'number').toBe(true)
    })

    it('should return 0 if the error received is ', async () => {
      // this address is hardcoded to throw the right error type
      const nonce = await filecoin.getNonce('t0999')
      expect(nonce).toBe(0)
    })
  })

  describe('estimateGas', () => {
    it('should throw if no message is provided', async () => {
      await expect(filecoin.estimateGas()).rejects.toThrow()
    })

    it('should call request with StateCall, the message, and null as the tipset', async () => {
      await expect(filecoin.estimateGas(message))
      expect(filecoin.jsonRpcEngine.request).toHaveBeenCalledWith(
        'StateCall',
        message,
        null,
      )
    })

    it('should return a FilecoinNumber instance', async () => {
      await expect(filecoin.estimateGas(message)).resolves.toBeInstanceOf(
        FilecoinNumber,
      )
    })
  })
})
