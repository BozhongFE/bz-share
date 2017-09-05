const path = require('path');
const fs = require('fs');
const buble = require('rollup-plugin-buble');
const config = require('../package.json');

const exists = fs.existsSync;
const name = config.name;
const version = config.version;
let modulePath = process.env.npm_config_bz_mod;

if (typeof modulePath === 'undefined') {
  console.log('请先配置模块所在目录');
  console.log('Example: npm config set bz-mod "D:\\source"');
  throw new Error('没有配置模块路径');
} else if (!exists(modulePath)) {
  throw new Error('模块目录不存在，请检查配置的模块目录是否正确');
} else {
  modulePath = path.join(modulePath, name);
  if (!exists(modulePath)) {
    fs.mkdirSync(modulePath);
  }
  
  modulePath = path.join(modulePath, version);
  if (!exists(modulePath)) {
    fs.mkdirSync(modulePath);
  }
}

const builds = {
  'dev': {
    input: 'src/index.js',
    format: 'umd',
    moduleName: name,
    output: path.join(modulePath, name + '-debug.js')
  },
  'prod': {
    input: 'src/index.js',
    format: 'umd',
    moduleName: name,
    output: path.join(modulePath, name + '.js')
  }
};

function getConfig(opts) {
  const config = {
    input: opts.input,
    output: {
      file: opts.output,
      format: opts.format,
      name: opts.moduleName
    },
    plugins: [
      buble()
    ].concat(opts.plugins || [])
  };

  return config;
}

exports.getAllBuilds = () => Object.keys(builds).map(name => getConfig(builds[name]));
