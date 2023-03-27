import { defineConfig } from "cypress";

import webpackConfig from './webpack.client.config';

export default defineConfig({
  video: false,
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig
    },
  },
});
