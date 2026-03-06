import React from "react";
import { Box, Text, Heading, VStack, Card, Circle } from "@chakra-ui/react";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'primary' | 'secondary';
  className?: string;
}

export function StatsCard({ icon, label, value, color, className }: StatsCardProps) {
  const colorMap: Record<StatsCardProps['color'], string> = {
    blue: "blue",
    emerald: "green",
    amber: "orange",
    indigo: "purple",
    rose: "red",
    primary: "emerald",
    secondary: "amber",
  };

  const chakraColor = colorMap[color];

  return (
    <Card.Root
      flex="1"
      p={8}
      borderRadius="3xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={{ base: "gray.100", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.800" }}
      transition="all 0.3s"
      _hover={{ boxShadow: "2xl", transform: "translateY(-4px)" }}
    >
      <VStack align="start" gap={6}>
        <Circle 
          size="14" 
          bg={{ base: `${chakraColor}.50`, _dark: `${chakraColor}.900/20` }}
          color={{ base: `${chakraColor}.600`, _dark: `${chakraColor}.400` }}
          borderWidth="1px"
          borderColor={{ base: `${chakraColor}.100`, _dark: `${chakraColor}.800/20` }}
        >
          {React.isValidElement<{ size?: number }>(icon) && React.cloneElement(icon, { 
            size: 28 
          })}
        </Circle>
        <Box>
          <Text 
            fontSize="xs" 
            fontWeight="black" 
            color="gray.400" 
            textTransform="uppercase" 
            letterSpacing="widest" 
            mb={1}
          >
            {label}
          </Text>
          <Heading fontSize="3xl" fontWeight="black" color={{ base: "gray.900", _dark: "white" }}>
            {value}
          </Heading>
        </Box>
      </VStack>
    </Card.Root>
  );
}
