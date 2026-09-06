'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera } from '@/components/ui/camera';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { http } from '@/lib/http';

const OFFICE_COORDS = { lat: -6.317564948814179, lng: 106.6872056153437 };
const MAX_ALLOWED_DISTANCE_METERS = 3000;

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

type AttendanceTab = 'masuk' | 'pulang' | 'ijin';

export default function Page() {
    const [attendanceType, setAttendanceType] = useState<AttendanceTab>('masuk');
    const [todayRecord, setTodayRecord] = useState<any | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [successResult, setSuccessResult] = useState<any | null>(null);

    // Location state
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Ijin state
    const [ijinType, setIjinType] = useState<string>('');
    const [ijinReason, setIjinReason] = useState<string>('');

    const isInRange = useMemo(
        () => distance !== null && distance <= MAX_ALLOWED_DISTANCE_METERS,
        [distance],
    );

    const fetchTodayAttendance = useCallback(async () => {
        const user_id = localStorage.getItem('user_id');
        const teacher_id = user_id ? parseInt(user_id) : 1;

        try {
            const res = await http.get(`/teacher-attendances?teacher_id=${teacher_id}`);
            // Log structure to verify
            console.log('API Response:', res.data);

            const dataList = Array.isArray(res.data) ? res.data : res.data.data || [];

            // Debug: Log the list to be searched
            console.log('Data list to search:', dataList);

            // Match record. Try matching based on date, if that fails, try matching the most recent record.
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            let record = dataList.find((d: any) => {
                const dateToCompare = d.check_in_at || d.created_at || d.attendance_date;
                const recordDate = dateToCompare
                    ? new Date(dateToCompare).toISOString().split('T')[0]
                    : '';
                return recordDate === todayStr;
            });

            // Fallback: If no date match, take the most recent record if it exists
            if (!record && dataList.length > 0) {
                console.log('No date match, falling back to most recent record');
                record = dataList.sort(
                    (a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                )[0];
            }

            setTodayRecord(record || null);
        } catch (e) {
            console.error("Failed to fetch today's attendance", e);
        }
    }, []);

    const fetchLocation = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (!navigator.geolocation) {
            setLocationError('Geolocation tidak didukung.');
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
                setDistance(
                    calculateDistance(latitude, longitude, OFFICE_COORDS.lat, OFFICE_COORDS.lng),
                );
                setLoadingLocation(false);
            },
            (error) => {
                setLocationError('Gagal mendapatkan lokasi.');
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true },
        );
    }, []);

    useEffect(() => {
        fetchLocation();
        fetchTodayAttendance();
    }, [fetchLocation, fetchTodayAttendance]);

    const handleCapture = useCallback((file: File, preview: string) => {
        setPhotoFile(file);
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        const user_id = localStorage.getItem('user_id');
        const teacher_id = user_id ? parseInt(user_id) : 1;

        const dateStr = new Date().toISOString().split('T')[0];

        try {
            if (attendanceType === 'ijin') {
                const payload: any = {
                    teacher_id,
                    attendance_date: dateStr,
                    status: ijinType.toUpperCase(),
                    notes: ijinReason || null,
                };
                await http.post('/teacher-attendances', payload);
                setSuccessResult({
                    status: 'Berhasil',
                    time: new Date().toLocaleTimeString('id-ID'),
                });
            } else if (attendanceType === 'masuk') {
                // Check if already checked in
                if (todayRecord && todayRecord.check_in_at) {
                    alert('Anda sudah melakukan check-in hari ini.');
                    return;
                }
                // Check if allowed to check in
                if (todayRecord && todayRecord.status !== 'PRESENT') {
                    alert('Tidak dapat melakukan check-in.');
                    return;
                }

                const payload: any = {
                    teacher_id,
                    attendance_date: dateStr,
                    status: 'PRESENT',
                    check_in_at: new Date().toISOString(),
                    check_in_latitude: coords?.latitude || null,
                    check_in_longitude: coords?.longitude || null,
                };
                await http.post('/teacher-attendances', payload);
                setSuccessResult({
                    status: 'Berhasil Check-in',
                    time: new Date().toLocaleTimeString('id-ID'),
                });
            } else if (attendanceType === 'pulang') {
                // Check if can check out
                console.log('Today record check for checkout:', todayRecord);

                if (!todayRecord || !todayRecord.id) {
                    alert('Data absen tidak ditemukan atau ID tidak valid.');
                    return;
                }

                if (todayRecord.status !== 'PRESENT' || !todayRecord.check_in_at) {
                    alert(
                        `Tidak dapat melakukan check-out. Status: ${todayRecord.status}, Check-in: ${todayRecord.check_in_at ? 'Ada' : 'Tidak Ada'}`,
                    );
                    return;
                }
                if (todayRecord.check_out_at) {
                    alert('Anda sudah melakukan check-out hari ini.');
                    return;
                }

                const payload: any = {
                    id: todayRecord.id,
                    teacher_id: Number(teacher_id),
                    status: 'PRESENT',
                    attendance_date: dateStr,
                    check_out_at: new Date().toISOString(),
                    check_out_latitude: coords?.latitude || null,
                    check_out_longitude: coords?.longitude || null,
                };

                console.log(`Patching attendance with payload:`, payload);
                await http.patch(`/teacher-attendances/${todayRecord.id}`, payload);
                setSuccessResult({
                    status: 'Berhasil Check-out',
                    time: new Date().toLocaleTimeString('id-ID'),
                });
            }
            await fetchTodayAttendance();
        } catch (e) {
            console.error(e);
            alert('Gagal mengirim data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="w-full space-y-4">
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-sm">
                    {(['masuk', 'pulang', 'ijin'] as AttendanceTab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => {
                                setAttendanceType(tab);
                                setSuccessResult(null);
                            }}
                            className={cn(
                                'py-2 text-sm font-semibold rounded-sm transition-all cursor-pointer capitalize',
                                attendanceType === tab
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900',
                            )}
                        >
                            {tab === 'ijin' ? 'Ijin' : `Absen ${tab}`}
                        </button>
                    ))}
                </div>

                {attendanceType === 'ijin' ? (
                    <div className="space-y-4 p-4 border border-slate-200 rounded-sm">
                        <Select
                            onValueChange={(v: string | null) => {
                                if (v) setIjinType(v);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Tipe Ijin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sick">SICK</SelectItem>
                                <SelectItem value="leave">LEAVE</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea
                            placeholder="Alasan Ijin..."
                            onChange={(e) => setIjinReason(e.target.value)}
                        />
                    </div>
                ) : (
                    <Camera
                        facingMode="environment"
                        onCapture={handleCapture}
                        onReset={() => setPhotoFile(null)}
                    />
                )}

                {(photoFile || attendanceType === 'ijin') && (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (attendanceType !== 'ijin' && !isInRange)}
                    >
                        {loading ? 'Mengirim...' : 'Submit'}
                    </Button>
                )}

                {/* Debug: display todayRecord status */}
                {/* <div className="p-2 bg-yellow-100 text-xs text-yellow-800 rounded">
                    DEBUG: todayRecord = {JSON.stringify(todayRecord)}
                </div> */}

                <div className="p-4 bg-slate-50 rounded-sm border border-slate-200 text-sm">
                    <p>
                        Status Lokasi:{' '}
                        {loadingLocation
                            ? 'Mengecek...'
                            : locationError ||
                              (isInRange ? 'Dalam jangkauan' : 'Di luar jangkauan')}
                    </p>
                    <p>Jarak: {distance ? `${Math.round(distance)}m` : '-'}</p>
                </div>

                {successResult && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-sm text-sm">
                        Berhasil: {successResult.status} pada {successResult.time}
                    </div>
                )}
            </div>
        </div>
    );
}
