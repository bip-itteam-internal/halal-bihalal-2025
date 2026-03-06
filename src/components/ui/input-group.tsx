import * as React from "react"
import { Group, InputElement } from "@chakra-ui/react"

export interface InputGroupProps extends React.ComponentProps<typeof Group> {
  startElement?: React.ReactNode
  endElement?: React.ReactNode
  startElementProps?: React.ComponentProps<typeof InputElement>
  endElementProps?: React.ComponentProps<typeof InputElement>
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      ...rest
    } = props

    return (
      <Group ref={ref} {...rest}>
        {startElement && (
          <InputElement pointerEvents="none" {...startElementProps}>
            {startElement}
          </InputElement>
        )}
        {React.cloneElement(children as React.ReactElement, {
          ...(startElement && { ps: "11" }),
          ...(endElement && { pe: "11" }),
        })}
        {endElement && (
          <InputElement placement="end" pointerEvents="none" {...endElementProps}>
            {endElement}
          </InputElement>
        )}
      </Group>
    )
  },
)
