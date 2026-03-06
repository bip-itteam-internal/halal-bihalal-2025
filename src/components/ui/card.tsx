import { Card as ChakraCard } from "@chakra-ui/react";

export const Card = ChakraCard.Root;
export const CardHeader = ChakraCard.Header;
export const CardBody = ChakraCard.Body;
export const CardContent = ChakraCard.Body;
export const CardFooter = ChakraCard.Footer;
export const CardTitle = ChakraCard.Title;
export const CardDescription = ChakraCard.Description;

/**
 * @deprecated Use `Card.Root`, `Card.Header`, etc from `@chakra-ui/react` directly
 * or from this file as a namespace if you prefer.
 */
export default {
  Root: ChakraCard.Root,
  Header: ChakraCard.Header,
  Body: ChakraCard.Body,
  Footer: ChakraCard.Footer,
  Title: ChakraCard.Title,
  Description: ChakraCard.Description,
};
