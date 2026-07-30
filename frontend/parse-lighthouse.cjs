const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
  const scores = {
    Performance: data.categories.performance.score * 100,
    Accessibility: data.categories.accessibility.score * 100,
    BestPractices: data.categories['best-practices'].score * 100,
    SEO: data.categories.seo.score * 100,
  };
  console.log("Lighthouse Scores:", scores);
  
  const audits = data.audits;
  console.log("\nPerformance Metrics:");
  console.log(`FCP: ${audits['first-contentful-paint'].displayValue}`);
  console.log(`LCP: ${audits['largest-contentful-paint'].displayValue}`);
  console.log(`TBT: ${audits['total-blocking-time'].displayValue}`);
  console.log(`CLS: ${audits['cumulative-layout-shift'].displayValue}`);
  
  console.log("\nOpportunities (to improve performance):");
  Object.keys(audits).forEach(key => {
    const audit = audits[key];
    if (audit.details && audit.details.type === 'opportunity' && audit.score < 1) {
      console.log(`- ${audit.title}: saving ${audit.details.overallSavingsMs}ms`);
    }
  });

} catch (e) {
  console.error("Error parsing lighthouse report", e.message);
}
