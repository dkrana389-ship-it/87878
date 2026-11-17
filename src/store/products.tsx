import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import { removeFile } from '../lib/files';
import { rescheduleAll } from '../lib/notifications';
import { useSettings } from './settings';

type Ctx = {
  products: Product[];
  loading: boolean;
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getProduct: (id?: string) => Product | undefined;
};
const C = createContext<Ctx>(null as unknown as Ctx);
const KEY = 'wr:products:local';

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<Product[]>([]);

  const commit = useCallback((list: Product[]) => {
    ref.current = list;
    setProducts(list);
    AsyncStorage.setItem(KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        ref.current = raw ? JSON.parse(raw) : [];
        setProducts(ref.current);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // keep phone notifications in step with products + reminder settings
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => rescheduleAll(products, settings), 500);
    return () => clearTimeout(t);
  }, [products, loading, settings.notificationsEnabled, settings.reminderDays, settings.reminderHour]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProduct = useCallback(async (p: Product) => {
    const old = ref.current.find((x) => x.id === p.id);
    if (old?.photo_uri && old.photo_uri !== p.photo_uri) await removeFile(old.photo_uri);
    if (old?.bill_uri && old.bill_uri !== p.bill_uri) await removeFile(old.bill_uri);
    const next = { ...p, updated_at: new Date().toISOString() };
    commit(old ? ref.current.map((x) => (x.id === p.id ? next : x)) : [next, ...ref.current]);
  }, [commit]);

  const deleteProduct = useCallback(async (id: string) => {
    const old = ref.current.find((x) => x.id === id);
    await removeFile(old?.photo_uri);
    await removeFile(old?.bill_uri);
    commit(ref.current.filter((x) => x.id !== id));
  }, [commit]);

  const clearAll = useCallback(async () => {
    for (const p of ref.current) {
      await removeFile(p.photo_uri);
      await removeFile(p.bill_uri);
    }
    commit([]);
  }, [commit]);

  const getProduct = useCallback((id?: string) => products.find((p) => p.id === id), [products]);

  return <C.Provider value={{ products, loading, saveProduct, deleteProduct, clearAll, getProduct }}>{children}</C.Provider>;
}

export const useProducts = () => useContext(C);
