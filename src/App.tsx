import React from 'react'
import './App.scss'
import Header from './components/Header'
import Input from './components/Input'
import Output from './components/Output'
import * as examples from './exampleTemplates'
import useTemplate from './useTemplate'

function App() {
  const [
    template,
    setTemplate,
    outputLines,
    _,
    regenerate,
    regenerateAtom,
  ] = useTemplate(examples.tweet)

  return (
    <div className='App'>
      <Header setTemplate={setTemplate} />
      <main>
        <div className='input'>
          <h2>template goes in here</h2>
          <Input template={template} setTemplate={setTemplate} />
        </div>
        <div className='output'>
          <h2>poetry comes out here</h2>
          <Output
            outputLines={outputLines}
            regenerate={regenerate}
            regenerateAtom={regenerateAtom}
          />
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

export default App
