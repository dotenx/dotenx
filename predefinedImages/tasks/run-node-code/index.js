// read environment variable file_path into filePath
const { mkdir, writeFile } = require('fs/promises');
const fs = require('fs');
const spawn = require('child_process').spawnSync;
const axios = require('axios');
const AWS = require('aws-sdk');

exports.handler = async function (event) {

  // todo: convert this to lambda function

  console.log(`event: ${JSON.stringify(event)}`);

  const filePath = event.code;
  const dependenciesPath = event.dependency;
  const resultEndpoint = event.RESULT_ENDPOINT;
  const Aauthorization = event.AUTHORIZATION;
  const s3 = new AWS.S3();




  // Read function arguments from environment variables based on VARIABLE
  const variables = (event.VARIABLES || '').split(',').map(v => event[v.trim()])

  console.log(`Function Arguments: ${variables}`)
  console.log(`Function file path: ${filePath}`);
  console.log(`dependencies file path: ${dependenciesPath}`);


  try {
    const dir = '/tmp/workspace' // This was previously '/tmp/workspace'

    if (!fs.existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    if (!fs.existsSync(`${dir}/package.json`)) {

      const dependenciesParams = {
        Bucket: 'dotenx',
        Key: dependenciesPath
      };
      const data = await s3.getObject(dependenciesParams).promise();

      console.log('Downloading file from s3 finished');
      console.log('Writing file to workspace/package.js ...');

      // File package.json will be created or overwritten by default.
      await writeFile(`${dir}/package.json`, data.Body.toString())

      console.log(`${dependenciesPath} was stored as package.json\n`);
      console.log('Executing npm install ...');

      // Execute npm install
      try {
        const bl = await spawn('npm', ['install'], { cwd: '${dir}' });
        console.log(bl.toString());
        console.log(`executing npm install finished`);
        
      } catch (error) {
        throw new Error(bl.stderr.toString())
      }
      
    }

    if (!fs.existsSync(`${dir}/entry.js`)) {

      const params = {
        Bucket: 'dotenx',
        Key: filePath
      };

      const codeData = await s3.getObject(params).promise()
      console.log(`codeData.Body.toString(): ${codeData.Body.toString()}`);

      console.log('Downloading code file from s3 finished');
      console.log('Writing file to ${dir}/entry.js ...');

      // Write file to workspace/index.js
      await writeFile(`${dir}/entry.js`, codeData.Body.toString())

      // File entry.js will be created or overwritten by default.
    }

    console.log(`${filePath} was copied to entry.js`);
    const f = require(`${dir}/entry.js`);
    const result = f(...variables) || {};
    await axios.post(resultEndpoint, {
      status: "completed",
      return_value: result
    }, {
      headers: {
        "authorization": Aauthorization,
        "Content-Type": "application/json"
      }
    });
    console.log("result set successfully")
    return {
      successfull: true
    }

  } catch (error) {
    console.log(`error: ${error.message}`);
    process.exit(1);
  }

}

