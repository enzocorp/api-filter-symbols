import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Pair} from "../interphace/pair";

interface IPairDoc extends Document,Pair {}

const schema = new Schema({
    name : {type : String, required:'Vous devez entrer le nom',unique : true},
    base : {type : String, required:'Vous devez entrer la base'},
    quote : {type : String, required:'Vous devez entrer la quote'},
    exchanges : [{
        id :  {type : String, required:"Vous devez renseigner l'id de l'exchange"},
        symbol_id :  {type : String, required:"Vous devez renseigner l'id du symbole "},
    }],
    frequences : {
        positive : {type : Number, default : 0},
        negative : {type : Number, default : 0},
        isBest : {type : Number, default : 0},
    },
    ifPositiveSpread : {
        volumeMoyen :{type : Number, required : true},
        volumeMoyen_usd :{type : Number, required : true},
        spreadMoyen :{type : Number, required : true},
        spreadMoyen_1usd :{type : Number, required : true},
        spreadMoyen_15kusd :{type : Number, required : true},
        profitMaxiMoyen_usd :{type : Number, required : true},
        ecartType : {type : Number,required : true},
        variance : {type : Number, required : true},
        esperance : {type : Number,required : true},
        medianne : {type : Number, required : true},
        hightestSpread_15kusd : {type : Number, required : true},
    },
    exclusion : {
        pairIsExclude : {type : Boolean, required : true},
        fromMarkets : [{
            market : {type: String, required : 'vous devez entrer le market dans lequel est exclus la pair'},
            reasons : [{type : String, required : 'Vous devez renseigner aumoins 1 raison'}],
            severity : {type: Number, required : 'vous devez entrer la severité'},
            excludeBy : {type: String, required : 'vous devez entrer le nom du commenditaire'},
            note : {type: String, default : ''},
            date : {type : Date, default : ()=> new Date() }
        }],
    },
    date : {type : Date, default : ()=> new Date() },
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides car la valeur de " {PATH} " doit être unique dans la base de données !'
})

let modelPair = model<IPairDoc>('pair', schema)
export default modelPair
