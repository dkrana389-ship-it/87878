import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/ui';
import { ProductForm } from '../../src/components/ProductForm';
import { useProducts } from '../../src/store/products';

export default function AddProduct() {
  const router = useRouter();
  const { saveProduct } = useProducts();
  const [formKey, setFormKey] = useState(0);
  return (
    <Screen>
      <ProductForm
        key={formKey}
        submitLabel="Save Product"
        onSubmit={async (p) => {
          await saveProduct(p);
          setFormKey((k) => k + 1);
          Alert.alert('Saved ✅', 'Product added. Reminders are scheduled automatically.');
          router.push(`/product/${p.id}` as any);
        }}
      />
    </Screen>
  );
}
