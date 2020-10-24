import {Document, model, Schema} from 'mongoose'
import {Best} from "../interphace/best";

interface IBestsDoc extends Document,Best {}

const schema = new Schema({
  pair : {type : String, required:"Vous devez entrer le nom de la pair"},
  quote : {type : String, required:"Vous devez entrer la quote"},
  base : {type : String, required:"Vous devez entrer la base"},
  buy : {
    exchange : {type : String, required:"Vous devez entrer le market d'achat "},
    symbol_id : {type : String, required:"Vous devez entrer le Symbol_Id d'achat "},
    website : {type : String, required:"Vous devez entrer le site web d'achat"},
    price : {type : Number, required:"Vous devez entrer la valeur d'achat"},
    volume : {type : Number, required:'Vous devez entrer le buy_volume'},
    volume_usd : {type : Number, required:'Vous devez entrer le buy_volume en usd'},

    price_for1kusd_quote : {type : Number, required:"Vous devez entrer la valeur d'achat pour 1k $"},
    price_for15kusd_quote : {type : Number, required:"Vous devez entrer la valeur d'achat pour 15k $"},
    price_for30kusd_quote : {type : Number, required:"Vous devez entrer la valeur d'achat pour 30k $"},
    volume_for1kusd : {type : Number, required:'Vous devez entrer le buy_volume pour 1kusd'},
    volume_for15kusd : {type : Number, required:'Vous devez entrer le buy_volume pour 15kusd'},
    volume_for30kusd : {type : Number, required:'Vous devez entrer le buy_volume pour 30kusd'},
  },
  sell : {
    exchange : {type : String, required:'Vous devez entrer le market de vente '},
    symbol_id : {type : String, required:"Vous devez entrer le Symbol_Id de vente "},
    website : {type : String, required:"Vous devez entrer le site web de vente"},
    price : {type : Number, required:'Vous devez entrer la valeur de vente'},
    volume : {type : Number, required:'Vous devez entrer le sell_volume'},
    volume_usd : {type : Number, required:'Vous devez entrer le sell_volume en usd'},

    price_for1kusd_quote : {type : Number, required:'Vous devez entrer la valeur de vente pour 1$'},
    price_for15kusd_quote : {type : Number, required:'Vous devez entrer la valeur de vente pour 15k $'},
    price_for30kusd_quote : {type : Number, required:'Vous devez entrer la valeur de vente pour 30k $'},
    volume_for1kusd : {type : Number, required:'Vous devez entrer le sell_volume pour 1$'},
    volume_for15kusd : {type : Number, required:'Vous devez entrer le sell_volume pour 15k$'},
    volume_for30kusd : {type : Number, required:'Vous devez entrer le sell_volume pour 30k$'},
  },
  spread : {type : Number, required:'Vous devez entrer le spread'},
  volume : {type : Number, required:'Vous devez entrer le volume final'},
  volume_usd : {type : Number, required:'Vous devez entrer le volume final en USD'},
  volumeLimiteur : {type : String, required:'Vous devez indiquer le side du volume limiteur'},
  spread_1usd : {type : Number, required:'Vous devez entrer le spread pour 1k $'},
  spread_15kusd : {type : Number, required:'Vous devez entrer le spread pour 15000$'},
  profitMaxi_usd : {type : Number, required:'Vous devez indiquer le proxi maxi possible en usd'},
  date : {type : Date, default : ()=> new Date()},
  groupId : {type : String, required: true},
  _createdBy : {type : String, required : true},
});

let modelBest = model<IBestsDoc>('bests', schema)

export default modelBest
