import {Symbol, SymbolFor} from "../../../../models/interphace/symbol";
import {Price} from "../../../../models/interphace/price";
import modelSymbol from "../../../../models/mongoose/model.symbol";

async function calculIsFor(price : Price,symb:SymbolFor,isFor : string):Promise<SymbolFor> {

  const testPrice = (val : any) : undefined | null | true => {
    switch (val){
      case null :
        return null
      case undefined :
        return undefined
      default :
        return true
    }
  }
  const testbuy = testPrice(price.buy[isFor])
  const testsell = testPrice(price.sell[isFor])
  return {
    buy : {
      okFreq : testbuy ? symb.buy.okFreq + 1 : symb.buy.okFreq,
      notDataFreq : testbuy === undefined ? symb.buy.notDataFreq + 1 : symb.buy.notDataFreq,
      notEnoughVolFreq : testbuy === null ? symb.buy.notEnoughVolFreq + 1 : symb.buy.notEnoughVolFreq,
      prixMoyen_quote : testbuy ? (symb.buy.prixMoyen_quote + price.buy[isFor]) / (symb.buy.okFreq + 1) : symb.buy.prixMoyen_quote,
      bestMarketFreq : symb.buy.bestMarketFreq
    },
    sell : {
      okFreq : testsell ? symb.sell.okFreq + 1 : symb.sell.okFreq,
      notDataFreq : testsell === undefined ? symb.sell.notDataFreq + 1 : symb.sell.notDataFreq,
      notEnoughVolFreq : testsell === null ? symb.sell.notEnoughVolFreq + 1 : symb.sell.notEnoughVolFreq,
      prixMoyen_quote : testsell ? (symb.sell.prixMoyen_quote + price.sell[isFor]) / (symb.sell.okFreq + 1) : symb.sell.prixMoyen_quote,
      bestMarketFreq : symb.sell.bestMarketFreq
    }
  }
}




async function updateSymbol (price : Price, symb : Symbol) : Promise<Symbol>{
  const [for1k, for15k,for30k] = await Promise.all([
    calculIsFor(price,symb.for1k,'price_for1kusd_quote'),
    calculIsFor(price,symb.for15k,'price_for15kusd_quote'),
    calculIsFor(price,symb.for30k,'price_for30kusd_quote')
  ])
  return {
    ...symb,
    for1k,
    for15k,
    for30k
  }
}

async function calculSymbols (prices : Price[]) : Promise<Symbol[]>{
    let symbs : Symbol[] = await modelSymbol.find().lean()
    const promiseSymbols : Promise<Symbol>[]  =  []
    prices.forEach(price => {
      const symb  = symbs.find(symb => price.infos.symbol === symb.name)

      if (symb)//Filtre les "prices" nons présents en BDD
        /*La BDD possède tous les symbols nécéssaires! Mais l'API renvois aussi des items non souhaité malgré  le "filtres_symbol_id" ...
        Ces éléments indésirables n'étants pas présents en BDD, ils n'auront donc aucunes correspondances avec sym*/
        promiseSymbols.push(updateSymbol(price, symb))
      else
        console.log(`Error : Le symbol ${price.infos.symbol} n'as pas été trouvé en BDD mais est présent dans les "Prices"!`)
    })
    return await Promise.all(promiseSymbols)
}

export default calculSymbols
