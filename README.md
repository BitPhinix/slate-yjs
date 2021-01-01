# Slate Yjs

[![codecov](https://codecov.io/gh/BitPhinix/slate-yjs/branch/master/graph/badge.svg?token=ZHUA26IWP0)](https://codecov.io/gh/BitPhinix/slate-yjs)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/BitPhinix/slate-yjs/graphs/commit-activity)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Downloads](https://img.shields.io/npm/dt/slate-yjs.svg)](https://www.npmjs.com/package/slate-yjs)
[![npm](https://img.shields.io/npm/v/slate-yjs)](https://www.npmjs.com/package/slate-yjs)
[![tests](https://img.shields.io/github/workflow/status/bitphinix/slate-yjs/test)](https://github.com/BitPhinix/slate-yjs/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/BitPhinix/slate-yjs/actions?query=workflow%3Arelease)

Yjs bindings for Slate.

Heavily inspired by [slate-collaborative](https://github.com/cudr/slate-collaborative)

![](https://media.giphy.com/media/J4IaAYZvJ1MNXz2p4j/giphy.gif)

# Installation

Via npm:

```bash
npm install slate-yjs
```

Via yarn:

```bash
yarn add slate-yjs
```

# Why use `slate-yjs` over `slate-collaborative`?

Performance. `slate-collaborative` works well for small documents but can cause 20 seconds + load times on heavier ones which slate-yjs can load in a fraction of a second.

For a more in-depth comparison take a look at these [benchmarks](https://github.com/dmonad/crdt-benchmarks)

You might also want to take a look at ["CRDTs are the future"](https://josephg.com/blog/crdts-are-the-future/) from the creator of [sharedb](https://github.com/share/sharedb)

# API

## YjsEditor

Adding a 2-way binding from the editor to a Yjs document is as easy as:

```ts
import { withYjs } from 'slate-yjs';

const yjsEditor = withYjs(editor);

// The 2-way bound sync doc
console.log(yjsEditor.sharedType);
```

## WebsocketEditor

Slate Yjs comes with built in support for [y-websocket](https://github.com/yjs/y-websocket):

```js
import { WebsocketEditorOptions, withWebsocket } from 'slate-yjs';

const collabEditor = withWebsocket(yjsEditor, options);

// Connect editor
collabEditor.connect();
```

### Options

```ts
{
  roomName: string // Room name
  endpoint: string // Websocket endpoint
  onConnect?: () => void // Connect callback
  onDisconnect?: () => void // Disconnect callback
  connect?: boolean // Whether to connect automatically (default false)
  awareness?: awarenessProtocol.Awareness // Awareness protocol to use
  WebSocketPolyfill?: typeof WebSocket // Websocket polyfill to use
  resyncInterval?: number // Request server state every `resyncInterval` milliseconds
}
```

## Example project

Take a look at the example project [here](https://github.com/BitPhinix/slate-yjs-example)

# Contribute

Please refer to each project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

1. Fork the repo on GitHub
2. Clone the project to your machine
3. Commit changes to your branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!
