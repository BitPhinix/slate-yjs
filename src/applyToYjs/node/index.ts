import { NodeOperation } from 'slate';
import { OpMapper } from '../types';
import insertNode from './insertNode';
import mergeNode from './mergeNode';
import moveNode from './moveNode';
import removeNode from './removeNode';
import setNode from './setNode';
import splitNode from './splitNode';

const mapper: OpMapper<NodeOperation> = {
  insert_node: insertNode,
  merge_node: mergeNode,
  move_node: moveNode,
  remove_node: removeNode,
  set_node: setNode,
  split_node: splitNode,
};

export default mapper;
