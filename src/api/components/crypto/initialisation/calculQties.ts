import modelSymbol from "../../../models/mongoose/model.symbol";
import modelPair from "../../../models/mongoose/model.pair";
import modelMarket from "../../../models/mongoose/model.market";


//Calcul la qté de market présent pour une paire
async function qtyMarketsForPair() : Promise<any[]>{
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

//Calcul la qté de paires présentes dans un market
async function qtyPairsInMarket() : Promise<any[]>{
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

//Pour chaque market et paire, calcul la qté de paire/market présent dans le/la market/pair
async function calculQties(){
  const [bulkPairs,bulkMarkets] = await Promise.all([
    qtyMarketsForPair(),
    qtyPairsInMarket()
  ])
  await Promise.all([
    modelPair.collection.bulkWrite(bulkPairs),
    modelMarket.collection.bulkWrite(bulkMarkets),
  ])
}

export default calculQties
