import {Document, model, Schema} from 'mongoose'
import {Reason} from "../interphace/reason";
import uniqueValidator from "mongoose-unique-validator";

interface IReasonDoc extends Document,Reason {}

const schema = new Schema({
  status : {type : String, required:"Vous devez entrer le status", unique : true},
  for : {type : String, required:"Vous devez entrer quel type d'item est exclus"},
  description : {type : String, required:"Vous devez entrer la description"},
});

schema.plugin(uniqueValidator, {
  message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelReason = model<IReasonDoc>('reasons', schema)

export default modelReason
