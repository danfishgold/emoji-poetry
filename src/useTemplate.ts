import { useCallback, useEffect, useRef, useState } from 'react'
import { Emoji } from './emoji'
import {
  OutputLineAtom,
  parseTemplate,
  TemplateLineAtom,
  generate,
  generateAtom,
} from './template'

export default function useTemplate(
  initialValue: string,
): [
  string,
  (template: string) => void,
  OutputLineAtom[][],
  Map<string, Emoji[]>,
  () => void,
  (lineIndex: number, atomIndex: number) => void,
] {
  const [template, setTemplate] = useState(initialValue)
  const templateLines = useRef<TemplateLineAtom[][]>([])
  const [outputLines, setOutputLines] = useState<OutputLineAtom[][]>([])
  const [rhymeOptions, setRhymeOptions] = useState<Map<string, Emoji[]>>(
    new Map(),
  )

  const regenerate = useCallback(() => {
    const generated = generate(templateLines.current)
    setOutputLines(generated.outputLines)
    setRhymeOptions(generated.rhymeOptions)
  }, [templateLines])

  useEffect(() => {
    templateLines.current = parseTemplate(template)
    regenerate()
  }, [template])

  const regenerateAtom = (lineIndex: number, atomIndex: number) => {
    const line = outputLines[lineIndex]
    const newAtom = generateAtom(
      templateLines.current[lineIndex][atomIndex],
      rhymeOptions,
    )
    const newLine = [
      ...line.slice(0, atomIndex),
      newAtom,
      ...line.slice(atomIndex + 1),
    ]
    setOutputLines([
      ...outputLines.slice(0, lineIndex),
      newLine,
      ...outputLines.slice(lineIndex + 1),
    ])
  }

  return [
    template,
    setTemplate,
    outputLines,
    rhymeOptions,
    regenerate,
    regenerateAtom,
  ]
}
