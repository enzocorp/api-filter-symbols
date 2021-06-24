import {mocked} from "ts-jest/utils"
import {bestUtilsTest, testing} from "../services/index.calcul-sync";

jest.spyOn(bestUtilsTest,"fake1")
const mockBestUtilsTest = mocked(bestUtilsTest, true)

describe('Check Index Best', ()=> {

  beforeEach(() => {
    mockBestUtilsTest.fake1.mockClear()
  })

  it("should all function must be called", async ()=> {
    mockBestUtilsTest.fake1.mockResolvedValue('mock fake 1')
    await testing()
    expect(bestUtilsTest.fake1).toHaveBeenCalled()
    expect(bestUtilsTest.fake2).toHaveBeenCalled()
  })
})

