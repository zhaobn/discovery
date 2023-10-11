
/* Dev setting */
let introBtnDelay = 0; // 40000

const feedbacRemain = '1000'; // mileseconds
let nullFeedback = 'Nothing came out';

/* Data */
let start_task_time = 0;
let subjectData = {};


/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}



/* Create task */

taksIds.forEach(tid => {
  let config = taskConfigsWithId[tid];
  getEl('task').append(drawTaskWithInfo(tid, config, baseObj))
  baseObj.forEach(el => {
    let item =tid + '-' + el;
    getEl(item).onclick = () => handleItemClick(item, tid)});
  getEl(`extract-btn-${tid}`).onclick = () => handleExtract(tid);
  getEl(`fuse-btn-${tid}`).onclick = () => handleFuse(tid);

  if (parseInt(tid[1]) > 1) {
    getEl('task-'+tid).style.display = 'none';
  }

  // Next btns
  if (parseInt(tid[1]) < taksIds.length) {
    let nextTid = 't' + (parseInt(tid[1])+1).toString();
    getEl('task-next-btn-' + tid).onclick = () => hideAndShowNext('task-'+tid, 'task-'+nextTid, 'block');
  } else {
    getEl('task-next-btn-' + tid).onclick = () => hideAndShowNext('task', 'debrief', 'block');
  }

})



/** Interactivities */
function handleItemClick(item, id, isFuseDemo = false) {

  let label = item.split('-').splice(-1)[0]

  if (allDisplays[id].length == 0) {
    let toAdd = drawBlock(label);
    toAdd.onclick = () => handleMachineItemClick('mid', id);
    getEl(`dis-item-mid-${id}`).append(toAdd);

    allDisplays[id].push(label);
    isFuseDemo? null: getEl(`extract-btn-${id}`).disabled = false;

  } else if (allDisplays[id].length == 1) {
    getEl(`dis-item-mid-${id}`).innerHTML = '';

    let toAddLeft = drawBlock(allDisplays[id][0]);
    toAddLeft.onclick = () => handleMachineItemClick('left', id);
    getEl(`dis-item-left-${id}`).append(toAddLeft);

    let toAddRight = drawBlock(label);
    toAddRight.onclick = () => handleMachineItemClick('right', id);
    getEl(`dis-item-right-${id}`).append(toAddRight);

    allDisplays[id].push(label);
    getEl(`extract-btn-${id}`).disabled = true;
    getEl(`fuse-btn-${id}`).disabled = false;

  }

}
function handleMachineItemClick(pos, id, isIntro=false) {
  if (pos == 'left' || pos == 'right') {
    getEl(`dis-item-right-${id}`).innerHTML = '';
    getEl(`dis-item-left-${id}`).innerHTML = '';

    let leftItem = (pos == 'left')? allDisplays[id][1]: ( (pos == 'right')? allDisplays[id][0]: null );

    let toAdd = drawBlock(leftItem);
    toAdd.onclick = () => handleMachineItemClick('mid', id);
    getEl(`dis-item-mid-${id}`).append(toAdd);

    allDisplays[id] = [leftItem];
    getEl(`extract-btn-${id}`).disabled = false;
    getEl(`fuse-btn-${id}`).disabled = true;

  } else if (pos == 'mid') {
    getEl(`dis-item-mid-${id}`).innerHTML = '';
    allDisplays[id] = [];
    getEl(`extract-btn-${id}`).disabled = true;
    getEl(`fuse-btn-${id}`).disabled = true;
  }

  if (isIntro) {
    if (played > 1 && allDisplays[introId].length == 0) {
      getEl(`instruction-btn-4`).style.opacity = 1
    }
  }

}

function recordData(id, action, result, r, total_r) {
  let datId = id + "-s" + (taskConfigsWithId[id]['step']-allStepsLeft[id]+1);

  trialData[datId]['item_selection'] = allDisplays[id];
  trialData[datId]['action'] = action;
  trialData[datId]['feedback'] = result;
  trialData[datId]['immediate_score'] = r;
  trialData[datId]['total_score'] = total_r;
}

function handleExtract(id, isDemo=false) {

  let reward = allObjRewards[id][allDisplays[id][0]];
  allScoreOnDisplay[id] +=  reward;
  allScoreHistory[id].push(allScoreOnDisplay[id]);
  getEl(`dis-item-mid-${id}`).innerHTML = '';

  // Give feedback
  getEl(`total-score-${id}`).innerHTML = allScoreOnDisplay[id].toString();
  let feedBackText = createCustomElement('div', 'feedback-text', '');
  feedBackText.innerHTML = '+' + reward;
  getEl(`feedback-box-${id}`).append(feedBackText);
  setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = '';}, feedbacRemain);

  // Record data
  isDemo? null : recordData(id, 'E', 'NA', reward, allScoreOnDisplay[id])

  // Reset machine
  allDisplays[id] = [];
  getEl(`extract-btn-${id}`).disabled = true;

  // Update step left
  updateStep(id)

}

function handleFuse(id, isFuseDemo = false, isDemo=false) {

  updateStep(id)

  // Update step
  let currentItems =  allDisplays[id].sort();
  // console.log('Fuse ' + currentItems[0] + ' and ' + currentItems[1]);

  let thisCombo = '[' + currentItems.join('') + ']';
  if (Object.keys(allCombo[id]).indexOf(thisCombo) > -1) {

    getEl(`dis-item-right-${id}`).innerHTML = '';
    getEl(`dis-item-left-${id}`).innerHTML = '';
    getEl(`dis-item-mid-${id}`).innerHTML = '';

    if (allCombo[id][thisCombo] == 1) {
      getEl(`feedback-box-${id}`).append(drawBlock(thisCombo));
    } else {
      getEl(`feedback-box-${id}`).innerHTML = nullFeedback;
    }

    // Record data
    isDemo? null : recordData(id, 'F', '1', 0, allScoreOnDisplay[id])

    setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = ''; }, feedbacRemain);

  } else {

    if (Math.random() < allBaseRates[id]) {

      // Make new combo
      let reward = Math.round(Math.max(allObjRewards[id][currentItems[0]], allObjRewards[id][currentItems[1]]) * allRewardInc[id]);
      allCombo[id][thisCombo] = 1;
      allObjRewards[id][thisCombo] = reward;
      allObjFeats[id][thisCombo] = allObjFeats[id][currentItems[0]];

      // Show results
      getEl(`dis-item-right-${id}`).innerHTML = '';
      getEl(`dis-item-left-${id}`).innerHTML = '';
      getEl(`dis-item-mid-${id}`).innerHTML = '';
      getEl(`feedback-box-${id}`).append(drawBlock(thisCombo));
      setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = '';}, feedbacRemain)

      // Update inventory
      addToInventory(id, thisCombo);

      // Record data
      isDemo? null : recordData(id, 'F', '1', 0, allScoreOnDisplay[id]);


    } else {

      // Record failure
      allCombo[id][thisCombo] = 0;
      getEl(`dis-item-right-${id}`).innerHTML = '';
      getEl(`dis-item-left-${id}`).innerHTML = '';
      getEl(`feedback-box-${id}`).innerHTML = nullFeedback;
      setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = ''; }, feedbacRemain);

      // Update history panel
      addToHistoryPanel(id, currentItems[0], currentItems[1]);

      // Record data
      isDemo? null : ecordData(id, 'F', '0', 0, allScoreOnDisplay[id]);

    }
  }

    // Reset machine
    allDisplays[id] = [];
    getEl(`fuse-btn-${id}`).disabled = true;
    if (isFuseDemo) {
      if (allCombo[id][thisCombo] == 1) {
        getEl('instruction-btn-5').style.opacity = 1;
      }
    }

}
function addToHistoryPanel (id, itemA, itemB) {

  let histInfo = createCustomElement('div', 'hist-cell', '');
  histInfo.append(drawBlock(itemA, '', 'small'));
  histInfo.append('+');
  histInfo.append(drawBlock(itemB, '', 'small'));

  getEl(`hist-box-${id}`).append(histInfo);
  getEl(`hist-box-${id}`).scrollTop = getEl(`hist-box-${id}`).scrollHeight;

}
function addToInventory (id, item) {
  let itemId = id + '-' + item
  let newItem = drawBlock(item, itemId);
  newItem.onclick = () => handleItemClick(itemId, id);
  getEl(`item-box-${id}`).append(newItem);

}

function updateStep(id, isDemo=false) {
  allStepsLeft[id] -= 1
  if (allStepsLeft[id] > 0) {
    let unitId = id + '-unit-' + (taskConfigsWithId[id]['step'] - allStepsLeft[id]).toString();
    getEl(unitId).style.backgroundColor = 'white';
  } else if (allStepsLeft[id] == 0) {
    let unitId = id + '-unit-' + (taskConfigsWithId[id]['step'] - allStepsLeft[id]).toString();
    getEl(unitId).style.backgroundColor = 'white';
    isDemo? null : showNext('intro-btn-group-'+id);
    disableMachine(id)
  } else {
    disableMachine(id)
  }
}

function disableMachine(id) {
  baseObj.forEach(el => {
    let item =id + '-' + el;
    getEl(item).onclick = () => null;
  })

  let currentObjs = Object.entries(allCombo[id]).filter(([_, v]) => v > 0);
  if (currentObjs.length > 0) {
    currentObjs.forEach(el => {
      let item = id + '-' + el[0];
      getEl(item).onclick = () => null;
    })
  }

  getEl(`extract-btn-${id}`).disabled = true;
  getEl(`fuse-btn-${id}`).disabled = true;

}



/* Prepare instruction */
let introId = 'intro-1';
let played = 0;
setTimeout(() => { getEl(`instruction-btn-0`).style.opacity = 1;}, introBtnDelay);

getEl('intro-demo-1').append(drawTask(introId, taskConfigsWithId[introId]['color'], taskConfigsWithId[introId]['step']));
getEl('hist-box-intro-1').style.height = '300px';
baseObj.forEach(el => {
  let item = introId + '-' + el;
  getEl(item).onclick = () => {
    let label = item.split('-').splice(-1)[0]

    if (allDisplays[introId].length == 0) {
      let toAdd = drawBlock(label);
      toAdd.onclick = () => handleMachineItemClick('mid', introId, true);
      getEl(`dis-item-mid-${introId}`).append(toAdd);

      allDisplays[introId].push(label);
      // getEl(`extract-btn-${id}`).disabled = false;
      getEl(`instruction-btn-1`).style.opacity = 1
      played += 1;
  }
  }});

function introBtn01() {
  hideAndShowNext('intro-sub-1-0', 'intro-sub-1-1', 'block');
  hide('intro-btn-group-0');
}
function introBtn02() {
  // hide('intro-p-2');
  hide('intro-p-3');
  showNext('intro-sub-1-3', 'block');
  getEl(`extract-btn-${introId}`).disabled = false;
  getEl(`extract-btn-${introId}`).onclick = () => {
    handleExtract(introId, true);
    getEl('instruction-btn-2').style.opacity = 1;
  }

}
function introBtn03() {
  hideAndShowNext('intro-sub-1-3', 'intro-sub-1-4', 'block');
  setTimeout(() => { getEl(`instruction-btn-3`).style.opacity = 1;}, introBtnDelay);
}



let introIdFuse = 'intro-2';
getEl('intro-demo-2').append(drawTask(introIdFuse, taskConfigsWithId[introIdFuse]['color'], taskConfigsWithId[introIdFuse]['step']));
getEl('hist-box-intro-2').style.height = '300px';
baseObj.forEach(el => {
  let item =introIdFuse + '-' + el;
  getEl(item).onclick = () => handleItemClick(item, introIdFuse, true)});
getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, true, true);

function introBtn06() {
  hide('intro-sub-2-1');
  hide('intro-btn-group-5');
  showNext('intro-sub-2-2', 'block');

  baseObj.forEach(el => {
    let item =introIdFuse + '-' + el;
    getEl(item).onclick = () => handleItemClick(item, introIdFuse)});
  getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, false, true);
  getEl(`extract-btn-${introIdFuse}`).onclick = () => {
    handleExtract(introIdFuse, true);
    getEl('instruction-btn-6').style.opacity = 1;
  }
}


function introBtn07() {
  hideAndShowNext('intro-sub-2-2', 'intro-sub-2-3', 'block');
  setTimeout(() => { getEl(`instruction-btn-7`).style.opacity = 1;}, introBtnDelay);
}

function introBtn08() {
  hideAndShowNext('intro-sub-2-3', 'intro-sub-2-4', 'block');
  setTimeout(() => { getEl(`instruction-btn-8`).style.opacity = 1;}, introBtnDelay);
}




/* Comprehension quiz */
const checks = [ 'check1', 'check2', 'check3', 'check4', 'check5', 'check6' ];
const answers = [ false, false, true, false, true, false ];

function check_quiz() {
  getEl('check-btn').style.display = 'none';

  let inputs = [];
  checks.map(check => {
    const vals = document.getElementsByName(check);
    inputs.push(vals[0].checked);
  });
  const pass = (inputs.join('') === answers.join(''));

  if (pass) {
    showNext('pass', 'block');
  } else {
    showNext('retry', 'block');
  }
}
function handle_pass() {
  start_task_time = Date.now();
  hide("pass");
  hide("quiz");
  showNext("task", "block");
}
function handle_retry() {
  hide("retry");
  hide("quiz");
  showNext("instruction", "block");
  hideAndShowNext('instruction-4', 'instruction-1', 'block');
  hideAndShowNext('intro-sub-1-5', 'intro-p-3', 'block');
  getEl('check-btn').style.display = 'flex';
}
getEl('prequiz').onchange = () => compIsFilled() ? getEl('check-btn').disabled = false : null;



/* Bebrief */
getEl('postquiz').onchange = () => isFilled('postquiz')? getEl('done-btn').disabled = false: null;

function is_done(complete_code) {
  let inputs = getEl('postquiz').elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);

  // Clean up free responses
  subjectData['strategy'] = removeSpecial(subjectData['strategy']);
  subjectData['feedback'] = removeSpecial(subjectData['feedback']);

  const end_time = new Date();
  let token = generateToken(8);

  // Save data
  let clientData = {};
  clientData.subject = subjectData;
  clientData.subject.date = formatDates(end_time, 'date');
  clientData.subject.time = formatDates(end_time, 'time');
  clientData.subject.task_duration = end_time - start_task_time;
  clientData.subject.token = token;

  clientData.trial = trialData;

  // Transit
  hideAndShowNext("debrief", "completed", 'block');
  getEl('completion-code').append(document.createTextNode(complete_code));

  // download(JSON.stringify(clientData), 'data.txt', '"text/csv"');
  console.log(clientData);
}
