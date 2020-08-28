import { FilecoinNumber } from '@openworklabs/filecoin-number'
import LotusRpcEngine, { Config } from '@openworklabs/lotus-jsonrpc-engine'
import { checkAddressString } from '@openworklabs/filecoin-address'
import { Message, LotusMessage } from '@openworklabs/filecoin-message'
import { KNOWN_T0_ADDRESS, KNOWN_T1_ADDRESS, KNOWN_T3_ADDRESS } from './utils'

// export { default as LocalNodeProvider } from './providers/LocalNodeProvider'
export * from './utils'

interface SignFunc {
  // path looks like m/44'/461'/1'/0/0/0 -
  (message: LotusMessage, path: string): Promise<string>
}

interface GetAccountsFunc {
  // network here is 't' (testnet) or 'f' (mainnet)
  (network: string, startIdx: number, endIdx: number): string[]
}

export interface WalletSubProvider {
  sign: SignFunc
  getAccounts: GetAccountsFunc
}

class Filecoin {
  public wallet: WalletSubProvider
  public jsonRpcEngine: LotusRpcEngine

  constructor(
    provider: WalletSubProvider,
    config: Config = { apiAddress: 'http://127.0.0.1:1234/rpc/v0' },
  ) {
    if (!provider) throw new Error('No provider provided.')
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine(config)
  }

  getBalance = async (address: string): Promise<FilecoinNumber> => {
    checkAddressString(address)
    const balance = await this.jsonRpcEngine.request('WalletBalance', address)
    return new FilecoinNumber(balance, 'attofil')
  }

  sendMessage = async (
    message: LotusMessage,
    signature: string,
  ): Promise<{ '/': string }> => {
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

    const tx: Promise<{ '/': string }> = await this.jsonRpcEngine.request(
      'MpoolPush',
      signedMessage,
    )
    return tx
  }

  getNonce = async (address: string): Promise<number> => {
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
        err.message.toLowerCase().includes('actor not found')
      )
        return 0
      throw new Error(err)
    }
  }

  cloneMsgWOnChainFromAddr = async (
    message: LotusMessage,
  ): Promise<LotusMessage> => {
    const clonedMsg = Object.assign({}, message)
    try {
      // state call errs if the from address does not exist on chain yet, lookup from actor ID to know this for sure
      await this.jsonRpcEngine.request('StateLookupID', clonedMsg.From, null)
    } catch (err) {
      // if from actor doesnt exist, use a hardcoded known actor address
      if (err.message.toLowerCase().includes('actor not found')) {
        if (!clonedMsg.From) clonedMsg.From = KNOWN_T0_ADDRESS
        if (clonedMsg.From[1] === '0') clonedMsg.From = KNOWN_T0_ADDRESS
        else if (clonedMsg.From[1] === '1') clonedMsg.From = KNOWN_T1_ADDRESS
        else if (clonedMsg.From[1] === '3') clonedMsg.From = KNOWN_T3_ADDRESS
        else {
          // this should never happen, only t1 and t3 addresses can be
          clonedMsg.From = KNOWN_T0_ADDRESS
        }
      }
    }
    return clonedMsg
  }

  gasEstimateFeeCap = async (
    message: LotusMessage,
  ): Promise<FilecoinNumber> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)
    const feeCap = await this.jsonRpcEngine.request(
      'GasEstimateFeeCap',
      clonedMsg,
      0,
      null,
    )

    return new FilecoinNumber(feeCap, 'attofil')
  }

  gasEstimateGasLimit = async (
    message: LotusMessage,
  ): Promise<FilecoinNumber> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)

    const gasLimit = await this.jsonRpcEngine.request(
      'GasEstimateGasLimit',
      clonedMsg,
      null,
    )

    return new FilecoinNumber(gasLimit, 'attofil')
  }

  gasEstimateGasPremium = async (
    message: LotusMessage,
    numBlocksIncluded: number = 0,
  ): Promise<FilecoinNumber> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)

    const gasPremium = await this.jsonRpcEngine.request(
      'GasEstimateGasPremium',
      numBlocksIncluded,
      clonedMsg.From,
      clonedMsg.GasLimit || 0,
      null,
    )

    return new FilecoinNumber(gasPremium, 'attofil')
  }

  gasEstimateMessageGas = async (
    message: LotusMessage,
    maxFee: string = '0',
  ): Promise<Message> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)
    const {
      To,
      From,
      Value,
      GasPremium,
      GasFeeCap,
      GasLimit,
      Method,
      Nonce,
      Params,
    } = await this.jsonRpcEngine.request(
      'GasEstimateMessageGas',
      clonedMsg,
      { MaxFee: maxFee },
      null,
    )

    return new Message({
      to: To,
      from: From,
      value: Value,
      gasPremium: GasPremium,
      gasFeeCap: GasFeeCap,
      gasLimit: GasLimit,
      method: Method,
      nonce: Nonce,
      params: Params,
    })
  }

  /** Placeholders until https://github.com/filecoin-project/lotus/issues/3326 lands  */
  gasEstimateMaxFee = async (
    message: LotusMessage,
  ): Promise<FilecoinNumber> => {
    return new FilecoinNumber('12435085', 'attofil')
  }

  gasLookupTxFee = async (message: LotusMessage): Promise<FilecoinNumber> => {
    return new FilecoinNumber('12435085', 'attofil')
  }
}

export default Filecoin
