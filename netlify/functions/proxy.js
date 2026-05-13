const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://tbchestcounter.com/home/index.php?clan=97donkeys',
        'Accept': 'application/json, text/plain, */*',
        'Cookie': 'clan=97donkeys',
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

exports.handler = async function(event) {
  const player = event.queryStringParameters?.player || '';
  const clan = '97donkeys';
  const request = event.queryStringParameters?.request || 'json2';
  const ts = Date.now();

  const url = request === 'json'
    ? `https://tbchestcounter.com/assets/db.php?request=json&clan=${clan}&_=${ts}`
    : `https://tbchestcounter.com/assets/db.php?request=json2&player=${encodeURIComponent(player)}&clan=${clan}&_=${ts}`;

  try {
    const text = await httpsGet(url);

    // Strip PHP warnings and find JSON
    const jsonStart = text.indexOf('[');
    const objStart = text.indexOf('{');
    let start = -1;
    if (jsonStart >= 0 && objStart >= 0) start = Math.min(jsonStart, objStart);
    else if (jsonStart >= 0) start = jsonStart;
    else if (objStart >= 0) start = objStart;

    const clean = start >= 0 ? text.slice(start) : text;

    // Validate JSON
    try { JSON.parse(clean); } catch(e) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid JSON from source', raw: text.slice(0, 500) }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: clean,
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
