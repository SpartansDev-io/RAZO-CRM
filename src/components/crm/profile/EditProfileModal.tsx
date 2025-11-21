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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Select,
} from '@chakra-ui/react';
import { Edit, User, Mail, Phone, Briefcase, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface EditProfileFormData {
  fullName: string;
  email: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'therapist' | 'admin' | 'assistant';
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  avatarUrl?: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (updatedProfile: Partial<UserProfile>) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdate,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormData>({
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone || '',
      specialty: profile.specialty || '',
      licenseNumber: profile.licenseNumber || '',
      bio: profile.bio || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onUpdate({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        licenseNumber: data.licenseNumber,
        bio: data.bio,
      });

      toast({
        title: 'Perfil actualizado',
        description: 'Tu información se ha actualizado correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <Edit size={24} color="#3182CE" />
              <Text>Editar Perfil</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto" maxH="calc(90vh - 140px)">
            <VStack spacing={5} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Actualiza tu información personal y profesional
              </Text>

              <FormControl isRequired isInvalid={!!errors.fullName}>
                <FormLabel>
                  <HStack spacing={2}>
                    <User size={16} color="#718096" />
                    <Text>Nombre Completo</Text>
                  </HStack>
                </FormLabel>
                <Input
                  {...register('fullName', {
                    required: 'El nombre completo es requerido',
                    minLength: {
                      value: 3,
                      message: 'El nombre debe tener al menos 3 caracteres',
                    },
                  })}
                  placeholder="Ej: Dr. Juan Pérez"
                />
                {errors.fullName && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.fullName.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>
                  <HStack spacing={2}>
                    <Mail size={16} color="#718096" />
                    <Text>Correo Electrónico</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'El correo electrónico es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo electrónico inválido',
                    },
                  })}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Phone size={16} color="#718096" />
                    <Text>Teléfono</Text>
                  </HStack>
                </FormLabel>
                <Input
                  {...register('phone')}
                  placeholder="+52 55 1234 5678"
                  type="tel"
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Briefcase size={16} color="#718096" />
                    <Text>Especialidad</Text>
                  </HStack>
                </FormLabel>
                <Input
                  {...register('specialty')}
                  placeholder="Ej: Psicología Clínica"
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Award size={16} color="#718096" />
                    <Text>Número de Cédula Profesional</Text>
                  </HStack>
                </FormLabel>
                <Input
                  {...register('licenseNumber')}
                  placeholder="Ej: PSI-12345"
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <User size={16} color="#718096" />
                    <Text>Biografía Profesional</Text>
                  </HStack>
                </FormLabel>
                <Textarea
                  {...register('bio')}
                  placeholder="Describe tu experiencia profesional, áreas de especialización, y enfoque terapéutico..."
                  rows={4}
                  resize="vertical"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Esta información será visible para administradores del sistema
                </Text>
              </FormControl>
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
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
