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
  for1k : {
    buy : {
      market : {type : String, required:"Vous devez entrer le market d'achat 1k $"},
      symbol : {type : String, required:"Vous devez entrer le Symbol d'achat 1k $"},
      website : {type : String, required:"Vous devez entrer le site web d'achat 1k $"},
      price_quote : {type : Number, default : null},
      volume_base : {type : Number, default : null},
    },
    sell : {
      market : {type : String, required:"Vous devez entrer le market de vente 1k $"},
      symbol : {type : String, required:"Vous devez entrer le Symbol de vente 1k $"},
      website : {type : String, required:"Vous devez entrer le site web de vente 1k $"},
      price_quote : {type : Number, default : null},
      volume_base : {type : Number, default : null},
    },
    spread_quote : {type : Number, default : null},
    spread_usd : {type : Number, default : null},
  },
  for15k : {
    buy : {
      market : {type : String, required:"Vous devez entrer le market d'achat 15k $"},
      symbol : {type : String, required:"Vous devez entrer le Symbol d'achat 15k $"},
      website : {type : String, required:"Vous devez entrer le site web d'achat 15k $"},
      price_quote : {type : Number, default : null},
      volume_base : {type : Number, default : null},
    },
    sell : {
      market : {type : String, required:"Vous devez entrer le market de vente 15k $"},
      symbol : {type : String, required:"Vous devez entrer le Symbol de vente 15k $"},
      website : {type : String, required:"Vous devez entrer le site web de vente 15k $"},
      price_quote : {type : Number, default : null},
      volume_base : {type : Number, default : null},
    },
    spread_quote : {type : Number, default : null},
    spread_usd : {type : Number, default : null},
  },
  for30k : {
    buy : {
      market : {type : String, required:"Vous devez entrer le market d'achat 30k $"},
      symbol : {type : String, required:"Vous devez entrer le Symbol d'achat 30k $"},
      website : {type : String, required:"Vous devez entrer le site web d'achat 30k $"},
      price_quote : {type : Number, default : null},
      volume_base : {type : Number, default : null},
    },
    sell : {
      market : {type : String, required:"Vous devez entrer le market de vente 30k $"},
      symbol : {type : String, required:"Vous devez entrer le Symbol de vente 30k $"},
      website : {type : String, required:"Vous devez entrer le site web de vente 30k $"},
      price_quote : {type : Number, default : null},
      volume_base : {type : Number, default : null},
    },
    spread_quote : {type : Number, default : null},
    spread_usd : {type : Number, default : null},
  },
  date : {type : Date, default : ()=> new Date()},
});

let modelBest = model<IBestsDoc>('bests', schema)

export default modelBest
