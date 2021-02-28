import { Emoji, rhymeGroups } from './emoji'
import * as Sequence from './sequence'
import { random, spliceButLikeInElm, split } from './util'

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
  if (lastIndex < line.length - 1) {
    parts.push({
      type: 'rawString' as const,
      string: line.slice(lastIndex, line.length),
    })
  }

  return parts
}

function rhymeIds(templateLines: TemplateLineAtom[][]): Set<string> {
  const ids = templateLines
    .flat()
    .filter((atom): atom is Scansion => atom.type === 'scansion')
    .map((scansion) => scansion.rhymeId)

  return new Set(ids.filter((id): id is string => id !== undefined))
}

export function randomRhymeOptions(
  templateLines: TemplateLineAtom[][],
): Map<string, Emoji[]> {
  const ids = rhymeIds(templateLines)
  return new Map(Array.from(ids).map((id) => [id, random(rhymeGroups)]))
}

export function generate(
  templateLines: TemplateLineAtom[][],
  rhymeOptions: Map<string, Emoji[]> = randomRhymeOptions(templateLines),
  remainingTries: number = 20,
): { outputLines: OutputLineAtom[][]; rhymeOptions: Map<string, Emoji[]> } {
  if (remainingTries === 0) {
    throw new Error(`Can't generate this template. probably due to rhymes`)
  }
  try {
    const outputLines: OutputLineAtom[][] = templateLines.map((line) =>
      line.map((atom) => generateAtom(atom, rhymeOptions)),
    )

    return {
      outputLines,
      rhymeOptions,
    }
  } catch {
    return generate(
      templateLines,
      randomRhymeOptions(templateLines),
      remainingTries - 1,
    )
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
