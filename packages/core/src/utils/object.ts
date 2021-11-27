type InspectableObject = Record<string | number | symbol, unknown>;

export function isObject(v: unknown): v is InspectableObject {
  return v !== null && typeof v === 'object';
}

export function deepEquals(
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

    return isObject(val2) && deepEquals(val1, val2);
  });
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function pick<TObj extends {}, TKeys extends keyof TObj>(
  obj: TObj,
  ...keys: TKeys[]
): Pick<TObj, TKeys> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as TKeys))
  ) as Pick<TObj, TKeys>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function omit<TObj extends {}, TKeys extends keyof TObj>(
  obj: TObj,
  ...keys: TKeys[]
): Omit<TObj, TKeys> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as TKeys))
  ) as Omit<TObj, TKeys>;
}
