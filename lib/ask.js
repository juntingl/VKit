/**
 * 将 meta.js 中 prompts 字段所定义的为题转化为 inquirer 的问题
 * @Author: Junting.liu
 * @Date: 2019-09-25 15:50:49
 * @Last Modified by: Junting.liu
 * @Last Modified time: 2019-09-26 15:33:48
 */
const async = require('async');
const inquirer = require('inquirer');
const evaluate = require('./eval');

/**
 * 针对询问的问题，返回结果
 *
 * @param {Object} prompts questions 数组对象
 * @param {Object} data metalsmith 的 metadata对象
 * @param {Function} done metalsmith 的 done 回调
 */
module.exports = function ask(prompts, data, done) {
  // async.eachSeries 可以异步串行的方式遍历对象或数组
  async.eachSeries(
    Object.keys(prompts),
    (key, next) => {
      prompt(data, key, prompts[key], next);
    },
    done
  );
};

/**
 * 将用户的输入信息添加到 metadata 上，用来渲染 handlebars 模板。
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */
function prompt(data, key, prompt, done) {
  // 条件不满足的话跳过该问题
  if (prompt.when && !evaluate(prompt.when, data)) {
    return done();
  }

  // 如果默认值是函数类型，将函数执行结果返回
  let promptDefault = prompt.default;
  if (typeof prompt.default === 'function') {
    promptDefault = function() {
      return prompt.default.bind(this)(data); // 执行函数并返回结果
    };
  }

  inquirer
    .prompt([
      {
        type: prompt.type,
        name: key,
        message: prompt.message || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true)
      }
    ])
    .then(answers => {
      if (Array.isArray(answers[key])) {
        data[key] = {};
        answers[key].forEach(multiChoiceAnswer => {
          data[key][multiChoiceAnswer] = true;
        });
      } else if (typeof answers[key] === 'string') {
        data[key] = answers[key].replace(/"/g, '\\"');
      } else {
        data[key] = answers[key];
      }
      done();
    })
    .catch(done);
}
