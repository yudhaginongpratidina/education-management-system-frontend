'use client';

// dependencies
import { Icon } from '@iconify/react';

// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// module components
import MySessionList from '@/modules/teacher-session/my-session-list';
import MySchedule from '@/modules/teacher-session/my-schedule';

export default function MySessionDashboard() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-gradient p-2.5 text-primary-foreground shadow-brand">
                    <Icon icon="mdi:teach" className="size-5" />
                </div>
                <div>
                    <h1 className="font-heading text-lg font-semibold">Kelas Saya</h1>
                    <p className="text-muted-foreground text-sm">
                        Jadwal mengajar dan absensi siswa pada sesi Anda.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="sessions">
                <TabsList>
                    <TabsTrigger value="sessions">
                        <Icon icon="mdi:calendar-clock" /> Sesi Saya
                    </TabsTrigger>
                    <TabsTrigger value="schedule">
                        <Icon icon="mdi:calendar-week" /> Jadwal Saya
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="sessions" className="space-y-4">
                    <MySessionList />
                </TabsContent>
                <TabsContent value="schedule" className="space-y-4">
                    <MySchedule />
                </TabsContent>
            </Tabs>
        </div>
    );
}
