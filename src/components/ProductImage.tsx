import React, { useState } from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useSettings } from '../store/settings';

export function ProductImage({ product, size = 64, radius = 14, style }: { product: Product; size?: number; radius?: number; style?: ViewStyle }) {
  const { colors } = useSettings();
  const [failed, setFailed] = useState(false);
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }, style]}>
      {product.photo_uri && !failed ? (
        <Image source={{ uri: product.photo_uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Ionicons name="cube-outline" size={size * 0.45} color={colors.accent} />
      )}
    </View>
  );
}
