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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { Calendar as CalendarIcon, Clock, User, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentFormData {
  date: string;
  time: string;
  patientId: string;
  therapyType: string;
  appointmentType: string;
  duration: number;
  notes: string;
  googleCalendar: boolean;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
}

// Mock patients data
const mockPatients = [
  { id: '1', name: 'María González', email: 'maria.g@email.com' },
  { id: '2', name: 'Carlos Rodríguez', email: 'carlos.r@email.com' },
  { id: '3', name: 'Ana López', email: 'ana.l@email.com' },
  { id: '4', name: 'Pedro Martínez', email: 'pedro.m@email.com' },
  { id: '5', name: 'Laura Fernández', email: 'laura.f@email.com' },
];

// Therapy types
const therapyTypes = [
  { value: 'individual', label: 'Terapia Individual' },
  { value: 'couple', label: 'Terapia de Pareja' },
  { value: 'family', label: 'Terapia Familiar' },
  { value: 'group', label: 'Terapia Grupal' },
  { value: 'evaluation', label: 'Evaluación Inicial' },
  { value: 'followup', label: 'Seguimiento' },
];

// Duration options
const durationOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' },
];

// Appointment type options
const appointmentTypes = [
  { value: 'presencial', label: 'Presencial', icon: '🏢' },
  { value: 'videollamada', label: 'Videollamada', icon: '💻' },
  { value: 'visita', label: 'Visita Domiciliaria', icon: '🏠' },
];
export default function AppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
}: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<AppointmentFormData>({
  });

  // Set form values when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setValue('date', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setValue('time', selectedTime || '09:00');
      setValue('appointmentType', 'presencial');
      setValue('duration', 60);
      setValue('googleCalendar', true);
    }
  }, [isOpen, selectedDate, selectedTime, setValue]);

  const watchedDate = watch('date');
  const watchedTime = watch('time');
  const onSubmit = async (data: AppointmentFormData) => {
    // Validate that the appointment is not in the past
    const appointmentDateTime = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      toast({
        title: 'Fecha y hora inválidas',
        description: 'No puedes programar una cita en el pasado. Selecciona una fecha y hora futura.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock Google Calendar integration
      if (data.googleCalendar) {
        console.log('Creating Google Calendar event...');
      }

      toast({
        title: 'Cita creada exitosamente',
        description: `La cita ha sido programada para ${format(new Date(data.date), 'dd/MM/yyyy', { locale: es })} a las ${data.time}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error al crear la cita',
        description: 'Hubo un problema al programar la cita. Intente nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <CalendarIcon size={24} color="#3182CE" />
            <Text>Nueva Cita</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Date and Time Display - Only show if slot was selected from grid */}
              {selectedDate && selectedTime ? (
                <VStack spacing={4} align="stretch">
                  <HStack
                    p={4}
                    bg="blue.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="blue.200"
                  >
                    <Clock size={16} color="#3182CE" />
                    <Text fontSize="sm" fontWeight="medium" color="blue.700">
                      Cita seleccionada para: {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })}
                    </Text>
                  </HStack>

                  {/* Editable Date and Time Fields */}
                  <HStack spacing={4}>
                    {/* Date Field */}
                    <FormControl isRequired flex="1">
                        <HStack spacing={2}>
                          <CalendarIcon size={16} />
                          <FormLabel>Fecha</FormLabel>
                        </HStack>
                      <Input
                        type="date"
                        isReadOnly={true}
                        bg="gray.50"
                        cursor="not-allowed"
                        {...register('date', { required: 'Seleccione una fecha' })}
                      />
                      {errors.date && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.date.message}
                        </Text>
                      )}
                    </FormControl>

                    {/* Time Field */}
                    <FormControl isRequired flex="1">
                        <HStack spacing={2}>
                          <Clock size={16} />
                          <FormLabel>Hora</FormLabel>
                        </HStack>
                      <Input
                        type="time"
                        step="900" // 15 minute intervals
                        {...register('time', { required: 'Seleccione una hora' })}
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              ) : (
                /* Date and Time Input Fields - Show when creating from "Nueva Cita" button */
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    {/* Date Field */}
                    <FormControl isRequired flex="1">
                        <HStack spacing={2}>
                          <CalendarIcon size={16} />
                          <FormLabel>Fecha</FormLabel>
                        </HStack>
                      <Input
                        type="date"
                        {...register('date', { required: 'Seleccione una fecha' })}
                      />
                      {errors.date && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.date.message}
                        </Text>
                      )}
                    </FormControl>

                    {/* Time Field */}
                    <FormControl isRequired flex="1">
                        <HStack spacing={2}>
                          <Clock size={16} />
                          <FormLabel>Hora</FormLabel>
                        </HStack>
                      <Input
                        type="time"
                        step="900" // 15 minute intervals
                        {...register('time', { required: 'Seleccione una hora' })}
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              )}

              {/* Patient Selection */}
              <FormControl isRequired isInvalid={!!errors.patientId}>
                  <HStack spacing={2}>
                    <User size={16} />
                    <FormLabel>Paciente</FormLabel>
                  </HStack>
                <Select
                  placeholder="Seleccionar paciente"
                  {...register('patientId', { required: 'Seleccione un paciente' })}
                >
                  {mockPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </Select>
                {errors.patientId && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.patientId.message}
                  </Text>
                )}
              </FormControl>

              {/* Therapy Type */}
              <FormControl isRequired isInvalid={!!errors.therapyType}>
                <FormLabel>Tipo de Terapia</FormLabel>
                <Select
                  placeholder="Seleccionar tipo de terapia"
                  {...register('therapyType', { required: 'Seleccione el tipo de terapia' })}
                >
                  {therapyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {errors.therapyType && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.therapyType.message}
                  </Text>
                )}
              </FormControl>

              {/* Appointment Type */}
              <FormControl isRequired isInvalid={!!errors.appointmentType}>
                <FormLabel>Tipo de Cita</FormLabel>
                <Select
                  placeholder="Seleccionar tipo de cita"
                  {...register('appointmentType', { required: 'Seleccione el tipo de cita' })}
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {errors.appointmentType && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.appointmentType.message}
                  </Text>
                )}
              </FormControl>

              {/* Duration */}
              <FormControl isRequired>
                <FormLabel>Duración</FormLabel>
                <Select {...register('duration', { valueAsNumber: true })}>
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Notes */}
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <FileText size={16} />
                    <Text>Notas</Text>
                  </HStack>
                </FormLabel>
                <Textarea
                  placeholder="Notas adicionales sobre la cita..."
                  rows={3}
                  {...register('notes')}
                />
              </FormControl>

              {/* Google Calendar Integration */}
              <FormControl>
                <HStack spacing={3}>
                  <input
                    type="checkbox"
                    {...register('googleCalendar')}
                    defaultChecked
                  />
                  <Text fontSize="sm" color="gray.600">
                    Sincronizar con Google Calendar
                  </Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Creando cita..."
                spinner={<Spinner size="sm" />}
                disabled={!isValid}
              >
                Crear Cita
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}