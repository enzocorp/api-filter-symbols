import {Document, model, Schema} from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

interface OrderBook {
    symbol_id: string,
    time_exchange: string,
    time_coinapi: string,
    asks: Array<{
        price: number,
        size: number
    }>,
    bids: Array<{
        price: number,
        size: number
    }>,
}

interface IOrderBookDoc extends Document,OrderBook {}

const subSchema = new Schema({
    price: {type: Number},
    size: {type: Number},
});

const schema = new Schema({
    symbol_id: {type: String},
    time_exchange: {type : String},
    time_coinapi: {type : String},
    asks: [subSchema],
    bids: [subSchema]
})

schema.plugin(uniqueValidator, {
    message: 'Donnée invalides dans la collection "orderbook" !'
})

let modelOrderbook = model<IOrderBookDoc>('orderbooks', schema)
export default modelOrderbook
