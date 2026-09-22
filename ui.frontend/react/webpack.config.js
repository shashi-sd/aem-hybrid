const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const autoprefixer = require("autoprefixer");
const TSConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const buildPath = path.resolve(__dirname, "build");

const ROOT = __dirname;
const SITE_ROOT = path.resolve(ROOT, "../site/scripts");
const SITE_STYLES = path.resolve(ROOT, "../site/styles/utils/variables");

const resolveConfig = {
  extensions: [".js", ".jsx", ".ts", ".tsx"],
  alias: {
    "@calix-com": path.resolve(SITE_ROOT, "components"),
    "@styles": SITE_STYLES,
  },
  plugins: [
    new TSConfigPathsPlugin({
      configFile: "./tsconfig.json",
    }),
  ],
};

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: buildPath,
    filename: "bundle.js",
    chunkFilename: "resources/chunks/[name].[contenthash].js",
    publicPath: "/etc.clientlibs/aem-hybrid-calix/clientlibs/clientlib-react/",
  },

  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [autoprefixer()],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                includePaths: [SITE_STYLES],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "images/[hash][ext][query]",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "styles.css",
      ignoreOrder: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/resources/images"),
          to: path.resolve(__dirname, "build/resources/images"),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  resolve: resolveConfig,
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "public"),
    compress: true,
    port: 3000,
  },
};
