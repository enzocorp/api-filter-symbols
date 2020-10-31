import modelMarket from "../models/mongoose/model.market";
import {MongoPaginate} from "../models/interphace/pagination";
import {RequesterMongo} from "../script/mongo_requester/requesterMongo";
import modelPair from "../models/mongoose/model.pair";

export const get_markets = async  (req, res)=>{
  try{
    const query : MongoPaginate = req.query.filters ? JSON.parse(req.query.filters) : null
    const aggregate = new RequesterMongo().v1(query)
    const [tabResp] : Array<{data : any, metadata : any}> = await modelMarket.aggregate(aggregate)
    const {data, metadata} = tabResp
    res.status(200).json({data, metadata})
  }
  catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}

export const get_market = async (req,res)=> {
    modelMarket.findOne({name : req.params.name})
      .then(result=>{
          res.status(200).json(result)
      })
      .catch(err=>{
          res.status(404).json({title : "Une erreur est survenue", message : err.message})
      })
}

export const group_markets_unreport = async  (req, res)=>{
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
    res.status(200).json({title : 'Les marketes ont été blanchies',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

export const group_markets_report = async  (req, res)=> {
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
              note: data.note || null
            }
          },
        },
        option: {upsert: false}
      }
    }));

    const resp = await modelMarket.collection.bulkWrite(bulkMarkets)
    res.status(200).json({title: 'Les marketes ont bien été signalés', data: resp})
  } catch (erreur) {
    res.status(500).json({title: "Une erreur s'est produite", message: erreur.message})
  }
}
