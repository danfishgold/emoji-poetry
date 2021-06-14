import * as mockEmoji from '../emoji'
import * as sequence from '../sequence'
jest.mock(
  '../emojiData.json',
  () => ({
    scansionOptions: {
      '/': '🦵🥚',
      '/x': '💄',
      '//': '💄',
    },
    emojiProperties: {
      '🦵': { name: 'leg', syllableCount: 1, scansions: ['/'] },
      '🥚': { name: 'egg', syllableCount: 1, scansions: ['/'] },
      '💄': { name: 'lipstick', syllableCount: 2, scansions: ['/x', '//'] },
    },
    rhymes: ['🦵🥚'],
  }),
  { virtual: true },
)

describe('isSequenceValidAsEnding', () => {
  test('return true if the sequence and the scansion are the same', () => {
    expect(sequence.isSequenceValidAsEnding('/xxx', '/xxx')).toBeTruthy()
  })

  test("return false if the ending of the scansion doesn't match the sequence", () => {
    expect(sequence.isSequenceValidAsEnding('/', '/xxx')).toBeFalsy()
  })

  test('the validity of the ending sequence is not verified', () => {
    // xx is invalid
    expect(sequence.isSequenceValidAsEnding('xx', '/xxx')).toBeTruthy()
    // /x is valid
    expect(sequence.isSequenceValidAsEnding('/x', '/x/x')).toBeTruthy()
  })

  test('return false if the beginning has no scansion options', () => {
    expect(sequence.isSequenceValidAsEnding('xx', 'xxxx')).toBeFalsy()
  })
})

describe('match', () => {
  describe('an empty string', () => {
    test('returns an empty list', () => {
      expect(sequence.match('')).toEqual([])
    })
  })

  describe('a single syllable', () => {
    test('returns an array with one element', () => {
      expect(sequence.match('x')).toHaveLength(1)
    })

    test('the single array element is an emoji with a single syllable', () => {
      expect(sequence.match('/')[0][0].scansions).toContain('/')
      expect(sequence.match('x')[0][0].scansions).toContain('/')
    })
  })

  test('throws an error for an impossible scansion', () => {
    expect(() => sequence.match('xxxxxxxx')).toThrowErrorMatchingInlineSnapshot(
      `"Can't find emoji to fit xxxxxxxx"`,
    )
  })

  test('the subscansion + emoji pairs match', () => {
    const randomScansion = '///x/x/x//'
    const match = sequence.match(randomScansion)
    for (const [emoji, subscansion] of match) {
      expect(emoji.scansions).toContain(subscansion)
    }
  })

  test('the joint output subscansions build the input scansion', () => {
    const randomScansion = '///x/x/x//'
    const match = sequence.match(randomScansion)
    const reconstructedScansion = match
      .map(([_, subscansion]) => subscansion)
      .join('')
    expect(reconstructedScansion).toEqual(randomScansion)
  })
})

describe('matchWithConstrainedEnd', () => {
  test('throws an error if there are no endOptions', () => {
    expect(() =>
      sequence.matchWithConstrainedEnd('x/x/', []),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Can't find emoji that fit the rhyme for x/x/ between []"`,
    )
  })

  test('throws an error if none of the endOptions is valid', () => {
    const lipstick = mockEmoji.allEmoji.get('💄')
    if (!lipstick) {
      throw new Error(`Lipstick emoji data is missing`)
    }
    expect(() => {
      sequence.matchWithConstrainedEnd('xx//', [lipstick])
    }).toThrowErrorMatchingInlineSnapshot(
      `"Can't find emoji that fit the rhyme for xx// between [💄]"`,
    )
  })

  test("throws an error if the end options can't match the end subscansion", () => {
    const egg = mockEmoji.allEmoji.get('🥚')
    if (!egg) {
      throw new Error(`Egg emoji data is missing`)
    }

    expect(() =>
      sequence.matchWithConstrainedEnd('///x', [egg]),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Can't find emoji that fit the rhyme for ///x between [🥚]"`,
    )
  })

  test('the last emoji is one of the end options', () => {
    const egg = mockEmoji.allEmoji.get('🥚')
    const leg = mockEmoji.allEmoji.get('🦵')
    if (!egg || !leg) {
      throw new Error(`egg or leg emoji data is missing`)
    }
    const randomScansion = '//x//////x//'
    const endOptions = [egg, leg]

    const match = sequence.matchWithConstrainedEnd(randomScansion, endOptions)
    const lastEmoji = match[match.length - 1][0].character
    expect(endOptions.map((emoji) => emoji.character)).toContain(lastEmoji)
  })

  test('the subscansion + emoji pairs match', () => {
    const lipstick = mockEmoji.allEmoji.get('💄')
    if (!lipstick) {
      throw new Error(`Lipstick emoji data is missing`)
    }
    const randomScansion = '///x/x/x//'
    const match = sequence.matchWithConstrainedEnd(randomScansion, [lipstick])
    for (const [emoji, subscansion] of match) {
      expect(emoji.scansions).toContain(subscansion)
    }
  })

  test('the joint output subscansions build the input scansion', () => {
    const lipstick = mockEmoji.allEmoji.get('💄')
    if (!lipstick) {
      throw new Error(`Lipstick emoji data is missing`)
    }
    const randomScansion = '///x/x/x//'
    const match = sequence.matchWithConstrainedEnd(randomScansion, [lipstick])
    const reconstructedScansion = match
      .map(([_, subscansion]) => subscansion)
      .join('')
    expect(reconstructedScansion).toEqual(randomScansion)
  })
})
