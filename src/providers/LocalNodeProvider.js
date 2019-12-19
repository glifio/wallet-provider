import LotusRpcEngine from '../LotusRPCEngine'

class LocalNodeProvider {
  constructor({ apiAddress, token }) {
    this.apiAddress = apiAddress
    this.token = token
    this.jsonRpcEngine = new LotusRpcEngine({ apiAddress, token })
  }

  newAccount = () => this.jsonRpcEngine.request('WalletNew', 'secp256k1')

  getAccounts = () => this.jsonRpcEngine.request('WalletList')

  sign = message =>
    this.jsonRpcEngine.request('WalletSignMessage', message.From, message)
}

export default LocalNodeProvider
