function updateSPACS() {
  var options = {muteHttpExceptions: true};
  var url = "https://sec.report/Document/Search/?fromDate=2021-04-02&formType=S-1&page=12";
  var html = UrlFetchApp.fetch(url, options).getContentText();
  var $ = Cheerio.load(html);

  var rowData = $('tr');

  

  $(rowData).each(function(i, row) {
    //Logger.log($(row).find('a').attr('href'));
    //Logger.log($(row).find('small').text());
    
    var date = $(row).find('td').filter(function() {
      return $(this).text().includes((new Date()).getFullYear());

    }).text();
  
    Logger.log(date);
  });

  //find all the links
  var links = $('a');

/*
  //only get the S-1 links (there are other links within the page)
  $(links).each(function(i, link){
    if($(link).text().includes('S-1'))
      //Logger.log($(link).attr('href'));
  });
  */
}
