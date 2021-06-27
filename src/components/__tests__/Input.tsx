import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import Input from '../Input'

test('template is displayed in the textarea and input is passed to setTemplate', () => {
  const setTemplate = jest.fn()
  const template = 'template content'
  render(<Input template={template} setTemplate={setTemplate} />)

  const input = screen.getByRole('textbox')
  expect(input).toHaveTextContent(template)

  const nextChar = '!'
  userEvent.type(input, nextChar)
  expect(setTemplate).toHaveBeenCalledWith(`${template}${nextChar}`)
  expect(setTemplate).toHaveBeenCalledTimes(1)
})
