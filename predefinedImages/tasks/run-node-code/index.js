// read environment variable file_path into filePath
const fs = require('fs');
const spawn = require('child_process').spawn;
const axios = require('axios');

const filePath = process.env.code; //+ '.js';
const dependenciesPath = process.env.dependency;// + '.json';
const resultEndpoint = process.env.RESULT_ENDPOINT;
const Aauthorization = process.env.AUTHORIZATION;


// Read function arguments from environment variables based on VARIABLE
const variables = (process.env.VARIABLES || '').split(',').map(v => process.env[v.trim()])

console.log(`Function Arguments: ${variables}`)
console.log(`Function file path: ${filePath}`);
console.log(`dependencies file path: ${dependenciesPath}`);

// File package.json will be created or overwritten by default.
fs.copyFile(dependenciesPath, './workGround/package.json', (err) => {
  if (err) throw err;

  console.log(`${dependenciesPath} was copied to package.json\n`);
  console.log('Executing npm install ...');

  // Execute npm install
  const child = spawn('npm', ['install'], { cwd: './workGround' });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', async function (data) {
    console.log(data);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', async function (data) {
    console.log(data.toString());
  });

  child.on('close', code => {
    console.log(`executing npm install finished with exit code ${code}`);
    
    // File entry.js will be created or overwritten by default.
    fs.copyFile(filePath, './workGround/entry.js', (err) => {
      if (err) throw err;
      console.log(`${filePath} was copied to entry.js`);
      const f = require('./workGround/entry.js');
      const result  = f(...variables) || {};
      console.log(result)
      try {
          axios.post(resultEndpoint, {
          status: "completed",
          return_value: {
            test: "ok",
          },
          log: result.toString()
        },{
          headers:{
            "authorization": Aauthorization
          }
        });
        console.log("tssss")
      } catch (error) {
        console.error(error.message);
      }
    });
  });
});

