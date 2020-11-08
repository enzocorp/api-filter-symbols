import findMarkets from "../script/initialisation/findMarkets";
import findAssets from "../script/initialisation/findAssets";
import makeInitPairs from "../script/initialisation/makePairs";
import modelPair from "../models/mongoose/model.pair";
import modelMarket from "../models/mongoose/model.market";
import modelGlobal from "../models/mongoose/model.global";
import modelReason from "../models/mongoose/model.reason";
import modelSeverity from "../models/mongoose/model.severity";
import {Reason} from "../models/interphace/reason";
import findSymbols from "../script/initialisation/findSymbols";
import modelSymbol from "../models/mongoose/model.symbol";
import modelAsset from "../models/mongoose/model.asset";
import doubleFilter from "../script/initialisation/doubleFilter";
import {Pair} from "../models/interphace/pair";
import {Asset} from "../models/interphace/asset";
import patchMiss from "../script/initialisation/patchMissing";
import {Market} from "../models/interphace/market";
import {Best} from "../models/interphace/best";
import modelBest from "../models/mongoose/model.best";

export const ping = async (req,res)=> {
  try{
    console.log('-------PING RECU------------')
    res.status(200).json({title : "J'ai recu un ping", message : 'voici un message'})
  }catch (err){
    res.status(404).json({title : 'probleme', message : err.message})
  }
}

const best : Best = {
    name : 'BTC_USD_1604010537241',
    pair: 'BTC_USD',
    quote: 'USD',
    base: 'BTC',
    createdBy: 'unknow',
    groupId: '1604010537241',
    for1k: {
        buy: {
            market: 'LMAXDIGITALUAT',
            symbol: 'LMAXDIGITALUAT_BTC_USD',
            website: 'https://www.lmaxdigital.com/',
            volume_base: 0.07406628799218742,
            price_quote: 2547,
        },
        sell: {
            market: 'COINBASE',
            symbol: 'COINBASE_BTC_USD',
            website: 'https://pro.coinbase.com/',
            volume_base: 0.07406628799218742,
            price_quote: 3573,
        },
        spread_quote: null,
        spread_usd: null,
    },
    for15k: {
        buy: {
            market: 'LMAXDIGITALUAT',
            symbol: 'LMAXDIGITALUAT_BTC_USD',
            website: 'https://www.lmaxdigital.com/',
            volume_base: 1.1109943198828114,
            price_quote: 13475.7,
        },
        sell: {
            market: 'COINBASE',
            symbol: 'COINBASE_BTC_USD',
            website: 'https://pro.coinbase.com/',
            volume_base: 1.1109943198828114,
            price_quote: 13481.3683385973,
        },
        spread_quote: 5.60833859737977,
        spread_usd: 5.6083385973797,
    },
    for30k: {
        buy: {
            market: 'LMAXDIGITALUAT',
            symbol: 'LMAXDIGITALUAT_BTC_USD',
            website: 'https://www.lmaxdigital.com/',
            volume_base: 2.2219886397656228,
            price_quote: 13475.7,
        },
        sell: {
            market: 'COINBASE',
            symbol: 'COINBASE_BTC_USD',
            website: 'https://pro.coinbase.com/',
            volume_base: 2.2219886397656228,
            price_quote: 13478.72459808534,
        },
        spread_quote: 2.964598085347461,
        spread_usd: 2.96459808534746,
    },
}


export const test1 = async  (req, res)=>{
    try{
        await modelBest.insertMany([best])
        res.status(200).json('OkoK')
    }
    catch (erreur){
        res.status(500).json({title : "Erreur est survenue", message : erreur.message})
    }

}

export const test2 = async  (req, res)=>{
    try{
        const infos = await modelGlobal.findOne({name :'coinapi'})
        res.status(200).json({data : infos})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}


export const test3 = async  (req, res)=>{
    try{
        const queryParam = req.query.for ? {for : req.query.for} : {}
        const reasons = await modelReason.find(queryParam)
        res.status(200).json(reasons)
    }
    catch (erreur){
        res.status(500).json({title : "Erreur est survenue", message : erreur.message})
    }

}

export const test4 = async  (req, res)=>{
    try{
        let [tempMarkets,tempAssets] = await Promise.all([
            findMarkets(),
            findAssets()
        ])
        let symbols = await findSymbols(tempMarkets,tempAssets)
        let [missAssets,missMarkets] = await patchMiss(tempMarkets,tempAssets,symbols)

        let [[assets,markets],pairs] : [[Asset[],Market[]],Pair[]] = await Promise.all([
            doubleFilter(symbols,tempAssets.concat(missAssets),tempMarkets.concat(missMarkets)),
            makeInitPairs(symbols)
        ])
        const createBulk = async (items : Array<{name : string} & any>) => items.map(item => ({
            updateOne: {
                filter: { name : item.name },
                update: { $setOnInsert: {...item} },
                upsert: true
            }
        })); //Seul les INSERTION seront traitées grace au "$setOnInsert"!

        const [bulkOpsPairs,bulkOpsMarkets,bulkOpsAssets,bulkOpsSymbols] = await Promise.all([
            createBulk(pairs),
            createBulk(markets),
            createBulk(assets),
            createBulk(symbols)
        ])
        const [resPairs,resMarkets,resSymbols,resAssets] = await Promise.all([
            modelPair.collection.bulkWrite(bulkOpsPairs),
            modelMarket.collection.bulkWrite(bulkOpsMarkets),
            modelSymbol.collection.bulkWrite(bulkOpsSymbols),
            modelAsset.collection.bulkWrite(bulkOpsAssets),
        ])
        res.status(200).json({title : 'Initialisation effectuée avec succès',data : {resPairs, resMarkets,resSymbols,resAssets}})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}
