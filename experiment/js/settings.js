let isDev = true;

/** Set up conditions */
const knowledge = ['expert', 'noice'];
const probs = {
  'square': { 'pcircle': 0.2, 'psquare': 0.8, 'pcross': 0.2 },
  'circle': { 'pcircle': 0.8, 'psquare': 0.2, 'pcross': 0.2 },
  'cross': { 'pcircle': 0.2, 'psquare': 0.2, 'pcross': 0.8 }
}
let conditions = []
knowledge.forEach(e => {
  Object.keys(probs).forEach(p => conditions.push(e+'-'+p));
});


const cond = isDev? 'expert-cross': sampleFromList(conditions, 1);
const assignedKnowledge = cond.split('-')[0];
const assignedProbCond = cond.split('-')[1];
isDev? console.log(assignedKnowledge, assignedProbCond): null;



/** Task-related settings */
const baseReward = 100;
const rewardInc = 1.5;
const steps = 10;

const nPractice = 2;
const taskBlockSize = 7;
const demoProb = 0.5;

const baseObj = ['a', 'b', 'c', 'd', 'e', 'f'];
const shapes = ['square', 'circle' ];

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
  '#ff5722'
]
let objColors =  sampleFromList(allColors, taskBlockSize, false); //[ 'rgb(0 114 178)', 'rgb(86 180 233)','rgb(230 159 0)','rgb(213 94 0)', 'rgb(204 121 167)', 'rgb(0 0 0)', 'rgb(0 153 76)', 'rgb(102 0 102)' ];
//objColors = sampleFromList(objColors, taskBlockSize, false);
const demoObjColor = 'silver';

const demoMachineColor = 'gray';
let machineColors = sampleFromList(allColors, taskBlockSize, false); //[ 'royalblue', 'darkgreen', 'darkred', 'darkslategray', 'lightcoral', 'lightseagreen', 'mediumpurple', 'rosybrown' ];
//machineColors = sampleFromList(machineColors, taskBlockSize, false);

let machineColor = demoMachineColor;

// counterbalance which type is shown on the left in the
const squareOnLeft = (Math.random() < 0.5)? 1 : 0;



/** Prep setting to task configurations */

let taskConfigsWithId = {};

// Add practice trial config
let pracConfig = {
  'pcircle': probs[assignedProbCond]['pcircle'],
  'psquare': probs[assignedProbCond]['psquare'],
  'pcross': probs[assignedProbCond]['pcross'],
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
    'pcircle': probs[assignedProbCond]['pcircle'],
    'psquare': probs[assignedProbCond]['psquare'],
    'pcross': probs[assignedProbCond]['pcross'],
    'w': rewardInc,
    'step': steps,
    'r': baseReward,
    'objColor': col,
    'color': machineColors[id] };
})
// Pad info for instruction demos
let demoConfig = { 'pcircle': demoProb, 'psquare': demoProb, 'pcross': demoProb, 'w': rewardInc, 'color': demoMachineColor, 'objColor': demoObjColor, 'step': steps, 'r': baseReward };
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

  allBaseRatesSquare[id] = taskConfigsWithId[id]['psquare'];
  allBaseRatesCircle[id] = taskConfigsWithId[id]['pcircle'];
  allBaseRatesInter[id] = taskConfigsWithId[id]['pcross'];
  allRewardInc[id] = taskConfigsWithId[id]['w'];
  allStepsLeft[id] = steps;

}

allMachineIds.forEach(tid => { initData(tid) });


/** Prep data to save */
let trialData = {};
taskIds.forEach(tid => {

  for (let i = 1; i <= taskConfigsWithId[tid]['step']; i++) {
    let dat = {};
    dat['task_id'] = tid;
    dat['step_id'] = i;
    dat['knowledge'] = assignedKnowledge;
    dat['squareOnLeft'] = squareOnLeft;
    dat['pcircle'] = probs[assignedProbCond]['pcircle'],
    dat['psquare'] = probs[assignedProbCond]['psquare'],
    dat['pcross'] = probs[assignedProbCond]['pcross'],
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
//console.log(trialData);
