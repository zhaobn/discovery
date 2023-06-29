
const NCOL = 6
const NROW = 10

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
        arr.slice(randomIndex, 1)[0];
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
function drawItem (item) {
  return (item.length > 0)? `<img src="../imgs/${item}.png" style="height:60px">`: '';
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
function combineClick() {
  // Get selected items
  let selected_items = [];
  let selected_cells = [];
  Object.keys(demoState).forEach(key => {
    if (demoState[key].length > 0 && demoStateCount[key] % 2 == 1) {
      selected_items.push(demoState[key]);
      selected_cells.push(key);
    }
  });
  console.log(selected_items)


  let combo = selected_items.sort().join('');
  //console.log(combo)

  // Check if a change should happen
  if (Object.keys(TECH_TREE).indexOf(combo) > -1 && Math.random() < TECH_TREE[combo][1] ) {

    let items_to_combine = {};
    selected_cells.forEach(key => items_to_combine[key] = demoState[key]);
    items_to_combine = swapObjectKeyValue(items_to_combine);

    switch (combo) {

      case 'berrysoilwater':
        // Make soil => seedling and other two disappear
        getEl(items_to_combine['soil']).innerHTML = drawItem('seedling');
        getEl(items_to_combine['soil']).style.border = 'gold solid 10px';
        getEl(items_to_combine['water']).innerHTML = '';
        getEl(items_to_combine['water']).style.border = '0px';
        getEl(items_to_combine['berry']).innerHTML = '';
        getEl(items_to_combine['berry']).style.border = '0px';
        selected_items = []; // <-- Not working now

        break;

      case 'branchstone':
        // Make branch => arrow and stone disappears
        getEl(items_to_combine['branch']).innerHTML = drawItem('arrow');
        getEl(items_to_combine['branch']).style.border = 'gold solid 10px';
        getEl(items_to_combine['stone']).innerHTML = '';
        getEl(items_to_combine['stone']).style.border = '0px';
        selected_items = [];

        break;

    }


  } else {
    console.log('Nothing happens')
  }


  // Check if is a reward
  if (Object.keys(REWARDS).indexOf(combo) > -1) {
    console.log('Get ' + REWARDS[combo] + 'XP!')
  }
}
