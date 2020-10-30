import {Symbol} from "../../models/interphace/symbol";
import {Price} from "../../models/interphace/price";
import modelSymbol from "../../models/mongoose/model.symbol";

function calculMoyennes(initVal : number,newVal : number,freq : number, not : {notData : number, notEnought : number}) : number {
  freq = freq - not.notData - not.notEnought
  if (newVal === null || newVal === undefined)
    return initVal
  else if (initVal === null)
    return newVal
  else
    return (initVal * freq + newVal) / (freq + 1)
}

async function calculSide(price : Price['buy' | 'sell'], symb : Symbol['buy' | 'sell'],name : string) : Promise<Symbol['buy' | 'sell']> {

  const testData = ({
                      price_for1kusd_quote : pricefor1k,
                      price_for15kusd_quote : pricefor15k,
                      price_for30kusd_quote : pricefor30k  }: Price['buy' | 'sell']) : boolean => {

    const bool : boolean = pricefor1k !== undefined && pricefor15k !== undefined && pricefor30k !== undefined
    if (!bool)
      console.log(`"ATTENTION "${name}" NE POSSEDES AUCUNES DATA SUR L'ORDER BOOK !! `)
    return bool
  }

  const boolData = testData(price)
  return {
    testedFreq : symb.testedFreq + 1,
    notData : boolData ? symb.notData + 1 : symb.notData,
    notEnoughVolume_1kusd : price.price_for1kusd_quote === null ? symb.notEnoughVolume_1kusd + 1 : symb.notEnoughVolume_1kusd,
    notEnoughVolume_15kusd : price.price_for15kusd_quote === null ? symb.notEnoughVolume_15kusd + 1 : symb.notEnoughVolume_15kusd,
    notEnoughVolume_30kusd : price.price_for30kusd_quote === null ? symb.notEnoughVolume_30kusd + 1 : symb.notEnoughVolume_30kusd,

    prixMoyen_for1kusd_quote : boolData ? calculMoyennes(
      symb.prixMoyen_for1kusd_quote,
      price.price_for1kusd_quote,
      symb.testedFreq,
      {notData : symb.notData, notEnought:symb.notEnoughVolume_1kusd}
      ) : symb.prixMoyen_for1kusd_quote,

    prixMoyen_for15kusd_quote : boolData ? calculMoyennes(
      symb.prixMoyen_for15kusd_quote,
      price.price_for15kusd_quote,
      symb.testedFreq,
      {notData : symb.notData, notEnought:symb.notEnoughVolume_15kusd}
    ) : symb.prixMoyen_for15kusd_quote,

    prixMoyen_for30kusd_quote : boolData ? calculMoyennes(
      symb.prixMoyen_for30kusd_quote,
      price.price_for30kusd_quote,
      symb.testedFreq,
      {notData : symb.notData, notEnought:symb.notEnoughVolume_30kusd}
    ) : symb.prixMoyen_for30kusd_quote,
  }
}


async function updateSymbol (price : Price, symb : Symbol) : Promise<Symbol>{
  const [buy, sell] = await Promise.all([
    calculSide(price.buy,symb.buy,symb.name),
    calculSide(price.sell,symb.sell,symb.name)
  ])
  return {
    ...symb,
    buy,
    sell
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
