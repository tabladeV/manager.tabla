"use client"

import { DevOnly } from "../../components/DevOnly"
import Logo from "../../components/header/Logo"

export default function TermsAndConditions() {
  const sections = [
    {
      title: "Objet de la plateforme",
      content:
        "Tabla est un service en ligne permettant aux utilisateurs de réserver une table dans les établissements partenaires (restaurants, cafés, hôtels…). Nous mettons en relation les clients avec les établissements via une interface fluide et intuitive.",
    },
    {
      title: "Collecte et utilisation des données personnelles",
      subsections: [
        {
          subtitle: "Données collectées",
          items: [
            "Nom",
            "Prénom",
            "Numéro de téléphone",
            "Adresse email",
            "Informations de réservation (nombre de personnes, date, heure…)",
          ],
        },
        {
          subtitle: "Finalités de l'utilisation",
          items: [
            "Transmission des données au restaurant concerné afin d'assurer une réservation fluide et confirmée dans les meilleures conditions.",
            "Envoi d'emails transactionnels liés à votre réservation : confirmation, rappels, demandes d'avis, questionnaires de satisfaction.",
            "Inscription à nos listes d'emailing pour vous tenir informé de nos services, de nos nouveautés, et d'éventuelles campagnes marketing ou CRM pertinentes.",
          ],
        },
      ],
    },
    {
      title: "Respect de la vie privée et confidentialité",
      content:
        "Tabla s'engage à ne jamais partager, vendre ou transmettre vos données personnelles à des tiers non autorisés, en dehors des établissements auprès desquels vous effectuez une réservation. Vos données sont utilisées uniquement dans le cadre de votre interaction avec la plateforme et les établissements partenaires.",
    },
    {
      title: "Désabonnement et gestion des préférences",
      items: [
        "Vous désabonner de nos communications marketing via le lien prévu à cet effet dans nos emails.",
        "Demander la suppression ou la modification de vos données personnelles en nous contactant à l'adresse : contact@tabla.ma",
      ],
    },
    {
      title: "Sécurité des données",
      content:
        "Nous mettons en œuvre tous les moyens techniques et organisationnels nécessaires pour garantir la sécurité et la confidentialité de vos données. Nos serveurs sont protégés et les accès à vos données sont strictement encadrés.",
    },
    {
      title: "Modification des CGU et politique de confidentialité",
      content:
        "Tabla se réserve le droit de modifier à tout moment les présentes conditions générales. Les utilisateurs seront informés de toute modification importante par email ou via notre site.",
    },
    {
      title: "Mentions légales",
      content: "Vous trouverez toutes les mentions légales de Tabla sur la page Mentions légales",
    },
    {
      title: "Contact",
      content:
        "Pour toute question concernant ces CGU-CGP ou vos données personnelles, vous pouvez nous contacter par email à : contact@tabla.ma",
    },
  ]

  return (
    <div className="min-h-screen  bg-softgreytheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-whitetheme dark:bg-bgdarktheme shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between">
          <Logo className="horizontal" nolink={true} />
          <button
            onClick={() => {
              document.documentElement.classList.toggle("dark")
              localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false")
            }}
            className="p-2 rounded-full hover:bg-softgreentheme dark:hover:bg-darkthemeitems transition-colors"
            aria-label="Toggle dark mode"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="dark:hidden"
            >
              <path
                d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM11 1V5H13V1H11ZM11 19V23H13V19H11ZM23 11H19V13H23V11ZM5 11H1V13H5V11ZM16.24 17.66L18.71 20.13L20.12 18.72L17.65 16.25L16.24 17.66ZM3.87 5.28L6.34 7.75L7.75 6.34L5.28 3.87L3.87 5.28ZM6.34 16.24L3.87 18.71L5.28 20.12L7.75 17.65L6.34 16.24ZM18.72 3.87L16.25 6.34L17.66 7.75L20.13 5.28L18.72 3.87Z"
                fill="#88AB61"
              />
            </svg>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden dark:block"
            >
              <path
                d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z"
                fill="#88AB61"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 overflow-y-scroll max-h-[90vh] sm:px-6 lg:px-8 py-12">

        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-blacktheme dark:text-textdarktheme mb-4">
              Les conditions générales d'utilisation
            </h1>
            <div className="h-1 w-20 bg-greentheme mx-auto rounded-full"></div>
          </div>

          {/* Introduction */}
          <div className="bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-sm p-6 mb-8">
            <p className="text-blacktheme dark:text-textdarktheme leading-relaxed">
              Bienvenue sur Tabla.ma, la plateforme de réservation de tables dans les restaurants, cafés, hôtels et
              centres de loisirs au Maroc.
            </p>
            <p className="text-blacktheme dark:text-textdarktheme leading-relaxed mt-4">
              L'accès et l'utilisation de nos services impliquent l'acceptation pleine et entière des présentes
              Conditions Générales d'Utilisation et de Confidentialité (CGU-CGP). Nous vous invitons à les lire
              attentivement.
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-sm overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <section key={index} className="pb-6 border-b border-softgreytheme dark:border-bgdarktheme last:border-0">
                    <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4 flex items-center">
                      <span className="inline-block w-6 h-6 bg-greentheme rounded-full mr-3 flex-shrink-0"></span>
                      {section.title}
                    </h2>

                    {section.content && (
                      <p className="text-blacktheme dark:text-textdarktheme leading-relaxed pl-9">{section.content}</p>
                    )}

                    {section.items && (
                      <ul className="list-disc pl-14 space-y-2 mt-3 text-blacktheme dark:text-textdarktheme">
                        {section.items.map((item, i) => (
                          <li key={i} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.subsections && (
                      <div className="space-y-4 mt-4 pl-9">
                        {section.subsections.map((sub, i) => (
                          <div key={i}>
                            <h3 className="text-lg font-medium text-blacktheme dark:text-textdarktheme mb-2">
                              {sub.subtitle}
                            </h3>
                            <ul className="list-disc pl-5 space-y-2 text-blacktheme dark:text-textdarktheme">
                              {sub.items.map((item, j) => (
                                <li key={j} className="leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>
          <DevOnly>
            <div className="bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-sm p-6 my-8">
              
              <p className="text-blacktheme dark:text-textdarktheme leading-relaxed">
                Les données à caractère personnel collectées peuvent être transférées à Scale Valley SARL et DigitalOcean LLC Etats-Unis à des fins Hébergement des données, ce transfert a fait l’objet d’une demande de transfert des données à l’étranger auprès de la CNDP sous le numéro <a className="text-greentheme hover:underline transition-all duration-200">---</a>
                <br />
                Vous pouvez vous adresser à <a href="mailto:contact@tabla.ma" className="text-greentheme hover:underline transition-all duration-200">contact@tabla.ma</a> pour exercer vos droits d’accès, de rectification et d’opposition conformément aux dispositions de la loi 09-08.
              </p>
            </div>
          </DevOnly>

          {/* Footer */}
          <div className="mt-8 text-center text-subblack dark:text-textdarktheme text-sm">
            <p>© {new Date().getFullYear()} Tabla. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

