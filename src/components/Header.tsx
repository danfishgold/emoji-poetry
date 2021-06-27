import React from 'react'
import * as examples from '../exampleTemplates'

function Header({ setTemplate }: { setTemplate: (template: string) => void }) {
  return (
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
        <button onClick={() => setTemplate(examples.tweet)}>
          Neale's tweet
        </button>
        <button onClick={() => setTemplate(examples.randomLimerick())}>
          limerick
        </button>
        <button onClick={() => setTemplate(examples.commonMeter)}>
          common meter
        </button>
        <button onClick={() => setTemplate(examples.tips)}>tips</button>
        <button onClick={() => setTemplate(examples.callMeMaybe)}>
          call me maybe
        </button>
        <button onClick={() => setTemplate(examples.raven)}>raven</button>
      </div>
      <p>or build one yourself:</p>
      <ul>
        <li>
          use <code>/</code> for stressed syllables and <code>x</code> for
          unstressed syllables. for example the word “<b>pine</b>apple” would be{' '}
          <code>/xx</code>, and “ba<b>na</b>na” would be <code>x/x</code>
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
  )
}

export default React.memo(Header)
