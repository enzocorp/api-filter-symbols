import modelGlobal from "../models/mongoose/model.global";

export async function coinapiLimit(req, res, next) {
  const oldSend = res.send;

  res.send = async function(data){
    try{
      const {coinapi} = await modelGlobal.findOne({name : 'coinapi'})
      let arg = JSON.parse(arguments[0])
      arguments[0] = JSON.stringify({...arg,coinapi})
      oldSend.apply(res, arguments);
    }
    catch (err){
      oldSend.apply(res, arguments);
    }
  }
  next();
}

