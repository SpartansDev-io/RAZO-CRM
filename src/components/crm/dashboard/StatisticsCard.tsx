'use client';

import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import type { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: LucideIcon;
  color: string;
}

export default function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}: StatisticsCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.500`, `${color}.200`);

  return (
    <Card bg={bg} shadow="sm" borderRadius="lg">
      <CardBody>
        <Stat>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">
              {title}
            </StatLabel>
            <Box
              p={2}
              borderRadius="lg"
              bg={iconBg}
            >
              <Icon as={icon} boxSize={5} color={iconColor} />
            </Box>
          </Box>
          <StatNumber fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </StatNumber>
          <StatHelpText mb={0}>
            <StatArrow type={changeType} />
            {change} desde el mes pasado
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
}