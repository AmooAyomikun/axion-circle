const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
  const audits = data.audits;
  
  console.log("Failing Audits:");
  Object.keys(audits).forEach(key => {
    const audit = audits[key];
    if (audit.score !== null && audit.score < 1 && audit.score !== undefined) {
      if (audit.details && audit.details.type === 'opportunity') {
        console.log(`- ${audit.title} (Score: ${audit.score.toFixed(2)}): Savings: ${audit.details.overallSavingsMs}ms`);
      } else {
        console.log(`- ${audit.title} (Score: ${audit.score.toFixed(2)}): ${audit.displayValue || ''}`);
      }
    }
  });
} catch (e) {
  console.error(e.message);
}
