import { tryMap, minBy, random, stringSplits } from './util'
import { allEmoji, Emoji, scansionOptions } from './emoji'

export function matchWithConstrainedEnd(
  scansion: string,
  endOptions: Emoji[],
): [Emoji, string][] {
  const validOptions = endOptions.filter((e) =>
    isEmojiValidAsEnding(e, scansion),
  )

  if (validOptions.length === 0) {
    throw new Error(
      `no relevant rhyming options form ${scansion} between ${endOptions
        .map((opt) => opt.character)
        .join('')}`,
    )
  }

  const option = random(validOptions)
  const beginningScansion = scansion.slice(0, -option.syllableCount)
  const endScansion = scansion.slice(-option.syllableCount)
  return [...match(beginningScansion), [option, endScansion]]
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

export function match(scansion: string): [Emoji, string][] {
  const split = preferrablyLongScansionSplit(scansion)

  if (!split) {
    throw new Error(`Unable to generate a line matching ${scansion}`)
  }
  return split.map((subscansion) => {
    const emojiOptions = scansionOptions.get(subscansion) as string[]
    const emoji = allEmoji.get(random(emojiOptions)) as Emoji
    return [emoji, subscansion]
  })
}

function preferrablyLongScansionSplit(
  scansion: string,
  attempts: number = 10,
): string[] | undefined {
  const valids = [...validScansionSplits(scansion)]
  if (valids.length === 0) {
    return undefined
  }

  const randoms = new Array(attempts).fill(0).map(() => random(valids))
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
