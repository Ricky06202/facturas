import React, { useState, useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
import {
  Text,
  View,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native'
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera'
import { cssInterop } from 'nativewind'

import { Invoice } from '../App'

interface CameraScreenProps {
  navigation: any // Using any for navigation to keep it simple, or could use NavigationProp
  onAddInvoice: (invoice: Invoice) => void
}

cssInterop(CameraView, {
  className: {
    target: 'style',
  },
})

export default function CameraScreen({
  navigation,
  onAddInvoice,
}: CameraScreenProps) {
  const isFocused = useIsFocused()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [scannedUrl, setScannedUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [invoiceData, setInvoiceData] = useState<Partial<Invoice> | null>(null)

  const handleBarCodeScanned = async ({
    type,
    data,
  }: BarcodeScanningResult) => {
    setScanned(true)
    setScannedUrl(data)
    setLoading(true)

    try {
      const response = await fetch(
        'https://facturasapi.rsanjur.com/api/scrape-factura',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: data }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener datos de la factura')
      }

      const result = await response.json()

      // Safe number parsing
      const safeParseFloat = (val: any) => {
        if (typeof val === 'number') return val
        if (typeof val === 'string') return parseFloat(val)
        return 0
      }

      // Date parsing DD/MM/YYYY HH:mm:ss -> ISO
      let isoDate = new Date().toISOString()
      if (result.fecha && typeof result.fecha === 'string') {
        try {
          const [datePart, timePart] = result.fecha.split(' ')
          const [day, month, year] = datePart.split('/')
          isoDate = new Date(
            `${year}-${month}-${day}T${timePart}`
          ).toISOString()
        } catch (e) {
          console.warn('Error parsing date:', e)
        }
      }

      const total = safeParseFloat(result.total)
      const discounts = safeParseFloat(result.descuentos)
      const itbms = safeParseFloat(result.itbms)

      // Parse products if they exist
      const products = result.productos?.map((p: any) => ({
        descripcion: p.descripcion,
        cantidad: safeParseFloat(p.cantidad),
        precioUnitario: safeParseFloat(p.precioUnitario),
        descuento: safeParseFloat(p.descuento),
        precioTotal: safeParseFloat(p.precioTotal),
      }))

      const parsedData = {
        ...result,
        fecha: isoDate,
        total,
        descuentos: discounts,
        itbms,
        products,
      }

      setInvoiceData(parsedData)
      setTitle(result.emisor?.nombre || 'Factura Desconocida')
      setDescription(
        `Total: B/.${total.toFixed(2)} - ${result.emisor?.nombre || ''}`
      )
      setShowForm(true)
    } catch (error) {
      console.error(error)
      Alert.alert(
        'Error',
        'No se pudo obtener la información de la factura. Puedes ingresarla manualmente.'
      )
      setShowForm(true) // Still show form to allow manual entry
    } finally {
      setLoading(false)
    }
  }

  const handleSaveInvoice = () => {
    if (title.trim() && description.trim()) {
      onAddInvoice({
        id: Date.now().toString(),
        url: scannedUrl,
        title: title.trim(),
        description: description.trim(),
        date: invoiceData?.fecha || new Date().toISOString(), // Use API date or current
        createdAt: new Date().toISOString(), // Registration date
        total: invoiceData?.total,
        descuentos: invoiceData?.descuentos,
        itbms: invoiceData?.itbms,
        emisor: invoiceData?.emisor,
        products: invoiceData?.products,
      })
      setTitle('')
      setDescription('')
      setScannedUrl('')
      setShowForm(false)
      setScanned(false)
      navigation.navigate('Facturas')
    }
  }

  // Effect to reset scanned state when screen is focused
  useEffect(() => {
    if (isFocused) {
      setScanned(false)
      setShowForm(false)
    }
  }, [isFocused])

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-center">
          Solicitando permiso de cámara...
        </Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-center text-red-600">
          Sin acceso a la cámara
        </Text>
        <Text className="text-sm text-center mt-2">
          Por favor, habilita los permisos de cámara en tu dispositivo
        </Text>
        <Button title="Conceder permiso" onPress={requestPermission} />
      </View>
    )
  }

  if (showForm) {
    return (
      <View className="flex-1 p-4 bg-white">
        <Text className="text-xl font-bold mb-4">Nueva Factura</Text>

        <Text className="text-sm text-gray-500 mb-2">URL escaneada:</Text>
        <Text className="text-sm text-blue-600 mb-4 p-2 bg-gray-100 rounded">
          {scannedUrl}
        </Text>

        <Text className="text-sm font-medium mb-2">Título:</Text>
        <TextInput
          className="border border-gray-300 rounded p-2 mb-4"
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Factura de luz"
        />

        <Text className="text-sm font-medium mb-2">Descripción:</Text>
        <TextInput
          className="border border-gray-300 rounded p-2 mb-4 h-24"
          value={description}
          onChangeText={setDescription}
          placeholder="Ej: Factura correspondiente a noviembre 2024"
          multiline
        />

        <View className="flex-row gap-2">
          <Button title="Guardar" onPress={handleSaveInvoice} />
          <Button
            title="Cancelar"
            color="red"
            onPress={() => setShowForm(false)}
          />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {isFocused && (
        <CameraView
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-xl overflow-hidden -translate-x-1/2 -translate-y-1/2"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
      )}
      <View className="absolute top-[15%] left-0 right-0 items-center">
        <View className="bg-black/70 px-6 py-4 rounded-lg">
          <Text className="text-white text-center font-semibold text-lg">
            📷 Apunta la cámara a un código QR
          </Text>
          <Text className="text-white text-center text-sm mt-2 opacity-90">
            {loading ? 'Procesando factura...' : 'El escaneo es automático'}
          </Text>
        </View>
      </View>
      {loading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4 font-bold">
            Obteniendo datos de la factura...
          </Text>
        </View>
      )}
      {scanned && (
        <View className="absolute bottom-8 left-0 right-0">
          <Button title="Escanear de nuevo" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  )
}
