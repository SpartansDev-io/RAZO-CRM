'use client';

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Box,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Building2, Users, Mail, Phone, Globe, MapPin, Briefcase, Eye, CreditCard as Edit, Trash2, MoveVertical as MoreVertical, UserPlus, FileText } from 'lucide-react';

interface CompanyCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  employeeCount: number;
  isActive: boolean;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddEmployee?: (id: string) => void;
  onViewEmployees?: (id: string) => void;
  onGenerateReport?: (id: string) => void;
}

export default function CompanyCard({
  id,
  name,
  email,
  phone,
  address,
  website,
  industry,
  employeeCount,
  isActive,
  onViewDetails,
  onEdit,
  onDelete,
  onAddEmployee,
  onViewEmployees,
  onGenerateReport,
}: CompanyCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const iconColor = useColorModeValue('blue.500', 'blue.200');

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-action-button]')) {
      return;
    }
    onViewDetails?.(id);
  };

  return (
    <Card
      bg={bg}
      shadow="sm"
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      cursor="pointer"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      onClick={handleCardClick}
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="flex-start">
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg={iconBg}>
                <Icon as={Building2} boxSize={6} color={iconColor} />
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {name}
                </Text>
                {industry && (
                  <HStack spacing={2} mt={1}>
                    <Icon as={Briefcase} boxSize={3} color="gray.500" />
                    <Text fontSize="xs" color="gray.500">
                      {industry}
                    </Text>
                  </HStack>
                )}
              </Box>
            </HStack>
            <HStack spacing={2}>
              <Badge colorScheme={isActive ? 'green' : 'red'} fontSize="xs">
                {isActive ? 'Activa' : 'Inactiva'}
              </Badge>
              <Box data-action-button>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<MoreVertical size={16} />}
                    variant="ghost"
                    size="sm"
                    aria-label="Más opciones"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<Eye size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails?.(id);
                      }}
                    >
                      Ver Perfil
                    </MenuItem>
                    <MenuItem
                      icon={<Edit size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(id);
                      }}
                    >
                      Editar
                    </MenuItem>
                    <MenuItem
                      icon={<FileText size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateReport?.(id);
                      }}
                    >
                      Generar Reporte
                    </MenuItem>
                    <MenuItem
                      icon={<Trash2 size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(id);
                      }}
                      color="red.500"
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </HStack>
          </HStack>

          <Divider />

          <VStack align="stretch" spacing={2}>
            <HStack spacing={2}>
              <Icon as={Users} boxSize={4} color="gray.500" />
              <Text fontSize="sm" color="gray.600">
                <Text as="span" fontWeight="semibold" color="gray.800">
                  {employeeCount}
                </Text>{' '}
                {employeeCount === 1 ? 'empleado' : 'empleados'} registrados
              </Text>
            </HStack>

            {email && (
              <HStack spacing={2}>
                <Icon as={Mail} boxSize={4} color="gray.500" />
                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                  {email}
                </Text>
              </HStack>
            )}

            {phone && (
              <HStack spacing={2}>
                <Icon as={Phone} boxSize={4} color="gray.500" />
                <Text fontSize="sm" color="gray.600">
                  {phone}
                </Text>
              </HStack>
            )}

            {address && (
              <HStack spacing={2}>
                <Icon as={MapPin} boxSize={4} color="gray.500" />
                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                  {address}
                </Text>
              </HStack>
            )}

            {website && (
              <HStack spacing={2}>
                <Icon as={Globe} boxSize={4} color="gray.500" />
                <Text fontSize="sm" color="blue.600" noOfLines={1}>
                  {website}
                </Text>
              </HStack>
            )}
          </VStack>

          <Divider />

          <HStack spacing={2} justify="space-between">
            <Tooltip label="Agregar empleado" placement="top">
              <Box data-action-button>
                <IconButton
                  icon={<UserPlus size={18} />}
                  aria-label="Agregar empleado"
                  size="sm"
                  variant="ghost"
                  colorScheme="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEmployee?.(id);
                  }}
                />
              </Box>
            </Tooltip>
            <Tooltip label="Ver perfil completo" placement="top">
              <Box data-action-button>
                <IconButton
                  icon={<Eye size={18} />}
                  aria-label="Ver perfil"
                  size="sm"
                  variant="solid"
                  colorScheme="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(id);
                  }}
                />
              </Box>
            </Tooltip>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
