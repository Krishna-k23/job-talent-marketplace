import React, { useState, useEffect } from 'react';
import {
    Server, Database, Globe, Shield, Activity, CheckCircle,
    XCircle, AlertCircle, Loader2, RefreshCw, Sparkles,
    Clock, Zap, HardDrive, Cpu, Wifi, Mail, Lock,
    Crown, Settings, BarChart3, PieChart, TrendingUp,
    Bell
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '@/app/components/common/StatusBadge';
import { apiGet, apiPost } from '@/config/api';

interface ServiceHealth {
    service_name: string;
    status: 'healthy' | 'degraded' | 'down';
    response_time: number;
    error_rate: number;
    last_check: string;
    details?: any;
    uptime_percentage?: number;
}

export default function SuperAdminSystem() {
    const { showSuccess, showError } = useToast();
    const [services, setServices] = useState<ServiceHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await apiGet('/superadmin/system/health');
            // Don't hardcode any values - just use the data as-is from the API
            setServices(data || []);
        } catch (err) {
            showError('Failed to load service health');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadServices, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await apiPost('/superadmin/system/health/check');
            await loadServices();
            showSuccess('Service health refreshed');
        } catch (err) {
            showError('Failed to refresh service health');
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle size={20} className="text-emerald-500" />;
            case 'degraded':
                return <AlertCircle size={20} className="text-amber-500" />;
            case 'down':
                return <XCircle size={20} className="text-red-500" />;
            default:
                return <Activity size={20} className="text-slate-400" />;
        }
    };

    const getServiceIcon = (name: string) => {
        const icons: Record<string, any> = {
            'API': Server,
            'Database': Database,
            'Auth Service': Shield,
            'Email Service': Mail,
            'Payment Service': Lock,
            'Notification Service': Bell,
            'Storage Service': HardDrive,
        };
        const Icon = icons[name] || Server;
        return <Icon size={18} className="text-slate-500" />;
    };

    const stats = {
        total: services.length,
        healthy: services.filter(s => s.status === 'healthy').length,
        degraded: services.filter(s => s.status === 'degraded').length,
        down: services.filter(s => s.status === 'down').length,
        avgResponse: services.length > 0
            ? Math.round(services.reduce((acc, s) => acc + s.response_time, 0) / services.length)
            : 0,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Crown size={20} className="text-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-3 py-1 rounded-full">
                            Super Admin
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Server size={28} className="text-rose-500" />
                        System Health
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Monitor all platform services and system performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={`text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        Auto-refresh: 30s
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Services</div>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.healthy}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Healthy</div>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.degraded}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Degraded</div>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.down}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Down</div>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgResponse}ms</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Avg Response</div>
                </div>
            </div>

            {/* Services List */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">Service Status</h2>
                </div>
                <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                    {services.map((service) => (
                        <div key={service.service_name} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(service.status)}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {getServiceIcon(service.service_name)}
                                            <span className="font-medium text-slate-800 dark:text-slate-100">
                                                {service.service_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            <span>Response: {service.response_time}ms</span>
                                            <span>Error Rate: {service.error_rate}%</span>
                                            {service.uptime_percentage !== undefined && (
                                                <span>Uptime: {service.uptime_percentage}%</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(service.last_check).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={service.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                            <Cpu size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">CPU Usage</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Current load</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">24%</span>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Normal</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                            <HardDrive size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Memory Usage</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">RAM utilization</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">52%</span>
                        <span className="text-sm text-amber-600 dark:text-amber-400">Moderate</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: '52%' }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                            <Wifi size={20} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Network</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Bandwidth usage</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">8%</span>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Low</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}