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
  const { createGhostNode, getTypedValue } = require('../lib/ghost-node-factory');

  createGhostNode({
    RED,
    nodeType: 'ghost-create',
    async handler({ node, config, msg, ghost }) {
      const payload = await getTypedValue(RED, node, msg, config.createPayload, config.createPayloadType);

      if (payload) {
        const source = await getTypedValue(RED, node, msg, config.createParamSource, config.createParamSourceType);

        msg.payload = await ghost.posts.add(payload, { source });
      } else {
        throw new Error('Post Payload is required');
      }
    }
  });
};
