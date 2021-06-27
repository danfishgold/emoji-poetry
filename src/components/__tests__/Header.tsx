import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import * as examples from '../../exampleTemplates'
import Header from '../Header'

test('all the buttons are there and working', () => {
  const setTemplate = jest.fn()
  render(<Header setTemplate={setTemplate} />)

  const spy = jest
    .spyOn(examples, 'randomLimerick')
    .mockImplementation(() => 'limerick')

  const options = [
    [/neale's tweet/i, examples.tweet],
    [/limerick/i, examples.randomLimerick()],
    [/common met(re|er)/i, examples.commonMeter],
    [/tips/i, examples.tips],
    [/call me maybe/i, examples.callMeMaybe],
    [/raven/i, examples.raven],
  ]

  for (const [buttonTitle, expectedTemplate] of options) {
    const button = screen.getByRole('button', { name: buttonTitle })
    userEvent.click(button)
    expect(setTemplate).toHaveBeenCalledWith(expectedTemplate)
  }
  expect(setTemplate).toHaveBeenCalledTimes(options.length)

  spy.mockRestore()
})
