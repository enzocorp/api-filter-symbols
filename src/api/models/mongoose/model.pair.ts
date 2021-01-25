import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import {Pair} from "../interphace/pair";

interface IPairDoc extends Document,Pair {}

const schema = new Schema({
    name : {type : String, required:'Vous devez entrer le nom',unique : true},
    base : {type : String, required:'Vous devez entrer la base'},
    quote : {type : String, required:'Vous devez entrer la quote'},
    marketsForThis : {type : Number, default : 0},
    for1k : {
        positiveFreq :{type : Number, required : true},
        negativeFreq :{type : Number, required : true},
        isBestFreq :{type : Number, required : true},
        notEnoughtVolFreq :{type : Number, required : true},
        errorFreq :{type : Number, required : true},

        spreadMoyen_quote :{type : Number, required : true},
        spreadMoyen_usd :{type : Number, required : true},
        volumeMoyen_base :{type : Number, required : true},
        hightestSpread_usd : {type : Number, required : true},
    },
    for15k : {
        positiveFreq :{type : Number, required : true},
        negativeFreq :{type : Number, required : true},
        isBestFreq :{type : Number, required : true},
        notEnoughtVolFreq :{type : Number, required : true},
        errorFreq :{type : Number, required : true},

        spreadMoyen_quote :{type : Number, required : true},
        spreadMoyen_usd :{type : Number, required : true},
        volumeMoyen_base :{type : Number, required : true},
        hightestSpread_usd : {type : Number, required : true},
    },
    for30k : {
        positiveFreq :{type : Number, required : true},
        negativeFreq :{type : Number, required : true},
        isBestFreq :{type : Number, required : true},
        notEnoughtVolFreq :{type : Number, required : true},
        errorFreq :{type : Number, required : true},

        spreadMoyen_quote :{type : Number, required : true},
        spreadMoyen_usd :{type : Number, required : true},
        volumeMoyen_base :{type : Number, required : true},
        hightestSpread_usd : {type : Number, required : true},
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

let modelPair = model<IPairDoc>('pairs', schema)
export default modelPair
