import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Podium} from "../interphace/podium";

interface IAssetDoc extends Document,Podium {}

const schema = new Schema({
    nameBest : {type : String, required:"Vous devez entrer le nom du best concerné"},
    spread_usd : {type : Number, required:"Vous devez entrer le spread_usd"},
    groupId : {type : Number, required:"Vous devez entrer le groupId"},
    pair : {type : String, required:"Vous devez entrer le nom de la pair concernée"},
    index : {type : Number, required: "Vous devez renseigner l'index du podium"},
    date : {type : Date, default : ()=> new Date() },
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelPodium = model<IAssetDoc>('podiums', schema)
export default modelPodium
