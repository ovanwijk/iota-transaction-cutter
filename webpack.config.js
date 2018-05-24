const path = require('path');


var rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: ['babel-loader']
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: ['babel-loader', 'eslint-loader']
  }
]

var serverConfig = {
  mode:'development',
  target: 'node',
  entry: './src/iota-transaction-cutter.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'iota-transaction-cutter.js',
    libraryTarget: 'umd',
    library: 'iotatransactioncutter'
  },
  module: {
    rules: rules
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
    path: 'empty'
  }
  
};

var clientConfig = {
  mode:'development',
  target: 'web',
  entry: './src/iota-transaction-cutter.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'iota-transaction-cutter.web.js',
    libraryTarget: 'var',
    library: 'iotatransactioncutter'
  },
  module: {
    rules: rules
  },
  externals:[],
  node: {
    fs: 'empty',
    child_process: 'empty',
    path: 'empty'
  }
  
};



module.exports = [serverConfig, clientConfig];