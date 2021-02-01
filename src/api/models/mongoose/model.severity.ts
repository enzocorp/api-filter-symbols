import {Document, model, Schema} from 'mongoose'
import {Severity} from "../interphace/severity";

interface ISeverityDoc extends Document,Severity {}

const schema = new Schema({
  severity : {type : Number, min: 1, max: 4, required:"Vous devez entrer la severitée"},
  description : {type : String, required:"Vous devez entrer la description"},
});

let modelSeverity = model<ISeverityDoc>('severities', schema)

export default modelSeverity
