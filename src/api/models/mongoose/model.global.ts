import {model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const coinapi = {
    limit : {type : String},
    remaining : {type : String},
    dateReflow : {type : String},
}

const schema = new Schema({
    name : {type : String, required : true,enum: ['coinapi'], unique : true},
    ...coinapi,
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelGlobal = model('globals', schema)
export default modelGlobal
