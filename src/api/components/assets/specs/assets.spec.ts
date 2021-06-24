import {mocked}  from "ts-jest/utils"
import modelPair from "../../../models/mongoose/model.pair";
import {Pair} from "../../../models/interphace/pair";
import {banLinkedPairs, unBanLinkedPairs} from "../services/ban-linked-pairs";
import {BAN_CODE_BASE, BAN_CODE_QUOTE} from "../constantes-asset";

jest.mock("../../../models/mongoose/model.pair")
const mockModelPair = mocked(modelPair, true)

class PairBuilder implements Pair {
  name = "BTC_USDT"
  base = "BTC"
  quote = "USDT"
  exclusion = {
    severityHistoric : null,
    isExclude : false,
    reasons : [],
    severity : 0,
    excludeBy : null,
    note : null,
  }
  isfor = {}
  marketsForThis = 58

  constructor({hist = null,exc = false,rea = [],sev = 0}) {
    this.exclusion.severityHistoric = hist
    this.exclusion.isExclude = exc
    this.exclusion.reasons = rea
    this.exclusion.severity = sev
  }

}


describe("Assets Testing",()=> {

  beforeEach(() => {
    mockModelPair.mockClear()
  })

  describe("Test to Ban pair linked to a ban asset",()=> {

    it('should be Update&Banned if one asset match with it', async () => {

      let pair = new PairBuilder({hist:null})
      mockModelPair.find.mockImplementation(() => <any>({
        lean: jest.fn().mockReturnValue([pair])
      }))

      await banLinkedPairs([pair.base], "base", BAN_CODE_BASE)

      expect(pair.exclusion.isExclude).toBe(true)
      expect(pair.exclusion.severity).toBe(4)
      expect(pair.exclusion.reasons).toEqual([BAN_CODE_BASE])
      expect(pair.exclusion.severityHistoric).toBe(null)
      expect(modelPair.collection.bulkWrite).toHaveBeenCalled()

    })

    it("should do nothing if no asset match with pair", async () => {
      mockModelPair.find.mockImplementation(() => <any>({
        lean: jest.fn().mockReturnValue([])
      }))
      await banLinkedPairs(['ENZOASSET'], "base", BAN_CODE_BASE)
      expect(modelPair.collection.bulkWrite).not.toHaveBeenCalled()
    })

  })

  describe("Test to Unban pair linked to an unban asset", ()=> {

    it('should be Unban if one asset match with it', async () => {

      let pair = new PairBuilder({hist:2,exc: true, rea : [BAN_CODE_BASE], sev: 4})
      mockModelPair.find.mockImplementation(() => <any>({
        lean: jest.fn().mockReturnValue([pair])
      }))

      await unBanLinkedPairs([pair.base], "base", BAN_CODE_BASE)

      expect(pair.exclusion.isExclude).toBe(false)
      expect(pair.exclusion.severity).toBe(2)
      expect(pair.exclusion.reasons).toEqual([])
      expect(pair.exclusion.severityHistoric).toBe(null)
      expect(modelPair.collection.bulkWrite).toHaveBeenCalled()

    })

    it("should do nothing if no asset match with pair", async () => {
      mockModelPair.find.mockImplementation(() => <any>({
        lean: jest.fn().mockReturnValue([])
      }))
      await unBanLinkedPairs(['ENZOASSET'], "base", BAN_CODE_BASE)
      expect(modelPair.collection.bulkWrite).not.toHaveBeenCalled()
    })

    it('should not be unban if 1 ban asset remaining', async () => {
      let pair = new PairBuilder({
        hist:3,
        exc: true,
        rea : [BAN_CODE_BASE,BAN_CODE_QUOTE,'other'],
        sev: 4
      })
      mockModelPair.find.mockImplementation(() => <any>({
        lean: jest.fn().mockReturnValue([pair])
      }))

      await unBanLinkedPairs([pair.base], "base", BAN_CODE_BASE)

      expect(pair.exclusion.isExclude).toBe(true)
      expect(pair.exclusion.severity).toBe(4)
      expect(pair.exclusion.reasons).toEqual([BAN_CODE_QUOTE,'other'])
      expect(pair.exclusion.severityHistoric).toBe(3)
      expect(modelPair.collection.bulkWrite).toHaveBeenCalled()
    })

    it('should not be unban if its ban history', async () => {
      let pair = new PairBuilder({
        hist:4, exc: true,  rea : [BAN_CODE_BASE,'other'], sev: 4
      })
      mockModelPair.find.mockImplementation(() => <any>({
        lean: jest.fn().mockReturnValue([pair])
      }))

      await unBanLinkedPairs([pair.base], "base", BAN_CODE_BASE)

      expect(pair.exclusion.isExclude).toBe(true)
      expect(pair.exclusion.severity).toBe(4)
      expect(pair.exclusion.reasons).toEqual(['other'])
      expect(pair.exclusion.severityHistoric).toBe(null)
      expect(modelPair.collection.bulkWrite).toHaveBeenCalled()
    })



  })

})
