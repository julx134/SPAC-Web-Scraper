function onOpen() {
 var ui = SpreadsheetApp.getUi();
 ui.createMenu('Stonks')
 .addItem('Update Stonks', 'stonks')
 .addToUi();
}

function stonks() {
 updateStonksData();
 topPrioStonks();
 ianGheyWarrants();  
}

function updateStonksData() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = [spreadsheet.getSheetByName('List of Merged SPACs')];
  var url = "https://query2.finance.yahoo.com/v7/finance/options/";
  
 
  for(var i = 0; i < ss.length; i++) {
    var options = {muteHttpExceptions: true};
    Logger.log(ss[i].getName());
    for(var x = 2; x < ss[i].getLastRow(); x++) {
      if(String(ss[i].getRange(x,1).getValue()).trim() != '') {
        var response = UrlFetchApp.fetch("https://query2.finance.yahoo.com/v7/finance/options/" + encodeURI(ss[i].getRange(x,1).getValue()), options);
        var data = JSON.parse(response.getContentText());
        
        if(data.optionChain.result[0] != null){
          var stockPrice = data.optionChain.result[0].quote.regularMarketPrice;
          
          ss[i].getRange(x,12).setValue(stockPrice);
        }        
      }
    }
  }
}

function topPrioStonks() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("Top Prospects");
  
  var tickers = []
  for(var i = 2; i < ss.getLastRow()+1; i++) {
    tickers[i-2] = ss.getRange(i, 2).getValue();
  }
  
  for(var i = 0; i < tickers.length; i++) {
    var options = {muteHttpExceptions: true};
    var response = UrlFetchApp.fetch("https://query2.finance.yahoo.com/v7/finance/options/" + encodeURI(tickers[i]), options);
    var data = JSON.parse(response.getContentText());
    
    try {
      if(data.optionChain.result[0] != null){
      var marketCap = data.optionChain.result[0].quote.marketCap;
      var stockPrice = data.optionChain.result[0].quote.regularMarketPrice;
      var volume = data.optionChain.result[0].quote.regularMarketVolume;

      var marketData = [stockPrice, marketCap, volume];
      for(var x = 0; x < marketData.length; x++) {
        ss.getRange(i+2, x+3).setValue(marketData[x])
      }
    }
    }catch(err) {

    }
    
  }
}

function ianGheyWarrants() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("warrants ");
  var api_EndPoint = 'https://query2.finance.yahoo.com/v7/finance/options/';
  var options = {muteHttpExceptions: true};

  for(var i = 2; i < ss.getLastRow(); i++) {
    var ticker = String(ss.getRange(i,4).getValue());

    
    var response = UrlFetchApp.fetch(api_EndPoint+ticker);
    var data = JSON.parse(response.getContentText());

    if(data.optionChain.result[0] != null){
      ss.getRange(i,5).setValue(data.optionChain.result[0].quote.regularMarketPrice);
    }
  }
}
