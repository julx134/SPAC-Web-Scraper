/*--------------------------------------------------SPAC Tcker-----------------------------------------------------------*/
function recursiveTcker1(paragraph, tickerSymbols) {
  var open = paragraph.search("“")+1;
  var close = paragraph.search("”");
  
  if (open == 0 || close == -1) {
    return;
  }
  else {
    tickerSymbols.push(paragraph.substring(open, close));
    recursiveTcker1(paragraph.substring(close+1), tickerSymbols); 
  } 
}

function recursiveTcker2(paragraph, tickerSymbols) {
 var open = paragraph.search("\"")+1;
 var close = paragraph.substring(open).search("\"");
 
 if(open == 0) {
 	return;
 }else {
    tickerSymbols.push(paragraph.substring(open, open+close));
 	recursiveTcker2(paragraph.substring(open+close+1),tickerSymbols)
 }
}

function cleanTickerOutput (tickerSymbols) {
  var negTickers = ['NASDAQ', 'SEC', 'NYSE'];
  
  for(var i = 0; i < negTickers.length; i++) {
    if(tickerSymbols.includes(negTickers[i]))
      tickerSymbols.splice(tickerSymbols.indexOf(negTickers[i]),1)
  }
  
  for (i = tickerSymbols.length-1; i >= 0; i--) {
    tickerSymbols[i] = tickerSymbols[i].replace(',','');
    for(var c = 0; c < tickerSymbols[i].toString().length; c++ ) {
      if(tickerSymbols[i].charAt(c).toUpperCase() != tickerSymbols[i].charAt(c)) {
        tickerSymbols.splice(i,1);
        break;
      }
    }
  }
  return tickerSymbols;
}

function checkParsed(companyName, parsedCompanyName) {
  var trimmedCompanyName = parsedCompanyName.trim().substring(0, parsedCompanyName.trim().indexOf("("));
  for(b = 0; b < companyName.length; b++) {
    if(trimmedCompanyName == companyName[b]) {
      return true;
    }
  }
  return false;  
}

/*----------------------------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------SPAC CALENDAR-------------------------------------------------------*/

function parseParagraph(paragraph, companyName) {
  var negWords = ['S-1', 'par value', 'units', 'Letter Agreement', 'warrants', 
                  'warrant', 'Private Placement Warrant Purchase Agreement', 'Underwriting Agreement,', 'IPO'
                  , 'Private Placement Shares Purchase Agreement', 'Forward Purchase Agreement'];

  if(checkMispelling(paragraph, companyName) && paragraph.includes('Agreement')) {
    for(var i = 0; i < negWords.length; i++) {
    	if(paragraph.includes(negWords[i]))
    		return false;
    }
  return true;
  }
  else {
  	return false;
  }
}

function checkMispelling(paragraph, companyName) {
  var arrayName = companyName.split(' ');
  var hitCount = 0;
  
  arrayName.forEach(function(i, element) {
    if(paragraph.includes(i)) {
      hitCount++;
    }  
  });
  
  if(hitCount >= arrayName.length-1) {
    return true;
  }
  else {
    return false;
  }
}

function cleanCompanyName(companyName) {
  if(companyName.search('Class A') > -1) {
  	return companyName.substring(0, companyName.search('Class A')).replace('-',' ').trim();
  }
  else {
    return companyName.trim();
  }
}

function formatDate(date) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var arrayDate = date.split('-');
  var day = arrayDate[2];
  var month = months[parseInt(arrayDate[1]) - 1];
  var year = arrayDate[0];
  
  return month + " " + day + ", "+ year;
}

function cleanDocumentUrl(url) {
  var open = url.indexOf('\"')+1;
  var close = url.substring(open).indexOf('\"');
  return url.substring(open,open + close);
}

function checkAlreadyParsed(metadata, i) {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("SPAC Data");
  
  var data = String(ss.getRange(i,3).getValue()).split(' ');
  
  for(var z = 0; z < data.length; z++) {
    if(parseInt(data[z]) == parseInt(metadata)) {
     return true; 
    }
  }
  return false;
}

function getMergedCompanies() {
  var url = "https://sheet2site-staging.herokuapp.com/api/v3/index.php/?key=1ataJJQSe-DMwHk5QY7vgjWB-YkXy_aFNEBnO24Juvm8&filter=closed-in-2020";
  var html = UrlFetchApp.fetch(url).getContentText();
  var $ = Cheerio.load(html);
  
  var data = [];
  
   $('td').each(function(i, element) {
    if(String($(element).text()).indexOf('(') > -1) 
     data.push($(element).text());  
  });
  
  var cleanedData = [];
  for(var i = 0; i < data.length; i++) {
    cleanTicker2(String(data[i]), cleanedData);
  }
  
  var cleanedTicker = cleanTickerOutput(cleanedData);
  cleanedTicker.splice(cleanedTicker.indexOf('GSAH'),1);
  cleanedTicker.splice(cleanedTicker.indexOf('CTAC'),1);
  cleanedTicker.splice(cleanedTicker.indexOf('VTIQ'),1);
  return cleanedTicker;
}

function cleanTicker2(data, cleanedData) {
  var open = data.indexOf("(")+1;
  var close = data.indexOf(")");
  
  if (open == 0) {
    return;
  }
  else {
    cleanedData.push(data.substring(open, close));
    recursiveTcker1(data.substring(close+1), cleanedData); 
  } 
}
/*----------------------------------------------------------------------------------------------------------------------*/



