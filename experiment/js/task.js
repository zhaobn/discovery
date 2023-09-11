
/* Data */
let start_task_time = 0;
let subjectData = {};


/* Assign task items */
const CONDITION = 0.6; //

const ALL_ITEMS = [ 'tria', 'star', 'circ'];
const CONFIGS = {
  'tria': { 'prob': 0, 'cost': 0, 'reward': 0 },
  'star': { 'prob': CONDITION, 'cost': 10, 'reward': 50 },
  'circ': { 'prob': 0.2, 'cost': 10, 'reward': 200 },
}

const TASK_COUNT = [ 5, 5 ];
const N_TASK = TASK_COUNT.reduce((partialSum, a) => partialSum + a, 0);

let [ clickData, clickDataKeys ] =[ {}, [] ];
let [ task_items, task_cells, task_cell_item ] = [ {}, {}, {} ];
let task_scores = [ 0, 0 ];

for (let i = 0; i < N_TASK; i++) {
  let task_size = 0; //randFromRange(2, 9);

  if (i < TASK_COUNT[0]) {
    task_size = 6;
    task_items[`task_${i+1}`] = [ 'tria', 'tria', 'tria', 'star', 'star', 'star' ]; //sampleFromList(ALL_ITEMS, n=task_size); // sample items
  } else {
    task_size = 9;
    task_items[`task_${i+1}`] = [ 'tria', 'tria', 'tria', 'star', 'star', 'star', 'circ', 'circ', 'circ' ];
  }

  let all_cell_ids = getAllCellIds();
  task_cells[`task_${i+1}`] = sampleFromList(all_cell_ids, n=task_size, replace=0); // sample cell-ids

  let fullCellIds = task_cells[`task_${i+1}`].map(el => `task${i+1}-grid-${el}`); // get full-name cell-ids
  fullCellIds.forEach((el, idx) => task_cell_item[el] = task_items[`task_${i+1}`][idx]); // append items

  clickDataKeys = clickDataKeys.concat(fullCellIds);

  task_scores.push(0)
}
clickDataKeys.forEach(el => clickData[el] = 0);


/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}





let tabDiv = getEl('demo-tab');
// Draw grid
for (let i = 0; i < 200; i++) {
  let wtrows = tabDiv.insertRow();
  for (let j = 0; j < 400; j++) {
    let tcell = wtrows.insertCell();

    let tcellId = `demo` + (j+1).toString() + '-' + (NROW-i).toString();
    tcell.id = tcellId;
    tcell.style.height = '45px';
    tcell.style.width = '45px';
    tcell.style.textAlign = 'center';
    tcell.style.verticalAlign = 'middle';
    // tcell.style.border = 'red solid 1px';

    if (Math.random() > 0.7) {
      let letter = sampleFromList(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'], 1, 1);
      let color = sampleFromList(['red', 'green', 'purple', 'blue', 'black', 'gray', 'pink'], 1, 1);
      tcell.append(drawBlock(letter, color));
    }
  }
}



// /* Create task div */
// for (let tid = 1; tid <= N_TASK; tid++) {

//   let taskDiv = createCustomElement('div', '', `task-${tid}`);

//   // Main task box
//   let mainBoxDiv = createCustomElement('div', 'main-box', `main-box-${tid}`);

//   let itemsBox= createCustomElement('div', 'items-box', `items-box-${tid}`);
//   let itemsTab = createCustomElement('table', 'worktop-table', id=`items-tab-${tid}`);

//   // Draw grid
//   for (let i = 0; i < NROW; i++) {
//     let wtrows = itemsTab.insertRow();
//     for (let j = 0; j < NCOL; j++) {
//       let tcell = wtrows.insertCell();

//       let tcellId = `task${tid}-grid-` + (j+1).toString() + '-' + (NROW-i).toString();
//       tcell.id = tcellId;

//       //tcell.style.border = 'red solid 1px';
//       tcell.style.height = '60px';
//       tcell.style.width = '60px';
//       tcell.style.textAlign = 'center';
//       tcell.style.verticalAlign = 'middle';

//       if (Object.keys(task_cell_item).indexOf(tcellId) > -1 ) {
//         //tcell.innerHTML = drawItem(task_cell_item[tcellId]);
//         if (task_cell_item[tcellId] == 'circ') {
//           tcell.append(drawCircle('brown'));
//         } else if (task_cell_item[tcellId] == 'tria') {
//           tcell.append(drawTriangle());
//         } else if (task_cell_item[tcellId] == 'star') {
//           tcell.append(drawStar('yellow'));
//         }
//         tcell.onclick = () => cellClick(tcellId, tid);
//       }

//     }
//   }
//   itemsBox.append(itemsTab);
//   mainBoxDiv.append(itemsBox);

//   // Task button
//   let buttonDiv = createCustomElement('div', 'button-group-vc', '');
//   let taskBtn = createBtn(`task-confirm-${tid}`, 'Combine!', false, 'big-button');
//   let taskNextBtn = createBtn(`task-next-${tid}`, 'Next', true, 'big-button');
//   let taskFillerBtn = createBtn(`task-noshow-${tid}`, '', true, 'big-button');
//   taskFillerBtn.style.opacity = 0;
//   buttonDiv.append(taskFillerBtn);
//   buttonDiv.append(taskBtn);
//   buttonDiv.append(taskNextBtn);
//   taskBtn.onclick = () => {
//     let selectedItems = readTaskData(clickData, 'task'+tid, task_cell_item );
//     let feedback = getTaskFeedbackChunk(selectedItems[0], CONFIGS);

//     feedbackBox.innerHTML = showFeedback(feedback);
//     (tid <= TASK_COUNT[0]) ? task_scores[0] += feedback : task_scores[1] += feedback;
//     scoreBox.innerHTML = (tid <= TASK_COUNT[0]) ? showScoreText(task_scores[0]) : showScoreText(task_scores[1]);
//     (tid < N_TASK) ? getEl(`score-box-${tid+1}`).innerHTML = scoreBox.innerHTML: null;
//     (tid == TASK_COUNT[0]) ? getEl(`score-box-${tid+1}`).innerHTML = showScoreText(task_scores[1]): null;

//     if (feedback > 0) {
//       showNewItem(readTaskData(clickData, 'task'+tid, task_cell_item, 'id'), selectedItems[0])
//     }

//     taskBtn.disabled = true;
//     taskNextBtn.disabled = false;
//     disableCellSelection(tid);
//   }
//   taskNextBtn.onclick = () => task_next(tid);

//   // Assemble
//   taskDiv.append(mainBoxDiv);
//   taskDiv.append(buttonDiv);

//   if (tid <= TASK_COUNT[0]) {
//     getEl('task-phase1').append(taskDiv);
//   } else {
//     getEl('task-phase2').append(taskDiv);
//   }

//   taskDiv.style.display = (tid==1)? 'block': 'none';

// }
function task_next(id) {
  if (id == TASK_COUNT[0]) {
    hideAndShowNext(`task-${id}`, `instruction-mid`, "block");
  } else if (id == N_TASK) {
    hideAndShowNext("task-phase2", "debrief", "block");
  } else {
    hideAndShowNext(`task-${id}`, `task-${id+1}`, "block");
  }
}
function cellClick (cell_id, taskId) {
  clickData[cell_id] += 1;
  checkSelection(taskId);

  if (clickData[cell_id] % 2 == 1) {
    getEl(cell_id).style.border = 'solid red 2px';
  } else {
    getEl(cell_id).style.border = '0px';
  }
}
function checkSelection (taskId) {
  let selected = readTaskData(clickData, 'task'+taskId, task_cell_item)
  if (selected.length == 2) {
    if (selected[0] == selected[1]) {
      getEl(`task-confirm-${taskId}`).disabled = false
    }
  }
}
function disableCellSelection(tid) {
  for (let i = 0; i < NROW; i++) {
    for (let j = 0; j < NCOL; j++) {
      getEl(`task${tid}-grid-` + (j+1).toString() + '-' + (NROW-i).toString()).onclick = () => {};
    }
  }
}
function startPhase2 () {
  hide('task-phase1');
  hide('instruction-mid');
  showNext(`task-${TASK_COUNT[0]+1}`, 'block')
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
