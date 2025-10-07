'use client';

import {
  Box,
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: () => void;
}

export default function QuickActionButton({
  icon,
  label,
  color,
  onClick,
}: QuickActionButtonProps) {
  const bg = useColorModeValue(`${color}.50`, `${color}.900`);
  const hoverBg = useColorModeValue(`${color}.100`, `${color}.800`);
  const textColor = useColorModeValue(`${color}.700`, `${color}.200`);
  const iconColor = useColorModeValue(`${color}.600`, `${color}.300`);

  return (
    <Box
      p={4}
      borderRadius="lg"
      bg={bg}
      cursor="pointer"
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      onClick={onClick}
    >
      <HStack spacing={3}>
        <Icon as={icon} boxSize={5} color={iconColor} />
        <Text fontWeight="medium" color={textColor} fontSize="sm">
          {label}
        </Text>
      </HStack>
    </Box>
  );
}
