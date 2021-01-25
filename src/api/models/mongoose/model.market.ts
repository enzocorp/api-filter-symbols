import {model, Schema, Document} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Market} from "../interphace/market";


interface IMarketDoc extends Document,Market {}

const schema = new Schema({
  name : {type : String, required:"Vous devez renseigner l'id de l'Exchange", unique : true},
  longName : {type : String, required:'Vous devez entrer le nom' },
  pairsCount : {type : Number, required:'Vous devez entrer le nombre de pairs' },
  website: {type : String, required:'Vous devez entrer le site web' },
  pairsForThis :{type : Number, default : 0 },
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

let modelMarket = model<IMarketDoc>('markets', schema)
export default modelMarket
