const FilecoinNumber = require('@openworklabs/filecoin-number')

class MockLotusJsonrpcEngine {}

MockLotusJsonrpcEngine.prototype.request = jest
  .fn()
  .mockImplementation(method => {
    if (method === 'WalletBalance') return '6000000000'
    if (method === 'MpoolPush')
      return 'bafy2bzacea5j7rc47gt2nrw55rghzyixzhycwb46ahexbsfxhllncbmvj7ky4'
    if (method === 'StateCall') return { MsgRct: { GasUsed: '10000' } }
    if (method === 'MpoolGetNonce') return '1'
  })

module.exports = MockLotusJsonrpcEngine
