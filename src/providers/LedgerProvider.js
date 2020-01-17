import FilecoinApp from '@zondax/ledger-filecoin-js'
import { mapSeries } from 'bluebird'

class LedgerProvider extends FilecoinApp {
  constructor(transport) {
    super(transport)
    this.type = 'LEDGER'
  }

  handleErrors = response => {
    if (
      response.error_message &&
      response.error_message.toLowerCase().includes('no errors')
    ) {
      return response
    }
    if (
      response.error_message &&
      response.error_message
        .toLowerCase()
        .includes('transporterror: invalild channel')
    ) {
      throw new Error(
        'Lost connection with Ledger. Please unplug and replug device.',
      )
    }
    throw new Error(response.error_message)
  }

  /* getVersion call rejects if it takes too long to respond,
  meaning the Ledger device is locked */
  getVersion = () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        return reject(new Error('Ledger device locked or busy'))
      }, 3000)

      setTimeout(async () => {
        try {
          const response = this.handleErrors(await super.getVersion())
          return resolve(response)
        } catch (err) {
          return reject(err)
        }
      })
    })

  newAccount = () => {}

  getAccounts = async (nStart = 0, nEnd = 5, network = 't') => {
    const pathNetworkId = network === 'f' ? 1 : 461
    const paths = []
    for (let i = nStart; i < nEnd; i += 1) {
      paths.push([44, pathNetworkId, 5, 0, i])
    }
    return mapSeries(paths, async path => {
      const { address } = this.handleErrors(
        await this.getAddressAndPubKey(path),
      )
      return address
    })
  }

  sign = async (path, signedMessage) => {
    const { signature } = this.handleErrors(
      await super.sign(path, signedMessage),
    )
    return signature.toString('base64')
  }
}

export default LedgerProvider
