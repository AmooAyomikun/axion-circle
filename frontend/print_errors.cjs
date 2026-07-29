const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./new_report.json', 'utf8'));
const errors = data.audits['errors-in-console'];
if (errors && errors.details && errors.details.items) {
  console.log(errors.details.items);
} else {
  console.log('No console errors found in report.');
}
