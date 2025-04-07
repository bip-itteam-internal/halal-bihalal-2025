"use client"

import {
  ChakraProvider,
  defaultConfig,
  createSystem,
} from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: '400',
  subsets: ['latin'],
})

const system = createSystem(defaultConfig, {
  globalCss: {
    body: {
      background: `linear-gradient(rgb(0 68 123 / 90%), rgba(255, 255, 255, 0.9)), url(../background.webp)`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    }
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: poppins.style.fontFamily },
        body: { value: poppins.style.fontFamily }
      },
      colors: {
        primary: {
          value: "#009b4c"
        },
        secondary: {
          value: "#b6d43d"
        },
        cancel: {
          value: "#fff"
        }
      }
    }
  }
})

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
