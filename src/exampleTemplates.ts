import { random } from './util'

const commonMeter = 'x/x/x/x/\nx/x/x/ (A)\nx/x/x/x/\nx/x/x/ (A)'
const tweet =
  '/xx/x (A)\n/xx/ (B)\n/xx/x (A)\n/xx/ (B)\n\n/xx/x\n/xx/ (C)\n/xx/xx/xx/ (C)\n\n/xx/xx/xx/ (D)\n/xx/xx/xx/ (D)\n\n/xx/xx/xx/ (E)\n/xx\n/xx\n/xx\n/ (E)'
const tips = `tip #1: you can use words and emoji together /xx/x even in the same line. be careful of the letter x\n\ntip #2: you can also have internal rhymes in the same line:\n\n/(A)/x(B)/xx(C)/(A)/x(B)/xx(C)\n/xx/xx/xx/(D)\n\n/(E)/x(F)/xx(G)/x(F)/(E)/xx(G)\n/xx/x\nx/x\nx/(D)\n\ntip #3: short rhyming sequences tend to be repetitive, so you have to randomize them a little to get something interesting`
const callMeMaybe =
  '(to the tune of call me maybe)\n\n/ /x/x\nx/x/x(A)\nx/x/x\nx/x/x(A)'
const raven =
  '/x/x/x/x(A)/x/x/x/x(A)\n/x/x/x/x/x/x/x/(B)\n/x/x/x/x(C)/x/x/x/x(C)\n/x/x/x/x(C)/x/x/x/(B)\n/x/x/x/x/x/x/x/(B)\n/x/x/x/(B)'

function randomLimerick(): string {
  const longFoot = random(['/xx', 'x/x', 'xx/'])
  const shortFoot = random(['/xx', 'x/x', 'xx/'])

  const longLine = [longFoot, longFoot, longFoot, '(A)'].join('')
  const shortLine = [shortFoot, shortFoot, '(B)'].join('')

  return [longLine, longLine, shortLine, shortLine, longLine].join('\n')
}
export { commonMeter, tweet, tips, callMeMaybe, raven, randomLimerick }
