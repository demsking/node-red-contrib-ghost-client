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
async function getTypedValue(RED, node, msg, value, valueType) {
  switch (valueType) {
    case 'msg':
      return RED.util.getMessageProperty(msg, value);

    case 'flow':
      return RED.util.getObjectProperty(node.context().flow, value);

    case 'global':
      return RED.util.getObjectProperty(node.context().global, value);

    case 'env':
      return process.env[value];

    case 'json':
      return new Promise((resolve, reject) => {
        const expr = RED.util.prepareJSONataExpression(value, node);

        RED.util.evaluateJSONataExpression(expr, msg, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

    default:
      return value;
  }
}

function parseRequestParams(paramsObject) {
  return Object.entries(paramsObject).reduce((accumulator, [key, value]) => {
    if (value) {
      if (value instanceof Array) {
        if (value.length > 0) {
          accumulator[key] = value.join(',');
        }
      } else if (typeof value === 'string') {
        accumulator[key] = value;
      }
    }

    return accumulator;
  }, {});
}

module.exports = {
  getTypedValue,
  parseRequestParams,
};
