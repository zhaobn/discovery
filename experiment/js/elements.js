
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

  console.log(taskConfigsWithId[id])

  let retDiv = createCustomElement('div', 'main-box', `main-box-${id}`);

  let mainLeft = createCustomElement('div', 'main-left', `main-left-${id}`);
  let itemDiv = createCustomElement('div', 'item-box-wrapper', `item-wrapper-${id}`);

  // create separate spaces for items
  let shapes = taskConfigsWithId[id]['shapes'];
  if (assignedDensity == 'low') {
    leftDiv = createCustomElement('div', 'item-box', `item-box-left-${id}`);
    rightDiv = createCustomElement('div', 'item-box', `item-box-right-${id}`);
    itemList.forEach(el => {
      leftDiv.append(drawBlock(shapes[0], el, id + '-left-' + el, itemColor, baseReward));
      rightDiv.append(drawBlock(shapes[0], el, id + '-right-' + el, itemColor, baseReward));
    });
    itemDiv.append(leftDiv);
    itemDiv.append(rightDiv);

  } else {
    leftDiv = createCustomElement('div', 'item-box', `item-box-left-${id}`);
    rightDiv = createCustomElement('div', 'item-box', `item-box-right-${id}`);
    leftMidDiv = createCustomElement('div', 'item-box', `item-box-leftmid-${id}`);
    rightMidDiv = createCustomElement('div', 'item-box', `item-box-rightmid-${id}`);
    itemList.forEach(el => {
      leftDiv.append(drawBlock(shapes[0], el, id + '-left-' + el, itemColor, baseReward));
      rightDiv.append(drawBlock(shapes[1], el, id + '-right-' + el, itemColor, baseReward));
      leftMidDiv.append(drawBlock(shapes[2], el, id + '-leftmid-' + el, itemColor, baseReward));
      rightMidDiv.append(drawBlock(shapes[3], el, id + '-rightmid-' + el, itemColor, baseReward));
    });
    itemDiv.append(leftDiv);
    itemDiv.append(rightDiv);
    itemDiv.append(leftMidDiv);
    itemDiv.append(rightMidDiv);
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


function drawTaskWithInfo(id, config, itemList = baseObj, histObj = {'showup': 1}) {

  let retDiv = createCustomElement('div', '', 'task-'+id);

  let infoBar = createCustomElement('div', 'main-info', '');

  let bannerText = `Practice trial ${id.substring(1)}/${practiceIds.length}`

  let probInfoPanel = createCustomElement('div', 'prob-info-panel', '');
  // let itemColor = config['objColor'];
  // let leftRadius = (squareOnLeft == 1)? '0' : '50';
  // let rightRadius = (squareOnLeft == 1)? '50' : '0';
  // let leftProb = (squareOnLeft == 1)? config['psquare']: config['pcircle'];
  // let rightProb = (squareOnLeft == 1)? config['pcircle']: config['psquare'];
  // let crossProb = config['pcross'];
  // probInfoPanel.innerHTML = `
  // <div class="intruct-p">
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${leftRadius}%"></span> +
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${leftRadius}%"></span>
  //     works out ${leftProb*10} out of 10 times;
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${rightRadius}%"></span> +
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${rightRadius}%"></span>
  //     works out ${rightProb*10} out of 10 times;
  // </div>
  // <div class="intruct-p">
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${leftRadius}%"></span> +
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${rightRadius}%"></span>,
  //   or <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${rightRadius}%"></span> +
  //   <span class="item-element" style="height:20px;width:20px;background-color:${itemColor};border-radius:${leftRadius}%"></span>,
  //     works out ${crossProb*10} out of 10 times.
  // </div>
  // <hr>`


  infoBar.innerHTML = id[0] == 'p'?  bannerText: `<strong>Task ${id.substring(1)}</strong>/${testIds.length}`;
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

  let introText = (blockId[0] == 'p')? `Warm up with ${practiceIds.length} practice trials.` : `There are ${taskBlockSize} trials in total.`;
  // if (showProb == true && blockId[0] == 't') {
  //   introText += `<br><br>Make the most out of it! Your bonus depends on the total points you gather.`; //`<br><br>Fusion works out ${Math.round(p*10)} out of 10 times on average.`
  // }
  retDiv.innerHTML = introText;

  let btnDiv = createCustomElement('div', 'button-group-vc', 'preview-btn-group-'+blockId);
  btnDiv.append(createBtn('preview-next-btn-' + blockId, 'Start', 'intro-button', true));
  btnDiv.style.marginTop = '150px';
  retDiv.append(btnDiv);

  return retDiv;
}
