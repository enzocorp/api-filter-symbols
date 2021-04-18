import modelApikey from "../models/mongoose/model.apikey";
import {Apikey} from "../models/interphace/apikey";

//Permet d'envoyer les infos de la clé d'api dans le corp de la réponse
export async function coinapiLimit(req, res, next) {
  const oldSend = res.send;
  res.send = async function(data){
    try{
      const apikey : Apikey = await modelApikey.findOne({used :true}).lean()
      let arg = JSON.parse(arguments[0] || '{}')
      arguments[0] = JSON.stringify({...arg,coinapi : verifyDate(apikey)})
      oldSend.apply(res, arguments);
    }
    catch (err){
      oldSend.apply(res, arguments);
    }
  }
  next();
}

function verifyDate(apikey : Apikey) : Apikey{
  if (apikey.dateReflow.getTime() < Date.now())
    return {...apikey, dateReflow : apikey.dateReflow, remaining : apikey.limit, limit : apikey.limit}
  else
    return apikey
}
