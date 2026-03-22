// ============================================================
// ZAPP Donuts ERP - Forecaster Dashboard
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  Target,
  BarChart3,
  Flame,
  Snowflake,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const PRESSURE_COLORS = { hot: '#EF4444', normal: '#22C55E', weak: '#3B82F6' };

export function ForecasterDashboard() {
  const [loading, setLoading] = useState(true);

  const forecasts = useStore((s) => s.forecasts);
  const stores = useStore((s) => s.stores);
  const currentUser = useStore((s) => s.currentUser);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter by plant if user has plantId
  const plantForecasts = useMemo(() => {
    if (currentUser?.plantId) {
      const plantStoreIds = stores.filter((s) => s.plantId === currentUser.plantId).map((s) => s.id);
      return forecasts.filter((f) => plantStoreIds.includes(f.storeId));
    }
    return forecasts;
  }, [forecasts, stores, currentUser]);

  // ── KPI Calculations ────────────────────────────────────────
  const kpis = useMemo(() => {
    const allItems = plantForecasts.flatMap((f) => f.items);
    const withActual = allItems.filter((i) => i.actualSold !== undefined && i.actualSold !== null);

    // Forecast accuracy: 1 - avg(|forecast - actual| / forecast)
    let accuracy = 0;
    if (withActual.length > 0) {
      const totalError = withActual.reduce((sum, i) => {
        const err = Math.abs(i.finalForecast - (i.actualSold ?? 0));
        return sum + (i.finalForecast > 0 ? err / i.finalForecast : 0);
      }, 0);
      accuracy = Math.max(0, (1 - totalError / withActual.length) * 100);
    }

    const hotStores = new Set(
      plantForecasts
        .filter((f) => f.items.some((i) => i.demandPressure === 'hot'))
        .map((f) => f.storeId),
    ).size;

    const weakStores = new Set(
      plantForecasts
        .filter((f) => f.items.some((i) => i.demandPressure === 'weak'))
        .map((f) => f.storeId),
    ).size;

    return {
      accuracy: accuracy.toFixed(1),
      totalForecasts: plantForecasts.length,
      hotStores,
      weakStores,
    };
  }, [plantForecasts]);

  // ── Forecast vs Actual ──────────────────────────────────────
  const forecastVsActual = useMemo(() => {
    // Aggregate by store (latest forecast per store)
    const latestByStore = new Map<string, typeof plantForecasts[0]>();
    plantForecasts.forEach((f) => {
      const existing = latestByStore.get(f.storeId);
      if (!existing || f.date > existing.date) {
        latestByStore.set(f.storeId, f);
      }
    });

    return Array.from(latestByStore.values())
      .slice(0, 10)
      .map((f) => {
        const storeName = stores.find((s) => s.id === f.storeId)?.name ?? f.storeId;
        const forecast = f.items.reduce((s, i) => s + i.finalForecast, 0);
        const actual = f.items.reduce((s, i) => s + (i.actualSold ?? 0), 0);
        return {
          store: storeName.replace('ZAPP ', ''),
          forecast,
          actual,
        };
      });
  }, [plantForecasts, stores]);

  // ── Demand Pressure Distribution ────────────────────────────
  const pressureDistribution = useMemo(() => {
    const allItems = plantForecasts.flatMap((f) => f.items);
    const hot = allItems.filter((i) => i.demandPressure === 'hot').length;
    const normal = allItems.filter((i) => i.demandPressure === 'normal').length;
    const weak = allItems.filter((i) => i.demandPressure === 'weak').length;
    return [
      { name: 'Hot', value: hot, color: PRESSURE_COLORS.hot },
      { name: 'Normal', value: normal, color: PRESSURE_COLORS.normal },
      { name: 'Weak', value: weak, color: PRESSURE_COLORS.weak },
    ];
  }, [plantForecasts]);

  // ── Stores Needing Forecast Update ──────────────────────────
  const storesNeedingUpdate = useMemo(() => {
    const plantStoreIds = currentUser?.plantId
      ? stores.filter((s) => s.plantId === currentUser.plantId && s.status === 'active').map((s) => s.id)
      : stores.filter((s) => s.status === 'active').map((s) => s.id);

    const forecastedStoreIds = new Set(plantForecasts.map((f) => f.storeId));

    return plantStoreIds
      .filter((id) => !forecastedStoreIds.has(id))
      .map((id) => stores.find((s) => s.id === id))
      .filter(Boolean)
      .slice(0, 8);
  }, [plantForecasts, stores, currentUser]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Skeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forecaster Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Demand forecasting and accuracy metrics</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={<Target size={20} />}
          label="Forecast Accuracy"
          value={`${kpis.accuracy}%`}
          change={2.5}
        />
        <Stat
          icon={<BarChart3 size={20} />}
          label="Total Forecasts"
          value={kpis.totalForecasts}
        />
        <Stat
          icon={<Flame size={20} />}
          label="HOT Demand Stores"
          value={kpis.hotStores}
        />
        <Stat
          icon={<Snowflake size={20} />}
          label="WEAK Demand Stores"
          value={kpis.weakStores}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast vs Actual */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">Forecast vs Actual (by Store)</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={forecastVsActual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="store" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="forecast" fill="#FF6B00" name="Forecast" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#22C55E" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Pressure Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">Demand Pressure Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pressureDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pressureDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stores Needing Forecast Update */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Stores Needing Forecast Update</h3>
        </CardHeader>
        <CardContent>
          {storesNeedingUpdate.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">All stores have forecasts.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {storesNeedingUpdate.map((store) => (
                <div
                  key={store!.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{store!.name}</p>
                    <p className="text-xs text-gray-500">{store!.area}</p>
                  </div>
                  <Badge variant="warning" size="sm">
                    No Forecast
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
