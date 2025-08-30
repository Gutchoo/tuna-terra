import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InputWithButtonProps extends React.ComponentProps<"input"> {
  buttonText?: string
  buttonIcon?: React.ReactNode
  buttonVariant?: "default" | "outline" | "ghost" | "secondary"
  buttonSize?: "sm" | "default" | "lg"
  buttonPosition?: "right" | "left"
  onButtonClick?: () => void
  buttonDisabled?: boolean
  buttonLoading?: boolean
}

const InputWithButton = React.forwardRef<HTMLInputElement, InputWithButtonProps>(
  ({
    className,
    buttonText,
    buttonIcon,
    buttonVariant = "outline",
    buttonSize = "sm",
    buttonPosition = "right",
    onButtonClick,
    buttonDisabled,
    buttonLoading,
    ...props
  }, ref) => {
    const inputId = React.useId()
    const buttonId = React.useId()

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && onButtonClick && !buttonDisabled && !buttonLoading) {
        e.preventDefault()
        onButtonClick()
      }
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            buttonPosition === "right" && "pr-20",
            buttonPosition === "left" && "pl-20",
            className
          )}
          aria-describedby={buttonId}
          onKeyDown={handleKeyDown}
          {...props}
        />
        <Button
          id={buttonId}
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          disabled={buttonDisabled || buttonLoading}
          onClick={onButtonClick}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-7",
            buttonPosition === "right" && "right-1",
            buttonPosition === "left" && "left-1"
          )}
          aria-label={buttonText || "Action button"}
        >
          {buttonLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              {buttonIcon}
              {buttonText && <span className={buttonIcon ? "ml-1" : ""}>{buttonText}</span>}
            </>
          )}
        </Button>
      </div>
    )
  }
)
InputWithButton.displayName = "InputWithButton"

export { InputWithButton, type InputWithButtonProps }