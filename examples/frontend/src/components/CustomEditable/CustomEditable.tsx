import React, { ComponentProps } from 'react';
import { Editable, useSlate } from 'slate-react';
import { Element } from '../Element/Element';
import { Leaf } from '../Leaf/Leaf';
import { Spinner } from '../Spinner/Spinner';

type CustomEditableProps = Omit<
  ComponentProps<typeof Editable>,
  'renderElement' | 'renderLeaf'
> &
  Partial<
    Pick<ComponentProps<typeof Editable>, 'renderElement' | 'renderLeaf'>
  >;

export function CustomEditable({
  renderElement = Element,
  renderLeaf = Leaf,
  ...props
}: CustomEditableProps) {
  const editor = useSlate();

  if (editor.sharedRoot.length === 0) {
    return <Spinner className="m-auto" />;
  }

  return (
    <Editable
      placeholder="Write something ..."
      {...props}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  );
}
