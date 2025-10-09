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
  Grid,
  GridItem,
  Box,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FileText, Calendar, Clock, User, Target, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionFormData {
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  duration: number;
  patientMood: string;
  sessionNotes: string;
  objectives: string;
  techniques: string;
  homework: string;
  nextSessionPlan: string;
  progress: string;
}

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    name: string;
  };
}

// Session types
const sessionTypes = [
  { value: 'individual', label: 'Terapia Individual' },
  { value: 'couple', label: 'Terapia de Pareja' },
  { value: 'family', label: 'Terapia Familiar' },
  { value: 'group', label: 'Terapia Grupal' },
  { value: 'evaluation', label: 'Evaluación Psicológica' },
  { value: 'followup', label: 'Seguimiento' },
  { value: 'crisis', label: 'Intervención en Crisis' },
];

// Duration options
const durationOptions = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' },
];

// Patient mood options
const moodOptions = [
  { value: 'excellent', label: 'Excelente', color: 'green' },
  { value: 'good', label: 'Bueno', color: 'blue' },
  { value: 'neutral', label: 'Neutral', color: 'yellow' },
  { value: 'poor', label: 'Malo', color: 'orange' },
  { value: 'very_poor', label: 'Muy Malo', color: 'red' },
];

// Progress options
const progressOptions = [
  { value: 'significant', label: 'Significativo', color: 'green' },
  { value: 'moderate', label: 'Moderado', color: 'blue' },
  { value: 'minimal', label: 'Mínimo', color: 'yellow' },
  { value: 'none', label: 'Sin cambios', color: 'gray' },
  { value: 'regression', label: 'Retroceso', color: 'red' },
];

export default function NewSessionModal({
  isOpen,
  onClose,
  patient,
}: NewSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<SessionFormData>({
    defaultValues: {
      sessionDate: format(new Date(), 'yyyy-MM-dd'),
      sessionTime: format(new Date(), 'HH:mm'),
      sessionType: 'individual',
      duration: 60,
      patientMood: 'good',
      progress: 'moderate',
    },
  });

  const watchedMood = watch('patientMood');
  const watchedProgress = watch('progress');

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Registro de sesión creado',
        description: `El registro de la sesión del ${format(new Date(data.sessionDate), 'dd/MM/yyyy', { locale: es })} ha sido guardado exitosamente.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error al guardar el registro',
        description: 'Hubo un problema al guardar el registro de la sesión. Intente nuevamente.',
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

  const getMoodColor = (mood: string) => {
    const option = moodOptions.find(opt => opt.value === mood);
    return option?.color || 'gray';
  };

  const getProgressColor = (progress: string) => {
    const option = progressOptions.find(opt => opt.value === progress);
    return option?.color || 'gray';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={3}>
            <FileText size={24} color="#3182CE" />
            <Box>
              <Text>Nuevo Registro de Sesión</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                Paciente: {patient.name}
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Session Basic Info */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Información Básica de la Sesión
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={!!errors.sessionDate}>
                    <FormLabel>
                      <HStack spacing={2}>
                        <Calendar size={16} />
                        <Text>Fecha</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="date"
                      {...register('sessionDate', { required: 'Seleccione una fecha' })}
                    />
                    {errors.sessionDate && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionDate.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.sessionTime}>
                    <FormLabel>
                      <HStack spacing={2}>
                        <Clock size={16} />
                        <FormLabel>Hora</FormLabel>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="time"
                      {...register('sessionTime', { required: 'Seleccione una hora' })}
                    />
                    {errors.sessionTime && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionTime.message}
                      </Text>
                    )}
                  </FormControl>

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
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                  <FormControl isRequired isInvalid={!!errors.sessionType}>
                    <FormLabel>Tipo de Sesión</FormLabel>
                    <Select
                      placeholder="Seleccionar tipo de sesión"
                      {...register('sessionType', { required: 'Seleccione el tipo de sesión' })}
                    >
                      {sessionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    {errors.sessionType && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionType.message}
                      </Text>
                    )}
                  </FormControl>

                  <Box>
                    <FormLabel>Estado del Paciente</FormLabel>
                    <HStack spacing={4}>
                      <Select {...register('patientMood')}>
                        {moodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <Badge
                        colorScheme={getMoodColor(watchedMood)}
                        variant="solid"
                        px={3}
                        py={1}
                        minW="80px"
                        textAlign="center"
                      >
                        {moodOptions.find(opt => opt.value === watchedMood)?.label}
                      </Badge>
                    </HStack>
                  </Box>
                </Grid>
              </Box>

              <Divider />

              {/* Session Content */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Contenido de la Sesión
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired isInvalid={!!errors.sessionNotes}>
                    <FormLabel>
                      <HStack spacing={2}>
                        <FileText size={16} />
                        <Text>Notas de la Sesión</Text>
                      </HStack>
                    </FormLabel>
                    <Textarea
                      placeholder="Describe lo que ocurrió durante la sesión, observaciones importantes, respuesta del paciente, etc."
                      rows={4}
                      {...register('sessionNotes', { required: 'Las notas de la sesión son requeridas' })}
                    />
                    {errors.sessionNotes && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionNotes.message}
                      </Text>
                    )}
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Target size={16} />
                          <Text>Objetivos Trabajados</Text>
                        </HStack>
                      </FormLabel>
                      <Textarea
                        placeholder="Lista los objetivos terapéuticos que se trabajaron en esta sesión (uno por línea)"
                        rows={3}
                        {...register('objectives')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Zap size={16} />
                          <Text>Técnicas Utilizadas</Text>
                        </HStack>
                      </FormLabel>
                      <Textarea
                        placeholder="Enumera las técnicas terapéuticas aplicadas (una por línea)"
                        rows={3}
                        {...register('techniques')}
                      />
                    </FormControl>
                  </Grid>
                </VStack>
              </Box>

              <Divider />

              {/* Follow-up and Progress */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Seguimiento y Progreso
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Tareas para Casa</FormLabel>
                    <Textarea
                      placeholder="Describe las tareas o ejercicios que el paciente debe realizar antes de la próxima sesión"
                      rows={3}
                      {...register('homework')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Plan para Próxima Sesión</FormLabel>
                    <Textarea
                      placeholder="Describe lo que planeas trabajar en la siguiente sesión"
                      rows={3}
                      {...register('nextSessionPlan')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Evaluación del Progreso</FormLabel>
                    <HStack spacing={4}>
                      <Select {...register('progress')}>
                        {progressOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <Badge
                        colorScheme={getProgressColor(watchedProgress)}
                        variant="solid"
                        px={3}
                        py={1}
                        minW="100px"
                        textAlign="center"
                      >
                        {progressOptions.find(opt => opt.value === watchedProgress)?.label}
                      </Badge>
                    </HStack>
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                isLoading={isLoading}
                loadingText="Guardando registro..."
                spinner={<Spinner size="sm" />}
                disabled={!isValid}
              >
                Guardar Registro
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}