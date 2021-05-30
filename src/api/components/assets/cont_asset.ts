 import modelAsset from "../../models/mongoose/model.asset";
import {RequesterMongo} from "../../../services/requesterMongo";
import {Asset} from "../../models/interphace/asset";
import refreshAssetsPrice from "./services/refresh_assets";
 import {banLinkedPairs, unBanLinkedPairs} from "./services/ban-linked-pairs";
 import {BAN_CODE_BASE, BAN_CODE_QUOTE} from "./config_banCodes";

export const get_assets = async  (req,res,next)=>{
    try{
      const requester = new RequesterMongo(modelAsset)
      const content :{data : any,metadata? : any} = await requester.make(req.query.request)
      res.status(200).json(content)
    }
    catch (error){
      return  next(error)
    }
}

 export const get_asset = async (req,res,next)=> {
   try {
     const data : Asset = await modelAsset.findOne({name : req.params.name})
     res.status(200).json({data})
   }
   catch (error){
     return  next(error)

   }
 }


export const refresh_price = async  (req,res,next)=>{
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
  catch (error){
    return  next(error)
  }
}


export const group_assets_unreport = async  (req,res,next)=>{
  try{
    const names : string[] = req.body.data
    const prevAssets : Asset[] = await modelAsset.find({name : {$in: names }})//On recup une ref des assets avant de les modifier
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

    //On deban les paires qui avaient été ban a cause d'un asset
    const filteredNames : string[] = prevAssets.filter(asset => asset.exclusion.severity === 4).map(asset => asset.name)
    await unBanLinkedPairs(filteredNames, "base",BAN_CODE_BASE)
    await unBanLinkedPairs(filteredNames, "quote",BAN_CODE_QUOTE)

    res.status(200).json({title : 'Les assetes ont été blanchies',data : resp})
  }
  catch (error){
    return next(error)
  }
}

export const group_assets_report = async  (req,res,next)=>{
  try{
    const {assets : names ,...data} = req.body.data
    const prevAssets : Asset[] = await modelAsset.find({name : {$in: names }})//On recup une ref des assets avant de les modifier
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
    if(data.severity === 4 ){
      await banLinkedPairs(names, "base",BAN_CODE_BASE)
      await banLinkedPairs(names, "quote",BAN_CODE_QUOTE)
    }
    if(data.severity < 4 ){
      //On utilise la ref pour agir que sur les asset qui étaient ban
      const filteredNames : string[] = prevAssets.filter(asset => asset.exclusion.severity === 4).map(asset => asset.name)
      await unBanLinkedPairs(filteredNames, "base",BAN_CODE_BASE)
      await unBanLinkedPairs(filteredNames, "quote",BAN_CODE_QUOTE)
    }
    res.status(200).json({title : 'Les assets ont bien été signalés',data : resp})
  }
  catch (error){
    return next(error)
  }
}
