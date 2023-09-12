
/* Data */
let start_task_time = 0;
let subjectData = {};

let states = {};
let testData = [];
let currentDisplays = [];
let scoreHistory = [];
let disData = {};

const [ NROW, NCOL ] = [10, 15];

/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}



/* Create task */
let tabDiv = getEl('demo-tab');
// Draw grid
for (let i = 0; i < NROW; i++) {
  let wtrows = tabDiv.insertRow();
  for (let j = 0; j < NCOL; j++) {
    let tcell = wtrows.insertCell();

    let cellId = (j+1).toString() + '-' + (i+1).toString();
    tcell.id = 'cell-' + cellId;
    // tcell.style.height = '45px';
    // tcell.style.width = '45px';
    tcell.style.textAlign = 'center';
    tcell.style.verticalAlign = 'middle';
    //tcell.style.border = 'red solid 1px';

    if (Math.random() > 0.8) {
      let letter = sampleFromList(baseObj, 1, 1);
      let color = objFeats[letter];
      let posId = `pos-${cellId}-${letter}`

      let item = drawBlock(letter, color, posId);
      item.onclick = () => handleItemClick(item.id);
      tcell.append(item);

      states[posId] = 0;
    }
  }
}


function handleItemClick (id) {

  // record click data
  if (currentDisplays.length == 2 && currentDisplays.indexOf(id) < 0) {
    null;
  } else {
    states[id] += 1;
    [_ , row, col, label] = id.split('-');
  }


  // Update display box
  if (currentDisplays.length < 1) {

    if (states[id] % 2 == 1) {

      getEl(id).style.border = `solid gold 7px`;
      currentDisplays.push(id)
      getEl(`selection-1`).append(drawBlock(label, objFeats[label], `display-item-1`, getItemSize(label)));

    }
  } else if (currentDisplays.length == 1) {

    if (states[id] % 2 == 1) {

      getEl(id).style.border = `solid gold 7px`;
      currentDisplays.push(id)
      getEl(`selection-2`).append(drawBlock(label, objFeats[label], `display-item-2`, getItemSize(label)));
      getEl('combine-btn').disabled = false;


    } else {

      getEl(id).style.border = `solid black 1px`;
      let posId = currentDisplays.indexOf(id);
      currentDisplays.splice(posId, 1);
      getEl(`selection-1`).innerHTML = ''

    }
  } else if (currentDisplays.length == 2) {

    if (states[id] % 2 == 0) {

      let posId = currentDisplays.indexOf(id);
      if (posId > -1) {
        getEl(id).style.border = `solid black 1px`;

        currentDisplays.splice(posId, 1);
        let leftItem = currentDisplays[0];
        let leftItemLabel = leftItem.split('-')[3];

        getEl(`selection-1`).innerHTML = '';
        getEl(`selection-1`).append(drawBlock(leftItemLabel, objFeats[leftItemLabel], `display-item-1`, getItemSize(leftItemLabel)));
        getEl(`selection-2`).innerHTML = '';
        getEl('combine-btn').disabled = true;

      }
    }

  }

  //console.log(currentDisplays)

}

function getItemSize(label) {
  let n = removeBrackets(label).split('').length;
  return (n < 2)? 'base' : n;
}
function handleCombine() {

  if (currentDisplays.length == 2) {
    let clickData = {
      'currentChance': chanceLeft,
      'currentScore': scoreOnDisplay,
      'combo': '',
      'preexisit': 0,
      'success': 0,
      'reward': 0,

    }

    let items = [ currentDisplays[0].split('-')[3], currentDisplays[1].split('-')[3] ].sort();
    clickData['combo'] = items.join(',');

    let newItem = '[' + items[0] + items[1] + ']';
    let [ prefix , i, j, label] =  currentDisplays[0].split('-');
    let [ _ , i2, j2, __ ] =  currentDisplays[1].split('-');
    let newItemId = [ prefix , i, j, newItem].join('-');

    // Check conditions
    let isDisFound = 0;
    let willCombine = 0;
    if (Object.keys(disData).length > 0) {
      let findCombo = Object.keys(disData).indexOf(newItem);
      if (findCombo > -1) {
        isDisFound = 1
      }
    }
    if (isDisFound){
      willCombine = disData[newItem];
    }
    let getNew = Math.random() < baseRate;


    // Do things
    if ((isDisFound && willCombine) || (!isDisFound && getNew)) {

      // Create new object
      let newItemColor = (isDisFound && willCombine)? objFeats[newItem] : objFeats[label];
      let newCellObj = drawBlock(newItem, newItemColor, newItemId, getItemSize(newItem));
      newCellObj.onclick = () => handleItemClick(newItemId);
      objFeats[newItem] = newItemColor;
      states[newItemId] = 0;

      // Show result
      getEl('result-holder').innerHTML = (!isDisFound && getNew)? 'New item found!' : 'Replication success';

      getEl(['cell', i, j].join('-')).innerHTML = '';
      // getEl(['cell', i, j].join('-')).style.width = (45+(getItemSize(newItem)-2)*15).toString() + 'px';
      getEl(['cell', i, j].join('-')).append(newCellObj);

      getEl(['cell', i2, j2].join('-')).innerHTML = '';
      getEl(`selection-1`).innerHTML = '';
      getEl(`selection-2`).innerHTML = ''

    } else {

      getEl(currentDisplays[0]).style.border = 'solid black 1px';
      getEl(currentDisplays[1]).style.border = 'solid black 1px';
      getEl('result-holder').innerHTML = 'Nothing happens';

    }

    // Update selection states
    states[currentDisplays[0]] -= 1;
    states[currentDisplays[1]] -= 1;


    // Update transition tree and data
    if (!isDisFound) {
      clickData['preexisit'] = 0;

      if (getNew) {
        disData[newItem] = 1;
        clickData['success'] = 1;

      } else {
        disData[newItem] = 0;
        clickData['success'] = 0;

      }
    } else {

      if (willCombine) {
        clickData['success'] = 1;

      } else {
        clickData['success'] = 0;
      }

    }

    // Compute rewards
    if (clickData['success'] == 1) {
      if (clickData['preexisit']) {
        reward = objRewards[newItem];

      } else {
        let [sub_r1, sub_r2] = [objRewards[items[0]], objRewards[items[1]]];
        reward = Math.round(Math.max(sub_r1, sub_r2) * rewardInc);
        objRewards[newItem] = reward;
      }

      scoreOnDisplay += reward;
      clickData['reward'] = reward;

    }

    // Update displaying values
    chanceLeft = chanceLeft * discount;
    getEl('chance-bar-val').style.height = chanceTobar(chanceLeft);
    getEl('score-int').innerHTML = scoreOnDisplay;

    getEl('combine-btn').disabled = true;
    getEl('combine-next-btn').disabled = false;

    // Store data
    scoreHistory.push(scoreOnDisplay);
    testData.push(clickData);
    console.log(testData)

  }
}


function handleNextSelection() {
  getEl('result-holder').innerHTML = '';
  getEl('selection-1').innerHTML = '';
  getEl('selection-2').innerHTML = '';

  currentDisplays = [];
  getEl('combine-next-btn').disabled = true;

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
