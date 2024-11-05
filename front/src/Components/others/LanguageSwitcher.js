import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ changeLanguage }) {

    const { i18n } = useTranslation();

    return (
        <div className='flex divide-x-2'>
            <button
                onClick={() => changeLanguage('fr')}
                className={`text-sm font-bold px-2 ${i18n.language === 'fr' ? 'text-gray-900' : 'text-gray-400'}`}
            >
                FR
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`text-sm font-bold px-2 ${i18n.language === 'en' ? 'text-gray-900' : 'text-gray-400'}`}
            >
                EN
            </button>
        </div>
    )
}