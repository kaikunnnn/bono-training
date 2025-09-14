import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";


export default function Protected({ user }) {
  console.log({ user })
  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <h2>Hello from protected route</h2>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { req } = context;
  const supabase = createServerSupabaseClient({req})
  const {data: { session }} = await supabase.auth.getSession();

  if (!session) {
    return { props: {}, redirect: { destination: '/login' } }
  }

  return { props: { user: session.user } }
}