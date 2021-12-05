// eslint-disable-next-line @typescript-eslint/ban-types
export function omit<TObj extends {}, TKeys extends keyof TObj>(
  obj: TObj,
  ...keys: TKeys[]
): Omit<TObj, TKeys> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as TKeys))
  ) as Omit<TObj, TKeys>;
}
