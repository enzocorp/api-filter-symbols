import {Symbol, SymbolFor} from "../../../models/interphace/symbol";
import {Price, PriceIsfor} from "../../../models/interphace/price";
import modelSymbol from "../../../models/mongoose/model.symbol";
import {
  END_GRAPH,
  NOT_BASEUSD_INFOS,
  NOT_DATA_IN_ORDERBOOK,
  NOT_ENOUGHT_VOLUME,
  PAS_GRAPH,
  START_GRAPH
} from "../config_bests";

//Effectue le calcul des nouvelles données pour un isfor[x]
async function calculIsFor(isfor : number, pricefor : PriceIsfor,symbolFor:SymbolFor):Promise<{[key: number]: SymbolFor}> {

  const checkPrice = (price : string|number) : true | string => {
    if (typeof price === "string") return price
    return true
  }

  const checkbuy = checkPrice(pricefor.buy)
  const checksell = checkPrice(pricefor.sell)
  const symboleFor : SymbolFor = {
    buy : {
      okFreq : checkbuy === true ? symbolFor.buy.okFreq + 1 : symbolFor.buy.okFreq,
      notDataFreq : checkbuy === (NOT_DATA_IN_ORDERBOOK || NOT_BASEUSD_INFOS) ? symbolFor.buy.notDataFreq + 1 : symbolFor.buy.notDataFreq,
      notEnoughVolFreq : checkbuy === NOT_ENOUGHT_VOLUME ? symbolFor.buy.notEnoughVolFreq + 1 : symbolFor.buy.notEnoughVolFreq,
      prixMoyen_quote : checkbuy === true ? (symbolFor.buy.prixMoyen_quote + +pricefor.buy) / (symbolFor.buy.okFreq + 1) : symbolFor.buy.prixMoyen_quote,
      bestMarketFreq : symbolFor.buy.bestMarketFreq
    },
    sell : {
      okFreq : checksell === true ? symbolFor.sell.okFreq + 1 : symbolFor.sell.okFreq,
      notDataFreq : checksell === (NOT_DATA_IN_ORDERBOOK || NOT_BASEUSD_INFOS) ? symbolFor.sell.notDataFreq + 1 : symbolFor.sell.notDataFreq,
      notEnoughVolFreq : checksell === NOT_ENOUGHT_VOLUME ? symbolFor.sell.notEnoughVolFreq + 1 : symbolFor.sell.notEnoughVolFreq,
      prixMoyen_quote : checksell === true ? (symbolFor.sell.prixMoyen_quote + +pricefor.sell) / (symbolFor.sell.okFreq + 1) : symbolFor.sell.prixMoyen_quote,
      bestMarketFreq : symbolFor.sell.bestMarketFreq
    }
  }

  return {[isfor] : symboleFor}
}

//Lance le calcul asynchrone de tous les "isfor" pour mettre a jour 1 symbole
async function updateSymbol (price : Price, symb : Symbol) : Promise<Symbol>{
  const promises : Promise<{[key: number]: SymbolFor}>[] = []
  for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
    promises.push(calculIsFor(i,price.isfor[i],symb.isfor[i]))
  }
  const all : Array<{[key: number]: SymbolFor} >= await Promise.all(promises)
  let updatedSymb = {...symb}
  all.forEach(item=> {
    updatedSymb.isfor = {...updatedSymb.isfor,...item}
  })
  return updatedSymb
}


//Permet de mettre a jour les symboles avec les nouvelles données de prix
async function updateSymbols (prices : Price[]) : Promise<Symbol[]>{
    let symbs : Symbol[] = await modelSymbol.find().lean()
    const promiseSymbols : Promise<Symbol>[]  =  []
    prices.forEach(price => {
      const symb  = symbs.find(symb => price.infos.symbol === symb.name)
      if (symb)//Filtre les symboles pour ne mettre a jour que ceux présents dans "price"
        promiseSymbols.push(updateSymbol(price, symb))

    })
    return await Promise.all(promiseSymbols)
}

export default updateSymbols
