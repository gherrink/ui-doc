// https://mvasilkov.animuchan.net/typescript-positive-integer-type
export type PositiveInteger<T extends number = number> = `${T}` extends
  | '0'
  | `-${string}`
  | `${string}.${string}`
  ? never
  : T
