const express = require('express');
var bodyParser = require('body-parser')
const axios = require('axios');
const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const port = process.env.PORT || 9090;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const aoApiUrl = process.env.AO_API_URL;


// A queue for the jobs scheduled based on a routine without any external requests
const routineJobsQueue = new Queue('routine_jobs', { redis: { port: redisPort, host: redisHost, lockDuration: 30000 } });
routineJobsQueue.clean(0, 'failed').then(res => { });

routineJobsQueue.on('completed', function (job, result) {
  const jobData = job.data;
  console.log(`job ${jobData.jobId} completed with result: ${JSON.stringify(result)}`)
})




// ------------ enable bull-ui -----------
const serverAdapter = new ExpressAdapter();
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(routineJobsQueue),
  ],
  serverAdapter: serverAdapter
});

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

serverAdapter.setBasePath('/admin/queues'); // An arbitrary path to serve the dashboard
app.use('/admin/queues', serverAdapter.getRouter());

app.get('/next/queue/:qname/:token', async (req, res) => {
  const { qname } = req.params;
  const worker = new Queue(qname, { redis: { port: redisPort, host: redisHost } });
  const job = await worker.getNextJob(req.params.token);
  if (!job) {
    return res.sendStatus(400);
  }
  console.log(`started processing job: ${job.id}`);
  await worker.close();
  res.send(JSON.stringify(job));
});

// move job to completed and call ao-api to trigger next tasks
app.post('/queue/:qname/job/:jobId/result', async (req, res) => {
  const { qname, jobId } = req.params;
  const { returnValue, token, result } = req.body;
  console.log(`received the result for queue: ${qname}: ${jobId} result: ${result}`);
  const worker = new Queue(qname, { redis: { port: redisPort, host: redisHost } });
  const job = await worker.getJob(jobId);
  if (!job) {
    return res.sendStatus(400)
  }
  if (result === 'completed') {
    await job.moveToCompleted(returnValue, token);
  } else {
    await job.moveToFailed(returnValue, token);
  }
  // Call AO-API with the results
  const [executionId, taskId, account_id] = [job.data.executionId, job.data.taskId, job.data.account_id];
  try {
    await axios.post(`${aoApiUrl}/execution/id/${executionId}/next`, {
      status: result,
      account_id:account_id,
      task_id:taskId
    });
    res.sendStatus(200);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
  finally {
    await worker.close();
  }
});

// Set the job returnd value and status
app.post('/queue/:qname/job/:jobId/status', async (req, res) => {
  const { qname, jobId } = req.params;
  const { status, return_value, log } = req.body;
  console.log(`received the status for queue: ${qname}: ${jobId} status: ${status}`);
  const worker = new Queue(qname, { redis: { port: redisPort, host: redisHost } });
  const job = await worker.getJob(jobId);
  if (!job) {
    return res.sendStatus(400)
  }
  // Call AO-API to set current status and returned value
  const [executionId, taskId] = [job.data.executionId, job.data.taskId];
  try {
    await axios.post(`${aoApiUrl}/execution/id/${executionId}/task/${taskId}/result`, {
      status: status,
      return_value: return_value,
      log: log
    });
    res.sendStatus(200);
    //res.sendStatus(200);
  } catch (error) {
   // console.log(`${aoApiUrl}/execution/id/${executionId}/task/${taskId}/result`);
    // todo: handle this properly
    console.error(error.message);
    res.sendStatus(500);
  }
  finally {
    await worker.close();
  }
});


// Add a new job to the queue
app.post('/queue/:qname/job', async (req, res) => {
  const { qname } = req.params;
  const payload = req.body;
  console.log(`Adding new job to queue: ${qname}`);
  //console.log(payload);
  const worker = new Queue(qname, { redis: { port: redisPort, host: redisHost } });
  addQueue(new BullAdapter(worker))
  try {
    const job = await worker.add(payload);
    await worker.close();
    const [executionId, taskId] = [job.data.executionId, job.data.taskId];
    try {
      await axios.post(`${aoApiUrl}/execution/id/${executionId}/task/${taskId}/result`, {
        status: "waiting",
        return_value:"",
        log:""
      });
      console.log(`${aoApiUrl}/execution/id/${executionId}/task/${taskId}/result`)
      res.send({
        jobId: job.id
      });
    } catch (error) {
      console.error(error.message);
      res.sendStatus(500);
    }

  } catch (error) {
    console.error(error.message);
    res.sendStatus(500)
  }
});


app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
});

