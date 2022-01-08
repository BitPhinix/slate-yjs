# Introduction

Slate-yjs aims to be the go-to collaboration solution for slate. Get started in seconds, scale to infinity, customize to your heart's content.

> **⚠️ This is the active development branch for the new version of slate-yjs. Don't use any code in here in production. Things will break and the api will change. ⚠️**

### Sponsors 💖

I'm currently looking for sponsors to fund the further development of slate-yjs. These awesome sponsors already fund the development:

| <p><a href="https://www.sanalabs.com"><img src="https://github.com/sanalabs.png?size=100" alt=""><br><strong>Sana Labs</strong></a></p> |
| :-------------------------------------------------------------------------------------------------------------------------------------: |

[![](https://camo.githubusercontent.com/501c67be44d78593bc449dd38a1d043321b8550a1ceeebf8d4f0e70aa47f4eea/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4f70656e253230436f6c6c6563746976652d4265636f6d652532306125323073706f6e736f722d627269676874677265656e)](https://opencollective.com/y-collective/projects/slate-yjs)

### Why Yjs?

Yjs offers a feature-rich rich text CRDT with best-in-class performance. It's used in production by multiple fortune 500 companies and is the core of many collaborative editing applications. Moreover, it offers a very mature ecosystem with server-side solutions like [hocuspocus](https://www.hocuspocus.dev), enabling you to build robust and highly scalable collaborative/offline-first applications.

For more detailed benchmarks about performance, you can take a look [here](https://github.com/dmonad/crdt-benchmarks).

Why a CDRT over OT? While many current collaborative text editing applications rely on OT (e.g., google docs with ShareJS), it only provides a subset of the functionally CRDTs offer due to the dependence on a central server. In other words: CRDTS can do everything OT can, but OT simply can't.

You can read more about this [here](https://josephg.com/blog/crdts-are-the-future/).

### Live demo

[https://slate-yjs.dev](https://slate-yjs.dev)

### Packages

Slate-yjs's codebase is monorepo managed with [yarn workspaces](https://yarnpkg.com/features/workspaces). It consists of a handful of packages—although you won't always use all of them:

| **Package**                          |                                                                                                                                                                                                                                                                                          **Version** |                                                                                                                                                                                                                                                                                                                                                               **Size** | **Description**                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------- |
| [`@slate-yjs/core`](packages/core)   |    [![](https://camo.githubusercontent.com/c02ceb9fbf735262f6c1aa46c9c6a8982265e3925f33de740ca4ebe403ac2540/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f40736c6174652d796a732f636f72653f6d61784167653d33363030266c6162656c3d26636f6c6f72423d303037656336)](packages/core/package.json) |    [![](https://camo.githubusercontent.com/f3d2feb78961e188feecf80fc3bccf3e8b31bf0245e13bd88566e84379726733/687474703a2f2f696d672e626164676573697a652e696f2f68747470733a2f2f756e706b672e636f6d2f40736c6174652d796a732f636f72652f646973742f696e6465782e636a733f636f6d7072657373696f6e3d677a6970266c6162656c3d253230)](https://unpkg.com/@slate-yjs/core/dist/index.cjs) | Core slate-yjs binding.                        |
| [`@slate-yjs/react`](packages/react) | [![](https://camo.githubusercontent.com/88287092270a668af18928b54240827bd300367a9c58586cbe916a7367915886/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f40736c6174652d796a732f72656163743f6d61784167653d33363030266c6162656c3d26636f6c6f72423d303037656336)](packages/react/package.json) | [![](https://camo.githubusercontent.com/fc4a3f9e445ec3ea2842a89ddf6d18c0e27cdc1db1552ca8a26d20238227e1f2/687474703a2f2f696d672e626164676573697a652e696f2f68747470733a2f2f756e706b672e636f6d2f40736c6174652d796a732f72656163742f646973742f696e6465782e636a733f636f6d7072657373696f6e3d677a6970266c6162656c3d253230)](https://unpkg.com/@slate-yjs/react/dist/index.cjs) | React specific components/utils for slate-yjs. |

### Questions?

For questions around yjs, head over to the [Yjs Community](https://discuss.yjs.dev). Trying to build a backend with [hocuspocus](https://www.hocuspocus.dev) and have questions? Take a look at the #hocuspocus channel in the [TipTap Discord](https://discord.com/invite/WtJ49jGshW). Have issues with slate? There's a [Slack](https://slate-slack.herokuapp.com) for that as well.

Any questions about slate-yjs? Thread over to the #slate-yjs channel inside the [Slate Slack](https://slate-slack.herokuapp.com) or post something in the [Discussions](https://github.com/BitPhinix/slate-yjs/discussions)

### Contributing!

All contributions are super welcome! Check out the Contributing instructions for more info!

Slate-yjs is [MIT-licensed](https://github.com/Bitphinix/slate-yjs/blob/main/LICENSE.md).

