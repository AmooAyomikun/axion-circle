const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./new_report.json', 'utf8'));

console.log('Render-blocking resources:');
const renderBlocking = data.audits['render-blocking-resources'];
if (renderBlocking && renderBlocking.details && renderBlocking.details.items) {
  renderBlocking.details.items.forEach(item => {
    console.log(`- ${item.url} (wasted: ${item.wastedMs}ms)`);
  });
}

console.log('\nMain-thread work breakdown:');
const mainThread = data.audits['mainthread-work-breakdown'];
if (mainThread && mainThread.details && mainThread.details.items) {
  mainThread.details.items.forEach(item => {
    console.log(`- ${item.groupLabel}: ${item.duration}ms`);
  });
}
