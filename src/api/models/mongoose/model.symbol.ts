import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Symbol} from "../interphace/symbol";

interface ISymbolDoc extends Document,Symbol {}

const schema = new Schema({
    name : {type : String, required:'Vous devez entrer le nom du symbole',unique : true},
    market : {type : String, required:'Vous devez entrer le nom du market'},
    pair : {type : String, required:'Vous devez entrer le nom de la pair'},
    symbolCoinapi : {type : String, required:'Vous devez entrer le symbole CoinApi'},
    base : {type : String, required:'Vous devez entrer la base'},
    quote : {type : String, required:'Vous devez entrer la quote'},
    isfor : {type : Object, required : true},
    date : {type : Date, default : ()=> new Date() },
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelSymbol = model<ISymbolDoc>('symbols', schema)
export default modelSymbol
