import React from 'react';
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  itemUrl: {
    color: '#2563eb',
    fontSize: 12,
    marginBottom: 2,
  },
  itemDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
});

export default function InvoiceListScreen({ invoices }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <Text style={styles.itemUrl}>{item.url}</Text>
      <Text style={styles.itemDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {invoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay facturas guardadas. Escanea un código QR para agregar una.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}
