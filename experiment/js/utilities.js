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
function createBtn (btnId, text = "Button", className = "task-button", on = true) {
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
function removeBrackets (text) {
  text = text.replace(/[\[\]']+/g,'');
  return text
}
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



/* Array functions */
function getCombos(array) {
  let ret = array.reduce( (acc, v, i) => acc.concat(array.slice(i+1).map( w => `[${v}][${w}]`)), []);
  return ret
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
  return `<h3>Total Points: ${x}</h3>`
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
function getItemSize(label) {
  let n = removeBrackets(label).split('').length;
  return (n < 2)? 'base' : n;
}
function getItemHeight(size, type) {
  let length = (type == 'small')? 20 : 40;
  let nrows = Math.ceil(size / 5);
  if (size != 'base' && type != 'small') {
    length = length + (nrows-1) * (length)/5;
  } else if (type == 'small') {
    length = length * nrows;
  }
  return length

}
function getItemWidth(size, type) {
  let length = (type == 'small')? 20 : 40;
  if (type == 'small') {
    length = (size == 'base')? length : length * size - 2;
  } else {
    if (size != 'base') {
      length = Math.min(1.2**size * length, 180);
    }
  }
  return length
}

function drawBlock(shape, letter, id='', color, score=0, type='') {

  let blockBg = createCustomElement('div', 'item-holder', '');

  let block = createCustomElement('div', 'item-element', id);
  let size = getItemSize(letter);

  block.style.height = getItemHeight(size, type).toString() + 'px';
  block.style.width = getItemWidth(size, type).toString() + 'px';
  block.style.backgroundColor = color;
  block.innerHTML = letter;
  if (color == '#ffeb3b' | color == '#cddc39' | color == '#ffc107') {
    block.style.color ='black';
  }
  if (shape == 'circle') {
    block.style.borderRadius = '50%';
  }

  blockBg.append(block);
  if (score > 0) {
    let scoreInfo =  createCustomElement('div', 'item-score', '');
    scoreInfo.innerHTML = score + 'p';
    if (type=='demo') {
      scoreInfo.style.color = 'red';
    }
    blockBg.append(scoreInfo);
  }
  return blockBg
}
function chanceTobar(x) {
  return Math.round((1-x)*100).toString() + '%'
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

function drawStar(fillColor, spikes=5, outerRadius=15,innerRadius=8, borderSize=2, borderColor='black') {
  let retCanvas = createCustomElement('canvas', 'drawings', '');
  retCanvas.height = 45;
  retCanvas.width = 45;

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
