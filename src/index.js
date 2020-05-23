import FilecoinNumber from '@openworklabs/filecoin-number'
import LotusRpcEngine from '@openworklabs/lotus-jsonrpc-engine'
import { checkAddressString } from '@openworklabs/filecoin-address'

export { default as LocalNodeProvider } from './providers/LocalNodeProvider'
export { default as LedgerProvider } from './providers/LedgerProvider'
export * from './utils'

class Filecoin {
  constructor(provider, { apiAddress, token } = {}) {
    if (!provider) throw new Error('No provider provided.')
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: apiAddress || 'http://127.0.0.1:1234/rpc/v0',
      token,
    })
  }

  getBalance = async address => {
    checkAddressString(address)
    const balance = await this.jsonRpcEngine.request('WalletBalance', address)
    return new FilecoinNumber(balance, 'attofil')
  }

  sendMessage = async (message, signature) => {
    if (!message) throw new Error('No message provided.')
    if (!signature) throw new Error('No signature provided.')
    const signedMessage = {
      Message: message,
      Signature: {
        // wallet only supports secp256k1 keys for now
        Type: 1,
        Data: signature,
      },
    }

    const tx = await this.jsonRpcEngine.request('MpoolPush', signedMessage)
    return tx
  }

  getNonce = async address => {
    if (!address) throw new Error('No address provided.')
    checkAddressString(address)
    try {
      const nonce = Number(
        await this.jsonRpcEngine.request('MpoolGetNonce', address),
      )
      return nonce
    } catch (err) {
      if (
        err &&
        err.message &&
        err.message.toLowerCase().includes('address not found')
      )
        return 0
      throw new Error(err)
    }
  }

  estimateGas = async message => {
    if (!message) throw new Error('No message provided.')
    const stateCallRes = await this.jsonRpcEngine.request(
      'StateCall',
      message,
      null,
    )
    if (stateCallRes.Error) throw new Error(stateCallRes.Error)
    return new FilecoinNumber(stateCallRes.MsgRct.GasUsed, 'attofil')
  }
}

export default Filecoin
