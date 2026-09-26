'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';

// components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

// module components
import StudentForm from '@/modules/student/student-form';
import StudentProgramForm from '@/modules/student/student-program-form';

export default function Page() {
    const [student, setStudent] = useState<any | null>(null);

    const handleStudentCreated = async (created: any) => {
        if (created?.id) {
            setStudent(created);
            return;
        }

        // Fallback: resolve the created student by name + guardian phone.
        try {
            const response = await http.get('/students');
            const list = extractList(response.data);
            const match = list.find(
                (item: any) =>
                    item.full_name === created?.full_name &&
                    (item.guardian_phone_number ?? null) ===
                        (created?.guardian_phone_number ?? null),
            );
            setStudent(match ?? { ...created, id: undefined });
            if (!match) {
                toast.add({
                    title: 'Perhatian',
                    type: 'error',
                    description:
                        'Siswa tersimpan, namun ID tidak ditemukan. Assign program lewat menu Manajemen Siswa.',
                });
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
            setStudent({ ...created, id: undefined });
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <div>
                <h1 className="text-lg font-semibold">Pendaftaran Siswa Baru</h1>
                <p className="text-muted-foreground text-sm">
                    Lengkapi data siswa terlebih dahulu, kemudian assign program yang diambil.
                </p>
            </div>

            {!student && (
                <Card>
                    <CardHeader>
                        <CardTitle>1. Data Siswa</CardTitle>
                        <CardDescription>
                            Isi data siswa dan orang tua / wali. Tanda * wajib diisi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StudentForm type="create" onSuccess={handleStudentCreated} />
                    </CardContent>
                </Card>
            )}

            {student && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Siswa Tersimpan</CardTitle>
                            <CardDescription>
                                {student.full_name}
                                {student.school_level ? ` • ${student.school_level}` : ''}
                                {student.guardian_phone_number
                                    ? ` • ${student.guardian_phone_number}`
                                    : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="h-10"
                                onClick={() => setStudent(null)}
                            >
                                <Icon icon="mdi:account-plus" /> Daftarkan Siswa Lain
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Program Siswa</CardTitle>
                            <CardDescription>
                                Assign program, paket, level, dan harga untuk siswa ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {student.id ? (
                                <StudentProgramForm
                                    type="create"
                                    studentId={student.id}
                                    onSuccess={() => setStudent(null)}
                                />
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    ID siswa tidak tersedia. Silakan assign program melalui menu
                                    Manajemen Siswa.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
