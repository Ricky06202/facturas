import React, { useState } from 'react';
import { Text, View, TextInput, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#dc2626',
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  urlContainer: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 96,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cameraContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayContainer: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
  },
  overlayTitle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  overlaySubtitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  scanAgainContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
  },
});

export default function CameraScreen({ navigation, onAddInvoice }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scannedUrl, setScannedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedUrl(data);
    setShowForm(true);
  };

  const handleSaveInvoice = () => {
    if (title.trim() && description.trim()) {
      onAddInvoice({
        id: Date.now().toString(),
        url: scannedUrl,
        title: title.trim(),
        description: description.trim(),
        date: new Date().toISOString()
      });
      setTitle('');
      setDescription('');
      setScannedUrl('');
      setShowForm(false);
      setScanned(false);
      navigation.navigate('Facturas');
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.titleText}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <Text style={styles.helperText}>Por favor, habilita los permisos de cámara en tu dispositivo</Text>
        <Button 
          title="Conceder permiso" 
          onPress={requestPermission} 
        />
      </View>
    );
  }

  if (showForm) {
    return (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Nueva Factura</Text>
        
        <Text style={styles.label}>URL escaneada:</Text>
        <Text style={styles.urlContainer}>{scannedUrl}</Text>
        
        <Text style={styles.inputLabel}>Título:</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Factura de luz"
        />
        
        <Text style={styles.inputLabel}>Descripción:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ej: Factura correspondiente a noviembre 2024"
          multiline
        />
        
        <View style={styles.buttonContainer}>
          <Button title="Guardar" onPress={handleSaveInvoice} />
          <Button title="Cancelar" color="red" onPress={() => setShowForm(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.cameraContainer}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      <View style={styles.overlayContainer}>
        <View style={styles.overlayBox}>
          <Text style={styles.overlayTitle}>
            📷 Apunta la cámara a un código QR
          </Text>
          <Text style={styles.overlaySubtitle}>
            El escaneo es automático
          </Text>
        </View>
      </View>
      {scanned && (
        <View style={styles.scanAgainContainer}>
          <Button
            title="Escanear de nuevo"
            onPress={() => setScanned(false)}
          />
        </View>
      )}
    </View>
  );
}
