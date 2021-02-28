import React, { useEffect, useState } from 'react'
import './App.css'
import { Emoji } from './emoji'
import * as Template from './template'
import useTemplate from './useTemplate'

const limerick =
  'x/xx/xx/x (A)\nx/xx/xx/x (A)\nx/xx/x (B)\nx/xx/x (B)\nx/xx/xx/x (A)'
const commonMeter = 'x/x/x/x/ (A)\nx/x/x/ (B)\nx/x/x/x/\nx/x/x/ (B)'
const tweet =
  '/xx/x (A)\n/xx/ (B)\n/xx/x (A)\n/xx/ (B)\n\n/xx/x\n/xx/ (C)\n/xx/xx/xx/ (C)\n\n/xx/xx/xx/ (D)\n/xx/xx/xx/ (D)\n\n/xx/xx/xx/ (E)\n/xx\n/xx\n/xx\n/ (E)'

function App() {
  const [
    template,
    setTemplate,
    outputLines,
    _,
    regenerate,
    regenerateAtom,
  ] = useTemplate(limerick)
  const [shouldUseSymbols, setShouldUseSymbols] = useState(true)

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
      <button onClick={() => setTemplate(limerick)}>limerick</button>
      <button onClick={() => setTemplate(commonMeter)}>common meter</button>
      <button onClick={() => setTemplate(tweet)}>Naele's tweet</button>
      <p>
        I limited it to emoji that screen readers would parse the same way
        humans would, so there's no 🦊 (fox face) or 🏠 (house building)
      </p>
      <div>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </div>
      <button onClick={regenerate}>shuffle</button>
      <button onClick={() => setShouldUseSymbols(!shouldUseSymbols)}>
        {shouldUseSymbols ? 'use emoji names' : 'use emoji characters'}
      </button>
      <div className='generated-output'>
        {outputLines.map((lineAtoms, lineIndex) => (
          <p key={`line-${lineIndex}`}>
            {lineAtoms.map((atom, atomIndex) => (
              <LineAtom
                key={`atom-${lineIndex}-${atomIndex}`}
                atom={atom}
                shouldUseSymbols={shouldUseSymbols}
                onClick={() => regenerateAtom(lineIndex, atomIndex)}
              />
            ))}
          </p>
        ))}
      </div>
    </div>
  )
}

export default App
function LineAtom({
  atom,
  shouldUseSymbols,
  onClick,
}: {
  atom: Template.OutputLineAtom
  shouldUseSymbols: boolean
  onClick: () => void
}) {
  switch (atom.type) {
    case 'rawString': {
      return <>atom.string</>
    }
    case 'generatedSequence': {
      return (
        <span onClick={onClick}>
          {atom.sequence
            .map(([emoji]) =>
              shouldUseSymbols ? emoji.character : emoji.phrase,
            )
            .join(shouldUseSymbols ? '' : ' ')}
        </span>
      )
    }
  }
}
