const fs = require('fs');

const path = require('path');

const buildConfig = require('./build_config');

const deleteFolderRecursive = (path) => {

    let files = [];

    if( fs.existsSync(path) ) {

        files = fs.readdirSync(path);

        files.forEach(function(file,index){

            const curPath = path + "/" + file;

            if(fs.statSync(curPath).isDirectory()) { // recurse

                deleteFolderRecursive(curPath);

            } else { // delete file

                fs.unlinkSync(curPath);

            }

        });

        fs.rmdirSync(path);

    }

};

(() => {
	const argvs = process.argv.splice(2);

	let webpackCommonConfig = buildConfig(false);
	if(argvs[0] === "server") {
		webpackCommonConfig = buildConfig(true);
		deleteFolderRecursive(path.resolve(__dirname, '../dist'));
	}

	const configJS = [
		"exports.WEB_ROOT = './';",
		"exports.PUBLIC_PATH = exports.WEB_ROOT + 'dist/';",
        `exports.IS_DEBUG = ${argvs[0] === "server" ? false : true};`
	];

	fs.writeFileSync('../src/config.js', configJS.join('\n'));

	fs.writeFileSync('webpack.config.js', webpackCommonConfig);
})();