/* eslint-disable */
import LotusRpcEngine from '@openworklabs/lotus-jsonrpc-engine'

const borc = require('borc')
const base32 = require('./base32.js')('abcdefghijklmnopqrstuvwxyz234567')

function bigintToArray(v) {
  let tmp = BigInt(v).toString(16)
  // not sure why it is not padding and buffer does not like it
  if (tmp.length % 2 === 1) tmp = `0${tmp}`
  return Buffer.from(tmp, 'hex')
}

function decode(address) {
  const network = address.slice(0, 1)
  const protocol = address.slice(1, 2)
  const raw = address.substring(2, address.length)
  const payloadChecksum = new Buffer.from(base32.decode(raw))
  const { length } = payloadChecksum
  const payload = payloadChecksum.slice(0, length - 4)
  const checksum = payloadChecksum.slice(length - 4, length)
  const protocolByte = new Buffer.alloc(1)
  protocolByte[0] = protocol
  return Buffer.concat([protocolByte, payload])
}

function marshalBigInt(val) {
  const bigIntOnset = new Buffer.alloc(1)
  bigIntOnset[0] = 0
  const buf = bigintToArray(val)
  return Buffer.concat([bigIntOnset, Uint8Array.from(buf)])
}

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

  serialize = message => {
    const answer = []
    answer.push(decode(message.to))
    answer.push(decode(message.from))
    answer.push(message.nonce)
    answer.push(marshalBigInt(message.value))
    answer.push(marshalBigInt(message.gasprice))
    answer.push(marshalBigInt(message.gaslimit))
    answer.push(message.method)

    if (message.params) {
      answer.push(message.params)
      return borc.encode(answer)
    }

    const emptyParamsHeader = new Buffer.alloc(1)
    emptyParamsHeader[0] = 64
    const cborWithEmptyParams = Buffer.concat([
      borc.encode(answer),
      emptyParamsHeader,
    ])
    // Change the first byte since cbor is encoded w/o params
    cborWithEmptyParams[0] = 136

    return cborWithEmptyParams
  }
}

export default Message
