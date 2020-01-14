import LotusRpcEngine from '@openworklabs/lotus-jsonrpc-engine'

class Message {
  constructor({ to, from, value, method }) {
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: 'https://lotus-dev.temporal.cloud/rpc/v0',
    })
    this.nonce = null
    // TODO: better validation
    if (!to) throw new Error('Invalid "to" address')
    this.to = to

    if (!from) throw new Error('Invalid "from" address')
    this.from = from

    if (!value) throw new Error('No value provided')
    this.value = value

    if (typeof method !== 'number') throw new Error('Invalid "method" passed')
    this.method = method
  }

  generateNonce = async () => {
    const nonce = await this.jsonRpcEngine.request('MpoolGetNonce', this.from)
    this.nonce = nonce
    return true
  }

  encode = () => {
    if (typeof this.nonce !== 'number')
      throw new Error('Cannot encode message without a nonce')
    const message = {
      To: this.to,
      From: this.from,
      Nonce: this.nonce,
      Value: this.value,
      Method: this.method,
      GasPrice: '3',
      GasLimit: '1000',
      Params: [],
    }
    return message
  }
}

export default Message
