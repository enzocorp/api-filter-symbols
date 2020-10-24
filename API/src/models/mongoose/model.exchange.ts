import {model, Schema, Document} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Exchange} from "../interphace/exchange";


interface IExchangeDoc extends Document,Exchange {}

const schema = new Schema({
  id_exchange : {type : String, required:"Vous devez renseigner l'id de l'Exchange", unique : true},
  name : {type : String, required:'Vous devez entrer le nom' },
  symbolsCount : {type : Number, required:'Vous devez entrer le nom' },
  website: {type : String, required:'Vous devez entrer le site web' },
  exclusion : {
    exchangeIsExclude : {type : Boolean, default : false},
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

let modelExchange = model<IExchangeDoc>('exchange', schema)
export default modelExchange
