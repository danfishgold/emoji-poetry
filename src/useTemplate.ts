import { useCallback, useEffect, useRef, useState } from 'react'
import { Emoji } from './emoji'
import {
  generate,
  generateAtom,
  OutputLineAtom,
  parseTemplate,
  TemplateLineAtom,
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
    try {
      const generated = generate(templateLines.current)
      setOutputLines(generated.outputLines)
      setRhymeOptions(generated.rhymeOptions)
    } catch (error) {
      setOutputLines([[{ type: 'generationError', error }]])
      setRhymeOptions(new Map())
    }
  }, [templateLines])

  const setTemplateAndRegenerate = useCallback(
    (newTemplate: string) => {
      setTemplate(newTemplate)
      templateLines.current = parseTemplate(newTemplate)
      regenerate()
    },
    [setTemplate],
  )

  const regenerateAtom = useCallback(
    (lineIndex: number, atomIndex: number) => {
      const line = outputLines[lineIndex]
      const newAtom = generateAtom(
        templateLines.current[lineIndex][atomIndex],
        rhymeOptions,
        false,
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
    },
    [outputLines, templateLines, rhymeOptions, setOutputLines],
  )

  useEffect(() => {
    setTemplateAndRegenerate(template)
  }, [])

  return [
    template,
    setTemplateAndRegenerate,
    outputLines,
    rhymeOptions,
    regenerate,
    regenerateAtom,
  ]
}
