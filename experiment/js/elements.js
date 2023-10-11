
/** Create page elements */

function drawMachine (id, color, steps) {

  let retDiv = createCustomElement('div', '', '');

  let scoreDiv = createCustomElement('div', 'machine-top', '');
  scoreDiv.innerHTML = `<strong>Total energy: <span id="total-score-${id}" style="color:red">0</span></strong>`;

  let ele1 = createCustomElement('div', '', `dis-item-left-${id}`);
  let ele2 = createCustomElement('div', '', `dis-item-mid-${id}`);
  let ele3 = createCustomElement('div', '', `dis-item-right-${id}`);
  let display = createCustomElement('div', 'machine-display', '');
  display.style.borderColor = color;
  display.append(ele1);
  display.append(ele2);
  display.append(ele3);

  let mbar = createCustomElement('div', 'machine-bar', '');
  // mbar.style.backgroundColor = color;
  for (let i = 0; i < steps; i++) {
    let mbarUnit = createCustomElement('div', 'machine-bar-unit', id + '-unit-' + (i+1).toString());
    mbarUnit.style.backgroundColor = color;
    mbar.append(mbarUnit)
  }

  let mholder = createCustomElement('div', 'machine-holder', '');
  mholder.append(mbar);
  mholder.append(display);

  let fbox = createCustomElement('div', 'feedback-box', `feedback-box-${id}`);
  fbox.style.borderColor = color;

  let mbox = createCustomElement('div', 'machine-box', '');
  mbox.append(mholder);
  mbox.append(fbox);

  let mUpper = createCustomElement('div', 'machine-upper', '');
  mUpper.append(mbox);

  let extractBtn = createBtn(`extract-btn-${id}`, 'Extract', 'machine-btn', false);
  let fuseBtn = createBtn(`fuse-btn-${id}`, 'Fuse', 'machine-btn', false);
  let holder = createCustomElement('div', 'machine-space-holder', '');
  let mLower = createCustomElement('div', 'machine-lower', '');
  mLower.style.backgroundColor = color;
  mLower.append(extractBtn);
  mLower.append(fuseBtn);
  mLower.append(holder);

  retDiv.append(scoreDiv);
  retDiv.append(mUpper);
  retDiv.append(mLower);
  retDiv.className = 'ml-up';
  return retDiv;

}


function drawTask(id, color, steps, itemList = baseObj, histObj = {'showup': 1}, ) {

  let retDiv = createCustomElement('div', '', '');

  let mainLeft = createCustomElement('div', 'main-left', '');
  let itemDiv = createCustomElement('div', 'item-box', `item-box-${id}`);
  itemList.forEach(el => { itemDiv.append(drawBlock(el, id + '-' + el)) });

  mainLeft.append(drawMachine(id, color, steps));
  mainLeft.append(itemDiv);

  let mainRight = createCustomElement('div', 'main-right', '');
  let histPanel = createCustomElement('div', 'hist-panel', '');
  histPanel.innerHTML = (Object.keys(histObj).length < 0)? '' : 'History' + `<div class="hist-box" id="hist-box-${id}"></div>`
  mainRight.append(histPanel);


  retDiv.append(mainLeft);
  retDiv.append(mainRight);
  retDiv.className = 'main-box';

  return retDiv

}


function drawTaskWithInfo(id, config, itemList = baseObj, histObj = {'showup': 1}) {

  let retDiv = createCustomElement('div', '', 'task-'+id);

  let infoBar = createCustomElement('div', 'main-info', '');
  infoBar.innerHTML = `<strong>Task ${id[1]}</strong>/${taksIds.length} (Fusion works out ${Math.round(config['p']*10)} out of 10 times)<br><hr>`

  let taskDiv = drawTask(id, config['color'], config['step'], itemList, histObj);
  let btnDiv = createCustomElement('div', 'button-group-vc', 'intro-btn-group-'+id);
  btnDiv.append(createBtn('task-next-btn-' + id, 'Next', 'intro-button', true));

  retDiv.append(infoBar);
  retDiv.append(taskDiv);
  retDiv.append(btnDiv);

  btnDiv.style.display = 'none';
  return retDiv;

}
