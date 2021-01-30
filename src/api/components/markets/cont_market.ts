import modelMarket from "../../models/mongoose/model.market";
import {RequesterMongo} from "../../../services/requesterMongo";

export const get_markets = async  (req,res,next)=>{
  try{
    const requester = new RequesterMongo(modelMarket)
    const content :{data : any,metadata? : any} = await requester.make(req.query.request)
    res.status(200).json(content)
  }
  catch (error){
    return  next(error)
  }
}

export const get_market = async (req,res,next)=> {
    modelMarket.findOne({name : req.params.name})
      .then(result=>{
          res.status(200).json(result)
      })
      .catch(error=>{
          return next(error)
      })
}

export const group_markets_unreport = async  (req,res,next)=>{
  try{
    const names : string[] = req.body.data
    const bulkMarket = names.map(name => ({
      updateOne: {
        filter: { name : name },
        update: { $set: {
            exclusion : {
              isExclude : false,
              reasons : [],
              severity : 0,
              excludeBy : null,
              note : null
            }},
        },
        option : {upsert: false}
      }}));

    const resp = await modelMarket.collection.bulkWrite(bulkMarket)
    res.status(200).json({title : 'Les markets ont été blanchis',data : resp})
  }
  catch (error){
    return next(error)
  }
}

export const group_markets_report = async  (req,res,next)=>{
  try {
    const {markets: names, ...data} = req.body.data
    const bulkMarkets = names.map(name => ({
      updateOne: {
        filter: {name: name},
        update: {
          $set: {
            exclusion: {
              isExclude: data.severity === 4,
              reasons: data.reasons,
              severity: data.severity,
              excludeBy: 'unknow',
              note: data.note || null,
              date : new Date()
            }
          },
        },
        option: {upsert: false}
      }
    }));

    const resp = await modelMarket.collection.bulkWrite(bulkMarkets)
    res.status(200).json({title: 'Les markets ont bien été signalés', data: resp})
  }
  catch (error){
    return next(error)
  }
}
