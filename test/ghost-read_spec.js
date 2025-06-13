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
const helper = require('node-red-node-test-helper');
const mock = require('mock-require');
const path = require('path');

require('should');

const ghostApiMock = {
  posts: {
    read: async () => ({ id: '123', title: 'Read' }),
  }
};

mock('@tryghost/admin-api', () => {
  return function () {
    return ghostApiMock;
  };
});

const ghostReadNode = require(path.resolve(__dirname, '../nodes/read.js'));

helper.init(require.resolve('node-red'));

describe('ghost-read Node', () => {
  before(done => {
    helper.startServer(done);
  });

  after(done => {
    helper.stopServer(done);
  });

  afterEach(() => {
    helper.unload();
  });

  it('should load node properly', async () => {
    const flow = [
      {
        id: 'n1',
        type: 'ghost-read',
        name: 'Test Read',
        readId: '123',
        readIdType: 'str',
        readParamSource: '["html","lexical"]',
        readParamSourceType: 'json',
        readParamFields: '["id","title"]',
        readParamFieldsType: 'json',
        readParamInclude: '["tags"]',
        readParamIncludeType: 'json'
      }
    ];
    await helper.load(ghostReadNode, flow);
    const n1 = helper.getNode('n1');
    n1.should.have.property('name', 'Test Read');
  });

  it('should send post payload on success', done => {
    const flow = [
      {
        id: 'n1',
        type: 'ghost-read',
        name: 'Success Case',
        readId: '123',
        readIdType: 'str',
        readParamSource: 'html',
        readParamSourceType: 'str',
        readParamFields: 'id,title',
        readParamFieldsType: 'str',
        readParamInclude: 'authors',
        readParamIncludeType: 'str',
        wires: [['n2'], ['n3']]
      },
      { id: 'n2', type: 'helper' },
      { id: 'n3', type: 'helper' }
    ];

    helper.load(ghostReadNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n2 = helper.getNode('n2');

      const ctx = n1.context().global;
      ctx.set('storeId', ghostApiMock);

      n2.on('input', msg => {
        msg.should.have.property('payload');
        msg.payload.should.have.property('id', '123');
        msg.payload.should.have.property('title', 'Read');
        done();
      });

      n1.receive({ _msgid: '1', payload: {}, ghostStoreId: 'storeId' });
    });
  });

  it('should catch error when msg.ghostStoreId is missing', done => {
    const flow = [
      {
        id: 'n1',
        type: 'ghost-read',
        name: 'Missing Store ID',
        readId: '123',
        readIdType: 'str',
        readParamSource: '["html"]',
        readParamSourceType: 'json',
        readParamFields: '["id"]',
        readParamFieldsType: 'json',
        readParamInclude: '[]',
        readParamIncludeType: 'json',
        wires: [[], []]
      },
      {
        id: 'n2',
        type: 'catch',
        scope: ['n1'],
        wires: [['n3']]
      },
      { id: 'n3', type: 'helper' }
    ];

    helper.load(ghostReadNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n3 = helper.getNode('n3');

      n3.on('input', msg => {
        msg.should.have.property('error');
        msg.error.message.should.match(/Ghost API not configured/);
        done();
      });

      n1.receive({ _msgid: '2', payload: {} });
    });
  });

  it('should catch error when context global has no API instance', done => {
    const flow = [
      {
        id: 'n1',
        type: 'ghost-read',
        name: 'Invalid Store',
        readId: '123',
        readIdType: 'str',
        readParamSource: '["html"]',
        readParamSourceType: 'json',
        readParamFields: '["id"]',
        readParamFieldsType: 'json',
        readParamInclude: '[]',
        readParamIncludeType: 'json',
        wires: [[], []]
      },
      {
        id: 'n2',
        type: 'catch',
        scope: ['n1'],
        wires: [['n3']]
      },
      { id: 'n3', type: 'helper' }
    ];

    helper.load(ghostReadNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n3 = helper.getNode('n3');

      const ctx = n1.context().global;
      ctx.set('ghostX', null);

      n3.on('input', msg => {
        msg.should.have.property('error');
        msg.error.message.should.match(/Ghost API not configured/);
        done();
      });

      n1.receive({ _msgid: '3', payload: {}, ghostStoreId: 'ghostX' });
    });
  });

  it('should catch API read error', done => {
    const failingMock = {
      posts: {
        read: async () => {
          throw new Error('Read failed');
        }
      }
    };

    const flow = [
      {
        id: 'n1',
        type: 'ghost-read',
        name: 'Throw Error',
        readId: '123',
        readIdType: 'str',
        readParamSource: '["lexical"]',
        readParamSourceType: 'json',
        readParamFields: '["id"]',
        readParamFieldsType: 'json',
        readParamInclude: '[]',
        readParamIncludeType: 'json',
        wires: [[], []]
      },
      {
        id: 'n2',
        type: 'catch',
        scope: ['n1'],
        wires: [['n3']]
      },
      { id: 'n3', type: 'helper' }
    ];

    helper.load(ghostReadNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n3 = helper.getNode('n3');

      const ctx = n1.context().global;
      ctx.set('ghostFail', failingMock);

      n3.on('input', msg => {
        msg.should.have.property('error');
        msg.error.message.should.match(/Read failed/);
        done();
      });

      n1.receive({ _msgid: '4', payload: {}, ghostStoreId: 'ghostFail' });
    });
  });
});
