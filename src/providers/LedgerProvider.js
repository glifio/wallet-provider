import FilecoinApp from 'ledger-filecoin-js'
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

  getVersion = async () => this.handleErrors(await super.getVersion())

  newAccount = () => {}

  getAccounts = async (nStart = 0, nEnd = 5) => {
    const paths = []
    for (let i = nStart; i < nEnd; i += 1) {
      paths.push([44, 461, 5, 0, i])
    }
    return mapSeries(paths, async path => {
      const response = this.handleErrors(await this.getAddressAndPubKey(path))
      return response.address.slice(0, -2) + Math.round(Math.random() * 100)
    })
  }

  sign = () => {}
}

export default LedgerProvider
