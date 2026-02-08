import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string, error?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Fap Map</h1>
                    <p className="mt-2 text-sm text-gray-400">Connexion ou création de compte</p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Adresse Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-t-md border-0 bg-gray-900 py-3 px-3 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-white sm:text-sm sm:leading-6"
                                placeholder="Adresse Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-b-md border-0 bg-gray-900 py-3 px-3 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-white sm:text-sm sm:leading-6"
                                placeholder="Mot de passe"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            formAction={login}
                            className="group relative flex w-full justify-center rounded-md bg-white px-3 py-3 text-sm font-semibold text-black hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Connexion
                        </button>
                        <button
                            formAction={signup}
                            className="group relative flex w-full justify-center rounded-md border border-white px-3 py-3 text-sm font-semibold text-white hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Inscription
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
