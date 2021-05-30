import axios from 'axios'
import modelSymbol from "../../../../models/mongoose/model.symbol";
import makePrices from "./makePrices";
import {Asset} from "../../../../models/interphace/asset";
import modelAsset from "../../../../models/mongoose/model.asset";
import updateSymbols from "./updateSymbols";
import {Market} from "../../../../models/interphace/market";
import modelMarket from "../../../../models/mongoose/model.market";
import makeBests from "./makeBests";
import {Best} from "../../../../models/interphace/best";
import {Symbol} from "../../../../models/interphace/symbol";
import {Pair} from "../../../../models/interphace/pair";
import updatePairs from "./updatePairs";
import makePodium from "./makePodium";
import debuger from "debug";
import {COINAPI_URL} from "../../../../../config/globals";
import {Price} from "../../../../models/interphace/price";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../../config_bests";
import ErrorsGenerator from "../../../../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";
import {Podium} from "../../../../models/interphace/podium";
import modelOrderbook from "../../../../models/mongoose/model.orderbook";

interface orderbook {
  symbol_id: string
  asks: Array<{
    price: number
    size: number
  }>
  bids: Array<{
    price: number
    size: number
  }>
}


interface axiosResponse {
  data? : orderbook[],
  isAxiosError : boolean,
  response? : {
    status : number,
    statusText : string,
    data : any
  },
}

const aggregateSymbols = [
  {$match: {"exclusion.isExclude" : false}},
  {$lookup: {
      from: "pairs",
      localField: "pair",
      foreignField: "name",
      as: "pair"
    }
  },
  {$lookup: {
      from: "markets",
      localField: "market",
      foreignField: "name",
      as: "market"
    }
  },
  {$unwind: "$pair"},
  {$unwind: "$market"},
  {$match: {"market.exclusion.isExclude" : false, "pair.exclusion.isExclude" : false}},
  {$group : {
      _id : "$pair.name",
      symbs : { $push: "$symbolCoinapi" }
  }},
]

const debug = debuger("api:index-calcul")


//Incrémente de +1 la pté "isBestFreq" sur la meilleur pair de chaque categorie de prix (100, 200, 400 ...)
async function awardPairs(pairs: Pair[], podium: Podium[]) : Promise<Pair[]> {
  let pairsCopy : Pair[] = [...pairs]
  podium.forEach(item => {
    if(item?.index){
      const index : number = pairs.findIndex(pair => pair.name === item.pair)
      if (index !== -1)
        ++pairsCopy[index].isfor[item.index].isBestFreq
      else
        debug(`-----ERREUR : Le best "${item.index}" de '${podium[item.index]}' n'as pa pue être attribué----`)
    }
  })
  return pairsCopy
}


//Incrémente de +1 la pté "isBestFreq" sur le meilleur market de chaque symbole qui a été positif (100, 200, 400 ...)
async function awardMarkets (symbols : Symbol[],  bests : Best[]) : Promise<Symbol[]>{
  bests.forEach(best => {
    for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
      let indexBuy : number = symbols.findIndex(symb => symb.name === best.isfor[i].buy.symbol)
      let indexSell : number= symbols.findIndex(symb => symb.name === best.isfor[i].sell.symbol)
      if ( best.isfor[i].buy.price_quote)
        symbols[indexBuy].isfor[i].buy.bestMarketFreq = symbols[indexBuy].isfor[i].buy.bestMarketFreq + 1
      if ( best.isfor[i].sell.price_quote)
        symbols[indexSell].isfor[i].sell.bestMarketFreq = symbols[indexBuy].isfor[i].sell.bestMarketFreq + 1
    }
  })
  return symbols
}

//Supprime les bests qui ont un resultat negatif !
function ejectNegativesBests(bests : Best[]) : Best[]{
  return bests.filter(best => Object.values(best.isfor)[0].spread_quote > 0 )
}


// On crée des groupes de requêtes par "pairs" , ainsi chaque groupe de symboles d'une même pair sera récupérer au même moment !
// Cela permet de préserver la cohérence malgré le temps d'attente entre chaque requêtes .
function createGroupsRequest(symbolsGroups : Array<{_id : string,symbs:string[] }>) :  Array<string[]> {
  let requestGroup : Array<string[]> = []
  while (symbolsGroups.length){
    let tab : Array<string> = []
    while(symbolsGroups.length && tab.length + symbolsGroups[0]?.symbs.length <= 100 ){
      tab.push(...symbolsGroups[0].symbs)
      symbolsGroups.shift()
    }
    requestGroup.push(tab)
  }
  return requestGroup
}


//On récupère l'orderbook de chaque symbole de manière synchrone
async function getOrderbooks (requestGroup : Array<string[]> ) : Promise<orderbook[]>{
  /*DEBUGAGE*/await modelOrderbook.deleteMany({})/*DEBUGAGE*/
  const x = 100/ requestGroup.length
  let result = 0
  let url = `${COINAPI_URL}/v1/orderbooks/current`
  const orderbooks : orderbook[] = []
  for(const group of requestGroup) {
    debug("%s", "chargement: ", result.toFixed(0) , " %")
    result += x
    let axiosResp : axiosResponse = await axios.get(url, {params: {filter_symbol_id: group.toString()}})
    if(axiosResp.isAxiosError)
      throw  {
        status : axiosResp.response.status,
        statusText  : axiosResp.response.statusText,
        data : axiosResp.response.data
      }
    /*DEBUGAGE*/await modelOrderbook.insertMany(axiosResp.data)/*DEBUGAGE*/
    orderbooks.push(...axiosResp.data)
  }
  return orderbooks
}



//Execute chaque parties du programme
async function programmeBests () : Promise<{ positivesBests : Best[], symbols : Symbol[], pairs : Pair[], podium : Podium[]}>{
  console.log("2- Lancement du programme calcul")

  const [symbsGroups,assets, markets] : [ Array<{_id : string,symbs:string[] }>, Asset[],Market[] ] = await Promise.all([
    modelSymbol.aggregate(aggregateSymbols),
    modelAsset.find({}).lean(),
    modelMarket.find({}).lean(),
  ])
  console.log("3- Recup symb,market, asset OK")
  if(!symbsGroups.length){
    throw new ErrorsGenerator(
      "Préconditons Requisent",
      "Il faut initialiser l'app avant de pouvoir effectuer un calcul",
      StatusCodes.PRECONDITION_REQUIRED,
    )
  }
  let symbols : string[] = []
  symbsGroups.forEach(group => symbols.push(...group.symbs))
  const requestGroup = createGroupsRequest([...symbsGroups])
  console.log("4- Lancement recup long de l'order book")
  const raw_orderbooks = await getOrderbooks(requestGroup)

  console.log("5- Filtrage orderbook")
  //Certains symboles ne seront pas renvoyée par l'API et d'autre seront en trop, on filtre ceux en trop et on signal ceux manquants
  const orderbooks : orderbook[] = raw_orderbooks.filter(raw_orderbook => symbols.includes(raw_orderbook.symbol_id) )

  console.log("6- Lancement 1er gros calcul --> Fabrication des prix")
  const prices : Price[] = await makePrices(orderbooks, assets, markets)
  console.log("6- Lancement 2eme gros calcul --> Fabrication des Bests + updte prix des symbs")
  const [uptSymbols, bests] = await Promise.all([
    updateSymbols(prices),
    makeBests(prices)
  ])
  console.log("7- update Paris et MakePodium")
  const positivesBests : Best[] = ejectNegativesBests(bests)
  let [uptPairs, podium] : [Pair[], Podium[]] = await Promise.all([
    updatePairs(bests),
    makePodium(positivesBests)
  ])
  console.log("8- award pairs et awark markets")
  let [uptPairs2, uptSymbols2] : [Pair[], Symbol[]] = await Promise.all([
    awardPairs(uptPairs, podium),
    awardMarkets(uptSymbols,positivesBests)
  ])

  console.log("9- Fin de l'exec du programme Best")
  return {positivesBests, symbols : uptSymbols2, pairs : uptPairs2, podium}
}


export default programmeBests
