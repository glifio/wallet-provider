import LotusRpcEngine from './LotusRPCEngine';

export { default as LocalNodeProvider } from './providers/LocalNodeProvider'

class Filecoin {
  constructor(provider) {
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: 'https://lotus-dev.temporal.cloud/rpc/v0',
    });
  }

  getBalance = (address) => this.jsonRpcEngine.request('WalletBalance', address)

  getNonce = () => {}

  confirmMessage = () => {}

  sendMessage = (message) => {}
}

export default Filecoin
