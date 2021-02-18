import modelReason from "../../models/mongoose/model.reason";
import {Best} from "../../models/interphace/best";
import modelBest from "../../models/mongoose/model.best";
import {COINAPI_URL} from "../../../config/globals";
import axios from "axios";

export const ping = async (req,res,next)=> {
    try {
        console.log('-------PING RECU------------')
        res.status(200).json({title: "J'ai recu un ping", message: 'voici un message'})
    } catch (error) {
        return next(error)
    }
}

const best : Best = {
    name : 'BTC_USD_1604010537241',
    pair: 'BTC_USD',
    quote: 'USD',
    base: 'BTC',
    createdBy: 'unknow',
    groupId: '1604010537241',
    isfor  : {
        200: {
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
        400: {
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
        600: {
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
}


export const test1 = async  (req,res,next)=>{
    try{
        await modelBest.insertMany([best])
        res.status(200).json('OkoK')
    }
    catch (error){
        return next(error)
    }

}

export const test2 = async  (req,res,next)=>{
    try{
        res.status(200).json({data : "yoyo"})
    }
    catch (error){
        res.status(500).json({title : "Une error lors de l'init est survenue", message : error.message})
    }

}


export const test3 = async  (req,res,next)=>{
    try{
        const queryParam = req.query.for ? {for : req.query.for} : {}
        const reasons = await modelReason.find(queryParam)
        res.status(200).json(reasons)
    }
    catch (error){
        return next(error)
    }

}

export const test4 = async  (req,res,next)=>{
    try{
        let {data} = await axios.get(`${COINAPI_URL}/v1/assets/BTC`)
        console.log("okay")
        res.status(200).json({ok : "salut salut", data})
    }
    catch (error){
        return  next(error)
    }

}
