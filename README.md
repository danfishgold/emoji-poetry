# emoji poetry

generate random poetry using linguistics!

## how to run it

good ol' `npm install` followed by `npm run dev` will give you a nice local
server. build with `npm run build`. both of these commands run
`npm run build:emoji` and then a `vite` command.

`build:emoji` generates the `src/emoji.json` file, which is used by the website.

## how it works

everything flows pretty much sequentially:

1. `src.generateEmoji.ts` uses the `cmudict` and `unicode` packages to get
   linguistic properties for a list of emoji characters. these packages bundle
   _a lot_ of data so in order to avoid fetching them on the front end this file
   generates `src/emoji.json` (via `npm run build:emoji`).

2. `src/emoji.ts` provides a nice wrapper around the data in `src/emoji.json`

3. `src/sequence.ts` exposes a couple of things. the most important one is the
   `match` function, which takes in a scansion (a sequence of `/` and `x`
   characters and randomly picks emoji to fit that pattern). the other exports
   (`matchWithConstrainedEnd`, `isEmojiValidAsEnding`, and
   `isSequenceValidAsEnding`) are related to rhyming. all of these functions are
   used in `src/template.ts`.

4. `src/template.ts` is in charge of generating an entire template, with many
   scansion sequences and raw text. `parseTemplate` parses the template string
   and gives an array of atoms, and `generate` takes that array and generates
   emoji sequences where necessary (using `generateAtom`). rhyming related
   things live in this file because they need more context that a single
   sequence. rhyming works by picking rhyming emoji to go at the ends of
   sequences with the same rhyme group (denoted using a letter in parentheses at
   the end of a sequence).

5. `src/useTemplate.ts` wraps the functions in `template.ts` in a nice little
   react hook, to be used by the main component.

6. `src/App.tsx` is the main (and only) component. it triggers parsing and
   generation from `template.ts` via the `useTemplate` hook.
