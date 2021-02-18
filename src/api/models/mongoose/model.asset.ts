import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Asset} from "../interphace/asset";

interface IAssetDoc extends Document,Asset {}

const schema = new Schema({
    name : {type : String, required:'Vous devez entrer le nom de l`asset',unique : true},
    longName : {type : String, required:"Vous devez entrer le nom version long de l'asset"},
    price_usd : {type : Number, required:"Vous devez entrer le prix en $ de l'asset"},
    typeIsCrypto : {type : Boolean, required:"Vous devez indiquer si le type est crypto"},
    inPairCount : {type : Number, required: true},
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

let modelAsset = model<IAssetDoc>('assets', schema)
export default modelAsset
