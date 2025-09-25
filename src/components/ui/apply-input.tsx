import * as React from "react"
import { InputWithButton, type InputWithButtonProps } from "./input-with-button"

interface ApplyInputProps extends Omit<InputWithButtonProps, 'buttonText' | 'buttonIcon' | 'onButtonClick'> {
  onApply?: () => void
  applyDisabled?: boolean
}

const ApplyInput = React.forwardRef<HTMLInputElement, ApplyInputProps>(
  ({ onApply, applyDisabled, buttonDisabled, ...props }, ref) => {
    return (
      <InputWithButton
        ref={ref}
        buttonText="Apply"
        buttonVariant="outline"
        buttonSize="sm"
        onButtonClick={onApply}
        buttonDisabled={applyDisabled || buttonDisabled}
        {...props}
      />
    )
  }
)

ApplyInput.displayName = "ApplyInput"

export { ApplyInput, type ApplyInputProps }