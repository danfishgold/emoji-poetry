import {
  compactMap,
  mapToObject,
  maxBy,
  minBy,
  random,
  stringSplits,
  sum,
} from '../util'

describe('sum', () => {
  test('sum of empty list is zero', () => {
    expect(sum([])).toBe(0)
  })

  test('sum of singleton is itself', () => {
    const number = Math.random()
    expect(sum([number])).toBe(number)
  })
})

describe('random', () => {
  test('returns undefined for an empty array', () => {
    expect(random([])).toBeUndefined()
  })

  test("returns an element from the array when it's not empty", () => {
    const array = new Array(10).fill(null).map(() => Math.random())
    const randomElement = random(array)
    expect(array).toContain(randomElement)
  })
})

describe('minBy and maxBy', () => {
  test('throws when the array is empty', () => {
    expect(() => {
      minBy([], () => 5)
    }).toThrowErrorMatchingInlineSnapshot(
      `"Can't find min/max on an empty array"`,
    )

    expect(() => {
      maxBy([], () => 5)
    }).toThrowErrorMatchingInlineSnapshot(
      `"Can't find min/max on an empty array"`,
    )
  })

  test('the index matches the position of the element', () => {
    const array = new Array(10).fill(null).map(() => Math.random())

    const [minItem, minIndex] = minBy(array, (n) => n)
    const [maxItem, maxIndex] = maxBy(array, (n) => n)

    expect(array.findIndex((x) => x === minItem)).toBe(minIndex)
    expect(array.findIndex((x) => x === maxItem)).toBe(maxIndex)
  })

  test('same as min/max when the pluck function is the identity', () => {
    const array = new Array(10)
      .fill(null)
      .map(() => Math.random())
      .sort()
    const minned = minBy(array, (n) => n)
    const maxxed = maxBy(array, (n) => n)

    expect(minned[0]).toBe(Math.min(...array))
    expect(maxxed[0]).toBe(Math.max(...array))
    expect(minned[1]).toBe(0)
    expect(maxxed[1]).toBe(array.length - 1)
  })

  test('minBy and maxBy return the same when the pluck functions are inverted', () => {
    const array = new Array(10).fill(null).map(() => Math.random())

    const identity = (n: number) => n
    const negate = (n: number) => -n

    expect(minBy(array, identity)).toEqual(maxBy(array, negate))
    expect(maxBy(array, identity)).toEqual(minBy(array, negate))
  })
})

describe('mapToObject', () => {
  test('input has the same entries as the input', () => {
    const items = {
      pizza: Math.random(),
      yes: true,
      no: 'true',
      anArrayOrSomething: [1, 3, 5, true, '-5'],
    }

    const map = new Map(Object.entries(items))
    expect(mapToObject(map)).toEqual(items)
  })
})

describe('stringSplits', () => {
  test('yields a single empty option for an empty string', () => {
    const generator = stringSplits('', () => true)
    expect(Array.from(generator)).toEqual([[]])
  })

  test('a single character yields a single option with just a single substring', () => {
    const generator = stringSplits('a', () => true)
    expect(Array.from(generator)).toEqual([['a']])
  })

  test('returns 2^(n-1) options', () => {
    const generator = stringSplits('123456', () => true)
    expect(Array.from(generator)).toHaveLength(32)
  })

  test('all options equal the original string when concatenated', () => {
    const string = '12345'
    const generator = stringSplits(string, () => true)
    const options = Array.from(generator)
    const jointOptions = options.map((substrings) => substrings.join(''))

    expect(jointOptions.every((join) => join === string)).toBeTruthy()
  })

  test('isSubstringValid is used', () => {
    const generator = stringSplits(
      '123456789',
      (substring) => substring.length == 3,
    )
    expect(Array.from(generator)).toEqual([['123', '456', '789']])
  })
})

describe('compactMap', () => {
  test('empty output array for empty input array', () => {
    expect(compactMap([], (x) => x)).toEqual([])
  })

  test('empty output when fn returns only undefined', () => {
    expect(compactMap([1, 23, 4, 5, 6], (x) => undefined)).toEqual([])
  })

  test('same as map when fn never returns undefined', () => {
    const array = [1, 2, 46, 78, 456, 45, 52]
    const fn = (x: number) => 2 * x
    expect(compactMap(array, fn)).toEqual(array.map(fn))
  })

  test("the output array doesn't contain undefined", () => {
    const array = [1, 2, 46, 78, 456, 45, 52]
    const fn = () => (Math.random() > 0.5 ? undefined : 5)
    expect(compactMap(array, fn)).not.toContain(undefined)
  })
})
