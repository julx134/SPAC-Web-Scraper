function test() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("SPACS");
  
  var parsedData = new Array();
  var url = "/cgi-bin/browse-edgar?action=getcompany&CIK=0001828248&owner=include&count=100";
  documentPage(url, parsedData);
  
  Logger.log(parsedData)
  
}


function parseSEC() {
  var options = {muteHttpExceptions: true};
  var url = "https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=&type=S-1&owner=include&count=1000&action=getcurrent";
  var html = UrlFetchApp.fetch(url, options).getContentText();
  var $ = Cheerio.load(html);
  
  //collection of companies and links
  let dataCollection = new Map();
  
  let newSpacs = new Map();
  var oldSpacs = new Array();
  
  //scrape SEC Companies Pages
  companiesPage(url, dataCollection);
  
  //open current spreadsheet
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("SPACS");

  //parse excel
  var values = ss.getRange(2, 1, ss.getLastRow()+1).getValues();
  for(r = 0; r < values.length; r++) {
    if(values[r][0] != "" || values[r][0] != null || values[r][0].length < 1) {
     oldSpacs.push(values[r][0]);
    }
  }

  var keys = Object.keys(dataCollection);
  for (x = 0; x < keys.length; x++) {
    var parsedData = new Array();
    Logger.log(keys[x]);
    if(!checkParsed(oldSpacs,keys[x])) {
      Logger.log(dataCollection[keys[x]]);
      documentPage(dataCollection[keys[x]], parsedData);
    }
    else{
     continue; 
    }
    
    if(parsedData[2]) {
      newSpacs[keys[x]] = parsedData;
    }
  }
  
  
  //auto-update spreadsheet
  if(ss.getLastRow() == 0.0) {
    var offset = 0; 
    var spacKeys = Object.keys(newSpacs);
    for(z = 0; z < spacKeys.length; z++) {
     ss.getRange(z+2+offset, 1).setValue(spacKeys[z].trim().substring(0, spacKeys[z].trim().indexOf("(")));
     ss.getRange(z+2+offset, 2).setValue(newSpacs[spacKeys[z]][3].toString());
     ss.getRange(z+2+offset, 4).setValue(newSpacs[spacKeys[z]][1]);
     ss.getRange(z+2+offset, 5).setValue(newSpacs[spacKeys[z]][0]);
     newSpacs[spacKeys[z]][3].forEach(element => {
        ss.getRange(z+2+offset,2).setValue(element);
        offset++;
     });
    }
  }
  else {
    var offset = 0;
    var spacKeys = Object.keys(newSpacs);
    for(var t = ss.getLastRow(), h = 0; h < spacKeys.length; t++, h++) {
     ss.getRange(t+2+offset, 1).setValue(spacKeys[h].trim().substring(0, spacKeys[h].trim().indexOf("(")));
     ss.getRange(t+2+offset, 2).setValue(newSpacs[spacKeys[h]][3].toString());
     ss.getRange(t+2+offset, 4).setValue(newSpacs[spacKeys[h]][1]);
     ss.getRange(t+2+offset, 5).setValue(newSpacs[spacKeys[h]][0]);
     newSpacs[spacKeys[h]][3].forEach(element => {
        ss.getRange(t+2+offset,2).setValue(element);
        offset++;
     });
      
    }
  }
}

function companiesPage(url, dataCollection) {
  Logger.log("Company page: " + url);
  var options = {muteHttpExceptions: true};
  var html = UrlFetchApp.fetch(url, options).getContentText();
  var $ = Cheerio.load(html);
  
  //find all the links
  var links = $('a');
  
  
  $(links).each(function(i, link){
    if($(link).text().includes("(Filer)")) {
      dataCollection[$(link).text()] = $(link).attr('href');
      //Logger.log($(link).text());
      //Logger.log($(link).attr('href'));
    } 
  });
  //Logger.log("returned");
  return dataCollection;
}



function documentPage(url, parsedData) {
  var documentURL = "sec.gov" + url;
  var options = {muteHttpExceptions: true};
  var documentHTML = UrlFetchApp.fetch(documentURL, options).getContentText();
  var $ = Cheerio.load(documentHTML);
  var nextURL = null;
  Logger.log("Document page: " + documentURL);

  //filters all td elements and finds one which has 'S-1' as text
  //return parent of that td element
  var s_1 = $('td').filter(function() {
    Logger.log($(this).text());
      return $(this).text().trim() == "S-1";
  }).parent().first().text();
  
  //if S-1 files aren't found. Find S-1 derivatives
  if (s_1 === '') {
    var s_1 = $('td').filter(function() {
      return $(this).text().includes("S-1");
    }).parent().first().text();
  }
 
  //find the date
  //Check all the td elemenets and cross check with the parent of s_1
  var date = $('td').filter(function() {
   return $(this).parent().text() == s_1 && $(this).text().includes((new Date()).getFullYear());
  }).text();
  
  parsedData.push(date);
  
  //loop through each link and match the parents
  $('a').each(function(i, link) {
    if($(link).parent().parent().text() == s_1 && nextURL == null) {
      nextURL = $(link).attr('href');
    } 
  });
  Logger.log("Next url:" + s_1);
  s1Page(nextURL, parsedData);
}

function s1Page(url, parsedData) {
    var s1URL = "sec.gov" + url;
    var s1Link = null;
    var options = {muteHttpExceptions: true};
    var s1HTML = UrlFetchApp.fetch(s1URL, options).getContentText();
    var $ = Cheerio.load(s1HTML);
    Logger.log("S1 page: " + s1URL);

    //find all links
    var links = $('a');
    
    //filters all td elements and finds one which has 'S-1' as text
    //return parent of that td element
    var s_1 = $('td').filter(function() {
      Logger.log($(this).text());
      if ($(this).text().trim() == "S-1" || $(this).text().includes("S-1") || $(this).text().includes("FORM S-1")) {
        return $(this).text();
      } 
    }).parent().first().text();
    
    Logger.log(s_1);

    //loop through each link and match the parents
    $(links).each(function(i, link) {
      if($(link).parent().parent().text() == s_1 && s1Link == null) {
        s1Link = $(link).attr('href');
        parsedData.push("sec.gov"+s1Link);
      } 
    });
    
    parseS1(parsedData)
}


function parseS1(parsedData) {
  Logger.log("S1 Form: " + parsedData[1]);
  var s1HTML = UrlFetchApp.fetch(parsedData[1]).getContentText();
  var $ = Cheerio.load(s1HTML);
  
  //type of tag
  var elementCollection = ['p', 'font', 'div'];
  var elementType;
  

  //check each particular entry                 
  for (i = 0; i < elementCollection.length; i++) {
    if($(elementCollection[i]).text().includes("blank check company")) {
      if($(elementCollection[i]).text().includes("renamed")) {
        parsedData.push(false);
        break;
      }
      else
      {
        parsedData.push(true);
        elementType = elementCollection[i];
        break;
      }
     
    }
  }

  if(parsedData[2]) {
    
    //for ticker symbol
    var tckerSymbol;
    
    if(elementType == "div") {
       elementType += ".para";
       var tcker = $(elementType).filter(function() {
          return $(this).text().includes("under the symbol");
      }).first().text(); 
    }
    else {
      var tcker = $(elementType).filter(function() {
          return $(this).text().includes("under the symbol") || $(this).text().includes("under the new ticker symbol");
      }).first().text();      
    }

    Logger.log(tcker);
    var tickerSymbols = new Array();
    
    if(tcker.toString().search("\"") == -1)
      recursiveTcker1(tcker.toString(), tickerSymbols);
    else
      recursiveTcker2(tcker.toString(), tickerSymbols);
    
    tickerSymbols = cleanTickerOutput(tickerSymbols);
    parsedData.push(tickerSymbols);
  }
  
  return parsedData;
}
