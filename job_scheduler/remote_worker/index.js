const axios = require('axios');
const { v4: uuid } = require('uuid');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const serverUrl = process.env.SERVER_HOST;
const intervalInMilli = 1000; // 1000 milliseconds

// async function clearRedis(queue) {
//   await queue.empty();
//   await queue.clean(0, 'active');
//   await queue.clean(0, 'completed');
//   await queue.clean(0, 'delayed');
//   await queue.clean(0, 'failed');
// }

// Add jobs to queue
setInterval(async () => {
  try {
    const result = await axios.post(`${serverUrl}/queue/123456-default/job`, {
    type: "HttpCall",
    name: "test",
    image: "awrmin/utopiopshttpcall",
    executionId: "test",
    taskId: "task",
    timeout: 10,
    account_id:"123456",
    body: {
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/todos/1",
        body: {}
    }
    });
    console.log(`scheduled job: ${result.data}`);
  } catch (error) {
    console.log(error.message);
  }
}, intervalInMilli * 10);


const fetchNewJob = async () => {
  try {
    const token = uuid();
    const resp = await axios.get(`${serverUrl}/next/queue/routine_jobs/${token}`);
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
