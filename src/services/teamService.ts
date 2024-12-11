import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TeamMember, TeamInvitation } from '@/types/team';

const TEAM_COLLECTION = 'teamMembers';
const INVITATION_COLLECTION = 'teamInvitations';

export const teamService = {
    /**
     * Get all team members
     */
    async getAllTeamMembers(): Promise<TeamMember[]> {
        const querySnapshot = await getDocs(collection(db, TEAM_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as TeamMember));
    },

    /**
     * Subscribe to team members updates
     */
    subscribeToTeamMembers(callback: (members: TeamMember[]) => void) {
        return onSnapshot(collection(db, TEAM_COLLECTION), (snapshot) => {
            const members = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TeamMember));
            callback(members);
        });
    },

    /**
     * Add a new team member
     */
    async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, TEAM_COLLECTION), {
            ...member,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    },

    /**
     * Update a team member
     */
    async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<void> {
        const docRef = doc(db, TEAM_COLLECTION, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date()
        });
    },

    /**
     * Remove a team member
     */
    async removeTeamMember(id: string): Promise<void> {
        await deleteDoc(doc(db, TEAM_COLLECTION, id));
    },

    /**
     * Get team member by email
     */
    async getTeamMemberByEmail(email: string): Promise<TeamMember | null> {
        const q = query(collection(db, TEAM_COLLECTION), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        } as TeamMember;
    },

    /**
     * Create an invitation
     */
    async createInvitation(invitation: Omit<TeamInvitation, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, INVITATION_COLLECTION), invitation);
        return docRef.id;
    },

    /**
     * Get invitation by email
     */
    async getInvitationByEmail(email: string): Promise<TeamInvitation | null> {
        const q = query(
            collection(db, INVITATION_COLLECTION),
            where("email", "==", email),
            where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            email: data.email,
            role: data.role,
            invitedBy: data.invitedBy,
            invitedAt: data.invitedAt.toDate(),
            status: data.status,
            expiresAt: data.expiresAt.toDate(),
        } as TeamInvitation;
    },

    /**
     * Get team invitations
     */
    async getTeamInvitations(): Promise<TeamInvitation[]> {
        const q = collection(db, 'teamInvitations')
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            email: doc.data().email,
            role: doc.data().role,
            invitedBy: doc.data().invitedBy,
            invitedAt: doc.data().invitedAt,
            status: doc.data().status,
        })) as unknown as TeamInvitation[]
    }
}; 