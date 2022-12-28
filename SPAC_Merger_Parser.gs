/*
   var api_EndPoint = https://query2.finance.yahoo.com/v10/finance/quoteSummary/{TCKER SYMBOL}?modules={modules}
   var modules = [
	'assetProfile', 'balanceSheetHistory', 'balanceSheetHistoryQuarterly', 'calendarEvents',
	'cashflowStatementHistory', 'cashflowStatementHistoryQuarterly', 'defaultKeyStatistics', 'earnings',
	'earningsHistory', 'earningsTrend', 'financialData', 'fundOwnership', 'incomeStatementHistory',
	'incomeStatementHistoryQuarterly', 'indexTrend', 'industryTrend', 'insiderHolders', 'insiderTransactions',
	'institutionOwnership', 'majorDirectHolders', 'majorHoldersBreakdown', 'netSharePurchaseActivity', 'price', 'quoteType',
	'recommendationTrend', 'secFilings', 'sectorTrend', 'summaryDetail', 'summaryProfile', 'symbol', 'upgradeDowngradeHistory',
	'fundProfile', 'topHoldings', 'fundPerformance'
    ]
*/

function test3() {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("Test");
  
  var module = 'secFilings';
  var options = {muteHttpExceptions: true};
  var api_EndPoint = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary/BMRG?modules='+module;
  var html = UrlFetchApp.fetch(api_EndPoint, options);
  var data = JSON.parse(html);
  var companyName = 'B. RILEY PRINCIPAL MERGER CORP. II';
  companyName = cleanCompanyName(companyName);


  if(data.quoteSummary.result[0] != null) {
    var filings = data.quoteSummary.result[0].secFilings.filings
    var url = "";
    var date = '';
    for(var i = 0; i < filings.length; i++) {
      if(filings[i].title.includes("Entry into a Material Definitive Agreement")) {
        url = filings[i].edgarUrl;
        date = filings[i].date;
        documentPortal(url, companyName, date);
      }
    }
  }
}

/*----------------------------------------------------------------------------------------------------------------------*/

function calendar(companyName, api_EndPoint, index) {
 
  var options = {muteHttpExceptions: true};
  var html = UrlFetchApp.fetch(api_EndPoint, options).getContentText();
  var data = JSON.parse(html);
  
  if(data.quoteSummary.result != null) {
    var filings = data.quoteSummary.result[0].secFilings.filings;
    var url = '';
    var metadata = '';
    for(var z = 0; z < filings.length; z++) {
      if(filings[z].title.includes('Entry into a Material Definitive Agreement') && !checkAlreadyParsed(filings[z].epochDate, index)) {
        url = filings[z].edgarUrl;
        metadata = String(filings[z].epochDate);
        documentPortal(url, companyName, metadata, index);
      }
    }
  }
  
}
 
function documentPortal(url, companyName, metadata, index) {
      var portal = UrlFetchApp.fetch(url).getContentText();
      var $ = Cheerio.load(portal);
      
      var document_Url;
      $('a').each(function(i, link) {
        if($(link).text() == 'FORM 8-K' || $(link).text() == 'FORM 8-K/A') {
          document_Url = cleanDocumentUrl($(link).attr('onclick'));
        }
      });
      
      if(document_Url != null) {
        parseDocumentFile(document_Url, companyName, metadata, index);
      }
}

function parseDocumentFile(url, companyName, metadata, index) {
  var document_File = UrlFetchApp.fetch('https://yahoo.brand.edgar-online.com'+url).getContentText();
  var $ = Cheerio.load(document_File);
  
  var frame_Url ='';
  $('frame').each(function(i, frameObj) {
    if($(frameObj).attr('name') == 'filing') {
      frame_Url = $(frameObj).attr('src');
    }
  });
 
  if(companyName != '' || companyName != null)
    parse8K(frame_Url, companyName, metadata, index);
}

function parse8K(url, companyName, metadata, index) {
  var fileUrl = 'https://yahoo.brand.edgar-online.com/'+url;
  var document_File = UrlFetchApp.fetch(fileUrl).getContentText();
  var $ = Cheerio.load(document_File);
  
  var paragraph = $('p').filter(function () {
    if(parseParagraph($(this).text().toString(), companyName)) {
     return $(this); 
    }
  }).first().text();
  
  if(String(paragraph).trim().length > 0) {
    populateCalendar(String(paragraph).trim(), fileUrl, companyName, metadata, index);
  }
}

function populateCalendar(parsedData, fileURL, companyName, metadata, index) {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("Calendar");
  
  ss.getRange(index,3).setValue('Y');
  ss.getRange(index+':'+index).setBackground('#00ff00');
  populateData (parsedData, fileURL, companyName, ss.getRange(index, 1).getValue(), metadata, index);
   
}

function populateData (parsedData, fileURL, companyName, ticker, metadata, index) {
  var spreadsheet = SpreadsheetApp.openById("1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0");
  var ss = spreadsheet.getSheetByName("SPAC Data");
  
  if(String(ss.getRange(index,3).getValue()).trim() == '') {
    ss.getRange(index, 1).setValue(ticker);
    ss.getRange(index, 2).setValue(companyName);
    ss.getRange(index,3).setValue(metadata);
    parsedData.replace('\n', ' ');
    ss.getRange(index,4).setValue(fileURL + '\n\n' + parsedData);
    emailTheBois(parsedData, fileURL, companyName, ticker);
  }
  else {
    var prevData = String(ss.getRange(index,3).getValue());
    ss.getRange(index,3).setValue(prevData + " " + metadata);
    prevData = String(ss.getRange(index,4).getValue());
    ss.getRange(index,4).setValue(prevData + '\n\n' + fileURL + '\n\n' + parsedData);
  }
}
