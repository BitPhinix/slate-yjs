# Slate Yjs

(Experimental) Yjs bindings for Slate.

Heavily inspired by [slate-collaboritve](https://github.com/cudr/slate-collaborative)

![](https://media.giphy.com/media/J4IaAYZvJ1MNXz2p4j/giphy.gif)

# Installation

Via npm:

```
npm install slate-yjs
```

Via yarn:

```
yarn add slate-yjs
```

# Why use Slate Yjs instead of slate-collaborative?

Performance. slate-collaborative works well for small documents but causes 20 seconds plus load times on larger documents which slate-yjs can load in a fraction of a second.

For a more in-depth comparison take a look at this [benchmark](https://github.com/dmonad/crdt-benchmarks).

# Why CRDTs over OT?

The article ["CRDTs are the future"](https://josephg.com/blog/crdts-are-the-future/) from the creator of [sharedb](https://github.com/share/sharedb) might be interesting for you.

# API

## YjsEditor

Adding a 2-way binding from the editor to a yjs document is as easy as:

```js
import { withYjs } from 'slate-yjs';

const yjsEditor = withYjs(editor);

// The 2-way bound sync doc
console.log(yjsEditor.syncDoc);
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
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!
