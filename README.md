# SPAC-Web-Scraper
 
Google sheets: <a href="https://docs.google.com/spreadsheets/d/1XxI9r6vDtdWt6bbJhBUNzmQDU1trw8c6lqBQtjFMw-0/edit?usp=sharing" target="_blank">Link</a> <br/><br/>

## The Process
1) Scrape the <a href="https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=&type=S-1&owner=include&count=1000&action=getcurrent" target="_blank">SEC</a> website for up to 1000 companies.
2) Cross-reference the spreadsheet and discard companies that have already been parsed.
3) Check all the documents for each company and isolate their S-1 form checking to see if the form contains a reference to SPACS or black check company.
4) Recursively find their ticker symbol and update the spreadsheet
5) Loop through the parsed SPACs and use Yahoo Finance API to look for merger keywords such as 'Entry into a Material Definitive Agreement' and their 8-K forms.
6) Update spreadsheet

