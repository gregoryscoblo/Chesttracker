exports.handler = async function(event) {
  const player = event.queryStringParameters?.player || '';
  const clan = '97donkeys';
  const request = event.queryStringParameters?.request || 'json2';
  const ts = Date.now();

  const url = request === 'json'
    ? `https://tbchestcounter.com/assets/db.php?request=json&clan=${clan}&_=${ts}`
    : `https://tbchestcounter.com/assets/db.php?request=json2&player=${encodeURIComponent(player)}&clan=${clan}&_=${ts}`;

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': `https://tbchestcounter.com/home/index.php?clan=${clan}`,
      }
    });

    const text = await resp.text();
    const jsonStart = text.indexOf('{');
    const jsonArr = text.indexOf('[');
    const start = jsonStart >= 0 && (jsonArr < 0 || jsonStart < jsonArr) ? jsonStart : jsonArr;
    const clean = start >= 0 ? text.slice(start) : text;

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
