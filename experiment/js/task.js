
/* Data */
let start_task_time = 0;
let subjectData = {};

let states = {};
let testData = [];
let currentDisplays = [];
let scoreHistory = [];
let disData = {};

/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}



/* Create task */
let tabDiv = getEl('item-box-tab');
// Draw initial grid
for (let i = 0; i < 5; i++) {
  let wtrows = tabDiv.insertRow();
  for (let j = 0; j < 10; j++) {
    let tcell = wtrows.insertCell();

    let cellId = (j+1).toString() + '-' + (i+1).toString();
    tcell.id = 'cell-' + cellId;
    tcell.style.height = '45px';
    tcell.style.width = '45px';
    tcell.style.textAlign = 'center';
    tcell.style.verticalAlign = 'middle';
    //tcell.style.border = 'red solid 1px';


    if (i==0 && j < 5) {
      let letter = baseObj[j];
      let color = objFeats[letter];

      let item = drawBlock(letter, color, letter);
      item.onclick = () => handleItemClick(item.id);
      tcell.append(item);

      states[letter] = 0;
    }


    // if (Math.random() < envDensity) {
    //   let letter = sampleFromList(baseObj, 1, 1);
    //   let color = objFeats[letter];
    //   let posId = `pos-${cellId}-${letter}`

    //   let item = drawBlock(letter, color, posId);
    //   item.onclick = () => handleItemClick(item.id);
    //   tcell.append(item);

    //   states[posId] = 0;
    // }
  }
}
function handleItemClick(id) {
  console.log(id)
}


/* History box */
let histTab = getEl('hist-box-tab');
for (let i = 0; i < 6; i++) {
  let whrows = histTab.insertRow();
  for (let j = 0; j < 1; j++) {
    let hcell = whrows.insertCell();
    hcell.style.height = '40px';
    hcell.style.width = '200px';
    hcell.style.border = '#C0C0C0 solid 1px';
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
