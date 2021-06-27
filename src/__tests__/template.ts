import * as emoji from '../emoji'
import { Emoji } from '../emoji'
import * as sequence from '../sequence'
import * as template from '../template'

describe('parseTemplate', () => {
  test('parses an empty string as an array with an empty array', () => {
    expect(template.parseTemplate('')).toStrictEqual([[]])
  })

  test('parses empty lines', () => {
    expect(template.parseTemplate('\n\n\n\n\n')).toEqual([
      [],
      [],
      [],
      [],
      [],
      [],
    ])
  })

  test('parses a scansion', () => {
    const scansion = '/xx/xx'
    expect(template.parseTemplate(scansion)).toEqual([
      [
        {
          type: 'scansion',
          scansion,
          rhymeId: undefined,
        },
      ],
    ])
  })

  test('parses a scansion with a group', () => {
    const scansion = '/xx/xx'
    const group = 'A'
    expect(template.parseTemplate(`${scansion} (${group})`)).toEqual([
      [
        {
          type: 'scansion',
          scansion,
          rhymeId: group,
        },
      ],
    ])
  })

  test('parses plain text', () => {
    const plainText = 'pizza. just some pizza'
    expect(template.parseTemplate(plainText)).toEqual([
      [
        {
          type: 'rawString',
          string: plainText,
        },
      ],
    ])
  })

  test('parses a line with multiple atoms', () => {
    const scansion1 = '/x/x/x'
    const scansion2 = '//////x//x'
    const rhyme2 = 'B'
    const scansionWithRhyme2 = `${scansion2}(${rhyme2})`
    const plainText = 'pizza, again'

    const scansions1Atom = template.parseTemplate(scansion1)[0][0]
    const scansions2Atom = template.parseTemplate(scansionWithRhyme2)[0][0]
    const plainTextAtom = template.parseTemplate(plainText)[0][0]

    const line = `${scansion1}${plainText}${scansionWithRhyme2}`

    expect(template.parseTemplate(line)).toEqual([
      [scansions1Atom, plainTextAtom, scansions2Atom],
    ])
  })

  test('parses different lines separately', () => {
    const line1 = '/xx/xx(A)/x/x(A) words'
    const line2 = 'and //(B) also'

    const parsedLine1 = template.parseTemplate(line1)
    const parsedLine2 = template.parseTemplate(line2)
    const parsedBothLines = template.parseTemplate(`${line1}\n${line2}`)
    expect(parsedBothLines).toEqual(parsedLine1.concat(parsedLine2))
  })

  test('returns effectively the same thing when all the lines are joined', () => {
    const lines = [
      '/xx/x/xx/x/xx(A)',
      'some text',
      '/xx/xx/xx(A) /xx/x/x/x(B)',
      '/x(B)/x/xx/x/xx/x/xx(A)',
      'hellooooo',
    ]

    const singleLineAtoms = template.parseTemplate(lines.join(''))
    const multipleLinesAtoms = template.parseTemplate(lines.join('\n'))

    expect(singleLineAtoms).toEqual([multipleLinesAtoms.flat()])
  })
})

describe('randomRhymeOptions', () => {
  test('returns an empty map when there are no groups', () => {
    const testTemplate = 'a template with no rhyme groups /xx/xx/x hello'
    const options = template.randomRhymeOptions(
      template.parseTemplate(testTemplate),
    )

    expect(options).toEqual(new Map())
  })

  test('every group has an entry in the returned map', () => {
    const testTemplate = 'some /xx/xx(A) rhyme groups /xx/(B) /xx/xx(A) /x/(B)'
    const options = template.randomRhymeOptions(
      template.parseTemplate(testTemplate),
    )

    expect(Array.from(options.keys())).toEqual(
      expect.arrayContaining(['A', 'B']),
    )
  })

  test('throw an error if a group is too restricted', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    const group = 'A'
    const testTemplate = `/(${group}) /x(${group}) /xx(${group})`

    expect(() =>
      template.randomRhymeOptions(template.parseTemplate(testTemplate)),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Can't find emoji that fit all the sections from rhyme group (${group})"`,
    )
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      `gave up on trying to find rhyming words for group (${group})`,
    )
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    consoleInfoSpy.mockRestore()
  })
})

describe('generate', () => {
  test('returns an empty string for an empty array', () => {
    expect(template.generate([], new Map())).toEqual({
      outputLines: [],
      rhymeOptions: new Map(),
    })
  })
})

describe('generateAtom', () => {
  test('returns the raw string for rawStrings', () => {
    const atom = {
      type: 'rawString' as const,
      string: 'pizza',
    }

    expect(template.generateAtom(atom, new Map())).toEqual(atom)
  })

  test('calls Sequence.match for scansions without group', () => {
    const spy = jest.spyOn(sequence, 'match')
    const atom = {
      type: 'scansion' as const,
      scansion: '/xx/xx',
    }
    template.generateAtom(atom, new Map())

    expect(spy).toHaveBeenCalledWith(atom.scansion, true)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  test('calls Sequence.matchWithConstainedEnd for scansions with groups', () => {
    const spy = jest.spyOn(sequence, 'matchWithConstrainedEnd')
    const atom = {
      type: 'scansion' as const,
      scansion: '/xx/xx',
      rhymeId: 'A',
    }
    const rhymeOptions: Emoji[] = [emoji.allEmoji.get('🦋')!]
    template.generateAtom(atom, new Map([['A', rhymeOptions]]))

    expect(spy).toHaveBeenCalledWith(atom.scansion, rhymeOptions, true)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})

describe('outputToString', () => {
  test('returns the raw string for a rawString', () => {
    const string = 'pizza'
    const atom = {
      type: 'rawString' as const,
      string,
    }

    expect(template.outputToString([[atom]])).toEqual(string)
  })

  test('returns the emoji with the unicde modifier for an emoji', () => {
    const butterfly = emoji.allEmoji.get('🦋')!
    const atom = {
      type: 'generatedSequence' as const,
      scansion: '/xx',
      sequence: [[butterfly, '/xx']] as [Emoji, string][],
    }

    expect(template.outputToString([[atom]])).toEqual(
      `${butterfly.character}\uFE0F`,
    )
  })

  test('joins atoms with an empty string', () => {
    const string = 'pizza'
    const atom1 = {
      type: 'rawString' as const,
      string,
    }

    const butterfly = emoji.allEmoji.get('🦋')!
    const atom2 = {
      type: 'generatedSequence' as const,
      scansion: '/xx',
      sequence: [[butterfly, '/xx']] as [Emoji, string][],
    }

    const atomString1 = template.outputToString([[atom1]])
    const atomString2 = template.outputToString([[atom2]])

    expect(template.outputToString([[atom1, atom2]])).toEqual(
      `${atomString1}${atomString2}`,
    )
  })

  test('joins lines with a \\n', () => {
    const string = 'pizza'
    const atom1 = {
      type: 'rawString' as const,
      string,
    }

    const butterfly = emoji.allEmoji.get('🦋')!
    const atom2 = {
      type: 'generatedSequence' as const,
      scansion: '/xx',
      sequence: [[butterfly, '/xx']] as [Emoji, string][],
    }

    const atomString1 = template.outputToString([[atom1]])
    const atomString2 = template.outputToString([[atom2]])

    expect(template.outputToString([[atom1], [atom2]])).toEqual(
      `${atomString1}\n${atomString2}`,
    )
  })
})
