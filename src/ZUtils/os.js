let os = {};

os.getFileExtension = fileName => {
	const ext = /^.+\.([^.]+)$/.exec(fileName);
	return ext == null ? '' : ext[1];
};

os.basename = fileName => {
	return fileName.replace(/\\/g,'/').replace( /.*\//, '' );
};

os.dirname = fileName => {
	return fileName.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
};

export default os;