import * as FS from 'expo-file-system/legacy';
import { extOf } from './format';

/** Copy a picked photo/bill into the app's permanent storage on the phone. */
export async function persistFile(uri: string, id: string, kind: 'photo' | 'bill', name?: string): Promise<string> {
  const dir = `${FS.documentDirectory}warranty/`;
  await FS.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  const ext = extOf(name || uri, kind === 'photo' ? 'jpg' : 'pdf');
  const dest = `${dir}${id}-${kind}-${Date.now()}.${ext}`;
  await FS.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function removeFile(uri?: string | null) {
  if (!uri) return;
  await FS.deleteAsync(uri, { idempotent: true }).catch(() => {});
}
