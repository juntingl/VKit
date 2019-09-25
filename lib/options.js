/**
 * 读取模板文件中 meta.js 的数据，并设置默认的项目名
 * @Author: Junting.liu
 * @Date: 2019-09-25 15:37:29
 * @Last Modified by: Junting.liu
 * @Last Modified time: 2019-09-25 15:51:06
 */
const exists = require('fs').existsSync;
const path = require('path');

module.exports = function options(name, dir) {
  // 读取 meta.js 文件
  const opts = getMetaData(dir);
  // 设置默认的项目名
  setDefault(opts, "name", name);
  return opts;
};

/**
 * 从项目模板的 meta.js 中读取数据
 * @param {*} dir
 * @returns
 */
function getMetaData(dir) {
  const js = path.join(dir, 'meta.js');
  let opts = {};

  if (exists(js)) {
    const req = require(path.resolve(js));
    if (req !== Object(req)) {
      throw new Error("meta.js needs to expose an object");
    }
    opts = req;
  }
  return opts;
}

/**
 * 为 opts.prompts 中的问题设置默认值
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */
function setDefault(opts, key, val) {
  const prompts = opts.prompts || (opts.prompts = {});

  if (!prompts[key] || typeof prompts[key] !== "object") {
    prompts[key] = {
      type: "string",
      default: val
    };
  } else {
    prompts[key]['default'] = val;
  }
}
