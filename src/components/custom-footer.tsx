import { SearchWrapper } from '@/components/search-wrapper'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggler } from '@/components/theme-toggler'
import { GithubIcon } from './animated-icons/github'

type Props = {
  lang: string
}

const CustomFooter = async ({ lang }: Props) => {
  return (
    <div className="pt-32">
      <div className="space-y-6">
        <div className="flex justify-end items-center gap-2">
          <SearchWrapper placeholder={lang === 'vi' ? 'Tìm bài viết...' : 'Search posts...'} />

          <LanguageSwitcher currentLocale={lang} />

          <ThemeToggler />

          <a
            href="https://github.com/aiden296"
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-9 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-gray-500/15 dark:hover:bg-gray-400/20"
            title="GitHub"
          >
            <GithubIcon size={20} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default CustomFooter
