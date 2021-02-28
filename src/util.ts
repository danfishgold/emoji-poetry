export function sum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0)
}

export function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function minBy<T>(array: T[], fn: (el: T) => number): [T, number] {
  return extremumBy(array, fn, Math.min)
}

export function maxBy<T>(array: T[], fn: (el: T) => number): [T, number] {
  return extremumBy(array, fn, Math.max)
}

function extremumBy<T>(
  array: T[],
  pluck: (el: T) => number,
  extremum: (...values: number[]) => number,
): [T, number] {
  const firstPair: [number, T, number] = [pluck(array[0]), array[0], 0]
  const bestPair = array.slice(1).reduce((best, next, nextIndex) => {
    const pair: [number, T, number] = [pluck(next), next, nextIndex]
    if (extremum(best[0], pair[0]) == best[0]) {
      return best
    } else {
      return pair
    }
  }, firstPair)

  return [bestPair[1], bestPair[2]]
}

export function mapToObject<V>(map: Map<string, V>): { [key: string]: V } {
  const object: { [key: string]: V } = {}
  map.forEach((value, key) => {
    object[key] = value
  })

  return object
}

export function* stringSplits(
  str: string,
  isSubstringValid: (substring: string) => boolean,
): Generator<string[]> {
  if (str.length === 0) {
    yield []
    return
  }
  for (let length = 1; length <= str.length; length++) {
    const start = str.slice(0, length)
    if (!isSubstringValid(start)) {
      continue
    }
    for (const tailSplit of stringSplits(str.slice(length), isSubstringValid)) {
      yield [start, ...tailSplit]
    }
  }
}

export function compactMap<T, R>(
  array: T[],
  fn: (el: T, index: number) => R | undefined,
): R[] {
  return array.map(fn).filter((res): res is R => res !== undefined)
}

export function tryMap<T, R>(array: T[], fn: (el: T, index: number) => R): R[] {
  return compactMap(array, (el, index) => {
    try {
      return fn(el, index)
    } catch {
      return undefined
    }
  })
}
