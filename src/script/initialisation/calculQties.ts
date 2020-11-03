import modelSymbol from "../../models/mongoose/model.symbol";
import modelPair from "../../models/mongoose/model.pair";
import modelMarket from "../../models/mongoose/model.market";

async function qtieMarketsInPairs() : Promise<any[]>{
  const counts  : Array<{_id : string, markets : string[]}> = await modelSymbol.aggregate([
    {$group :{_id: "$pair", markets: { $addToSet: "$market" }}},
  ])
  return  counts.map(item => ({
    updateOne: {
      filter: { name : item._id },
      update: { $set: { marketsForThis : item.markets.length},
      },
      option : {upsert: false}
    }}))
}

async function qtiePairsInMarkets() : Promise<any[]>{
  const counts  : Array<{_id : string, pairs : string[]}>= await modelSymbol.aggregate([
    {$group :{_id: "$market", pairs: { $addToSet: "$pair" }}},
  ])
  return  counts.map(item => ({
    updateOne: {
      filter: { name : item._id },
      update: { $set: { pairsForThis : item.pairs.length},
      },
      option : {upsert: false}
    }}))
}

async function calculQties(){
  const [bulkPairs,bulkMarkets] = await Promise.all([
    qtieMarketsInPairs(),
    qtiePairsInMarkets()
  ])
  await Promise.all([
    modelPair.collection.bulkWrite(bulkPairs),
    modelMarket.collection.bulkWrite(bulkMarkets),
  ])
}

export default calculQties
