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
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  IconButton,
  useToast,
  useClipboard,
  Flex,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  MapPin,
  Video,
  Home,
  Building,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  therapyType: string;
  appointmentType: 'presencial' | 'videollamada' | 'visita';
  startTime: Date;
  endTime: Date;
  notes?: string;
  meetLink?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export default function ViewAppointmentModal({
  isOpen,
  onClose,
  appointment,
}: ViewAppointmentModalProps) {
  const toast = useToast();
  const { onCopy } = useClipboard(appointment?.meetLink || '');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedStartTime, setEditedStartTime] = useState('');
  const [editedEndTime, setEditedEndTime] = useState('');

  // Initialize edit values when appointment changes
  useEffect(() => {
    if (appointment) {
      setEditedStartTime(format(appointment.startTime, 'HH:mm'));
      setEditedEndTime(format(appointment.endTime, 'HH:mm'));
    }
  }, [appointment]);

  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'videollamada': return <Video size={20} color="#3182CE" />;
      case 'visita': return <Home size={20} color="#38A169" />;
      case 'presencial': return <Building size={20} color="#805AD5" />;
      default: return <MapPin size={20} color="#718096" />;
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

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'videollamada': return 'blue';
      case 'visita': return 'green';
      case 'presencial': return 'purple';
      default: return 'gray';
    }
  };

  const handleCopyMeetLink = () => {
    onCopy();
    toast({
      title: 'Enlace copiado',
      description: 'El enlace de la videollamada ha sido copiado al portapapeles',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleJoinMeeting = () => {
    if (appointment.meetLink) {
      window.open(appointment.meetLink, '_blank');
    }
  };

  const handleEditTime = () => {
    setIsEditingTime(true);
    setEditedStartTime(format(appointment.startTime, 'HH:mm'));
    setEditedEndTime(format(appointment.endTime, 'HH:mm'));
  };

  const handleSaveTime = () => {
    // TODO: Implement save functionality
    toast({
      title: 'Horario actualizado',
      description: `Horario cambiado a ${editedStartTime} - ${editedEndTime}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsEditingTime(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTime(false);
    setEditedStartTime(format(appointment.startTime, 'HH:mm'));
    setEditedEndTime(format(appointment.endTime, 'HH:mm'));
  };
  const duration = Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Calendar size={24} color="#3182CE" />
            <Text>Detalles de la Cita</Text>
            <Badge
              size="lg"
              colorScheme={getStatusColor(appointment.status)}
              variant="solid"
              px={3}
              py={1}
            >
              {getStatusText(appointment.status)}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Patient Information */}
            <Box>
              <HStack spacing={3} mb={3}>
                <User size={20} color="#3182CE" />
                <Text fontSize="lg" fontWeight="semibold">
                  Información del Paciente
                </Text>
              </HStack>
              <Box pl={8}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  {appointment.patientName}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {appointment.therapyType}
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* Date and Time */}
            <Box>
              <HStack spacing={3} mb={3}>
                <Clock size={20} color="#38A169" />
                <Text fontSize="lg" fontWeight="semibold">
                  Fecha y Hora
                </Text>
              </HStack>
              <Box pl={8}>
                <Text fontSize="lg" fontWeight="medium" color="gray.800">
                  {format(appointment.startTime, 'EEEE, dd MMMM yyyy', { locale: es })}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')} ({duration} minutos)
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* Appointment Type */}
            <Box>
              <HStack spacing={3} mb={3}>
                {getAppointmentTypeIcon(appointment.appointmentType)}
                <Text fontSize="lg" fontWeight="semibold">
                  Tipo de Cita
                </Text>
              </HStack>
              <Box pl={8}>
                <Badge
                  size="lg"
                  colorScheme={getAppointmentTypeColor(appointment.appointmentType)}
                  variant="subtle"
                  px={3}
                  py={1}
                >
                  {getAppointmentTypeText(appointment.appointmentType)}
                </Badge>
              </Box>
            </Box>

            {/* Video Call Link - Only show for videollamada */}
            {appointment.appointmentType === 'videollamada' && appointment.meetLink && (
              <>
                <Divider />
                <Box>
                  <HStack spacing={3} mb={3}>
                    <Video size={20} color="#3182CE" />
                    <Text fontSize="lg" fontWeight="semibold">
                      Enlace de Videollamada
                    </Text>
                  </HStack>
                  <Box pl={8}>
                    <Flex
                      p={4}
                      bg="blue.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="blue.200"
                      justify="space-between"
                      align="center"
                    >
                      <Text
                        fontSize="sm"
                        color="blue.700"
                        fontFamily="mono"
                        noOfLines={1}
                        flex="1"
                        mr={3}
                      >
                        {appointment.meetLink}
                      </Text>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Copiar enlace"
                          icon={<Copy size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={handleCopyMeetLink}
                        />
                        <IconButton
                          aria-label="Unirse a la reunión"
                          icon={<ExternalLink size={16} />}
                          size="sm"
                          colorScheme="blue"
                          onClick={handleJoinMeeting}
                        />
                      </HStack>
                    </Flex>
                    <HStack spacing={4} mt={3}>
                      <Button
                        leftIcon={<Video size={16} />}
                        colorScheme="blue"
                        size="sm"
                        onClick={handleJoinMeeting}
                      >
                        Unirse a la Reunión
                      </Button>
                      <Button
                        leftIcon={<Copy size={16} />}
                        variant="outline"
                        size="sm"
                        onClick={handleCopyMeetLink}
                      >
                        Copiar Enlace
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              </>
            )}

            {/* Notes */}
            {appointment.notes && (
              <>
                <Divider />
                <Box>
                  <HStack spacing={3} mb={3}>
                    <FileText size={20} color="#805AD5" />
                    <Text fontSize="lg" fontWeight="semibold">
                      Notas
                    </Text>
                  </HStack>
                  <Box pl={8}>
                    <Text fontSize="md" color="gray.700" lineHeight="1.6">
                      {appointment.notes}
                    </Text>
                  </Box>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              leftIcon={<Edit size={16} />}
              variant="outline"
              colorScheme="blue"
              onClick={() => {
                // TODO: Implement edit functionality
                toast({
                  title: 'Función en desarrollo',
                  description: 'La edición de citas estará disponible próximamente',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={16} />}
              variant="outline"
              colorScheme="red"
              onClick={() => {
                // TODO: Implement delete functionality
                toast({
                  title: 'Función en desarrollo',
                  description: 'La eliminación de citas estará disponible próximamente',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Eliminar
            </Button>
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}