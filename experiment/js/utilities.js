
const NCOL = 10
const NROW = 6

/* Custom wrappers */
function createCustomElement (type = 'div', className, id) {
  let element = (["svg", "polygon"].indexOf(type) < 0)?
    document.createElement(type):
    document.createElementNS("http://www.w3.org/2000/svg", type);
  if (className.length > 0) element.setAttribute("class", className);
  if (id.length > 0) element.setAttribute("id", id);
  return element;
}
function createText(h = "h1", text = 'hello') {
  let element = document.createElement(h);
  let tx = document.createTextNode(text);
  element.append(tx);
  return(element)
}
function createBtn (btnId, text = "Button", on = true, className = "task-button") {
  let btn = createCustomElement("button", className, btnId);
  btn.disabled = !on;
  (text.length > 0) ? btn.append(document.createTextNode(text)): null;
  return(btn)
}
function getEl(elementID) {
  let el = document.getElementById(elementID)
  return el
}
function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}


/* Transition functions */
function showNext(id, display = "flex", center = true) {
  let div = document.getElementById(id);
  div.style.display = display;
  div.scrollIntoView(center);
}
function hide(id) {
  let div = document.getElementById(id);
  div.style.display = "none";
}
function hideAndShowNext(hid, sid, display, center = true) {
  hide(hid);
  showNext(sid, display, center)
}



/* Form-related functions */
function compIsFilled () {
  let radios = document.getElementsByTagName('input');
  let checked = 0;
  for (let i = 0; i < radios.length; i++) {
      checked += radios[i].checked;
  }
  return (checked > checks.length-1)
}
function isFilled (formID) {
  let notFilled = false;
  const nulls = [ '', '--', '', '--', '', '--' ];
  const form = document.getElementById(formID);
  const inputs = form.elements;
  (Object.keys(inputs)).forEach((input, idx) => {
    let field = inputs[input];
    notFilled = (notFilled || (field.value === nulls[idx]));
  });
  return (!notFilled)
}


/* Data-related functions */
function removeSpecial (text) {
  text = text.replace(/[&\/\\#,$~%"\[\]{}@^_|`']/gi, '');
  text = text.replace(/(\r\n|\n|\r|\t)/gm, " ")
  return text
}
function generateToken (length) {
  let tokens = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < length; i ++) {
      tokens += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return tokens;
}
function formatDates (date, option = 'date') {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let day = String(date.getDate() + 1).padStart(2, '0');
  let hour = String(date.getHours()+ 1).padStart(2, '0');
  let min = String(date.getMinutes() + 1).padStart(2, '0');
  let sec = String(date.getSeconds() + 1).padStart(2, '0');
  dateParts = (option === 'date') ? [ year, month, day ] : [ hour, min, sec ];
  return dateParts.join('_');
}
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}


/* Random functions */
function randFromRange(min, max) {
  return Math.random() * (max - min) + min;
}
function sampleFromList(arr, n=1, replace=true) {
  if (n==1) {
    return (arr[Math.floor(Math.random()*arr.length)])
  }
  else {
    let sampled = [];
    for (let j = 0; j < n; j++) {
      let randomIndex = Math.floor(Math.random()*arr.length);
      sampled.push(arr[randomIndex]);
      if (replace == 0) {
        arr.splice(randomIndex, 1)[0];
      }
    }
    return sampled;
  }
}


/* Object functions */
function swapObjectKeyValue(obj){
  var ret = {};
  for(var key in obj){
    ret[obj[key]] = key;
  }
  return ret;
}


/* Task-specific functions */
function showScoreText(x) {
  return `<h3>Total XP: ${x}</h3>`
}
function showFeedback(x) {
  if (x>0) {
    return `<h1><font color="green">+${x}</font></h1>`
  } else if (x<0) {
    return `<h1><font color="red">${x}</font></h1>`
  } else {
    return ''
  }
}
function drawCircle(fillColor, radius=24, borderColor='black', borderSize=2) {
  let retCanvas = createCustomElement('canvas', 'drawings', '');
  retCanvas.height = 60;
  retCanvas.width = 60;
  let context = retCanvas.getContext('2d');

  context.beginPath();
  context.arc(retCanvas.width/2, retCanvas.height/2, radius, 0, 2 * Math.PI, false);

  context.fillStyle = fillColor;
  context.fill();

  context.lineWidth = borderSize;
  context.strokeStyle = borderColor;
  context.stroke();

  return retCanvas
}
function drawTriangle(edgeLength=30, fillColor='black', borderColor='black', borderSize=1) {
  let retCanvas = createCustomElement('canvas', 'drawings', '');
  retCanvas.height = 60;
  retCanvas.width = 60;
  let context = retCanvas.getContext('2d');

  let height = edgeLength * Math.cos(Math.PI / 6);
  context.beginPath();
  context.moveTo((retCanvas.width-edgeLength)/2, (retCanvas.height+height)/2);
  context.lineTo((retCanvas.width+edgeLength)/2, (retCanvas.height+height)/2);
  context.lineTo(retCanvas.width/2, (retCanvas.height-height)/2);
  context.closePath();

  context.lineWidth = borderSize;
  context.strokeStyle = borderColor;
  context.stroke();

  context.fillStyle = fillColor;
  context.fill();

  return retCanvas;
}
function drawStar(fillColor, spikes=5, outerRadius=30,innerRadius=15,borderColor='black', borderSize=3) {
  let retCanvas = createCustomElement('canvas', 'drawings', '');
  retCanvas.height = 60;
  retCanvas.width = 60;

  let context = retCanvas.getContext('2d');
  context.save();
  context.beginPath();
  context.translate(retCanvas.width/2, retCanvas.height/2);
  context.moveTo(0, 0-outerRadius);
  for (var i = 0; i < spikes; i++) {
    context.rotate(Math.PI / spikes);
    context.lineTo(0, 0 - innerRadius);
    context.rotate(Math.PI / spikes);
    context.lineTo(0, 0 - outerRadius);
  }
  context.closePath();
  context.lineWidth=borderSize;
  context.strokeStyle=borderColor;
  context.stroke();

  context.fillStyle=fillColor;
  context.fill();
  context.restore();
  return retCanvas;
}

function drawBlock(letter, color) {
  let block = createCustomElement('div', '', '');
  block.style.height = '20px';
  block.style.width = '20px';
  block.style.border = 'solid 1px black';
  block.style.backgroundColor = color;
  block.style.color='white';
  block.innerHTML = letter;
  return block
}


function drawItem (item) {
  return (item.length > 0)? `<img src="static/imgs/${item}.png" style="height:60px">`: '';
}
function getAllCellIds(ncol=NCOL, nrow=NROW) {
  let ret = [];
  for (let i = 0; i < nrow; i++) {
    for (let j = 0; j < ncol; j++) {
      ret.push((j+1).toString() + '-' + (NROW-i).toString());
    }
  }
  return ret
}
function readTaskData (obj, taskId, refObj, retType = 'obj') {
  let taskData = Object.fromEntries(Object.entries(obj).
    filter(([key, value]) => (key.split('-')[0] == taskId) & (value%2==1)));
  let selected = Object.fromEntries(Object.entries(refObj).
    filter(([key]) => Object.keys(taskData).includes(key)));
  if (retType == 'obj') {
    return Object.values(selected)
  } else if (retType == 'id') {
    return Object.keys(selected)
  } else {
    return taskData
  }
}
function getTaskFeedbackChunk (item, config) {
  if (Math.random() < config[item]['prob']) {
    return Math.abs(config[item]['reward'])
  } else {
    return -1*Math.abs(config[item]['cost'])
  }
}
function showNewItem (ids, item) {
  getEl(ids[0]).removeChild(getEl(ids[0]).firstChild);
  getEl(ids[1]).removeChild(getEl(ids[1]).firstChild);
  getEl(ids[1]).style.borderColor = 'white';

  if (item == 'star') {
    getEl(ids[0]).append(drawStar('limegreen'));
    getEl(ids[0]).style.borderColor = 'limegreen';
  } else if (item == 'circ') {
    getEl(ids[0]).append(drawCircle('lightblue'));
    getEl(ids[0]).style.borderColor = 'lightblue';
  }

}
