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

export function randomPatternOptionButPreferrablyLong(
  pattern: string,
  remainingTries: number = 10000,
) {
  const attempts = new Array(20)
    .fill(0)
    .map(() => randomPatternOption(pattern, remainingTries))

  return minBy(attempts, (line) => line.length)
}

export function randomPatternOption(
  pattern: string,
  remainingTries: number = 10000,
): Emoji[] {
  if (pattern.length === 0) {
    return []
  }

  if (remainingTries === 0) {
    throw new Error(`Failed to build a phrase with the pattern ${pattern}`)
  }

  const first = random(emoji)
  if (first.syllableCount > pattern.length) {
    return randomPatternOption(pattern, remainingTries)
  }

  if (!first.matchesPattern(pattern.slice(0, first.syllableCount))) {
    return randomPatternOption(pattern, remainingTries - 1)
  }

  const ending = randomPatternOption(
    pattern.slice(first.syllableCount),
    remainingTries,
  )

  return [first].concat(ending)
}

function parsePattern(pattern: string): string {
  return pattern
}
