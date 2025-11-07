interface SuccessProps {
  message: string
}

export default function Success({ message }: SuccessProps) {
  return (
    <div className="card success">
      <p>{message}</p>
    </div>
  )
}