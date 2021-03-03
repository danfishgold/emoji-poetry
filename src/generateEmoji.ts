import { CMUDict } from 'cmudict'
import * as unicode from 'unicode/category/So'
import { mapToObject } from './util'

const cmudict = new CMUDict()

function generateEmojiInfo(
  emojiCharacters: string,
): {
  emojiProperties: Map<
    string,
    {
      name: string
      scansions: string[]
    }
  >
  scansionOptions: Map<string, string>
} {
  const scansionOptions = new Map<string, string>()
  const emojiProperties = new Map(
    [...emojiCharacters].map((emoji) => {
      const name = emojiName(emoji)
      const syllables = name.split(' ').flatMap((word) => {
        const phonemes = cmudict.get(word)
        if (!phonemes) {
          throw new Error(`Can't find phonemes for ${word}`)
        }
        return syllablesFromPhonemes(phonemes)
      })
      return [
        emoji,
        {
          name,
          syllableCount: syllables.length,
          scansions: possibleScansions(syllables),
        },
      ]
    }),
  )

  emojiProperties.forEach(({ scansions }, emoji) => {
    scansions.forEach((scansion) => {
      const existingOptions = scansionOptions.get(scansion) ?? ''
      scansionOptions.set(scansion, existingOptions + emoji)
    })
  })

  return { emojiProperties, scansionOptions }

  //   possibleScansions(syllables).forEach((scansion) => {
  //     const existingOptions = scansionOptions.get(scansion) ?? []
  //     scansionOptions.set(scansion, existingOptions.concat(emoji))
  //   })
  // }
  // return { scansionOptions, emojiNames }
}

function emojiName(emoji: string): string {
  const codePoint = knownCharCodeAt(emoji, 0)
  const name: string | undefined = unicode[codePoint]?.name?.toLowerCase()
  if (!name) {
    throw new Error(`Couldn't parse emoji: ${emoji}`)
  }

  return name
}

const scansionOptionsForStress = [['x'], ['/'], ['x', '/']]

function possibleScansions(syllables: number[]): string[] {
  if (syllables.length == 0) {
    return ['']
  }

  const first = syllables[0]
  const tailOptions = possibleScansions(syllables.slice(1))
  return tailOptions.flatMap((tail) =>
    scansionOptionsForStress[first].map((head) => head + tail),
  )
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt#fixing_charcodeat_to_handle_non-basic-multilingual-plane_characters_if_their_presence_earlier_in_the_string_is_known
function knownCharCodeAt(str: string, idx: number) {
  str += ''
  var code,
    end = str.length

  var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
  while (surrogatePairs.exec(str) != null) {
    var li = surrogatePairs.lastIndex
    if (li - 2 < idx) {
      idx++
    } else {
      break
    }
  }

  if (idx >= end || idx < 0) {
    return NaN
  }

  code = str.charCodeAt(idx)

  var hi, low
  if (0xd800 <= code && code <= 0xdbff) {
    hi = code
    low = str.charCodeAt(idx + 1)
    // Go one further, since one of the "characters"
    // is part of a surrogate pair
    return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000
  }
  return code
}

function rhymingPart(phrase: string): string {
  const words = phrase.split(' ')
  const phonemes = cmudict.get(words[words.length - 1])
  const relevantPart = phonemes
    ?.match(/\w+[12][^12]*$/)?.[0]
    .replaceAll(' ', '')
  if (!relevantPart) {
    throw new Error(
      `Something went wrong while trying to find rhymes for ${phrase}`,
    )
  }

  return relevantPart
}

function doPhrasesRhyme(phrase1: string, phrase2: string): boolean {
  return rhymingPart(phrase1) === rhymingPart(phrase2)
}

function syllablesFromPhonemes(phonemes: string): number[] {
  return [...phonemes.matchAll(/\d/g)].map((match) => parseInt(match[0]))
}

export function generateRhymingInfo(
  emojiProperties: Map<
    string,
    {
      name: string
      scansions: string[]
    }
  >,
): string[] {
  let result: string[] = []
  let alreadyDone = new Set<string>()
  for (const [emoji, { name }] of emojiProperties.entries()) {
    if (alreadyDone.has(emoji)) {
      continue
    }

    alreadyDone.add(emoji)
    let group = [emoji]
    for (const [otherEmoji, { name: otherName }] of emojiProperties.entries()) {
      if (alreadyDone.has(otherEmoji)) {
        continue
      }

      if (doPhrasesRhyme(name, otherName)) {
        group.push(otherEmoji)
        alreadyDone.add(otherEmoji)
      }
    }

    if (group.length > 1) {
      result.push(group.join(''))
    }
  }

  return result
}

const { scansionOptions, emojiProperties } = generateEmojiInfo(
  '👻💀🦶🦵💄🦷👅👂👃👁🧠🥷🧝🧟🧛🧚👗👑🐨🐔🐧🦆🦅🦇🐗🪱🦋🐌🐜🪳🕷🕸🦂🐢🐍🦎🐙🦑🦀🐡🐬🐘🦘🐂🐄🐎🐖🐑🐕🐩🐈🦃🦚🦜🦢🦩🐇🦝🦨🦥🐁🐀🦔🍄🌹🌻🔥🌈🍐🍋🍌🍉🍓🥭🍍🥥🍅🥑🥦🥒🥕🧄🧅🥔🍞🥚🥓🦴🌭🌮🍿🍩🍪🥄🪃🪁🎤🎷🎺🪗🎻🚌🚜🛰🚀⛰⌚🖨📷🔋🕯🪛🔨🧲💣🪓🔭🔬🚽🪣🔑🚪🧸🎈🪑🔔',
  // no owl (🦉) because it's monosyllabic but weird
)

const rhymes = generateRhymingInfo(emojiProperties).filter(
  (rhymeGroup) => rhymeGroup !== '🐕🌭' && rhymeGroup !== '🌭🐕',
)
// no 🐕🌭 because that's cheating

console.log(
  JSON.stringify({
    scansionOptions: mapToObject(scansionOptions),
    emojiProperties: mapToObject(emojiProperties),
    rhymes,
  }),
)
