# TFS utils

All utils are callable via npm or directly:

- direct call: `node src/foo TASKID`
- npm wrapper: `npm run foo -- TASKID`

## tfs api

- [official docs](https://docs.microsoft.com/en-us/rest/api/vsts/)
- [nodejs wrapper](https://github.com/Microsoft/vsts-node-api)

## env vars

- `TOKEN`: your tfs api token, can be found in tfs profile dropdown / security
- `COLLECTION_URL`: something like "http://wdsvdpxtfs06.webdev-foobar.local:8080/tfs/DefaultCollection_2017"

## executables

### parent

- get the topmost parent of a task
- usage: `node src/parent TASKID`

### time

- log time
- usage:
  - `node src/time 12345` - print times for task id 12345
  - `node src/time 12345 +5` - add 5 hours to completed, subtract it from remaining (if remaining has been set)
  - `node src/time 12345 5` - explicitly set completed to 5 hours, will not change the remaining field
  - **TODO:** close task
