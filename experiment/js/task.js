
/* Data */
let start_task_time = 0;
let subjectData = {};


/* Assign task items */
const N_TASK = 20;
const ALL_ITEMS = [
  'soil', 'rabbit-caught', 'berry-harvest', 'stone', 'rabbit', 'bow', 'rabbit-housed',
  'water', 'branch', 'seedling', 'mushroom', 'steel', 'arrow', 'berry', 'sheep',
];
const ALL_CELL_IDS = getAllCellIds();

let [ clickData, clickDataKeys ] =[ {}, [] ];
let [ task_items, task_cells, task_cell_item] = [ {}, {}, {} ];

for (let i = 0; i < N_TASK; i++) {
  let task_size = randFromRange(2, 9);
  task_items[`task_${i+1}`] = sampleFromList(ALL_ITEMS, n=task_size); // sample items
  task_cells[`task_${i+1}`] = sampleFromList(ALL_CELL_IDS, n=task_size, replace=false); // sample cell-ids

  let fullCellIds = task_cells[`task_${i+1}`].map(el => `task${i+1}-grid-${el}`); // get full-name cell-ids
  fullCellIds.forEach((el, idx) => task_cell_item[el] = task_items[`task_${i+1}`][idx]); // append items

  clickDataKeys = clickDataKeys.concat(fullCellIds);
}
clickDataKeys.forEach(el => clickData[el] = 0);





/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}


/* Create task div */
for (let tid = 1; tid <= N_TASK; tid++) {

  let taskDiv = createCustomElement('div', '', `task-${tid}`);

  // Progress bar
  let progressDiv = createCustomElement('div', 'progress-div', `progress-div-${tid}`);
  progressDiv.innerHTML = `<label for="progress-bar">Progress:</label><progress id="progress-bar-${tid}" value="${(tid+1)/(N_TASK+1)*100}" max="100"></progress>`

  // Main task box
  let mainBoxDiv = createCustomElement('div', 'main-box', `main-box-${tid}`);
  let itemsBox= createCustomElement('div', 'items-box', `items-box-${tid}`);
  let itemsTab = createCustomElement('table', 'worktop-table', id=`items-tab-${tid}`);

  // Draw grid
  for (let i = 0; i < NROW; i++) {
    let wtrows = itemsTab.insertRow();
    for (let j = 0; j < NCOL; j++) {
      let tcell = wtrows.insertCell();

      let tcellId = `task${tid}-grid-` + (j+1).toString() + '-' + (NROW-i).toString();
      tcell.id = tcellId;

      //tcell.style.border = 'red solid 1px';
      tcell.style.width = '40px';

      if (Object.keys(task_cell_item).indexOf(tcellId) > -1 ) {
        tcell.innerHTML = drawItem(task_cell_item[tcellId]);
        tcell.onclick = () => cellClick(tcellId);
      }

    }
  }
  itemsBox.append(itemsTab);
  mainBoxDiv.append(itemsBox);

  // Task button
  let buttonDiv = createCustomElement('div', 'button-group-vc', '');
  let taskBtn = createBtn(`task-confirm-${tid}`, 'Confirm', true, 'big-button');
  taskBtn.onclick = () => task_next(tid);
  buttonDiv.append(taskBtn)

  // Assemble
  taskDiv.append(progressDiv);
  taskDiv.append(mainBoxDiv);
  taskDiv.append(buttonDiv);

  getEl('task').append(taskDiv);
  taskDiv.style.display = (tid==1)? 'block': 'none';

}
function task_next(id) {
  if (id < N_TASK) {
    hideAndShowNext(`task-${id}`, `task-${id+1}`, "block");
  } else {
    hideAndShowNext("task", "debrief", "block");
  }
}
function cellClick (cell_id) {
  clickData[cell_id] += 1;
  if (clickData[cell_id] % 2 == 1) {
    getEl(cell_id).style.border = 'solid red 2px';
  } else {
    getEl(cell_id).style.border = '0px';
  }
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
  showNext("task", "block");
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
