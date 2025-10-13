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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Users, Phone, Mail, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardPatients } from '@/lib/api/dashboard.api';
import type { DashboardPatient } from '@/types/dashboard.types';

export default function RecentPatients() {
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getDashboardPatients(5, 'last_session', 'desc');
      if (response.success && response.data) {
        setPatients(response.data.patients);
      } else {
        setError(response.error || 'Error al cargar pacientes');
      }
    } catch (err) {
      setError('Error al cargar pacientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'on_hold':
        return 'yellow';
      case 'discharged':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'on_hold':
        return 'En Pausa';
      case 'discharged':
        return 'Dado de Alta';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <Card bg={bg} shadow="sm" borderRadius="lg">
        <CardBody>
          <HStack mb={4} spacing={3}>
            <Users size={20} color="#38A169" />
            <Heading size="md">Pacientes Recientes</Heading>
          </HStack>
          <Center py={8}>
            <Spinner size="lg" color="green.500" />
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
            <Users size={20} color="#38A169" />
            <Heading size="md">Pacientes Recientes</Heading>
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
          <Users size={20} color="#38A169" />
          <Heading size="md">Pacientes Recientes</Heading>
          <Badge colorScheme="green" ml="auto">{patients.length}</Badge>
        </HStack>

        {patients.length === 0 ? (
          <Center py={8}>
            <Text color="gray.500">No hay pacientes registrados</Text>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            {patients.map((patient, index) => (
              <Box key={patient.id}>
                <HStack spacing={4} align="center">
                  <Avatar
                    size="sm"
                    name={patient.name}
                    src={patient.photoUrl}
                    bg="green.500"
                  />
                  <Box flex="1">
                    <HStack justify="space-between" align="start">
                      <Box>
                        <Text fontWeight="medium" fontSize="sm">
                          {patient.name}
                        </Text>
                        <VStack spacing={0} align="start">
                          <HStack spacing={1}>
                            <Mail size={10} color="#718096" />
                            <Text fontSize="xs" color="gray.500">
                              {patient.email}
                            </Text>
                          </HStack>
                          {patient.company && (
                            <HStack spacing={1}>
                              <Building2 size={10} color="#718096" />
                              <Text fontSize="xs" color="gray.500">
                                {patient.company.name}
                              </Text>
                            </HStack>
                          )}
                          {!patient.company && patient.phone && (
                            <HStack spacing={1}>
                              <Phone size={10} color="#718096" />
                              <Text fontSize="xs" color="gray.500">
                                {patient.phone}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                      <VStack spacing={1} align="end">
                        <Badge
                          size="sm"
                          colorScheme={getStatusColor(patient.status)}
                          variant="subtle"
                        >
                          {getStatusText(patient.status)}
                        </Badge>
                        {patient.lastSession ? (
                          <Text fontSize="xs" color="gray.500">
                            Última: {patient.lastSession.formatted}
                          </Text>
                        ) : (
                          <Text fontSize="xs" color="gray.400" fontStyle="italic">
                            Sin sesiones
                          </Text>
                        )}
                        {patient.sessionCount.total > 0 && (
                          <Text fontSize="xs" color="blue.500" fontWeight="medium">
                            {patient.sessionCount.completed}/{patient.sessionCount.total} sesiones
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                </HStack>
                {index < patients.length - 1 && (
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
