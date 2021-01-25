import modelAsset from "../../models/mongoose/model.asset";
import {RequesterMongo} from "../../../services/requesterMongo";
import {Asset} from "../../models/interphace/asset";
import refreshAssetsPrice from "./services/refresh_assets";

export const get_assets = async  (req, res)=>{
    try{
      const requester = new RequesterMongo(modelAsset)
      const content :{data : any,metadata? : any} = await requester.make(req.query.request)
      res.status(200).json(content)
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
    const names : string[] = req.body.data
    const bulkAsset = names.map(name => ({
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

    const resp = await modelAsset.collection.bulkWrite(bulkAsset)
    res.status(200).json({title : 'Les assetes ont été blanchies',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

export const group_assets_report = async  (req, res)=>{
  try{
    const {assets : names ,...data} = req.body.data
    const bulkAssets = names.map(name => ({
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

    const resp = await modelAsset.collection.bulkWrite(bulkAssets)
    res.status(200).json({title : 'Les assetes ont bien été signalés',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}
