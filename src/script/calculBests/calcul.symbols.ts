import {Symbol} from "../../models/interphace/symbol";
import {Price} from "../../models/interphace/price";
import modelSymbol from "../../models/mongoose/model.symbol";

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

function calculMoyennes(initVal : number,newVal : number,freq : number, not : {notData : number, notEnought : number}) : number {
  freq = freq - not.notData - not.notEnought
  if (newVal === null || newVal === undefined)
    return initVal
  else if (initVal === null)
    return newVal
  else
    return (initVal * freq + newVal) / (freq++)
}

async function calculSide(price : Price['buy' | 'sell'], symb : Symbol['buy' | 'sell'],name : string) : Promise<Symbol['buy' | 'sell']> {

  const testData = ({
                      price_for1kusd_quote : for1k,
                      price_for15kusd_quote : for15k,
                      price_for30kusd_quote : for30k  }: Price['buy' | 'sell']) : boolean => {

    const bool : boolean = for1k !== undefined && for15k !== undefined && for30k !== undefined
    if (!bool)
      console.log(`"ATTENTION "${name}" NE POSSEDES AUCUNES DATA SUR L'ORDER BOOK !! `)
    return bool
  }

  const thereAreData = testData(price)
  return {
    testedFreq : symb.testedFreq++,
    notData : thereAreData ? symb.notData++ : symb.notData,
    notEnoughVolume_1kusd : price.price_for1kusd_quote === null ? symb.notEnoughVolume_1kusd++ : symb.notEnoughVolume_1kusd,
    notEnoughVolume_15kusd : price.price_for15kusd_quote === null ? symb.notEnoughVolume_15kusd++ : symb.notEnoughVolume_15kusd,
    notEnoughVolume_30kusd : price.price_for30kusd_quote === null ? symb.notEnoughVolume_30kusd++ : symb.notEnoughVolume_30kusd,

    prixMoyen_for1kusd_quote : thereAreData ? calculMoyennes(
      symb.prixMoyen_for1kusd_quote,
      price.price_for1kusd_quote,
      symb.testedFreq,
      {notData : symb.notData, notEnought:symb.notEnoughVolume_1kusd}
      ) : symb.prixMoyen_for1kusd_quote,

    prixMoyen_for15kusd_quote : thereAreData ? calculMoyennes(
      symb.prixMoyen_for15kusd_quote,
      price.price_for15kusd_quote,
      symb.testedFreq,
      {notData : symb.notData, notEnought:symb.notEnoughVolume_15kusd}
    ) : symb.prixMoyen_for15kusd_quote,

    prixMoyen_for30kusd_quote : thereAreData ? calculMoyennes(
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
  try{
    let symbs : Symbol[] = await modelSymbol.find().lean()
    const promisesUpdateSymbols : Promise<Symbol>[]  = symbs.map(symb => {
      const price = prices.find(price => price.infos.symbol === symb.name)
      return updateSymbol(price, symb)
    })
    return await Promise.all(promisesUpdateSymbols)
  }catch (err){
    console.log(err)
  }
}

export default calculSymbols
