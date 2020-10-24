import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Average} from "../interphace/average";

interface IAverageDoc extends Document,Average {}

const schema = new Schema({
    symbole_id : {type : String, required:'Vous devez entrer le nom',unique : true},
    exchange : {type : String, required:'Vous devez entrer le nom'},
    pair : {type : String, required:'Vous devez entrer le nom'},
    best : {
        sell1k : {type : Number, required : true},
        sell15k : {type : Number, required : true},
        sell30k : {type : Number, required : true},
        buy1k : {type : Number, required : true},
        buy15k : {type : Number, required : true},
        buy30k : {type : Number, required : true},
    },
    sell : {
        frequence :{type : Number, required : true},
        prixMoyen_for1kusd_quote :{type : Number, required : true},
        prixMoyen_for15kusd_quote :{type : Number, required : true},
        prixMoyen_for30kusd_quote :{type : Number, required : true},
        volumeMoyen_for1kusd :{type : Number, required : true},
        volumeMoyen_for15kusd :{type : Number, required : true},
        volumeMoyen_for30kusd :{type : Number, required : true},

    },
    buy : {
        frequence :{type : Number, required : true},
        prixMoyen_for1kusd_quote :{type : Number, required : true},
        prixMoyen_for15kusd_quote :{type : Number, required : true},
        prixMoyen_for30kusd_quote :{type : Number, required : true},
        volumeMoyen_for1kusd :{type : Number, required : true},
        volumeMoyen_for15kusd :{type : Number, required : true},
        volumeMoyen_for30kusd :{type : Number, required : true},

    },
    date : {type : Date, default : ()=> new Date() },
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelAverage = model<IAverageDoc>('average', schema)
export default modelAverage
