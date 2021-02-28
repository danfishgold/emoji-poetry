import { Emoji, rhymeGroups } from './emoji'
import * as Sequence from './sequence'
import { random } from './util'

export type TemplateLineAtom = RawString | Scansion
export type OutputLineAtom = RawString | GeneratedSequence

type RawString = { type: 'rawString'; string: string }
export type Scansion = { type: 'scansion'; scansion: string; rhymeId?: string }
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
    Array.from(scansionsByRhymeId.entries()).map(([id, scansions]) => {
      const relevantGroups = rhymeGroups.filter((group) =>
        scansions.every((scansion) =>
          group.some((emoji) =>
            emoji.matchesScansion(scansion.slice(-emoji.syllableCount)),
          ),
        ),
      )
      if (relevantGroups.length === 0) {
        throw new Error(
          `Impossible form: there are no rhymes that will fit group (${id})`,
        )
      }
      return [id, random(relevantGroups)]
    }),
  )
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
): OutputLineAtom {
  switch (atom.type) {
    case 'rawString': {
      return atom
    }
    case 'scansion': {
      return generateSequence(atom, rhymeOptions)
    }
  }
}

function generateSequence(
  { scansion, rhymeId }: Scansion,
  rhymeOptions: Map<string, Emoji[]>,
): GeneratedSequence {
  const possibleEndings =
    rhymeId !== undefined ? rhymeOptions.get(rhymeId) : undefined
  const sequence =
    possibleEndings === undefined
      ? Sequence.match(scansion)
      : Sequence.matchWithConstrainedEnd(scansion, possibleEndings)
  return {
    type: 'generatedSequence',
    scansion,
    rhymeId,
    sequence,
  }
}
