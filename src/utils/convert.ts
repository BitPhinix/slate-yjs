import { Node, Text, Element, Path } from 'slate'
import { SyncElement, SyncDoc } from '../model'
import * as Y from 'yjs'

export const toSlateNode = (element: SyncElement): Node => {
  const text = SyncElement.getText(element)
  const children = SyncElement.getChildren(element)

  const node: Partial<Node> = {}
  if (text !== undefined) {
    node.text = text.toString()
  }
  if (children !== undefined) {
    node.children = children.map(toSlateNode)
  }

  for (const [key, value] of element.entries()) {
    if (key !== 'children' && key !== 'text') {
      node[key] = value
    }
  }

  return node as Node
}

export const toSlateDoc = (doc: SyncDoc): Node[] => {
  return doc.map(toSlateNode)
}

export const toSyncDoc = (syncDoc: SyncDoc, doc: Node[]) => {
  syncDoc.insert(0, doc.map(toSyncElement))
  return syncDoc
}

export const toSyncElement = (node: Node): SyncElement => {
  const element: SyncElement = new Y.Map()

  if (Element.isElement(node)) {
    const childElements = node.children.map(toSyncElement)
    const childContainer = new Y.Array()
    childContainer.insert(0, childElements)
    element.set('children', childContainer)
  }

  if (Text.isText(node)) {
    const textElement = new Y.Text(node.text)
    element.set('text', textElement)
  }

  for (const [key, value] of Object.entries(node)) {
    if (key !== 'children' && key !== 'text') {
      element.set(key, value)
    }
  }

  return element
}

export const toSlatePath = (path: (string | number)[]): Path => {
  return path.filter(node => typeof node === 'number') as Path
}
