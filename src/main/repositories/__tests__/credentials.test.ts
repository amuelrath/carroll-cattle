import { withDb } from '@main/__tests__/db'
import { credentialsRepo } from '@main/repositories/credentials.repo'
import { credentials } from '@shared/db/schema'
import { ZCredentials } from '@shared/schemas/trpc/credentials.schemas'
import { fuzz } from '@traversable/zod-test'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const CredentialsArb = fuzz(ZCredentials)

describe('credentialsRepo', () => {
  it('read returns undefined when empty', () =>
    withDb(async (db) => {
      expect(await credentialsRepo.read(db)).toBeUndefined()
    }))

  it('read returns the stored row', async () => {
    await fc.assert(
      fc.asyncProperty(CredentialsArb, (creds) =>
        withDb(async (db) => {
          await db.insert(credentials).values(creds)
          expect(await credentialsRepo.read(db)).toMatchObject(creds)
        })
      )
    )
  })

  it('upsert inserts when empty', async () => {
    await fc.assert(
      fc.asyncProperty(CredentialsArb, (creds) =>
        withDb(async (db) => {
          await credentialsRepo.upsert(db, creds)

          const rows = await db.select().from(credentials)
          expect(rows).toHaveLength(1)
          expect(rows[0]).toMatchObject(creds)
        })
      )
    )
  })

  it('upsert updates when a row exists', async () => {
    await fc.assert(
      fc.asyncProperty(CredentialsArb, CredentialsArb, (existing, next) =>
        withDb(async (db) => {
          await db.insert(credentials).values(existing)

          await credentialsRepo.upsert(db, next)

          const rows = await db.select().from(credentials)
          expect(rows).toHaveLength(1)
          expect(rows[0]).toMatchObject(next)
        })
      )
    )
  })

  it('any sequence of upserts leaves one row equal to the last', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(CredentialsArb, { minLength: 1, maxLength: 5 }), (seq) =>
        withDb(async (db) => {
          for (const creds of seq) await credentialsRepo.upsert(db, creds)

          const rows = await db.select().from(credentials)
          expect(rows).toHaveLength(1)
          expect(await credentialsRepo.read(db)).toMatchObject(seq.at(-1)!)
        })
      )
    )
  })
})
