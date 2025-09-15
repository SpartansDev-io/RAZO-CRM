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
} from '@chakra-ui/react';
import { Users, Phone, Mail } from 'lucide-react';

const mockPatients = [
  {
    id: 1,
    name: 'Laura Fernández',
    email: 'laura.f@email.com',
    phone: '+34 666 123 456',
    lastSession: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Miguel Santos',
    email: 'miguel.s@email.com',
    phone: '+34 677 234 567',
    lastSession: '2024-01-14',
    status: 'active',
  },
  {
    id: 3,
    name: 'Carmen Ruiz',
    email: 'carmen.r@email.com',
    phone: '+34 688 345 678',
    lastSession: '2024-01-10',
    status: 'inactive',
  },
  {
    id: 4,
    name: 'David Torres',
    email: 'david.t@email.com',
    phone: '+34 699 456 789',
    lastSession: '2024-01-12',
    status: 'active',
  },
];

export default function RecentPatients() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
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
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card bg={bg} shadow="sm" borderRadius="lg">
      <CardBody>
        <HStack mb={4} spacing={3}>
          <Users size={20} color="#38A169" />
          <Heading size="md">Pacientes Recientes</Heading>
        </HStack>
        
        <VStack spacing={4} align="stretch">
          {mockPatients.map((patient, index) => (
            <Box key={patient.id}>
              <HStack spacing={4} align="center">
                <Avatar
                  size="sm"
                  name={patient.name}
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
                        <HStack spacing={1}>
                          <Phone size={10} color="#718096" />
                          <Text fontSize="xs" color="gray.500">
                            {patient.phone}
                          </Text>
                        </HStack>
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
                      <Text fontSize="xs" color="gray.500">
                        Última: {patient.lastSession}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </HStack>
              {index < mockPatients.length - 1 && (
                <Divider mt={4} borderColor={borderColor} />
              )}
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}