import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function Page() {
    return (
        <>
            <div className="w-full p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Guru</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            10
                        </CardTitle>
                        <CardAction>
                            <Info className="size-4" />
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Guru aktif dan terdaftar
                        </div>
                        <div className="text-muted-foreground">
                            Total guru yang terdaftar dalam sistem
                        </div>
                    </CardFooter>
                </Card>
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Siswa</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            10
                        </CardTitle>
                        <CardAction>
                            <Info className="size-4" />
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Siswa aktif dan terdaftar
                        </div>
                        <div className="text-muted-foreground">
                            Total siswa yang terdaftar dalam sistem
                        </div>
                    </CardFooter>
                </Card>
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Program</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            10
                        </CardTitle>
                        <CardAction>
                            <Info className="size-4" />
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Program aktif dan terdaftar
                        </div>
                        <div className="text-muted-foreground">
                            Total program yang terdaftar dalam sistem
                        </div>
                    </CardFooter>
                </Card>
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Asset</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            10
                        </CardTitle>
                        <CardAction>
                            <Info className="size-4" />
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Asset aktif dan terdaftar
                        </div>
                        <div className="text-muted-foreground">
                            Total asset yang terdaftar dalam sistem
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
