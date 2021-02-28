import { sum } from './util'
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

  matchesScansion(scansion: string): boolean {
    let scansionOffset = 0
    for (const wordSyllables of this.syllables) {
      const len = wordSyllables.length
      if (
        !this.wordSyllablesMatchScansion(
          wordSyllables,
          scansion.slice(scansionOffset, scansionOffset + len),
        )
      ) {
        return false
      }
      scansionOffset += len
    }

    return true
  }

  private wordSyllablesMatchScansion(
    word: number[],
    scansion: string,
  ): boolean {
    if (word.length !== scansion.length) {
      return false
    }

    if (word.length === 1) {
      return true
    }

    return word.every((syllable, index) =>
      this.syllableMatchesScansion(syllable, scansion[index]),
    )
  }

  private syllableMatchesScansion(
    syllable: number,
    scansion: '/' | 'x' | string,
  ): boolean {
    switch (scansion) {
      case '/': {
        return syllable === 1 || syllable === 2
      }
      case 'x': {
        return syllable === 0 || syllable === 2
      }
      default: {
        throw new Error(`Couldn't parse scansion: ${scansion}`)
      }
    }
  }
}

export const emoji = emojiData.emoji.map((properties) => new Emoji(properties))
const emojiByCharacter = new Map(emoji.map((e) => [e.character, e]))
export const rhymeGroups = emojiData.rhymes.map((group) =>
  [...group].map((char) => emojiByCharacter.get(char)!),
)
