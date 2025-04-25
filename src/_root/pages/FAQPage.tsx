import { useEffect, useState } from "react"

export default function FAQPage() {

    useEffect(() => {
        document.title = "FAQ Page"
    }, [])

    const [faqs, setFaqs] = useState([
        {
            question: "Combien de temps faut-il pour mettre en place Tabla.ma ?",
            answer: "La mise en place est rapide et notre équipe vous accompagne à chaque étape. En général, vous serez opérationnel en moins de 48h."
        },
        {
            question: "Est-ce que je peux gérer plusieurs établissements ?",
            answer: "Oui, Tabla.ma permet de gérer plusieurs restaurants depuis une seule interface."
        },
        {
            question: "Comment réduisez-vous les no-shows ?",
            answer: "Notre système combine confirmation automatique, rappels SMS/email et politique stricte de bannissement après 3 absences."
        },
        {
            question: "Est-ce compatible avec mon système de caisse ?",
            answer: "Oui, Tabla.ma s’intègre avec les principaux systèmes de caisse."
        },
        {
            question: "Puis-je partager mon profil Tabla.ma sur mes réseaux sociaux ?",
            answer: "Oui, absolument ! Votre profil Tabla.ma dispose d’un lien unique que vous pouvez partager sur vos réseaux sociaux (Instagram, Facebook, WhatsApp…) et site web."
        }
    ]);
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-4">
            {faqs.map((item)=>(
                <details className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <summary className="text-lg font-medium p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-darkthemeitems dark:text-gray-200">
                        {item.question}
                    </summary>
                    <div className="p-4 pt-2 text-gray-600 border-t dark:text-gray-400 dark:border-gray-700">
                        {item.answer}
                    </div>
                </details>
            ))}
        </div>
      </div>
    )
  }
  
  