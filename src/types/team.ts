export type TeamMemberRole = 'admin' | 'user';

export interface TeamMember {
    id: string;
    email: string;
    name: string;
    role: TeamMemberRole;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'invited' | 'disabled';
    invitedBy?: string;
}

export interface TeamInvitation {
    email: string;
    role: TeamMemberRole;
    invitedBy: string;
    invitedAt: Date;
    status: 'pending' | 'accepted' | 'expired';
    expiresAt: Date;
} 