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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  HStack,
  Text,
  useToast,
  useColorModeValue,
  Grid,
  Badge,
  Box,
  Divider,
} from '@chakra-ui/react';
import { FileText, Save, X, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Patient {
  id: string;
  name: string;
  lastSession?: Date;
}

const mockPatients: Patient[] = [
  { id: '1', name: 'María González', lastSession: new Date('2024-01-15') },
  { id: '2', name: 'Carlos Rodríguez', lastSession: new Date('2024-01-14') },
  { id: '3', name: 'Ana López', lastSession: new Date('2024-01-16') },
  { id: '4', name: 'Pedro Martínez', lastSession: new Date('2024-01-10') },
  { id: '5', name: 'Laura Sánchez' },
];

export default function NewSessionModal({
  isOpen,
  onClose,
}: NewSessionModalProps) {
  const toast = useToast();
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const [formData, setFormData] = useState({
    patientId: '',
    sessionDate: format(new Date(), 'yyyy-MM-dd'),
    sessionTime: format(new Date(), 'HH:mm'),
    duration: '60',
    sessionType: 'individual',
    mainThemes: '',
    interventions: '',
    observations: '',
    nextSessionGoals: '',
    patientProgress: 'stable',
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'patientId') {
      const patient = mockPatients.find(p => p.id === value);
      setSelectedPatient(patient || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.sessionDate || !formData.sessionTime || !formData.mainThemes) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('Session data:', formData);

      toast({
        title: 'Sesión registrada',
        description: 'La sesión se ha registrado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        patientId: '',
        sessionDate: format(new Date(), 'yyyy-MM-dd'),
        sessionTime: format(new Date(), 'HH:mm'),
        duration: '60',
        sessionType: 'individual',
        mainThemes: '',
        interventions: '',
        observations: '',
        nextSessionGoals: '',
        patientProgress: 'stable',
      });
      setSelectedPatient(null);
      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar la sesión',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={3}>
            <FileText size={24} color="#3182CE" />
            <Text>Registrar Nueva Sesión</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Paciente</FormLabel>
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="Selecciona un paciente"
                  bg={inputBg}
                  borderColor={borderColor}
                >
                  {mockPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </Select>
                {selectedPatient?.lastSession && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Última sesión: {format(selectedPatient.lastSession, "dd 'de' MMMM, yyyy", { locale: es })}
                  </Text>
                )}
              </FormControl>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Fecha</FormLabel>
                  <Input
                    name="sessionDate"
                    type="date"
                    value={formData.sessionDate}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Hora</FormLabel>
                  <Input
                    name="sessionTime"
                    type="time"
                    value={formData.sessionTime}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Duración (min)</FormLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  >
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                    <option value="120">120 minutos</option>
                  </Select>
                </FormControl>
              </Grid>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Tipo de Sesión</FormLabel>
                  <Select
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  >
                    <option value="individual">Individual</option>
                    <option value="pareja">Pareja</option>
                    <option value="familiar">Familiar</option>
                    <option value="grupal">Grupal</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Progreso del Paciente</FormLabel>
                  <Select
                    name="patientProgress"
                    value={formData.patientProgress}
                    onChange={handleChange}
                    bg={inputBg}
                    borderColor={borderColor}
                  >
                    <option value="mejoría-significativa">Mejoría Significativa</option>
                    <option value="mejoría-moderada">Mejoría Moderada</option>
                    <option value="mejoría-leve">Mejoría Leve</option>
                    <option value="stable">Estable</option>
                    <option value="sin-cambios">Sin Cambios</option>
                    <option value="retroceso">Retroceso</option>
                  </Select>
                </FormControl>
              </Grid>

              <Divider />

              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
                  Detalles de la Sesión
                </Text>

                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Temas Principales Abordados</FormLabel>
                    <Textarea
                      name="mainThemes"
                      value={formData.mainThemes}
                      onChange={handleChange}
                      placeholder="Describe los temas principales discutidos en la sesión..."
                      rows={3}
                      bg={inputBg}
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Intervenciones Realizadas</FormLabel>
                    <Textarea
                      name="interventions"
                      value={formData.interventions}
                      onChange={handleChange}
                      placeholder="Técnicas, ejercicios o intervenciones aplicadas..."
                      rows={3}
                      bg={inputBg}
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Observaciones Clínicas</FormLabel>
                    <Textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleChange}
                      placeholder="Estado emocional, comportamiento, aspectos relevantes..."
                      rows={3}
                      bg={inputBg}
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Objetivos para Próxima Sesión</FormLabel>
                    <Textarea
                      name="nextSessionGoals"
                      value={formData.nextSessionGoals}
                      onChange={handleChange}
                      placeholder="Metas y tareas para la siguiente sesión..."
                      rows={2}
                      bg={inputBg}
                      borderColor={borderColor}
                    />
                  </FormControl>
                </VStack>
              </Box>

              <Box bg="blue.50" p={4} borderRadius="md" borderWidth="1px" borderColor="blue.200">
                <Text fontSize="xs" color="blue.700" lineHeight="1.6">
                  <strong>Nota:</strong> Esta información es confidencial y forma parte del expediente clínico del paciente.
                  Asegúrate de que todos los datos sean precisos y completos.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                leftIcon={<X size={16} />}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<Save size={16} />}
              >
                Registrar Sesión
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
