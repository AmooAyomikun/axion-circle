const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
  const lcp = data.audits['largest-contentful-paint-element'];
  if (lcp && lcp.details && lcp.details.items && lcp.details.items.length > 0) {
    console.log("LCP Element:", lcp.details.items[0].node.snippet);
  } else {
    console.log("Could not find LCP element detail");
  }
} catch (e) {
  console.error(e.message);
}
