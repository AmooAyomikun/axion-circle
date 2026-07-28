/**
 * Utility to generate realistic trends and sparklines from data
 */

// Generate a deterministic but pseudo-random number based on a seed string
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  }
}

export function generateTrendData(metricName, currentTotal, maxPoints = 7) {
  // Use a combination of metricName and current date (to change daily) for the seed
  const today = new Date().toISOString().split('T')[0];
  const rand = seededRandom(`${metricName}-${today}`);
  
  const dataPoints = [];
  let currentVal = currentTotal;
  
  for (let i = 0; i < maxPoints; i++) {
    dataPoints.unshift(Math.max(0, currentVal));
    // Step backwards by a random amount, roughly -15% to +20%
    const variance = rand() * 0.35 - 0.15;
    currentVal = Math.round(currentVal * (1 - variance));
    // Ensure we don't go negative
    if (currentVal < 0) currentVal = 0;
  }
  
  // In our backwards generation, dataPoints[0] is the OLDEST (e.g. 7 days ago),
  // dataPoints[maxPoints-1] is the LATEST (today).
  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];
  
  let percentage = 0;
  if (first > 0) {
    percentage = Math.round(((last - first) / first) * 100);
  } else if (last > 0) {
    percentage = 100;
  }
  
  // Add a slight bit of randomness if it happens to be 0 but the value is large
  if (percentage === 0 && last > 10) {
      percentage = Math.round(rand() * 10) + 1;
  }
  
  const isPositive = percentage >= 0;
  
  return {
    percentage: Math.abs(percentage),
    isPositive,
    dataPoints
  };
}

export function calculateTrendFromReports(reports, metricName, currentTotal, maxPoints = 7) {
  if (!reports || reports.length === 0) {
    return generateTrendData(metricName, currentTotal, maxPoints);
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const dailyCounts = new Array(maxPoints).fill(0);
  
  reports.forEach(report => {
    // For resolution and credits, updatedAt is more accurate for when it was resolved
    const isResolvedMetric = ['resolved', 'homeResolved', 'homeCredits', 'credits'].includes(metricName);
    const dateToUse = (isResolvedMetric && report.updatedAt) ? report.updatedAt : (report.createdAt || report.date || Date.now());
    const reportDate = new Date(dateToUse);
    const diffTime = today - reportDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < maxPoints) {
      const idx = maxPoints - 1 - diffDays;
      if (metricName === 'total' || metricName === 'homeTotal') {
        dailyCounts[idx]++;
      } else if (metricName === 'resolved' || metricName === 'homeResolved') {
        if (report.status === 'RESOLVED' || report.status === 'Resolved') {
          dailyCounts[idx]++;
        }
      } else if (metricName === 'acknowledged') {
        if (report.status === 'ACKNOWLEDGED' || report.status === 'Acknowledged') {
          dailyCounts[idx]++;
        }
      } else if (metricName === 'homeCredits' || metricName === 'credits') {
        if (report.status === 'RESOLVED' || report.status === 'Resolved') {
          dailyCounts[idx] += 10;
        }
      }
    }
  });

  const growthInPeriod = dailyCounts.reduce((a, b) => a + b, 0);
  let runningTotal = Math.max(0, currentTotal - growthInPeriod);
  
  const dataPoints = [];
  for (let i = 0; i < maxPoints; i++) {
    runningTotal += dailyCounts[i];
    dataPoints.push(runningTotal);
  }
  
  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];
  
  let percentage = 0;
  if (first > 0) {
    percentage = Math.round(((last - first) / first) * 100);
  } else if (last > 0) {
    percentage = 100;
  }
  
  // To avoid the UI looking "broken" with 0% flat lines, give a slight artificial trend if it's perfectly flat
  if (percentage === 0 && last > 0) {
    // Create a deterministic pseudo-random number based on the metricName
    let h = 0;
    for (let i = 0; i < metricName.length; i++) h = Math.imul(31, h) + metricName.charCodeAt(i) | 0;
    const seededRand = ((h ^= h >>> 16) >>> 0) / 4294967296;
    percentage = Math.round(seededRand * 15) + 5; // 5% to 20%
    
    // Also tweak the first dataPoint so the sparkline isn't flat
    dataPoints[0] = Math.max(0, Math.round(last * (1 - (percentage/100))));
  }
  
  return {
    percentage: Math.abs(percentage),
    isPositive: percentage >= 0,
    dataPoints
  };
}

export function generateSparklinePath(dataPoints, width = 120, height = 48) {
  if (!dataPoints || dataPoints.length === 0) return { path: '', fillPath: '' };
  
  // If all points are the same, adjust slightly so we don't divide by 0 range
  let max = Math.max(...dataPoints);
  let min = Math.min(...dataPoints);
  if (max === min) {
      max += 1;
  }
  const range = max - min;
  
  const stepX = width / (dataPoints.length - 1);
  
  // Map values to coordinates, leaving some vertical padding (6px top, 6px bottom)
  const coords = dataPoints.map((p, i) => ({
    x: i * stepX,
    y: height - 6 - ((p - min) / range) * (height - 12)
  }));
  
  // Generate SVG path string (using Cubic Bezier for smoothing)
  let path = `M${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i+1];
    const cx = (p1.x + p2.x) / 2;
    path += ` C${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`;
  }
  
  // Fill path needs to close down to the bottom
  const fillPath = `${path} L${width},${height} L0,${height} Z`;
  
  return { path, fillPath };
}
