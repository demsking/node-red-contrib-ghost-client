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
      edit: async () => ({ id: '123', title: 'Updated' }),
    }
  };
});

const ghostEditNode = require("../nodes/edit.js");

describe('ghost-edit Node', () => {
  beforeEach(done => helper.startServer(done));
  afterEach(done => { helper.unload(); helper.stopServer(done); });
  after(() => { mock.stopAll(); });

  it('should be loaded', done => {
    const flow = [{ id: "n1", type: "ghost-edit", name: "ghost-edit" }];
    helper.load(ghostEditNode, flow, () => {
      const n1 = helper.getNode("n1");
      n1.should.have.property('name', 'ghost-edit');
      done();
    });
  });

  it('should error if id is missing', done => {
    const flow = [
      { id: "n1", type: "ghost-edit", name: "ghost-edit", wires: [[], ["n2"]] },
      { id: "n2", type: "helper" }
    ];
    helper.load(ghostEditNode, flow, () => {
      const n2 = helper.getNode("n2");
      n2.on("input", msg => {
        msg.should.have.property('error', true);
        done();
      });
      helper.getNode("n1").receive({ postData: { title: "Test" } });
    });
  });

  it('should error if postData is missing', done => {
    const flow = [
      { id: "n1", type: "ghost-edit", name: "ghost-edit", wires: [[], ["n2"]] },
      { id: "n2", type: "helper" }
    ];
    helper.load(ghostEditNode, flow, () => {
      const n2 = helper.getNode("n2");
      n2.on("input", msg => {
        msg.should.have.property('error', true);
        done();
      });
      helper.getNode("n1").receive({ id: "123" });
    });
  });

  // it('should output updated post on success', done => {
  //   const flow = [
  //     { id: "n1", type: "ghost-edit", name: "ghost-edit", id: '123', idType: 'str', postData: '{"title":"Updated"}', postDataType: 'json', wires: [["n2"], []] },
  //     { id: "n2", type: "helper" }
  //   ];
  //   helper.load(ghostEditNode, flow, () => {
  //     const n2 = helper.getNode("n2");
  //     n2.on("input", msg => {
  //       msg.should.have.property('payload');
  //       msg.payload.should.have.property('id', '123');
  //       msg.payload.should.have.property('title', 'Updated');
  //       done();
  //     });
  //     helper.getNode("n1").receive({});
  //   });
  // });
});
