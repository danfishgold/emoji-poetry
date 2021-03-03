import { Emoji } from './emoji'

export class RhymeGroupError extends Error {
  constructor(rhymeGroupId: string) {
    super(
      `Can't find emoji that fit all the sections from rhyme group (${rhymeGroupId})`,
    )
  }
}

export class ScansionRhymeError extends Error {
  constructor(scansion: string, rhymeOptions: Emoji[]) {
    super(
      `Can't find emoji that fit the rhyme for ${scansion} between ${rhymeOptions
        .map((e) => e.character)
        .join('')}`,
    )
  }
}

export class ScansionError extends Error {
  constructor(scansion: string) {
    super(`Can't find emoji to fit ${scansion}`)
  }
}
