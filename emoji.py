import unicodedata
from nltk import word_tokenize
from nltk.corpus import cmudict
from collections import defaultdict
import random
from functools import cache

prondict = cmudict.dict()


def word_phonemes_in_phrase(phrase):
    return [prondict[word][0] for word in word_tokenize(phrase)]


emoji_characters = "👻💀🦶🦵💄🦷👅👂👃👁🧠🥷🧝🧟🧛🧚👗👑🐨🐔🐧🦆🦅🦉🦇🐗🪱🦋🐌🐜🪳🕷🕸🦂🐢🐍🦎🐙🦑🦀🐡🐬🐘🦘🐂🐄🐎🐖🐑🐕🐩🐈🦃🦚🦜🦢🦩🐇🦝🦨🦥🐁🦔🍄🌹🌻🔥🌈🍐🍋🍌🍉🍓🥭🍍🥥🍅🥑🥦🥒🥕🧄🧅🥔🍞🥚🥓🦴🌭🌮🍿🍩🍪🥄🪃🪁🎤🎷🎺🪗🎻🚌🚜🛰🚀⛰⌚🖨📷🔋🕯🪛🔨🧲💣🪓🔭🔬🚽🪣🔑🚪🧸🎈🪑🔔"

rhyme_groups = ["🦵🥚", "🔋🍓", "🔬🔭", "🎤🎷", "🦝🥄", "🦇🐈", "👃🌹"]

emoji = {unicodedata.name(e).lower(): e for e in emoji_characters}
phrases = list(emoji.keys())
phonemes = {name: word_phonemes_in_phrase(name) for name in phrases}

syllables = {
    name: [
        [int(phon[-1]) for phon in word if phon[-1] in "012"] for word in phonemes[name]
    ]
    for name in emoji
}

syllable_lengths = {
    name: sum(len(word_sylls) for word_sylls in sylls)
    for (name, sylls) in syllables.items()
}

by_syllable_length = defaultdict(set)
for (phrase, length) in syllable_lengths.items():
    by_syllable_length[length].add(phrase)


def phonemes_from_last_root(word):
    last_word_phons = phonemes[word][-1]
    root_indexes = [
        idx for (idx, phon) in enumerate(last_word_phons) if phon[-1] in "012"
    ]
    return last_word_phons[root_indexes[-1]][:-1] + "".join(
        last_word_phons[root_indexes[-1] + 1 :]
    )


rhyme_categories = defaultdict(set)
for e in emoji:
    rhyme_categories[phonemes_from_last_root(e)].add(e)

rhyme_categories = {
    phon: options for (phon, options) in rhyme_categories.items() if len(options) > 1
}

max_length = max(by_syllable_length.keys())


def phrase_matches_pattern(phrase_syllables, pattern):
    pattern_offset = 0
    for word_sylls in phrase_syllables:
        length = len(word_sylls)
        if not word_matches_pattern(
            word_sylls, pattern[pattern_offset : pattern_offset + length]
        ):
            return False
        pattern_offset += length

    return True


def word_matches_pattern(word_syllables, pattern):
    if len(word_syllables) != len(pattern):
        return False

    # monosyllabic words can be stressed or unstressed
    if len(word_syllables) == 1:
        return True

    return all(
        syllable_matches_pattern(syll, pat)
        for (syll, pat) in zip(word_syllables, pattern)
    )


def syllable_matches_pattern(syllable, pat):
    if pat == "/":
        return syllable in {1, 2}
    elif pat == "x":
        return syllable in {0, 2}
    else:
        raise ValueError(f"unknown pattern: {pat}")


@cache
def all_pattern_options(pattern):
    if len(pattern) == 0:
        return [[]]

    options = []
    for length, phrases in by_syllable_length.items():
        if length > len(pattern):
            continue
        relevant_phrases = list(
            filter(
                lambda phrase: phrase_matches_pattern(
                    syllables[phrase], pattern[:length]
                ),
                phrases,
            )
        )
        remainder_options = phrase_options(pattern[length:])
        new_stuff = [
            [phrase] + remainder_option
            for remainder_option in remainder_options
            for phrase in relevant_phrases
        ]
        options.extend(new_stuff)

    return options


def random_pattern_option(pattern, remaining_tries=10000):
    if len(pattern) == 0:
        print(remaining_tries)
        return []

    if remaining_tries == 0:
        raise TimeoutError("nah")

    phrase = random.choice(phrases)
    length = syllable_lengths[phrase]
    if length > len(pattern):
        return random_pattern_option(pattern, remaining_tries=remaining_tries)

    if not phrase_matches_pattern(syllables[phrase], pattern[:length]):
        return random_pattern_option(pattern, remaining_tries=remaining_tries - 1)

    return [phrase] + random_pattern_option(
        pattern[length:], remaining_tries=remaining_tries
    )


random_pattern_option("x/x/x/x/")
