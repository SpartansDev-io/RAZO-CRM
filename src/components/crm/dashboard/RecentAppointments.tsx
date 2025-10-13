'use client';

import {
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Box,
  Divider,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Clock, Calendar, FileText } from 'lucide-react';

const mockAppointments = [
  {
    id: 1,
    patientId: '1',
    patientName: 'María González',
    time: '09:00',
    type: 'Terapia Individual',
    status: 'confirmed',
  },
  {
    id: 2,
    patientId: '2',
    patientName: 'Carlos Rodríguez',
    time: '10:30',
    type: 'Evaluación Inicial',
    status: 'pending',
  },
  {
    id: 3,
    patientId: '3',
    patientName: 'Ana López',
    time: '14:00',
    type: 'Terapia Familiar',
    status: 'confirmed',
  },
  {
    id: 4,
    patientId: '4',
    patientName: 'Pedro Martínez',
    time: '15:30',
    type: 'Seguimiento',
    status: 'confirmed',
  },
];

interface RecentAppointmentsProps {
  onNewSession?: (patient: { id: string; name: string }) => void;
}

export default function RecentAppointments({ onNewSession }: RecentAppointmentsProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card bg={bg} shadow="sm" borderRadius="lg">
      <CardBody>
        <HStack mb={4} spacing={3}>
          <Calendar size={20} color="#3182CE" />
          <Heading size="md">Citas de Hoy</Heading>
        </HStack>
        
        <VStack spacing={4} align="stretch">
          {mockAppointments.map((appointment, index) => (
            <Box key={appointment.id}>
              <HStack spacing={4} align="center">
                <Avatar
                  size="sm"
                  name={appointment.patientName}
                  bg="blue.500"
                />
                <Box flex="1">
                  <Text fontWeight="medium" fontSize="sm">
                    {appointment.patientName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {appointment.type}
                  </Text>
                </Box>
                <VStack spacing={1} align="end">
                  <HStack spacing={1}>
                    <Clock size={12} color="#718096" />
                    <Text fontSize="xs" color="gray.600">
                      {appointment.time}
                    </Text>
                  </HStack>
                  <Badge
                    size="sm"
                    colorScheme={getStatusColor(appointment.status)}
                    variant="subtle"
                  >
                    {getStatusText(appointment.status)}
                  </Badge>
                </VStack>
                <Tooltip label="Registrar sesión" placement="top">
                  <IconButton
                    aria-label="Registrar sesión"
                    icon={<FileText size={16} />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => onNewSession?.({
                      id: appointment.patientId,
                      name: appointment.patientName
                    })}
                  />
                </Tooltip>
              </HStack>
              {index < mockAppointments.length - 1 && (
                <Divider mt={4} borderColor={borderColor} />
              )}
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}