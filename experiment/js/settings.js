let isDev = true;

/** Set up conditions */
const knowledge = ['expert', 'novice'];
const density = ['low', 'high'];

let conditions = []
knowledge.forEach(e => {
  density.forEach(d => conditions.push(e+'-'+d));
});

const cond = isDev? 'expert-low': sampleFromList(conditions, 1);
console.log(cond)

const assignedKnowledge = cond.split('-')[0];
const assignedDensity = cond.split('-')[1];


/** Task-related settings */
const baseReward = 100;
const rewardInc = 1.5;
const steps = 10;

const nPractice = 2;
const taskBlockSize = 7;

const demoProb = 0.5;
const highProb = 0.8
const lowProb = 0.2;

const baseObj = ['a', 'b', 'c', 'd', 'e', 'f'];
const allShapes = ['square', 'circle', 'triangle', 'diamond' ];


let shapes = (assignedDensity == 'low') ? sampleFromList(allShapes, 2, false) : allShapes;
shapes = shuffleArray(shapes);
let allObjs = [];
shapes.forEach(s => {
  baseObj.forEach(o => {
    allObjs.push(s + "-" + o)
  })
});

const allColors = [
  '#f44336',
  '#e81e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  // from chat-gpt
  // '#FFC107',
  // '#4CAF50',
  // '#1976D2',
  // '#66CCCC',
]
let objColors =  sampleFromList(allColors, taskBlockSize, false); //[ 'rgb(0 114 178)', 'rgb(86 180 233)','rgb(230 159 0)','rgb(213 94 0)', 'rgb(204 121 167)', 'rgb(0 0 0)', 'rgb(0 153 76)', 'rgb(102 0 102)' ];
//objColors = sampleFromList(objColors, taskBlockSize, false);
const demoObjColor = 'silver';

const demoMachineColor = 'gray';
let machineColors = sampleFromList(allColors, taskBlockSize, false); //[ 'royalblue', 'darkgreen', 'darkred', 'darkslategray', 'lightcoral', 'lightseagreen', 'mediumpurple', 'rosybrown' ];
//machineColors = sampleFromList(machineColors, taskBlockSize, false);

let machineColor = demoMachineColor;


/** Prep setting to task configurations */
let allUniqueCombinations = new Set();
for (let i = 0; i < shapes.length; i++) {
  for (let j = i; j < shapes.length; j++) {
    allUniqueCombinations.add(shapes[i] + '-' + shapes[j]);
  }
}
let combinations = Array.from(allUniqueCombinations);
let highCombos = [];
if (assignedDensity=='low') {
  for (let i = 0; i < Math.floor(taskBlockSize/combinations.length) ; i++) {
    highCombos = highCombos.concat(combinations);
  }
  let residue = taskBlockSize % combinations.length
  if ( residue == 1) {
    highCombos.push(sampleFromList(combinations, residue))
  } else if (residue > 1) {
    highCombos.concat(sampleFromList(combinations, residue, false))
  }
} else {
  highCombos = sampleFromList(combinations, taskBlockSize, false);
}
highCombos = shuffleArray(highCombos);
// console.log(highCombos);

let taskConfigsWithId = {};

// Add practice trial config
let pracConfig = {
  'highP': demoProb,
  'lowP': demoProb,
  'shapes': shapes,
  'highCombo': sampleFromList(combinations, 1),
  'w': rewardInc,
  'color': demoMachineColor,
  'objColor': demoObjColor,
  'step': steps,
  'r': baseReward
};
for (let i = 0; i < nPractice; i++) {
  let taskId = 'p' + (i+1).toString();
  taskConfigsWithId[taskId] = pracConfig;
}


// Task trial config
objColors.forEach((col, id) => {
  let taskId = 't'+(id+1).toString();
  taskConfigsWithId[taskId] = {
    'highP': highProb,
    'lowP': lowProb,
    'shapes': shapes,
    'highCombo': highCombos[id],
    'w': rewardInc,
    'step': steps,
    'r': baseReward,
    'objColor': col,
    'color': machineColors[id] };
})
// console.log(taskConfigsWithId)

// Pad info for instruction demos
let demoConfig = {
  'highP': demoProb,
  'lowP': demoProb,
  'shapes': shapes,
  'highCombo': sampleFromList(combinations, 1),
  'w': rewardInc,
  'color': demoMachineColor,
  'objColor': demoObjColor,
  'step': steps,
  'r': baseReward
};
taskConfigsWithId['intro1'] = demoConfig;
taskConfigsWithId['intro2'] = demoConfig;


/** Initialize task data */

const allMachineIds = Object.keys(taskConfigsWithId);
const taskIds = allMachineIds.filter(id => id[0] != 'i');
const testIds = taskIds.filter(id => id[0] == 't');
const practiceIds = taskIds.filter(id => id[0] == 'p');

let allDisplays = {};
let allScoreOnDisplay = {};
let allScoreHistory = {};

let allCombo = {};
let allRecipes = {};

let allObjRewards = {};
let allObjLevels = {};
let allHighCombos = {};

let allBaseRatesSquare = {};
let allBaseRatesCircle = {};
let allBaseRatesInter = {};
let allRewardInc = {};
let allStepsLeft = {};

function initData(id) {

  allDisplays[id] = [];
  allScoreOnDisplay[id] = 0;
  allScoreHistory[id] = [];
  allCombo[id] = {};
  allRecipes[id] = {};

  allObjRewards[id] = {};
  allObjs.forEach(obj => allObjRewards[id][obj] = baseReward);

  allObjLevels[id] = {};
  allObjs.forEach(obj => allObjLevels[id][obj] = '1');

  allHighCombos[id] = taskConfigsWithId[id]['highCombo'];
  allRewardInc[id] = taskConfigsWithId[id]['w'];
  allStepsLeft[id] = steps;

}

allMachineIds.forEach(tid => { initData(tid) });


/** Prep data to save */
let trialData = {};
taskIds.forEach((tid, idx) => {
  for (let i = 1; i <= taskConfigsWithId[tid]['step']; i++) {
    let dat = {};
    dat['task_id'] = tid;
    dat['step_id'] = i;
    dat['knowledge'] = assignedKnowledge;
    dat['density'] = assignedDensity;
    dat['highCombo'] = taskConfigsWithId[tid]['highCombo'];
    dat['w'] = allRewardInc[tid];
    dat['item_selection'] = [];
    dat['action'] = '';
    dat['feedback'] = '';
    dat['immediate_score'] = '';
    dat['total_score'] = '';
    dat['timestamp'] = 0;
    let datId = tid + "-s" + i;
    trialData[datId] = dat;
  }

})
// console.log(trialData);
