// ui components
import { FieldDescription } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// module components
import LoginForm from '@/modules/authentication/login.form';

export default function Page() {
    return (
        <>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>Please enter your email and password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>
                <FieldDescription className="px-6 text-center">
                    By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
                    <a href="#">Privacy Policy</a>.
                </FieldDescription>
            </div>
        </>
    );
}
