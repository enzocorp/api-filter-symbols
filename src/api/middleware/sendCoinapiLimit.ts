import modelGlobal from "../models/mongoose/model.global";
import {Coinapi} from "../models/interphace/global";

export async function coinapiLimit(req, res, next) {
  const oldSend = res.send;
  res.send = async function(data){
    try{
      const infos : Coinapi = await modelGlobal.findOne({name :'coinapi'}).lean()
      let arg = JSON.parse(arguments[0] || '{}')
      arguments[0] = JSON.stringify({...arg,coinapi : verifyDate(infos)})
      oldSend.apply(res, arguments);
    }
    catch (err){
      oldSend.apply(res, arguments);
    }
  }
  next();
}

function verifyDate(infos : Coinapi) : Coinapi{
  if (Date.parse(infos.dateReflow) < Date.now())
    return {dateReflow : infos.dateReflow, remaining : '100', limit : '100'}
  else
    return infos
}
