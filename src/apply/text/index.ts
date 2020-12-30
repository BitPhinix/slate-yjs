import { TextOperation } from 'slate';
import { OpMapper } from '../types';
import insertText from './insertText';
import removeText from './removeText';

const mappers: OpMapper<TextOperation> = {
  insert_text: insertText,
  remove_text: removeText,
};

export default mappers;
