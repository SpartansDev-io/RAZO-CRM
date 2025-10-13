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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Clock, Calendar, FileText, Video, Home, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardAppointments } from '@/lib/api/dashboard.api';
import type { DashboardAppointment } from '@/types/dashboard.types';

interface RecentAppointmentsProps {
  onNewSession?: (patient: { id: string; name: string }) => void;
}

export default function RecentAppointments({ onNewSession }: RecentAppointmentsProps) {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getDashboardAppointments();
      if (response.success && response.data) {
        setAppointments(response.data.appointments);
      } else {
        setError(response.error || 'Error al cargar citas');
      }
    } catch (err) {
      setError('Error al cargar citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'scheduled':
        return 'yellow';
      case 'in_progress':
        return 'blue';
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
      case 'scheduled':
        return 'Agendada';
      case 'in_progress':
        return 'En Progreso';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'videollamada':
        return Video;
      case 'visita':
        return Home;
      default:
        return MapPin;
    }
  };

  if (loading) {
    return (
      <Card bg={bg} shadow="sm" borderRadius="lg">
        <CardBody>
          <HStack mb={4} spacing={3}>
            <Calendar size={20} color="#3182CE" />
            <Heading size="md">Citas de Hoy</Heading>
          </HStack>
          <Center py={8}>
            <Spinner size="lg" color="blue.500" />
          </Center>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card bg={bg} shadow="sm" borderRadius="lg">
        <CardBody>
          <HStack mb={4} spacing={3}>
            <Calendar size={20} color="#3182CE" />
            <Heading size="md">Citas de Hoy</Heading>
          </HStack>
          <Center py={8}>
            <Text color="red.500">{error}</Text>
          </Center>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bg} shadow="sm" borderRadius="lg">
      <CardBody>
        <HStack mb={4} spacing={3}>
          <Calendar size={20} color="#3182CE" />
          <Heading size="md">Citas de Hoy</Heading>
          <Badge colorScheme="blue" ml="auto">{appointments.length}</Badge>
        </HStack>

        {appointments.length === 0 ? (
          <Center py={8}>
            <Text color="gray.500">No hay citas programadas para hoy</Text>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            {appointments.map((appointment, index) => (
              <Box key={appointment.id}>
                <HStack spacing={4} align="center">
                  <Avatar
                    size="sm"
                    name={appointment.patientName}
                    src={appointment.patientPhoto}
                    bg="blue.500"
                  />
                  <Box flex="1">
                    <Text fontWeight="medium" fontSize="sm">
                      {appointment.patientName}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="xs" color="gray.500">
                        {appointment.type}
                      </Text>
                      <Box as={getAppointmentIcon(appointment.appointmentType)} size={12} color="gray.500" />
                    </HStack>
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
                {index < appointments.length - 1 && (
                  <Divider mt={4} borderColor={borderColor} />
                )}
              </Box>
            ))}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
}
