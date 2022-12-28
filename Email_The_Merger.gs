function emailTheMerger(parsedData, fileURL, companyName, ticker, index) {
  var recipients = '';
  var title = 'Come get this mulah or get sent to the gulag'
  var body = HtmlService.createTemplateFromFile('EmailBody.html');
  body.parsedData = parsedData;
  body.fileUrl = fileURL;
  body.companyName = companyName;
  body.ticker = ticker;
  
  var emailHTML = body.evaluate();
  sendEmail(recipients, title, emailHTML.getContent());
}

function sendEmail(recipients, title, content) {
  MailApp.sendEmail({
    to: recipients,
    subject: title,
    htmlBody: content
  });
}
