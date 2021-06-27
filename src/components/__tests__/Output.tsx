import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { allEmoji, Emoji } from '../../emoji'
import * as examples from '../../exampleTemplates'
import {
  generate,
  OutputLineAtom,
  outputToString,
  parseTemplate,
} from '../../template'
import Output from '../Output'

describe('controls', () => {
  test('call regenerate when clicking on randomize', () => {
    const fakeTemplate = examples.callMeMaybe
    const outputLines = generate(parseTemplate(fakeTemplate)).outputLines
    const regenerate = jest.fn()
    const regenerateAtom = jest.fn()

    render(
      <Output
        outputLines={outputLines}
        regenerate={regenerate}
        regenerateAtom={regenerateAtom}
      />,
    )

    const randomize = screen.getByRole('button', { name: /randomize/i })
    userEvent.click(randomize)
    expect(regenerate).toHaveBeenCalledTimes(1)
  })

  test('call navigator.clipboard.writeText when clicking on copy', () => {
    const fakeTemplate = examples.callMeMaybe
    const outputLines = generate(parseTemplate(fakeTemplate)).outputLines

    render(
      <Output
        outputLines={outputLines}
        regenerate={() => {}}
        regenerateAtom={() => {}}
      />,
    )

    const copy = screen.getByRole('button', { name: /copy/i })
    userEvent.click(copy)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      outputToString(outputLines),
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  test('the glyphs/words radio toggles the output display', () => {
    const emoji = ['🍌', '🍉'].map((e) => allEmoji.get(e)) as Emoji[]
    const atom: OutputLineAtom = {
      type: 'generatedSequence',
      scansion: emoji.map((e) => e.scansions[0]).join(''),
      sequence: emoji.map((e) => [e, e.scansions[0]]),
    }
    const outputLines = [[atom]]

    render(
      <Output
        outputLines={outputLines}
        regenerate={() => {}}
        regenerateAtom={() => {}}
      />,
    )

    const asSentence = emoji.map((e) => e.name).join(' ')
    const asGlyphs = emoji.map((e) => e.character + '\uFE0F').join('')

    const glyphsRadio = screen.getByRole('radio', { name: /glyphs/i })
    const wordsRadio = screen.getByRole('radio', { name: /words/i })

    expect(glyphsRadio).toBeChecked()
    expect(wordsRadio).not.toBeChecked()

    const button = screen.getByRole('button', { name: asSentence })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(asGlyphs)

    userEvent.click(wordsRadio)

    expect(glyphsRadio).not.toBeChecked()
    expect(wordsRadio).toBeChecked()
    expect(button).toHaveTextContent(asSentence)
  })
})

test('a button for every sequence, which calls regenerateAtom when clicked', () => {
  // this way I can make sure the scansions can't repeat
  const fakeTemplate = '/x /xx /x/x\n/xx/x'
  const outputLines = generate(parseTemplate(fakeTemplate)).outputLines
  const regenerateAtom = jest.fn()

  render(
    <Output
      outputLines={outputLines}
      regenerate={() => {}}
      regenerateAtom={regenerateAtom}
    />,
  )

  for (const [lineIndex, line] of outputLines.entries()) {
    for (const [atomIndex, atom] of line.entries()) {
      if (atom.type !== 'generatedSequence') {
        continue
      }

      const generatedString = atom.sequence
        .map(([emoji]) => emoji.name)
        .join(' ')
      const button = screen.getByRole('button', { name: generatedString })
      expect(button).toBeInTheDocument()
      userEvent.click(button)
      expect(regenerateAtom).toHaveBeenCalledWith(lineIndex, atomIndex)
    }
  }
})
