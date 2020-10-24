
export interface Average{
  exchange: string
  pair: string
  symbole_id: string
  best : {
    sell1k : number
    sell15k : number
    sell30k : number
    buy1k : number
    buy15k : number
    buy30k : number
  }
  sell : {
    frequence : number
    prixMoyen_for1kusd_quote : number
    prixMoyen_for15kusd_quote : number
    prixMoyen_for30kusd_quote : number
    volumeMoyen_for1kusd : number
    volumeMoyen_for15kusd : number
    volumeMoyen_for30kusd : number
  }
  buy : {
    frequence : number
    prixMoyen_for1kusd_quote : number
    prixMoyen_for15kusd_quote : number
    prixMoyen_for30kusd_quote : number
    volumeMoyen_for1kusd : number
    volumeMoyen_for15kusd : number
    volumeMoyen_for30kusd : number
  }
  date? : Date
}
