import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

export const ProfileSchema = z.object({
  displayName: z.string().max(50),
  pfp: z
    .object({
      image: z.string(),
      isToken: z.boolean().optional(),
    })
    .optional(),
  cover: z.string().optional(),
  defaultAddress: inputValidators.AddressURNInput,
  bio: z.string().max(256).optional(),
  job: z.string().max(30).optional(),
  location: z.string().max(30).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  links: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().or(z.literal('')),
        verified: z.boolean(),
      })
    )
    .optional(),
})

// TODO: move to types packages
export type Profile = z.infer<typeof ProfileSchema>
