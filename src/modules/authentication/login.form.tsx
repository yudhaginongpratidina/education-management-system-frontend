// components
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
    return (
        <>
            <form>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@gmail.com"
                            className="h-10"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            className="h-10"
                            required
                        />
                    </Field>
                    <Button type="submit" className="h-10">
                        Login
                    </Button>
                    <FieldDescription className="text-center">
                        Don&apos;t have an account? <a href="#"> Sign up</a>
                    </FieldDescription>
                </FieldGroup>
            </form>
        </>
    );
}
