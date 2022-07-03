// const {google} = require('googleapis');
import {google} from 'googleapis'

/**
 * Batch gets cell values from a Spreadsheet.
 * @param {string} spreadsheetId The spreadsheet ID.
 * @param {string} _ranges The mock sheet range.
 * @return {obj} spreadsheet information
 */
 async function batchGetValues(auth, spreadsheetId, _ranges) {
  const service = google.sheets({version: 'v4', auth});
  const arrayRanges = _ranges.split(',');

  let ranges = [
    ...arrayRanges
  ];

  try {
    const result = await service.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });
    console.log(`${result.data.valueRanges.length} ranges retrieved.`);
    return result;
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
    access_token: process.env.INTEGRATION_ACCESS_TOKEN,
    refresh_token: process.env.INTEGRATION_REFRESH_TOKEN
  }

  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}


const oath2Client = authorize();
const result = await batchGetValues(oath2Client, process.env.spreadsheetId, process.env._ranges);

