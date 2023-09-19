
const baseReward = 10;
const baseRate = 0.5;
const rewardInc = 1.2;
const discount = 0.8;

let scoreOnDisplay = 0;
let chanceLeft = discount;

let objFeats = {
  '*': 'gold',
  'a': 'rgb(0 0 0)',
  'b': 'rgb(0 114 178)',
  'c': 'rgb(86 180 233)',
  'd': 'rgb(230 159 0)',
  'e': 'rgb(213 94 0)',
  'f': 'rgb(204 121 167)',
}
const baseObj = Object.keys(objFeats);

let combos = {};
baseObj.forEach(el => (el != '*')? combos[el] = baseReward : null);

getEl('score-text').innerHTML = scoreOnDisplay;
// getEl('chance-bar-val').style.height = chanceTobar(discount);
