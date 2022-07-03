/* eslint-disable @typescript-eslint/no-unused-vars */

import { Kysely } from 'kysely'
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { useTagGroupAPI } from '~~/src/apis/useTagGroup'
import { Tables } from '~~/src/databases/Database'

export const useTestSeeder = (db: Kysely<Tables>) => {
  const reportAPI = useReportAPI(db)
  const tagAPI = useTagAPI(db)
  const tagGroupAPI = useTagGroupAPI(db)

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

    const groupA = await tagGroupAPI.create({
      name: 'GroupA',
      tag_group_id: null,
    })
    const groupB = await tagGroupAPI.create({
      name: 'GroupB',
      tag_group_id: groupA.id,
    })
    const groupC = await tagGroupAPI.create({
      name: 'GroupC',
      tag_group_id: groupB.id,
    })
    const groupD = await tagGroupAPI.create({
      name: 'GroupD',
      tag_group_id: groupB.id,
    })
    const groupE = await tagGroupAPI.create({
      name: 'GroupE',
      tag_group_id: null,
    })

    const tagA = await tagAPI.create({
      name: 'AAA',
      tag_group_id: groupA.id,
    })
    const tagB = await tagAPI.create({
      name: 'BBB',
      tag_group_id: groupD.id,
    })
    const tagC = await tagAPI.create({
      name: 'CCC',
      tag_group_id: groupD.id,
    })
    const tagD = await tagAPI.create({
      name: 'DDD',
      color: 'yellow',
      tag_group_id: groupE.id,
    })
    const tagE = await tagAPI.create({
      name: 'EEE',
      color: 'green',
      tag_group_id: groupE.id,
    })
    const tagF = await tagAPI.create({
      name: 'FFF',
      color: 'blue',
      tag_group_id: null,
    })
    const tagG = await tagAPI.create({
      name: 'GGG',
      color: 'red',
      tag_group_id: null,
    })

    ///

    const reportA = await reportAPI.create({
      text: 'テストレポート\nあいうえおかきくけこ\nさしすせそたちつてと',
      tagNames: ['BBB', 'DDD'],
    })

    const reportB = await reportAPI.create({
      text: 'なにぬねの\n\n- abcde\n- fghij',
      tagNames: ['DDD', 'EEE'],
    })

    const reportC = await reportAPI.create({
      text: 'タグなしレポート\n\n- テスト1\n- テスト2',
      tagNames: [],
    })

    const reportD = await reportAPI.create({
      text: 'タイトルのみ',
      tagNames: [],
    })
  }

  return {
    seed,
  }
}
