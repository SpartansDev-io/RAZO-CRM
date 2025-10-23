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
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Grid,
  GridItem,
  Textarea,
  Divider,
  Box,
} from '@chakra-ui/react';
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Home,
  Cake,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';

interface NewPatientFormData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Other';

  // Personal Information
  occupation: string;
  company: string;
  address: string;

  // Sociodemographic Information
  maritalStatus: string;
  educationLevel: string;
  nationality: string;
  religion: string;
  livingSituation: string;
  hasChildren: string;
  childrenCount?: number;

  // Contact Information
  emergencyContact: string;
  emergencyPhone: string;

  // Therapy Information
  therapyType: string;
  referredBy?: string;

  // Clinical Information
  reasonForTherapy: string;
  expectations?: string;
  previousTherapy: string;
  previousTherapyDetails?: string;
  currentMedications?: string;
  medicalConditions?: string;
  familyHistory?: string;

  // Additional Notes
  notes?: string;
}

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPatientModal({
  isOpen,
  onClose,
}: NewPatientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewPatientFormData>({
    defaultValues: {
      gender: 'M',
      maritalStatus: 'Soltero/a',
      educationLevel: 'Licenciatura',
      nationality: 'Mexicana',
      hasChildren: 'no',
      therapyType: 'individual',
      previousTherapy: 'no',
    },
  });

  const watchHasChildren = watch('hasChildren');
  const watchPreviousTherapy = watch('previousTherapy');

  const onSubmit = async (data: NewPatientFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Paciente registrado exitosamente',
        description: `${data.name} ha sido agregado al sistema`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error al registrar el paciente',
        description:
          'Hubo un problema al guardar la información. Intente nuevamente.',
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
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <UserPlus size={24} color="#3182CE" />
              <Text>Nuevo Paciente</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Basic Information Section */}
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="gray.800"
                >
                  <HStack spacing={2}>
                    <User size={20} />
                    <Text>Información Básica</Text>
                  </HStack>
                </Text>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl isRequired isInvalid={!!errors.name}>
                      <FormLabel>Nombre Completo</FormLabel>
                      <Input
                        placeholder="Ej: María González López"
                        {...register('name', {
                          required: 'El nombre es requerido',
                        })}
                      />
                      {errors.name && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.name.message}
                        </Text>
                      )}
                    </FormControl>
                  </GridItem>

                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>
                      <HStack spacing={1}>
                        <Mail size={14} />
                        <Text>Correo Electrónico</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      {...register('email', {
                        required: 'El correo es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Correo electrónico inválido',
                        },
                      })}
                    />
                    {errors.email && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.email.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.phone}>
                    <FormLabel>
                      <HStack spacing={1}>
                        <Phone size={14} />
                        <Text>Teléfono</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="tel"
                      placeholder="+52 555 123 4567"
                      {...register('phone', {
                        required: 'El teléfono es requerido',
                      })}
                    />
                    {errors.phone && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.phone.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.birthDate}>
                    <FormLabel>
                      <HStack spacing={1}>
                        <Cake size={14} />
                        <Text>Fecha de Nacimiento</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="date"
                      max={format(new Date(), 'yyyy-MM-dd')}
                      {...register('birthDate', {
                        required: 'La fecha de nacimiento es requerida',
                      })}
                    />
                    {errors.birthDate && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.birthDate.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Género</FormLabel>
                    <Select {...register('gender', { required: true })}>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="Other">Otro</option>
                    </Select>
                  </FormControl>
                </Grid>
              </Box>

              <Divider />

              {/* Personal Information Section */}
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="gray.800"
                >
                  Información Personal
                </Text>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  <FormControl isRequired isInvalid={!!errors.occupation}>
                    <FormLabel>
                      <HStack spacing={1}>
                        <Briefcase size={14} />
                        <Text>Ocupación</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      placeholder="Ej: Ingeniero de Software"
                      {...register('occupation', {
                        required: 'La ocupación es requerida',
                      })}
                    />
                    {errors.occupation && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.occupation.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <HStack spacing={1}>
                        <Building size={14} />
                        <Text>Empresa</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      placeholder="Nombre de la empresa"
                      {...register('company')}
                    />
                  </FormControl>

                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl>
                      <FormLabel>
                        <HStack spacing={1}>
                          <Home size={14} />
                          <Text>Dirección</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        placeholder="Calle, número, colonia, ciudad"
                        {...register('address')}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>

              <Divider />

              {/* Sociodemographic Information */}
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="gray.800"
                >
                  Datos Sociodemográficos
                </Text>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  <FormControl>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select {...register('maritalStatus')}>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Unión Libre">Unión Libre</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Nivel Educativo</FormLabel>
                    <Select {...register('educationLevel')}>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Preparatoria">Preparatoria</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Maestría">Maestría</option>
                      <option value="Doctorado">Doctorado</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Nacionalidad</FormLabel>
                    <Input
                      placeholder="Ej: Mexicana"
                      {...register('nationality')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Religión</FormLabel>
                    <Input
                      placeholder="Ej: Católica, Ninguna, etc."
                      {...register('religion')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Situación de Vivienda</FormLabel>
                    <Input
                      placeholder="Ej: Vive solo/a, Con familia, etc."
                      {...register('livingSituation')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>¿Tiene hijos?</FormLabel>
                    <Select {...register('hasChildren')}>
                      <option value="no">No</option>
                      <option value="yes">Sí</option>
                    </Select>
                  </FormControl>

                  {watchHasChildren === 'yes' && (
                    <FormControl>
                      <FormLabel>Número de Hijos</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register('childrenCount', { valueAsNumber: true })}
                      />
                    </FormControl>
                  )}
                </Grid>
              </Box>

              <Divider />

              {/* Emergency Contact */}
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="gray.800"
                >
                  <HStack spacing={2}>
                    <AlertCircle size={20} color="#E53E3E" />
                    <Text>Contacto de Emergencia</Text>
                  </HStack>
                </Text>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  <FormControl isRequired isInvalid={!!errors.emergencyContact}>
                    <FormLabel>Nombre del Contacto</FormLabel>
                    <Input
                      placeholder="Nombre completo"
                      {...register('emergencyContact', {
                        required: 'El contacto de emergencia es requerido',
                      })}
                    />
                    {errors.emergencyContact && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.emergencyContact.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.emergencyPhone}>
                    <FormLabel>Teléfono de Emergencia</FormLabel>
                    <Input
                      type="tel"
                      placeholder="+52 555 123 4567"
                      {...register('emergencyPhone', {
                        required: 'El teléfono de emergencia es requerido',
                      })}
                    />
                    {errors.emergencyPhone && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.emergencyPhone.message}
                      </Text>
                    )}
                  </FormControl>
                </Grid>
              </Box>

              <Divider />

              {/* Therapy Information */}
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="gray.800"
                >
                  Información de Terapia
                </Text>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  <FormControl isRequired>
                    <FormLabel>Tipo de Terapia</FormLabel>
                    <Select {...register('therapyType', { required: true })}>
                      <option value="individual">Terapia Individual</option>
                      <option value="couple">Terapia de Pareja</option>
                      <option value="family">Terapia Familiar</option>
                      <option value="group">Terapia Grupal</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Referido Por</FormLabel>
                    <Input
                      placeholder="Ej: Dr. Pérez, Programa de Bienestar"
                      {...register('referredBy')}
                    />
                  </FormControl>

                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl
                      isRequired
                      isInvalid={!!errors.reasonForTherapy}
                    >
                      <FormLabel>Motivo de Consulta</FormLabel>
                      <Textarea
                        placeholder="Describa brevemente el motivo principal de consulta"
                        rows={4}
                        {...register('reasonForTherapy', {
                          required: 'El motivo de consulta es requerido',
                        })}
                      />
                      {errors.reasonForTherapy && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.reasonForTherapy.message}
                        </Text>
                      )}
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl>
                      <FormLabel>Expectativas del Tratamiento</FormLabel>
                      <Textarea
                        placeholder="¿Qué espera lograr con la terapia?"
                        rows={3}
                        {...register('expectations')}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>

              <Divider />

              {/* Clinical Information */}
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="gray.800"
                >
                  Información Clínica
                </Text>

                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>¿Ha tenido terapia previa?</FormLabel>
                    <Select {...register('previousTherapy')}>
                      <option value="no">No</option>
                      <option value="yes">Sí</option>
                    </Select>
                  </FormControl>

                  {watchPreviousTherapy === 'yes' && (
                    <FormControl>
                      <FormLabel>Detalles de Terapia Previa</FormLabel>
                      <Textarea
                        placeholder="Cuándo, duración, motivo, resultados"
                        rows={3}
                        {...register('previousTherapyDetails')}
                      />
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel>Medicación Actual</FormLabel>
                    <Textarea
                      placeholder="Liste medicamentos actuales, dosis y para qué los toma"
                      rows={2}
                      {...register('currentMedications')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Condiciones Médicas</FormLabel>
                    <Textarea
                      placeholder="Enfermedades crónicas, alergias, cirugías previas, etc."
                      rows={2}
                      {...register('medicalConditions')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Historial Familiar Psiquiátrico</FormLabel>
                    <Textarea
                      placeholder="Antecedentes de trastornos mentales en la familia"
                      rows={2}
                      {...register('familyHistory')}
                    />
                  </FormControl>
                </VStack>
              </Box>

              <Divider />

              {/* Additional Notes */}
              <Box>
                <FormControl>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <Textarea
                    placeholder="Cualquier información adicional relevante"
                    rows={3}
                    {...register('notes')}
                  />
                </FormControl>
              </Box>

              {/* Important Note */}
              <Box
                bg="blue.50"
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <Text fontSize="xs" color="blue.700" lineHeight="1.6">
                  <strong>Nota de Confidencialidad:</strong> Toda la información
                  proporcionada es confidencial y forma parte del expediente
                  clínico del paciente. Está protegida por las leyes de
                  privacidad médica.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Guardando paciente..."
                spinner={<Spinner size="sm" />}
              >
                Registrar Paciente
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
