'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

export default function CRMPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/crm/dashboard');
  }, [router]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing="4">
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.600">Redirecting to dashboard...</Text>
      </VStack>
    </Box>
  );
}
