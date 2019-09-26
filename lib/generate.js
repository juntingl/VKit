/**
 * 项目生成相关工具库
 * @Author: Junting.liu
 * @Date: 2019-09-25 11:43:29
 * @Last Modified by: Junting.liu
 * @Last Modified time: 2019-09-26 16:15:32
 */
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const async = require('async');
const render = require('consolidate').handlebars.render;
const path = require('path');
const getOptions = require('./options');
const ask = require('./ask');
const filter = require('./filter');

/**
 * 创建项目
 * @param {String} name 项目名
 * @param {String} src 模板所在目录
 * @param {String} dest 项目生成目录
 * @param {Function} done 创建完成后的回调
 */
function generate(name, src, dest, done) {
  // 获取模板 meta.js 中的配置信息
  const opts = getOptions(name, src);
  // 实例化 Metalsmith, 参数为其工作目录
  const metalsmith = Metalsmith(path.join(src, 'template'));
  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true
  });

  // 将模板中自定义的 helper 注册到 handlebars 中
  opts.helpers &&
    Object.keys(opts.helpers).map(key => {
      Handlebars.registerHelper(key, opts.helpers[key]);
    });

  // 给 metalsmith 绑定插件，1.收集用户交互信息 2. 过滤需要渲染的文件 3. 渲染文件
  metalsmith
    .use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles)
    .clean(false)
    .source('.')
    .destination(dest)
    .build(err => {
      done(err);
      logMessage(opts.completeMessage, data);
    });

  return data;
}

/**
 * inquirer 问题插件
 * @param {Object} prompts
 * @return {Function}
 */
function askQuestions(prompts) {
  return (files, metalsmith, done) => {
    ask(prompts, metalsmith.metadata(), done);
  };
}

/**
 * 文件过滤插件
 * @param {*} filters
 */
function filterFiles(filters) {
  return (files, metalsmith, done) => {
    filter(files, filters, metalsmith.metadata(), done);
  };
}

/**
 * 模板渲染插件
 * @param {Object}} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */
function renderTemplateFiles(files, metalsmith, done) {
  const keys = Object.keys(files);
  const metalsmithMetadata = metalsmith.metadata();
  async.each(
    keys,
    (file, next) => {
      // 文件内容转 String
      const str = files[file].contents.toString();
      // 如果文件中没有模板语法，则不对该文件进行渲染，直接输出文件内容。
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next();
      }

      // 使用数据对象对模板进行渲染
      render(str, metalsmithMetadata, (err, res) => {
        if (err) {
          err.message = `[${file}] ${err.message}`;
          return next(err);
        }
        files[file].contents = Buffer.from(res);
        next();
      });
    },
    done
  );
}

/**
 * 模板渲染完成后的提示信息
 * @param {String} message
 * @param {Object} data
 */
function logMessage(message, data) {
  if (!message) return;
  render(message, data, (err, res) => {
    if (err) {
      console.error(
        `\n    渲染模板的 “completeMessage” 时出错: ${err.message.trim}`
      );
    } else {
      console.log(
        `\n    ${res
          .split(/\r?\n/g)
          .map(line => '    ' + line)
          .join('\n')}`
      );
    }
  });
}
module.exports = generate;
