// Copyright 2025 Sébastien Demanou. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ==============================================================================
module.exports = (RED) => {
  const GhostAdminAPI = require('@tryghost/admin-api');
  const { getTypedValue } = require('../lib/ghost-node-factory');

  function GhostConfigNode(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    const storeId = RED.util.generateId();

    (async () => {
      const adminApiUrl = await getTypedValue(RED, node, {}, config.ghostAdminApiUrl, config.ghostAdminApiUrlType);
      const adminApiKey = await getTypedValue(RED, node, {}, config.ghostAdminApiKey, config.ghostAdminApiKeyType);
      const apiVersion = await getTypedValue(RED, node, {}, config.ghostApiVersion, config.ghostApiVersionType);

      if (adminApiKey && adminApiUrl && apiVersion) {
        node.context().global.set(storeId, new GhostAdminAPI({
          url: adminApiUrl,
          key: adminApiKey,
          version: apiVersion,
        }));
      }

      node.on('input', (msg, send, done) => {
        msg.ghostStoreId = storeId;

        if (node.context().global.get(storeId)) {
          msg.ghostApiUrl = adminApiUrl;

          node.status({ fill: "green", shape: "dot", text: "Ghost API configured" });
          send(msg);
          done();
        } else {
          node.status({ fill: "red", shape: "ring", text: "Ghost API not configured" });
          done(new Error('Ghost API not configured'));
        }
      });
    })();
  }

  RED.nodes.registerType("ghost-config", GhostConfigNode);
};
