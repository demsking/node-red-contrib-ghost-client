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
const helper = require("node-red-node-test-helper");
const mock = require('mock-require');

// Mock GhostAdminAPI
mock('@tryghost/admin-api', function () {
  return {
    posts: {
      delete: async () => ({}),
    }
  };
});

const ghostDeleteNode = require("../nodes/delete.js");

describe('ghost-delete Node', () => {
  beforeEach(done => helper.startServer(done));
  afterEach(done => { helper.unload(); helper.stopServer(done); });
  after(() => { mock.stopAll(); });

  it('should be loaded', done => {
    const flow = [{ id: "n1", type: "ghost-delete", name: "ghost-delete" }];
    helper.load(ghostDeleteNode, flow, () => {
      const n1 = helper.getNode("n1");
      n1.should.have.property('name', 'ghost-delete');
      done();
    });
  });

  it('should error if id is missing', done => {
    const flow = [
      { id: "n1", type: "ghost-delete", name: "ghost-delete", wires: [[], ["n2"]] },
      { id: "n2", type: "helper" }
    ];
    helper.load(ghostDeleteNode, flow, () => {
      const n2 = helper.getNode("n2");
      n2.on("input", msg => {
        msg.should.have.property('error', true);
        done();
      });
      helper.getNode("n1").receive({});
    });
  });

  // it('should output success on delete', done => {
  //   const flow = [
  //     { id: "n1", type: "ghost-delete", name: "ghost-delete", id: '123', idType: 'str', wires: [["n2"], []] },
  //     { id: "n2", type: "helper" }
  //   ];

  //   const credentials = {
  //     "GHOST_API_URL": 'http://localhost:2368',
  //     "GHOST_API_ADMIN_KEY": 'admin-key'
  //   };

  //   helper.load(ghostDeleteNode, flow, credentials, () => {
  //     const n1 = helper.getNode("n1");
  //     const n2 = helper.getNode("n2");

  //     n2.on("input", msg => {
  //       msg.should.have.property('payload');
  //       msg.payload.should.have.property('success', true);
  //       msg.payload.should.have.property('id', '123');
  //       done();
  //     });

  //     n1.receive({});
  //   });
  // });
});
