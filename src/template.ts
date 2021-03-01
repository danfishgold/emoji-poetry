import { allEmoji, Emoji, rhymeGroups, scansionOptions } from './emoji'
import * as Sequence from './sequence'
import { random } from './util'

export type TemplateLineAtom = RawString | Scansion
export type OutputLineAtom = RawString | GeneratedSequence | GenerationError

type RawString = { type: 'rawString'; string: string }
export type Scansion = { type: 'scansion'; scansion: string; rhymeId?: string }
export type GenerationError = {
  type: 'generationError'
  scansion: string
  rhymeId?: string
  errorMessage: string
}
type GeneratedSequence = {
  type: 'generatedSequence'
  scansion: string
  rhymeId?: string
  sequence: [Emoji, string][]
}

const scansionRegex = /([\/x]+)(?: *\(([A-Z])\))?/g

export function parseTemplate(template: string): TemplateLineAtom[][] {
  return template.split('\n').map(parseLine)
}

function parseLine(line: string): TemplateLineAtom[] {
  const matches = line.matchAll(scansionRegex)
  let parts = []

  let lastIndex = 0
  for (const match of matches) {
    if (match.index === undefined) {
      continue
    }
    if (match.index > lastIndex) {
      parts.push({
        type: 'rawString' as const,
        string: line.slice(lastIndex, match.index),
      })
    }

    parts.push({
      type: 'scansion' as const,
      scansion: match[1],
      rhymeId: match[2],
    })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < line.length) {
    parts.push({
      type: 'rawString' as const,
      string: line.slice(lastIndex, line.length),
    })
  }

  return parts
}

function rhymeIdsAndTheirScansions(
  templateLines: TemplateLineAtom[][],
): Map<string, string[]> {
  const idsScansionPairs: [string, string][] = templateLines
    .flat()
    .filter((atom): atom is Scansion => atom.type === 'scansion')
    .filter((scansion) => scansion.rhymeId !== undefined)
    .map((scansion) => [scansion.rhymeId!, scansion.scansion])

  const scansionsById = new Map()
  idsScansionPairs.forEach(([id, scansion]) => {
    const existing = scansionsById.get(id)
    scansionsById.set(id, (existing ?? []).concat(scansion))
  })

  return scansionsById
}

export function randomRhymeOptions(
  templateLines: TemplateLineAtom[][],
): Map<string, Emoji[]> {
  const scansionsByRhymeId = rhymeIdsAndTheirScansions(templateLines)
  return new Map(
    Array.from(scansionsByRhymeId.entries()).map(([id, scansions]) => [
      id,
      randomRhymeOptionsForGroup(scansions, id),
    ]),
  )
}

function randomRhymeOptionsForGroup(
  scansions: string[],
  groupId: string,
): Emoji[] {
  const relevantGroups = rhymeGroups.filter((group) =>
    scansions.every((scansion) =>
      [...group].some((emoji) =>
        Sequence.isEmojiValidAsEnding(allEmoji.get(emoji) as Emoji, scansion),
      ),
    ),
  )
  if (relevantGroups.length === 0) {
    console.info(
      `gave up on trying to find rhyming words for group (${groupId})`,
    )
    const validStandaloneSequences = [
      ...scansionOptions.keys(),
    ].filter((sequence) =>
      scansions.every((scansion) =>
        Sequence.isSequenceValidAsEnding(sequence, scansion),
      ),
    )
    if (validStandaloneSequences.length === 0) {
      throw new Error(`no rhyme options found for group (${groupId})`)
    }
    const sequence = random(validStandaloneSequences)
    const emoji = random(scansionOptions.get(sequence)!)
    return [allEmoji.get(emoji)!]
  }
  return [...random(relevantGroups)].map((e) => allEmoji.get(e)!)
}

export function generate(
  templateLines: TemplateLineAtom[][],
  rhymeOptions: Map<string, Emoji[]> = randomRhymeOptions(templateLines),
): { outputLines: OutputLineAtom[][]; rhymeOptions: Map<string, Emoji[]> } {
  const outputLines: OutputLineAtom[][] = templateLines.map((line) =>
    line.map((atom) => generateAtom(atom, rhymeOptions)),
  )

  return {
    outputLines,
    rhymeOptions,
  }
}

export function generateAtom(
  atom: TemplateLineAtom,
  rhymeOptions: Map<string, Emoji[]>,
  preferrablyLongScansions: boolean = true,
): OutputLineAtom {
  switch (atom.type) {
    case 'rawString': {
      return atom
    }
    case 'scansion': {
      try {
        return generateSequence(atom, rhymeOptions, preferrablyLongScansions)
      } catch (e) {
        return {
          type: 'generationError',
          scansion: atom.scansion,
          rhymeId: atom.rhymeId,
          errorMessage: e,
        }
      }
    }
  }
}

function generateSequence(
  { scansion, rhymeId }: Scansion,
  rhymeOptions: Map<string, Emoji[]>,
  preferrablyLongScansions: boolean = true,
): GeneratedSequence {
  const possibleEndings =
    rhymeId !== undefined ? rhymeOptions.get(rhymeId) : undefined
  const sequence =
    possibleEndings === undefined
      ? Sequence.match(scansion, preferrablyLongScansions)
      : Sequence.matchWithConstrainedEnd(
          scansion,
          possibleEndings,
          preferrablyLongScansions,
        )
  return {
    type: 'generatedSequence',
    scansion,
    rhymeId,
    sequence,
  }
}

export function outputToString(lines: OutputLineAtom[][]): string {
  return lines
    .map((line) =>
      line
        .map((atom) => {
          switch (atom.type) {
            case 'rawString': {
              return atom.string
            }
            case 'generatedSequence': {
              return atom.sequence
                .map(([em]) => em.character + '\uFE0F')
                .join('')
            }
          }
        })
        .join(''),
    )
    .join('\n')
}
