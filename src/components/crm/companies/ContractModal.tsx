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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  HStack,
  Switch,
  Text,
  useToast,
  useColorModeValue,
  Grid,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { FileText, Save, X } from 'lucide-react';
import { useState } from 'react';

interface Contract {
  id?: string;
  contractName: string;
  startDate: string;
  endDate: string;
  costPerSession: number;
  monthlyLimit?: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  notes?: string;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  companyId: string;
}

export default function ContractModal({
  isOpen,
  onClose,
  contract,
  companyId,
}: ContractModalProps) {
  const toast = useToast();
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [formData, setFormData] = useState<Contract>({
    contractName: contract?.contractName || '',
    startDate: contract?.startDate || '',
    endDate: contract?.endDate || '',
    costPerSession: contract?.costPerSession || 0,
    monthlyLimit: contract?.monthlyLimit || undefined,
    paymentFrequency: contract?.paymentFrequency || 'monthly',
    status: contract?.status || 'active',
    notes: contract?.notes || '',
  });

  const [hasMonthlyLimit, setHasMonthlyLimit] = useState(
    !!contract?.monthlyLimit,
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'costPerSession' || name === 'monthlyLimit'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleMonthlyLimitToggle = (checked: boolean) => {
    setHasMonthlyLimit(checked);
    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        monthlyLimit: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.contractName ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.costPerSession
    ) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast({
        title: 'Error',
        description: 'La fecha de fin debe ser posterior a la fecha de inicio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.costPerSession <= 0) {
      toast({
        title: 'Error',
        description: 'El costo por sesión debe ser mayor a 0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (
      hasMonthlyLimit &&
      (!formData.monthlyLimit || formData.monthlyLimit <= 0)
    ) {
      toast({
        title: 'Error',
        description: 'El límite mensual debe ser mayor a 0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const contractData = {
        ...formData,
        companyId,
        monthlyLimit: hasMonthlyLimit ? formData.monthlyLimit : null,
      };

      console.log('Contract data:', contractData);

      toast({
        title: contract ? 'Contrato actualizado' : 'Contrato creado',
        description: contract
          ? 'El contrato se ha actualizado correctamente'
          : 'El contrato se ha creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el contrato',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={3}>
            <FileText size={24} color="#3182CE" />
            <Text>{contract ? 'Editar Contrato' : 'Nuevo Contrato'}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Nombre del Contrato</FormLabel>
                <Input
                  name="contractName"
                  value={formData.contractName}
                  onChange={handleChange}
                  placeholder="Ej: Contrato Anual 2024"
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
              >
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Fecha de Inicio</FormLabel>
                  <Input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Fecha de Fin</FormLabel>
                  <Input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  />
                </FormControl>
              </Grid>

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
              >
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Costo por Sesión (MXN)</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>$</InputLeftAddon>
                    <Input
                      name="costPerSession"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPerSession || ''}
                      onChange={handleChange}
                      placeholder="800.00"
                      bg={inputBg}
                      borderColor={borderColor}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">
                    <HStack spacing={2} justify="space-between">
                      <Text>Límite Mensual (MXN)</Text>
                      <Switch
                        size="sm"
                        isChecked={hasMonthlyLimit}
                        onChange={(e) =>
                          handleMonthlyLimitToggle(e.target.checked)
                        }
                      />
                    </HStack>
                  </FormLabel>
                  <InputGroup>
                    <InputLeftAddon>$</InputLeftAddon>
                    <Input
                      name="monthlyLimit"
                      type="number"
                      step="0.01"
                      min="0"
                      value={hasMonthlyLimit ? formData.monthlyLimit || '' : ''}
                      onChange={handleChange}
                      placeholder="15000.00"
                      bg={inputBg}
                      borderColor={borderColor}
                      isDisabled={!hasMonthlyLimit}
                    />
                  </InputGroup>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {hasMonthlyLimit
                      ? 'Límite de gasto mensual'
                      : 'Sin límite de gasto'}
                  </Text>
                </FormControl>
              </Grid>

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
              >
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Frecuencia de Pago</FormLabel>
                  <Select
                    name="paymentFrequency"
                    value={formData.paymentFrequency}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="annual">Anual</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Estado</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="expired">Vencido</option>
                    <option value="cancelled">Cancelado</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel fontSize="sm">Notas</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Información adicional sobre el contrato..."
                  rows={4}
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                leftIcon={<X size={16} />}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<Save size={16} />}
              >
                {contract ? 'Guardar Cambios' : 'Crear Contrato'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
