let isDev = true;

/** Set up conditions */

const conditions = [ 'k2', 'k8', 'u2', 'u8'];
const cond = isDev? 'u8': sampleFromList(conditions, 1);
const showProb = cond[0] == 'k';
const baseRate =  parseInt(cond[1])/10;
const rewardInc = 2;
const baseReward = (baseRate==0.2)? 50: 5;
isDev? console.log(cond, showProb, baseRate, baseReward) : null;


/** Task-related settings */

const nPractice = 2;
const taskBlockSize = 6;
const steps = 10;

const baseObj = ['a', 'b', 'c', 'd', 'e', 'f'];
let objColors = [ 'rgb(0 114 178)', 'rgb(86 180 233)','rgb(230 159 0)','rgb(213 94 0)', 'rgb(204 121 167)', 'rgb(0 0 0)' ];
objColors = sampleFromList(objColors, taskBlockSize, false);
const demoObjColor = 'silver';
const machineColor = 'darkslategray';


/** Prep setting to task configurations */

let taskConfigsWithId = {};

// Add practice trial config
let pracConfig = { 'p': 0.4, 'w': 2, 'color': demoObjColor, 'step': steps, 'r': baseReward };
for (let i = 0; i < nPractice; i++) {
  let taskId = 'p' + (i+1).toString();
  taskConfigsWithId[taskId] = pracConfig;
}
// Task trial config
objColors.forEach((col, id) => {
  let taskId = 't'+(id+1).toString();
  taskConfigsWithId[taskId] = { 'p': baseRate, 'w': 2, 'step': steps, 'r': baseReward, 'color': col };
})
// Pad info for instruction demos
let demoConfig = { 'p': 0.4, 'w': 2, 'color': demoObjColor, 'step': steps, 'r': baseReward };
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
