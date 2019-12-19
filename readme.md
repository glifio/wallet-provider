# Filecoin wallet provider

:warning: Active development. Unstable. Breaking Changes. You get the point.

This wallet provider module is inspired as a combination between [MetaMask's keyring controller](https://github.com/MetaMask/KeyringController) and [web3.js](https://github.com/ethereum/web3.js/). It's experimental so it's likely that it will change, drastically. Below is a description of our design decisions, how it's working, and development plan over the coming weeks/months.

## Current state

Right now the filecoin-wallet-provider only supports a single "key class" provider, so you instantiate like so:

```js
import Filecoin, {
  LocalNodeProvider,
} from '@openworklabs/filecoin-wallet-provider'

export default new Filecoin(
  new LocalNodeProvider({
    apiAddress: 'https://lotus-dev.temporal.cloud/rpc/v0',
    token: process.env.LOTUS_JWT_TOKEN,
  }),
  { token: process.env.LOTUS_JWT_TOKEN },
)
```

### Design decisions & future

At a high level, a simple wallet relies on 2 types of functions:
(1) methods that require access to private keys
(2) methods that do not require access to private keys

For example, `signMessage` and `getAccounts` are two methods that would require access to a private key, whereas `getBalance`, `getNonce`, and `sendSignedMessage` do not rely on having access to private keys (these are all made up method names).

This naturally lends itself to an architecture that should allow developers to "plug-and-play" their own modules that handle "private key methods", and not have to worry about re-implementing their own "non-private key methods". In other words, a developer should be able to do something like this:

```js
const Filecoin = require('@openworklabs/filecoin-wallet-provider')

const filecoin = new Filecoin()

await filecoin.addWalletProvider(new LedgerWallet())
await filecoin.addWalletProvider(new SimpleJSWallet())

const accounts = await filecoin.listAccounts()
// ['t1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza', 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei']
// returns accounts from both wallet types
```

Ideally, each Wallet Class in the above example will follow a simple interface and exposes a few functions, similar to MetaMask's [Keyring Class Protocol](t1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei). We could match this interface with the `Wallet` methods in the [Lotus jsonrpc](https://github.com/filecoin-project/lotus/blob/master/api/api_full.go) (with the exception of `balance` and `list` because those do not need access to underlying private keys).
