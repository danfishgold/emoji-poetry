import React, { useEffect, useState } from 'react'
import './App.css'
import { randomPatternOptionButPreferrablyLong, Emoji } from './emoji'

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
    setGeneratedBlock(generateBlock(pattern, shouldUseSymbols))
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
      <p>
        generate poems with emoji! based on{' '}
        <a href='https://twitter.com/NealePickett/status/1364301232613990403'>
          this tweet
        </a>{' '}
        by Neale Pickett
      </p>
      <p>
        you can build it manually (<code>/</code> for stressed syllables,{' '}
        <code>x</code> for unstressed, lines with matching letters in
        parentheses will rhyme), or use one of these presets:
      </p>
      <button onClick={() => setPattern(limerick)}>limerick</button>
      <button onClick={() => setPattern(commonMeter)}>common meter</button>
      <button onClick={() => setPattern(tweet)}>Naele's tweet</button>
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

function generateBlock(
  pattern: string,
  shouldUseSymbols: boolean,
): GeneratedPart[] {
  const parts = split(pattern)

  return parts.map((part) => {
    switch (part.type) {
      case 'rawString': {
        return part
      }
      case 'linePattern': {
        const sequence = randomPatternOptionButPreferrablyLong(part.scansion)
        return { type: 'generatedLine' as const, sequence }
      }
    }
  })
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
