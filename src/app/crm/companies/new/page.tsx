'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Grid,
  HStack,
  Switch,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCompanyPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    employeeCount: 0,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Por favor completa los campos requeridos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          website: formData.website || null,
          industry: formData.industry || null,
          employee_count: formData.employeeCount,
          is_active: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la empresa');
      }

      toast({
        title: 'Empresa creada',
        description: 'La empresa ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/crm/companies');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la empresa',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch" maxW="4xl" mx="auto">
          <HStack justify="space-between">
            <Box>
              <Heading size="lg" color="gray.800" mb={2}>
                Nueva Empresa
              </Heading>
              <Text color="gray.600">
                Completa la información de la nueva empresa
              </Text>
            </Box>
            <Button
              leftIcon={<ArrowLeft size={18} />}
              variant="ghost"
              onClick={() => router.back()}
            >
              Volver
            </Button>
          </HStack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            p={6}
            bg={inputBg}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <FormControl isRequired>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tech Solutions SA"
                    bg={inputBg}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@empresa.com"
                    bg={inputBg}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+52 55 1234 5678"
                    bg={inputBg}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sitio Web</FormLabel>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="www.empresa.com"
                    bg={inputBg}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Industria</FormLabel>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Tecnología"
                    bg={inputBg}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Número de Empleados</FormLabel>
                  <Input
                    name="employeeCount"
                    type="number"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    placeholder="0"
                    bg={inputBg}
                    min={0}
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. Reforma 123, CDMX"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Empresa Activa</FormLabel>
                <Switch
                  name="isActive"
                  isChecked={formData.isActive}
                  onChange={handleChange}
                  colorScheme="blue"
                />
              </FormControl>

              <HStack spacing={4} pt={4}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  leftIcon={<Save size={18} />}
                  isLoading={isSubmitting}
                  loadingText="Guardando..."
                >
                  Guardar Empresa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  isDisabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </DashboardLayout>
    </AuthLayout>
  );
}
