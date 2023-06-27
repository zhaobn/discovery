
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
function showCompletion(code) {
  hide("debrief")
  showNext("completed")
  let t = document.createTextNode(code);
  document.getElementById('completion-code').append(t);
}
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}


/* Draw grid */
let total_xp = 40;
const [ NROW, NCOL ] = [ 6, 10 ];
const TECH_TREE = {
  'branchstone': ['arrow', 0.8],
  'berrysoilwater': ['seedling', 1],
  'bowrabbit': ['rabbit-caught', 0.5],
  'bowrabbitstone': ['rabbit-caught', 0.9],
}
const REWARDS = {
  'berry': 10,
}


/* Helper functions */
function sampleOne (arr) {
  return (arr[Math.floor(Math.random()*arr.length)])
}
function swapObjectKeyValue(obj){
  var ret = {};
  for(var key in obj){
    ret[obj[key]] = key;
  }
  return ret;
}
function drawItem (item) {
  return (item.length > 0)? `<img src="../imgs/${item}.png" style="height:60px">`: '';
}
function makeTabVar(default_value=0, tabPrefix = 'demoGrid-', nrow=NROW, ncol=NCOL) {
  let tabVar = {};
  for (let i = 0; i < nrow; i++) {
    for (let j = 0; j < ncol; j++) {
      let vid = tabPrefix + (j+1).toString() + '-' + (NROW-i).toString();
      tabVar[vid] = default_value;
    }
  }
  return tabVar
}
function cellClick (cell_id) {
  demoStateCount[cell_id] += 1;
  if (demoState[cell_id].length > 0 && demoStateCount[cell_id] % 2 == 1) {
    getEl(cell_id).style.border = 'solid red 2px';
  } else {
    getEl(cell_id).style.border = '0px';
  }
}




/*
MAIN COMBINE BUTTON FUNCTION - NEEDS DEBUGGING
*/
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




// Prep data
let demoState = makeTabVar('');
let demoStateCount = makeTabVar();
let gameStates = [];



// // Draw random positions for given items
// const initial_items = [ 'berry', 'berry', 'berry', 'soil', 'soil', 'water', 'water', 'stone', 'branch', 'rabbit' ]; // can customize weights
// let all_cells = Object.keys(demoState);
// let demo_pos = [];
// for (let i = 0; i < initial_items.length; i++) {
//   let pos = sampleOne(all_cells);
//   while (demo_pos.length > 0 && demo_pos.indexOf(pos) > 0) {
//     pos = sampleOne(all_cells);
//   }
//   demo_pos.push(pos);
//   demoState[pos] = initial_items[i];
// }



// // Make the interface
// for (let i = 0; i < NROW; i++) {
//   let wtrows = getEl('items-box-demo').insertRow();
//   for (let j = 0; j < NCOL; j++) {
//     let tcell = wtrows.insertCell();
//     tcell.id = `demoGrid-` + (j+1).toString() + '-' + (NROW-i).toString();
//     tcell.innerHTML = drawItem(demoState[tcell.id]);
//     // tcell.style.border = 'red solid 1px';
//     tcell.style.width = '40px';
//     tcell.onclick = () => cellClick(tcell.id);
//   }
// }
