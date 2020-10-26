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
    sell : {
        frequence :{type : Number, required : true},
        prixMoyen_for1kusd_quote :{type : Number, required : true},
        prixMoyen_for15kusd_quote :{type : Number, required : true},
        prixMoyen_for30kusd_quote :{type : Number, required : true},
    },
    buy : {
        frequence :{type : Number, required : true},
        prixMoyen_for1kusd_quote :{type : Number, required : true},
        prixMoyen_for15kusd_quote :{type : Number, required : true},
        prixMoyen_for30kusd_quote :{type : Number, required : true},
    },
    exclusion : {
        isExclude : {type : Boolean, default : false},
        reasons : [{type : String, required : 'Vous devez renseigner aumoins 1 raison'}],
        severity : {type: Number, required : 'vous devez entrer la severité'},
        excludeBy : {type: String, required : 'vous devez entrer le nom du commenditaire'},
        note : {type: String, default : ''},
        date : {type : Date}
    },
    date : {type : Date, default : ()=> new Date() },
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelSymbol = model<ISymbolDoc>('symbols', schema)
export default modelSymbol
