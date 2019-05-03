function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('NSFL Draft Tools')
//  .addItem('Generate Headers', 'buildHeader')
  .addItem('Make Board','makeBoard2')
//  .addItem('Make Best List', 'makeBestList')
  .addToUi();
}
 
function buildHeader(length) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('boardCSV')
  sheet.getRange(1,1).setValue('img')
  sheet.getRange(1,2).setValue('lastPick')
  sheet.getRange(1,3).setValue('onClock')
  
  bestIndex = 4
  for(var x = 0; x<=3; x++) {
    sheet.getRange(1, bestIndex + x).setValue('best' + (x+1))
  }
  
  pickIndex = 8
  for(var x = 0; x<=length; x++) {
    sheet.getRange(1,pickIndex + x*3).setValue('team'+(x+1))
    sheet.getRange(1,pickIndex + x*3 + 1).setValue('pick'+(x+1))
    sheet.getRange(1,pickIndex + x*3 + 2).setValue('pos'+(x+1))
  }
}

function makeBestList(player,pickNum) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var bestSheet = ss.getSheetByName('bestList')
  // make it so that it gets the last row
  var bestList = bestSheet.getRange(bestSheet.getLastRow(), 1, 1, pickNum).getValues()
  var index = bestList[0].indexOf(player)
  
  bestList = bestList[0]
  bestList.splice(index,1)
  bestSheet.appendRow(bestList)
  
//  Logger.log(bestList)
  
  return bestList
}

function makeBoard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var boardSheet = ss.getSheetByName('boardCSV')
//  var bestSheet = ss.getSheetByName('bestList')
  var genSheet = ss.getSheetByName('boardGen')
  var pickSheet = ss.getSheetByName('draftOrder')
  
// Getting values
  pickNum = genSheet.getLastRow() - 1
  var testArray = genSheet.getRange(2,1,genSheet.getLastRow()-1,genSheet.getLastColumn()).getValues()
  tradeNum = genSheet.getLastColumn()/2 - 1
  
  pickArray = pickSheet.getRange(2,4,pickSheet.getLastRow()-2,2).getValues()
  pickLen = pickArray.length
  Logger.log(pickArray.length)
  
  Logger.log('picks: '+pickNum+', trades: '+tradeNum)
  
  buildHeader(pickArray.length)
  
// Determining trades
  orderList = []
  tradeList = []
  for (var i = 0; i <= tradeNum; i++) {
    iOrder = testArray.map(function(value,index) { return value[2*i + 1] })
    orderList.push(iOrder)
    tOrder = testArray.map(function(value,index) { return value[2*i]})
    tradeList.push(tOrder)
  }
  Logger.log(orderList[0])
  
  tradeIndices = [0]
  for (var k = 1; k<= tradeNum;k++){
    i = 0
    while (tradeList[k][i] == ""){
      i++
    }
    tradedPick = i+1
    tradeIndices.push(tradedPick)
  }
  tradeIndices.push(orderList[0].length)
  Logger.log(tradeIndices)
  
// deleting previous bestLists
  if (bestSheet.getLastRow() > 1){
    bestSheet.getRange(2,1,bestSheet.getLastRow()-1,bestSheet.getLastColumn()).deleteCells(SpreadsheetApp.Dimension.ROWS)
  }
// Getting best list
  var bestList = bestSheet.getRange(1, 1, 1, bestSheet.getLastColumn()).getValues()
  bestList = bestList[0]
  bestList.push('" ')
  bestFour = [bestList.slice(0,4)]
//  Logger.log(bestFour)
  
  // Looping to make all picks
  
  for (k = 0; k< tradeNum+1; k++){
    // First image
    // Possibly convert these to arrays and write ONCE?
    
    pickIndex = 8
    
    if (k>0){
      boardSheet.getRange(2+tradeIndices[k]+k-1,1).setValue(tradeIndices[k]+'z')
      boardSheet.getRange(2+tradeIndices[k]+k-1,2).setValue(tradeIndices[k]-k)
      boardSheet.getRange(2+tradeIndices[k]+k-1,3).setValue('\\clock\\'+orderList[k][tradeIndices[k]-k]+'.png')
      boardSheet.getRange(2+tradeIndices[k]+k-1,4,1,4).setValues(bestFour)
      pickIndex = 8
      for(var x = 0; x<=pickLen; x++) {
        boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3).setValue('\\pickbkg\\'+orderList[k][x]+'.png')
        //if k = 0, else
        if (x < tradeIndices[k]-1){
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 1).setValue(pickArray[x][0])
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 2).setValue(pickArray[x][1])
        } else {
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 1).setValue('" ')
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 2).setValue('" ')
        }
      } 
    } else {
        boardSheet.getRange(2,1).setValue(0+'z')
        boardSheet.getRange(2,2).setValue(0)
        boardSheet.getRange(2,3).setValue('\\clock\\'+orderList[k][tradeIndices[k]-k]+'.png')
        boardSheet.getRange(2,4,1,4).setValues(bestFour)
        
        
        for(var x = 0; x<=pickLen; x++) {
          boardSheet.getRange(2,pickIndex + x*3).setValue('\\pickbkg\\'+orderList[k][x]+'.png')
          boardSheet.getRange(2,pickIndex + x*3 + 1).setValue('" ')
          boardSheet.getRange(2,pickIndex + x*3 + 2).setValue('" ')
          
        }
      }
     
    // Up until next trade
    
    for (t = tradeIndices[k]-1; t < tradeIndices[k+1]-1; t++){
      img = k+t+1
      boardSheet.getRange(3+t+k,1).setValue(img+'z')
      boardSheet.getRange(3+t+k,2).setValue(t+1)
      boardSheet.getRange(3+t+k,3).setValue('\\clock\\'+orderList[k][t+1]+'.png')
      //if best4 len < 4 add " 
      bestFour = [makeBestList(pickSheet.getRange(2+t,4).getValue(),pickNum).slice(0,4)]
      for (b = 0; b < 4; b++){
        if (bestFour[0][b] == '') {
          bestFour[0][b] = '" '
        }
      }
      Logger.log(bestFour[0])
      boardSheet.getRange(3+t+k,4,1,4).setValues(bestFour)
      
      for(var x = 0; x<=pickLen; x++) {
        boardSheet.getRange(3+t+k,pickIndex + x*3).setValue('\\pickbkg\\'+orderList[k][x]+'.png')
        if (x < t+1){
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 1).setValue(pickArray[x][0])
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 2).setValue(pickArray[x][1])
        } else {
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 1).setValue('" ')
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 2).setValue('" ')
        }
      }
      
    }
    
    // the next trade
    
    
  }
  
}

function buildHeader2(length,pickIndex) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('boardCSV')
  sheet.getRange(1,1).setValue('img')
//  sheet.getRange(1,2).setValue('lastPick')
//  sheet.getRange(1,3).setValue('onClock')
  
//  bestIndex = 3
//  for(var x = 0; x<=3; x++) {
//    sheet.getRange(1, bestIndex + x).setValue('best' + (x+1))
//  }
  
//  pickIndex = 2
  for(var x = 0; x<=length; x++) {
    sheet.getRange(1,pickIndex + x*3).setValue('team'+(x+1))
    sheet.getRange(1,pickIndex + x*3 + 1).setValue('pick'+(x+1))
    sheet.getRange(1,pickIndex + x*3 + 2).setValue('pos'+(x+1))
  }
}

function makeBoard2() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var boardSheet = ss.getSheetByName('boardCSV')
//  var bestSheet = ss.getSheetByName('bestList')
  var genSheet = ss.getSheetByName('boardGen')
  var pickSheet = ss.getSheetByName('draftOrder')
  var pickCardSheet = ss.getSheetByName('picksCSV')
  
// Getting values
  pickNum = genSheet.getLastRow() - 1
  var testArray = genSheet.getRange(2,1,genSheet.getLastRow()-1,genSheet.getLastColumn()).getValues()
  tradeNum = genSheet.getLastColumn()/2 - 1
  
  pickArray = pickSheet.getRange(2,4,pickSheet.getLastRow()-2,2).getValues()
  pickLen = pickArray.length
  Logger.log(pickArray.length)
  
  Logger.log('picks: '+pickNum+', trades: '+tradeNum)
  
  pickIndex = 2
  
  buildHeader2(pickNum-1,pickIndex)
  
// Determining trades
  orderList = []
  tradeList = []
  for (var i = 0; i <= tradeNum; i++) {
    iOrder = testArray.map(function(value,index) { return value[2*i + 1] })
    orderList.push(iOrder)
    tOrder = testArray.map(function(value,index) { return value[2*i]})
    tradeList.push(tOrder)
  }
  Logger.log(orderList[0])
  
  tradeIndices = [0]
  for (var k = 1; k<= tradeNum;k++){
    i = 0
    while (tradeList[k][i] == ""){
      i++
    }
    tradedPick = i+1
    tradeIndices.push(tradedPick)
  }
  tradeIndices.push(orderList[0].length)
  for(var x = 0; x<=tradeIndices.length-1;x++){
    pickSheet.getRange(2+x, 8).setValue(tradeIndices[x])
  }
  Logger.log(tradeIndices)
  
//// deleting previous bestLists
//  if (bestSheet.getLastRow() > 1){
//    bestSheet.getRange(2,1,bestSheet.getLastRow()-1,bestSheet.getLastColumn()).deleteCells(SpreadsheetApp.Dimension.ROWS)
//  }
//// Getting best list
//  var bestList = bestSheet.getRange(1, 1, 1, bestSheet.getLastColumn()).getValues()
//  bestList = bestList[0]
//  bestList.push('" ')
//  bestFour = [bestList.slice(0,4)]
////  Logger.log(bestFour)
  
  // Looping to make all picks
  
  for (k = 0; k< tradeNum+1; k++){
    // First image
    // Possibly convert these to arrays and write ONCE?
    
    pickIndex = 2
    
    if (k>0){
//      Logger.log(k)
//      Logger.log(tradeIndices[k])
      boardSheet.getRange(2+tradeIndices[k]+k-1,1).setValue(tradeIndices[k]+k-1+'z')
//      boardSheet.getRange(2+tradeIndices[k]+k-1,2).setValue(tradeIndices[k]-k)
//      boardSheet.getRange(2+tradeIndices[k]+k-1,3).setValue('\\clock\\'+orderList[k][tradeIndices[k]-k]+'.png')
//      boardSheet.getRange(2+tradeIndices[k]+k-1,4,1,4).setValues(bestFour)
//      pickIndex = 2
      for(var x = 0; x<=pickLen; x++) {
        boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3).setValue('\\pickbkg\\'+orderList[k][x]+'.png')
        //if k = 0, else
        if (x < tradeIndices[k]-1){
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 1).setValue(pickArray[x][0])
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 2).setValue(pickArray[x][1])
        } else {
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 1).setValue('" ')
          boardSheet.getRange(2+tradeIndices[k]+k-1,pickIndex + x*3 + 2).setValue('" ')
        }
      } 
    } else {
        boardSheet.getRange(2,1).setValue(0+'z')
        boardSheet.getRange(2,2).setValue(0)
//        boardSheet.getRange(2,3).setValue('\\clock\\'+orderList[k][tradeIndices[k]-k]+'.png')
//        boardSheet.getRange(2,4,1,4).setValues(bestFour)
        
        
        for(var x = 0; x<=pickLen; x++) {
          boardSheet.getRange(2,pickIndex + x*3).setValue('\\pickbkg\\'+orderList[k][x]+'.png')
          boardSheet.getRange(2,pickIndex + x*3 + 1).setValue('pie ')
          boardSheet.getRange(2,pickIndex + x*3 + 2).setValue('pie ')
          
        }
      }
     
    // Up until next trade
    
    for (t = tradeIndices[k]-1; t < tradeIndices[k+1]-1; t++){
      Logger.log('t:%s',t)
      img = k+t+1
      Logger.log('img:%s',img)
      boardSheet.getRange(3+t+k,1).setValue(img+'z')
//      boardSheet.getRange(3+t+k,2).setValue(t+1)
//      boardSheet.getRange(3+t+k,3).setValue('\\clock\\'+orderList[k][t+1]+'.png')
      //if best4 len < 4 add " 
//      bestFour = [makeBestList(pickSheet.getRange(2+t,4).getValue(),pickNum).slice(0,4)]
//      for (b = 0; b < 4; b++){
//        if (bestFour[0][b] == '') {
//          bestFour[0][b] = '" '
//        }
//      }
//      Logger.log(bestFour[0])
//      boardSheet.getRange(3+t+k,4,1,4).setValues(bestFour)
      
      for(var x = 0; x<=pickLen; x++) {
        boardSheet.getRange(3+t+k,pickIndex + x*3).setValue('\\pickbkg\\'+orderList[k][x]+'.png')
        if (x < t+1){
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 1).setValue(pickArray[x][0])
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 2).setValue(pickArray[x][1])
        } else {
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 1).setValue('" ')
          boardSheet.getRange(3+t+k,pickIndex + x*3 + 2).setValue('" ')
        }
      }
      
    }
    
    // the next trade
  }
}