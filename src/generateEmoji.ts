import { CMUDict } from 'cmudict'
import * as unicode from 'unicode/category/So'
import { BaseProperties as BaseEmojiProperties } from './emoji'

const cmudict = new CMUDict()

export function generateEmojiData(character: string): BaseEmojiProperties {
  const codePoint = knownCharCodeAt(character, 0)
  const phrase: string | undefined = unicode[codePoint]?.name?.toLowerCase()
  if (!phrase) {
    throw new Error(`Couldn't parse emoji: ${character}`)
  }
  const syllables = phrase
    .split(' ')
    .map((word) => cmudict.get(word))
    .map(syllablesFromPhonemes)

  return { character, phrase, syllables }
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

function syllablesFromPhonemes(phonemes: string): number[] {
  return [...phonemes.matchAll(/\d/g)].map((match) => parseInt(match[0]))
}

const emojiData = [
  ...'👻💀🦶🦵💄🦷👅👂👃👁🧠🥷🧝🧟🧛🧚👗👑🐨🐔🐧🦆🦅🦇🐗🪱🦋🐌🐜🪳🕷🕸🦂🐢🐍🦎🐙🦑🦀🐡🐬🐘🦘🐂🐄🐎🐖🐑🐕🐩🐈🦃🦚🦜🦢🦩🐇🦝🦨🦥🐁🦔🍄🌹🌻🔥🌈🍐🍋🍌🍉🍓🥭🍍🥥🍅🥑🥦🥒🥕🧄🧅🥔🍞🥚🥓🦴🌭🌮🍿🍩🍪🥄🪃🪁🎤🎷🎺🪗🎻🚌🚜🛰🚀⛰⌚🖨📷🔋🕯🪛🔨🧲💣🪓🔭🔬🚽🪣🔑🚪🧸🎈🪑🔔',
].map(generateEmojiData)

// no owl (🦉) because it's monosyllabic but weird

const rhymes = ['🦵🥚', '🔋🍓', '🔬🔭', '🎤🎷', '🦝🥄', '🦇🐈', '👃🌹']

console.log(JSON.stringify({ emoji: emojiData, rhymes }))
