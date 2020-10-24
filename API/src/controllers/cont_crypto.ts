import getExchanges from "../script/crypto/getExchanges";
import getAssets from "../script/crypto/getAssets";
import makeInitPairs from "../script/crypto/make_initPairs";
import modelPair from "../models/mongoose/model.pair";
import modelExchange from "../models/mongoose/model.exchange";
import {MongoPaginate} from "../models/interphace/pagination";
import modelGlobal from "../models/mongoose/model.global";

export  const ping = async (req,res)=> {
  try{
    console.log('-------PING RECU------------')
    res.status(200).json({title : "J'ai recu un ping", message : 'voici un message'})
  }catch (err){
    res.status(404).json({title : 'probleme', message : err.message})
  }
}
export const init_pair = async  (req, res)=>{
    try{
        let [exchanges,assets] = await Promise.all([getExchanges(),getAssets()])
        let pairs = await makeInitPairs(exchanges,assets)

        const bulkOpsPairs = pairs.map(pair => ({
            updateOne: {
                filter: { name : pair.name },
                update: { $setOnInsert: {...pair} }, //N'applqiue le contenu que sur les INSERTION !
                upsert: true                         //Ainsi les pairs déjà existante ne seront pas update
            }
        }));
        const bulkOpsExchanges = exchanges.map(exchange => ({
            updateOne: {
                filter: { id_exchange : exchange.id_exchange },
                update: { $setOnInsert: {...exchange} },
                upsert: true
            }
        }));

        let [resPairs,resExchanges] = await Promise.all([
            modelPair.collection.bulkWrite(bulkOpsPairs),
            modelExchange.collection.bulkWrite(bulkOpsExchanges)])

        res.status(200).json({resPairs, resExchanges})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}

export const get_infos_coinapi = async  (req, res)=>{
    try{
        const infos = await modelGlobal.findOne()
        res.status(200).json({data : infos})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}



export const reset_moyennes = async  (req, res)=>{
    try {
        const data = await modelPair.updateMany(
          {'exclusion.pairIsExclude' : false},
          {$set : { ifPositiveSpread : {
                      latestSpreads : [],
                      volumeMoyen : -1,
                      volumeMoyen_usd : -1,
                      spreadMoyen : -1,
                      spreadMoyen_1usd : -1,
                      spreadMoyen_15kusd : -1,
                      profitMaxiMoyen_usd : -1,
                      ecartType : -1,
                      variance : -1,
                      esperance : -1,
                      medianne : -1,
                      hightestSpread_15kusd : -1
                  }}},
          {}
        )
        res.status(200).json(data)
    }catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }

}


export const get_pairsv2 = async  (req, res)=>{
    try{
        const query : MongoPaginate =  JSON.parse(req.query.filters)
        const obj : MongoPaginate = {
            limit : Infinity,
            match : {},
            sort : {_id: 1},
            skip : 0,
            ...query
        }
        const __makedata : Array<any> = [{ $skip: obj.skip }, { $limit: obj.limit }]
        if (obj.project)
            __makedata.push({$project : obj.project})
        const aggregate : Array<any> = [
            { $match : obj.match  },
            { $sort : obj.sort },
            { $facet : {
                metadata: [ { $count: "total" }],
                data: __makedata
            }}
        ]
        if (obj.addFields)
            aggregate.splice(1, 0, {$addFields : obj.addFields})
        if (obj.lookups){
          obj.lookups.forEach((lookup,i)=>{
            aggregate.splice(i + 1, 0, {$lookup : lookup})
          })
        }
        const [data]  = await modelPair.aggregate(aggregate)

        res.status(200).json(data)
    }
    catch (err){
      console.log(err)
      res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}



export const get_pair = async (req,res)=> {
    modelPair.findOne({name : req.params.name})
      .then(result=>{
          res.status(200).json(result)
      })
      .catch(err=>{
          res.status(404).json({title : "Une erreur est survenue", message : err.message})
      })
}
