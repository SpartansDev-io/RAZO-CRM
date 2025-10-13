'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

interface Contract {
  id: string;
  contractName: string;
  startDate: Date;
  endDate: Date;
  costPerSession: number;
  monthlyLimit?: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  notes?: string;
}

interface ContractsListProps {
  companyId: string;
  onNewContract: () => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
  onViewContract: (contract: Contract) => void;
}

export default function ContractsList({
  companyId,
  onNewContract,
  onEditContract,
  onDeleteContract,
  onViewContract,
}: ContractsListProps) {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const mockContracts: Contract[] = [
    {
      id: '1',
      contractName: 'Contrato Anual 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      costPerSession: 800,
      monthlyLimit: 15000,
      paymentFrequency: 'monthly',
      status: 'active',
      notes: 'Contrato principal con 15 empleados',
    },
    {
      id: '2',
      contractName: 'Extensión Q1 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      costPerSession: 750,
      paymentFrequency: 'quarterly',
      status: 'active',
      notes: 'Contrato trimestral sin límite mensual',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'expired': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'Pendiente';
      case 'expired': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Mensual';
      case 'quarterly': return 'Trimestral';
      case 'annual': return 'Anual';
      default: return frequency;
    }
  };

  const getDaysUntilExpiration = (endDate: Date) => {
    return differenceInDays(endDate, new Date());
  };

  const isExpiringSoon = (endDate: Date) => {
    const days = getDaysUntilExpiration(endDate);
    return days >= 0 && days <= 30;
  };

  const activeContracts = mockContracts.filter(c => c.status === 'active');
  const expiringContracts = activeContracts.filter(c => isExpiringSoon(c.endDate));

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Contratos de Servicio
          </Text>
          <Text fontSize="sm" color="gray.600">
            Gestiona los acuerdos comerciales con la empresa
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="blue"
          onClick={onNewContract}
        >
          Nuevo Contrato
        </Button>
      </HStack>

      {expiringContracts.length > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            {expiringContracts.length === 1
              ? 'Hay 1 contrato que vence en los próximos 30 días'
              : `Hay ${expiringContracts.length} contratos que vencen en los próximos 30 días`}
          </AlertDescription>
        </Alert>
      )}

      <Box overflowX="auto">
        {mockContracts.length === 0 ? (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} py={8}>
                <FileText size={48} color="#CBD5E0" />
                <Text fontSize="lg" color="gray.500">
                  No hay contratos registrados
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Crea un nuevo contrato para comenzar a registrar los acuerdos comerciales
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={onNewContract}
                >
                  Crear Primer Contrato
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Contrato</Th>
                <Th>Vigencia</Th>
                <Th>Costo por Sesión</Th>
                <Th>Límite Mensual</Th>
                <Th>Frecuencia de Pago</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockContracts.map((contract) => {
                const daysUntilExpiration = getDaysUntilExpiration(contract.endDate);
                const isExpiring = isExpiringSoon(contract.endDate);

                return (
                  <Tr key={contract.id}>
                    <Td>
                      <VStack spacing={1} align="start">
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="medium" color="gray.800">
                            {contract.contractName}
                          </Text>
                          {isExpiring && contract.status === 'active' && (
                            <Badge colorScheme="orange" fontSize="xs">
                              <HStack spacing={1}>
                                <AlertCircle size={10} />
                                <Text>Vence pronto</Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                        {contract.notes && (
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {contract.notes}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" color="gray.700">
                          {format(contract.startDate, 'dd/MM/yyyy', { locale: es })}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          hasta {format(contract.endDate, 'dd/MM/yyyy', { locale: es })}
                        </Text>
                        {contract.status === 'active' && daysUntilExpiration > 0 && (
                          <Text
                            fontSize="xs"
                            color={isExpiring ? 'orange.600' : 'gray.500'}
                            fontWeight={isExpiring ? 'medium' : 'normal'}
                          >
                            {daysUntilExpiration} días restantes
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <DollarSign size={12} color="#718096" />
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          ${contract.costPerSession.toLocaleString()} MXN
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.700">
                        {contract.monthlyLimit
                          ? `$${contract.monthlyLimit.toLocaleString()} MXN`
                          : 'Sin límite'
                        }
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" fontSize="xs">
                        {getPaymentFrequencyText(contract.paymentFrequency)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(contract.status)}
                        fontSize="xs"
                      >
                        {getStatusText(contract.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MoreVertical size={16} />}
                          variant="ghost"
                          size="sm"
                          aria-label="Acciones"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Eye size={14} />}
                            onClick={() => onViewContract(contract)}
                          >
                            Ver Detalles
                          </MenuItem>
                          <MenuItem
                            icon={<Edit size={14} />}
                            onClick={() => onEditContract(contract)}
                          >
                            Editar
                          </MenuItem>
                          <MenuItem
                            icon={<Trash2 size={14} />}
                            color="red.600"
                            onClick={() => onDeleteContract(contract.id)}
                          >
                            Eliminar
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Box>

      {mockContracts.length > 0 && (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack spacing={8} justify="space-around">
              <VStack spacing={1}>
                <Text fontSize="xs" color="gray.600">Total Contratos</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {mockContracts.length}
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xs" color="gray.600">Contratos Activos</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {activeContracts.length}
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xs" color="gray.600">Por Vencer</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {expiringContracts.length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}
