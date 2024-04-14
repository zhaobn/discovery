
/* Dev setting */
let introBtnDelay = isDev? 0: 5000;

const feedbacRemain = '1000'; // mileseconds
let nullFeedback = 'Nothing came out';

/* Data */
let start_task_time = 0;
let subjectData = {};
let intructionCount = 1;

subjectData['condition'] = cond;
subjectData['intruction'] = intructionCount;


/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}



/* Create task */

getEl('task').append(makeTransitionDiv('practice', 0));
getEl('preview-next-btn-practice').onclick = () => hideAndShowNext('preview-practice', 'task-p1', 'block');
practiceIds.forEach(pid => {
  let config = taskConfigsWithId[pid];
  getEl('task').append(drawTaskWithInfo(pid, config, baseObj))
  baseObj.forEach(el => {
    let squareItem = pid + '-square-' + el;
    let circleItem = pid + '-circle-' + el;
    getEl(squareItem).onclick = () => handleItemClick(squareItem, pid);
    getEl(circleItem).onclick = () => handleItemClick(circleItem, pid);
  });
  getEl(`extract-btn-${pid}`).onclick = () => handleExtract(pid);
  getEl(`fuse-btn-${pid}`).onclick = () => handleFuse(pid);
  getEl('task-next-btn-' + pid).onclick = () => giveFeedback(pid);

  getEl('task-'+pid).style.display = 'none';
})


getEl('task').append(makeTransitionDiv('task'));
hide('preview-task');
getEl('preview-next-btn-task').onclick = () => hideAndShowNext('preview-task', 'task-t1', 'block');
testIds.forEach(tid => {
  let config = taskConfigsWithId[tid];
  getEl('task').append(drawTaskWithInfo(tid, config, baseObj))
  baseObj.forEach(el => {
    let squareItem = tid + '-square-' + el;
    let circleItem = tid + '-circle-' + el;
    getEl(squareItem).onclick = () => handleItemClick(squareItem, tid);
    getEl(circleItem).onclick = () => handleItemClick(circleItem, tid);
  });
  getEl(`extract-btn-${tid}`).onclick = () => handleExtract(tid);
  getEl(`fuse-btn-${tid}`).onclick = () => handleFuse(tid);
  getEl('task-next-btn-' + tid).onclick = () => giveFeedback(tid);

  getEl('task-'+tid).style.display = 'none';

})


/** Interactivities */
function readShape(str) { return str.split('-')[0] };
function readLabel(str) { return str.split('-')[1] };

function handleItemClick(item, id, isFuseDemo = false) { // id is task id

  let [ task, shape, label ] = item.split('-');
  let color = taskConfigsWithId[task]['objColor'];

  if (allDisplays[id].length == 0) {
    let toAdd = drawBlock(shape, label, '', color, 0, '');
    toAdd.onclick = () => handleMachineItemClick('mid-'+shape, id);
    getEl(`dis-item-mid-${id}`).append(toAdd);

    allDisplays[id].push(shape+'-'+label);
    isFuseDemo? null: getEl(`extract-btn-${id}`).disabled = false;

  } else if (allDisplays[id].length == 1) {
    getEl(`dis-item-mid-${id}`).innerHTML = '';

    let toAddLeft = drawBlock(readShape(allDisplays[id][0]), readLabel(allDisplays[id][0]), '', color, 0, '');
    toAddLeft.onclick = () => handleMachineItemClick('left-'+readShape(allDisplays[id][0]), id);
    getEl(`dis-item-left-${id}`).append(toAddLeft);

    let toAddRight = drawBlock(shape, label, '', color, 0, '');
    toAddRight.onclick = () => handleMachineItemClick('right-'+shape, id);
    getEl(`dis-item-right-${id}`).append(toAddRight);

    allDisplays[id].push(shape+'-'+label);
    getEl(`extract-btn-${id}`).disabled = true;
    getEl(`fuse-btn-${id}`).disabled = false;

  }

}
function handleMachineItemClick(item, id, isIntro=false) {

  let [ pos, shape ] = item.split('-');

  if (pos == 'left' || pos == 'right') {
    getEl(`dis-item-right-${id}`).innerHTML = '';
    getEl(`dis-item-left-${id}`).innerHTML = '';

    let leftItem = (pos == 'left')? allDisplays[id][1]: ( (pos == 'right')? allDisplays[id][0]: null );

    let toAdd = drawBlock(readShape(leftItem), readLabel(leftItem), '', taskConfigsWithId[id]['objColor'], 0, '');
    toAdd.onclick = () => handleMachineItemClick('mid-'+readShape(leftItem), id);
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

  trialData[datId]['item_selection'] = allDisplays[id].join('-');
  trialData[datId]['action'] = action;
  trialData[datId]['feedback'] = result;
  trialData[datId]['immediate_score'] = r;
  trialData[datId]['total_score'] = total_r;
  trialData[datId]['timestamp'] = Date.now();
}

function handleExtract(id, isDemo=false) { // id is task id

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
  updateStep(id, isDemo)

}

function handleFuse(id, isFuseDemo = false, isDemo=false) {

  let currentItems =  allDisplays[id].sort();
  let [itemA, itemB] = currentItems;
  // console.log('Fuse ' + itemA + ' and ' + itemB);

  let thisCombo = '[' + [itemA, itemB].join(',') + ']';
  if (Object.keys(allRecipes[id]).indexOf(thisCombo) > -1) {
    getEl(`dis-item-right-${id}`).innerHTML = '';
    getEl(`dis-item-left-${id}`).innerHTML = '';
    getEl(`dis-item-mid-${id}`).innerHTML = '';

    // if (allCombo[id][thisCombo] == 1) {
    //   getEl(`feedback-box-${id}`).append(drawBlock(thisCombo, '', taskConfigsWithId[id]['objColor'], 0, '',));
    // } else {
    //   getEl(`feedback-box-${id}`).innerHTML = nullFeedback;
    // }
    // // Record data
    // isDemo? null : recordData(id, 'F', '1', 0, allScoreOnDisplay[id])

    getEl(`feedback-box-${id}`).innerHTML = 'Tried this before!'

    setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = ''; }, feedbacRemain);

  } else {

    let shapeA = readShape(itemA);
    let shapeB = readShape(itemB);
    let labelA = readLabel(itemA);
    let labelB = readLabel(itemB);
    let labels = [labelA, labelB].sort();

    let successRate = 0;
    let resultShape = '';
    let resultLabel = '[' + labels.join('') + ']';

    if (shapeA == 'circle' && shapeB == 'circle') {
      successRate = allBaseRatesCircle[id];
      resultShape = 'circle';
    } else if (shapeA == 'square' && shapeB == 'square') {
      successRate = allBaseRatesSquare[id];
      resultShape = 'square';
    } else {
      successRate = allBaseRatesInter[id];
      resultShape =  (Math.random() < 0.5)? 'square' : 'circle';
    }
    // console.log(successRate, resultShape, resultLabel)

    if (Math.random() < successRate) {

      // Make new combo
      let newItem = resultShape + '-' + resultLabel;
      let reward = Math.round(Math.max(allObjRewards[id][itemA], allObjRewards[id][itemB]) * allRewardInc[id]);
      allRecipes[id][thisCombo] = newItem;
      allObjRewards[id][newItem] = reward;
      // console.log(allRecipes[id]);
      // console.log(allObjRewards[id]);

      // Get new obj level
      allObjLevels[id][newItem] = Math.max(allObjLevels[id][itemA], allObjLevels[id][itemB]) + 1;

      // Show results
      getEl(`dis-item-right-${id}`).innerHTML = '';
      getEl(`dis-item-left-${id}`).innerHTML = '';
      getEl(`dis-item-mid-${id}`).innerHTML = '';
      getEl(`feedback-box-${id}`).append(drawBlock(resultShape, resultLabel, '', taskConfigsWithId[id]['objColor'], 0, ''));
      setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = '';}, feedbacRemain)

      // Update inventory
      addToInventory(id, newItem);

      // Record data
      isDemo? null : recordData(id, 'F', '1', 0, allScoreOnDisplay[id]);


    } else {

      // Record failure
      allRecipes[id][thisCombo] = '';
      getEl(`dis-item-right-${id}`).innerHTML = '';
      getEl(`dis-item-left-${id}`).innerHTML = '';
      getEl(`feedback-box-${id}`).innerHTML = nullFeedback;
      setTimeout(() => { getEl(`feedback-box-${id}`).innerHTML = ''; }, feedbacRemain);

      // Update history panel
      addToHistoryPanel(id, itemA, itemB);

      // Record data
      isDemo? null : recordData(id, 'F', '0', 0, allScoreOnDisplay[id]);

    }

    // Update step
    updateStep(id, isDemo)
  }

  // Reset machine
  allDisplays[id] = [];
  getEl(`fuse-btn-${id}`).disabled = true;

  if (isFuseDemo) {
    if (allRecipes[id][thisCombo].length > 0) {
      showNext('intro-btn-group-5');
      getEl('instruction-btn-5').style.opacity = 1;
    }
  }

}
function addToHistoryPanel (id, itemA, itemB) {

  let histInfo = createCustomElement('div', 'hist-cell', '');
  histInfo.append(drawBlock(readShape(itemA), readLabel(itemA), '', taskConfigsWithId[id]['objColor'], 0, 'small',));
  histInfo.append('+');
  histInfo.append(drawBlock(readShape(itemB), readLabel(itemB), '', taskConfigsWithId[id]['objColor'], 0, 'small'));

  getEl(`hist-box-${id}`).append(histInfo);
  getEl(`hist-box-${id}`).scrollTop = getEl(`hist-box-${id}`).scrollHeight;

}
function addToInventory (id, item) {
  let itemId = id + '-' + item
  let newItem = drawBlock(readShape(item), readLabel(item), itemId, taskConfigsWithId[id]['objColor'],  allObjRewards[id][item], '');

  if (readShape(item) == 'square') {
    getEl(`item-box-square-${id}`).append(newItem);
  } else {
    getEl(`item-box-circle-${id}`).append(newItem);
  }

  getEl(itemId).onclick = () => handleItemClick(itemId, id);

}

function updateStep(id, isDemo=false) {
  allStepsLeft[id] -= 1

  if (allStepsLeft[id] > 0) {
    let unitId = id + '-unit-' + (taskConfigsWithId[id]['step'] - allStepsLeft[id]).toString();
    getEl(unitId).style.backgroundColor = 'white';
  } else if (allStepsLeft[id] == 0) {
    let unitId = id + '-unit-' + (taskConfigsWithId[id]['step'] - allStepsLeft[id]).toString();
    getEl(unitId).style.backgroundColor = 'white';
    if (isDemo) {
      getEl('instruction-btn-9').style.opacity = 1;
    } else {
      showNext('intro-btn-group-'+id);
    }
    disableMachine(id)
  } else {
    disableMachine(id)
  }
}

function disableMachine(id) {
  allObjs.forEach(el => {
    let item =id + '-' + el;
    getEl(item).onclick = () => null;
  })

  let newCombos = Object.entries(allRecipes[id]).filter(([_, v]) => v.length > 0);
  let newObjs = newCombos.map(el => el[1]);
  if (newObjs.length > 0) {
    newObjs.forEach(el => {
      let citem = id + '-' + el;
      getEl(citem).onclick = () => null;
    })
  }

  getEl(`extract-btn-${id}`).disabled = true;
  getEl(`fuse-btn-${id}`).disabled = true;

}




/** Give feedback after each task */
function giveFeedback(id) {

  hide(`main-right-${id}`);
  hide(`main-left-${id}`);
  hide(`task-next-btn-${id}`);

  let feedbackTest = createCustomElement('div', 'feedback-text', '');
  feedbackTest.innerHTML = `You gathered <span style="color:red;font-weight:bold;">${allScoreOnDisplay[id]}</span> XPs in this round!`

  getEl(`main-box-${id}`).append(feedbackTest);

  let feedbackNextBtn = createBtn(`feedback-next-btn-${id}`, 'Next', 'intro-button')
  let nextTaskId = '';
  let thisTaskId = 'task-' + id;

  let idNum = parseInt(id.substring(1))
  if (id[0] == 'p') {
    if (idNum < practiceIds.length) {
      nextTaskId = 'task-p' + (idNum+1).toString();
    } else if (idNum==practiceIds.length) {
      nextTaskId = 'preview-task';
    } else {
      nextTaskId = 'task-t1';
    }
  } else {
    if (idNum < testIds.length) {
      if (idNum % taskBlockSize == 0) {
        nextTaskId = 'preview-' + (Math.floor(idNum/taskBlockSize)+1);
      } else {
        nextTaskId = 'task-t' + (idNum+1).toString();
      }
    } else {
      let bonusScores = Object.fromEntries(Object.entries(allScoreOnDisplay).filter(([key]) => key[0]=='t'));
      let totalScore = Math.round(Object.values(bonusScores).reduce((a,b)=>a+b,0));
      let bonus = (cond[0]=='a') ? Math.round(totalScore/2000*100)/100 : Math.round(totalScore/30000*100)/100;
      getEl('score-sum').innerHTML = totalScore;
      getEl('bonus-sum').innerHTML = bonus;
      nextTaskId = 'score-feedback';
      thisTaskId = 'task';
      subjectData['total_score'] = totalScore;
    }
  }

  feedbackNextBtn.onclick = () => hideAndShowNext(thisTaskId, nextTaskId, 'block');
  getEl(`intro-btn-group-${id}`).append(feedbackNextBtn);

}



/* Prepare instruction */
// getEl('intro-demo-0').append(drawTask('intro0', taskConfigsWithId[introId]['color'], taskConfigsWithId[introId]['step'], taskConfigsWithId[introId]['objColor']));




let introId = 'intro1';
let played = 0;
setTimeout(() => { getEl(`instruction-btn-0`).style.opacity = 1;}, 0);

function introBtn00() {
  hideAndShowNext('intro-sub-1-0', 'intro-sub-1-1', 'block');
  hide('intro-btn-group-0');
  setTimeout(() => { getEl(`instruction-btn-1`).style.opacity = 1;}, introBtnDelay);
}



getEl('intro-demo-1').append(drawTask(introId, taskConfigsWithId[introId]['color'], taskConfigsWithId[introId]['step'], taskConfigsWithId[introId]['objColor']));
getEl('hist-box-intro1').style.height = '300px';
allObjs.forEach(el => {
  let item = introId + '-' + el;
  getEl(item).onclick = () => {
    let [introId, shape, label] = item.split('-');
    if (allDisplays[introId].length == 0) {
      let toAdd = drawBlock(shape, label, '', demoObjColor);
      toAdd.onclick = () => handleMachineItemClick('mid-'+shape, introId, true);
      getEl(`dis-item-mid-${introId}`).append(toAdd);

      allDisplays[introId].push(shape+'-'+label);
      getEl(`extract-btn-${introId}`).disabled = false;
      getEl(`instruction-btn-1`).style.opacity = 1
      played += 1;
  }}
});
getEl(`extract-btn-${introId}`).onclick = () => {
  handleExtract(introId, true);
  getEl('instruction-btn-3').style.opacity = 1;
}

function introBtn01() {
  hide('intro-p-1');
  hide('intro-p-2');
  hide('intro-p-3');
  hide('intro-sub-1');
  showNext('intro-sub-1-2', 'block');
}

function introBtn03() {
  hideAndShowNext('intro-sub-1-3', 'intro-sub-1-4', 'block');
  setTimeout(() => { getEl(`instruction-btn-4`).style.opacity = 1;}, introBtnDelay);
}



let introIdFuse = 'intro2';
getEl('intro-demo-2').append(drawTask(introIdFuse, taskConfigsWithId[introIdFuse]['color'], taskConfigsWithId[introIdFuse]['step'], taskConfigsWithId[introIdFuse]['objColor']));
getEl('hist-box-intro2').style.height = '300px';
allObjs.forEach(el => {
  let item = introIdFuse+'-'+el;
  getEl(item).onclick = () => handleItemClick(item, introIdFuse, true);
});
getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, true, true);

function introBtn05() {
  hide('intro-sub-2-1');
  hide('intro-btn-group-5');
  showNext('intro-sub-2-2', 'block');
  setTimeout(() => { getEl(`instruction-btn-6`).style.opacity = 1;}, introBtnDelay);
  getEl('intro-demo-2').style.display = 'none';
}


function introBtn06() {
  hideAndShowNext('intro-sub-2-2', 'intro-sub-2-5', 'block');
  setTimeout(() => { getEl(`instruction-btn-10`).style.opacity = 1;}, introBtnDelay);

  for (let i = 1; i < 11; i++) {
    let unitColor = (i < 9)? 'white' : machineColor;
    getEl(introIdFuse+'-unit-'+i.toString()).style.backgroundColor = unitColor;
  }

  allStepsLeft[introIdFuse] = 2;

  getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, false, true);
  getEl(`extract-btn-${introIdFuse}`).onclick = () => handleExtract(introIdFuse, true);
  baseObj.forEach(el => {
    let item =introIdFuse + '-' + el;
    getEl(item).onclick = () => handleItemClick(item, introIdFuse, false)});

}
function introBtn07() {
  hideAndShowNext('intro-sub-2-3', 'intro-sub-2-4', 'block');
  setTimeout(() => { getEl(`instruction-btn-8`).style.opacity = 1;}, introBtnDelay);

  // for (let i = 1; i < 11; i++) {
  //   let unitColor = (i < 9)? 'white' : machineColor;
  //   getEl(introIdFuse+'-unit-'+i.toString()).style.backgroundColor = unitColor;
  // }

  // allStepsLeft[introIdFuse] = 2;

  // getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, false, true);
  // getEl(`extract-btn-${introIdFuse}`).onclick = () => handleExtract(introIdFuse, true);
  // baseObj.forEach(el => {
  //   let item =introIdFuse + '-' + el;
  //   getEl(item).onclick = () => handleItemClick(item, introIdFuse, false)});

}
function introBtn08() {
  hideAndShowNext('intro-sub-2-4', 'intro-sub-2-5', 'block');
  for (let i = 1; i < 11; i++) {
    let unitColor = (i < 9)? 'white' : machineColor;
    getEl(introIdFuse+'-unit-'+i.toString()).style.backgroundColor = unitColor;
  }

  allStepsLeft[introIdFuse] = 2;

  getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, false, true);
  getEl(`extract-btn-${introIdFuse}`).onclick = () => handleExtract(introIdFuse, true);
  baseObj.forEach(el => {
    let item =introIdFuse + '-' + el;
    getEl(item).onclick = () => handleItemClick(item, introIdFuse, false)});

  // setTimeout(() => { getEl(`instruction-btn-9`).style.opacity = 1;}, introBtnDelay);
}



/* Draw items for demo reward structure */
getEl('instruct-rate').innerHTML = rewardInc,

getEl('demo-xp-a1').append(drawBlock('square', 'a', 'demo-xp-item1', demoObjColor, baseReward))
getEl('demo-xp-b1').append(drawBlock('square', 'b', 'demo-xp-item2', demoObjColor, baseReward))
getEl('demo-xp-ab1').append(drawBlock('square', '[ab]', 'demo-xp-item3', demoObjColor, Math.round(baseReward*rewardInc), 'demo'))
getEl('demo-calc-1').innerHTML = showCalc(rewardInc, baseReward)

getEl('demo-xp-b2').append(drawBlock('circle', 'b', 'demo-xp-item4', demoObjColor, baseReward))
getEl('demo-xp-ab2').append(drawBlock('circle', '[ab]', 'demo-xp-item5', demoObjColor, Math.round(baseReward*rewardInc)))
getEl('demo-xp-abb1').append(drawBlock('circle', '[[ab]b]', 'demo-xp-item6', demoObjColor, Math.round(Math.pow(rewardInc,2)*baseReward), 'demo'))
getEl('demo-calc-3').innerHTML = showCalc(rewardInc, Math.round(baseReward*rewardInc))

// getEl('demo-xp-ab3').append(drawBlock('circle', '[ab]', 'demo-xp-item7', demoObjColor, Math.round(rewardInc*baseReward)))
// getEl('demo-xp-ab4').append(drawBlock('circle', '[ab]', 'demo-xp-item8', demoObjColor, Math.round(rewardInc*baseReward)))
// getEl('demo-xp-abab1').append(drawBlock('circle', '[[ab][ab]]', 'demo-xp-item9', demoObjColor, Math.round(Math.pow(rewardInc,2)*baseReward), 'demo'))
// getEl('demo-calc-2').innerHTML = showCalc(rewardInc, Math.round(baseReward*rewardInc))


getEl('demo-xp-a2').append(drawBlock('circle', 'e', 'demo-xp-item10', demoObjColor, baseReward))
getEl('demo-xp-abc1').append(drawBlock('square', '[[ab]c]', 'demo-xp-item11', demoObjColor, Math.round(Math.pow(rewardInc,2)*baseReward)))
getEl('demo-xp-aabc1').append(drawBlock('square', '[e[[ab]c]]', 'demo-xp-item12', demoObjColor, Math.round(baseReward*Math.pow(rewardInc,3)), 'demo'))
getEl('demo-calc-4').innerHTML =  showCalc(rewardInc, Math.round(baseReward*Math.pow(rewardInc,2)))

function showCalc(val1, val2) {
  return `&nbsp; <span style="color:black"><b>${val1}</b></span> &#215; ${val2}p &nbsp;`
}

// getEl('sum-rec').innerHTML = rewardInc;
getEl('intro-p-info-square').innerHTML = (assignedKnowledge=='expert')? `This works ${probs[assignedProbCond]['psquare']*10} out of 10 times.` : '';
getEl('intro-p-info-circle').innerHTML = (assignedKnowledge=='expert')? `This works ${probs[assignedProbCond]['pcircle']*10} out of 10 times.` : '';
getEl('intro-p-info-cross').innerHTML = (assignedKnowledge=='expert')? `This works ${probs[assignedProbCond]['pcross']*10} out of 10 times.` : '';



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

  subjectData['intruction'] += 1;

  hide("retry");
  hide("quiz");
  showNext("instruction", "block");
  hideAndShowNext('instruction-3', 'instruction-1', 'block');
  hideAndShowNext('intro-sub-1-4', 'intro-sub-1-1', 'block');
  showNext('intro-p-1', 'block');
  showNext('intro-p-2', 'block');
  showNext('intro-p-3', 'block');
  showNext('intro-sub-1');
  hideAndShowNext('intro-sub-2-5', 'intro-sub-2-1', 'block');
  getEl('check-btn').style.display = 'flex';

  // // hide buttons
  // for (let i = 0; i < 10; i++) {
  //   if (i % 4 != 0) {
  //     getEl(`instruction-btn-`+i.toString()).style.opacity = 0;
  //   }
  // }
  // getEl('instruction-btn-1').style.opacity = 1;


  // draw new demo machine
  getEl('intro-demo-2').innerHTML = '';
  getEl('intro-demo-2').append(drawTask(introIdFuse, taskConfigsWithId[introIdFuse]['color'], taskConfigsWithId[introIdFuse]['step'], taskConfigsWithId[introIdFuse]['objColor']));
  getEl('hist-box-intro2').style.height = '300px';
  baseObj.forEach(el => {
    let item =introIdFuse + '-' + el;
    getEl(item).onclick = () => handleItemClick(item, introIdFuse, true)});
  getEl(`fuse-btn-${introIdFuse}`).onclick = () => handleFuse(introIdFuse, true, true);
  initData(introIdFuse);
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
  clientData.subject.start_time = start_task_time;
  clientData.subject.token = token;

  clientData.trial = trialData;

  // Transit
  hideAndShowNext("debrief", "completed", 'block');
  getEl('completion-code').append(document.createTextNode(complete_code));

  if (isDev) {
    console.log(clientData);
    // download(JSON.stringify(clientData), 'data.txt', '"text/csv"');

  } else {
    save_data(prep_data_for_server(clientData));
  }


}

function prep_data_for_server(data) {
  retObj = {};
  retObj['worker'] = data.subject.prolific_id;
  retObj['assignment'] = cond;
  retObj['hit'] = 'discovery';
  retObj['version'] = '0.1';
  retObj['total'] = data.subject.total_score;
  retObj['subject'] = JSON.stringify(data.subject);
  retObj['trial'] = JSON.stringify(data.trial);

  return retObj;
}

function save_data(data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '../php/save_data.php');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if(xhr.status == 200){
      console.log(xhr.responseText);
      // var response = JSON.parse(xhr.responseText);
      // console.log(response.success);
    }
  };
  xhr.send('['+JSON.stringify(data)+']');
}
