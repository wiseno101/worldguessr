let mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: {
		type: String,
	},
    username: {
		type: String,
		required: [true, 'Please enter in your name'],
        min: 3,
		max: 100,
        unique: true
	},
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        min: 4,
        max: 100,
    },
	email:{
		type: String,
		required: [true, 'Please enter an email'],
        min: 3,
		max: 100,
        unique: true
	},
	stories_read:{
        type: [String]
    },
    endings_achieved:{
        type: [String]
    }
    },
);
const userCol=mongoose.model('User', userSchema)

module.exports = userCol;