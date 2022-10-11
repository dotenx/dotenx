const https = require('https');
module.exports = async function httpRequest(url, headers, body, method) {
  switch (method) {
    case 'GET':
      return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(data);
          });
        }).on('error', (err) => {
          reject(err);
        });
      });
    case 'POST':
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
      var parsedUrl = require('url').parse(url);
      const data = body ? JSON.stringify(body) : '';

      var options = {
        hostname: parsedUrl.host,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method,
        headers: {
          ...headers,
          ...(data ? { 'Content-Length': data.length } : {}),
        }
      };

      console.log(JSON.stringify(options, null, 2))

      return new Promise((resolve, reject) => {
        var req = https.request(options, (res) => {

          res.on('data', (d) => {
            process.stdout.write(d);
            resolve(d);
          });
        });

        req.on('error', (e) => {
          console.error(e);
          reject(e)
        });

        req.write(data);
        req.end();
      })
  }
}

