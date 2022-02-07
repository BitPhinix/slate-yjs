// This allows tests to include Slate Nodes written in JSX without TypeScript complaining.
declare namespace jsx.JSX {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface IntrinsicElements {
    [elemName: string]: any; // eslint-disable-line
  }
}
