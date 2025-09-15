'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  InputGroup, 
  IconButton, 
  VStack, 
  Heading, 
  Text, 
  Card, 
  CardBody, 
  Spinner, 
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  InputRightElement
} from '@chakra-ui/react';
import { Eye, EyeOff, Lock, Mail, Brain } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { ILoginRequest } from '@/modules/shared/domain/types/auth.types';

export function LoginForm() {
  const [formData, setFormData] = useState<ILoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // Clear error when component mounts or form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.email, formData.password, clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/crm';
    }
  }, [isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      return;
    }

    await login(formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Card maxW="md" w="full" shadow="xl">
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box textAlign="center">
              <Box mb={4}>
                <Brain size={48} color="#2196F3" />
              </Box>
              <Heading size="lg" color="primary.700" mb={2}>
                Razo Morales & Asociados
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Inicia sesión en tu cuenta
              </Text>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {/* Email Field */}
                <FormControl isRequired>
                  <FormLabel color="gray.700">Email</FormLabel>
                  <InputGroup>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'primary.400' }}
                      _focus={{
                        borderColor: 'primary.500',
                        boxShadow: '0 0 0 1px #2196F3',
                      }}
                    />
                    <InputRightElement>
                      <Mail size={18} color="#718096" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Password Field */}
                <FormControl isRequired>
                  <FormLabel color="gray.700">Contraseña</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Tu contraseña"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'primary.400' }}
                      _focus={{
                        borderColor: 'primary.500',
                        boxShadow: '0 0 0 1px #2196F3',
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        variant="ghost"
                        size="sm"
                        onClick={togglePasswordVisibility}
                        color="gray.500"
                        _hover={{ color: 'primary.500' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                  spinner={<Spinner size="sm" />}
                  leftIcon={!isLoading ? <Lock size={18} /> : undefined}
                  disabled={!formData.email.trim() || !formData.password.trim() || isLoading}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                  transition="all 0.2s"
                >
                  Iniciar Sesión
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <Box textAlign="center" pt={4}>
              <Text fontSize="xs" color="gray.500">
                © 2024 Razo Morales & Asociados. Todos los derechos reservados.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}