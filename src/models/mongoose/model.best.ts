import {Document, model, Schema} from 'mongoose'
import {Best} from "../interphace/best";

interface IBestsDoc extends Document,Best {}

const schema = new Schema({
  pair : {type : String, required:"Vous devez entrer le nom de la pair"},
  quote : {type : String, required:"Vous devez entrer la quote"},
  base : {type : String, required:"Vous devez entrer la base"},
  groupId : {type : String, required: true},
  createdBy : {type : String, required : true},
  buy : {
    market : {type : String, required:"Vous devez entrer le market d'achat "},
    symbol : {type : String, required:"Vous devez entrer le Symbol du side 'achat' "},
    website : {type : String, required:"Vous devez entrer le site web d'achat"},
    price_for1kusd_quote : {type : Number, required:"Vous devez entrer le prix d'achat pour 1k $"},
    price_for15kusd_quote : {type : Number, required:"Vous devez entrer le prix d'achat pour 15k $"},
    price_for30kusd_quote : {type : Number, required:"Vous devez entrer le prix d'achat pour 30k $"},

  },
  sell : {
    market : {type : String, required:"Vous devez entrer le market de vente "},
    symbol : {type : String, required:"Vous devez entrer le Symbol du side 'vente' "},
    website : {type : String, required:"Vous devez entrer le site web d'achat"},
    price_for1kusd_quote : {type : Number, required:"Vous devez entrer la prix de vente pour 1k $"},
    price_for15kusd_quote : {type : Number, required:"Vous devez entrer le prix de vente pour 15k $"},
    price_for30kusd_quote : {type : Number, required:"Vous devez entrer le prix de vente pour 30k $"},
  },
  spread_1kusd : {
    spread_quote : {type : Number, required: true},
    spread_usd : {type : Number, required: true},
    volume_base : {type : Number, required: true},
    volume_usd : {type : Number, required: true},
  },
  spread_15kusd : {
    spread_quote : {type : Number, required: true},
    spread_usd : {type : Number, required: true},
    volume_base : {type : Number, required: true},
    volume_usd : {type : Number, required: true},
  },
  spread_30kusd : {
    spread_quote : {type : Number, required: true},
    spread_usd : {type : Number, required: true},
    volume_base : {type : Number, required: true},
    volume_usd : {type : Number, required: true},
  },

  date : {type : Date, default : ()=> new Date()},
});

let modelBest = model<IBestsDoc>('bests', schema)

export default modelBest
