import { name } from 'faker';
import randomColor from 'randomcolor';
import { CursorData } from './types';

export function randomCursorData(): CursorData {
  return {
    color: randomColor({
      luminosity: 'dark',
      alpha: 1,
      format: 'hex',
    }),
    name: `${name.firstName()} ${name.lastName()}`,
  };
}
