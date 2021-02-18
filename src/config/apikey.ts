import {Apikey} from "../api/models/interphace/apikey";
import modelApikey from "../api/models/mongoose/model.apikey";


//Recupère la clé actuellement utilisée ou la change si elle est vide
export const coinapi_key = async () : Promise<Apikey['key']> => {
  let apikey : Apikey = await modelApikey.findOne({used: true})
  if(!apikey || apikey.remaining <= 1) {
    apikey = await change_key(apikey) //Change de clé si la clé n'est pas définie ou s'il n'y a plus de requêtes
  }
  return apikey?.key
}

const change_key = async (prevkey : Apikey = null) : Promise<Apikey> => {
  if (!prevkey){
    await modelApikey.findOneAndUpdate({used : true}, {used : false})
  }
  const newkey = ( await modelApikey.find({}).sort({'remaining': -1}).limit(1)  )[0] //Recupère la meilleur clée
  if(newkey){
    await modelApikey.findOneAndUpdate({key : newkey.key},{used : true})
  }
  return newkey
}

