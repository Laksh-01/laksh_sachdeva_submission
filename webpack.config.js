const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  entry: './src/background.js',  // or your main entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.AZ_AI_KEY': JSON.stringify(process.env.AZ_AI_KEY),
    }),
  ],
};
