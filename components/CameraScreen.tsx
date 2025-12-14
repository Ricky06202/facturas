import React, { useState } from 'react'
import { Text, View, TextInput, Button } from 'react-native'
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera'
import { cssInterop } from 'nativewind'

// Interface matching the one in App.tsx
export interface Invoice {
  id: string
  url: string
  title: string
  description: string
  date: string
}

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
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [scannedUrl, setScannedUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true)
    setScannedUrl(data)
    setShowForm(true)
  }

  const handleSaveInvoice = () => {
    if (title.trim() && description.trim()) {
      onAddInvoice({
        id: Date.now().toString(),
        url: scannedUrl,
        title: title.trim(),
        description: description.trim(),
        date: new Date().toISOString(),
      })
      setTitle('')
      setDescription('')
      setScannedUrl('')
      setShowForm(false)
      setScanned(false)
      navigation.navigate('Facturas')
    }
  }

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
      <CameraView
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-xl overflow-hidden -translate-x-1/2 -translate-y-1/2"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      <View className="absolute top-[15%] left-0 right-0 items-center">
        <View className="bg-black/70 px-6 py-4 rounded-lg">
          <Text className="text-white text-center font-semibold text-lg">
            📷 Apunta la cámara a un código QR
          </Text>
          <Text className="text-white text-center text-sm mt-2 opacity-90">
            El escaneo es automático
          </Text>
        </View>
      </View>
      {scanned && (
        <View className="absolute bottom-8 left-0 right-0">
          <Button title="Escanear de nuevo" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  )
}
