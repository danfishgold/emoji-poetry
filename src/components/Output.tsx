import * as React from 'react'
import { Fragment, useState } from 'react'
import * as Template from '../template'
import { OutputLineAtom } from '../template'

type Props = {
  outputLines: OutputLineAtom[][]
  regenerate: () => void
  regenerateAtom: (lineIndex: number, atomIndex: number) => void
}

function Output({ outputLines, regenerate, regenerateAtom }: Props) {
  const [shouldUseSymbols, setShouldUseSymbols] = useState(true)
  const copyOutput = () => {
    navigator.clipboard.writeText(Template.outputToString(outputLines))
  }

  return (
    <Fragment>
      <div className='controls'>
        <div className='controls__symbols'>
          <input
            type='radio'
            name='emoji-display'
            id='glyphs'
            value='glyphs'
            checked={shouldUseSymbols}
            onChange={(e) => setShouldUseSymbols(e.target.value === 'glyphs')}
          />
          <label htmlFor='glyphs'>glyphs</label>
          <input
            type='radio'
            name='emoji-display'
            id='words'
            value='words'
            checked={!shouldUseSymbols}
            onChange={(e) => setShouldUseSymbols(e.target.value === 'glyphs')}
          />
          <label htmlFor='words'>words</label>
        </div>
        <div className='controls__actions'>
          <button onClick={regenerate}>randomize</button>
          {navigator.clipboard && <button onClick={copyOutput}>copy</button>}
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
    </Fragment>
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
        <Fragment key={`atom-${atomIndex}`}>
          <Atom
            atom={atom}
            shouldUseSymbols={shouldUseSymbols}
            onClick={() => onClick(atomIndex)}
          />
          {/* add a space between sequences if displaying words instead of emoji */}
          {!shouldUseSymbols &&
            atomIndex < atoms.length - 1 &&
            atoms[atomIndex].type === 'generatedSequence' &&
            atoms[atomIndex + 1].type === 'generatedSequence' && <span> </span>}
        </Fragment>
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
          <code>{atom.error.message}</code>
        </span>
      )
    }
  }
}

export default Output
