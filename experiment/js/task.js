
/* Data */
let start_task_time = 0;
let subjectData = {};

let currentDisplays = [];
let scoreHistory = [];


/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}



/* Create task */
baseObj.forEach(obj => {
  let item = drawBlock(obj, objFeats[obj], obj);
  item.onclick = () => handleItemClick(obj);
  getEl('item-box-holder').append(item);
});


/** Interactivities */
function handleItemClick(id) {
  (currentDisplays.length < 1 ) ? getEl('item-result').innerHTML = '' : null;

  let itemA = getEl('item-1');
  let itemB = getEl('item-2');

  if (currentDisplays.length == 0) {
    itemA.append(drawBlock(id, objFeats[id], 'item-1-'+id, getItemSize(id)));
    currentDisplays.push(id);

  } else if (currentDisplays.length == 1) {

    if (currentDisplays[0]!='*' || id!='*') {
      itemB.append(drawBlock(id, objFeats[id], 'item-1-'+id, getItemSize(id)));
      currentDisplays.push(id);
      getEl('combine-btn').disabled = false;
    }
    if (currentDisplays[0] == '*' && id == '*') {
      itemA.innerHTML = '';
      currentDisplays = [];
    }

  } else {

    let itemIndex = currentDisplays.indexOf(id)

    if ( itemIndex == 0) {
      let itemToKeep = currentDisplays[1];
      itemA.innerHTML = '';
      itemB.innerHTML = '';
      itemA.append(drawBlock(itemToKeep, objFeats[itemToKeep], 'item-1-'+itemToKeep, getItemSize(itemToKeep)));
      currentDisplays = [itemToKeep];
      getEl('combine-btn').disabled = true;

    } else if (itemIndex == 1) {
      itemB.innerHTML = '';
      currentDisplays = [ currentDisplays[0] ];
      getEl('combine-btn').disabled = true;
    }

  }
  // console.log(currentDisplays);

}
function handleCombine() {

  currentItems = currentDisplays.sort();

  // Update display box
  getEl('combine-btn').disabled = true;
  getEl('item-1').innerHTML = '';
  getEl('item-2').innerHTML = '';

  // Check machine mode
  let is_cashing = (currentItems.indexOf('*') > -1);

  // Check combo existence
  let thisCombo = is_cashing? currentItems[1] : '[' + currentItems.join('') + ']';
  let isNovel = false;
  if (Object.keys(combos).indexOf(thisCombo) > -1) {
    isNovel = (Object.keys(combos).indexOf(thisCombo) > -1)? false: true;
  } else {
    isNovel = true;
  }

  // Check if a novel combo should happen
  let willCombine = 0;
  if (!isNovel) {
    willCombine = combos[thisCombo] > 0 ? 1 : 0;
  } else {
    // Row a dice
    willCombine = (Math.random() < baseRate)? 1 : 0;
  }

  // Decide feedback
  let rewardGained = 0;
  if (is_cashing) {
    rewardGained = combos[thisCombo];
  } else {
    // no immediate reward

    if (willCombine) {
      // Prep new combo object
      objFeats[thisCombo] = objFeats[currentItems[0]];
      combos[thisCombo] = Math.round(Math.max(combos[currentItems[0]], combos[currentItems[1]]) * rewardInc);

    } else {
      combos[thisCombo] = 0;
    }
  }

  // Show results
  if (is_cashing) {
    getEl('item-result').innerHTML = `+ ${rewardGained} xp!`;
    scoreOnDisplay += rewardGained;
  } else {
    if (willCombine) {
      getEl('item-result').append(drawBlock(thisCombo, objFeats[thisCombo], '', getItemSize(thisCombo)));
    } else {
      getEl('item-result').innerHTML = 'Nothing happens';
    }
  }
  getEl('item-result').onclick = () => getEl('item-result').innerHTML = '';

  // Update history panel
  (isNovel && ! willCombine)? addToHistoryPanel(currentItems[0], currentItems[1]) : null;

  // Update item inventory
  (isNovel && willCombine) ? addToInventory(thisCombo) : null;

  // Update score
  getEl('score-text').innerHTML = scoreOnDisplay;
  scoreHistory.push(scoreOnDisplay);

  // Update chance

  // Reset
  currentDisplays = [];
}
function getItemSize(label) {
  let n = removeBrackets(label).split('').length;
  return (n < 2)? 'base' : n;
}
function addToInventory(item) {
  let itemToShow = drawBlock(item, objFeats[item], item, getItemSize(item));
  itemToShow.onclick = () => handleItemClick(item);
  getEl('item-box-holder').append(itemToShow);
}
function addToHistoryPanel(itemA, itemB) {
  let hInfo = createCustomElement('div', 'hist-cell', '');
  hInfo.append(drawBlock(itemA, objFeats[itemA], '', getItemSize(itemA)));
  hInfo.append('+');
  hInfo.append(drawBlock(itemB, objFeats[itemB], '', getItemSize(itemB)));

  getEl('hist-box').append(hInfo);
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
