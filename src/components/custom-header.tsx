import Logo from '@/components/logo'
import { TypingAnimation } from '@/components/ui/typing-animation'

type Props = {
  lang: string
}

const CustomHeader = async ({ lang }: Props) => {
  return (
    <div className="custom-header flex items-center justify-between mb-10">
      <div className="flex items-center gap-2">
        <Logo />
        <TypingAnimation
          as="span"
          loop
          pauseDelay={3000}
          className="cursor-default text-lg font-bold leading-normal"
          cursorStyle="underscore"
          startOnView={false}
          persistCursor
        >
          Aiden Tran
        </TypingAnimation>
      </div>
    </div>
  )
}

export default CustomHeader
