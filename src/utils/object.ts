type InspectableObject = Record<string | number | symbol, unknown>;

export function isObject(v: unknown): v is InspectableObject {
  return v !== null && typeof v === 'object';
}

export function deepEqual(
  obj: InspectableObject,
  other: InspectableObject
): boolean {
  const keys1 = Object.keys(obj);
  const keys2 = Object.keys(other);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => {
    const val1 = obj[key];
    const val2 = other[key];

    if (!isObject(val1)) {
      return val1 === val2;
    }

    return isObject(val2) && deepEqual(val1, val2);
  });
}
