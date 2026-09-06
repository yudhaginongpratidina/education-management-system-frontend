'use client';

import { useEffect, useState } from 'react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toast } from '@/components/ui/toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

interface Branch {
    id: number;
    name: string;
}

export default function TeacherBranchForm({
    teacherId,
    onSuccess,
}: {
    teacherId: number;
    onSuccess: () => void;
}) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [assignedBranches, setAssignedBranches] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [branchesRes, assignedRes] = await Promise.all([
                http.get('/branches'),
                http.get(`/teacher-branches/${teacherId}`),
            ]);

            setBranches(branchesRes.data.data);
            setAssignedBranches(assignedRes.data.data.map((item: any) => item.branch_id));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [teacherId]);

    const toggleBranch = async (branchId: number, isAssigned: boolean) => {
        try {
            if (isAssigned) {
                // DELETE
                await http.delete(`/teacher-branches/${teacherId}/${branchId}`);
            } else {
                // POST
                await http.post('/teacher-branches', { teacherId, branchId });
            }
            toast.add({
                title: 'Success',
                type: 'success',
                description: 'Branch assignment updated',
            });
            await fetchData(); // Refresh data
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <FieldGroup>
                {branches.map((branch) => {
                    const isAssigned = assignedBranches.includes(branch.id);
                    return (
                        <Field
                            key={branch.id}
                            orientation="horizontal"
                            className="items-center gap-2"
                        >
                            <Checkbox
                                checked={isAssigned}
                                onCheckedChange={() => toggleBranch(branch.id, isAssigned)}
                                id={`branch-${branch.id}`}
                            />
                            <FieldLabel htmlFor={`branch-${branch.id}`}>{branch.name}</FieldLabel>
                        </Field>
                    );
                })}
            </FieldGroup>
        </div>
    );
}
