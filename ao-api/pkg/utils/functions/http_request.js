async function httpRequest(url, headers, body, method) {
    return new Promise((resolve, reject) => {
        const options = {
            url: url,
            method: method,
            headers: headers,
            body: body,
            json: true,
            timeout: 10000
        };
        request(options, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}