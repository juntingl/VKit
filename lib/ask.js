/**
 * 将 meta.js 中 prompts 字段所定义的为题转化为 inquirer 的问题
 * @Author: Junting.liu
 * @Date: 2019-09-25 15:50:49
 * @Last Modified by: Junting.liu
 * @Last Modified time: 2019-09-25 16:06:20
 */
const async = require('async');
const inquirer = require('inquirer');
const evaluate = require('.eval');

module.exports = function ask(prompts, data, done) {
  // async.eachSeries 可以异步串行的方式遍历对象或数组
  async.eachSeries(
    Object.keys(prompt),
    (key, next) => {
      prompt(data, key, prompts[key], next);
    },
    done
  );
};

function prompt(data, key, prompt, done) {
  // 条件不满足的话跳过该问题
  if (prompt.when && !evaluate(prompt.when, data)) {
    return done();
  }

  // 如果默认值是函数类型，将函数执行结果返回
  let promptDefault = prompt.default;
  if (typeof prompt.default === 'function') {
    promptDefault = function() {
      return prompt.default.bind(this)(data);
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
        data[key] = answers[key];
      }
      done();
    })
    .catch(done);
}
