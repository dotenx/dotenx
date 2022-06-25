const {google} = require('googleapis');

/**
 * Create a google spreadsheet
 * @param {object} auth OAuth2 client
 * @param {string} title Spreadsheets title
 * @return {string} Created spreadsheets ID
 */
 async function create(auth, title) {

  const service = google.sheets({version: 'v4', auth});
  const resource = {
    properties: {
      title,
    },
  };
  try {
    const spreadsheet = await service.spreadsheets.create({
      resource,
      fields: 'spreadsheetId',
    });
    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    return spreadsheet.data.spreadsheetId;
  } catch (err) {
    throw err;
  }
}

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
 function authorize() {
  const oAuth2Client = new google.auth.OAuth2();

  const token = {
    AccessToken: process.env.INTEGRATION_ACCESS_TOKEN,
    RefressToken: process.env.INTEGRATION_REFRESH_TOKEN
  }

  return oAuth2Client.setCredentials(token);
}


const oath2Client = authorize();
create(oath2Client, process.env.title);