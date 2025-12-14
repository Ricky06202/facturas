import React from 'react'
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export interface Invoice {
  id: string
  url: string
  title: string
  description: string
  date: string
}

interface InvoiceListScreenProps {
  invoices: Invoice[]
}

export default function InvoiceListScreen({
  invoices,
}: InvoiceListScreenProps) {
  const renderItem: ListRenderItem<Invoice> = ({ item }) => (
    <TouchableOpacity className="bg-white p-4 mb-2 rounded-lg border border-gray-200">
      <Text className="text-base font-bold mb-1">{item.title}</Text>
      <Text className="text-gray-500 text-sm mb-2">{item.description}</Text>
      <Text className="text-blue-600 text-xs mb-0.5">{item.url}</Text>
      <Text className="text-gray-400 text-xs">
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {invoices.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-center font-bold text-lg">
            No hay facturas guardadas. Escanea un código QR para agregar una.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          className="flex-1 p-4"
        />
      )}
    </SafeAreaView>
  )
}
