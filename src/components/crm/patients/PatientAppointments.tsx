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
  Grid,
  GridItem,
  Avatar,
  Divider,
  useColorModeValue,
  Center,
  Spinner,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  Calendar,
  Clock,
  Video,
  Home,
  Building,
  Eye,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { format, isFuture, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import ViewAppointmentModal from '@/components/crm/calendar/ViewAppointmentModal';

interface Appointment {
  id: string;
  patientName: string;
  therapyType: string;
  appointmentType: 'presencial' | 'videollamada' | 'visita';
  startTime: Date;
  endTime: Date;
  notes?: string;
  meetLink?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

interface PatientAppointmentsProps {
  patientId: string;
}

// Mock appointments data for the patient
const getMockAppointments = (patientId: string): Appointment[] => {
  const baseAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'María González',
      therapyType: 'Terapia Individual',
      appointmentType: 'videollamada',
      startTime: new Date('2024-01-25T09:00:00'),
      endTime: new Date('2024-01-25T10:00:00'),
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'confirmed',
      notes: 'Sesión de seguimiento para evaluar progreso en técnicas de relajación.',
    },
    {
      id: '2',
      patientName: 'María González',
      therapyType: 'Terapia Individual',
      appointmentType: 'presencial',
      startTime: new Date('2024-02-01T14:30:00'),
      endTime: new Date('2024-02-01T15:30:00'),
      status: 'confirmed',
      notes: 'Sesión presencial para trabajar en técnicas cognitivo-conductuales.',
    },
    {
      id: '3',
      patientName: 'María González',
      therapyType: 'Terapia Individual',
      appointmentType: 'presencial',
      startTime: new Date('2024-01-15T11:00:00'),
      endTime: new Date('2024-01-15T12:00:00'),
      status: 'completed',
      notes: 'Sesión completada. Paciente mostró buena respuesta a las técnicas aplicadas.',
    },
    {
      id: '4',
      patientName: 'María González',
      therapyType: 'Evaluación de Seguimiento',
      appointmentType: 'videollamada',
      startTime: new Date('2024-01-08T10:30:00'),
      endTime: new Date('2024-01-08T11:30:00'),
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
      status: 'completed',
      notes: 'Evaluación mensual. Progreso satisfactorio en objetivos terapéuticos.',
    },
    {
      id: '5',
      patientName: 'María González',
      therapyType: 'Terapia Individual',
      appointmentType: 'presencial',
      startTime: new Date('2023-12-20T16:00:00'),
      endTime: new Date('2023-12-20T17:00:00'),
      status: 'completed',
      notes: 'Primera sesión del mes. Establecimiento de nuevos objetivos terapéuticos.',
    },
  ];

  return baseAppointments;
};

export default function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const appointments = getMockAppointments(patientId);

  // Separate future and past appointments
  const { futureAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const future = appointments.filter(apt => isFuture(apt.startTime));
    const past = appointments.filter(apt => isPast(apt.startTime));
    
    // Sort future appointments ascending (earliest first)
    future.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    // Sort past appointments descending (most recent first)
    past.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
    return { futureAppointments: future, pastAppointments: past };
  }, [appointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'videollamada': return <Video size={16} color="#3182CE" />;
      case 'visita': return <Home size={16} color="#38A169" />;
      case 'presencial': return <Building size={16} color="#805AD5" />;
      default: return <Calendar size={16} color="#718096" />;
    }
  };

  const getAppointmentTypeText = (type: string) => {
    switch (type) {
      case 'videollamada': return 'Videollamada';
      case 'visita': return 'Visita Domiciliaria';
      case 'presencial': return 'Presencial';
      default: return 'No especificado';
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const AppointmentCard = ({ appointment, isPastAppointment = false }: { appointment: Appointment; isPastAppointment?: boolean }) => (
    <Card bg={cardBg} borderRadius="lg" shadow="sm">
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              {getAppointmentTypeIcon(appointment.appointmentType)}
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {getAppointmentTypeText(appointment.appointmentType)}
              </Text>
            </HStack>
            <Badge
              colorScheme={getStatusColor(appointment.status)}
              variant="subtle"
              fontSize="xs"
            >
              {getStatusText(appointment.status)}
            </Badge>
          </HStack>

          {/* Date and Time */}
          <HStack spacing={4}>
            <HStack spacing={1}>
              <Calendar size={14} color="#718096" />
              <Text fontSize="sm" color="gray.600">
                {format(appointment.startTime, 'dd MMM yyyy', { locale: es })}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Clock size={14} color="#718096" />
              <Text fontSize="sm" color="gray.600">
                {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
              </Text>
            </HStack>
          </HStack>

          {/* Therapy Type */}
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            {appointment.therapyType}
          </Text>

          {/* Notes Preview */}
          {appointment.notes && (
            <Text fontSize="xs" color="gray.500" noOfLines={2}>
              {appointment.notes}
            </Text>
          )}

          {/* Actions */}
          <HStack spacing={2} justify="flex-end">
            <Button
              size="xs"
              leftIcon={<Eye size={12} />}
              variant="outline"
              colorScheme="blue"
              onClick={() => handleViewAppointment(appointment)}
            >
              Ver Detalles
            </Button>
            {!isPastAppointment && (
              <>
                <IconButton
                  aria-label="Editar cita"
                  icon={<Edit size={12} />}
                  size="xs"
                  variant="outline"
                  colorScheme="green"
                />
                <IconButton
                  aria-label="Cancelar cita"
                  icon={<Trash2 size={12} />}
                  size="xs"
                  variant="outline"
                  colorScheme="red"
                />
              </>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with New Appointment Button */}
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          Gestión de Citas
        </Text>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="blue"
          size="sm"
        >
          Nueva Cita
        </Button>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Future Appointments */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Calendar size={20} color="#3182CE" />
              <Text fontSize="md" fontWeight="semibold" color="gray.800">
                Próximas Citas ({futureAppointments.length})
              </Text>
            </HStack>
            
            {futureAppointments.length === 0 ? (
              <Card bg={cardBg}>
                <CardBody>
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Calendar size={48} color="#CBD5E0" />
                      <Text color="gray.500" fontSize="sm">
                        No hay citas programadas
                      </Text>
                      <Button
                        leftIcon={<Plus size={14} />}
                        colorScheme="blue"
                        size="sm"
                        variant="outline"
                      >
                        Programar Cita
                      </Button>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={3} align="stretch">
                {futureAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isPastAppointment={false}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </GridItem>

        {/* Past Appointments */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Clock size={20} color="#38A169" />
              <Text fontSize="md" fontWeight="semibold" color="gray.800">
                Historial de Citas ({pastAppointments.length})
              </Text>
            </HStack>
            
            {pastAppointments.length === 0 ? (
              <Card bg={cardBg}>
                <CardBody>
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Clock size={48} color="#CBD5E0" />
                      <Text color="gray.500" fontSize="sm">
                        No hay citas anteriores
                      </Text>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={3} align="stretch" maxH="600px" overflowY="auto">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isPastAppointment={true}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </GridItem>
      </Grid>

      {/* View Appointment Modal */}
      <ViewAppointmentModal
        isOpen={isOpen}
        onClose={onClose}
        appointment={selectedAppointment}
      />
    </VStack>
  );
}