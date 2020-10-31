import modelPair from "../models/mongoose/model.pair";
import {MongoPaginate} from "../models/interphace/pagination";
import {RequesterMongo} from "../script/mongo_requester/requesterMongo";
import {Pair, PairFor} from "../models/interphace/pair";

export const get_pairs = async  (req, res)=>{
    try{
      const query : MongoPaginate = req.query.filters ? JSON.parse(req.query.filters) : null
      const aggregate : any[] = new RequesterMongo().v1(query)
      const [tabResp] : Array<{data : any, metadata : any}> = await modelPair.aggregate(aggregate)
      const {data, metadata} = tabResp
      res.status(200).json({data, metadata})
    }
    catch (err){
      console.log(err)
      res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}



export const get_pair = async (req,res)=> {
  try {
    const data : Pair = await modelPair.findOne({name : req.params.name})
    res.status(200).json({data})
  }
  catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})

  }
}


export const reset_moyennes_pairs = async  (req, res)=>{
  try {
    const updateFor : PairFor = {
      isBestFreq : 0,
      errorFreq : 0,
      negativeFreq : 0,
      notEnoughtVolFreq : 0,
      positiveFreq : 0,
      spreadMoyen_quote : null,
      spreadMoyen_usd : null,
      volumeMoyen_base : null,
      hightestSpread_usd : null,
    }

    const dataUpdated = await modelPair.updateMany(
      {'exclusion.isExclude' : false},
      {$set : {
        for1k : updateFor,
        for15k : updateFor,
        for30k : updateFor,
        }},
    )
    res.status(200).json({title : 'Les pairs ont été resets',data : dataUpdated})
  }catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }

}

export const group_pairs_unreport = async  (req, res)=>{
  try{
    const names : string[] = req.body.list
    const bulkPair = names.map(name => ({
      updateOne: {
        filter: { name : name },
        update: { $set: {
            exclusion : {
              isExclude : false,
              reasons : [],
              severity : null,
              excludeBy : null,
              note : null
            }},
        },
        option : {upsert: false}
      }}));

    const resp = await modelPair.collection.bulkWrite(bulkPair)
    res.status(200).json({title : 'Les paires ont été blanchies',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

export const group_pairs_report = async  (req, res)=>{
  try{
    const names : string[] = req.body.list
    const data = req.body.data
    const bulkPairs = names.map(name => ({
      updateOne: {
        filter: { name : name },
        update: { $set: {
            exclusion : {
              isExclude : data.severity === 4,
              reasons : data.reasons,
              severity : data.severity,
              excludeBy : 'unknow',
              note : data.note || ''
            }},
        },
        option : {upsert: false}
      }}));

    const resp = await modelPair.collection.bulkWrite(bulkPairs)
    res.status(200).json({title : 'Les paires ont bien été signalés',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}
