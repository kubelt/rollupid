import { RollupError } from '@proofzero/errors'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import { DOProxy } from 'do-proxy'

export type InviteMemberInput = {
  identifier: string
  accountType: EmailAccountType | OAuthAccountType | CryptoAccountType
  inviteCode: string
  inviter: string
}

export type MemberInvitation = InviteMemberInput & {
  timestamp: number
}

export type ClaimInvitationInput = {
  inviteCode: string
}

export default class IdentityGroup extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async inviteMember({
    inviter,
    identifier,
    accountType,
    inviteCode,
  }: InviteMemberInput): Promise<void> {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    const now = Date.now()

    invitations.push({
      inviter,
      identifier,
      accountType,
      inviteCode,
      timestamp: now,
    })

    // Set alarm one day and 5 minutes from now
    this.state.storage.setAlarm(now + 86_700_000)

    await this.state.storage.put('invitations', invitations)
  }

  async getInvitations(): Promise<MemberInvitation[]> {
    return (
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []
    )
  }

  async claimInvitation({ inviteCode }: ClaimInvitationInput): Promise<void> {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    const invitationIndex = invitations.findIndex(
      (invitation) => invitation.inviteCode === inviteCode
    )
    if (invitationIndex === -1) {
      throw new RollupError({
        message: 'Invitation not found',
      })
    }

    invitations.splice(invitationIndex, 1)

    await this.state.storage.put('invitations', invitations)
  }

  async alarm() {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    const now = Date.now()

    // Remove all invitations sent more than one day ago
    const validInvitations = invitations.filter(
      (invitation) => now - invitation.timestamp < 86_400_000
    )

    await this.state.storage.put('invitations', validInvitations)
  }
}