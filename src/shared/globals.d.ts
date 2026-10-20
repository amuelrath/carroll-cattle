export {}

declare global {
  /**
   * @description
   * For extracting all possible keys from a union of ``Record<K, V>``
   * where K is a union of string literals
   * @example
   * type AKeys = "One" | "Two" | "Three"
   * type A = Record<AKeys, string>
   *
   * type BKeys = "Three" | "Four" | "Five"
   * type B = Record<BKeys, string>
   *
   * // Gives the intersection of keys from A and B
   * type C = A | B
   * let allKeys: keyof C
   * // "Three"
   *
   * let allKeysGood: KeysOf<C>
   * // "One" | "Two" | "Three" | "Three" | "Four" | "Five
   */
  type KeysOf<T> = T extends unknown ? keyof T : never
  /**
   * @description
   * For typing ``Object.entries(obj)``
   * @example
   * const entries = Object.entries(myObj) as Entries<typeof myObj>
   */
  type Entries<T> = T extends unknown ? { [K in keyof T]: [K, T[K]] }[keyof T][] : never
}
