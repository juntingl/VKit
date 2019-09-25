/**
 * 处理各种输出消息日志
 * @Author: Junting.liu
 * @Date: 2019-09-25 11:22:42
 * @Last Modified by: Junting.liu
 * @Last Modified time: 2019-09-25 17:28:41
 */

const chalk = require('chalk');
const format = require('util').format;
const prefix = "    vkit-cli";
const sep = chalk.gray('·');

exports.log = function (...args) {
  const msg = format.apply(format, args);
  console.log(chalk.white(prefix), sep, msg);
};

exports.fatal = function (...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim();
  const msg = format.apply(format, args);
  console.error(chalk.red(prefix), sep, msg);
  process.exit(1);
}

exports.success = function (...args) {
  const msg = format.apply(format, args);
  console.log(chalk.green(prefix), sep, msg);
}
