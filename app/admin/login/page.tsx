import Link from "next/link";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { loginAction } from "./actions";

const errors: Record<string, string> = {
  acesso: "Este usuário não possui acesso ativo à administração da Helena.",
  config: "A autenticação ainda não foi configurada neste ambiente.",
  credenciais: "E-mail ou senha inválidos.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorKey = Array.isArray(params.erro) ? params.erro[0] : params.erro;
  const returnTo = Array.isArray(params.retorno) ? params.retorno[0] : params.retorno;
  const configured = hasSupabaseEnv();

  return (
    <main className="admin-login">
      <section>
        <Link href="/" className="admin-login-brand">Helena <span>Joias</span></Link>
        <p>Área reservada</p>
        <h1>Administração</h1>
        <span>Entre com o usuário autorizado para a loja Helena.</span>
        {errorKey && errors[errorKey] ? <div role="alert">{errors[errorKey]}</div> : null}
        <form action={loginAction}>
          <input type="hidden" name="returnTo" value={returnTo ?? "/admin"} />
          <label>E-mail<input type="email" name="email" autoComplete="username" required /></label>
          <label>Senha<input type="password" name="password" autoComplete="current-password" minLength={8} required /></label>
          <button type="submit" disabled={!configured}>
            {configured ? "Entrar com segurança" : "Configuração pendente"}
          </button>
        </form>
        <Link href="/">← Voltar ao site</Link>
      </section>
    </main>
  );
}

