import { useCallback, useEffect, useState } from 'react';
import { Path, Range, Text } from 'slate';
import { relativePositionToAbsolutePosition } from '../cursor/utils';
export const useCursors = (editor) => {
    const [cursors, setCursorData] = useState([]);
    useEffect(() => {
        editor.awareness.on('update', () => {
            const newCursorData = Array.from(editor.awareness.getStates())
                .filter(([clientId]) => { var _a; return clientId !== ((_a = editor.sharedType.doc) === null || _a === void 0 ? void 0 : _a.clientID); })
                .map(([, awareness]) => {
                let anchor = null;
                let focus = null;
                if (awareness.anchor) {
                    anchor = relativePositionToAbsolutePosition(editor.sharedType, awareness.anchor);
                }
                if (awareness.focus) {
                    focus = relativePositionToAbsolutePosition(editor.sharedType, awareness.focus);
                }
                return { anchor, focus, data: awareness };
            })
                .filter((cursor) => cursor.anchor && cursor.focus);
            setCursorData(newCursorData);
        });
    }, [editor]);
    const decorate = useCallback(([node, path]) => {
        const ranges = [];
        if (Text.isText(node) && (cursors === null || cursors === void 0 ? void 0 : cursors.length)) {
            cursors.forEach((cursor) => {
                if (Range.includes(cursor, path)) {
                    const { focus, anchor, data } = cursor;
                    const isFocusNode = Path.equals(focus.path, path);
                    const isAnchorNode = Path.equals(anchor.path, path);
                    const isForward = Range.isForward({ anchor, focus });
                    ranges.push({
                        data,
                        isForward,
                        isCaret: isFocusNode,
                        anchor: {
                            path,
                            // eslint-disable-next-line no-nested-ternary
                            offset: isAnchorNode
                                ? anchor.offset
                                : isForward
                                    ? 0
                                    : node.text.length,
                        },
                        focus: {
                            path,
                            // eslint-disable-next-line no-nested-ternary
                            offset: isFocusNode
                                ? focus.offset
                                : isForward
                                    ? node.text.length
                                    : 0,
                        },
                    });
                }
            });
        }
        return ranges;
    }, [cursors]);
    return { decorate, cursors };
};
export default useCursors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlQ3Vyc29ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wbHVnaW4vdXNlQ3Vyc29ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekQsT0FBTyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRXJELE9BQU8sRUFBRSxrQ0FBa0MsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBR3JFLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxDQUN4QixNQUFvQixFQUlwQixFQUFFO0lBQ0YsTUFBTSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsR0FBRyxRQUFRLENBQVcsRUFBRSxDQUFDLENBQUM7SUFFeEQsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDakMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO2lCQUMzRCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsV0FBQyxPQUFBLFFBQVEsTUFBSyxNQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRywwQ0FBRSxRQUFRLENBQUEsQ0FBQSxFQUFBLENBQUM7aUJBQ3BFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFO2dCQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztnQkFFakIsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO29CQUNwQixNQUFNLEdBQUcsa0NBQWtDLENBQ3pDLE1BQU0sQ0FBQyxVQUFVLEVBQ2pCLFNBQVMsQ0FB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