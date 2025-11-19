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
  VStack,
  HStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  const passwordRequirements = [
    {
      label: 'Al menos 8 caracteres',
      isValid: newPassword?.length >= 8,
    },
    {
      label: 'Al menos una letra mayúscula',
      isValid: /[A-Z]/.test(newPassword || ''),
    },
    {
      label: 'Al menos una letra minúscula',
      isValid: /[a-z]/.test(newPassword || ''),
    },
    {
      label: 'Al menos un número',
      isValid: /\d/.test(newPassword || ''),
    },
    {
      label: 'Al menos un carácter especial (!@#$%^&*)',
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword || ''),
    },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.isValid);

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        title: 'Contraseña débil',
        description:
          'La contraseña no cumple con todos los requisitos de seguridad.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña se ha cambiado correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'No se pudo cambiar la contraseña. Verifica tu contraseña actual.',
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
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <Lock size={24} color="#3182CE" />
              <Text>Cambiar Contraseña</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto" maxH="calc(90vh - 140px)">
            <VStack spacing={5} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Asegúrate de usar una contraseña fuerte y única para proteger
                  tu cuenta.
                </AlertDescription>
              </Alert>

              <FormControl isRequired isInvalid={!!errors.currentPassword}>
                <FormLabel>Contraseña Actual</FormLabel>
                <InputGroup>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...register('currentPassword', {
                      required: 'La contraseña actual es requerida',
                    })}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showCurrentPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      icon={
                        showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      }
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.currentPassword && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.currentPassword.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.newPassword}>
                <FormLabel>Nueva Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword', {
                      required: 'La nueva contraseña es requerida',
                      minLength: {
                        value: 8,
                        message:
                          'La contraseña debe tener al menos 8 caracteres',
                      },
                    })}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showNewPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      icon={
                        showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      }
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.newPassword && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.newPassword.message}
                  </Text>
                )}
              </FormControl>

              {newPassword && (
                <VStack
                  spacing={2}
                  align="stretch"
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Requisitos de contraseña:
                  </Text>
                  <List spacing={1}>
                    {passwordRequirements.map((req, index) => (
                      <ListItem key={index} fontSize="xs" color="gray.600">
                        <HStack spacing={2}>
                          <ListIcon
                            as={req.isValid ? CheckCircle : XCircle}
                            color={req.isValid ? 'green.500' : 'gray.400'}
                            boxSize={4}
                          />
                          <Text>{req.label}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </VStack>
              )}

              <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Debes confirmar tu nueva contraseña',
                    })}
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      icon={
                        showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      }
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.confirmPassword && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
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
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              isDisabled={!allRequirementsMet && !!newPassword}
            >
              Cambiar Contraseña
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
