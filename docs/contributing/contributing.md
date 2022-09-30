# Contributing

Want to contribute to slate-yjs? That would be awesome!

- [Reporting Bugs](contributing.md#reporting-bugs)
- [Asking Questions](contributing.md#asking-questions)
- [Submitting Pull Requests](contributing.md#submitting-pull-requests)
- [Repository Setup](contributing.md#repository-setup)
- [Running Examples](contributing.md#running-examples)
- [Running Tests](contributing.md#running-tests)

## Reporting Bugs

If you run into any weird behavior while using slate-yjs, feel free to open a new issue in this repository! Please run a **search before opening** a new issue, to make sure that someone else hasn't already reported or solved the bug you've found.

Any issue you open must include:

- A [JSFiddle](https://jsfiddle.net/) (or similar) that reproduces the bug with a minimal setup.
- A GIF showing the issue in action. \(Using something like [Loom](https://loom.com).\)
- A clear explanation of what the issue is.

## Asking Questions

For questions around yjs, head over to the [Yjs Community](https://discuss.yjs.dev/). Trying to build a backend with [hocuspocus](https://www.hocuspocus.dev/) and have questions? Take a look at the #hocuspocus channel in the [TipTap Discord](https://discord.com/invite/WtJ49jGshW). Having issues with slate? There's a there's a [Slack](https://slate-slack.herokuapp.com/) for that as well.

Any questions about slate-yjs itself? Thead over to the #slate-yjs channel inside the [Slate Slack](https://slate-slack.herokuapp.com/) or post something in the [Discussions](https://github.com/BitPhinix/slate-yjs/discussions)

Please use the Slack instead of asking questions in issues, since we want to reserve issues for keeping track of bugs and features. We close questions in issues so that maintaining the project isn't overwhelming.

## Submitting Pull Requests

All pull requests are super welcomed and greatly appreciated! Issues in need of a solution are marked with a [`help wanted`](https://github.com/BitPhinix/slate-yjs/labels/help%20wanted) label if you're looking for somewhere to start.

Please include tests and docs with every pull request!

## Repository Setup

The slate-yjs repository is a monorepo that is managed with [yarn workspaces](https://yarnpkg.com/features/workspaces). Unlike more traditional repositories, this means that the repository must be built in order for common development activities to function as expected.

To run the build, you need to have the slate-yjs repository cloned to your computer. After that, you need to `cd` into the directory where you cloned it, and install the dependencies with `yarn` and build the monorepo:

```text
yarn install
yarn build
```

## Running Examples

To run the examples, start by building the monorepo as described in the [Repository Setup](contributing.md#repository-setup) section.

Then you can start the examples server with:

```text
yarn dev
```

## Running Tests

To run the tests, start by building the monorepo as described in the [Repository Setup](contributing.md#repository-setup) section.

Then you can rerun the tests with:

```text
yarn test
```

For instructions on how to debug something, head over to the [vitest docs](https://vitest.dev/guide/debugging.html).

In addition to tests you should also run the linter:

```text
yarn lint
```

This will catch TypeScript, Prettier, and Eslint errors.
