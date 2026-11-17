import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/ui';
import { ProductForm } from '../../src/components/ProductForm';
import { useProducts } from '../../src/store/products';

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getProduct, saveProduct } = useProducts();
  const p = getProduct(id);
  if (!p) return <Screen><Text>Product not found.</Text></Screen>;
  return (
    <Screen>
      <ProductForm
        initial={p}
        submitLabel="Update Product"
        onSubmit={async (u) => {
          await saveProduct(u);
          router.back();
        }}
      />
    </Screen>
  );
}
