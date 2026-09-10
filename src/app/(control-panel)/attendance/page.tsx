'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Camera } from '@/components/ui/camera';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

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

function getLocalISOTimestamp() {
    const now = new Date();
    // Returns format: YYYY-MM-DDTHH:MM:SSZ
    return now.toISOString().split('.')[0] + 'Z';
}

type AttendanceTab = 'masuk' | 'pulang' | 'ijin';

export default function AttendancePage() {
    const [attendanceType, setAttendanceType] = useState<AttendanceTab>('masuk');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [todayRecord, setTodayRecord] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [successResult, setSuccessResult] = useState<any | null>(null);
    const [noAttendanceMessage, setNoAttendanceMessage] = useState<string | null>(null);

    // Branch selection state
    const [assignedBranches, setAssignedBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    // Location state
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Ijin state
    const [ijinType, setIjinType] = useState<string>('');
    const [ijinReason, setIjinReason] = useState<string>('');

    const selectedBranch = useMemo(
        () => assignedBranches.find((b) => b.branch_id.toString() === selectedBranchId),
        [assignedBranches, selectedBranchId],
    );

    const isInRange = useMemo(() => {
        if (!selectedBranch || distance === null) return false;
        const radius = parseFloat(selectedBranch.radius);
        return distance <= radius;
    }, [distance, selectedBranch]);

    const fetchBranches = useCallback(async () => {
        try {
            const current = await http.get(`/auth/me`);
            const data = current.data.data;
            const teacher = await http.get(`/teachers?slug=${data.slug}`);

            const res = await http.get(`/teacher-branches/${teacher.data.data[0].id}`);
            setAssignedBranches(res.data.data);
        } catch (e) {
            console.error('Failed to fetch branches', e);
        }
    }, []);

    const fetchTodayAttendance = useCallback(async () => {
        try {
            setNoAttendanceMessage(null);
            const current = await http.get(`/auth/me`);
            const data = current.data.data;
            const teacher = await http.get(`/teachers?slug=${data.slug}`);
            const teacher_id = teacher.data.data[0].id;
            console.log('teacher_id', teacher_id);
            const res = await http.get(`/teacher-attendances?teacher_id=${teacher_id}`);
            console.log('res', res);
            const dataList = Array.isArray(res.data) ? res.data : res.data.data || [];
            console.log('dataList:', dataList);

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            console.log('dateStr:', dateStr);

            // Filter all records for today
            const todayRecords = dataList.filter((d: any) => {
                // Gunakan attendance_date jika ada, karena itu merepresentasikan tanggal absen yang benar
                const dateToCompare = d.attendance_date;

                if (!dateToCompare) return false;

                // Ambil bagian YYYY-MM-DD dari string ISO (karena backend mengirim 2026-09-11T00:00:00.000Z)
                const recordDate = dateToCompare.split('T')[0];

                return recordDate === dateStr;
            });
            console.log('todayRecords:', todayRecords);

            setTodayRecord(todayRecords.length > 0 ? todayRecords : null);
            setNoAttendanceMessage(null); // Reset message
        } catch (e: any) {
            if (e.response?.data?.error?.code === 'ATTENDANCE_NOT_FOUND') {
                setNoAttendanceMessage('Hari ini Anda belum melakukan absen masuk.');
            } else {
                console.error("Failed to fetch today's attendance", e);
            }
        }
    }, []);

    const fetchLocation = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (!navigator.geolocation) {
            setLocationError('Geolocation tidak didukung.');
            return;
        }

        if (!selectedBranch) return;

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
                setDistance(
                    calculateDistance(
                        latitude,
                        longitude,
                        parseFloat(selectedBranch.latitude),
                        parseFloat(selectedBranch.longitude),
                    ),
                );
                setLoadingLocation(false);
            },
            (error) => {
                setLocationError('Gagal mendapatkan lokasi.');
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true },
        );
    }, [selectedBranch]);

    useEffect(() => {
        fetchBranches();
        fetchTodayAttendance();
    }, [fetchBranches, fetchTodayAttendance]);

    useEffect(() => {
        if (selectedBranch) {
            fetchLocation();
        }
    }, [selectedBranch, fetchLocation]);

    const handleCapture = useCallback((file: File, preview: string) => {
        setPhotoFile(file);
    }, []);

    const handleSubmit = async () => {
        if (!selectedBranchId) {
            alert('Pilih cabang terlebih dahulu');
            return;
        }

        const existingRecord = todayRecord
            ? Array.isArray(todayRecord)
                ? todayRecord.find((r: any) => r.branch_id.toString() === selectedBranchId)
                : todayRecord.branch_id.toString() === selectedBranchId
                  ? todayRecord
                  : null
            : null;

        if (existingRecord) {
            if (existingRecord.status === 'PRESENT' && attendanceType === 'ijin') {
                alert('Anda sudah melakukan check-in di cabang ini, tidak bisa mengajukan ijin.');
                return;
            }
            if (existingRecord.status !== 'PRESENT' && attendanceType !== 'ijin') {
                alert(
                    `Anda sudah mengajukan ijin/sakit (${existingRecord.status}) di cabang ini, tidak bisa melakukan absen.`,
                );
                return;
            }
        }

        setLoading(true);
        try {
            const current = await http.get(`/auth/me`);
            const data = current.data.data;
            const teacher = await http.get(`/teachers?slug=${data.slug}`);
            const teacher_id = teacher.data.data[0].id;

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            let photoSlug = null;
            if (attendanceType !== 'ijin' && photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);
                const uploadRes = await http.post('/storage', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                photoSlug = uploadRes.data.data.slug;
            }

            if (attendanceType === 'ijin') {
                const payload: any = {
                    teacher_id: Number(teacher_id),
                    branch_id: Number(selectedBranchId),
                    attendance_date: dateStr,
                    status: ijinType.toUpperCase(),
                    notes: ijinReason || null,
                    is_approved: false,
                };
                await http.post('/teacher-attendances', payload);
                setSuccessResult({
                    status: 'Berhasil',
                    time: new Date().toLocaleTimeString('id-ID'),
                });
            } else if (attendanceType === 'masuk') {
                if (existingRecord && existingRecord.check_in_at) {
                    alert('Anda sudah melakukan check-in di cabang ini hari ini.');
                    return;
                }

                const payload: any = {
                    teacher_id: Number(teacher_id),
                    branch_id: Number(selectedBranchId),
                    status: 'PRESENT',
                    attendance_date: dateStr,
                    check_in_at: getLocalISOTimestamp(),
                    check_in_photo: photoSlug,
                    check_in_latitude: coords?.latitude.toString() || null,
                    check_in_longitude: coords?.longitude.toString() || null,
                    is_approved: true,
                };
                await http.post('/teacher-attendances', payload);
                setSuccessResult({
                    status: 'Berhasil Check-in',
                    time: new Date().toLocaleTimeString('id-ID'),
                });
            } else if (attendanceType === 'pulang') {
                if (!existingRecord || !existingRecord.id) {
                    alert('Data absen tidak ditemukan untuk cabang ini.');
                    return;
                }

                if (existingRecord.check_out_at) {
                    alert('Anda sudah melakukan check-out di cabang ini hari ini.');
                    return;
                }

                const payload: any = {
                    teacher_id: Number(existingRecord.teacher_id),
                    branch_id: Number(existingRecord.branch_id),
                    status: 'PRESENT',
                    attendance_date: existingRecord.attendance_date,
                    check_in_at: existingRecord.check_in_at,
                    check_in_photo: existingRecord.check_in_photo,
                    check_out_at: getLocalISOTimestamp(),
                    check_out_photo: photoSlug,
                    check_in_latitude: existingRecord.check_in_latitude,
                    check_in_longitude: existingRecord.check_in_longitude,
                    check_out_latitude: coords?.latitude.toString() || null,
                    check_out_longitude: coords?.longitude.toString() || null,
                    is_approved: true,
                };

                await http.patch(`/teacher-attendances/${existingRecord.id}`, payload);
                setSuccessResult({
                    status: 'Berhasil Check-out',
                    time: new Date().toLocaleTimeString('id-ID'),
                });
            }
            await fetchTodayAttendance();
        } catch (error) {
            const { message } = parseAxiosError(error);
            console.error('Attendance error:', error);
            alert(`Gagal mengirim data: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="w-full space-y-4">
                <Select value={selectedBranchId || ''} onValueChange={setSelectedBranchId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Cabang">
                            {selectedBranch ? selectedBranch.branch_name : 'Pilih Cabang'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {assignedBranches.map((branch) => (
                            <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                                {branch.branch_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedBranchId && (
                    <>
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
                                        <SelectItem value="sick">Sakit</SelectItem>
                                        <SelectItem value="leave">Izin</SelectItem>
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

                        {attendanceType !== 'ijin' && (
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
                        )}
                    </>
                )}

                {todayRecord &&
                    (() => {
                        const branchRecord = Array.isArray(todayRecord)
                            ? todayRecord.find(
                                  (r: any) => r.branch_id.toString() === selectedBranchId,
                              )
                            : todayRecord.branch_id.toString() === selectedBranchId
                              ? todayRecord
                              : null;
                        return branchRecord && branchRecord.check_in_at ? (
                            <div className="p-4 bg-blue-50 text-blue-800 rounded-sm text-sm border border-blue-200 space-y-1">
                                <p className="font-semibold">Status Absen Hari Ini:</p>
                                <p>Cabang: {branchRecord.branch_name}</p>
                                <p>
                                    Check-in:{' '}
                                    {new Date(branchRecord.check_in_at).toLocaleTimeString('id-ID')}
                                </p>
                                {branchRecord.check_out_at && (
                                    <>
                                        <p>
                                            Check-out:{' '}
                                            {new Date(branchRecord.check_out_at).toLocaleTimeString(
                                                'id-ID',
                                            )}
                                        </p>
                                        <p>
                                            Durasi:{' '}
                                            {(() => {
                                                const diff =
                                                    new Date(branchRecord.check_out_at).getTime() -
                                                    new Date(branchRecord.check_in_at).getTime();
                                                const hours = Math.floor(diff / 3600000);
                                                const minutes = Math.floor(
                                                    (diff % 3600000) / 60000,
                                                );
                                                return `${hours} jam ${minutes} menit`;
                                            })()}
                                        </p>
                                    </>
                                )}
                                <p>Status: {branchRecord.status}</p>
                            </div>
                        ) : null;
                    })()}

                {noAttendanceMessage && (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-sm text-sm border border-yellow-200">
                        {noAttendanceMessage}
                    </div>
                )}

                {successResult && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-sm text-sm">
                        Berhasil: {successResult.status} pada {successResult.time}
                    </div>
                )}
            </div>
        </div>
    );
}
