'use client';

// dependencies
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

// utils
import { http } from '@/lib/http';
import { decodeJWT } from '@/lib/decode-jwt';
import { parseAxiosError } from '@/lib/parse-axios-error';

// components
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';

const formSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.post('/auth/login', values);
            const { access_token } = response.data.data;
            const decoded = decodeJWT(access_token);
            console.log('decoded', decoded?.sub);

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', decoded?.role || '');
            localStorage.setItem('user_id', decoded?.sub || '');

            const roleMenu = await http.get(`/role-menus/${decoded?.role}`);
            let menuData = roleMenu.data.data;

            if (decoded?.role === 'guru') {
                const current = await http.get(`/auth/me`);
                const data = current.data.data;
                // console.log('data', data);

                const teacher = await http.get(`/teachers?slug=${data.slug}`);
                // console.log('teacher', teacher.data.data[0]);

                if (teacher.data.data[0].position !== 'kepala sekolah') {
                    menuData = menuData.filter((menu: any) => menu.slug !== 'persetujuan-absensi');
                }
            }

            localStorage.setItem('menu', JSON.stringify(menuData));

            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    {...field}
                                    id="email"
                                    type="email"
                                    placeholder="user@gmail.com"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    {...field}
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Button type="submit" className="h-10">
                        Login
                    </Button>
                </FieldGroup>
            </form>
        </>
    );
}
