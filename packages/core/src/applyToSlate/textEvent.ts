import { Editor, Element, Node, Operation, Path, Text } from 'slate';
import * as Y from 'yjs';
import { Delta, InsertDelta, YNodePath } from '../model/types';
import { deltaInsertToSlateNode, yTextToSlateElement } from '../utils/convert';
import { getNodeLength } from '../utils/location';
import { deepEqual } from '../utils/object';
import { getMarks } from '../utils/slate';

function getSlateOffsets(node: Element, yOffset: number): [number, number] {
  let currentOffset = 0;
  for (let pathOffset = 0; pathOffset < node.children.length; pathOffset++) {
    const child = node.children[pathOffset];
    const nodeLength = Text.isText(child) ? child.text.length : 1;

    if (
      currentOffset + nodeLength > yOffset &&
      (nodeLength > 0 || pathOffset === node.children.length - 1)
    ) {
      return [pathOffset, yOffset - currentOffset];
    }

    currentOffset += nodeLength;
  }

  if (currentOffset + 1 < yOffset) {
    throw new Error("yOffset doesn't match slate node, index out of bounds");
  }

  return [node.children.length, 0];
}

function applyDelta(node: Element, slatePath: Path, delta: Delta): Operation[] {
  const ops: Operation[] = [];

  let yOffset = delta.reduce((length, change) => {
    if ('retain' in change) {
      return length + change.retain;
    }

    if ('delete' in change) {
      return length + change.delete;
    }

    return length;
  }, 0);

  // Apply changes in reverse order to avoid path changes.
  delta.reverse().forEach((change) => {
    if ('retain' in change) {
      yOffset -= change.retain;
    }

    if ('delete' in change) {
      const [startPathOffset, startTextOffset] = getSlateOffsets(
        node,
        yOffset - change.delete
      );
      const [endPathOffset, endTextOffset] = getSlateOffsets(node, yOffset);

      for (
        let pathOffset =
          endTextOffset === 0 ? endPathOffset - 1 : endPathOffset;
        pathOffset >= startPathOffset;
        pathOffset--
      ) {
        const child = node.children[pathOffset];
        const childPath = [...slatePath, pathOffset];

        if (
          Text.isText(child) &&
          (pathOffset === startPathOffset || pathOffset === endPathOffset)
        ) {
          const start = pathOffset === startPathOffset ? startTextOffset : 0;
          const end =
            pathOffset === endPathOffset ? endTextOffset : child.text.length;

          ops.push({
            type: 'remove_text',
            offset: start,
            text: child.text.slice(start, end),
            path: childPath,
          });

          yOffset -= end - start;
          continue;
        }

        ops.push({
          type: 'remove_node',
          node: child,
          path: childPath,
        });
        yOffset -= getNodeLength(child);
      }

      return;
    }

    if ('insert' in change) {
      const [pathOffset, textOffset] = getSlateOffsets(node, yOffset);
      const child = node.children[pathOffset];
      const childPath = [...slatePath, pathOffset];

      if (Text.isText(child)) {
        if (
          typeof change.insert === 'string' &&
          deepEqual(change.attributes ?? {}, getMarks(child))
        ) {
          return ops.push({
            type: 'insert_text',
            offset: textOffset,
            text: change.insert,
            path: childPath,
          });
        }

        const toInsert = deltaInsertToSlateNode(change);
        if (textOffset === 0) {
          return ops.push({
            type: 'insert_node',
            path: childPath,
            node: toInsert,
          });
        }

        if (textOffset < delta.length) {
          ops.push({
            type: 'split_node',
            path: childPath,
            position: textOffset,
            properties: getMarks(child),
          });
        }

        return ops.push({
          type: 'insert_node',
          path: Path.next(childPath),
          node: toInsert,
        });
      }

      return ops.push({
        type: 'insert_node',
        path: childPath,
        node: deltaInsertToSlateNode(change),
      });
    }
  });

  return ops;
}

function getYNodePath(root: Y.XmlText, yText: Y.XmlText) {
  const pathNodes = [yText];
  while (pathNodes[0] !== root) {
    const { parent } = pathNodes[0];

    if (!parent) {
      throw new Error("yText isn't a descendant of root element");
    }

    if (!(parent instanceof Y.XmlText)) {
      throw new Error('Unexpected y parent type');
    }

    pathNodes.unshift(parent);
  }

  return pathNodes;
}

function yNodeToSlatePath(node: Node, yNodePath: YNodePath): Path {
  if (yNodePath.length < 2) {
    return [];
  }

  const [current, yChild] = yNodePath;
  const currentDelta = current.toDelta() as InsertDelta;

  let yOffset = 0;
  for (const element of currentDelta) {
    if (element.insert === yChild) {
      break;
    }

    yOffset += typeof element.insert === 'string' ? element.insert.length : 1;
  }

  if (Text.isText(node)) {
    throw new Error('Cannot descend into text');
  }

  const [pathOffset] = getSlateOffsets(node, yOffset);
  return [
    pathOffset,
    ...yNodeToSlatePath(node.children[pathOffset], yNodePath.slice(-1)),
  ];
}

function getSlatePath(root: Y.XmlText, node: Node, yText: Y.XmlText): Path {
  const yNodePath = getYNodePath(root, yText);
  const path = yNodeToSlatePath(node, yNodePath);
  return path;
}

export function translateYTextEvent(
  root: Y.XmlText,
  editor: Editor,
  event: Y.YTextEvent
): Operation[] {
  const { target, changes } = event;
  const delta = event.delta as Delta;

  if (!(target instanceof Y.XmlText)) {
    throw new Error('Unexpected target node type');
  }

  const ops: Operation[] = [];

  const slatePath = getSlatePath(root, editor, target);
  const targetElement = Node.get(editor, slatePath);

  if (Text.isText(targetElement)) {
    throw new Error('Cannot apply yTextEvent to text node');
  }

  const keyChanges = Array.from(changes.keys.entries());
  if (slatePath.length > 0 && keyChanges.length > 0) {
    const newProperties = Object.fromEntries(
      keyChanges.map(([key, info]) => [
        key,
        info.action === 'delete' ? null : target.getAttribute(key),
      ])
    );

    const properties = Object.fromEntries(
      keyChanges.map(([key]) => [key, targetElement[key]])
    );

    ops.push({ type: 'set_node', newProperties, properties, path: slatePath });
  }

  if (delta.length > 0) {
    if (Text.isText(target)) {
      throw new Error('Cannot apply delta to slate text');
    }

    ops.push(...applyDelta(targetElement, slatePath, delta));
  }

  return ops;
}
