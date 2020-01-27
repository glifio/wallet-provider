import FilecoinApp from '@zondax/ledger-filecoin'
import { mapSeries } from 'bluebird'

class LedgerProvider extends FilecoinApp {
  constructor(transport) {
    super(transport)
    this.type = 'LEDGER'
    this.ledgerBusy = false
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

  throwIfBusy = () => {
    if (this.ledgerBusy)
      throw new Error(
        'Ledger is busy, please check device or unplug and replug it in.',
      )
  }

  /* getVersion call rejects if it takes too long to respond,
  meaning the Ledger device is locked */
  getVersion = () => {
    this.throwIfBusy()
    this.ledgerBusy = true
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.ledgerBusy = false
        return reject(new Error('Ledger device locked or busy'))
      }, 3000)

      setTimeout(async () => {
        try {
          const response = this.handleErrors(await super.getVersion())
          return resolve(response)
        } catch (err) {
          return reject(err)
        } finally {
          this.ledgerBusy = false
        }
      })
    })
  }

  newAccount = () => {}

  getAccounts = async (nStart = 0, nEnd = 5, network = 't') => {
    this.throwIfBusy()
    this.ledgerBusy = true
    const pathNetworkId = network === 'f' ? 461 : 1
    const paths = []
    for (let i = nStart; i < nEnd; i += 1) {
      paths.push([44, pathNetworkId, 5, 0, i])
    }
    const addresses = await mapSeries(paths, async path => {
      const { address } = this.handleErrors(
        await this.getAddressAndPubKey(path),
      )
      return address
    })
    this.ledgerBusy = false
    return addresses
  }

  sign = async (path, signedMessage) => {
    this.throwIfBusy()
    this.ledgerBusy = true
    const { signature } = this.handleErrors(
      await super.sign(path, signedMessage),
    )
    this.ledgerBusy = false
    return signature.toString('base64')
  }

  showAddressAndPubKey = async path => {
    this.throwIfBusy()
    this.ledgerBusy = true
    await super.showAddressAndPubKey(path)
    this.ledgerBusy = false
  }
}

export default LedgerProvider
