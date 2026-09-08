interface FormErrorProps {
  message: string | null | undefined
}

export function FormError({ message }: FormErrorProps) {
  return <span className="text-destructive text-center text-xs">{message}</span>
}
