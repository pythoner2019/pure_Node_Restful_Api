const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const lib = {};
lib.baseDir = path.join(__dirname, '/../.data/');


lib.create = (dir, file, data, callback) => {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			const stringData = JSON.stringify(data);

			fs.writeFile(fileDescriptor, stringData, (err) => {
				if (!err) {
					fs.close(fileDescriptor, (err) => {
						if (!err) {
							callback(false);
						} else {
							callback('Error closing new File');
						}
					});
				} else {
					callback('Error Writing to new file');
				}
			})
		} else {
			callback('could not create new file, it may exist');
		}
	})	
}


lib.read = (dir, file, callback) => {
	fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
		if (!err && data) {
			let parsedData = helpers.parseJsonToObject(data);
			callback(false, parsedData);
		} else {
			callback(err, data);
		}
	});
};


lib.update = (dir, file, data, callback) => {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			const stringData = JSON.stringify(data);

			fs.truncate(fileDescriptor, (err) => {
				if (!err) {
					fs.writeFile(fileDescriptor, stringData, (err) => {
						if (!err) {
							fs.close(fileDescriptor, (err) => {
								if (!err) {
									callback(false)
								} else {
									callback('error closing existing file');
								}
							})
						} else {
							callback('Error writing to existing file')
						}
					})
				} else {
					callback('Error truncating file');
				}
			})
		} else {
			callback('could not open file for update, it may not existing yet');
		}
	})
}


lib.delete = (dir, file, callback) => {
	fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
		if (!err) {
			callback(false);
		} else {
			callback('Error deleting file');
		}
	})
}



module.exports = lib;







