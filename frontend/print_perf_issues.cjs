const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('./new_report.json', 'utf8'));
  const audits = data.audits;
  
  console.log('--- Top Performance Opportunities ---');
  
  // Sort audits by potential savings (only those with numeric savings)
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.details.overallSavingsMs > 0)
    .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs);
    
  opportunities.forEach(opp => {
    console.log(`- ${opp.title}: Saves ${opp.details.overallSavingsMs}ms`);
  });
  
  console.log('\n--- Diagnostics ---');
  const diagnostics = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'table' && audit.score !== null && audit.score < 1)
    .sort((a, b) => a.score - b.score);
    
  diagnostics.forEach(diag => {
    console.log(`- ${diag.title} (Score: ${diag.score})`);
    if(diag.displayValue) console.log(`  Value: ${diag.displayValue}`);
  });

} catch (e) {
  console.error('Error reading report', e);
}
