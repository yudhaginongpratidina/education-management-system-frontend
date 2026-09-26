// ui components
import { FieldDescription } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// module components
import LoginForm from '@/modules/authentication/login.form';

export const metadata = {
    title: 'Masuk',
};

export default function Page() {
    return (
        <>
            <Card className="border-border/60 shadow-soft">
                <CardHeader className="gap-2 text-center">
                    <CardTitle className="text-2xl">Selamat datang kembali 👋</CardTitle>
                    <CardDescription>
                        Masuk untuk mengelola bimbel Anda. Gunakan email dan password akun Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
            <FieldDescription className="px-2 text-center text-xs">
                Dengan melanjutkan, Anda menyetujui{' '}
                <a href="#" className="text-primary hover:underline">
                    Syarat Layanan
                </a>{' '}
                dan{' '}
                <a href="#" className="text-primary hover:underline">
                    Kebijakan Privasi
                </a>
                .
            </FieldDescription>
        </>
    );
}
