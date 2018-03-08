require('dotenv').config();
const chalk = require('chalk');
const vsts = require('vso-node-api');

let collectionUrl = process.env.COLLECTION_URL;
let token = process.env.TOKEN;
if (!token || !collectionUrl) {
  console.error('TOKEN or COLLECTION_URL env var not set.');
  process.exit(1);
}

let authHandler = vsts.getPersonalAccessTokenHandler(token);
let connect = new vsts.WebApi(collectionUrl, authHandler);

const FIELD_REMAINING = 'Microsoft.VSTS.Scheduling.RemainingWork';
const FIELD_ORIGINAL = 'Microsoft.VSTS.Scheduling.OriginalEstimate';
const FIELD_COMPLETED = 'Microsoft.VSTS.Scheduling.CompletedWork';

// console logs times with nice colors
function printTimes (workItem) {
  let { fields } = workItem;
  let wut = val => val === undefined ? chalk.red('?') : val;
  console.info(chalk.blue('original: ' + wut(fields[FIELD_ORIGINAL])));
  console.info(chalk.yellow('remaining: ' + wut(fields[FIELD_REMAINING])));
  console.info(chalk.green('completed: ' + wut(fields[FIELD_COMPLETED])));
}

// returns promise
function setHours (workApi, taskId, fieldName, hours) {
  // there is an updateField, but that updates the field metadata only
  // getting that metadata: `workApi.getField('Microsoft.VSTS.Scheduling.OriginalEstimate', 'PROJECT');`
  return workApi.updateWorkItem(null, [
    {
      op: 'add',
      path: `/fields/${fieldName}`,
      value: hours
    }
  ], taskId);
}

async function run () {
  let args = process.argv.slice(2);
  let isReadOnly = args.length < 2;

  if (!args.length || /^(-h|--help|\/?)$/.test(args[0])) {
    console.info(
      'params:\n1. [taskId] = read times\n' +
      '2. [taskId] [+N] = log N hours of work, increases completed, decreases remaining\n' +
      '3. [taskId] [N] = explicitly set completed to N\n' // +
      // '4. [taskId] [close] (N) = close a task and set completed to N, remaining to 0'
    );
    return;
  }

  let taskId = args[0] || 0;
  let workApi = await connect.getWorkItemTrackingApi();
  let workItem = await workApi.getWorkItem(taskId, null, null, 4);

  if (!workItem || !workItem.fields) {
    console.error('Task not found error.');
    process.exit(1);
  }

  if (isReadOnly) {
    printTimes(workItem);
    process.exit(0);
  }

  // log time: + for relative, raw number for overwrite
  // +1 = add 1 hour to completed
  // 1 = set completed explicitly to 1 hour
  if (args[1] !== undefined) {
    let hours = parseInt(args[1], 10);
    let isRelative = args[1].startsWith('+');
    let completed = +(workItem.fields[FIELD_COMPLETED] || 0);
    let remaining = workItem.fields[FIELD_REMAINING];
    completed = isRelative ? (completed + hours) : hours;
    await setHours(workApi, taskId, FIELD_COMPLETED, completed);
    if (isRelative && remaining !== undefined) {
      remaining = Math.max(+remaining - hours, 0);
      await setHours(workApi, taskId, FIELD_REMAINING, remaining);
    }
    workItem = await workApi.getWorkItem(taskId, null, null, 4);
    printTimes(workItem);
  }
}

run();
