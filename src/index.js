import BigNumber from 'bignumber.js'

import LotusRpcEngine from './LotusRPCEngine';

export { default as LocalNodeProvider } from './providers/LocalNodeProvider'
export { default as Message } from './Message'

class Filecoin {
  constructor(provider) {
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: 'https://lotus-dev.temporal.cloud/rpc/v0',
    });
  }

  getBalance = async (address) => {
    const balance = await this.jsonRpcEngine.request('WalletBalance', address)
    return new BigNumber(balance)
  }

  confirmMessage = () => {}

  sendMessage = async (signedMessage) => {
    const tx = await this.jsonRpcEngine.request('MpoolPush', signedMessage);
    console.log(tx)
    return tx
  }
}

export default Filecoin
