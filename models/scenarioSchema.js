const mongoose = require('mongoose');

// Define schema for the story collection
const scenarioSchema = new mongoose.Schema({
    _id: {
type:String
    },
    story_name:{
        type: String
    },
    story_page:{
        type:Number
    },
    scenario:{
        type:String
    },
    choices: {
type :  [Number]
    }
}
);

// Create and export the Story model
const Scenario = mongoose.model('Scenario', scenarioSchema);
module.exports = Scenario;
