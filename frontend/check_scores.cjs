const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('./new_report.json', 'utf8'));
  const scores = {
    performance: data.categories.performance.score * 100,
    accessibility: data.categories.accessibility.score * 100,
    bestPractices: data.categories['best-practices'].score * 100,
    seo: data.categories.seo.score * 100
  };
  
  console.log('Lighthouse Scores:');
  console.log(`Performance: ${scores.performance}`);
  console.log(`Accessibility: ${scores.accessibility}`);
  console.log(`Best Practices: ${scores.bestPractices}`);
  console.log(`SEO: ${scores.seo}`);
  
  if (scores.performance >= 95 && scores.accessibility >= 95 && scores.bestPractices >= 95 && scores.seo >= 95) {
    console.log('SUCCESS: All scores are >= 95%');
  } else {
    console.log('WARNING: Some scores are < 95%');
  }
} catch (e) {
  console.error('Error reading report', e);
}
