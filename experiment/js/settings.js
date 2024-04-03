let isDev = true;

/** Set up conditions */
const condSettings = {
  // 'all': { 'p': 0.2, 'w': 3, 'r': 20},
  // 'alh': { 'p': 0.2, 'w': 4, 'r': 3},
  // 'ahl': { 'p': 0.8, 'w': 1.2, 'r': 25},
  // 'ahh': { 'p': 0.8, 'w': 2, 'r': 1},

  'bll': { 'p': 0.2, 'w': 1.5, 'r': 500},
  'blh': { 'p': 0.2, 'w': 3, 'r': 150},
  'bhl': { 'p': 0.8, 'w': 1.5, 'r': 150},
  'bhh': { 'p': 0.8, 'w': 3, 'r': 1},
}

const conditions = Object.keys(condSettings);
const cond = isDev? 'bhh': sampleFromList(conditions, 1);
const showProb = true;

const baseRate = condSettings[cond]['p'];
const rewardInc = condSettings[cond]['w'];
let baseReward = condSettings[cond]['r'];
isDev? console.log(cond, baseRate, rewardInc, baseReward) : null;



/** Task-related settings */

const nPractice = 2;
const taskBlockSize = 7;
const steps = 10;

const baseObj = ['a', 'b', 'c', 'd', 'e', 'f'];

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


/** Prep setting to task configurations */

let taskConfigsWithId = {};

// Add practice trial config
let pracConfig = { 'p': baseRate, 'w': rewardInc, 'color': demoMachineColor, 'objColor': demoObjColor, 'step': steps, 'r': baseReward };
for (let i = 0; i < nPractice; i++) {
  let taskId = 'p' + (i+1).toString();
  taskConfigsWithId[taskId] = pracConfig;
}
// Task trial config
objColors.forEach((col, id) => {
  let taskId = 't'+(id+1).toString();
  taskConfigsWithId[taskId] = { 'p': baseRate, 'w': rewardInc, 'step': steps, 'r': baseReward, 'objColor': col, 'color': machineColors[id] };
})
// Pad info for instruction demos
let demoConfig = { 'p': 0.4, 'w': rewardInc, 'color': demoMachineColor, 'objColor': demoObjColor, 'step': steps, 'r': baseReward };
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
let allObjRewards = {};
let allObjLevels = {};

let allBaseRates = {};
let allRewardInc = {};
let allStepsLeft = {};

function initData(id) {

  allDisplays[id] = [];
  allScoreOnDisplay[id] = 0;
  allScoreHistory[id] = [];
  allCombo[id] = {};

  allObjRewards[id] = {};
  baseObj.forEach(obj => allObjRewards[id][obj] = baseReward);

  allObjLevels[id] = {};
  baseObj.forEach(obj => allObjLevels[id][obj] = '1');

  allBaseRates[id] = taskConfigsWithId[id]['p'];
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
    dat['p'] = allBaseRates[tid];
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
