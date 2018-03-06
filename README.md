# TFS utils

## env vars

- `TOKEN`: your tfs api token, can be found in tfs profile dropdown / security
- `COLLECTION_URL`: something like "http://wdsvdpxtfs06.webdev-foobar.local:8080/tfs/DefaultCollection_2017"

## executables

### parent

- get the topmost parent of a task
- usage: `node src/parent TASKID` or `npm run parent -- TASKID`
