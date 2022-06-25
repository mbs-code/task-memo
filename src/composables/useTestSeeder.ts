/* eslint-disable @typescript-eslint/no-unused-vars */

import { Kysely } from 'kysely'
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { Tables } from '~~/src/databases/Database'

export const useTestSeeder = (db: Kysely<Tables>) => {
  const reportAPI = useReportAPI(db)
  const tagAPI = useTagAPI(db)

  const seed = async () => {
    /**
     * TAG:
     * - AAA
     *   - BBB
     *   - CCC
     *     - DDD
     *       - FFF
     *     - EEE
     */

    const tagA = await tagAPI.create({
      name: 'AAA',
      parent_tag_id: null,
    })
    const tagB = await tagAPI.create({
      name: 'BBB',
      parent_tag_id: tagA.id,
    })
    const tagC = await tagAPI.create({
      name: 'CCC',
      parent_tag_id: tagA.id,
    })

    const tagD = await tagAPI.create({
      name: 'DDD',
      parent_tag_id: tagC.id,
    })
    const tagE = await tagAPI.create({
      name: 'EEE',
      parent_tag_id: tagC.id,
    })

    const tagF = await tagAPI.create({
      name: 'FFF',
      parent_tag_id: tagE.id,
    })

    ///

    const reportA = await reportAPI.create({
      text: 'テストレポート\nあいうえおかきくけこ\nさしすせそたちつてと',
      tagNames: ['BBB', 'DDD'],
    })

    const reportB = await reportAPI.create({
      text: 'タグなしレポート\n\n- テスト1\n- テスト2',
      tagNames: ['BBB', 'DDD'],
    })
  }

  return {
    seed,
  }
}
