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
const { getTypedValue } = require('./ghost-util');

function createGhostNode({ RED, nodeType, handler }) {
  function NodeConstructor(config) {
    RED.nodes.createNode(this, config);

    const node = this;

    node.on('input', async (msg, send, done) => {
      if (msg.ghostStoreId) {
        const ghost = node.context().global.get(msg.ghostStoreId);

        if (ghost) {
          try {
            await handler({ node, config, msg, ghost });
            send(msg);
            node.status({ fill: "green", shape: "dot", text: "success" });
            done();
          } catch (error) {
            node.status({ fill: "red", shape: "ring", text: error.message || "error" });

            if ('context' in error) {
              msg.payload = {
                message: error.message,
                context: error.context,
                type: error.type,
                details: error.details,
                property: error.property,
                help: error.help,
                code: error.code,
                ghostErrorCode: error.ghostErrorCode,
                id: error.id,
              };

              send([null, msg]);
              done();
            } else {
              done(error);
              node.error(error);
            }
          }

          return;
        }
      }

      node.status({ fill: "red", shape: "ring", text: "Ghost API not configured" });
      done(new Error('Ghost API not configured'));
    });
  }

  RED.nodes.registerType(nodeType, NodeConstructor);
}

module.exports = {
  createGhostNode,
  getTypedValue,
};
