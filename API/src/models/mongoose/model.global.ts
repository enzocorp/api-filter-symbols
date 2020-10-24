import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Average} from "../interphace/average";
import {Global} from "../interphace/global";

interface IGlobalDoc extends Document,Global {}

const schema = new Schema({
    coinapi : {
        limit : {type : String, required: true},
        remaining : {type : String, required: true},
        dateReflow : {type : String, required: true},
    }
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelGlobal = model<IGlobalDoc>('globale', schema)
export default modelGlobal
