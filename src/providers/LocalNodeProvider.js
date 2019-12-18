import axios from 'axios'

class LotusRpcEngine {
  constructor({ apiAddress, token }) {
    this.apiAddress = apiAddress
    this.token = token
  }

  async request(method, ...params) {
    console.log(this.apiAddress,
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
    )
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

  // newAccount = () => this.jsonRpcEngine.request('WalletNew', 'secp256k1');

  // getAccounts = () => this.jsonRpcEngine.request('WalletList');

  newAccount = () => 't1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza';

  getAccounts = () => [
    't1tvg3q5ugbhykritgedk52btevvplutkdfmqjklq',
    't1yqtd4xnqoptphyw6gfcvphkfs2dkthzfop4r4wa',
    't1z225tguggx4onbauimqvxzutopzdr2m4s6z6wgi',
  ];
}

export default LocalNodeProvider
