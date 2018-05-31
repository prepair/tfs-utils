require('dotenv').config();
const chalk = require('chalk');
const columnify = require('columnify');
const vsts = require('vso-node-api');

const MAX_BUILDS_PER_DEFINITION = 1;

let collectionUrl = process.env.COLLECTION_URL;
let token = process.env.TOKEN;
if (!token || !collectionUrl) {
  console.error('TOKEN or COLLECTION_URL env var not set.');
  process.exit(1);
}

let authHandler = vsts.getPersonalAccessTokenHandler(token);
let connect = new vsts.WebApi(collectionUrl, authHandler);

async function run () {
  const project = process.env.PROJECT;
  const definitions = process.env.DEFINITIONS;

  if (!project || !definitions) {
    console.error('PROJECT or DEFINITIONS env var not set.');
    process.exit(1);
  }

  const buildApi = await connect.getBuildApi();
  const builds = await buildApi.getBuilds(
    process.env.PROJECT,
    process.env.DEFINITIONS.split(','),
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    MAX_BUILDS_PER_DEFINITION
  );

  const data = builds.map(build => ({
    name: chalk.magenta(build.definition.name),
    updated: chalk.green(build.lastChangedDate.toLocaleString()),
    branch: chalk.blue(build.buildNumber)
  }));

  const columns = columnify(data);

  console.log(columns);
}

run();
