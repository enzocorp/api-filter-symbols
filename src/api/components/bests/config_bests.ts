
/*Ces parametres doivent êtres defini avant la premiere initialisation !! */
export const START_GRAPH = 200 //Point de depart du graphique
export const END_GRAPH = 20000 //Point de fin du graphique
export const PAS_GRAPH = 200//Saut entre chaque points du graphique

/*Problemes liés a la récupération de l'orderbook*/
export const NOT_ENOUGHT_VOLUME = "not_enought_volume" //Pas assé de volume dans l'orderbook pour acheter/vendre la qté voulu
export const NOT_DATA_IN_ORDERBOOK = "not_data_in_orderbook" //Coinapi a renvoyer un orderbook vide sans infos
export const NOT_BASEUSD_INFOS = "not_base_usd_infos"
export const NO_SPREAD_QUOTE = "no_spread_quote"
