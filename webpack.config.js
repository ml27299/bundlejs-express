const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = ({} = {}) => {
	return {
		entry: {
			index: path.resolve(__dirname, "index.js"),
		},
		target: "node",
		externals: [nodeExternals()],
		optimization: {
			minimize: false,
		},
		resolve: {
			extensions: [".mjs", ".js", ".jsx"],
		},
		mode: "production",
		output: {
			path: path.resolve("dist"),
			filename: "[name].js",
			libraryTarget: "commonjs2",
			sourceMapFilename: "[file].map",
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx|mjs)$/,
					loader: "babel-loader",
					exclude: /node_modules/,
				},
			],
		},
	};
};
