import {Document, model, Schema} from 'mongoose'
import {Best} from "../interphace/best";

interface IBestsDoc extends Document,Best {}

const schema = new Schema({
  name : {type : String, required:'Vous devez entrer le nom du Best ',unique : true},
  pair : {type : String, required:"Vous devez entrer le nom de la pair"},
  quote : {type : String, required:"Vous devez entrer la quote"},
  base : {type : String, required:"Vous devez entrer la base"},
  groupId : {type : String, required: true},
  createdBy : {type : String, required : true},
  isfor : {type : Object, required : true},
  date : {type : Date, default : ()=> new Date()},
});

let modelBest = model<IBestsDoc>('bests', schema)

export default modelBest
