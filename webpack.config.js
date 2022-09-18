const path = require("path");

module.exports = {
	entry: "./src/main.ts",
	output: {
		path: path.resolve(__dirname + "/dist/"),
		filename: "./main.js"
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	watch: true,
	mode: "production"
}