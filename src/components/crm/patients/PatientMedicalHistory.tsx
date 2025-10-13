'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  Divider,
  useColorModeValue,
  Center,
  Spinner,
  useDisclosure,
  Grid,
  GridItem,
  Textarea,
  IconButton,
} from '@chakra-ui/react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import NewSessionModal from './NewSessionModal';

interface MedicalRecord {
  id: string;
  sessionDate: Date;
  sessionType: string;
  duration: number; // in minutes
  therapistName: string;
  sessionNotes: string;
  objectives: string[];
  techniques: string[];
  homework?: string;
  nextSessionPlan?: string;
  patientMood: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor';
  progress: 'significant' | 'moderate' | 'minimal' | 'none' | 'regression';
  attachments?: string[];
  paymentStatus: 'paid' | 'pending';
  paymentAmount: number;
  contractName?: string;
}

interface PatientMedicalHistoryProps {
  patientId: string;
}

// Mock medical records data
const getMockMedicalRecords = (patientId: string): MedicalRecord[] => {
  return [
    {
      id: '1',
      sessionDate: new Date('2024-01-15T11:00:00'),
      sessionType: 'Terapia Individual',
      duration: 60,
      therapistName: 'Dr. María González',
      sessionNotes: 'La paciente mostró una actitud muy positiva durante la sesión. Continuamos trabajando en técnicas de manejo de ansiedad. Se observa una mejora significativa en la aplicación de técnicas de respiración profunda. La paciente reporta menos episodios de ansiedad durante la semana.',
      objectives: [
        'Reducir niveles de ansiedad generalizada',
        'Mejorar técnicas de relajación',
        'Fortalecer autoestima'
      ],
      techniques: [
        'Respiración diafragmática',
        'Reestructuración cognitiva',
        'Mindfulness'
      ],
      homework: 'Practicar ejercicios de respiración 10 minutos diarios. Llevar registro de pensamientos automáticos negativos.',
      nextSessionPlan: 'Revisar registro de pensamientos. Introducir técnicas de exposición gradual.',
      patientMood: 'good',
      progress: 'moderate',
      paymentStatus: 'pending',
      paymentAmount: 1500,
      contractName: 'Contrato Premium - TechCorp',
    },
    {
      id: '2',
      sessionDate: new Date('2024-01-08T10:30:00'),
      sessionType: 'Evaluación de Seguimiento',
      duration: 90,
      therapistName: 'Dr. María González',
      sessionNotes: 'Evaluación mensual del progreso terapéutico. La paciente ha mostrado avances consistentes en el manejo de situaciones estresantes. Se aplicaron escalas de evaluación de ansiedad y depresión. Los resultados muestran una reducción del 40% en los niveles de ansiedad comparado con la evaluación inicial.',
      objectives: [
        'Evaluar progreso terapéutico',
        'Ajustar plan de tratamiento',
        'Establecer nuevas metas'
      ],
      techniques: [
        'Entrevista clínica estructurada',
        'Escalas de evaluación',
        'Análisis funcional'
      ],
      homework: 'Completar cuestionario de seguimiento semanal. Continuar con técnicas aprendidas.',
      nextSessionPlan: 'Trabajar en situaciones específicas de exposición social.',
      patientMood: 'good',
      progress: 'significant',
      paymentStatus: 'pending',
      paymentAmount: 1500,
      contractName: 'Contrato Premium - TechCorp',
    },
    {
      id: '3',
      sessionDate: new Date('2023-12-20T16:00:00'),
      sessionType: 'Terapia Individual',
      duration: 60,
      therapistName: 'Dr. María González',
      sessionNotes: 'Primera sesión del mes. La paciente llegó con mayor energía y motivación. Trabajamos en identificar patrones de pensamiento negativos y su impacto en el estado emocional. Se establecieron nuevos objetivos terapéuticos para el próximo mes.',
      objectives: [
        'Identificar patrones de pensamiento',
        'Establecer rutinas saludables',
        'Mejorar comunicación interpersonal'
      ],
      techniques: [
        'Registro de pensamientos',
        'Técnicas de comunicación asertiva',
        'Planificación de actividades'
      ],
      homework: 'Implementar rutina matutina. Practicar comunicación asertiva en situaciones cotidianas.',
      nextSessionPlan: 'Revisar implementación de rutinas. Trabajar en habilidades sociales.',
      patientMood: 'excellent',
      progress: 'moderate',
      paymentStatus: 'paid',
      paymentAmount: 1000,
      contractName: 'Contrato Básico - TechCorp',
    },
    {
      id: '4',
      sessionDate: new Date('2023-12-13T14:30:00'),
      sessionType: 'Terapia Individual',
      duration: 60,
      therapistName: 'Dr. María González',
      sessionNotes: 'Sesión enfocada en el procesamiento de eventos estresantes recientes en el trabajo. La paciente mostró buena capacidad de insight y disposición para aplicar las estrategias aprendidas. Se trabajó intensivamente en técnicas de afrontamiento.',
      objectives: [
        'Procesar eventos estresantes',
        'Desarrollar estrategias de afrontamiento',
        'Fortalecer resiliencia'
      ],
      techniques: [
        'Procesamiento emocional',
        'Técnicas de afrontamiento',
        'Reevaluación cognitiva'
      ],
      homework: 'Aplicar técnicas de afrontamiento en situaciones laborales. Mantener diario emocional.',
      nextSessionPlan: 'Evaluar efectividad de estrategias aplicadas. Reforzar técnicas exitosas.',
      patientMood: 'neutral',
      progress: 'moderate',
      paymentStatus: 'paid',
      paymentAmount: 1500,
    },
  ];
};

export default function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const medicalRecords = getMockMedicalRecords(patientId);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'neutral': return 'yellow';
      case 'poor': return 'orange';
      case 'very_poor': return 'red';
      default: return 'gray';
    }
  };

  const getMoodText = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'neutral': return 'Neutral';
      case 'poor': return 'Malo';
      case 'very_poor': return 'Muy Malo';
      default: return 'No especificado';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'significant': return 'green';
      case 'moderate': return 'blue';
      case 'minimal': return 'yellow';
      case 'none': return 'gray';
      case 'regression': return 'red';
      default: return 'gray';
    }
  };

  const getProgressText = (progress: string) => {
    switch (progress) {
      case 'significant': return 'Significativo';
      case 'moderate': return 'Moderado';
      case 'minimal': return 'Mínimo';
      case 'none': return 'Sin cambios';
      case 'regression': return 'Retroceso';
      default: return 'No evaluado';
    }
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          <FileText size={20} color="#3182CE" />
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Historial Clínico ({medicalRecords.length} registros)
          </Text>
        </HStack>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="green"
          size="sm"
          onClick={onOpen}
        >
          Nueva Sesión
        </Button>
      </HStack>

      {/* Medical Records List */}
      {medicalRecords.length === 0 ? (
        <Card bg={cardBg}>
          <CardBody>
            <Center py={10}>
              <VStack spacing={4}>
                <FileText size={64} color="#CBD5E0" />
                <Text color="gray.500" fontSize="lg">
                  No hay registros clínicos
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  Comienza agregando el primer registro de sesión
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="green"
                  onClick={onOpen}
                >
                  Crear Primer Registro
                </Button>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {medicalRecords.map((record) => (
            <Card key={record.id} bg={bg} shadow="md" borderRadius="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <HStack spacing={4}>
                      <VStack spacing={1} align="start">
                        <HStack spacing={2}>
                          <Calendar size={16} color="#3182CE" />
                          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                            {format(record.sessionDate, 'dd MMMM yyyy', { locale: es })}
                          </Text>
                        </HStack>
                        <HStack spacing={4}>
                          <HStack spacing={1}>
                            <Clock size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">
                              {format(record.sessionDate, 'HH:mm')} ({record.duration} min)
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <User size={14} color="#718096" />
                            <Text fontSize="sm" color="gray.600">
                              {record.therapistName}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </HStack>

                    <VStack spacing={2} align="end">
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={getMoodColor(record.patientMood)}
                          variant="subtle"
                          px={3}
                          py={1}
                        >
                          Estado: {getMoodText(record.patientMood)}
                        </Badge>
                        <Badge
                          colorScheme={getProgressColor(record.progress)}
                          variant="solid"
                          px={3}
                          py={1}
                        >
                          Progreso: {getProgressText(record.progress)}
                        </Badge>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={record.paymentStatus === 'paid' ? 'green' : 'red'}
                          variant="solid"
                          px={3}
                          py={1}
                          fontSize="xs"
                        >
                          {record.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700">
                          ${record.paymentAmount.toLocaleString()} MXN
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <Divider />

                  {/* Session Type and Contract */}
                  <HStack justify="space-between" align="center">
                    <Box>
                      <Text fontSize="md" fontWeight="medium" color="blue.600">
                        {record.sessionType}
                      </Text>
                    </Box>
                    {record.contractName && (
                      <HStack spacing={2}>
                        <CreditCard size={14} color="#718096" />
                        <Text fontSize="xs" color="gray.600">
                          {record.contractName}
                        </Text>
                      </HStack>
                    )}
                  </HStack>

                  {/* Session Notes */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      Notas de la Sesión:
                    </Text>
                    <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                      {record.sessionNotes}
                    </Text>
                  </Box>

                  {/* Objectives and Techniques */}
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Objetivos Trabajados:
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {record.objectives.map((objective, index) => (
                          <Text key={index} fontSize="xs" color="gray.600">
                            • {objective}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Técnicas Utilizadas:
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {record.techniques.map((technique, index) => (
                          <Text key={index} fontSize="xs" color="gray.600">
                            • {technique}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  </Grid>

                  {/* Homework and Next Session Plan */}
                  {(record.homework || record.nextSessionPlan) && (
                    <>
                      <Divider />
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        {record.homework && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                              Tareas Asignadas:
                            </Text>
                            <Text fontSize="xs" color="gray.600" lineHeight="1.5">
                              {record.homework}
                            </Text>
                          </Box>
                        )}
                        
                        {record.nextSessionPlan && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                              Plan Próxima Sesión:
                            </Text>
                            <Text fontSize="xs" color="gray.600" lineHeight="1.5">
                              {record.nextSessionPlan}
                            </Text>
                          </Box>
                        )}
                      </Grid>
                    </>
                  )}

                  {/* Actions */}
                  <HStack spacing={2} justify="flex-end" pt={2}>
                    <IconButton
                      aria-label="Ver detalles"
                      icon={<Eye size={14} />}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                    />
                    <IconButton
                      aria-label="Editar registro"
                      icon={<Edit size={14} />}
                      size="sm"
                      variant="outline"
                      colorScheme="green"
                    />
                    <IconButton
                      aria-label="Eliminar registro"
                      icon={<Trash2 size={14} />}
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={isOpen}
        onClose={onClose}
        patient={{ id: patientId, name: 'Paciente' }}
      />
    </VStack>
  );
}