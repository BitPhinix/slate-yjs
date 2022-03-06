<br/>

<p align="center">
  <a href="#"><img width="600" src="./docs/images/banner.svg" /></a>
</p>

<p align="center">
Slate-yjs aims to be the goto collaboration solution for slate. Get started in seconds, scale to infinity, customize to your hearts content.
</p>

<br/>

<p align="center">
  <a href="#"><img src="./docs/images/demo.gif" /></a>
</p>

<br/>

<p align="center">
  <a href="#sponsors-"><strong>Sponsors</strong></a> ·
  <a href="#why-yjs"><strong>Why Yjs?</strong></a> ·
  <a href="https://slate-yjs.dev"><strong>Live demo</strong></a> ·
  <a href="https://docs.slate-yjs.dev"><strong>Documentation</strong></a> ·
  <a href="#packages"><strong>Packages</strong></a> ·
  <a href="#questions"><strong>Questions</strong></a> ·
  <a href="#contributing"><strong>Contributing!</strong></a>
</p>

<br/>

<p align="center">
<a href="https://codecov.io/gh/BitPhinix/slate-yjs" alt="Codecov">
        <img src="https://codecov.io/gh/BitPhinix/slate-yjs/branch/main/graph/badge.svg?token=ZHUA26IWP0" /></a>
<a href="https://github.com/BitPhinix/slate-yjs/graphs/commit-activity" alt="Maintenance">
        <img src="https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg" /></a>
<a href="http://commitizen.github.io/cz-cli/" alt="Commitizen friendly">
        <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" /></a>
<a href="https://www.npmjs.com/package/slate-yjs" alt="Downloads">
        <img src="https://img.shields.io/npm/dt/slate-yjs.svg" /></a>
<a href="https://www.npmjs.com/package/slate-yjs" alt="NPM">
        <img src="https://img.shields.io/npm/v/slate-yjs" /></a>
<a href="https://github.com/BitPhinix/slate-yjs/actions" alt="Tests">
        <img src="https://img.shields.io/github/workflow/status/bitphinix/slate-yjs/test" /></a>
<a href="https://github.com/BitPhinix/slate-yjs/actions?query=workflow%3Arelease" alt="Semantic Release">
        <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" /></a>

<br/>

<blockquote align="center">
<b>:warning: This is the active development branch for the new version of slate-yjs. Don't use any code in here in production. Things will break and the api will change. :warning:</b>
</blockquote>

<br/>
<br/>

## Sponsors 💖

I'm currently looking for sponsors to found further development of slate-yjs. These awesome sponsors already fund the development:

<table>
  <tr>
    <td align="center">
      <a href="https://www.sanalabs.com/">
        <img src="https://github.com/sanalabs.png?size=100" width="100"><br>
        <strong>Sana Labs</strong>
      </a>
    </td>
  </tr>
</table>

<a href="https://opencollective.com/y-collective/projects/slate-yjs" alt="Sponsor">
        <img src="https://img.shields.io/badge/Open%20Collective-Become%20a%20sponsor-brightgreen" /></a>

<br/>
<br/>

## Why Yjs?

Yjs offers a feature-rich rich text CRDT with best-in-class performance. It's used in production by multiple fortune 500 companies and is the core of many collaborative editing applications. Moreover, it offers a very mature ecosystem with server-side solutions like [hocuspocus](https://www.hocuspocus.dev/), enabling you to build robust and highly scalable collaborative/offline-first applications.

For more detailed benchmarks about performance, you can take a look [here](https://github.com/dmonad/crdt-benchmarks).

Why a CDRT over OT? While many current collaborative text editing applications rely on OT (e.g., google docs with ShareJS), it only provides a subset of the functionally CRDTs offer due to the dependence on a central server. In other words: CRDTS can do everything OT can, but OT simply can't.

You can read more about this [here](https://josephg.com/blog/crdts-are-the-future/).

<br/>
<br/>

## Live demo

https://slate-yjs.dev

<br/>
<br/>

## Documentation

https://docs.slate-yjs.dev

<br/>
<br/>

## Packages

Slate-yjs's codebase is monorepo managed with [yarn workspaces](https://yarnpkg.com/features/workspaces). It consists of a handful of packages—although you won't always use all of them:

| **Package**                            |                                                                                                          **Version** |                                                                                                                                                       **Size** | **Description**                                |
| :------------------------------------- | -------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------- |
| [`@slate-yjs/core`](./packages/core)   |   [![](https://img.shields.io/npm/v/@slate-yjs/core?maxAge=3600&label=&colorB=007ec6)](./packages/core/package.json) |   [![](http://img.badgesize.io/https://unpkg.com/@slate-yjs/core/dist/index.cjs?compression=gzip&label=%20)](https://unpkg.com/@slate-yjs/core/dist/index.cjs) | Core slate-yjs binding.                        |
| [`@slate-yjs/react`](./packages/react) | [![](https://img.shields.io/npm/v/@slate-yjs/react?maxAge=3600&label=&colorB=007ec6)](./packages/react/package.json) | [![](http://img.badgesize.io/https://unpkg.com/@slate-yjs/react/dist/index.cjs?compression=gzip&label=%20)](https://unpkg.com/@slate-yjs/react/dist/index.cjs) | React specific components/utils for slate-yjs. |

<br/>
<br/>

## Questions?

For questions around yjs, head over to the [Yjs Community](https://discuss.yjs.dev/). Trying to build a backend with [hocuspocus](https://www.hocuspocus.dev/) and have questions? Take a look at the #hocuspocus channel in the [TipTap Discord](https://discord.com/invite/WtJ49jGshW). Having issues with slate? There's a there's a [Slack](https://slate-slack.herokuapp.com/) for that as well.

Any questions about slate-yjs? Thead over to the #slate-yjs channel inside the [Slate Slack](https://slate-slack.herokuapp.com/) or post something in the [Discussions](https://github.com/BitPhinix/slate-yjs/discussions)

<br/>
<br/>

## Contributing!

All contributions are super welcome! Check out the Contributing instructions for more info!

Slate-yjs is [MIT-licensed](https://github.com/Bitphinix/slate-yjs/blob/main/LICENSE.md).
