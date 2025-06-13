# Node-RED Ghost Admin API Client Nodes

[![Buy me a beer](https://img.shields.io/badge/Buy%20me-a%20beer-1f425f.svg)](https://www.buymeacoffee.com/demsking)

A Node-RED node package providing nodes to interact with the Ghost Admin API
using the official `@tryghost/admin-api` client.

## Features

- Browse, read, create (post), edit, and delete Ghost posts
- Typed input fields for all node properties (supporting string, JSON, msg,
  flow, global)
- Two outputs for each node: success and error
- Error handling and output for all API calls
- Example flows included

## Install

From your Node-RED user directory (`~/.node-red`):

```bash
npm install node-red-contrib-ghost-client
```

## Usage

Add any of the Ghost nodes to your flow:
- **ghost-config**: Configure the Ghost Admin API client
- **ghost-browse**: Browse resources (e.g., posts, pages)
- **ghost-read**: Read a single resource by ID
- **ghost-create**: Create a new post
- **ghost-edit**: Edit an existing post
- **ghost-delete**: Delete a post

### Node Properties

Each node provides typed input fields for all required properties. See the node's help in the Node-RED editor for details and links to the [Ghost Admin API documentation](https://ghost.org/docs/admin-api/).

## Compatibility

- Requires Node.js 20+
- Compatible with Node-RED 3.x+
- Requires a Ghost site with Admin API enabled

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License.
You may obtain a copy of the License at [LICENSE](./LICENSE).
