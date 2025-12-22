import React, { useState } from 'react'
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Modal,
  ScrollView,
  Button,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Invoice } from '../App'

interface InvoiceListScreenProps {
  invoices: Invoice[]
}

export default function InvoiceListScreen({
  invoices,
}: InvoiceListScreenProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const renderItem: ListRenderItem<Invoice> = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-2 rounded-lg border border-gray-200"
      onPress={() => setSelectedInvoice(item)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold mb-1" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View className="items-end justify-center">
          <Text className="text-xl font-bold text-blue-600">
            B/.{item.total ? item.total.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mt-1 pt-2 border-t border-gray-100">
        <Text className="text-gray-400 text-xs">
          Reg: {new Date(item.createdAt || item.date).toLocaleDateString()}
        </Text>
        <Text className="text-gray-400 text-xs text-right">
          Emisión:{' '}
          {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedInvoice}
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-xl h-[85%] p-4">
            <View className="flex-row justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <Text className="text-xl font-bold">Detalles de Factura</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <ScrollView className="flex-1">
                <Text className="text-lg font-semibold mb-1">
                  {selectedInvoice.title}
                </Text>
                <Text className="text-gray-500 mb-4">
                  {selectedInvoice.description}
                </Text>

                {selectedInvoice.emisor && (
                  <View className="bg-gray-50 p-3 rounded-lg mb-4">
                    <Text className="font-bold text-gray-700 mb-1">Emisor</Text>
                    <Text>Nombre: {selectedInvoice.emisor.nombre}</Text>
                    <Text>
                      RUC: {selectedInvoice.emisor.ruc} - DV:{' '}
                      {selectedInvoice.emisor.dv}
                    </Text>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="font-bold text-lg mb-2">Productos</Text>
                  {selectedInvoice.products?.map((prod, index) => (
                    <View
                      key={index}
                      className="flex-row justify-between border-b border-gray-100 py-2"
                    >
                      <View className="flex-1 mr-2">
                        <Text className="font-medium">{prod.descripcion}</Text>
                        <Text className="text-gray-500 text-xs">
                          {prod.cantidad} x B/.{prod.precioUnitario.toFixed(2)}
                        </Text>
                      </View>
                      <Text className="font-bold">
                        B/.{prod.precioTotal.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {!selectedInvoice.products && (
                    <Text className="text-gray-500 italic">
                      No hay detalles de productos disponibles.
                    </Text>
                  )}
                </View>

                {selectedInvoice.total !== undefined && (
                  <View className="mt-4 pt-4 border-t border-gray-200">
                    {selectedInvoice.descuentos !== undefined &&
                      selectedInvoice.descuentos > 0 && (
                        <Text className="text-gray-500 text-right mb-1">
                          Descuentos: -B/.
                          {selectedInvoice.descuentos.toFixed(2)}
                        </Text>
                      )}
                    {selectedInvoice.itbms !== undefined &&
                      selectedInvoice.itbms > 0 && (
                        <Text className="text-gray-500 text-right mb-1">
                          ITBMS: B/.{selectedInvoice.itbms.toFixed(2)}
                        </Text>
                      )}
                    <Text className="text-xl font-bold text-right">
                      Total: B/.{selectedInvoice.total.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View className="h-8" />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
