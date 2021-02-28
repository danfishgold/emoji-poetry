import { Emoji, emoji } from './emoji'
import { minBy, random } from './util'

export function matchWithConstrainedEnd(
  scansion: string,
  endOptions: Emoji[],
  remainingTries: number = 10000,
): [Emoji, string][] {
  const relevantOptions = endOptions.filter((option) => {
    const ending = scansion.slice(-option.syllableCount)
    return option.matchesScansion(ending)
  })

  if (relevantOptions.length === 0) {
    throw new Error(
      `no relevant rhyming options form ${scansion} between ${endOptions
        .map((opt) => opt.character)
        .join('')}`,
    )
  }

  const option = random(relevantOptions)
  return match(
    scansion.slice(0, -option.syllableCount),
    remainingTries,
  ).concat([[option, scansion.slice(-option.syllableCount)]])
}

// calls eagerMatch [cohortSize] times and takes the result with
// the fewest characters of those, in an effort to avoid sequences that
// are just monosyllabic emoji
export function match(
  scansion: string,
  remainingTries: number = 10000,
  cohortSize: number = 20,
): [Emoji, string][] {
  const attempts = new Array(cohortSize)
    .fill(0)
    .map(() => eagerMatch(scansion, remainingTries))

  return minBy(attempts, (sequence) => sequence.length)[0]
}

// tries to generate a sequence that matches the scansion.
// stops as soon as it finds one
function eagerMatch(
  scansion: string,
  remainingTries: number = 10000,
): [Emoji, string][] {
  if (scansion.length === 0) {
    return []
  }

  if (remainingTries === 0) {
    throw new Error(
      `Failed to build a phrase from the scansion ${JSON.stringify(scansion)}`,
    )
  }

  const first = random(emoji)
  if (first.syllableCount > scansion.length) {
    return eagerMatch(scansion, remainingTries)
  }

  const beginning = scansion.slice(0, first.syllableCount)
  if (!first.matchesScansion(beginning)) {
    return eagerMatch(scansion, remainingTries - 1)
  }

  const ending = eagerMatch(scansion.slice(first.syllableCount), remainingTries)

  return [[first, beginning] as [Emoji, string]].concat(ending)
}
