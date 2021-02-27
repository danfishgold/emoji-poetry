import { sum, random, minBy } from './util'
import emojiData from './emoji.json'

export type BaseProperties = {
  character: string
  phrase: string
  syllables: number[][]
}

export class Emoji {
  character: string
  phrase: string
  syllables: number[][]
  syllableCount: number

  constructor({ character, phrase, syllables }: BaseProperties) {
    this.character = character
    this.phrase = phrase.toLowerCase()
    this.syllables = syllables
    this.syllableCount = sum(this.syllables.map((sylls) => sylls.length))
  }

  matchesPattern(pattern: string): boolean {
    let patternOffset = 0
    for (const wordSyllables of this.syllables) {
      const len = wordSyllables.length
      if (
        !this.wordSyllablesMatchPattern(
          wordSyllables,
          pattern.slice(patternOffset, patternOffset + len),
        )
      ) {
        return false
      }
      patternOffset += len
    }

    return true
  }

  private wordSyllablesMatchPattern(word: number[], pattern: string): boolean {
    if (word.length !== pattern.length) {
      return false
    }

    if (word.length === 1) {
      return true
    }

    return word.every((syllable, index) =>
      this.syllableMatchesPattern(syllable, pattern[index]),
    )
  }

  private syllableMatchesPattern(
    syllable: number,
    pattern: '/' | 'x' | string,
  ): boolean {
    switch (pattern) {
      case '/': {
        return syllable === 1 || syllable === 2
      }
      case 'x': {
        return syllable === 0 || syllable === 2
      }
      default: {
        throw new Error(`Couldn't parse pattern: ${pattern}`)
      }
    }
  }
}

export const emoji = emojiData.emoji.map((properties) => new Emoji(properties))

const emojiByCharacter = new Map(emoji.map((e) => [e.character, e]))

export function randomRhymingPatternOptions(
  patterns: string[],
  remainingTries: number = 10000,
): Emoji[][] {
  if (patterns.length < 2) {
    return patterns.map((p) => eagerRandomPatternOption(p, remainingTries))
  }

  if (remainingTries === 0) {
    throw new Error(`nioeee with ${patterns.join(' ')}`)
  }

  const rhymingGroup = [...random(emojiData.rhymes)].map(
    (e) => emojiByCharacter.get(e)!,
  )

  try {
    return patterns.map((pattern) =>
      randomPatternOptionWithEndFromOptions(pattern, rhymingGroup),
    )
  } catch {
    return randomRhymingPatternOptions(patterns, remainingTries - 1)
  }
}

function randomPatternOptionWithEndFromOptions(
  pattern: string,
  options: Emoji[],
  remainingTries: number = 10000,
): Emoji[] {
  const relevantOptions = options.filter((option) => {
    const subpattern = pattern.slice(-option.syllableCount)
    return option.matchesPattern(subpattern)
  })

  if (relevantOptions.length === 0) {
    throw new Error('nope')
  }

  const option = random(relevantOptions)
  return randomPatternOption(
    pattern.slice(0, -option.syllableCount),
    remainingTries,
  ).concat([option])
}

// calls eagerRandomPatternOption [cohortSize] times and takes the result with
// the fewest characters of those, in an effort to avoid sequences that
// are just monosyllabic emoji
export function randomPatternOption(
  pattern: string,
  remainingTries: number = 10000,
  cohortSize: number = 20,
): Emoji[] {
  const attempts = new Array(cohortSize)
    .fill(0)
    .map(() => eagerRandomPatternOption(pattern, remainingTries))

  return minBy(attempts, (line) => line.length)[0]
}

// tries to generate a sequence that matches the pattern. stops as soon as it finds one
export function eagerRandomPatternOption(
  pattern: string,
  remainingTries: number = 10000,
): Emoji[] {
  if (pattern.length === 0) {
    return []
  }

  if (remainingTries === 0) {
    throw new Error(
      `Failed to build a phrase with the pattern ${JSON.stringify(pattern)}`,
    )
  }

  const first = random(emoji)
  if (first.syllableCount > JSON.stringify(pattern).length) {
    return eagerRandomPatternOption(pattern, remainingTries)
  }

  if (!first.matchesPattern(pattern.slice(0, first.syllableCount))) {
    return eagerRandomPatternOption(pattern, remainingTries - 1)
  }

  const ending = eagerRandomPatternOption(
    pattern.slice(first.syllableCount),
    remainingTries,
  )

  return [first].concat(ending)
}

function parsePattern(pattern: string): string {
  return pattern
}
