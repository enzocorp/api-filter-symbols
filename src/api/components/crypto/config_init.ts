
/*Ces parametres doivent êtres defini avant la premiere initialisation !! */

//ASSETS
export const asset_volume_usd1day : number = 200000 //Volume d"echange journalier minimum
export const asset_symbolsCount : number = 1 //Nombre minimum de symboles que dois contenir un asset

//MARKETS
export const market_volume_usd1day: number = 1000000 //Volume d"echange journalier minumum
export const market_symbolsCount : number = 3//Nombres minimum de symboles que dois contenir le market

//SYMBOLS
export const symbol_volume_usd1day : number = 200000//Volume d'echange minimum journalier pour la selection du symbole
export const symbol_type : 'SPOT' | 'FUTURES' = 'SPOT'//Les Type de symboles accepté
