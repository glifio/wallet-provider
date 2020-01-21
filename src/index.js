import FilecoinNumber from '@openworklabs/filecoin-number'
import LotusRpcEngine from '@openworklabs/lotus-jsonrpc-engine'

export { default as LocalNodeProvider } from './providers/LocalNodeProvider'
export { default as LedgerProvider } from './providers/LedgerProvider'
export { default as Message } from './Message'

class Filecoin {
  constructor(provider, { token }) {
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: 'https://lotus-dev.temporal.cloud/rpc/v0',
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
}

export default Filecoin
