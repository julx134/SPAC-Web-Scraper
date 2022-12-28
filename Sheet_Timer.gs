function runCycle() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("Calendar"); 
  var startTime = Date.now();
  var counter = parseInt(ss.getRange(2,8).getValue());
  var mergedCompanies = getMergedCompanies();
  
  
  for(var i = counter; i < ss.getLastRow()+1; i++) {
    if(!timer(startTime, Date.now())) {
      if(i == ss.getLastRow()) {
        ss.getRange(2,8).setValue(2);
      }
      else {
        ss.getRange(2,8).setValue(i);
      }
      
      if(ss.getRange(i,1).getValue() != '' && ss.getRange(i, 3).getValue() == '') {
        var ticker = ss.getRange(i,1).getValue();
        var companyName = cleanCompanyName(ss.getRange(i,2).getValue());
        var api_EndPoint = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+ss.getRange(i, 1).getValue()+'?modules=secFilings';
        
        if(!mergedCompanies.includes(ticker)) {
          Logger.log(companyName);
          calendar(companyName, api_EndPoint, i);
        }
        else {
          ss.getRange(i, 4).setValue('Y');
          ss.getRange(i+':'+i).setBackground('#ff0000');
        }
      }
    }
    else {
     return; 
    }
  }
}


function timer(startTime, timeElapsed) {
  var duration = timeElapsed - startTime;
  
  if(duration > 300000) {
    return true;
  }
  else {
    return false
  }
}
