# Installation

## Installing the dependencies

For the following example, you will only need the core binding `@slate-yjs/core`. While the core package doesn't contain all by slate-yjs provided functionality, it contains everything you need to set up a basic 2 way binding between a slate editor and a yjs shared type.

```
npm install @slate-yjs/core
```

You also need to be sure to install slate-yjs's peer dependencies:

```
npm install yjs
```

<br/>

## Setting up the core binding

Once you've installed slate-yjs, you'll need to import it.

```jsx
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core';

// Import yjs
import * as Y from 'yjs';
```

> This guide assumes that you already have set up a basic slate editor. If you aren't sure how, make yourself familiar with slate first: [https://docs.slatejs.org/walkthroughs/01-installing-slate](https://docs.slatejs.org/walkthroughs/01-installing-slate)

Your existing editor component should look something like this:

```jsx
const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
}]

const Editor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState(initialValue)

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={setValue}
      ...
    />
  )
}
```

Let's extend it to create a yjs document and the shared type we will attach our binding to.

```jsx
const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
}]

const Editor = () => {
  // Create a yjs document and get the shared type
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc()
    const sharedType = yDoc.get("content", Y.XmlText)
    return sharedType
  }, [])

  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState(initialValue)

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={setValue}
      ...
    />
  )
}
```

Slate-yjs will overwrite the current editor value with the state contained in the shared type. Let's move it over into the shared type.

> Ideally you would provide the initial value from a server. For a how-to on setting up collaboration take a look at the [collaboration example](collaboration-hocuspocus.md).

```jsx
const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
}]

const Editor = () => {
  // Create a yjs document and get the shared type
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc()
    const sharedType = yDoc.get("content", Y.XmlText)

    // Load the initial value into the yjs document
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue))

    return sharedType
  }, [])

  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState([])

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={setValue}
      ...
    />
  )
}
```

Now that we've set up all requirements, we can set up the actual binding.

```jsx
const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
}]

const Editor = () => {
  // Create a yjs document and get the shared type
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc()
    const sharedType = yDoc.get("content", Y.XmlText)

    // Load the initial value into the yjs document
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue))

    return sharedType
  }, [])

  // Setup the binding
  const editor = useMemo(() => withYjs(withReact(createEditor()), sharedType), [])
  const [value, setValue] = useState([])

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={setValue}
      ...
    />
  )
}
```

When collaborating with other users the asynchronous nature of applying changes can result in a state where slate has no children. Rendering this state will result in a crash. To avoid the issue we have to add a normalization rule to ensure the slate state is always valid.

```jsx
const initialValue = [{
  type: 'paragraph',
  children: [{ text: 'A line of text in a paragraph.' }],
}]

const Editor = () => {
  // Create a yjs document and get the shared type
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc()
    const sharedType = yDoc.get("content", Y.XmlText)

    // Load the initial value into the yjs document
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue))

    return sharedType
  }, [])

  // Setup the binding
  const editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText);
    const e = withReact(withYjs(createEditor(), sharedType));

    // Ensure editor always has at least 1 valid child
    const { normalizeNode } = e;
    e.normalizeNode = (entry) => {
      const [node] = entry;
      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: [0] }
      );
    };
  }, []);

  const [value, setValue] = useState([])

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={setValue}
      ...
    />
  )
}
```

That's it. The binding should now be set up and keep slate and the yjs document in sync.
