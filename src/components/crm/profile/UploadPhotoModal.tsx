'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Avatar,
  Box,
  Input,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  onUpdate: (avatarUrl: string | undefined) => void;
}

export default function UploadPhotoModal({
  isOpen,
  onClose,
  currentPhotoUrl,
  onUpdate,
}: UploadPhotoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentPhotoUrl,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor selecciona una imagen válida (JPG, PNG, etc.).',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'La imagen debe ser menor a 5 MB.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile && previewUrl === currentPhotoUrl) {
      toast({
        title: 'Sin cambios',
        description: 'No hay cambios para guardar.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onUpdate(previewUrl);

      toast({
        title: 'Foto actualizada',
        description: 'Tu foto de perfil se ha actualizado correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la foto. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(undefined);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setPreviewUrl(currentPhotoUrl);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <ImageIcon size={24} color="#3182CE" />
            <Text>Cambiar Foto de Perfil</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5} align="stretch">
            <Alert status="info" borderRadius="md" fontSize="sm">
              <AlertIcon />
              <AlertDescription>
                Sube una foto cuadrada para mejores resultados. Máximo 5 MB.
              </AlertDescription>
            </Alert>

            <VStack spacing={4}>
              <Avatar size="2xl" src={previewUrl} bg="blue.500" name="User" />

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                display="none"
              />

              <HStack spacing={3}>
                <Button
                  leftIcon={<Upload size={16} />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar Foto
                </Button>

                {previewUrl && (
                  <Button
                    leftIcon={<Trash2 size={16} />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                  >
                    Eliminar
                  </Button>
                )}
              </HStack>

              {selectedFile && (
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="blue.200"
                  w="full"
                >
                  <VStack spacing={1} align="start">
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                      Archivo seleccionado:
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {selectedFile.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Formatos aceptados: JPG, PNG, GIF. La imagen se redimensionará
              automáticamente.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            isDisabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleUpload}
            isLoading={isLoading}
            isDisabled={!previewUrl && !currentPhotoUrl}
          >
            Guardar Foto
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
