function addSpacs() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss1 = spreadsheet.getSheetByName('SPACS');
  var ss2 = spreadsheet.getSheetByName('Calendar');
  var ss3 = spreadsheet.getSheetByName('SPAC Data');
  var tickers = [];
  
  for(var i = 2; i < ss2.getLastRow()+1; i++) {
    tickers.push(ss2.getRange(i, 1).getValue());
  }
  
  var oldPoint = parseInt(ss1.getRange(2,7).getValue())+1;
  for(var i  = oldPoint; i < ss1.getLastRow()+1; i++) {
    var companyName = ss1.getRange(i,1).getValue();
    if(companyName != '') {
      var ticker = getNewSpacTicker(ss1, i);
      
      if(!tickers.includes(ticker) || ticker == null) {
        var offset1 = ss2.getLastRow();
        var offset2 = ss3.getLastRow();
        ss2.getRange(offset1+1,1).setValue(ticker);
        ss2.getRange(offset1+1,2).setValue(companyName);
        ss3.getRange(offset2+1,1).setValue(ticker);
        ss3.getRange(offset2+1,2).setValue(companyName);
        setOldPoint(ss1,i);
      }
    }
  }
}

function setOldPoint(ss, value) { 
   ss.getRange(2,7).setValue(value); 
}

function getNewSpacTicker(ss, index) {
  var tickers = [];
  while(ss.getRange(index,2).getValue() != '') {
    var ticker = String(ss.getRange(index,2).getValue()).replace('.','');
    ticker = ticker.replace(' ' , '');
    ticker = ticker.replace('WS','');
    tickers.push(ticker.trim());
    index++;
  }
  
  for(var i = 0; i < tickers.length; i++) {
    if(tickers[i].charAt(tickers[i].length-1) != 'W' && tickers[i].charAt(tickers[i].length-1) != 'U') {
      return(tickers[i]);
    }
  } 
}
