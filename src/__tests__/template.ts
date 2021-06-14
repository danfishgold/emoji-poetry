import * as template from '../template'

describe('parseTemplate', () => {
  test('parses an empty string as an array with an empty array', () => {
    expect(template.parseTemplate('')).toStrictEqual([[]])
  })

  test.todo('parses a scansion')
  test.todo('parses a scansion with a group')
  test.todo('parses plain text')
})

describe('randomRhymeOptions', () => {
  test.todo('returns an empty map when there are no groups')
  test.todo('every group has an entry in the returned map')
  test.todo('throw an error if a group is too restricted')
  test.todo('every scansion can end with at least one emoji of its options')
})

describe('generate', () => {
  test.todo('returns an empty string for an empty array')
  test.todo('returns effectively the same thing when all the lines are joined')
})

describe('generateAtom', () => {
  test.todo('returns the raw string for rawStrings')
  test.todo('calls Sequence.match for scansions without group')
  test.todo('calls Sequence.matchWithConstainedEnd for scansions with groups')
})

describe('outputToString', () => {
  test.todo('returns the raw string for a rawString')
  test.todo('returns the emoji with the unicde modifier for an emoji')
  test.todo('joins atoms with an empty string')
  test.todo('joins lines with a \\n')
})
