import React, { useEffect, useState } from 'react'
import './App.css'
import {
  randomPatternOption,
  Emoji,
  randomRhymingPatternOptions,
} from './emoji'

type RawString = { type: 'rawString'; string: string }
type LinePattern = { type: 'linePattern'; scansion: string; rhyme?: string }
type GeneratedLine = { type: 'generatedLine'; sequence: Emoji[] }

type PatternPart = RawString | LinePattern

type GeneratedPart = RawString | GeneratedLine

const limerick =
  'x/xx/xx/x (A)\nx/xx/xx/x (A)\nx/xx/x (B)\nx/xx/x (B)\nx/xx/xx/x (A)'
const commonMeter = 'x/x/x/x/ (A)\nx/x/x/ (B)\nx/x/x/x/\nx/x/x/ (B)'
const tweet =
  '/xx/x (A)\n/xx/ (B)\n/xx/x (A)\n/xx/ (B)\n\n/xx/x\n/xx/ (C)\n/xx/xx/xx/ (C)\n\n/xx/xx/xx/ (D)\n/xx/xx/xx/ (D)\n\n/xx/xx/xx/ (E)\n/xx\n/xx\n/xx\n/ (E)'

function App() {
  const [pattern, setPattern] = useState(limerick)
  const [generatedBlock, setGeneratedBlock] = useState<GeneratedPart[]>([])
  const [shouldUseSymbols, setShouldUseSymbols] = useState(false)

  const regenerateBlock = () => {
    setGeneratedBlock(generateBlock(pattern))
  }

  const generatedLines = generatedBlock
    .map((part) => {
      switch (part.type) {
        case 'rawString': {
          return part.string
        }
        case 'generatedLine': {
          return part.sequence
            .map((emoji) =>
              shouldUseSymbols
                ? emoji.character
                : `${emoji.phrase}(${emoji.syllableCount})`,
            )
            .join(shouldUseSymbols ? '' : ' ')
        }
      }
    })
    .join('')
    .split('\n')

  useEffect(() => {
    regenerateBlock()
  }, [pattern])

  return (
    <div className='App'>
      <h1>emoji poems</h1>
      <p>
        generate poems using emoji! based on{' '}
        <a href='https://twitter.com/NealePickett/status/1364301232613990403'>
          this tweet
        </a>{' '}
        by Neale Pickett
      </p>
      <p>
        you can structure it yourself in the editor below (<code>/</code> for
        stressed syllables, <code>x</code> for unstressed, lines with matching
        letters in parentheses will rhyme), or use one of these presets:
      </p>
      <button onClick={() => setPattern(limerick)}>limerick</button>
      <button onClick={() => setPattern(commonMeter)}>common meter</button>
      <button onClick={() => setPattern(tweet)}>Naele's tweet</button>
      <p>
        I limited it to emoji that screen readers would parse the same way
        humans would, so there's no 🦊 (fox face) or 🏠 (house building)
      </p>
      <div>
        <textarea
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
        />
      </div>
      <button onClick={regenerateBlock}>shuffle</button>
      <button onClick={() => setShouldUseSymbols(!shouldUseSymbols)}>
        {shouldUseSymbols ? 'use emoji names' : 'use emoji characters'}
      </button>
      <div className='generated-output'>
        {generatedLines.map((line, index) => (
          <p key={`line-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  )
}
const patternRegex = /([\/x]+)(?: *\(([A-Z])\))?/g

function generateAllLines(lines: LinePattern[]): GeneratedLine[] {
  const rhymeGroups = new Map<string | undefined, [string, number][]>()
  lines.forEach((line, index) => {
    const existing = rhymeGroups.get(line.rhyme) ?? []
    rhymeGroups.set(line.rhyme, existing.concat([[line.scansion, index]]))
  })

  const allGeneratedLines = Array.from(rhymeGroups.entries())
    .map(([group, lines]): [Emoji[], number][] => {
      const scansions = lines.map((line) => line[0])
      const generatedLines = group
        ? randomRhymingPatternOptions(scansions)
        : scansions.map((s) => randomPatternOption(s))

      const indexes = lines.map((line) => line[1])
      return generatedLines.map((line, index) => [line, indexes[index]])
    })
    .flat(1)

  const sortedGeneratedLines = allGeneratedLines
    .sort((a, b) => a[1] - b[1])
    .map((l) => l[0])

  return sortedGeneratedLines.map((line) => ({
    type: 'generatedLine',
    sequence: line,
  }))
}

// HACKKKKK
function generateBlock(pattern: string): GeneratedPart[] {
  const parts = split(pattern)
  let result: (GeneratedPart | undefined)[] = parts.map((part) => {
    if (part.type === 'linePattern') {
      return undefined
    } else {
      return part
    }
  })

  const indexedLinePatterns = parts
    .map((part, index): [PatternPart, number] => [part, index])
    .filter((p) => p[0].type === 'linePattern') as [LinePattern, number][]

  const linePatterns = indexedLinePatterns.map((p) => p[0])
  const indexes = indexedLinePatterns.map((p) => p[1])
  const generatedLines = generateAllLines(linePatterns)

  generatedLines.forEach((line, index) => {
    result[indexes[index]] = line
  })

  return result as GeneratedPart[]
}
function split(pattern: string): PatternPart[] {
  const matches = pattern.matchAll(patternRegex)
  const parts = []

  let lastIndex = 0
  for (const match of matches) {
    if (match.index === undefined) {
      continue
    }
    if (match.index > lastIndex) {
      parts.push({
        type: 'rawString' as const,
        string: pattern.slice(lastIndex, match.index),
      })
    }

    parts.push({
      type: 'linePattern' as const,
      scansion: match[1],
      rhyme: match[2],
    })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < pattern.length - 1) {
    parts.push({
      type: 'rawString' as const,
      string: pattern.slice(lastIndex, pattern.length),
    })
  }

  return parts
}

export default App
