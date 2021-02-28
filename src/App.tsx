import React, { useState } from 'react'
import * as Template from './template'
import useTemplate from './useTemplate'
import './App.scss'

const limerick =
  'x/xx/xx/x (A)\nx/xx/xx/x (A)\nx/xx/x (B)\nx/xx/x (B)\nx/xx/xx/x (A)'
const commonMeter = 'x/x/x/x/\nx/x/x/ (A)\nx/x/x/x/\nx/x/x/ (A)'
const tweet =
  '/xx/x (A)\n/xx/ (B)\n/xx/x (A)\n/xx/ (B)\n\n/xx/x\n/xx/ (C)\n/xx/xx/xx/ (C)\n\n/xx/xx/xx/ (D)\n/xx/xx/xx/ (D)\n\n/xx/xx/xx/ (E)\n/xx\n/xx\n/xx\n/ (E)'
const tips = `tip #1: you can use words and emoji together /xx/x even in the same line. be careful of the letter x\n\ntip #2: you can also have internal rhymes in the same line: /xx/(A)xx/xx/(A)`

function App() {
  const [
    template,
    setTemplate,
    outputLines,
    _,
    regenerate,
    regenerateAtom,
  ] = useTemplate(tweet)
  const [shouldUseSymbols, setShouldUseSymbols] = useState(true)

  const copyOutput = () => {
    navigator.clipboard.writeText(Template.outputToString(outputLines))
  }

  return (
    <div className='App'>
      <header>
        <h1>emoji poetry</h1>
        <p>
          generate poems with emoji! based on{' '}
          <a href='https://twitter.com/NealePickett/status/1364301232613990403'>
            this tweet
          </a>{' '}
          by Neale Pickett
        </p>
        <p>you can use one of these presets for the template below:</p>
        <div className='template-options'>
          <button onClick={() => setTemplate(tweet)}>Neale's tweet</button>
          <button onClick={() => setTemplate(limerick)}>limerick</button>
          <button onClick={() => setTemplate(commonMeter)}>common meter</button>
          <button onClick={() => setTemplate(tips)}>tips</button>
        </div>
        <p>or build one yourself:</p>
        <ul>
          <li>
            use <code>/</code> for stressed syllables and <code>x</code> for
            unstressed syllables. for example the word “<b>pine</b>apple” would
            be <code>/xx</code>, and “ba<b>na</b>na” would be <code>x/x</code>
          </li>
          <li>
            use letters in parentheses for rhyming structure: if two (or more)
            lines share the same letter they'll rhyme. for example{' '}
            <code>/xx/x (A)</code> and <code>/xx/ (A)</code>
          </li>
          <li>
            don't like one of the generated lines? click on it to randomize it
            (and keep the rest the same)
          </li>
        </ul>
        <p>
          I limited it to emoji that screen readers would parse the same way
          people would, so there's no{' '}
          <span aria-label='fox face'>🦊 (fox face)</span> or{' '}
          <span aria-label='house with yard'>🏠 (house with yard)</span>
        </p>
      </header>
      <main>
        <div className='input'>
          <h2>template goes in here</h2>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>
        <div className='output'>
          <h2>poetry comes out here</h2>
          <div className='controls'>
            <div className='controls__symbols'>
              <input
                type='radio'
                name='emoji-display'
                id='glyphs'
                value='glyphs'
                checked={shouldUseSymbols}
                onChange={(e) =>
                  setShouldUseSymbols(e.target.value === 'glyphs')
                }
              />
              <label htmlFor='glyphs'>glyphs</label>
              <input
                type='radio'
                name='emoji-display'
                id='words'
                value='words'
                checked={!shouldUseSymbols}
                onChange={(e) =>
                  setShouldUseSymbols(e.target.value === 'glyphs')
                }
              />
              <label htmlFor='words'>words</label>
            </div>
            <div className='controls__actions'>
              <button onClick={regenerate}>randomize</button>
              {navigator.clipboard && (
                <button onClick={copyOutput}>copy</button>
              )}
            </div>
          </div>
          <div className='generated-output'>
            {outputLines.map((lineAtoms, lineIndex) => (
              <Line
                key={`line-${lineIndex}`}
                atoms={lineAtoms}
                shouldUseSymbols={shouldUseSymbols}
                onClick={(atomIndex) => regenerateAtom(lineIndex, atomIndex)}
              />
            ))}
          </div>
        </div>
      </main>
      <footer>
        <a href='https://github.com/danfishgold/emoji-poetry'>made</a> by{' '}
        <a href='https://twitter.com/danfishgold'>@danfishgold</a>. SEND ME YOUR
        POETRY (and feature requests)
      </footer>
    </div>
  )
}

function Line({
  atoms,
  shouldUseSymbols,
  onClick,
}: {
  atoms: Template.OutputLineAtom[]
  shouldUseSymbols: boolean
  onClick: (atomIndex: number) => void
}) {
  if (atoms.length == 0) {
    return <br />
  }

  return (
    <p>
      {atoms.map((atom, atomIndex) => (
        <Atom
          key={`atom-${atomIndex}`}
          atom={atom}
          shouldUseSymbols={shouldUseSymbols}
          onClick={() => onClick(atomIndex)}
        />
      ))}
    </p>
  )
}

function Atom({
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
      return <>{atom.string}</>
    }
    case 'generatedSequence': {
      return (
        <span
          role='button'
          aria-label={atom.sequence.map(([emoji]) => emoji.name).join(' ')}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              onClick()
            }
          }}
          onClick={onClick}
        >
          {atom.sequence
            .map(([emoji]) =>
              shouldUseSymbols ? emoji.character + '\uFE0F' : emoji.name,
            )
            .join(shouldUseSymbols ? '' : ' ')}
        </span>
      )
    }
    case 'generationError': {
      return (
        <span className='error'>
          can't generate this sequence (<code>{atom.scansion}</code>)
        </span>
      )
    }
  }
}

export default App
