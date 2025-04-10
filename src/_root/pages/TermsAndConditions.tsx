"use client"

import Logo from "../../components/header/Logo"

export default function TermsAndConditions() {
  return (
    <div className="h-[100vh] bg-white dark:bg-bgdarktheme2 text-black dark:text-white">
      <div className="h-[10vh] w-full flex items-center justify-between px-4 sm:px-10 shadow-xl shadow-[#00000004] bg-white dark:bg-bgdarktheme">
        <Logo className="horizontal" />
        <button
          onClick={() => {
            document.documentElement.classList.toggle("dark")
            localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false")
          }}
          className="btn-secondary hover:bg-[#88AB6110] my-[1em] p-1 w-[40px] h-[40px] flex justify-center items-center rounded-[100%]"
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
            className="hidden dark:block "
          >
            <path
              d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z"
              fill="#88AB61"
            />
          </svg>
        </button>
      </div>
      <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl dark:text-white">
              Terms and Conditions
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Last updated: April 8, 2025</p>
          </div>

          <div className="h-[60vh] overflow-y-auto rounded-md border p-6 dark:border-gray-700 dark:bg-gray-800/30">
            <div className="space-y-8">
              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">1. Introduction</h2>
                <p className="dark:text-gray-300">
                  Welcome to our website. By accessing and using this website, you accept and agree to be bound by the
                  terms and provisions of this agreement. If you do not agree to abide by the above, please do not use
                  this service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">2. Intellectual Property Rights</h2>
                <p className="dark:text-gray-300">
                  Unless otherwise stated, we own the intellectual property rights for all material on this website. All
                  intellectual property rights are reserved. You may view and/or print pages from the website for your
                  own personal use subject to restrictions set in these terms and conditions.
                </p>
                <p className="dark:text-gray-300">You must not:</p>
                <ul className="list-disc pl-6 space-y-1 dark:text-gray-300">
                  <li>Republish material from this website</li>
                  <li>Sell, rent, or sub-license material from this website</li>
                  <li>Reproduce, duplicate, or copy material from this website</li>
                  <li>Redistribute content from this website</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">3. User Content</h2>
                <p className="dark:text-gray-300">
                  In these terms and conditions, "User Content" means material (including without limitation text,
                  images, audio material, video material, and audio-visual material) that you submit to this website,
                  for whatever purpose.
                </p>
                <p className="dark:text-gray-300">
                  You grant to us a worldwide, irrevocable, non-exclusive, royalty-free license to use, reproduce,
                  adapt, publish, translate, and distribute your User Content in any existing or future media. You also
                  grant to us the right to sub-license these rights, and the right to bring an action for infringement
                  of these rights.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">4. Limitations of Liability</h2>
                <p className="dark:text-gray-300">
                  We will not be liable to you in relation to the contents of, or use of, or otherwise in connection
                  with, this website:
                </p>
                <ul className="list-disc pl-6 space-y-1 dark:text-gray-300">
                  <li>For any indirect, special, or consequential loss; or</li>
                  <li>
                    For any business losses, loss of revenue, income, profits, or anticipated savings, loss of contracts
                    or business relationships, loss of reputation or goodwill, or loss or corruption of information or
                    data.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">5. Indemnity</h2>
                <p className="dark:text-gray-300">
                  You hereby indemnify us and undertake to keep us indemnified against any losses, damages, costs,
                  liabilities, and expenses (including without limitation legal expenses and any amounts paid by us to a
                  third party in settlement of a claim or dispute on the advice of our legal advisers) incurred or
                  suffered by us arising out of any breach by you of any provision of these terms and conditions.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">6. Breaches of These Terms and Conditions</h2>
                <p className="dark:text-gray-300">
                  Without prejudice to our other rights under these terms and conditions, if you breach these terms and
                  conditions in any way, we may take such action as we deem appropriate to deal with the breach,
                  including suspending your access to the website, prohibiting you from accessing the website, blocking
                  computers using your IP address from accessing the website, contacting your internet service provider
                  to request that they block your access to the website, and/or bringing court proceedings against you.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">7. Variation</h2>
                <p className="dark:text-gray-300">
                  We may revise these terms and conditions from time to time. Revised terms and conditions will apply to
                  the use of this website from the date of the publication of the revised terms and conditions on this
                  website. Please check this page regularly to ensure you are familiar with the current version.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">8. Assignment</h2>
                <p className="dark:text-gray-300">
                  We may transfer, sub-contract, or otherwise deal with our rights and/or obligations under these terms
                  and conditions without notifying you or obtaining your consent.
                </p>
                <p className="dark:text-gray-300">
                  You may not transfer, sub-contract, or otherwise deal with your rights and/or obligations under these
                  terms and conditions.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">9. Severability</h2>
                <p className="dark:text-gray-300">
                  If a provision of these terms and conditions is determined by any court or other competent authority
                  to be unlawful and/or unenforceable, the other provisions will continue in effect. If any unlawful
                  and/or unenforceable provision would be lawful or enforceable if part of it were deleted, that part
                  will be deemed to be deleted, and the rest of the provision will continue in effect.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">10. Entire Agreement</h2>
                <p className="dark:text-gray-300">
                  These terms and conditions constitute the entire agreement between you and us in relation to your use
                  of this website and supersede all previous agreements in respect of your use of this website.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-white">11. Governing Law and Jurisdiction</h2>
                <p className="dark:text-gray-300">
                  These terms and conditions will be governed by and construed in accordance with the laws of [YOUR
                  JURISDICTION], and any disputes relating to these terms and conditions will be subject to the
                  exclusive jurisdiction of the courts of [YOUR JURISDICTION].
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
