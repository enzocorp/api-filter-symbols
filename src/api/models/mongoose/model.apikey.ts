import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Apikey} from "../interphace/apikey";

interface IApikeyDoc extends Document,Apikey {}

const schema = new Schema({
    user_owner : {type : String, required:'Vous devez entrer le nom du propriétaire'},
    mail : {type : String},
    key : {type : String, required:"Vous devez entrer la clé d'api",unique : true },
    limit : {type : Number, required : "vous devez indiquer la limite de requetes journalieres"},
    remaining : {type : Number, required : "vous devez donner le nombre de requetes restantes"},
    dateReflow : {type : Date , required : "vous devez renseigner la date de reflow "},
    used : {type : Boolean , required : "vous devez dire si la clé est actuellement utilisée"},
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelApikey = model<IApikeyDoc>('apikeys', schema)
export default modelApikey
