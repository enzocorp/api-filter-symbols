import modelPair from "../../models/mongoose/model.pair";
import {RequesterMongo} from "../../../services/requesterMongo";
import {Pair, PairFor} from "../../models/interphace/pair";

export const get_pairs = async  (req, res)=>{
    try{
      const requester = new RequesterMongo(modelPair)
      const content :{data : any,metadata? : any} = await requester.make(req.query.request)
      res.status(200).json(content)
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
    const names : string[] = req.body.data
    const bulkPair = names.map(name => ({
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

    const resp = await modelPair.collection.bulkWrite(bulkPair)
    res.status(200).json({title : 'Les paires ont été blanchies',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

export const group_pairs_report = async  (req, res)=>{
  try{
    const {pairs : names ,...data} = req.body.data
    const bulkPairs = names.map(name => ({
      updateOne: {
        filter: { name : name },
        update: { $set: {
            exclusion : {
              isExclude : data.severity === 4,
              reasons : data.reasons,
              severity : data.severity,
              excludeBy : 'unknow',
              note : data.note || null,
              date : new Date()
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
