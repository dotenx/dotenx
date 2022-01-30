const axios = require('axios');
const { v4: uuid } = require('uuid');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const serverUrl = 'http://localhost:9090'
const intervalInMilli = 1000; // 1000 milliseconds


const fetchNewJob = async () => {
  try {
    const token = uuid();
    const resp = await axios.get(`${serverUrl}/next/${token}`);
    if (!resp) return;
    const newJob = resp.data;
    console.log(`newJob: ${JSON.stringify(newJob)}`);
    await delay(100);
    const result = Math.random() > 0.5 ? 'failed' : 'completed';
    await axios.post(`${serverUrl}/queue/routine_jobs/job/${newJob.id}/result`, {
      token,
      returnValue: {
        r: Math.random() * 100,
      },
      result
    });
  } catch (error) {
    console.log(error.message);
  }
}


setInterval(fetchNewJob, intervalInMilli * 10);
