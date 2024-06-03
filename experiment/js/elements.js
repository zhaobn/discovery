
/** Create page elements */

function drawMachine (id, steps, color) {

  let retDiv = createCustomElement('div', '', '');

  let scoreDiv = createCustomElement('div', 'machine-top', `machine-top-${id}`);
  scoreDiv.innerHTML = `<strong>Total Points: <span id="total-score-${id}" style="color:red">0</span></strong>`;

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

  let mUpper = createCustomElement('div', 'machine-upper', `machine-upper-${id}`);
  mUpper.append(mbox);

  let extractBtn = createBtn(`extract-btn-${id}`, 'Extract', 'machine-btn', false);
  let fuseBtn = createBtn(`fuse-btn-${id}`, 'Fuse', 'machine-btn', false);
  let holder = createCustomElement('div', 'machine-space-holder', '');
  let mLower = createCustomElement('div', 'machine-lower', `machine-lower-${id}`);
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


function drawTask(id, color, steps, itemColor, itemList = baseObj, histObj = {'showup': 1}, ) {

  let retDiv = createCustomElement('div', 'main-box', `main-box-${id}`);

  let mainLeft = createCustomElement('div', 'main-left', `main-left-${id}`);
  let itemDiv = createCustomElement('div', 'item-box-wrapper', `item-wrapper-${id}`);

  // create separate spaces for items
  let shapes = taskConfigsWithId[id]['shapes'];
  if (assignedDensity == 'low') {
    s1Div = createCustomElement('div', 'item-box', `item-box-s1-${id}`);
    s2Div = createCustomElement('div', 'item-box', `item-box-s2-${id}`);
    itemList.forEach(el => {
      s1Div.append(drawBlock(shapes[0], el, id + '-' + shapes[0] + '-' + el, itemColor, baseReward));
      s2Div.append(drawBlock(shapes[1], el, id + '-' + shapes[1] + '-' + el, itemColor, baseReward));
    });
    itemDiv.append(s1Div);
    itemDiv.append(s2Div);

  } else {
    s1Div = createCustomElement('div', 'item-box', `item-box-s1-${id}`);
    s2Div = createCustomElement('div', 'item-box', `item-box-s2-${id}`);
    s3Div = createCustomElement('div', 'item-box', `item-box-s3-${id}`);
    s4Div = createCustomElement('div', 'item-box', `item-box-s4-${id}`);
    itemList.forEach(el => {
      s1Div.append(drawBlock(shapes[0], el, id + '-' + shapes[0] + '-' + el, itemColor, baseReward));
      s2Div.append(drawBlock(shapes[1], el, id + '-' + shapes[1] + '-' + el, itemColor, baseReward));
      s3Div.append(drawBlock(shapes[2], el, id + '-' + shapes[2] + '-' + el, itemColor, baseReward));
      s4Div.append(drawBlock(shapes[3], el, id + '-' + shapes[3] + '-' + el, itemColor, baseReward));
    });
    itemDiv.append(s1Div);
    itemDiv.append(s2Div);
    itemDiv.append(s3Div);
    itemDiv.append(s4Div);
  }


  mainLeft.append(drawMachine(id, steps, color));
  mainLeft.append(itemDiv);

  let mainRight = createCustomElement('div', 'main-right', `main-right-${id}`);
  let histPanel = createCustomElement('div', 'hist-panel', '');
  histPanel.innerHTML = (Object.keys(histObj).length < 0)? '' : 'Failed attempts' + `<div class="hist-box" id="hist-box-${id}"></div>`
  mainRight.append(histPanel);

  retDiv.append(mainLeft);
  retDiv.append(mainRight);
  return retDiv

}


function inlineShapes(shape, color) {
  if (shape == 'square') {
    return `<span class="item-element" style="height:20px;width:20px;background-color:${color};"></span>`
  }
  if (shape == 'circle') {
    return `<span class="item-element" style="height:20px;width:20px;background-color:${color};border-radius:50%;"></span>`
  }
  if (shape == 'triangle') {
    return `<span class="item-triangle-up" style="height:0;width:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom: 20px solid ${color};"></span>`
  }
  if (shape == 'diamond') {
    return `<span class="item-triangle-up" style="height:0;width:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:20px solid ${color};"></span>`
  }
}

function drawTaskWithInfo(id, config, itemList = baseObj, histObj = {'showup': 1}) {

  let retDiv = createCustomElement('div', '', 'task-'+id);

  let infoBar = createCustomElement('div', 'main-info', '');

  let probInfoPanel = createCustomElement('div', 'prob-info-panel', '');
  let itemColor = config['objColor'];

  if (assignedKnowledge == 'expert') {
    let highCombo = config['highCombo'];
    let infoObjs = highCombo.split('-');

    let highP = config['highP'];
    let lowP = config['lowP'];
    let infoText = ''


    if (infoObjs[0] == infoObjs[1]) {
      probInfoPanel.innerHTML = `<div class="intruct-p">${inlineShapes(infoObjs[0], itemColor)} + ${inlineShapes(infoObjs[1], itemColor)} works out ${highP*10} out of 10 times;</div>`;

    } else {
      infoText = ('<div class="intruct-p">' + inlineShapes(infoObjs[0], itemColor) + ' + ' + inlineShapes(infoObjs[1], itemColor) +
        ', or ' +  inlineShapes(infoObjs[1], itemColor) + '+' + inlineShapes(infoObjs[0], itemColor) +
       `, works out ${highP*10} out of 10 times;</div>`)
       probInfoPanel.innerHTML = infoText
    }
    probInfoPanel.innerHTML += `<div class="intruct-p">other combinations work out ${lowP*10} out of 10 times.</div>`

  }

  let blockSize = id[0] == 'p'? nPractice : taskBlockSize;
  infoBar.innerHTML = `<strong>Task ${id.substring(1)}</strong>/${blockSize}`;
  if (assignedKnowledge == 'expert') {
    infoBar.append(probInfoPanel);
  } else {
    infoBar.style.height = '50px';
    infoBar.innerHTML += '<hr>'
  }


  let taskDiv = drawTask(id, config['color'], config['step'], config['objColor'], itemList, histObj);
  let btnDiv = createCustomElement('div', 'button-group-vc', 'intro-btn-group-'+id);
  btnDiv.append(createBtn('task-next-btn-' + id, 'Next', 'intro-button', true));

  retDiv.append(infoBar);
  retDiv.append(taskDiv);
  retDiv.append(btnDiv);

  btnDiv.style.display = 'none';
  return retDiv;

}



function makeTransitionDiv(blockId) {
  let retDiv = createCustomElement('div', 'preview-box', 'preview-'+blockId);

  //introText = (blockId[0] == 'p')? `Warm up with ${practiceIds.length} practice trials.` : `There are ${taskBlockSize} trials in total.`;
  let introText = '';
  if (blockId[0] == 'p') {
    introText = `Here are ${nPractice} tasks for you to get ready.<br><br>They won't count towards your bonus, but your performance on subsequent tasks will!`
  } else {
    introText = `Now, maximize your total points for these ${taskBlockSize} tasks!`
  }
  //introText = (blockId[0] == 'p')? `Warm up with ${practiceIds.length} practice trials.` : `There are ${taskBlockSize} trials in total.`;

  retDiv.innerHTML = introText;

  let btnDiv = createCustomElement('div', 'button-group-vc', 'preview-btn-group-'+blockId);
  btnDiv.append(createBtn('preview-next-btn-' + blockId, 'Start', 'intro-button', true));
  btnDiv.style.marginTop = '150px';
  retDiv.append(btnDiv);

  return retDiv;
}
