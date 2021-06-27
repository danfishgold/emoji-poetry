import * as React from 'react'

function Input({
  template,
  setTemplate,
}: {
  template: string
  setTemplate: (template: string) => void
}) {
  return (
    <textarea value={template} onChange={(e) => setTemplate(e.target.value)} />
  )
}

export default React.memo(Input)
