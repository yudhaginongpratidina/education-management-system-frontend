'use client';

import { useState, useEffect } from 'react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toast } from '@/components/ui/toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Program {
    id: number;
    name: string;
}

export default function TeacherProgramForm({ teacherId }: { teacherId: number }) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [assignedPrograms, setAssignedPrograms] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [programsRes, assignedRes] = await Promise.all([
                http.get('/programs'),
                http.get(`/teacher-programs?teacher_id=${teacherId}`),
            ]);
            setPrograms(programsRes.data.data || []);
            setAssignedPrograms(assignedRes.data.data.map((item: any) => item.program_id) || []);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [teacherId]);

    const toggleProgram = async (programId: number, isAssigned: boolean) => {
        try {
            if (isAssigned) {
                await http.post('/teacher-programs', [
                    { teacher_id: teacherId, program_id: programId },
                ]);
                setAssignedPrograms([...assignedPrograms, programId]);
                toast.add({ title: 'Success', type: 'success', description: 'Program assigned' });
            } else {
                await http.delete('/teacher-programs', {
                    data: { teacher_id: teacherId, program_id: programId },
                });
                setAssignedPrograms(assignedPrograms.filter((id) => id !== programId));
                toast.add({ title: 'Success', type: 'success', description: 'Program unassigned' });
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            {programs.map((program) => (
                <div key={program.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={`program-${program.id}`}
                        checked={assignedPrograms.includes(program.id)}
                        onCheckedChange={(checked) => toggleProgram(program.id, !!checked)}
                    />
                    <Label htmlFor={`program-${program.id}`} className="uppercase">
                        {program.name}
                    </Label>
                </div>
            ))}
        </div>
    );
}
