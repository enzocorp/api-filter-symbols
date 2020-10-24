import modelExchange from "../models/mongoose/model.exchange";
import {MongoPaginate} from "../models/interphace/pagination";
import modelPair from "../models/mongoose/model.pair";

export const get_markets = async  (req, res)=>{
  try{
    const query : MongoPaginate = JSON.parse(req.query.filters)
    const obj : MongoPaginate = {
      limit : Infinity,
      match : {},
      sort : {_id: 1},
      skip : 0,
      ...query
    }
    const __makedata : Array<any> = [{ $skip: obj.skip }, { $limit: obj.limit }]
    if (obj.project)
      __makedata.push(obj.project)
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

    const [data]  = await modelExchange.aggregate(aggregate)

    res.status(200).json(data)
  }
  catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}


export const get_podiumpairs = async  (req, res)=>{
  try{

    const market = req.params.id
    const sort : 'positionBuy' | 'positionSell' = req.query?.sort || 'positionBuy'
    const moyenne = req.query.moyenne

    if (!moyenne)
      throw 'Il faut préciser la moyenne a comparer'

    const data = await modelPair.aggregate([
      { $match: {"exchanges.id" : market}},
      { $lookup: {
          from: "averages",
          let : {exid : "$name"},
          pipeline : [
            { $match: { $expr: { $eq: [ "$$exid", "$pair" ] }} },
            { $sort: {["buy." + moyenne] : 1}},
          ],
          as: "bestsBuyMarkets"
        }},
      { $lookup: {
          from: "averages",
          let : {exid : "$name"},
          pipeline : [
            { $match: { $expr: { $eq: [ "$$exid", "$pair" ] }} },
            { $sort: {["sell." + moyenne] : -1}},
          ],
          as: "bestsSellMarkets"
        }},
      { $addFields: {positionBuy : {$indexOfArray: [ "$bestsBuyMarkets.exchange" , market]}}},
      { $addFields: {positionSell : {$indexOfArray: [ "$bestsSellMarkets.exchange" , market]}}},
      { $project : {bestsSellMarkets : 0 , bestsBuyMarkets : 0}},
      { $sort : {[sort]: 1}}
    ])
    res.status(200).json(data)
  }catch(err){
    console.log(err)
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }

}

/*
export const get_marketsv2 = async  (req, res)=>{
  try{
    const filters = req.query.filters
    const {limit = Infinity ,skip = 0,...query} : MongoPaginatev2 = filters ?
      JSON.parse(req.query.filters) : {};

    let aggregate : Array<any> = []
    const dataFacet : Array<any> = [{ $skip: skip}, { $limit: limit }]

    if(query.aggregate)
      aggregate = query.aggregate
    if(query.facet){
      dataFacet.push(...query.facet)
    }
    aggregate.push({$facet : {
        metadata: [ { $count: "total" }],
        data: dataFacet
      }})

    const [data]  = await modelExchange.aggregate(aggregate)

    res.status(200).json(data)
  }
  catch (err){
    console.log(err)
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}
*/

export const get_market = async (req,res)=> {
    modelExchange.findOne({id_exchange : req.params.id})
      .then(result=>{
          res.status(200).json(result)
      })
      .catch(err=>{
          res.status(404).json({title : "Une erreur est survenue", message : err.message})
      })
}

export const reset_moyennes = async (req,res)=> {
  try {
    const data = await modelExchange.updateMany(
      {'exclusion.exchangeIsExclude' : false},
      {$set : { isBestFor : [] }},
      {}
    )
    res.status(200).json(data)
  }catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}
