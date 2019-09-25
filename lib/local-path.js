/**
 * 判别是不是本地模板
 * @Author: Junting.liu
 * @Date: 2019-09-25 11:22:35
 * @Last Modified by: Junting.liu
 * @Last Modified time: 2019-09-25 11:42:33
 */

const path = require('path');

module.exports = {
  isLocalPath (templatePath) {
    // 判断是否是本地模板 (远程的话是一个链接)
    return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
  },
  // 获取本地模板的绝对路径
  getTemplatePath(templatePath) {
    return path.isAbsolute(templatePath) ? templatePath : path.normalize(path.join(process.cwd(), templatePath));
  }
};
