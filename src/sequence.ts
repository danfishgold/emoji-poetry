import { minBy, random, stringSplits } from './util'
import { allEmoji, Emoji, scansionOptions } from './emoji'
import { ScansionRhymeError, ScansionError } from './errors'

export function matchWithConstrainedEnd(
  scansion: string,
  endOptions: Emoji[],
  preferrablyLongScansions: boolean = true,
): [Emoji, string][] {
  const validOptions = endOptions.filter((e) =>
    isEmojiValidAsEnding(e, scansion),
  )

  if (validOptions.length === 0) {
    throw new ScansionRhymeError(scansion, endOptions)
  }

  const option = random(validOptions)
  const beginningScansion = scansion.slice(0, -option.syllableCount)
  const endScansion = scansion.slice(-option.syllableCount)
  return [
    ...match(beginningScansion, preferrablyLongScansions),
    [option, endScansion],
  ]
}

export function isEmojiValidAsEnding(emoji: Emoji, scansion: string): boolean {
  return emoji.scansions.some((sequence) =>
    isSequenceValidAsEnding(sequence, scansion),
  )
}

export function isSequenceValidAsEnding(
  sequence: string,
  scansion: string,
): boolean {
  if (!scansion.endsWith(sequence)) {
    return false
  }
  return isScansionValid(scansion.slice(0, -sequence.length))
}

export function match(
  scansion: string,
  preferrablyLongScansions: boolean = true,
): [Emoji, string][] {
  if (scansion === 'x') {
    return match('/')
  }
  const split = randomScansionSplit(scansion, preferrablyLongScansions ? 10 : 1)

  if (!split) {
    throw new ScansionError(scansion)
  }
  return split.map((subscansion) => {
    const emojiOptions = scansionOptions.get(subscansion) as string[]
    const emoji = allEmoji.get(random(emojiOptions)) as Emoji
    return [emoji, subscansion]
  })
}

function randomScansionSplit(
  scansion: string,
  cohorstSize: number = 10,
): string[] | undefined {
  const valids = [...validScansionSplits(scansion)]
  if (valids.length === 0) {
    return undefined
  }

  const randoms = new Array(cohorstSize).fill(0).map(() => random(valids))
  return minBy(randoms, (split) => split.length)[0]
}

function validScansionSplits(scansion: string): Generator<string[]> {
  return stringSplits(scansion, (subscansion) =>
    scansionOptions.has(subscansion),
  )
}

const scansionGeneratability = new Map<string, boolean>()
function isScansionValid(scansion: string): boolean {
  const storedValue = scansionGeneratability.get(scansion)

  if (storedValue !== undefined) {
    return storedValue
  }

  const firstValidScansion = validScansionSplits(scansion).next()
  scansionGeneratability.set(scansion, !firstValidScansion.done)
  return !firstValidScansion.done
}
