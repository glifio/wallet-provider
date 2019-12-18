import axios from 'axios'

class LotusRpcEngine {
  constructor({ apiAddress, token }) {
    this.apiAddress = apiAddress
    this.token = token
  }

  async request(method, ...params) {
    const { data } = await axios.post(
      this.apiAddress,
      {
        jsonrpc: '2.0',
        method: `Filecoin.${method}`,
        params: [...params],
        id: 1,
      },
      {
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          Accept: '*/*',
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
    return data.result;
  }
}

class LocalNodeProvider {
  constructor({ apiAddress, token }) {
    this.apiAddress = apiAddress;
    this.token = token;
    this.jsonRpcEngine = new LotusRpcEngine({ apiAddress, token });
  }

  newAccount = () => this.jsonRpcEngine.request('WalletNew', 'secp256k1');

  getAccounts = () => this.jsonRpcEngine.request('WalletList');
}

export default LocalNodeProvider
