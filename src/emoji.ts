import infoFromJson from './emoji.json'

export type Emoji = {
  character: string
  name: string
  syllableCount: number
  scansions: string[]
}

export const allEmoji = new Map<string, Emoji>(
  Object.entries(infoFromJson.emojiProperties).map(([emoji, props]) => [
    emoji,
    { ...props, character: emoji },
  ]),
)

export const scansionOptions = new Map(
  Object.entries(
    infoFromJson.scansionOptions,
  ).map(([scansion, optionsString]) => [scansion, [...optionsString]]),
)

export const rhymeGroups = infoFromJson.rhymes
