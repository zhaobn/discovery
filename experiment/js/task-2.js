
/* Data */
let start_task_time = 0;
let subjectData = {};

let currentDisplays = [];
let scoreHistory = [];
let stepsLeft = steps;

let nullFeedback = 'Nothing came out';


/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}



/* Create task */
baseObj.forEach(el => {
  let item = drawBlock(el, el);
  item.onclick = () => handleItemClick(el);
  getEl('item-box-1').append(item);
})
showScore('score-1', scoreOnDisplay);

// for (let i = 0; i < steps; i++) {
//   let stepBar = createCustomElement('div', 'status-bar', `status-bar-${i}`);
//   stepBar.style.width = Math.round(320/steps).toString() + 'px';
//   getEl('machine-status-1').append(stepBar);
// }




/** Interactivities */
let machineBtn = getEl('machine-btn-1');
function handleItemClick(item) {

  if (currentDisplays.length == 0) {
    let toAdd = drawBlock(item);
    toAdd.onclick = () => handleMachineItemClick('mid');
    getEl('i-mid').append(toAdd);

    currentDisplays.push(item);
    machineBtn.disabled = false;

  } else if (currentDisplays.length == 1) {
    getEl('i-mid').innerHTML = '';

    let toAddLeft = drawBlock(currentDisplays[0]);
    toAddLeft.onclick = () => handleMachineItemClick('left');
    getEl('i-left').append(toAddLeft);

    let toAddRight = drawBlock(item);
    toAddRight.onclick = () => handleMachineItemClick('right');
    getEl('i-right').append(toAddRight);

    currentDisplays.push(item);
    machineBtn.disabled = false;

  }

}
function handleMachineItemClick(pos) {
  if (pos == 'left' || pos == 'right') {
    getEl('i-right').innerHTML = '';
    getEl('i-left').innerHTML = '';

    let leftItem = (pos == 'left')? currentDisplays[1]: ( (pos == 'right')? currentDisplays[0]: null );

    let toAdd = drawBlock(leftItem);
    toAdd.onclick = () => handleMachineItemClick('mid');
    getEl('i-mid').append(toAdd);

    currentDisplays = [leftItem];

  } else if (pos == 'mid') {
    getEl('i-mid').innerHTML = '';
    currentDisplays = [];
    machineBtn.disabled = true;
  }

}
function showScore(id, score) {return getEl(id).innerHTML = score };
function handleMachineBtn() {

  machineBtn.disabled = true;
  // stepsLeft -= 1;
  // getEl(`status-bar-${stepsLeft}`).style.backgroundColor = 'white';

  let currentItems = currentDisplays.sort();

  if (currentItems.length == 1) {

    // Update reward
    let reward = objRewards[currentItems[0]];
    scoreOnDisplay +=  reward;
    showScore('score-1', scoreOnDisplay);
    scoreHistory.push(scoreOnDisplay);

    // Give feedback
    getEl('i-mid').innerHTML = '';
    getEl('machine-status-1').innerHTML = '+' + reward + ' xp!';
    setTimeout(() => { getEl('machine-status-1').innerHTML = '';}, feedbacRemain);

  } else if (currentItems.length == 2) {

    let thisCombo = '[' + currentItems.join('') + ']';
    if (Object.keys(combos).indexOf(thisCombo) > -1) {

      getEl('i-right').innerHTML = '';
      getEl('i-left').innerHTML = '';
      getEl('i-mid').innerHTML = '';

      if (combos[thisCombo] == 1) {
        getEl('machine-status-1').append(drawBlock(thisCombo));
      } else {
        getEl('machine-status-1').innerHTML = nullFeedback;
      }

      setTimeout(() => { etEl('machine-status-1').innerHTML = ''; }, feedbacRemain);

    } else {

      if ((Math.random() < baseRate)) {

        // Make new combo
        let reward = Math.round(Math.max(objRewards[currentItems[0]], objRewards[currentItems[1]]) * rewardInc);
        combos[thisCombo] = 1;
        objRewards[thisCombo] = reward;
        objFeats[thisCombo] = objFeats[currentItems[0]];

        // Show results
        getEl('i-right').innerHTML = '';
        getEl('i-left').innerHTML = '';
        getEl('i-mid').innerHTML = '';
        getEl('machine-status-1').append(drawBlock(thisCombo));
        setTimeout(() => { getEl('machine-status-1').innerHTML = '';}, feedbacRemain);

        // Update inventory
        addToInventory(thisCombo);

      } else {

        // Record failure
        combos[thisCombo] = 0;
        getEl('i-right').innerHTML = '';
        getEl('i-left').innerHTML = '';
        getEl('machine-status-1').innerHTML = nullFeedback;
        setTimeout(() => { getEl('machine-status-1').innerHTML = ''; }, feedbacRemain);

        // Update history panel
        addToHistoryPanel(currentItems[0], currentItems[1])

      }

    }

  }

  // Reset
  currentDisplays = [];

}
function addToInventory(item) {
  let newItem = drawBlock(item, item);
  newItem.onclick = () => handleItemClick(item);
  getEl('item-box-1').append(newItem);

}
function addToHistoryPanel(item1, item2) {
  let histInfo = createCustomElement('div', 'hist-cell', '');
  histInfo.append(drawBlock(item1, '', 'small'));
  histInfo.append('+');
  histInfo.append(drawBlock(item2, '', 'small'));

  getEl('hist-box-1').append(histInfo);
  getEl('hist-box-1').scrollTop = getEl('hist-box-1').scrollHeight;
}



/* Comprehension quiz */
const checks = [ 'check1', 'check2', 'check3', 'check4', 'check5' ];
const answers = [ false, false, true, false, true ];

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
  showNext("task-1", "block");
}
function handle_retry() {
  hide("retry");
  hide("quiz");
  showNext("instruction", "block");
  getEl('check-btn').style.display = 'flex';
}
getEl('prequiz').onchange = () => compIsFilled() ? getEl('check-btn').disabled = false : null;



/* Bebrief */
getEl('postquiz').onchange = () => isFilled('postquiz')? getEl('done-btn').disabled = false: null;

function is_done(complete_code) {
  let inputs = getEl('postquiz').elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);

  // Clean up free responses
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

  // Transit
  hideAndShowNext("debrief", "completed", 'block');
  getEl('completion-code').append(document.createTextNode(complete_code));

  // download(JSON.stringify(clientData), 'data.txt', '"text/csv"');
  console.log(clientData);
}
