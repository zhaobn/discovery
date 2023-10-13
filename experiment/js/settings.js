
const baseReward = 10;
const baseRateArr = [ 'p', 0.2, 0.5, 0.8 ];
const rewardIncArr = [ 2, 2, 2 ];
const steps = 10;



const levelColors = [
  '#F0E442',
  '#E69F00',
  '#D55E00',
  '#CC79A7',
  '#56B4E9',
  '#009E73',
  '#0072B2',
  '#4B0092',
];


let objFeats = {
  'a': 'rgb(0 0 0)',
  'b': 'rgb(0 114 178)',
  'c': 'rgb(86 180 233)',
  'd': 'rgb(230 159 0)',
  'e': 'rgb(213 94 0)',
  'f': 'rgb(204 121 167)',
}
const baseObj = Object.keys(objFeats);

const colorList = [ 'royalblue', 'darkgreen', 'darkred', 'darkslategray', 'lightcoral', 'lightseagreen', 'mediumpurple', 'rosybrown' ];


let taskConfigs = [];
baseRateArr.forEach(baseRate => {
  rewardIncArr.forEach(rewardInc => {
    taskConfigs.push({'p': baseRate, 'w': rewardInc})
  })
})
let machineColors = sampleFromList(colorList, 3, 0);


let taskConfigsWithId = {};
taskConfigs.forEach((tc, id) => {
  let taskId = 'demo';
  if (tc['p'] == 'p') {
    taskId = 'p' + (id+1).toString();
    tc['color'] = 'gray';
    tc['p'] = 0.4;
  } else {
    taskId = 't' + (id-2).toString();
    tc['color'] = machineColors[baseRateArr.indexOf(tc['p'])-1];
  }
  taskConfigsWithId[taskId] = tc;
  taskConfigsWithId[taskId]['step'] = steps;
})

// Pad info for instruction demos
let demoConfig = { 'p': 0.4, 'w': 2, 'color': 'silver', 'step': steps }
taskConfigsWithId['intro-1'] = demoConfig;
taskConfigsWithId['intro-2'] = demoConfig;


/** Initialize task data */

const allMachineIds = Object.keys(taskConfigsWithId);
const taksIds = allMachineIds.filter(id => id[0] != 'i');
const testIds = taksIds.filter(id => id[0] == 't');
const practiceIds = taksIds.filter(id => id[0] == 'p');

let allDisplays = {};
let allScoreOnDisplay = {};
let allScoreHistory = {};

let allCombo = {};
let allObjFeats = {};
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
  allObjFeats[id] = objFeats;

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
taksIds.forEach(tid => {

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
    let datId = tid + "-s" + i;
    trialData[datId] = dat;
  }

})
// console.log(trialData);
