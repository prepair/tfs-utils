require('dotenv').config();
let vsts = require('vso-node-api');

let collectionUrl = process.env.COLLECTION_URL;
let token = process.env.TOKEN;
let exitCode = 0;

if (!token || !collectionUrl) {
  console.error('TOKEN or COLLECTION_URL env var not set.');
  process.exit(1); // see: `'return' outside of function` vs (semi)standard
}

process.on('exit', () => process.reallyExit(exitCode));

let authHandler = vsts.getPersonalAccessTokenHandler(token);
let connect = new vsts.WebApi(collectionUrl, authHandler);

function getParentId (workItems) {
  let rels = workItems.relations;
  let parent = rels ? rels.find(rel => rel.rel === 'System.LinkTypes.Hierarchy-Reverse') : false;
  if (!parent) {
    return 0;
  }
  let match = parent.url.match(/workItems\/(\d+)/);
  return match && match[1] ? +match[1] : 0;
}

async function getParent (forId) {
  let workApi = await connect.getWorkItemTrackingApi();
  let workItem = await workApi.getWorkItem(forId, null, null, 4);
  let parentId = workItem ? getParentId(workItem) : null;
  if (!parentId) {
    return workItem;
  } else {
    return getParent(parentId);
  }
}

async function run () {
  let id = process.argv[2] || 0;
  let parent = await getParent(id);
  if (parent) {
    let fields = parent.fields;
    console.info('topmost parent: #' + parent.id + ' - ' + fields['System.Title']);
  } else {
    console.error('parent or task not found.');
    exitCode = 1;
  }
}

run();
