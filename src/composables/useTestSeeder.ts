/* eslint-disable @typescript-eslint/no-unused-vars */

import { ReportAPI } from '~~/src/apis/ReportAPI'
import TagAPI from '~~/src/apis/TagAPI'
import TagGroupAPI from '~~/src/apis/TagGroupAPI'

export const useTestSeeder = () => {
  const seed = async () => {
    /**
     * TAG:
     * - groupA
     *   - AAA
     *   - groupB
     *     - groupC
     *     - groupD
     *       - BBB
     *       - CCC
     * - groupE
     *   - DDD
     *   - EEE
     * - FFF
     */

    const groupA = await TagGroupAPI.create({
      name: 'GroupA',
      tag_group_id: null,
    })
    const groupB = await TagGroupAPI.create({
      name: 'GroupB',
      tag_group_id: groupA.id,
    })
    const groupC = await TagGroupAPI.create({
      name: 'GroupC',
      tag_group_id: groupB.id,
    })
    const groupD = await TagGroupAPI.create({
      name: 'GroupD',
      tag_group_id: groupB.id,
    })
    const groupE = await TagGroupAPI.create({
      name: 'GroupE',
      tag_group_id: null,
    })

    const tagA = await TagAPI.create({
      name: 'AAA',
      tag_group_id: groupA.id,
    })
    const tagB = await TagAPI.create({
      name: 'BBB',
      tag_group_id: groupD.id,
    })
    const tagC = await TagAPI.create({
      name: 'CCC',
      tag_group_id: groupD.id,
    })
    const tagD = await TagAPI.create({
      name: 'DDD',
      color: 'yellow',
      tag_group_id: groupE.id,
    })
    const tagE = await TagAPI.create({
      name: 'EEE',
      color: 'green',
      tag_group_id: groupE.id,
    })
    const tagF = await TagAPI.create({
      name: 'FFF',
      color: 'blue',
      tag_group_id: null,
    })
    const tagG = await TagAPI.create({
      name: 'GGG',
      color: 'red',
      tag_group_id: null,
    })

    ///

    const reportA = await ReportAPI.create({
      text: 'テストレポート\nあいうえおかきくけこ\nさしすせそたちつてと',
      tagNames: ['BBB', 'DDD'],
    })

    const reportB = await ReportAPI.create({
      text: 'なにぬねの\n\n- abcde\n- fghij',
      tagNames: ['DDD', 'EEE'],
    })

    const reportC = await ReportAPI.create({
      text: 'タグなしレポート\n\n- テスト1\n- テスト2',
      tagNames: [],
    })

    const reportD = await ReportAPI.create({
      text: 'タイトルのみ',
      tagNames: [],
    })
  }

  return {
    seed,
  }
}
