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
    throw new Error(response.error_message)
  }

  /* getVersion call rejects if it takes too long to respond,
  meaning the Ledger device is locked */
  getVersion = () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        return reject(new Error('Ledger device locked'))
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

  getAccounts = async (nStart = 0, nEnd = 5) => {
    const paths = []
    for (let i = nStart; i < nEnd; i += 1) {
      paths.push([44, 461, 5, 0, i])
    }
    return mapSeries(paths, async path => {
      const { address } = this.handleErrors(
        await this.getAddressAndPubKey(path),
      )
      return address
    })
  }

  sign = (path, signedMessage) => super.sign(path, signedMessage)
}

export default LedgerProvider
