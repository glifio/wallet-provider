import FilecoinNumber from '@openworklabs/filecoin-number'
import LotusRpcEngine from '@openworklabs/lotus-jsonrpc-engine'

export { default as LocalNodeProvider } from './providers/LocalNodeProvider'
export { default as LedgerProvider } from './providers/LedgerProvider'

class Filecoin {
  constructor(provider, { apiAddress, token } = {}) {
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: apiAddress || 'http://127.0.0.1:1234/rpc/v0',
      token,
    })
  }

  getBalance = async address => {
    const balance = await this.jsonRpcEngine.request('WalletBalance', address)
    return new FilecoinNumber(balance, 'attofil')
  }

  sendMessage = async (message, signature) => {
    const signedMessage = {
      Message: message,
      Signature: {
        Type: 'secp256k1',
        Data: signature,
      },
    }

    const tx = await this.jsonRpcEngine.request('MpoolPush', signedMessage)
    return tx
  }

  getNonce = async address => {
    if (!address) throw new Error('No address provided.')
    return this.jsonRpcEngine.request('MpoolGetNonce', address)
  }
}

export default Filecoin
