
// Data
let start_task_time = 0;
let subjectData = {};


// Collect prolific id
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}


// Comprehension quiz
const checks = [ 'check1', 'check2', 'check3', 'check4', 'check5' ];
const answers = [ true, true, false, true, false ];

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
  hideAndShowNext('instruction-2', 'instruction-1', 'block');
  getEl('check-btn').style.display = 'flex';
}
getEl('prequiz').onchange = () => compIsFilled() ? getEl('check-btn').disabled = false : null;



// Bebrief
getEl('postquiz').onchange = () => isFilled('postquiz')? getEl('done-btn').disabled = false: null;
function is_done(complete_code) {
  let inputs = getEl('postquiz').elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);

  // Clean up free responses
  subjectData['feedback'] = removeSpecial(subjectData['feedback']);

  const end_time = new Date();
  let token = generateToken(8);

  let clientData = {};
  clientData.subject = subjectData;
  clientData.subject.date = formatDates(end_time, 'date');
  clientData.subject.time = formatDates(end_time, 'time');
  clientData.subject.task_duration = end_time - start_task_time;
  clientData.subject.token = token;

  showCompletion(complete_code);

  // download(JSON.stringify(clientData), 'data.txt', '"text/csv"');
  console.log(clientData)
}
