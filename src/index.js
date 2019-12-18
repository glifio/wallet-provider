export { default as LocalNodeProvider } from './providers/LocalNodeProvider'

class FilecoinWallet {
  constructor(provider) {
    this.provider = provider
  }

  newAccount = () => {
    if (this.provider.newAccount) return this.provider.newAccount()
    throw new Error('Selected provider does not support newAccount method')
  }

  getAccounts = () => {
    if (this.provider.getAccounts) return this.provider.getAccounts();
    throw new Error(
      'Selected provider does not support getAccounts method'
    );
  }

  getNetwork = () => {}

  switchNetwork = () => {}

  getNonce = () => {}

  formMessage = () => {}

  sendMessage = (message) => {}
}

export default FilecoinWallet
