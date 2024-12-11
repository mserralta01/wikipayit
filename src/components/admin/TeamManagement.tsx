import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/useToast";
import { TeamMember, TeamMemberRole } from '../../types/team';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { teamService } from '../../services/teamService';
import { auth } from '../../lib/firebase';

const teamMemberSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    role: z.enum(['admin', 'user'] as const),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

interface FormFieldProps {
    field: {
        onChange: (...event: any[]) => void;
        value: string;
        name: string;
    };
}

export function TeamManagement() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const { toast } = useToast();

    const form = useForm<TeamMemberFormValues>({
        resolver: zodResolver(teamMemberSchema),
        defaultValues: {
            email: '',
            name: '',
            role: 'user',
        },
    });

    useEffect(() => {
        // Subscribe to team members updates
        const unsubscribe = teamService.subscribeToTeamMembers((members: TeamMember[]) => {
            setTeamMembers(members);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const onSubmit = async (values: TeamMemberFormValues) => {
        try {
            // Check if member already exists
            const existingMember = await teamService.getTeamMemberByEmail(values.email);
            if (existingMember) {
                toast({
                    title: "Error",
                    description: "A team member with this email already exists.",
                    variant: "destructive",
                });
                return;
            }

            // Check if there's a pending invitation
            const existingInvitation = await teamService.getInvitationByEmail(values.email);
            if (existingInvitation) {
                toast({
                    title: "Error",
                    description: "An invitation has already been sent to this email.",
                    variant: "destructive",
                });
                return;
            }

            if (!auth) {
                toast({
                    title: "Error",
                    description: "Authentication service is not available.",
                    variant: "destructive",
                });
                return;
            }

            const currentUser = auth.currentUser;
            if (!currentUser) {
                toast({
                    title: "Error",
                    description: "You must be logged in to add team members.",
                    variant: "destructive",
                });
                return;
            }

            const newTeamMember: Omit<TeamMember, 'id'> = {
                ...values,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'invited',
                invitedBy: currentUser.uid,
            };

            await teamService.addTeamMember(newTeamMember);
            
            // Create invitation
            await teamService.createInvitation({
                email: values.email,
                role: values.role,
                invitedBy: currentUser.uid,
                invitedAt: new Date(),
                status: 'pending',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            });
            
            toast({
                title: "Team member invited",
                description: "An invitation has been sent to " + values.email,
            });

            setIsAddDialogOpen(false);
            form.reset();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add team member. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRemoveTeamMember = async (id: string) => {
        try {
            await teamService.removeTeamMember(id);
            toast({
                title: "Team member removed",
                description: "The team member has been removed successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove team member. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                    Manage your team members and their permissions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Team Member</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Team Member</DialogTitle>
                                <DialogDescription>
                                    Invite a new team member by entering their details below.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }: FormFieldProps) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }: FormFieldProps) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }: FormFieldProps) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="user">User</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit">Add Member</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teamMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>{member.role}</TableCell>
                                <TableCell>{member.status}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveTeamMember(member.id)}
                                    >
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 