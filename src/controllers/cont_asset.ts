import modelAsset from "../models/mongoose/model.asset";
import {MongoPaginate} from "../models/interphace/pagination";
import {RequesterMongo} from "../script/mongo_requester/requesterMongo";
import {Asset} from "../models/interphace/asset";
import refreshAssetsPrice from "../script/other/refresh_assets";

export const get_assets = async  (req, res)=>{
    try{
      const query : MongoPaginate = req.query.filters ? JSON.parse(req.query.filters) : null
      const aggregate = new RequesterMongo().v1(query)
      const [tabResp] : Array<{data : any, metadata : any}> = await modelAsset.aggregate(aggregate)
      const {data, metadata} = tabResp
      res.status(200).json({data, metadata})
    }
    catch (err){
      console.log(err)
      res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}

export const refresh_price = async  (req, res)=>{
  try{
    const prices = await refreshAssetsPrice()
    const bulkAssets = prices.map(price => ({
      updateOne: {
        filter: { name : price.name },
        update: { $set: {price_usd : price.price_usd},
        },
        option : {upsert: false}
      }}));

    const resp = await modelAsset.collection.bulkWrite(bulkAssets)
    console.log('ok')
    res.status(200).json({data : resp})
  }
  catch (err){
    console.log(err)
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}



export const get_asset = async (req,res)=> {
  try {
    const data : Asset = await modelAsset.findOne({name : req.params.name})
    res.status(200).json({data})
  }
  catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})

  }
}

export const group_assets_unreport = async  (req, res)=>{
  try{
    const names : string[] = req.body.list
    const bulkAsset = names.map(name => ({
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

    const resp = await modelAsset.collection.bulkWrite(bulkAsset)
    res.status(200).json({title : 'Les assets ont été blanchies',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

export const group_assets_report = async  (req, res)=>{
  try{
    const names : string[] = req.body.list
    const data = req.body.data
    const bulkAssets = names.map(name => ({
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

    const resp = await modelAsset.collection.bulkWrite(bulkAssets)
    res.status(200).json({title : 'Les assets ont bien été signalés',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}
