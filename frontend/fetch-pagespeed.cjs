const https = require('https');

https.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://cleanreport-frontend.vercel.app/&strategy=mobile', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.lighthouseResult) {
        console.log("Error:", parsed);
        return;
      }
      const perf = parsed.lighthouseResult.categories.performance.score * 100;
      const metrics = parsed.lighthouseResult.audits.metrics.details.items[0];
      const diagnostics = parsed.lighthouseResult.audits.diagnostics;
      const mainthread = parsed.lighthouseResult.audits['mainthread-work-breakdown'];
      const unusedJS = parsed.lighthouseResult.audits['unused-javascript'];
      const lcp = parsed.lighthouseResult.audits['largest-contentful-paint'];
      
      console.log('Performance Score:', perf);
      console.log('Metrics:', JSON.stringify(metrics, null, 2));
      console.log('LCP Element:', lcp?.displayValue);
      console.log('Main thread work:', mainthread?.displayValue);
      if (unusedJS && unusedJS.details && unusedJS.details.items) {
          console.log('Unused JS:', unusedJS.details.items.map(i => `${i.url}: ${i.wastedBytes} bytes wasted`));
      }
    } catch(e) {
      console.error(e);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
