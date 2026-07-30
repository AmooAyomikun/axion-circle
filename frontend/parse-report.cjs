const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('report.json', 'utf8'));
  const perf = data.categories.performance.score * 100;
  
  console.log('--- SCORE ---');
  console.log('Performance:', perf);
  
  console.log('\n--- METRICS ---');
  for (const [key, audit] of Object.entries(data.audits)) {
    if (audit.id === 'first-contentful-paint' || audit.id === 'largest-contentful-paint' || 
        audit.id === 'total-blocking-time' || audit.id === 'cumulative-layout-shift' || audit.id === 'speed-index') {
      console.log(`${audit.title}: ${audit.displayValue} (Score: ${audit.score})`);
    }
  }

  console.log('\n--- OPPORTUNITIES ---');
  for (const [key, audit] of Object.entries(data.audits)) {
    if (audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1) {
      console.log(`${audit.title}: Save ${audit.displayValue}`);
      if (audit.details.items) {
        audit.details.items.forEach(item => {
          if (item.url) {
            const url = item.url.substring(item.url.lastIndexOf('/') + 1) || item.url;
            console.log(`  - ${url} (Wasted bytes: ${item.wastedBytes || 0}, Wasted MS: ${item.wastedMs || 0})`);
          }
        });
      }
    }
  }

  console.log('\n--- DIAGNOSTICS ---');
  for (const [key, audit] of Object.entries(data.audits)) {
    if ((audit.id === 'mainthread-work-breakdown' || audit.id === 'bootup-time') && audit.score < 1) {
      console.log(`${audit.title}: ${audit.displayValue}`);
    }
  }
} catch (e) {
  console.error('Error parsing report:', e.message);
}
