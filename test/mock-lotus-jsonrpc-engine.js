class MockLotusJsonrpcEngine {}

MockLotusJsonrpcEngine.prototype.request = jest
  .fn()
  .mockImplementation((method, ...args) => {
    if (method === 'WalletBalance') return '6000000000'
    if (method === 'MpoolPush')
      return 'bafy2bzacea5j7rc47gt2nrw55rghzyixzhycwb46ahexbsfxhllncbmvj7ky4'
    if (method === 'StateCall') return { MsgRct: { GasUsed: '10000' } }
    if (method === 'MpoolGetNonce') {
      if (args[0] === 't0999')
        throw new Error(
          '"resolution lookup failed (t0999): resolve address t0999: address not found"',
        )
      return '1'
    }
    if (method === 'StateLookupID') {
      if (args[0] === 't0999') {
        throw new Error(
          'resolution lookup failed (t0999): resolve address t0999: address not found',
        )
      }
      return
    }
  })

module.exports = MockLotusJsonrpcEngine
